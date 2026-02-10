📝 My Tasks App

A modern Angular application for managing tasks with user roles (Admin/Agent). Built with Angular standalone components, signals, and a Tasks API backend.

🚀 Features

Task Management

Create, edit, and delete tasks

Assign tasks to agents

Filter and sort tasks by status, priority, and assignment

User Roles

Switch between Admin and Agent

Role-based task view

Reactive UI

Uses Angular signals for state management

Real-time updates with reactive components

Standalone Components

Modular, reusable components

Easy to maintain and extend

🗂 Project Structure
src/
├── app/
│   ├── components/        # Reusable components
│   │   ├── user-selector/
│   │   ├── task-card/
│   │   └── task-form/
│   ├── pages/             # Screens / pages
│   │   ├── tasks-list/
│   │   └── dashboard/
│   ├── services/          # API and state services
│   │   ├── auth.service.ts
│   │   ├── task.service.ts
│   │   └── user.service.ts
│   ├── app.component.ts
│   └── app.config.ts
└── assets/                # Static assets like images and icons

💻 Tech Stack

Angular 16+ with standalone components

TypeScript

Tailwind CSS (optional for styling)

RxJS and Angular Signals

Tasks API backend (REST endpoints)

⚡ Installation
# Clone the repository
git clone https://github.com/your-username/my-tasks-app.git
cd my-tasks-app

# Install dependencies
npm  install sqlite3 express bcrypt jsonwebtoken dotenv cors

# Run the application
ng serve


Open http://localhost:4200
 to view it in the browser.

🛠 Usage

Navigate to Tasks List page

Create a new task using the Task Form

Filter tasks by status, priority, or assigned agent

Switch roles between Admin and Agent using the User Selector

🔧 Configuration

API endpoints and app-wide configuration are in app/app.config.ts

Auth and user role state is managed in auth.service.ts

📦 Scripts
# Build the app
ng build

# Run unit tests
ng test