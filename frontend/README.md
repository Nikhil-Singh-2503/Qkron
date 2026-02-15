# QKron Frontend

Modern React frontend for QKron - Industry-Grade Task Scheduling and Execution System.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Radix UI** - Component primitives

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
```

> **Important**: Environment variables must start with `VITE_` to be accessible in Vite.

## Development

```bash
# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # Layout, Header, Footer
│   └── ui/           # Reusable UI components
├── contexts/         # React contexts (Auth, Toast)
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── NotificationsPage.tsx
│   ├── TaskDetailPage.tsx
│   ├── TaskFormPage.tsx
│   ├── TasksPage.tsx
│   └── UsersPage.tsx
├── services/         # API service layer
│   └── api.ts
├── types/            # TypeScript interfaces
│   └── index.ts
├── App.tsx           # Main app with routes
└── main.tsx          # Entry point
```

## API Integration

The frontend communicates with the FastAPI backend. Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

For production, point to your deployed backend URL.

## License

MIT - See parent project LICENSE.
