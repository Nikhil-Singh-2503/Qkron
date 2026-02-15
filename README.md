# QKron

Industry-Grade Task Scheduling and Execution System built with FastAPI.

## Features

### Backend (FastAPI)
- **Task Management**: Create, read, update, delete tasks with full CRUD operations
- **Flexible Scheduling**: Support for cron expressions and interval-based scheduling
- **Async Execution**: High-performance asynchronous task execution engine
- **PostgreSQL Database**: Persistent storage with SQLAlchemy 2.0 async ORM
- **Security**: JWT authentication with role-based access control
- **API-First**: RESTful API with OpenAPI documentation
- **Task Dependencies**: Define dependencies between tasks
- **Notification System**: Email, SMS (Twilio), and Webhook notifications

### Frontend (React + TypeScript)
- **Modern UI**: React 19 with TypeScript and Tailwind CSS
- **Dashboard**: Overview with task statistics and recent activity
- **Task Management**: Visual interface for creating and managing scheduled tasks
- **Notification Configuration**: Configure and test email, SMS, and webhook notifications
- **User Management**: Admin interface for user management
- **Responsive Design**: Works on desktop and mobile devices
- **Toast Notifications**: Real-time feedback for user actions

## Prerequisites

Before running QKron, ensure you have the following installed:

- **Python 3.11+** - [Download here](https://www.python.org/downloads/) (Python 3.12 recommended)
- **pip** or **uv** - Python package installer
- **PostgreSQL 13+** - [Download here](https://www.postgresql.org/download/) or use a cloud provider (e.g., Neon, AWS RDS)
- **Redis** (optional) - For caching and rate limiting

> **Note:** If you have multiple Python versions, you can create a virtual environment with Python 3.12 using:
> ```bash
> python3.12 -m venv venv
> ```

## Installation & Setup

### Method 1: Using pip (Recommended for beginners)

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
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

> **Troubleshooting:** If `python3.12` is not found, install Python 3.12 from [python.org](https://www.python.org/downloads/) or use Homebrew: `brew install python@3.12`

#### Step 3: Install Dependencies

```bash
# Install all dependencies
pip install -r requirements.txt
```

#### Step 4: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your database credentials
# For local PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://taskmaster:taskmaster@localhost:5432/taskmaster

# For cloud PostgreSQL (e.g., AWS RDS, Google Cloud SQL, Azure, Neon):
# DATABASE_URL=postgresql+asyncpg://user:password@your-db-host:5432/taskmaster
```

#### Step 5: Run Database Migrations

```bash
# Run database migrations to create tables
alembic upgrade head
```

#### Step 6: Run the Application

```bash
# Start the FastAPI application
uvicorn taskmaster.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: **http://localhost:8000**

---

### Method 2: Using uv (Faster installation)

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
# Install all dependencies including dev and test
uv pip install -e ".[dev,test]"
```

#### Step 4: Start Application

```bash
uvicorn taskmaster.main:app --reload
```

---

### Method 3: Using Docker (Easiest method)

#### Step 1: Install Docker and Docker Compose

- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

#### Step 2: Clone Repository

```bash
git clone <repository-url>
cd QKron
```

#### Step 3: Start the Application

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the service
docker-compose down
```

#### Step 4: Access the API

- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Frontend Setup (React + TypeScript)

QKron includes a modern React frontend with TypeScript, Tailwind CSS, and Vite.

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js

### Installation

#### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your API URL
# For local backend:
VITE_API_URL=http://localhost:8000/api/v1

# For production backend:
VITE_API_URL=https://your-api-domain.com/api/v1
```

> **Important**: The environment variable must start with `VITE_` to be accessible in Vite. The default API URL is `http://localhost:8000/api/v1`.

#### Step 4: Run the Development Server

```bash
npm run dev
```

The frontend will be available at: **http://localhost:5173**

#### Step 5: Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Frontend Features

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API requests
- **Radix UI** components
- **Lucide React** icons
- **Toast Notifications**
- **Responsive Design**

### Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User authentication |
| Dashboard | `/` | Overview with task statistics |
| Tasks | `/tasks` | Task list with CRUD operations |
| Task Detail | `/tasks/:id` | Task details and executions |
| Create Task | `/tasks/new` | Create new scheduled task |
| Edit Task | `/tasks/:id/edit` | Edit existing task |
| Notifications | `/notifications` | Notification configs and logs |
| Users | `/users` | User management (admin only) |

### Frontend Architecture

```
src/
├── components/
│   ├── layout/       # Layout, Header, Footer
│   └── ui/           # Reusable UI components
├── contexts/         # React contexts (Auth, Toast)
├── pages/            # Page components
├── services/         # API service layer
├── types/            # TypeScript interfaces
├── App.tsx           # Main app with routes
└── main.tsx          # Entry point
```

### Running Both Frontend and Backend

#### Option 1: Run Separately

```bash
# Terminal 1: Backend
cd /path/to/QKron
uvicorn taskmaster.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173

#### Option 2: Production Build with Reverse Proxy

Deploy the frontend `dist/` folder alongside the backend and configure a reverse proxy (Nginx, Caddy) to route API requests to the backend.

---

## API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Quick Start Guide

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myuser",
    "password": "securepassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=myuser&password=securepassword123"
```

Save the `access_token` from the response for subsequent requests.

### 3. Create a Scheduled Task (Cron)

```bash
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

### 4. Create an Interval Task

```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Health Check",
    "command": "curl http://localhost:8000/health",
    "schedule_type": "interval",
    "schedule": "5m",
    "timeout": 30
  }'
```

### 5. Execute Task Immediately

```bash
curl -X POST http://localhost:8000/api/v1/tasks/{task_id}/execute \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. List All Tasks

```bash
curl http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Get Task Executions

```bash
curl http://localhost:8000/api/v1/tasks/{task_id}/executions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Schedule Format

The `schedule` field accepts two types of schedules depending on the `schedule_type`:

### Cron Expression (schedule_type: "cron")
Standard cron format: `minute hour day month weekday`

| Field | Allowed Values | Special Characters |
|-------|---------------|-------------------|
| Minute | 0-59 | * , - / |
| Hour | 0-23 | * , - / |
| Day | 1-31 | * , - / |
| Month | 1-12 | * , - / |
| Weekday | 0-6 (Sun-Sat) | * , - / |

**Common Examples:**
- `0 2 * * *` - Daily at 2:00 AM
- `*/5 * * * *` - Every 5 minutes
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on the 1st at midnight
- `0 9 * * 1-5` - Weekdays at 9:00 AM
- `30 4 * * *` - Daily at 4:30 AM
- `0 */6 * * *` - Every 6 hours

**Useful Tools:**
- [Crontab Guru](https://crontab.guru/) - Online cron expression editor
- [Cron job formula](https://cronjob.xyz/) - Generate cron expressions

### Interval Format (schedule_type: "interval")
Simple interval notation: `<number><unit>`

| Unit | Description |
|------|-------------|
| `s` | seconds |
| `m` | minutes |
| `h` | hours |
| `d` | days |

**Examples:**
- `30s` - Every 30 seconds
- `5m` - Every 5 minutes
- `15m` - Every 15 minutes
- `30m` - Every 30 minutes
- `1h` - Every hour
- `2h` - Every 2 hours
- `6h` - Every 6 hours
- `1d` - Every day

### Quick Reference

```json
// Cron task
{
  "schedule_type": "cron",
  "schedule": "0 2 * * *",  // Daily at 2 AM
  "name": "Daily Backup",
  "command": "python backup.py"
}

// Interval task
{
  "schedule_type": "interval",
  "schedule": "5m",  // Every 5 minutes
  "name": "Health Check",
  "command": "curl http://localhost:8000/health"
}
```

## Task Dependencies

QKron supports defining dependencies between tasks. A task with dependencies will only execute after all its dependency tasks have completed successfully.

### Format

The `dependencies` field accepts a JSON array of task UUIDs:

```json
{
  "dependencies": ["c5bb0143-c49f-4107-9b9c-cfe40fcfb51d", "another-task-uuid"]
}
```

### How It Works

1. **Storage**: Dependencies are stored as a JSON array in the `tasks.dependencies` column
2. **Validation**: Before executing a task, the scheduler checks if all dependency tasks:
   - Exist in the database
   - Have completed successfully (status = "success")
3. **Execution**: If dependencies are not satisfied, the task is skipped with a warning

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

**Update task dependencies:**
```bash
curl -X PUT http://localhost:8000/api/v1/tasks/{task_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dependencies": ["new-dependency-uuid"]
  }'
```

### Behavior

| Dependency Status | Task Behavior |
|------------------|---------------|
| All satisfied (success) | Task executes normally |
| Any failed | Task is skipped |
| Any pending/running | Task waits for completion |
| Any missing | Task fails with error |

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=taskmaster --cov-report=html

# Run specific test file
pytest tests/test_tasks.py -v

# Run with markers
pytest -m unit
pytest -m integration
```

### Code Quality

```bash
# Format code with Black
black taskmaster tests

# Lint with Ruff
ruff check taskmaster tests --fix

# Type checking with mypy
mypy taskmaster

# Run all pre-commit hooks
pre-commit run --all-files
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application
APP_NAME=QKron
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Security (Generate a secure key for production)
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
# Email/SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
EMAIL_FROM=QKron <noreply@taskmaster.com>

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Database Configuration

#### Local PostgreSQL

1. Install PostgreSQL locally or use Docker:
```bash
docker run -d \
  --name taskmaster-db \
  -e POSTGRES_USER=taskmaster \
  -e POSTGRES_PASSWORD=taskmaster \
  -e POSTGRES_DB=taskmaster \
  -p 5432:5432 \
  postgres:15-alpine
```

2. Set the DATABASE_URL in your .env file:
```env
DATABASE_URL=postgresql+asyncpg://taskmaster:taskmaster@localhost:5432/taskmaster
```

#### Cloud PostgreSQL (Neon, AWS RDS, Google Cloud SQL, Azure)

1. Create a PostgreSQL instance in your cloud provider
2. Get the connection details (host, port, username, password)
3. Set the DATABASE_URL in your .env file:
```env
# Neon example:
DATABASE_URL=postgresql+asyncpg://user:password@your-neon-host.neon.tech/taskmaster

# AWS RDS example:
DATABASE_URL=postgresql+asyncpg://user:password@your-rds-endpoint.amazonaws.com:5432/taskmaster
```

**Note**: For cloud databases, you may need to:
- Allow connections from your IP address
- Use SSL certificates (add `?ssl=require` to the URL)
- Configure VPC/security groups

### Generating a Secure Secret Key

```bash
# Generate a secure random key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Troubleshooting

### Common Issues

#### 1. "command not found: uvicorn"
Make sure you have activated the virtual environment:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. "TypeError: unsupported operand type(s) for |: 'str' and 'NoneType'"
This is a Python version issue. Make sure you're using Python 3.11+:
```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. "Address already in use"
Another process is using port 8000. Kill it or use a different port:
```bash
lsof -i :8000 | grep -v PID | awk '{print $2}' | xargs kill -9 2>/dev/null
# Or use a different port:
uvicorn taskmaster.main:app --port 8001
```

#### 4. Database connection errors
- Ensure PostgreSQL is running
- Check your DATABASE_URL in .env
- For cloud databases, ensure your IP is whitelisted

#### 5. Database schema errors ("column X does not exist")
Run database migrations:
```bash
alembic upgrade head
```

If tables don't exist, create them:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

#### 6. Redis connection errors (optional)
If you don't need Redis, you can ignore this. Otherwise, install and run Redis or use a cloud Redis service.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client Apps   │────▶│   API Gateway   │────▶│  Task Master    │
│   (Web/Mobile)  │     │    (FastAPI)    │     │    (FastAPI)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
         ┌────────────────┬────────────────┬──────────────┘
         ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  Scheduler   │  │   Executor   │
│  Database    │  │  (APSched)   │  │  (Async)     │
│              │  │              │  │              │
│ - users      │  │ - Cron       │  │ - Subprocess │
│ - tasks      │  │ - Interval   │  │ - Timeout    │
│ - executions │  │ - Jobs       │  │ - Concurrent │
└──────────────┘  └──────────────┘  └──────────────┘
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info

### Tasks
- `GET /api/v1/tasks` - List all tasks (paginated)
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/{id}` - Get task by ID
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `POST /api/v1/tasks/{id}/execute` - Execute task immediately
- `GET /api/v1/tasks/{id}/executions` - List task executions
- `POST /api/v1/tasks/{id}/pause` - Pause scheduled task
- `POST /api/v1/tasks/{id}/resume` - Resume paused task

### Users
- `POST /api/v1/users` - Create new user (superuser only)
- `GET /api/v1/users` - List users (superuser only)
- `GET /api/v1/users/{id}` - Get user by ID
- `DELETE /api/v1/users/{id}` - Delete user (superuser only)

### Notifications
- `POST /api/v1/notifications/configs` - Create notification configuration
- `GET /api/v1/notifications/configs` - List notification configurations
- `GET /api/v1/notifications/configs/{id}` - Get notification configuration
- `DELETE /api/v1/notifications/configs/{id}` - Delete notification configuration
- `GET /api/v1/notifications/logs` - List notification logs
- `POST /api/v1/notifications/test/{channel}` - Send test notification

### Health & Monitoring
- `GET /health` - Health check
- `GET /ready` - Readiness check (Kubernetes)
- `GET /live` - Liveness check (Kubernetes)

## Notification System

QKron supports multiple notification channels to alert users about task status changes.

### Supported Channels

1. **Email** (SMTP) - Send email notifications
2. **Webhook** - POST to custom HTTP endpoints
3. **SMS** (Twilio) - Send SMS messages

### Configuration

Add notification settings to your `.env` file:

```env
# Email (SMTP) Configuration
# For Gmail: Use an App Password instead of your regular password
# Generate at: https://support.google.com/accounts/answer/185833
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
EMAIL_FROM=QKron <noreply@taskmaster.com>

# For other SMTP providers (Outlook, Yahoo, custom SMTP servers):
# SMTP_HOST=smtp.outlook.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@outlook.com
# SMTP_PASSWORD=your-password
# SMTP_USE_TLS=true

# SMS (Twilio) Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

> **Note:** For Gmail, you need to enable 2-Factor Authentication and generate an App Password:
> 1. Go to Google Account > Security
> 2. Enable 2-Step Verification
> 3. Go to App Passwords (search for "app password" in settings)
> 4. Generate a new app password for "Mail"

### Creating Notification Configurations

#### Email Notification
```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "email",
    "config": {
      "recipient": "user@example.com"
    },
    "on_success": false,
    "on_failure": true,
    "on_start": false
  }'
```

#### Webhook Notification
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

#### SMS Notification
```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "sms",
    "config": {
      "recipient": "+1234567890"
    },
    "on_failure": true
  }'
```

### Task-Specific Notifications

You can configure notifications for specific tasks by including the `task_id`:

```bash
curl -X POST http://localhost:8000/api/v1/notifications/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "email",
    "task_id": "your-task-id",
    "config": {
      "recipient": "user@example.com"
    },
    "on_failure": true
  }'
```

### Testing Notifications

Test your notification configuration:

```bash
curl -X POST "http://localhost:8000/api/v1/notifications/test/email?recipient=user@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

#### Module Not Found Error
```
ModuleNotFoundError: No module named 'taskmaster'
```
**Solution**: Install in editable mode.

```bash
pip install -e .
# or
uv pip install -e .
```

#### Port Already in Use
```
Error: [Errno 48] Address already in use
```
**Solution**: Kill process on port 8000 or use different port.

```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn taskmaster.main:app --port 8001
```

#### Permission Denied (Windows)
```
PermissionError: [WinError 5] Access is denied
```
**Solution**: Run command prompt as administrator or check file permissions.

## Production Deployment

### Using Docker Compose

```bash
# Set environment to production
export ENVIRONMENT=production

# Start services
docker-compose up -d
```

### Security Checklist

- [ ] Change default `SECRET_KEY`
- [ ] Use strong passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS origins properly
- [ ] Set up log rotation
- [ ] Configure firewall rules
- [ ] Use environment-specific configuration

## Future Enhancements

The following features are planned for future releases:

- **Caching Layer**: Redis for improved performance
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **Task Queue**: Background job processing with Celery
- **Webhook Notifications**: Real-time task event notifications
- **Distributed Execution**: Multi-node task execution support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install development dependencies (`pip install -r requirements.txt`)
4. Make your changes
5. Run tests (`pytest`)
6. Run linting (`ruff check . --fix`)
7. Commit changes (`git commit -m 'Add amazing feature'`)
8. Push to branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Documentation: https://taskmaster.readthedocs.io
- Issues: https://github.com/taskmaster/taskmaster/issues
- Discussions: https://github.com/taskmaster/taskmaster/discussions

---

**Made with ❤️ using FastAPI and Python**
