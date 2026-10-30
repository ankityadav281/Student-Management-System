"""
MongoDB database connection and Data Access Layer for Student Management System.
Handles Students, Marks, Attendance, and User authentication.
Includes automatic fallback to persistent local storage if MongoDB is offline.
"""

import os
import json
import uuid
from datetime import datetime, timezone, date
from pathlib import Path
from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password

# Mongo Client Singleton
_mongo_client = None

# Fallback JSON file path
FALLBACK_FILE = Path(settings.BASE_DIR) / 'student_store_data.json'

def get_mongo_client():
    """Return a singleton MongoClient instance or None if not connectable."""
    global _mongo_client
    if _mongo_client is None:
        try:
            mongo_uri = getattr(settings, 'MONGO_URI', 'mongodb://localhost:27017/')
            _mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        except Exception:
            _mongo_client = None
    return _mongo_client

def get_db():
    """Return the Student Management MongoDB database or None."""
    client = get_mongo_client()
    if client is None:
        return None
    db_name = getattr(settings, 'MONGO_DB_NAME', 'student_management_db')
    return client[db_name]

def check_mongo_connection() -> bool:
    """Check if MongoDB server is healthy and responding."""
    try:
        client = get_mongo_client()
        if client is None:
            return False
        client.admin.command('ping')
        return True
    except Exception:
        return False

# ==========================================
# Fallback JSON Storage Engine
# ==========================================

def _load_fallback_data() -> dict:
    """Load records from local JSON store if MongoDB is unavailable."""
    if not FALLBACK_FILE.exists():
        initial = {
            "users": [],
            "students": [],
            "marks": [],
            "attendance": []
        }
        _save_fallback_data(initial)
        return initial
    try:
        with open(FALLBACK_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {"users": [], "students": [], "marks": [], "attendance": []}

def _save_fallback_data(data: dict):
    """Save records to local JSON store."""
    try:
        with open(FALLBACK_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving fallback store: {e}")

# ==========================================
# Grade Calculation Helpers
# ==========================================

def calculate_grade(percentage: float) -> str:
    """Calculate letter grade from percentage."""
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 50:
        return "D"
    else:
        return "F"

# ==========================================
# User / Faculty Authentication
# ==========================================

def get_users_collection():
    if check_mongo_connection():
        db = get_db()
        users = db['users']
        try:
            users.create_index("email", unique=True)
        except Exception:
            pass
        return users
    return None

def create_user(full_name: str, email: str, password: str, role: str = "Teacher"):
    """Register Academic Coordinator or Teacher user."""
    full_name = (full_name or '').strip()
    email = (email or '').strip().lower()
    role = (role or 'Teacher').strip()
    if role not in ["Academic Coordinator", "Teacher"]:
        role = "Teacher"

    if not full_name:
        raise ValueError("Full name is required.")
    if not email or '@' not in email:
        raise ValueError("A valid email address is required.")
    if not password or len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

    hashed_pw = make_password(password)
    now_iso = datetime.now(timezone.utc).isoformat()

    if check_mongo_connection():
        users = get_users_collection()
        if users.find_one({"email": email}):
            raise ValueError("An account with this email already exists.")
        
        user_doc = {
            "full_name": full_name,
            "email": email,
            "password": hashed_pw,
            "role": role,
            "created_at": datetime.now(timezone.utc),
            "last_login": None,
            "is_active": True
        }
        res = users.insert_one(user_doc)
        user_doc["_id"] = str(res.inserted_id)
        return user_doc
    else:
        data = _load_fallback_data()
        for u in data["users"]:
            if u.get("email") == email:
                raise ValueError("An account with this email already exists.")
        uid = str(uuid.uuid4())
        user_doc = {
            "_id": uid,
            "id": uid,
            "full_name": full_name,
            "email": email,
            "password": hashed_pw,
            "role": role,
            "created_at": now_iso,
            "last_login": None,
            "is_active": True
        }
        data["users"].append(user_doc)
        _save_fallback_data(data)
        return user_doc

def authenticate_user(email: str, password: str):
    """Authenticate user credentials."""
    email = (email or '').strip().lower()
    if not email or not password:
        return None

    if check_mongo_connection():
        users = get_users_collection()
        user = users.find_one({"email": email, "is_active": True})
        if user and check_password(password, user.get("password", "")):
            now = datetime.now(timezone.utc)
            users.update_one({"_id": user["_id"]}, {"$set": {"last_login": now}})
            user_role = user.get("role", "Teacher")
            if user_role not in ["Academic Coordinator", "Teacher"]:
                user_role = "Teacher"
            return {
                "id": str(user["_id"]),
                "full_name": user.get("full_name", ""),
                "email": user.get("email", ""),
                "role": user_role,
                "last_login": now
            }
    else:
        data = _load_fallback_data()
        for user in data["users"]:
            if user.get("email") == email and user.get("is_active", True):
                if check_password(password, user.get("password", "")):
                    now = datetime.now(timezone.utc).isoformat()
                    user["last_login"] = now
                    _save_fallback_data(data)
                    user_role = user.get("role", "Teacher")
                    if user_role not in ["Academic Coordinator", "Teacher"]:
                        user_role = "Teacher"
                    return {
                        "id": str(user.get("_id") or user.get("id")),
                        "full_name": user.get("full_name", ""),
                        "email": user.get("email", ""),
                        "role": user_role,
                        "last_login": now
                    }
    return None

# ==========================================
# Student Management CRUD Operations
# ==========================================

def get_all_students(query: str = None, department: str = None, status: str = None):
    """
    Retrieve students with optional search query (by student_id or name)
    and optional department/status filter. Computes live marks & attendance summary.
    """
    query = (query or '').strip()
    department = (department or '').strip()
    status = (status or '').strip()

    students_list = []

    if check_mongo_connection():
        db = get_db()
        filter_dict = {}
        if query:
            filter_dict["$or"] = [
                {"name": {"$regex": query, "$options": "i"}},
                {"student_id": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}}
            ]
        if department and department != "All":
            filter_dict["department"] = department
        if status and status != "All":
            filter_dict["status"] = status

        cursor = db['students'].find(filter_dict).sort("created_at", -1)
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            students_list.append(doc)
    else:
        data = _load_fallback_data()
        for doc in data.get("students", []):
            match_q = True
            if query:
                q_low = query.lower()
                name_low = doc.get("name", "").lower()
                stu_id_low = doc.get("student_id", "").lower()
                email_low = doc.get("email", "").lower()
                match_q = (q_low in name_low) or (q_low in stu_id_low) or (q_low in email_low)
            
            match_dept = True
            if department and department != "All":
                match_dept = doc.get("department") == department

            match_status = True
            if status and status != "All":
                match_status = doc.get("status") == status

            if match_q and match_dept and match_status:
                s_copy = dict(doc)
                s_copy["id"] = str(s_copy.get("_id") or s_copy.get("id"))
                students_list.append(s_copy)

    # Enrich each student with aggregated attendance % and average marks
    for s in students_list:
        stu_id = s.get("student_id")
        stats = get_student_stats(stu_id)
        s["attendance_pct"] = stats["attendance_pct"]
        s["total_attendance_records"] = stats["total_attendance_records"]
        s["present_count"] = stats["present_count"]
        s["average_marks"] = stats["average_marks"]
        s["marks_count"] = stats["marks_count"]
        s["overall_grade"] = stats["overall_grade"]

    return students_list

def get_student_by_id(student_id_or_id: str):
    """Retrieve single student by internal ID or Student ID string."""
    if not student_id_or_id:
        return None

    if check_mongo_connection():
        db = get_db()
        doc = None
        # Try finding by student_id first
        doc = db['students'].find_one({"student_id": student_id_or_id})
        if not doc:
            try:
                doc = db['students'].find_one({"_id": ObjectId(student_id_or_id)})
            except Exception:
                pass
        if doc:
            doc["id"] = str(doc["_id"])
            return doc
    else:
        data = _load_fallback_data()
        for doc in data.get("students", []):
            if doc.get("student_id") == student_id_or_id or str(doc.get("_id") or doc.get("id")) == str(student_id_or_id):
                s_copy = dict(doc)
                s_copy["id"] = str(s_copy.get("_id") or s_copy.get("id"))
                return s_copy
    return None

def create_student(
    student_id: str,
    name: str,
    email: str,
    phone: str = "",
    department: str = "Computer Science",
    year: str = "1st Year",
    gender: str = "Male",
    dob: str = "",
    status: str = "Active",
    address: str = ""
):
    """Add a new student record."""
    student_id = (student_id or '').strip().upper()
    name = (name or '').strip()
    email = (email or '').strip().lower()

    if not student_id:
        raise ValueError("Student ID / Roll Number is required.")
    if not name:
        raise ValueError("Student Name is required.")
    if not email:
        raise ValueError("Student Email is required.")

    # Check for existing student with same student_id
    existing = get_student_by_id(student_id)
    if existing:
        raise ValueError(f"A student with ID '{student_id}' already exists.")

    student_doc = {
        "student_id": student_id,
        "name": name,
        "email": email,
        "phone": phone.strip(),
        "department": department or "Computer Science",
        "year": year or "1st Year",
        "gender": gender or "Male",
        "dob": dob or "",
        "status": status or "Active",
        "address": address.strip(),
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    if check_mongo_connection():
        db = get_db()
        res = db['students'].insert_one(student_doc)
        student_doc["_id"] = str(res.inserted_id)
        student_doc["id"] = str(res.inserted_id)
        return student_doc
    else:
        data = _load_fallback_data()
        uid = str(uuid.uuid4())
        student_doc["_id"] = uid
        student_doc["id"] = uid
        data.setdefault("students", []).append(student_doc)
        _save_fallback_data(data)
        return student_doc

def update_student(student_id: str, update_fields: dict):
    """Update an existing student's details."""
    student_id = (student_id or '').strip()
    update_fields["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    # Disallow mutating internal IDs
    update_fields.pop('_id', None)
    update_fields.pop('id', None)

    if check_mongo_connection():
        db = get_db()
        res = db['students'].update_one(
            {"student_id": student_id},
            {"$set": update_fields}
        )
        if res.matched_count == 0:
            try:
                db['students'].update_one(
                    {"_id": ObjectId(student_id)},
                    {"$set": update_fields}
                )
            except Exception:
                pass
        return get_student_by_id(student_id)
    else:
        data = _load_fallback_data()
        updated = None
        for doc in data.get("students", []):
            if doc.get("student_id") == student_id or str(doc.get("_id") or doc.get("id")) == str(student_id):
                doc.update(update_fields)
                updated = dict(doc)
                break
        _save_fallback_data(data)
        return updated

def delete_student(student_id: str) -> bool:
    """Delete a student and cascade delete associated marks and attendance records."""
    student_id = (student_id or '').strip()
    student = get_student_by_id(student_id)
    if not student:
        return False
    
    canonical_stu_id = student.get("student_id")

    if check_mongo_connection():
        db = get_db()
        db['students'].delete_one({"student_id": canonical_stu_id})
        db['marks'].delete_many({"student_id": canonical_stu_id})
        db['attendance'].delete_many({"student_id": canonical_stu_id})
        return True
    else:
        data = _load_fallback_data()
        data["students"] = [s for s in data.get("students", []) if s.get("student_id") != canonical_stu_id]
        data["marks"] = [m for m in data.get("marks", []) if m.get("student_id") != canonical_stu_id]
        data["attendance"] = [a for a in data.get("attendance", []) if a.get("student_id") != canonical_stu_id]
        _save_fallback_data(data)
        return True

# ==========================================
# Marks Management
# ==========================================

def add_student_mark(
    student_id: str,
    subject: str,
    exam_type: str,
    score: float,
    max_score: float = 100.0,
    remarks: str = "",
    exam_date: str = ""
):
    """Store marks for a student."""
    student = get_student_by_id(student_id)
    if not student:
        raise ValueError(f"Student with ID '{student_id}' does not exist.")

    canonical_stu_id = student.get("student_id")
    subject = (subject or '').strip()
    exam_type = (exam_type or 'Final Exam').strip()

    try:
        score = float(score)
        max_score = float(max_score) if max_score else 100.0
    except (ValueError, TypeError):
        raise ValueError("Score and Max Score must be valid numbers.")

    if max_score <= 0:
        raise ValueError("Max score must be greater than zero.")
    if score < 0 or score > max_score:
        raise ValueError(f"Score must be between 0 and {max_score}.")

    percentage = round((score / max_score) * 100.0, 1)
    grade = calculate_grade(percentage)

    if not exam_date:
        exam_date = date.today().isoformat()

    mark_doc = {
        "student_id": canonical_stu_id,
        "subject": subject,
        "exam_type": exam_type,
        "score": score,
        "max_score": max_score,
        "percentage": percentage,
        "grade": grade,
        "remarks": remarks.strip(),
        "exam_date": exam_date,
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    if check_mongo_connection():
        db = get_db()
        res = db['marks'].insert_one(mark_doc)
        mark_doc["_id"] = str(res.inserted_id)
        mark_doc["id"] = str(res.inserted_id)
        return mark_doc
    else:
        data = _load_fallback_data()
        uid = str(uuid.uuid4())
        mark_doc["_id"] = uid
        mark_doc["id"] = uid
        data.setdefault("marks", []).append(mark_doc)
        _save_fallback_data(data)
        return mark_doc

def get_student_marks(student_id: str):
    """Retrieve all marks records for a student."""
    student = get_student_by_id(student_id)
    if not student:
        return []
    canonical_stu_id = student.get("student_id")

    marks_list = []
    if check_mongo_connection():
        db = get_db()
        cursor = db['marks'].find({"student_id": canonical_stu_id}).sort("exam_date", -1)
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            marks_list.append(doc)
    else:
        data = _load_fallback_data()
        for doc in data.get("marks", []):
            if doc.get("student_id") == canonical_stu_id:
                m_copy = dict(doc)
                m_copy["id"] = str(m_copy.get("_id") or m_copy.get("id"))
                marks_list.append(m_copy)

    return marks_list

def delete_student_mark(mark_id: str) -> bool:
    """Delete a specific mark record."""
    if not mark_id:
        return False
    if check_mongo_connection():
        db = get_db()
        try:
            res = db['marks'].delete_one({"_id": ObjectId(mark_id)})
            return res.deleted_count > 0
        except Exception:
            res = db['marks'].delete_one({"_id": mark_id})
            return res.deleted_count > 0
    else:
        data = _load_fallback_data()
        initial_len = len(data.get("marks", []))
        data["marks"] = [m for m in data.get("marks", []) if str(m.get("_id") or m.get("id")) != str(mark_id)]
        _save_fallback_data(data)
        return len(data["marks"]) < initial_len

# ==========================================
# Attendance Management
# ==========================================

def record_attendance(
    student_id: str,
    attendance_date: str,
    status: str = "Present",
    session_title: str = "Regular Session",
    notes: str = ""
):
    """Record single attendance entry for a student."""
    student = get_student_by_id(student_id)
    if not student:
        raise ValueError(f"Student with ID '{student_id}' does not exist.")

    canonical_stu_id = student.get("student_id")
    status = (status or "Present").strip().capitalize()
    if status not in ["Present", "Absent", "Late", "Excused"]:
        status = "Present"

    if not attendance_date:
        attendance_date = date.today().isoformat()

    attendance_doc = {
        "student_id": canonical_stu_id,
        "date": attendance_date,
        "status": status,
        "session": session_title.strip() or "Regular Session",
        "notes": notes.strip(),
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    if check_mongo_connection():
        db = get_db()
        # Update if already exists for same student, date, and session; else insert
        res = db['attendance'].update_one(
            {"student_id": canonical_stu_id, "date": attendance_date, "session": attendance_doc["session"]},
            {"$set": attendance_doc},
            upsert=True
        )
        return attendance_doc
    else:
        data = _load_fallback_data()
        matched = False
        for a in data.get("attendance", []):
            if (a.get("student_id") == canonical_stu_id and 
                a.get("date") == attendance_date and 
                a.get("session") == attendance_doc["session"]):
                a.update(attendance_doc)
                matched = True
                break
        if not matched:
            uid = str(uuid.uuid4())
            attendance_doc["_id"] = uid
            attendance_doc["id"] = uid
            data.setdefault("attendance", []).append(attendance_doc)
        _save_fallback_data(data)
        return attendance_doc

def get_student_attendance(student_id: str):
    """Retrieve all attendance entries for a student, newest first."""
    student = get_student_by_id(student_id)
    if not student:
        return []
    canonical_stu_id = student.get("student_id")

    records = []
    if check_mongo_connection():
        db = get_db()
        cursor = db['attendance'].find({"student_id": canonical_stu_id}).sort("date", -1)
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            records.append(doc)
    else:
        data = _load_fallback_data()
        for doc in data.get("attendance", []):
            if doc.get("student_id") == canonical_stu_id:
                a_copy = dict(doc)
                a_copy["id"] = str(a_copy.get("_id") or a_copy.get("id"))
                records.append(a_copy)
        records.sort(key=lambda x: x.get("date", ""), reverse=True)

    return records

# ==========================================
# Student Aggregation & Stats
# ==========================================

def get_student_stats(student_id: str) -> dict:
    """Compute live attendance rate and average score for a student."""
    marks = get_student_marks(student_id)
    attendance = get_student_attendance(student_id)

    # Attendance stats
    total_att = len(attendance)
    present_count = sum(1 for a in attendance if a.get("status") in ["Present", "Late"])
    attendance_pct = round((present_count / total_att) * 100.0, 1) if total_att > 0 else 0.0

    # Marks stats
    total_marks_count = len(marks)
    if total_marks_count > 0:
        avg_pct = round(sum(m.get("percentage", 0) for m in marks) / total_marks_count, 1)
        grade = calculate_grade(avg_pct)
    else:
        avg_pct = 0.0
        grade = "N/A"

    return {
        "attendance_pct": attendance_pct,
        "total_attendance_records": total_att,
        "present_count": present_count,
        "absent_count": total_att - present_count,
        "average_marks": avg_pct,
        "marks_count": total_marks_count,
        "overall_grade": grade
    }

def get_dashboard_summary() -> dict:
    """Return system-wide statistics for the dashboard KPI cards."""
    all_students = get_all_students()
    total_students = len(all_students)

    if total_students == 0:
        return {
            "total_students": 0,
            "average_attendance": 0.0,
            "class_average_marks": 0.0,
            "at_risk_count": 0,
            "active_students": 0,
            "top_department": "N/A"
        }

    total_att_pct = sum(s.get("attendance_pct", 0) for s in all_students)
    avg_attendance = round(total_att_pct / total_students, 1)

    # Average marks across students who have recorded marks
    students_with_marks = [s for s in all_students if s.get("marks_count", 0) > 0]
    if students_with_marks:
        avg_marks = round(sum(s.get("average_marks", 0) for s in students_with_marks) / len(students_with_marks), 1)
    else:
        avg_marks = 0.0

    # At risk: attendance < 75% or marks < 50%
    at_risk_count = sum(1 for s in all_students if (s.get("total_attendance_records", 0) > 0 and s.get("attendance_pct", 100) < 75.0))
    active_students = sum(1 for s in all_students if s.get("status") == "Active")

    # Department breakdown
    dept_counts = {}
    for s in all_students:
        d = s.get("department", "General")
        dept_counts[d] = dept_counts.get(d, 0) + 1
    top_department = max(dept_counts, key=dept_counts.get) if dept_counts else "Computer Science"

    return {
        "total_students": total_students,
        "average_attendance": avg_attendance,
        "class_average_marks": avg_marks,
        "at_risk_count": at_risk_count,
        "active_students": active_students,
        "top_department": top_department
    }

# ==========================================
# Sample Demo Data Seeder
# ==========================================

SAMPLE_STUDENTS = [
    {
        "student_id": "SMS-2024-001",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@campus.edu",
        "phone": "+91 98765 12001",
        "department": "Computer Science",
        "year": "3rd Year",
        "gender": "Male",
        "dob": "2003-04-14",
        "status": "Active",
        "address": "402 Tech Park Residency, Bangalore",
        "marks": [
            ("Data Structures & Algorithms", "Midterm Exam", 92, 100, "Outstanding logic implementation"),
            ("Database Management Systems", "Midterm Exam", 88, 100, "Solid query optimization skills"),
            ("Operating Systems", "Practical Lab", 95, 100, "Excellent process synchronization lab"),
            ("Computer Networks", "Assignment", 85, 100, "Thorough packet capture analysis")
        ],
        "attendance": [
            ("2024-10-21", "Present"),
            ("2024-10-22", "Present"),
            ("2024-10-23", "Present"),
            ("2024-10-24", "Present"),
            ("2024-10-25", "Present"),
            ("2024-10-26", "Present")
        ]
    },
    {
        "student_id": "SMS-2024-002",
        "name": "Diya Patel",
        "email": "diya.patel@campus.edu",
        "phone": "+91 98765 12002",
        "department": "Information Technology",
        "year": "2nd Year",
        "gender": "Female",
        "dob": "2004-08-22",
        "status": "Active",
        "address": "12 Lotus Boulevard, Ahmedabad",
        "marks": [
            ("Web Technologies & Fullstack", "Final Exam", 94, 100, "Exceptional frontend & backend integration"),
            ("Object-Oriented Programming (Java)", "Midterm Exam", 89, 100, "Clean architecture & design patterns"),
            ("Discrete Mathematics", "Internal Test", 82, 100, "Strong proof formulation")
        ],
        "attendance": [
            ("2024-10-21", "Present"),
            ("2024-10-22", "Present"),
            ("2024-10-23", "Absent"),
            ("2024-10-24", "Present"),
            ("2024-10-25", "Present"),
            ("2024-10-26", "Present")
        ]
    },
    {
        "student_id": "SMS-2024-003",
        "name": "Rohan Deshmukh",
        "email": "rohan.deshmukh@campus.edu",
        "phone": "+91 98765 12003",
        "department": "Mechanical Engineering",
        "year": "4th Year",
        "gender": "Male",
        "dob": "2002-11-05",
        "status": "Active",
        "address": "78 Shivaji Nagar, Pune",
        "marks": [
            ("Thermodynamics", "Final Exam", 78, 100, "Good conceptual understanding"),
            ("Fluid Mechanics", "Midterm Exam", 74, 100, "Consistent performance"),
            ("Computer Aided Design (CAD)", "Project", 88, 100, "Innovative 3D assembly design")
        ],
        "attendance": [
            ("2024-10-21", "Present"),
            ("2024-10-22", "Absent"),
            ("2024-10-23", "Absent"),
            ("2024-10-24", "Present"),
            ("2024-10-25", "Absent"),
            ("2024-10-26", "Present")
        ]
    },
    {
        "student_id": "SMS-2024-004",
        "name": "Ananya Mukherjee",
        "email": "ananya.m@campus.edu",
        "phone": "+91 98765 12004",
        "department": "Electronics & Communication",
        "year": "3rd Year",
        "gender": "Female",
        "dob": "2003-01-30",
        "status": "Active",
        "address": "55 Salt Lake Sector V, Kolkata",
        "marks": [
            ("Digital Signal Processing", "Midterm Exam", 91, 100, "Top scorer in filter design"),
            ("Microcontrollers & Embedded Systems", "Lab Exam", 96, 100, "Flawless ARM assembly programming"),
            ("VLSI Design", "Assignment", 87, 100, "Very clean layout analysis")
        ],
        "attendance": [
            ("2024-10-21", "Present"),
            ("2024-10-22", "Present"),
            ("2024-10-23", "Present"),
            ("2024-10-24", "Present"),
            ("2024-10-25", "Present"),
            ("2024-10-26", "Present")
        ]
    },
    {
        "student_id": "SMS-2024-005",
        "name": "Kabir Verma",
        "email": "kabir.verma@campus.edu",
        "phone": "+91 98765 12005",
        "department": "Civil Engineering",
        "year": "1st Year",
        "gender": "Male",
        "dob": "2005-06-18",
        "status": "Active",
        "address": "19 Civil Lines, Jaipur",
        "marks": [
            ("Engineering Mechanics", "Internal Test", 72, 100, "Needs more practice on truss vectors"),
            ("Building Materials & Construction", "Midterm Exam", 79, 100, "Good field report evaluation"),
            ("Environmental Studies", "Assignment", 85, 100, "Very detailed sustainability case study")
        ],
        "attendance": [
            ("2024-10-21", "Present"),
            ("2024-10-22", "Late"),
            ("2024-10-23", "Present"),
            ("2024-10-24", "Present"),
            ("2024-10-25", "Present"),
            ("2024-10-26", "Present")
        ]
    }
]

def seed_sample_students_if_empty():
    """Populates initial sample students if student records are currently empty."""
    current = get_all_students()
    if len(current) > 0:
        return False  # Already populated

    for item in SAMPLE_STUDENTS:
        try:
            create_student(
                student_id=item["student_id"],
                name=item["name"],
                email=item["email"],
                phone=item["phone"],
                department=item["department"],
                year=item["year"],
                gender=item["gender"],
                dob=item["dob"],
                status=item["status"],
                address=item["address"]
            )
            # Add marks
            for subj, etype, score, max_s, rem in item.get("marks", []):
                add_student_mark(
                    student_id=item["student_id"],
                    subject=subj,
                    exam_type=etype,
                    score=score,
                    max_score=max_s,
                    remarks=rem
                )
            # Add attendance
            for dt, st in item.get("attendance", []):
                record_attendance(
                    student_id=item["student_id"],
                    attendance_date=dt,
                    status=st,
                    session_title="Morning Session",
                    notes="Daily Attendance Roll"
                )
        except Exception as e:
            print(f"Error seeding student {item['student_id']}: {e}")

    seed_default_faculty_user()
    return True

def seed_default_faculty_user():
    """Ensure a default faculty administrator account exists for initial login."""
    try:
        admin_email = "admin@campus.edu"
        if check_mongo_connection():
            users = get_users_collection()
            if not users.find_one({"email": admin_email}):
                create_user(
                    full_name="Prof. Alex Mercer",
                    email=admin_email,
                    password="Password@123",
                    role="Academic Coordinator"
                )
        else:
            data = _load_fallback_data()
            if not any(u.get("email") == admin_email for u in data.get("users", [])):
                create_user(
                    full_name="Prof. Alex Mercer",
                    email=admin_email,
                    password="Password@123",
                    role="Academic Coordinator"
                )
    except Exception as e:
        print(f"Error seeding default faculty: {e}")

def clear_all_student_data():
    """Wipes all student records, marks, and attendance for a clean slate."""
    if check_mongo_connection():
        db = get_db()
        db['students'].delete_many({})
        db['marks'].delete_many({})
        db['attendance'].delete_many({})
    else:
        data = _load_fallback_data()
        data["students"] = []
        data["marks"] = []
        data["attendance"] = []
        _save_fallback_data(data)
    return True
