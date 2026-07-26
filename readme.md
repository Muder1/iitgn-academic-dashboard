# Academic Dashboard

A full-stack web application designed to help IITGN students track their academic progress, manage course history, and plan future semesters. The application dynamically audits completed coursework against graduation requirements while supporting advanced features such as **Institute Honors**, **Minors**, and intelligent **cross-branch course classification**.

🌐 **Live Demo:** https://iitgn-academic-dashboard-frontend.vercel.app/

---

## 🚀 Features

### 📊 Real-Time Academic Dashboard

- Calculates CGPA in real time
- Tracks completed credits
- Displays graduation progress
- Dynamically computes graduation requirements based on admission cohort and discipline

---

### 📚 Course History

- Log completed courses with grades
- Assign courses towards declared Minors or Institute Honors
- Maintain a complete academic record

---

### 📅 Semester Planner

- Interactive accordion-based semester planner
- Plan future semesters before registration
- Automatically calculates semester-wise credit load
- Updates projected graduation progress as courses are added

---

### 🎓 Dynamic Specialization Tracking

- Declare multiple Minors
- Track Institute Honors
- Live progress bars for every specialization
- Prevents a course from being counted simultaneously towards both Honors and a Minor

---

### 🔄 Intelligent Degree Audit

The application automatically evaluates degree requirements using a dynamic audit engine.

Key capabilities include:

- Curriculum-specific graduation requirements
- Dynamic basket evaluation
- Cross-branch course interception
- Automatic Open Elective classification
- Planned vs Completed course tracking

---

## 🛠️ Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Axios
- Firebase Authentication

### Backend

- Node.js
- Express.js
- Prisma ORM
- Firebase Admin SDK

### Database

- PostgreSQL (managed through Prisma)

---

## 🏗️ Technical Design

### Dynamic Data Hydration

Instead of hardcoding graduation requirements, the backend retrieves all requirement baskets dynamically from the database.

```javascript
prisma.basket.findMany()
```

This allows administrators to introduce new requirement categories without requiring frontend changes. The UI automatically renders new progress sections based on database entries.

---

### Component-Driven UI

The application uses reusable React components throughout the interface.

To improve usability, both the Semester Planner and Course History organize courses into dynamically generated accordion sections grouped by semester, reducing clutter while maintaining easy navigation.

---

### Modal-Based Editing

Rather than inline table editing, all course modifications are performed using modal dialogs.

Benefits include:

- Cleaner user experience
- Reduced React state complexity
- Easier handling of Honors and Minor assignment logic
- Better maintainability

---

## 📦 Prerequisites

Before running the project locally, install:

- Node.js (v16 or later)
- PostgreSQL
- Firebase Project (Authentication)

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/academic-tracker.git

cd academic-tracker
```

---

### 2. Backend Setup

Navigate to the backend folder.

```bash
cd backend

npm install
```

Create a `.env` file.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/academic_db?schema=public"

FIREBASE_PROJECT_ID="your-project-id"

FIREBASE_CLIENT_EMAIL="your-client-email"

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

Generate the Prisma client.

```bash
npx prisma generate
```

Push the schema to the database.

```bash
npx prisma db push
```

Start the backend.

```bash
npm run dev
```

---

### 3. Frontend Setup

Open another terminal.

```bash
cd frontend

npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=your-api-key

VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain

VITE_FIREBASE_PROJECT_ID=your-project-id
```

Start the development server.

```bash
npm run dev
```

---

## 🗄️ Database Schema

backend/prisma/schema.prisma

---

## 📜 License

This project was developed for academic and educational purposes.