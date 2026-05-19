# To-Do List – Preliminary Assignment Submission

## 🚀 Project Setup & Usage
**How to install and run your project:**  
- Check and create the `.env` files in both frontend and backend according to the provided `.env.example files`.
- `npm run build`  
- `npm run start`

## 🔗 Deployed Web URL or APK file
✍️ Link Website: https://student-todolist.onrender.com/

## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- “Unlisted” videos can only be viewed by users who have the link.  
- The video will not appear in search results or on your channel.  
- Share the link in your README so mentors can access it.  

✍️ Link Youtube: https://youtu.be/oh8Mn_7EzcU?si=G9TA45D5iQNMdhCj


## 💻 Project Introduction

### a. Overview

- This is a To-Do Management Web Application that helps users efficiently organize, track, and complete their daily tasks.
- The app allows users to create and manage tasks, view them in different formats (list, calendar, sticky notes), and even leverage an AI agent for task-related support.
- It also supports user authentication to ensure data privacy.

### b. Key Features & Function Manual

- Task Management: Add, edit, delete, and view tasks. Mark tasks as completed or uncompleted.
- Subtasks: Each task can include subtasks for better breakdown of work.
- Task Lists: Users can create and access smaller categorized lists to group tasks.
- Multiple Views:
  - To-Do List View: View all tasks (completed, ongoing, or all).
  - Upcoming View: View tasks scheduled for today, tomorrow, or this week.
  - Calendar View: Display tasks in calendar format (daily, weekly, monthly).
  - Sticky Note View: Visualize tasks as sticky notes for a more engaging experience.
  - Sublist Navigation: Easily navigate into specific lists and view categorized tasks.
- AI Agent Support: Ask questions related to tasks (e.g., deadlines, reminders) and get contextual answers.
- Authentication: Login and logout functions ensure users only access their personal task data securely.

### c. Unique Features (What’s special about this app?) 
- Integration of AI-powered assistant to provide smart recommendations and Q&A for tasks.
- Multiple visualization modes (list, calendar, sticky notes) instead of just a plain list.
- Subtask and sublist organization for a more structured and flexible task hierarchy.
- Secure multi-user system with authentication to prevent data leaks.

### d. Technology Stack and Implementation Methods
- Frontend: React + Vite (for fast development and optimized build).
- Backend: Node.js + Express (for handling APIs and authentication).
- Database: MongoDB (for storing tasks, subtasks, and user data).
- Authentication: JWT-based secure login/logout system.
- AI Agent: Integrated API for task-related Q&A.

### e. Service Architecture & Database structure (when used)
#### Architecture:
- Client (Frontend): Sends task-related requests and displays data in multiple views.
- Server (Backend): Handles CRUD operations for tasks, subtasks, lists, and authentication.
- Database: Stores user accounts, task details, subtasks, and categories.
#### Database structure:
- chatsessions: {`_id`, `title`, `messages`, `userId`, `isActive`, `lastMessageAt`, `createdAt`, `updatedAt`}
- tasklists: {`_id`, `id`, `name`, `color`, `isDefault`, `userId`, `createdAt`, `updatedAt`}
- tasklists: {`_id`, `title`, `description`, `status`, `list`, `deadline`, `completedAt`, `userId`, `subtasks`, `createdAt`, `updatedAt`}
- users: {`_id`, `fullName`, `username`, `password`, `avatar`, `createdAt`, `updatedAt`}

## 🧠 Reflection

### a. If you had more time, what would you expand?

- Add real-time notifications and reminders for upcoming tasks.
- Implement collaborative lists where multiple users can share and work on the same task group.
- Provide custom themes and personalization for better user experience.
- Enhance the AI agent to provide automatic task prioritization based on deadlines and workload.


### b. If you integrate AI APIs more for your app, what would you do?
- Use AI for task prioritization and scheduling optimization.
- Add natural language input, so users can create tasks by typing or speaking casually (e.g., "Remind me to call John tomorrow at 3 PM").
- Implement AI-based productivity insights, suggesting when to focus on which tasks based on user behavior.
- Provide summarization of weekly tasks using AI.