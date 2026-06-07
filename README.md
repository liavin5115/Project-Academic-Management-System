# Academic Management System (AMS)

A beautifully designed, premium web application built to help students manage their entire academic life in one unified dashboard. Featuring a stunning glassmorphism aesthetic and seamless real-time tracking.

## 🚀 Features

### 🎨 Premium User Experience
*   **Stunning Glassmorphism Design**: Sleek, transparent UI elements over dynamic backgrounds.
*   **Fully Responsive**: Works perfectly on desktop and mobile.
*   **Multi-language Support (i18n)**: Seamlessly switch between English and Indonesian.
*   **Global Clock**: Real-time GMT+7 synchronized clock across the app.

### 📊 Dashboard & Analytics
*   **Overview Stats**: Quick look at total courses, tasks in progress, and completed tasks.
*   **Urgent Tasks**: Real-time view of what's due soon, mapped by star-rated difficulty.
*   **Today's Schedule**: A glance at what classes you have lined up for the day.

### 📚 Course & Lecturer Management
*   **Course Library**: Add and track all your courses with dedicated color codes.
*   **Smart Lecturer Assignment**: Just type a lecturer's name to instantly link them to a course. No separate creation needed.

### ⏱️ Advanced Pomodoro Timer
*   **Fully Customizable**: Set custom focus and break times.
*   **Session Tracking**: Choose the specific course you're studying for.
*   **Global Widget**: The timer keeps ticking in the background no matter what page you navigate to!
*   **Historical Stats**: Track how much time you've spent studying over the week or month.

### 📈 GPA Calculator & Trend History
*   **Interactive Calculator**: Tweak hypothetical grades for your current courses and see the projected GPA instantly.
*   **Save Reports**: Take a snapshot of your semester and save it to your history.
*   **SVG Trend Chart**: A beautiful, hand-coded interactive line chart that draws your GPA progress over time.

### 📝 Task Kanban Board
*   **Visual Organization**: Group your assignments by Todo, In Progress, and Completed.
*   **Difficulty Ratings**: Visual star ratings (★★★★★) to easily judge task weight.

### 📅 Weekly Schedule
*   **Grid Layout**: A full weekly timetable that visually maps your classes based on start/end times.
*   **Conflict Resolution**: Visual indicators for overlapping classes.

### 🔐 Security & Architecture
*   **JWT Authentication**: Secure login and registration.
*   **Modern Stack**: Built using React/Vite (Frontend) and FastAPI/Python (Backend).

## 🛠️ Tech Stack
*   **Frontend**: React, Vite, TailwindCSS, Zustand (State), React Router, date-fns, react-i18next
*   **Backend**: Python, FastAPI, SQLAlchemy, SQLite (`ams.db`), Pydantic