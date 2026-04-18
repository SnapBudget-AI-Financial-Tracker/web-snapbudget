# SnapBudget 💰

SnapBudget is a modern, AI-powered financial tracker designed to help you master your money with ease. It features intelligent tracking, predictive budgeting, and a sleek, premium user interface.

## 🚀 Quick Start

### 1. Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for containerized environment)
- [PostgreSQL](https://www.postgresql.org/) (if running locally without Docker)

### 2. Cloning the Repository
```bash
git clone https://github.com/your-username/snapbudget.git
cd snapbudget
```

---

## 🛠️ Project Setup

The project is split into a **Frontend** (React + Vite) and a **Backend** (Node.js + Prisma).

### 1. Backend Configuration
Navigate to the backend directory:
```bash
cd backend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```
Fill in your `DATABASE_URL`, `JWT_SECRET`, and other credentials in the `.env` file.

**Setup Database (Prisma):**
```bash
npx prisma generate
npx prisma db push
```

### 2. Frontend Configuration
Navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` matches your backend URL (default: `http://localhost:5000`).

---

## 🏃 Running the Project

### Option A: Local Development (Recommended for Dev)
Run the backend and frontend in separate terminals.

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Option B: Docker Compose (Full Stack)
Run the entire stack (Frontend, Backend, Database, Redis) with one command from the project root:
```bash
docker compose up --build
```

---

## 🏗️ Architecture & Tools

- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express, Prisma ORM, JWT Authentication.
- **Database**: PostgreSQL (Primary), Redis (Caching/Sessions).
- **Icons**: Lucide React for consistent, high-quality iconography.
- **Styling**: Vanilla CSS + Tailwind for a premium look and feel.

## 🔑 Environment Variables

### Backend (`/backend/.env`)
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key for JWT signing.
- `GOOGLE_CLIENT_ID`: (Optional) For Google OAuth integration.

### Frontend (`/frontend/.env`)
- `VITE_API_BASE_URL`: The URL of your backend API.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
