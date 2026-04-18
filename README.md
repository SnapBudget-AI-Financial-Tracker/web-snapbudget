# SnapBudget 💰

AI-powered financial tracker untuk mahasiswa dan generasi muda Indonesia. Cukup foto struk belanjaan — AI akan mengekstrak, mengkategorikan, dan menganalisis pengeluaranmu secara otomatis.

**Stack:** React + Vite + Tailwind CSS v4 · Node.js + Express + Prisma · PostgreSQL + Redis · Docker

---

## Prasyarat

Pastikan sudah terinstall:

| Tool | Versi Minimum | Keterangan |
|------|--------------|------------|
| [Node.js](https://nodejs.org/) | v18.x | Runtime JavaScript |
| [npm](https://www.npmjs.com/) | v9.x | Package manager |
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | v24.x | Untuk menjalankan PostgreSQL & Redis |
| [Git](https://git-scm.com/) | v2.x | Version control |

> PostgreSQL dan Redis **tidak perlu diinstall manual** jika menggunakan Docker.

---

## Clone Repository

```bash
git clone https://github.com/your-username/snapbudget.git
cd snapbudget
```

---

## Setup Environment

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Buka `backend/.env` dan isi variabel berikut:

```env
PORT=5000
DATABASE_URL=postgresql://snapbudget_user:password@localhost:5432/snapbudget
REDIS_URL=redis://localhost:6379
JWT_SECRET=ganti-dengan-secret-key-yang-kuat
JWT_EXPIRES_IN=7d
```

> Untuk `JWT_SECRET`, gunakan string acak yang panjang. Bisa generate dengan:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Install dependencies:

```bash
npm install
```

### 2. Frontend

```bash
cd ../frontend
cp .env.example .env
```

Buka `frontend/.env` — pastikan URL backend sudah sesuai:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Install dependencies:

```bash
npm install
```

---

## Menjalankan Proyek

### Opsi A — Docker Compose (Direkomendasikan)

Jalankan seluruh stack (Frontend, Backend, PostgreSQL, Redis) sekaligus dari root direktori:

```bash
docker compose up --build
```

Setelah container berjalan, jalankan migrasi database:

```bash
docker exec snapbudget-backend npx prisma db push
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Untuk menghentikan:

```bash
docker compose down
```

Untuk menghentikan dan menghapus data volume:

```bash
docker compose down -v
```

---

### Opsi B — Local Development

Jalankan PostgreSQL dan Redis via Docker (tanpa frontend/backend):

```bash
docker compose up postgres redis -d
```

Kemudian jalankan backend dan frontend di terminal terpisah.

**Terminal 1 — Backend:**

```bash
cd backend
npx prisma generate
npx prisma db push
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## Menjalankan Tests

```bash
cd frontend
npm test
```

---

## Struktur Proyek

```
snapbudget/
├── frontend/          # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── context/
│   └── .env.example
├── backend/           # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env.example
└── docker-compose.yml
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variabel | Wajib | Deskripsi |
|----------|-------|-----------|
| `PORT` | Ya | Port server (default: `5000`) |
| `DATABASE_URL` | Ya | PostgreSQL connection string |
| `REDIS_URL` | Ya | Redis connection string |
| `JWT_SECRET` | Ya | Secret key untuk signing JWT |
| `JWT_EXPIRES_IN` | Tidak | Durasi token (default: `7d`) |
| `AI_SERVICE_URL` | Tidak | URL AI microservice (default: `http://ai-service:8000`) |

### Frontend (`frontend/.env`)

| Variabel | Wajib | Deskripsi |
|----------|-------|-----------|
| `VITE_API_BASE_URL` | Ya | URL backend API (default: `http://localhost:5000`) |

---

## Troubleshooting

**Port sudah digunakan:**
```bash
# Cek proses yang menggunakan port 5000
npx kill-port 5000
```

**Database connection error:**
Pastikan container PostgreSQL sudah berjalan:
```bash
docker compose ps
```

**Prisma client tidak ter-generate:**
```bash
cd backend
npx prisma generate
```

**Node modules bermasalah:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Tim

Proyek Capstone — Coding Camp 2026 powered by DBS Foundation · Tim CC26-PSU098

| Nama | Role |
|------|------|
| Muhammad Rizky | Full-Stack Web Developer |
| Aprizal | AI Engineer |
| Cholid Muntaha | AI Engineer |
| Rifqi Surya Permana | Data Science |
| Aldi Zulfan Azhari | Data Science |

---

## Lisensi

MIT License — lihat file [LICENSE](LICENSE) untuk detail.
