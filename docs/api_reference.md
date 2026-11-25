# Student Management System — REST API Reference

The backend exposes a clean RESTful API routed under `/api/`. All endpoints requiring authentication expect the HTTP header:
`Authorization: Token <your_auth_token>`

---

## 1. Authentication (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login/` | Authenticate user with `{email, password}`. Returns auth token and user profile. | None |
| `POST` | `/api/auth/register/` | Register new user account `{email, username, password, role, full_name, phone}`. | None |
| `POST` | `/api/auth/logout/` | Invalidates active session token. | Authenticated |
| `GET` | `/api/auth/me/` | Retrieves authenticated user profile and role details. | Authenticated |
| `GET` | `/api/auth/users/` | List system users (supports `?role=teacher` filter). | Admin |

---

## 2. Students (`/api/students/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/students/` | List all students. Supports `?search=`, `?department=`, `?year=`, `?status=`. | Admin / Teacher |
| `POST` | `/api/students/` | Register a new student. | Admin |
| `GET` | `/api/students/{id}/` | Retrieve full student profile with live metrics. | Admin / Teacher |
| `PUT/PATCH` | `/api/students/{id}/` | Update student profile information. | Admin |
| `DELETE` | `/api/students/{id}/` | Delete student record. | Admin |
| `GET` | `/api/students/stats/` | System-wide statistics (total, avg attendance, avg marks, at-risk count). | None / Public |
| `GET` | `/api/students/export-csv/` | Exports full student records to a downloadable CSV file. | Admin |
| `POST` | `/api/students/seed-demo/` | Resets and populates rich demo data. | Admin |

---

## 3. Departments (`/api/departments/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/departments/` | List academic departments. Supports `?search=`. | None / Authenticated |
| `POST` | `/api/departments/` | Create a new department `{name, code, description, head_of_department}`. | Admin |
| `GET` | `/api/departments/{id}/` | Retrieve department details. | Authenticated |
| `PUT/PATCH` | `/api/departments/{id}/` | Update department details. | Admin |
| `DELETE` | `/api/departments/{id}/` | Delete department. | Admin |

---

## 4. Teachers (`/api/teachers/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/teachers/` | List faculty members. Supports `?search=`, `?department=`. | Authenticated |
| `POST` | `/api/teachers/` | Add a teacher `{name, email, phone, designation, department}`. | Admin |
| `GET` | `/api/teachers/{id}/` | Retrieve teacher details and assigned courses. | Authenticated |
| `PUT/PATCH` | `/api/teachers/{id}/` | Update teacher details. | Admin |
| `DELETE` | `/api/teachers/{id}/` | Remove teacher profile. | Admin |

---

## 5. Courses (`/api/courses/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/courses/` | List courses. Supports `?search=`, `?department=`, `?teacher=`. | Authenticated |
| `POST` | `/api/courses/` | Create a course `{code, title, department, credits, teacher}`. | Admin |
| `GET` | `/api/courses/{id}/` | Retrieve course details and enrollments. | Authenticated |
| `PUT/PATCH` | `/api/courses/{id}/` | Update course details. | Admin |
| `DELETE` | `/api/courses/{id}/` | Delete course. | Admin |
| `GET` | `/api/courses/enrollments/` | List student course enrollments. | Authenticated |
| `POST` | `/api/courses/enrollments/` | Enroll student in a course `{student, course, academic_term}`. | Admin |

---

## 6. Attendance (`/api/attendance/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/attendance/` | List attendance entries. Supports `?student=`, `?date=`, `?course=`. | Admin / Teacher |
| `POST` | `/api/attendance/` | Record single attendance entry `{student, course, date, status, remarks}`. | Admin / Teacher |
| `POST` | `/api/attendance/batch/` | Batch record attendance for an entire classroom `{date, course_id, records: [{student_id, status}]}`. | Admin / Teacher |

---

## 7. Grades & Report Cards (`/api/grades/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/grades/` | List grade records. Supports `?student=`, `?course=`, `?exam_type=`. | Admin / Teacher |
| `POST` | `/api/grades/` | Create grade entry `{student, course, exam_type, marks_obtained, max_marks}`. | Admin / Teacher |
| `GET` | `/api/grades/report-card/{student_id}/` | Generates official student report card with CGPA, course breakdown, and pass/fail evaluation. | Authenticated |

---

## 8. Fee Management (`/api/fees/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/fees/invoices/` | List fee invoices. Supports `?student=`, `?status=`, `?term=`. | Admin / Student |
| `POST` | `/api/fees/invoices/` | Generate a new fee invoice `{student, invoice_no, title, total_amount, due_date}`. | Admin |
| `GET` | `/api/fees/payments/` | List fee payment transactions. | Admin / Student |
| `POST` | `/api/fees/payments/` | Record a fee payment `{invoice, amount, payment_method, notes}`. | Admin / Student |
| `GET` | `/api/fees/summary/` | Overall financial KPI metrics (total invoiced, collected, outstanding, rate). | Admin |
