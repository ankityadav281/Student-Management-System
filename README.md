# 🎓 Student Management System (SMS)

A full-featured **Student Management System** built to handle student records, academic course registrations, attendance tracking, and grading.

---

## 📋 Features

- **User Authentication & Roles:** Secure access for Administrators, Teachers, and Students.
- **Student Information System (SIS):** Create, view, update, and manage student personal and academic records.
- **Course & Department Management:** Manage departments, assign teachers to subjects, and enroll students.
- **Attendance Management:** Daily attendance recording with summary statistics and attendance reports.
- **Grades & Report Cards:** Input exam/assignment marks and generate automated GPA/grade sheets.
- **Fee Management:** Track student fee invoices and payment records.

---

## 👥 User Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system control, manage teachers/students, configure courses, view audit logs. |
| **Teacher** | Record attendance, enter grades, upload assignments, view assigned class lists. |
| **Student** | View personal profile, registered courses, attendance percentage, and exam results. |

---

## 🛠️ Tech Stack

- **Backend:** Python (Django / Flask) or Node.js (Express)
- **Frontend:** HTML5, CSS3, JavaScript / React / Bootstrap
- **Database:** SQLite / MySQL / PostgreSQL
- **Authentication:** Sessions / JWT

---

## 📁 Project Structure

```text
STUDENT MANAGEMENT SYSTEM/
├── backend/          # Server logic, routes, and models
├── frontend/         # UI templates, styles, and scripts
├── database/         # Database migrations and seed scripts
├── .env.example      # Sample environment variables
├── requirements.txt  # Dependencies (if Python) / package.json (if Node.js)
└── README.md         # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ or Node.js 18+
- Git

### 2. Installation

1. Navigate to the project root directory:
   ```bash
   cd "d:\FINAL PROJECTS\STUDENT MANAGEMENT SYSTEM"
   ```

2. Install dependencies:
   - **For Python:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     pip install -r requirements.txt
     ```
   - **For Node.js:**
     ```bash
     npm install
     ```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```ini
PORT=5000
SECRET_KEY=your_secret_key_here
DB_NAME=student_management_db
DB_USER=root
DB_PASSWORD=your_password
```

### 4. Database Setup & Migrations
- **Django:**
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  python manage.py createsuperuser
  ```
- **Node.js / Prisma:**
  ```bash
  npx prisma migrate dev --name init
  ```

### 5. Run the Application
- **Python:** `python manage.py runserver`
- **Node.js:** `npm start` or `npm run dev`

Access the web interface at `http://localhost:5000` (or `http://127.0.0.1:8000`).

---

## 📄 License

This project is licensed under the MIT License.