<div align="center">

# ⚡ QKron

### Industry-Grade Local-First Task Scheduling & Workflow Automation

**Create · Schedule · Monitor · Automate** — all running locally, no external services required.

<br/>

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.5-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Nikhil-Singh-2503/Qkron?style=flat-square&color=blue)](https://github.com/Nikhil-Singh-2503/Qkron/commits)
[![Open Issues](https://img.shields.io/github/issues/Nikhil-Singh-2503/Qkron?style=flat-square&color=red)](https://github.com/Nikhil-Singh-2503/Qkron/issues)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/Nikhil-Singh-2503/Qkron/actions)
[![Python Version](https://img.shields.io/badge/python-3.11%20|%203.12-3776AB?style=flat-square)](https://www.python.org/)

<br/>

[🚀 Quick Start](#-quick-start) · [📖 Documentation](https://github.com/Nikhil-Singh-2503/Qkron/blob/master/README.md) · [🐛 Report Bug](https://github.com/Nikhil-Singh-2503/Qkron/issues) · [💡 Request Feature](https://github.com/Nikhil-Singh-2503/Qkron/issues)

</div>

---

## 📋 Table of Contents

- [✨ Project Highlights](#-project-highlights)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Features](#️-features)
- [📸 Screenshots](#-screenshots)
- [🏗 Architecture](#-architecture)
- [🔧 Installation & Setup](#-installation--setup)
  - [Method 1: pip (Recommended)](#method-1-using-pip-recommended-for-beginners)
  - [Method 2: uv (Faster)](#method-2-using-uv-faster-installation)
  - [Method 3: Docker (Easiest)](#method-3-using-docker-easiest-method)
- [🎨 Frontend Setup](#-frontend-setup-react--typescript)
- [📡 API Reference](#-api-endpoints)
- [⏰ Schedule Format](#-schedule-format)
- [🔗 Task Dependencies](#-task-dependencies)
- [🔔 Notification System](#-notification-system)
- [⚙️ Configuration](#️-configuration)
- [🧪 Development](#-development)
- [🚢 Production Deployment](#-production-deployment)
- [🔮 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Project Highlights

> **QKron** is a powerful **local-first task scheduling and workflow automation platform** built for developers and teams who want full control over their automation pipelines — without vendor lock-in or external service dependencies.

- 🔒 **Local-First** — Runs entirely on your infrastructure, no external services required
- ⚡ **High Performance** — Async execution engine built on FastAPI and APScheduler
- 🧩 **Task Dependencies** — Build complex DAG-style workflows with dependency chains
- 🔔 **Multi-Channel Alerts** — Email, SMS (Twilio), and Webhook notifications out of the box
- 📊 **Real-Time Monitoring** — Live dashboard with execution history and task statistics
- 🔐 **Secure by Default** — JWT authentication with role-based access control
- 🐳 **Docker Ready** — One-command deployment with Docker Compose
- 📖 **API-First Design** — Full OpenAPI/Swagger documentation included

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | ![Python](https://img.shields.io/badge/-Python_3.12-3776AB?logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white) ![APScheduler](https://img.shields.io/badge/-APScheduler-FF6B35) |
| **Frontend** | ![React](https://img.shields.io/badge/-React_19-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL_13+-4169E1?logo=postgresql&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy_2.0-D71F00) ![Alembic](https://img.shields.io/badge/-Alembic-6BA539) |
| **Infrastructure** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) ![Redis](https://img.shields.io/badge/-Redis_(optional)-DC382D?logo=redis&logoColor=white) |
| **Auth & Security** | ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white) ![RBAC](https://img.shields.io/badge/-RBAC-6366F1) |

---

## 🚀 Quick Start

Get up and running in under 5 minutes with Docker:

```bash
# 1. Clone the repository
git clone <repository-url>
cd QKron

# 2. Copy and configure environment
cp .env.example .env

# 3. Start everything with Docker Compose
docker-compose up -d
```

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 🔌 Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |
| 📘 ReDoc | http://localhost:8000/redoc |

> **First-time users:** Register at `POST /api/v1/auth/register`, log in to get your JWT token, then start creating tasks!

<details>
<summary>📟 First API Call Example</summary>

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "username": "myuser", "password": "securepassword123"}'

# Login — save the access_token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=myuser&password=securepassword123"

# Create your first scheduled task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Daily Backup",
    "command": "python /path/to/backup.py",
    "schedule_type": "cron",
    "schedule": "0 2 * * *",
    "timeout": 3600
  }'
```

</details>

---

## ⚙️ Features

### 🔙 Backend (FastAPI)

| Feature | Description |
|---------|-------------|
| 📝 **Task Management** | Full CRUD operations — create, read, update, delete tasks |
| ⏰ **Flexible Scheduling** | Cron expressions and interval-based scheduling |
| ⚡ **Async Execution** | High-performance async task execution engine |
| 🗄️ **PostgreSQL** | Persistent storage with SQLAlchemy 2.0 async ORM |
| 🔐 **Security** | JWT authentication with role-based access control |
| 📖 **API-First** | RESTful API with full OpenAPI documentation |
| 🔗 **Task Dependencies** | Define DAG-style dependencies between tasks |
| 🔔 **Notifications** | Email (SMTP), SMS (Twilio), and Webhook notifications |

### 🖥️ Frontend (React + TypeScript)

| Feature | Description |
|---------|-------------|
| 🎨 **Modern UI** | React 19 with TypeScript and Tailwind CSS |
| 📊 **Dashboard** | Task statistics and recent activity overview |
| ✅ **Task Manager** | Visual interface for creating and managing scheduled tasks |
| 🔔 **Notification Config** | Configure and test email, SMS, and webhook notifications |
| 👥 **User Management** | Admin interface for managing users |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |
| 🍞 **Toast Notifications** | Real-time user feedback |

---

## 📸 Screenshots

> 🖼️ *Screenshots coming soon — contributions welcome!*

<details>
<summary>📁 Add Your Screenshots Here</summary>

To add screenshots, place image files in a `docs/screenshots/` folder and embed them here:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
![Task Manager](docs/screenshots/task-manager.png)
![Notifications](docs/screenshots/notifications.png)
```

</details>

---

## 🏗 Architecture

QKron follows a clean layered architecture with a React frontend, FastAPI backend, and PostgreSQL persistence:

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                           │
│           React 19 + TypeScript + Tailwind CSS                │
│         Dashboard · Tasks · Notifications · Users             │
└─────────────────────────┬─────────────────────────────────────┘
                          │  HTTP / REST API
┌─────────────────────────▼─────────────────────────────────────┐
│                   API GATEWAY (FastAPI)                        │
│          JWT Auth · RBAC · OpenAPI · Rate Limiting            │
└──────┬──────────────────┬──────────────────┬──────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼───────┐  ┌──────▼──────┐
│  Scheduler  │  │    Executor    │  │  Notifier   │
│ (APScheduler│  │  (Async/Sub-  │  │  (Email /   │
│  Cron +     │  │   process)    │  │  SMS /      │
│  Interval)  │  │  Timeout +    │  │  Webhook)   │
└──────┬──────┘  │  Concurrent   │  └─────────────┘
       │         └────────┬──────┘
       └──────────┬───────┘
                  │
┌─────────────────▼─────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                             │
│              PostgreSQL (SQLAlchemy 2.0 Async)                │
│         users · tasks · task_executions · notifications       │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Request → FastAPI Router → Service Layer → Scheduler/Executor
                                                      ↓
                                              PostgreSQL (Store Result)
                                                      ↓
                                              Notifier (Alert on Event)
```

### Frontend Architecture

```
src/
├── components/
│   ├── layout/         # Layout, Header, Sidebar, Footer
│   └── ui/             # Reusable UI components (Button, Modal, etc.)
├── contexts/           # React contexts (Auth, Toast)
├── pages/              # Page components (Dashboard, Tasks, etc.)
├── services/           # Axios API service layer
├── types/              # TypeScript interfaces & types
├── App.tsx             # Main app with React Router
└── main.tsx            # Application entry point
```

---

## 🔧 Installation & Setup

### Prerequisites

Ensure you have the following installed before starting:

| Requirement | Version | Link |
|-------------|---------|------|
| **Python** | 3.11+ (3.12 recommended) | [python.org](https://www.python.org/downloads/) |
| **PostgreSQL** | 13+ | [postgresql.org](https://www.postgresql.org/download/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **Redis** | Optional | For caching & rate limiting |

> **💡 Tip:** If you have multiple Python versions, create a virtual environment with a specific version:
> ```bash
> python3.12 -m venv venv
> ```

---

### Method 1: Using pip (Recommended for beginners)

<details>
<summary>📦 Expand pip installation steps</summary>

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd QKron
```

#### Step 2: Create Virtual Environment

```bash
# Create virtual environment with Python 3.12 (recommended)
python3.12 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

> **Troubleshooting:** If `python3.12` is not found, install from [python.org](https://www.python.org/downloads/) or via Homebrew: `brew install python@3.12`

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your database credentials
```

#### Step 5: Run Database Migrations

```bash
alembic upgrade head
```

#### Step 6: Start the Application

```bash
uvicorn taskmaster.main:app --host 0.0.0.0 --port 8000 --reload
```

✅ API available at **http://localhost:8000**

</details>

---

### Method 2: Using uv (Faster installation)

<details>
<summary>⚡ Expand uv installation steps</summary>

#### Step 1: Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### Step 2: Clone and Navigate

```bash
git clone <repository-url>
cd QKron
```

#### Step 3: Install with uv

```bash
uv pip install -e ".[dev,test]"
```

#### Step 4: Start Application

```bash
uvicorn taskmaster.main:app --reload
```

</details>

---

### Method 3: Using Docker (Easiest method)

<details>
<summary>🐳 Expand Docker installation steps</summary>

#### Prerequisites

- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

#### Step 1: Clone Repository

```bash
git clone <repository-url>
cd QKron
```

#### Step 2: Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### Step 3: Access the Services

| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

</details>

---

## 🎨 Frontend Setup (React + TypeScript)

QKron includes a modern React frontend with TypeScript, Tailwind CSS, and Vite.

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **npm** — Bundled with Node.js

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set your API URL:
# VITE_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

✅ Frontend available at **http://localhost:5173**

```bash
# Build for production
npm run build
# Output: dist/ directory
```

> **Important:** Environment variables must start with `VITE_` to be accessible in Vite. The default API URL is `http://localhost:8000/api/v1`.

### Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| 🔑 Login | `/login` | User authentication |
| 📊 Dashboard | `/` | Overview with task statistics |
| 📋 Tasks | `/tasks` | Task list with full CRUD |
| 🔍 Task Detail | `/tasks/:id` | Task details and execution history |
| ➕ Create Task | `/tasks/new` | Create new scheduled task |
| ✏️ Edit Task | `/tasks/:id/edit` | Edit existing task |
| 🔔 Notifications | `/notifications` | Notification configs and logs |
| 👥 Users | `/users` | User management (admin only) |

### Running Both Frontend and Backend

```bash
# Terminal 1 — Backend
cd /path/to/QKron
uvicorn taskmaster.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

> **Production:** Deploy the `dist/` folder alongside the backend and configure a reverse proxy (Nginx, Caddy) to route `/api` requests to the backend.

---

## 📡 API Endpoints

> 📖 Full interactive docs at **http://localhost:8000/docs** (Swagger UI) or **http://localhost:8000/redoc** (ReDoc).

<details>
<summary>🔐 Authentication</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login and get access token |
| `GET` | `/api/v1/auth/me` | Get current user info |

</details>

<details>
<summary>📋 Tasks</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tasks` | List all tasks (paginated) |
| `POST` | `/api/v1/tasks` | Create new task |
| `GET` | `/api/v1/tasks/{id}` | Get task by ID |
| `PUT` | `/api/v1/tasks/{id}` | Update task |
| `DELETE` | `/api/v1/tasks/{id}` | Delete task |
| `POST` | `/api/v1/tasks/{id}/execute` | Execute task immediately |
| `GET` | `/api/v1/tasks/{id}/executions` | List task executions |
| `POST` | `/api/v1/tasks/{id}/pause` | Pause scheduled task |
| `POST` | `/api/v1/tasks/{id}/resume` | Resume paused task |

</details>

<details>
<summary>👥 Users</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users` | Create new user *(superuser only)* |
| `GET` | `/api/v1/users` | List users *(superuser only)* |
| `GET` | `/api/v1/users/{id}` | Get user by ID |
| `DELETE` | `/api/v1/users/{id}` | Delete user *(superuser only)* |

</details>

<details>
<summary>🔔 Notifications</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/notifications/configs` | Create notification config |
| `GET` | `/api/v1/notifications/configs` | List notification configs |
| `GET` | `/api/v1/notifications/configs/{id}` | Get notification config |
| `DELETE` | `/api/v1/notifications/configs/{id}` | Delete notification config |
| `GET` | `/api/v1/notifications/logs` | List notification logs |
| `POST` | `/api/v1/notifications/test/{channel}` | Send test notification |

</details>

<details>
<summary>❤️ Health & Monitoring</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/ready` | Readiness check (Kubernetes) |
| `GET` | `/live` | Liveness check (Kubernetes) |

</details>

---

## ⏰ Schedule Format

### Cron Expression (`schedule_type: "cron"`)

Standard 5-field cron format: `minute hour day month weekday`

| Field | Allowed Values | Special Characters |
|-------|---------------|-------------------|
| Minute | 0-59 | `*` `,` `-` `/` |
| Hour | 0-23 | `*` `,` `-` `/` |
| Day | 1-31 | `*` `,` `-` `/` |
| Month | 1-12 | `*` `,` `-` `/` |
| Weekday | 0-6 (Sun–Sat) | `*` `,` `-` `/` |

**Common examples:**

| Expression | Description |
|------------|-------------|
| `0 2 * * *` | Daily at 2:00 AM |
| `*/5 * * * *` | Every 5 minutes |
| `0 0 * * 0` | Weekly on Sunday at midnight |
| `0 0 1 * *` | Monthly on the 1st at midnight |
| `0 9 * * 1-5` | Weekdays at 9:00 AM |
| `0 */6 * * *` | Every 6 hours |

> 🔧 **Tools:** [Crontab Guru](https://crontab.guru/) · [CronJob.xyz](https://cronjob.xyz/)

### Interval Format (`schedule_type: "interval"`)

Simple notation: `<number><unit>`

| Unit | Description | Example |
|------|-------------|---------|
| `s` | seconds | `30s` — every 30 seconds |
| `m` | minutes | `5m` — every 5 minutes |
| `h` | hours | `1h` — every hour |
| `d` | days | `1d` — every day |

### Quick Reference

```json
// Cron task — runs daily at 2 AM
{
  "schedule_type": "cron",
  "schedule": "0 2 * * *",
  "name": "Daily Backup",
  "command": "python backup.py"
}

// Interval task — runs every 5 minutes
{
  "schedule_type": "interval",
  "schedule": "5m",
  "name": "Health Check",
  "command": "curl http://localhost:8000/health"
}
```

---

## 🔗 Task Dependencies

QKron supports DAG-style task dependencies. A task will **only execute after all its dependency tasks have completed successfully**.

### How It Works

1. **Storage** — Dependencies stored as a JSON array of task UUIDs in the `tasks.dependencies` column
2. **Validation** — Before execution, the scheduler verifies all dependencies:
   - Exist in the database
   - Have completed successfully (`status = "success"`)
3. **Execution** — If dependencies are unsatisfied, the task is skipped with a warning

### Dependency Behavior

| Dependency Status | Task Behavior |
|------------------|---------------|
| ✅ All satisfied (success) | Task executes normally |
| ❌ Any failed | Task is skipped |
| ⏳ Any pending/running | Task waits for completion |
| ⚠️ Any missing | Task fails with error |

### Examples

**Create a task with dependencies:**
```json
{
  "name": "Deploy Application",
  "command": "python deploy.py",
  "schedule_type": "interval",
  "schedule": "1h",
  "dependencies": ["backup-task-uuid", "test-task-uuid"]
}
```

**Update task dependencies via API:**
```bash
curl -X PUT http://localhost:8000/api/v1/tasks/{task_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dependencies": ["new-dependency-uuid"]}'
```

---

## 🔔 Notification System

QKron supports multiple notification channels to alert you about task status changes.

### Supported Channels

| Channel | Trigger Events | Requirements |
|---------|---------------|--------------|
| 📧 **Email** (SMTP) | on_start, on_success, on_failure | SMTP credentials |
| 🌐 **Webhook** | on_start, on_success, on_failure | HTTP endpoint URL |
| 📱 **SMS** (Twilio) | on_failure | Twilio account |

### Configuration

Add to your `.env` file:

```env
# Email (SMTP) Configuration
# For Gmail: use an App Password — https://support.google.com/accounts/answer/185833
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
EMAIL_FROM=QKron <noreply@taskmaster.com>

# SMS (Twilio) Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

> **Gmail Note:** Enable 2-Factor Authentication, then generate an App Password under Google Account → Security → App Passwords.

### Creating Notification Configs

<details>
<summary>📧 Email Notification</summary>

```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "email",
    "config": {"recipient": "user@example.com"},
    "on_success": false,
    "on_failure": true,
    "on_start": false
  }'
```

</details>

<details>
<summary>🌐 Webhook Notification</summary>

```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "webhook",
    "config": {
      "recipient": "https://your-webhook.com/endpoint",
      "auth_token": "optional-bearer-token"
    },
    "on_success": true,
    "on_failure": true,
    "on_start": false
  }'
```

</details>

<details>
<summary>📱 SMS Notification</summary>

```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "sms",
    "config": {"recipient": "+1234567890"},
    "on_failure": true
  }'
```

</details>

<details>
<summary>🎯 Task-Specific Notifications</summary>

Configure notifications for a specific task by including `task_id`:

```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "email",
    "task_id": "your-task-id",
    "config": {"recipient": "user@example.com"},
    "on_failure": true
  }'
```

</details>

### Testing Notifications

```bash
curl -X POST "http://localhost:8000/api/v1/notifications/test/email?recipient=user@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application
APP_NAME=QKron
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Security — generate a secure key for production!
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_PREFIX=/api/v1
ALLOWED_HOSTS=["localhost", "127.0.0.1"]
CORS_ORIGINS=["http://localhost:3000"]

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/taskmaster
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Scheduler
SCHEDULER_MAX_WORKERS=10
SCHEDULER_TIMEZONE=UTC

# Task Execution
TASK_DEFAULT_TIMEOUT=300
TASK_MAX_RETRIES=3

# Notifications (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
EMAIL_FROM=QKron <noreply@taskmaster.com>

TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Generating a Secure Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Database Configuration

<details>
<summary>🐘 Local PostgreSQL</summary>

Start a PostgreSQL instance via Docker:

```bash
docker run -d \
  --name taskmaster-db \
  -e POSTGRES_USER=taskmaster \
  -e POSTGRES_PASSWORD=taskmaster \
  -e POSTGRES_DB=taskmaster \
  -p 5432:5432 \
  postgres:15-alpine
```

Then set in `.env`:
```env
DATABASE_URL=postgresql+asyncpg://taskmaster:taskmaster@localhost:5432/taskmaster
```

</details>

<details>
<summary>☁️ Cloud PostgreSQL (Neon, AWS RDS, GCP, Azure)</summary>

1. Create a PostgreSQL instance in your cloud provider
2. Get the connection details (host, port, username, password)
3. Set `DATABASE_URL` in your `.env`:

```env
# Neon
DATABASE_URL=postgresql+asyncpg://user:password@your-neon-host.neon.tech/taskmaster

# AWS RDS
DATABASE_URL=postgresql+asyncpg://user:password@your-rds-endpoint.amazonaws.com:5432/taskmaster
```

> **Note:** For cloud databases, you may need to whitelist your IP, use SSL (`?ssl=require`), and configure VPC/security groups.

</details>

---

## 🧪 Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=taskmaster --cov-report=html

# Run specific test file
pytest tests/test_tasks.py -v

# Run by markers
pytest -m unit
pytest -m integration
```

### Code Quality

```bash
# Format code
black taskmaster tests

# Lint with Ruff
ruff check taskmaster tests --fix

# Type checking
mypy taskmaster

# Run all pre-commit hooks
pre-commit run --all-files
```

---

## 🚢 Production Deployment

### Using Docker Compose

```bash
# Set environment to production
export ENVIRONMENT=production

# Start all services
docker-compose up -d
```

### Security Checklist

- [ ] 🔑 Change default `SECRET_KEY` to a cryptographically secure value
- [ ] 🔒 Use strong, unique passwords for all services
- [ ] 🌐 Enable HTTPS/TLS (via Nginx, Caddy, or cloud load balancer)
- [ ] 🛡️ Configure CORS origins to your production domain only
- [ ] 📋 Set up log rotation and centralized logging
- [ ] 🔥 Configure firewall rules (only expose required ports)
- [ ] ⚙️ Use environment-specific configuration (never commit `.env`)

---

## 🔮 Future Enhancements

The following features are planned for future releases:

| Feature | Description | Status |
|---------|-------------|--------|
| 🗄️ **Caching Layer** | Redis integration for improved performance | Planned |
| 📈 **Monitoring** | Prometheus metrics and Grafana dashboards | Planned |
| 🔄 **Task Queue** | Background job processing with Celery | Planned |
| 🌐 **Distributed Execution** | Multi-node task execution support | Planned |
| 🔔 **Real-time Webhooks** | Live task event streaming | Planned |

---

## 🔧 Troubleshooting

<details>
<summary>❌ "command not found: uvicorn"</summary>

Make sure you have activated the virtual environment:
```bash
source venv/bin/activate
pip install -r requirements.txt
```
</details>

<details>
<summary>❌ "TypeError: unsupported operand type(s) for |: 'str' and 'NoneType'"</summary>

This is a Python version issue. Ensure you're using Python 3.11+:
```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
</details>

<details>
<summary>❌ "Address already in use" (Port 8000)</summary>

Kill the process using port 8000 or use a different port:
```bash
# Kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn taskmaster.main:app --port 8001
```
</details>

<details>
<summary>❌ Database connection errors</summary>

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- For cloud databases, ensure your IP is whitelisted
</details>

<details>
<summary>❌ "column X does not exist" — Schema errors</summary>

Run database migrations:
```bash
alembic upgrade head
```

If tables don't exist yet:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```
</details>

<details>
<summary>❌ ModuleNotFoundError: No module named 'taskmaster'</summary>

Install in editable mode:
```bash
pip install -e .
# or
uv pip install -e .
```
</details>

<details>
<summary>❌ PermissionError: [WinError 5] Access is denied (Windows)</summary>

Run Command Prompt as Administrator or check file permissions.
</details>

<details>
<summary>❌ Redis connection errors</summary>

Redis is optional. If you don't need caching/rate limiting, you can safely ignore this. Otherwise, install Redis locally or use a managed Redis service.
</details>

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/amazing-feature`
3. 📦 Install development dependencies: `pip install -r requirements.txt`
4. ✏️ Make your changes
5. ✅ Run tests: `pytest`
6. 🔍 Run linting: `ruff check . --fix`
7. 💾 Commit your changes: `git commit -m 'Add amazing feature'`
8. 📤 Push to branch: `git push origin feature/amazing-feature`
9. 🔀 Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

## 💬 Support & Community

| Resource | Link |
|----------|------|
| 📖 Documentation | [Go through the README.md file](https://github.com/Nikhil-Singh-2503/Qkron/blob/master/README.md) |
| 🐛 Report a Bug | [GitHub Issues](https://github.com/Nikhil-Singh-2503/Qkron/issues) |
| 💡 Feature Requests | [GitHub Issues (Use New Feature label)](https://github.com/Nikhil-Singh-2503/Qkron/issues) |

---

<div align="center">

**Made with ❤️ using FastAPI and Python**

⭐ If you find QKron useful, please consider giving it a star on GitHub!

</div>
