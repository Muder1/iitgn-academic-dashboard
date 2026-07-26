# Academic Dashboard

A full-stack web application designed to help IITGN students track their academic progress, plan future semesters, and monitor degree completion efficiently. The application dynamically evaluates degree requirements, supports specializations such as Minors and Institute Honors, and provides an interactive semester planning experience.

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | Prisma |
| Authentication | Firebase Authentication |

---

## ✨ Features

- Dynamic degree audit based on curriculum requirements
- Semester planning interface
- Course history management
- Support for Minors and Institute Honors
- Automatic progress calculation
- Dynamic requirement visualization
- Extensible architecture with database-driven requirement baskets

---

## 🏗️ Technical Design

### Dynamic 

Instead of hardcoding degree requirements or elective baskets, the backend dynamically retrieves all basket definitions directly from the database using Prisma.

This makes the application highly extensible. New requirement categories can be added by the administrator without requiring any frontend code changes. The UI automatically renders the updated progress sections.

---

### Component-Driven UI

The frontend is built using reusable React components.

To improve usability, the Semester Planner and Course History pages dynamically group courses by semester using an accordion layout, reducing visual clutter while keeping navigation intuitive.

---

### Decoupled Editing with Modals

Instead of inline table editing, course modifications are handled through modal dialogs.

Benefits of this:

- Simpler state management
- Cleaner component hierarchy
- Better handling of complex conditional forms
- Improved user experience for editing Honors and Minor selections

---

## 🚧 Challenges & Solutions

### Cross-Branch Course Classification

A significant challenge was correctly handling Open Electives.

For example, a course categorized as a **Discipline Core** for an Electrical Engineering student should count as an **Open Elective** when taken by a Computer Science student.

#### Solution

Each course stores the eligible branches as an array.

```text
["EE", "CSE"]
```

During degree audit:

1. The student's discipline is mapped to its abbreviation.
2. The backend checks whether the abbreviation exists in the course's branch array.
3. If it does not match the student's own discipline requirements, the course is dynamically reclassified as an **Open Elective** before the audit calculation.

This allows a single course definition to serve multiple departments without duplication.

---

### State Synchronization for Degree Specializations

Supporting both Institute Honors and multiple Minors introduced overlapping state-management challenges.

#### Solution

The frontend enforces mutual exclusivity.

Whenever a course is marked as:

- Institute Honors → Minor selection is automatically cleared.
- Minor → Honors flag is automatically disabled.

This prevents invalid combinations from reaching the backend and keeps the stored data consistent.

---

## 📌 Future Improvements

### Visual Analytics

Future versions could include interactive dashboards using libraries such as:

- Chart.js
- Recharts

Possible visualizations include:

- Degree completion progress
- Credit distribution
- Semester-wise workload
- Core vs Elective credit breakdown
- Minor and Honors completion status

---

### Time Table Support

Adding time table generation in view of the courses taken.

---

## 💡 Key Technical Highlights

- Database-driven degree requirement engine
- Dynamic curriculum rendering
- React component architecture
- Firebase-based authentication
- Prisma Database
- Express REST API
- Cross-branch course classification
- Automatic degree audit
- Semester planning system
- Honors and Minor management
- Extensible and scalable architecture

---

## 📜 License

This project was developed for academic purposes.