# SnapBudget

SnapBudget is an AI-powered financial tracker.

## Prerequisites

Make sure you have the following installed on your machine:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Setup

Before running the application, you need to set up the environment variables for both the frontend and backend.

1. **Backend Environment Variables**
   Navigate to the `backend/` directory and copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in the necessary values in `backend/.env`.

2. **Frontend Environment Variables**
   Navigate to the `frontend/` directory and copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Fill in the necessary values in `frontend/.env`.

*(Note: The database configuration inside `docker-compose.yml` is used for connecting Postgres and Redis within the Docker network).*

## Running the Project

The easiest way to run the entire application (Frontend, Backend, PostgreSQL, and Redis) is by using Docker Compose.

1. Open your terminal at the root directory of the project.
2. Run the following command:
   ```bash
   docker compose up --build
   ```

## Services Access

Once Docker finishes building and starting the containers, the services will be available at:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **PostgreSQL**: `localhost:5432` 
- **Redis**: `localhost:6379`

## Stopping the Services

To stop all the running containers, press `Ctrl+C` in the terminal where Docker Compose is running, or run the following command in a new terminal at the root project directory:

```bash
docker compose down
```
