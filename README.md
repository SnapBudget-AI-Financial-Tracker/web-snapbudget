# SnapBudget 💰

AI-powered financial tracker untuk mahasiswa dan generasi muda Indonesia. Cukup foto struk belanjaan — AI akan mengekstrak, mengkategorikan, dan menganalisis pengeluaranmu secara otomatis.

**Stack:** React + Vite + Tailwind CSS v4 · Node.js + Express + Prisma · PostgreSQL + Redis · Docker

---

## 📋 Daftar Isi

- [Prasyarat](#-prasyarat)
- [Clone Repository](#-clone-repository)
- [Setup Environment](#-setup-environment)
- [Menjalankan Proyek](#-menjalankan-proyek)
  - [Opsi A: Docker Compose](#opsi-a-docker-compose-direkomendasikan)
  - [Opsi B: Local Development](#opsi-b-local-development)
  - [AI Service (Optional)](#4-jalankan-ai-service-optional---untuk-development-lokal)
- [Struktur Proyek](#-struktur-proyek)
- [Environment Variables](#-environment-variables)
- [AI Service Architecture](#-ai-service-architecture)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prasyarat

Pastikan sudah terinstall:

| Tool | Versi Minimum | Keterangan |
|------|--------------|------------|
| [Node.js](https://nodejs.org/) | v18.x | Runtime JavaScript |
| [npm](https://www.npmjs.com/) | v9.x | Package manager (included with Node.js) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | v24.x | Untuk menjalankan PostgreSQL & Redis |
| [Git](https://git-scm.com/) | v2.x | Version control |
| [Python](https://www.python.org/) | v3.10+ | (Optional) Untuk menjalankan AI service lokal |

> **Catatan:** 
> - PostgreSQL dan Redis **tidak perlu diinstall manual** jika menggunakan Docker.
> - Python hanya diperlukan jika ingin menjalankan AI service secara lokal. Secara default, aplikasi menggunakan AI service yang sudah di-deploy.

---

## 📦 Clone Repository

```bash
git clone https://github.com/your-username/snapbudget.git
cd snapbudget
```

---

## ⚙️ Setup Environment

### 1. Backend Environment

Masuk ke direktori backend dan copy file environment example:

```bash
cd backend
cp .env.example .env
```

Edit file `backend/.env` dan sesuaikan konfigurasi:

```env
# App Configuration
PORT=5000

# Database Configuration
# Untuk Docker: gunakan 'postgres' sebagai host
# Untuk Local: gunakan 'localhost' sebagai host
DATABASE_URL=postgresql://snapbudget_user:password@localhost:5432/snapbudget

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://ai-service:8000
```

> **Generate JWT Secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Install dependencies backend:

```bash
npm install
```

### 2. Frontend Environment

Masuk ke direktori frontend dan copy file environment example:

```bash
cd ../frontend
cp .env.example .env
```

Edit file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Install dependencies frontend:

```bash
npm install
```

### 3. AI Service Environment (Optional - untuk development lokal)

> **Catatan:** AI Service sudah di-deploy di Modal.run. Section ini hanya diperlukan jika ingin menjalankan AI service secara lokal.

Masuk ke direktori AI:

```bash
cd ../backend/ai
```

Buat file `.env` di folder `backend/ai`:

```env
HF_TOKEN=your-huggingface-token-here
HF_REPO_ID=Rizal88/snapbudget-models
WEIGHTS_DIR=./weights
```

> **Mendapatkan HuggingFace Token:**
> 1. Buat akun di [HuggingFace](https://huggingface.co/)
> 2. Pergi ke Settings → Access Tokens
> 3. Create new token dengan read permission
> 4. Copy token ke `.env`

Install Python dependencies:

```bash
# Pastikan Python 3.10+ sudah terinstall
python --version

# Install dependencies
pip install -r requirements_ai.txt
```

---

## 🚀 Menjalankan Proyek

### Opsi A: Docker Compose (Direkomendasikan)

Cara termudah untuk menjalankan seluruh stack (Frontend, Backend, PostgreSQL, Redis) sekaligus.

#### 1. Jalankan semua services

Dari root direktori project:

```bash
docker compose up --build
```

> **Catatan:** Proses build pertama kali akan memakan waktu beberapa menit.

#### 2. Setup database

Setelah semua container berjalan, buka terminal baru dan jalankan migrasi database:

```bash
docker exec snapbudget-backend npx prisma generate
docker exec snapbudget-backend npx prisma db push
```

#### 3. Akses aplikasi

| Service | URL | Keterangan |
|---------|-----|------------|
| **Frontend** | http://localhost:5173 | React application |
| **Backend API** | http://localhost:5000 | Express REST API |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache & session store |

#### 4. Menghentikan services

```bash
# Menghentikan tanpa menghapus data
docker compose down

# Menghentikan dan menghapus semua data (database, cache)
docker compose down -v
```

#### 5. Melihat logs

```bash
# Semua services
docker compose logs -f

# Service tertentu
docker compose logs -f backend
docker compose logs -f frontend
```

---

### Opsi B: Local Development

Untuk development dengan hot-reload yang lebih cepat, jalankan backend dan frontend secara terpisah.

#### 1. Jalankan PostgreSQL dan Redis via Docker

```bash
docker compose up postgres redis -d
```

Verifikasi container berjalan:

```bash
docker compose ps
```

#### 2. Setup dan jalankan Backend

Buka terminal baru:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# Jalankan development server
npm run dev
```

Backend akan berjalan di **http://localhost:5000**

#### 3. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend

# Jalankan development server
npm run dev
```

Frontend akan berjalan di **http://localhost:5173**

#### 4. Jalankan AI Service (Optional - untuk development lokal)

> **Catatan:** Secara default, backend menggunakan AI service yang sudah di-deploy di Modal.run. Langkah ini hanya diperlukan jika ingin menjalankan AI service secara lokal.

Buka terminal baru:

```bash
cd backend/ai
pip install -r requirements_ai.txt
uvicorn inference_server:app --host 0.0.0.0 --port 8000 --reload
```

AI Service akan berjalan di **http://localhost:8000**

Kemudian update `backend/.env` untuk menggunakan AI service lokal:

```env
AI_SERVICE_URL=http://localhost:8000
```

#### 5. Menghentikan services

- Tekan `Ctrl + C` di terminal backend dan frontend
- Stop Docker containers:
  ```bash
  docker compose down
  ```

---

## 🧪 Menjalankan Tests

### Frontend Tests

```bash
cd frontend

# Run tests once
npm test

# Run tests dengan coverage
npm run test -- --coverage

# Run tests dalam watch mode (development)
npx vitest
```

---

## 📁 Struktur Proyek

```
snapbudget/
├── frontend/                 # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   └── onboarding/  # Onboarding flow components
│   │   ├── pages/           # Page components (Dashboard, Analytics, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── context/         # React Context providers
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main app component
│   ├── public/              # Static assets
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── backend/                  # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware (auth, error handling)
│   │   ├── services/        # Business logic layer
│   │   ├── config/          # Configuration files
│   │   └── index.js         # Entry point
│   ├── ai/                  # AI Inference Service (Python)
│   │   ├── inference.py     # AI model inference logic
│   │   ├── inference_server.py  # FastAPI server
│   │   ├── requirements_ai.txt  # Python dependencies
│   │   ├── weights/         # AI model weights
│   │   └── .env             # AI service environment variables
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── scripts/             # Utility scripts
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── docker-compose.yml        # Docker services configuration
└── README.md                 # This file
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variabel | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `PORT` | Ya | `5000` | Port server backend |
| `DATABASE_URL` | Ya | - | PostgreSQL connection string |
| `REDIS_URL` | Ya | - | Redis connection string |
| `JWT_SECRET` | Ya | - | Secret key untuk signing JWT tokens |
| `JWT_EXPIRES_IN` | Tidak | `7d` | Durasi token (format: `7d`, `24h`, `60m`) |
| `AI_SERVICE_URL` | Ya | - | URL AI microservice untuk OCR struk |

**Contoh DATABASE_URL:**
- Docker: `postgresql://snapbudget_user:password@postgres:5432/snapbudget`
- Local: `postgresql://snapbudget_user:password@localhost:5432/snapbudget`

### Frontend (`frontend/.env`)

| Variabel | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `VITE_API_BASE_URL` | Ya | - | URL backend API (tanpa trailing slash) |

**Contoh:**
- Development: `http://localhost:5000`
- Production: `https://api.snapbudget.com`

### AI Service (`backend/ai/.env`) - Optional untuk local development

| Variabel | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `HF_TOKEN` | Ya | - | HuggingFace access token untuk download model |
| `HF_REPO_ID` | Ya | `Rizal88/snapbudget-models` | HuggingFace repository ID |
| `WEIGHTS_DIR` | Tidak | `./weights` | Direktori untuk menyimpan model weights |

**Catatan:** AI Service sudah di-deploy di Modal.run (`https://aprizal543i--snapbudget-ai-fastapi-app.modal.run`). Environment variables ini hanya diperlukan untuk development lokal.

---

## 🛠️ Troubleshooting

### Port sudah digunakan

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Atau gunakan npx
npx kill-port 5000
```

### Database connection error

**Cek apakah PostgreSQL container berjalan:**
```bash
docker compose ps
```

**Restart PostgreSQL:**
```bash
docker compose restart postgres
```

**Cek logs PostgreSQL:**
```bash
docker compose logs postgres
```

### Prisma client tidak ter-generate

```bash
cd backend
npx prisma generate
```

### Migration error

**Reset database (HATI-HATI: menghapus semua data):**
```bash
cd backend
npx prisma migrate reset
npx prisma db push
```

### Node modules bermasalah

**Backend:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Docker build error

**Rebuild tanpa cache:**
```bash
docker compose build --no-cache
docker compose up
```

**Hapus semua containers dan volumes:**
```bash
docker compose down -v
docker system prune -a
```

### Frontend tidak bisa connect ke backend

1. Pastikan backend berjalan di port yang benar
2. Cek `VITE_API_BASE_URL` di `frontend/.env`
3. Pastikan tidak ada CORS error di browser console
4. Restart frontend development server

### Redis connection error

**Cek Redis container:**
```bash
docker compose logs redis
```

**Test Redis connection:**
```bash
docker exec -it snapbudget-redis redis-cli ping
# Should return: PONG
```

### AI Service error (local development)

**Model tidak ter-download:**
```bash
cd backend/ai
# Pastikan HF_TOKEN sudah di-set di .env
python -c "from inference import download_models_from_hf; download_models_from_hf('Rizal88/snapbudget-models', 'YOUR_HF_TOKEN', './weights')"
```

**Python dependencies error:**
```bash
cd backend/ai
pip install --upgrade pip
pip install -r requirements_ai.txt
```

**Port 8000 sudah digunakan:**
```bash
# Jalankan di port lain
uvicorn inference_server:app --host 0.0.0.0 --port 8001 --reload

# Update backend/.env
AI_SERVICE_URL=http://localhost:8001
```

**CUDA/GPU error (jika menggunakan GPU):**
```bash
# Gunakan CPU version
pip uninstall torch torchvision
pip install torch==2.10.0 torchvision==0.25.0
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/google` | Google OAuth login |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Create transaction |
| POST | `/api/transactions/scan` | Upload receipt for OCR |
| DELETE | `/api/transactions/:id` | Delete transaction |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/budget` | Update budget settings |
| GET | `/api/user/dashboard` | Get dashboard data |

### AI Service Endpoints (Port 8000)

> **Catatan:** Endpoints ini digunakan oleh backend, bukan dipanggil langsung dari frontend.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check AI service health |
| POST | `/scan-struk` | OCR receipt image and predict |
| POST | `/prediksi` | Predict spending without image |

**Example `/scan-struk` request:**
```bash
curl -X POST http://localhost:8000/scan-struk \
  -F "file=@receipt.jpg" \
  -F "budget_bulanan=5000000" \
  -F "day_of_month=15" \
  -F "saldo_sisa=2000000"
```

---

## 🎯 Fitur Utama

- ✅ **Scan Struk Otomatis** - Upload foto struk, AI ekstrak data otomatis
- ✅ **Kategorisasi Cerdas** - AI mengkategorikan transaksi secara otomatis
- ✅ **Budget Tracking** - Monitor pengeluaran vs budget bulanan
- ✅ **Prediksi AI** - Prediksi pengeluaran 7 hari ke depan
- ✅ **Analytics Dashboard** - Visualisasi pengeluaran per kategori
- ✅ **Google OAuth** - Login mudah dengan akun Google
- ✅ **Responsive Design** - Optimal di desktop dan mobile

---

## 🤖 AI Service Architecture

SnapBudget menggunakan 3-head AI model untuk analisis pengeluaran:

### Head 1: Receipt OCR (Donut Transformer)
- Model: Fine-tuned Donut untuk CORD v2 dataset
- Fungsi: Ekstrak teks dari foto struk (store name, items, prices, total)
- Framework: PyTorch + Transformers

### Head 2: Spending Prediction (LSTM)
- Model: LSTM Neural Network
- Fungsi: Prediksi pengeluaran 7 hari ke depan per kategori
- Input: Historical spending patterns + day of month
- Framework: TensorFlow/Keras

### Head 3: Budget Recommendation (Classification)
- Model: Multi-class Neural Network
- Fungsi: Klasifikasi status budget (Aman/Hati-hati/Bahaya) + rekomendasi
- Input: Actual spending + predictions + budget + remaining balance
- Framework: TensorFlow/Keras

**Deployment:**
- Production: Modal.run (serverless GPU inference)
- Development: Local FastAPI server (CPU/GPU)

---

## 👥 Tim

Proyek Capstone — Coding Camp 2026 powered by DBS Foundation · Tim CC26-PSU098

| Nama | Role |
|------|------|
| Muhammad Rizky | Full-Stack Web Developer |
| Aprizal | AI Engineer |
| Cholid Muntaha | AI Engineer |
| Rifqi Surya Permana | Data Science |
| Aldi Zulfan Azhari | Data Science |

---

## 📄 Lisensi

MIT License — lihat file [LICENSE](LICENSE) untuk detail.

---

## 🤝 Contributing

Contributions, issues, dan feature requests sangat diterima!

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat [issue](https://github.com/your-username/snapbudget/issues) di repository ini.
