# Student Management System (SMS)

A complete, modern, full-stack Student Management System re-architected into cleanly separated **React.js Frontend** and **Django REST Framework Backend**.

---

## Architectural Highlights

- **Decoupled Architecture**: Independent frontend and backend directories communicating via REST APIs.
- **Frontend**: React 19 + Vite + React Router DOM + Axios + Lucide Icons + Responsive Glassmorphism UI.
- **Backend**: Python 3 + Django 5 + Django REST Framework + SQLite ORM + Token Authentication.
- **Role-Based Access Control (RBAC)**: Dedicated interfaces and permissions for:
  - **Academic Coordinator / Administrator**
  - **Teacher / Faculty Member**
  - **Student**
- **Core Modules**:
  1. Student Profile & Academic Management (CRUD, Search, Filters, CSV Export)
  2. Department & Faculty Management
  3. Course Catalogs & Student Course Enrollment
  4. Daily & Batch Classroom Attendance Tracking (with `< 75%` attendance alert tags)
  5. Examination Marks, Automatic GPA & Grade Calculation, and Official Printable Report Cards
  6. Tuition Fee Invoices, Payment Tracking, and Financial Summaries

---

## Project Structure

```
STUDENT-MANAGEMENT-SYSTEM/
│
├── frontend/                     # React Frontend Application (Vite)
│   ├── public/                   # Favicons and public assets
│   ├── src/
│   │   ├── assets/               # Brand assets
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Authentication context
│   │   ├── hooks/                # Custom hooks (useAuth)
│   │   ├── layouts/              # MainLayout with sticky glass navbar & footer
│   │   ├── pages/                # Route pages (auth, admin, teacher, student)
│   │   ├── routes/               # AppRoutes and ProtectedRoute with RBAC
│   │   ├── services/             # Modular Axios API services
│   │   ├── styles/               # Global styles and design system
│   │   ├── utils/                # Formatters, constants, helpers
│   │   ├── App.jsx               # Root application router wrapper
│   │   └── main.jsx              # React DOM entry point
│   ├── package.json              # NPM dependencies
│   ├── vite.config.js            # Vite configuration
│   └── .env.example              # Frontend environment template
│
├── backend/                      # Django REST API Backend
│   ├── config/                   # Django settings, WSGI, root URLs
│   ├── apps/                     # Modular Django domain apps
│   │   ├── accounts/             # Custom User, authentication, tokens
│   │   ├── attendance/           # Daily & batch attendance tracking
│   │   ├── courses/              # Courses, credits, teacher links, enrollments
│   │   ├── departments/          # Academic departments
│   │   ├── fees/                 # Tuition invoices, payments, financial summaries
│   │   ├── grades/               # Examination marks, GPA computation, report cards
│   │   ├── students/             # Student records, live metrics, CSV export
│   │   └── teachers/             # Faculty profiles
│   ├── manage.py                 # Django management CLI
│   ├── requirements.txt          # Python dependencies
│   ├── db.sqlite3                # Relational SQLite database
│   ├── test_e2e.py               # E2E integration test suite
│   └── .env.example              # Backend environment template
│
├── docs/                         # Technical documentation
│   ├── architecture.md           # Architecture specification
│   └── api_reference.md          # REST API endpoints reference
│
├── backup_data/                  # Safe backup of legacy database and JSON data
├── .gitignore                    # Git rules for clean repository state
└── README.md                     # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher

---

### 1. Backend Setup (Django REST Framework)

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate.bat
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Seed initial demo records and default accounts
python manage.py seed_data

# Start the Django development server
python manage.py runserver 127.0.0.1:8000
```

The Django REST API will be running at:
- **API Root**: `http://127.0.0.1:8000/api/`
- **Django Admin**: `http://127.0.0.1:8000/admin/`

---

### 2. Frontend Setup (React + Vite)

Open a **separate terminal** and navigate to the `frontend/` directory:

```bash
cd frontend

# Install NPM dependencies
npm install

# (Optional) Create .env from template if needed
copy .env.example .env

# Start the Vite development server
npm run dev
```

The React frontend will be running at:
- **React App**: `http://localhost:5173/`

---

## Default Login Credentials

The system includes pre-configured demo accounts for all three roles:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Academic Coordinator / Admin** | `admin@campus.edu` | `Password@123` | Full administrative control, student CRUD, courses, departments, fee invoices, CSV export |
| **Teacher / Faculty** | `teacher@campus.edu` | `Password@123` | Student directory, daily & batch attendance recording, examination marks & grading |
| **Student** | `student@campus.edu` | `Password@123` | Student portal, live attendance rate, GPA & printable report card, fee invoice status |

---

## Automated Verification & Testing

To run the automated 15-point end-to-end integration test suite:

```bash
cd backend
.\venv\Scripts\python.exe test_e2e.py
```

To verify the React frontend production build:

```bash
cd frontend
npm run build
```

---

## Documentation

- [Architecture & Design Specification](file:///d:/FINAL%20PROJECTS/STUDENT%20MANAGEMENT%20SYSTEM/docs/architecture.md)
- [REST API Reference](file:///d:/FINAL%20PROJECTS/STUDENT%20MANAGEMENT%20SYSTEM/docs/api_reference.md)
