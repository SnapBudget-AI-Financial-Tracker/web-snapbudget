# Dokumen Project Plan
## Coding Camp 2026 powered by DBS Foundation

| | |
|---|---|
| **ID Tim Capstone Project** | CC26-PSU098 |
| **Tema Capstone** | Revolusi Teknologi Keuangan (Fintech) untuk Generasi Muda |
| **Nama/Judul Proyek** | SnapBudget: AI-Powered Financial Tracker |

---

## Anggota Tim

| No | ID | Nama | Role | Status |
|---|---|---|---|---|
| 1 | CFCC960D6Y2839 | Reza Nurfachmi | Full-Stack Web Developer | Non Aktif |
| 2 | CFCC295D6Y2816 | Muhammad Rizky | Full-Stack Web Developer | Aktif |
| 3 | CACC559D6Y0450 | Aprizal | AI Engineer | Aktif |
| 4 | CACC229D6Y2570 | Cholid Muntaha | AI Engineer | Aktif |
| 5 | CDCC190D6Y2252 | Rifqi Surya Permana | Data Science | Aktif |
| 6 | CDCC220D6Y2702 | Aldi Zulfan Azhari | Data Science | Aktif |

---

## A. Ringkasan Eksekutif

### Problem Statement

Mahasiswa dan masyarakat umum memiliki disiplin tinggi dalam memantau kesehatan financial harian untuk mencapai kesejahteraan jangka panjang. Di era ekonomi digital, proses pencatatan keuangan seharusnya tidak lagi menjadi beban kognitif yang berat (*high cognitive load*), melainkan sebuah aktivitas otomatis yang akurat, real-time dan minim kesalahan manusia melalui pemanfaatan teknologi kecerdasan buatan (AI).

Faktanya, terdapat kesenjangan yang lebar antara akses teknologi keuangan dengan kemampuan manajemen praktis masyarakat:

- **Literasi Rendah pada Kelompok Muda**: Berdasarkan data SNLIK, indeks literasi keuangan pelajar/mahasiswa hanya sebesar 56.42%, jauh di bawah kelompok profesional.
- **Hambatan Teknis**: Sebanyak 77,5% masyarakat/UMKM tidak melakukan pencatatan keuangan yang baik karena persepsi bahwa akuntansi adalah hal yang rumit, menyita waktu dan membosankan.
- **Ketergantungan Ingatan**: Mayoritas responden hanya mengandalkan ingatan atau catatan manual yang tidak teratur, sehingga bukti fisik transaksi (struk) sering hilang sebelum sempat dicatat.

Dengan menggunakan kerangka 5W 1H, permasalahan ini dapat diuraikan sebagai berikut:

- **What**: Tidak ada alat yang mudah dan cepat untuk mencatat pengeluaran harian berbasis bukti transaksi (struk belanja).
- **When**: Setiap kali pengguna melakukan transaksi di toko, supermarket, restoran atau tempat belanja lainnya.
- **Where**: Seluruh platform digital yang dapat diakses melalui browser di smartphone maupun desktop.
- **Who**: Generasi muda usia 18-30 tahun yang ingin memulai kebiasaan mencatat keuangan.
- **Why**: Proses manual membutuhkan waktu dan niat yang kuat, sehingga kebanyakan orang menyerah sebelum terbiasa.
- **How**: Diperlukan solusi berbasis teknologi yang memungkinkan pengguna cukup memotret struk belanjaan dan sistem secara otomatis mengekstrak, mengkategorikan dan menganalisis pengeluaran.

---

### Research Questions

Berdasarkan problem statement diatas, proyek SnapBudget berusaha menjawab pertanyaan-pertanyaan riset berikut ini:

1. Seberapa akurat model Donut (*Document Understanding Transformer*) dalam mengestrak informasi terstruktur dari foto struk belanja di indonesia dan bagaimana cara meningkatkan performa model ketika menghadapi variasi format struk beragam?

2. Bagaimana arsitektur BiLSTM dengan mekanisme attention dapat mengklasifikasikan nama item pengeluaran ke dalam 8 kategori yang relevan dan seberapa efektif model tersebut ketika dilatih dengan dataset sintetis yang dihasilkan keyword rules?

3. Apakah model prediksi GRU yang di latih dengan data riwayat transaksi sintetis mampu menghasilkan estimasi pengeluaran 7 hari ke depan yang cukup akurat untuk memberikan peringatan dini kepada mahasiswa sebelum uang sakunya habis?

4. Bagaimana kombinasi antara rule-based projection dan model klasifikasi tabular (MLP) dapat menghasilkan rekomendasi keuangan (HEMAT, AMAN, WASPADA, BOROS, DARURAT) yang relevan dan dapat ditindaklanjuti oleh mahasiswa?

---

### Latar Belakang

Manajemen keuangan pribadi merupakan keterampilan fundamental yang menentukan stabilitas ekonomi individu dan ketahanan masyarakat secara luas. Di indonesia, transformasi digital telah membuka akses luas terhadap berbagai produk keuangan. Namun, data Survei Literasi dan Inklusi Keuangan (SNLIK) 2025 menunjukkan adanya paradoks — indeks inklusi keuangan telah mencapai 80,51%, namun indeks literasi dan keuangan baru menyentuh 66,46%. Kesenjangan ini menunjukkan bahwa banyak masyarakat memiliki akses ke layanan keuangan digital (seperti e-wallet dan pinjaman digital) namun belum memiliki kemampuan yang memadai untuk mengelola dan mencatat penggunaannya secara bijak.

Kelompok mahasiswa dan masyarakat berpendidikan menengah ke bawah merupakan segmen yang paling rentan secara finansial. Literasi keuangan pelajar/mahasiswa tercatat hanya sebesar 56,42%, jauh tertinggal dibandingkan kelompok profesional. Kelompok ini sering kali terjepit di antara pendapatan yang terbatas (uang saku atau upah harian) dan godaan gaya hidup konsumtif yang dipicu oleh fenomena *Fear of Missing Out* (FOMO) serta belanja impulsif (*impulsive buying*).

*SnapBudget: AI-Powered Financial Tracker* hadir sebagai solusi yang menggabungkan teknologi AI multimodal, Donut (*Document Understanding Transformer*) untuk membaca struk dari foto, model klasifikasi *BiLSTM* untuk mengkategorikan pengeluaran, model prediksi *MLP* dan *GRU* untuk memperkirakan arus kas ke depan, serta model rekomendasi untuk memberikan saran keuangan yang *actionable*.

---

### Alasan Memilih Proyek

1. Masalah yang dialami hampir semua kalangan — mahasiswa pernah kehabisan uang saku tanpa tahu kemana uangnya pergi. Ini membuat produk ini berpotensi besar memiliki banyak pengguna yang benar-benar merasakan manfaatnya.
2. Proyek ini mengintegrasikan Frontend, Backend, AI dan Data Science secara nyata dan bermakna sesuai dengan komposisi tim yang terdiri dari tiga learning path berbeda.
3. *SnapBudget* menggantikan proses yang benar-benar menyulitkan (input manual satu per satu) dengan otomasi cerdas — cukup foto struk, sisanya dikerjakan oleh AI.
4. Produk ini dapat terus berkembang pasca capstone dengan menambahkan fitur tabungan otomatis, pengingat budget, hingga saran investasi sederhana untuk mahasiswa.
5. Struk makanan dan minuman pada dataset CORD v2 sangat relavan dengan kebiasaan belanja mahasiswa sehari-hari, sehingga pipeline AI yang dibangun memiliki relevansi yang tinggi terhadap target pengguna.

---

## B. Cakupan Proyek dan Hasil Kerja

### Batasan Proyek

#### In Scope (yang dikerjakan)

- Pengembangan pipeline AI multimodal menggunakan Donut (*Document Understanding Transformer*) untuk membaca teks dari foto struk, menghasilkan JSON terstruktur berisi nama item, harga, dan total transaksi.
- Pelatihan model klasifikasi pengeluaran Head 1C (arsitektur *BiLSTM + Attention + Residual*) untuk mengkategorikan nama item struk ke 8 kategori pengeluaran mahasiswa: makanan, minuman, transportasi, belanja, tagihan, hiburan, kesehatan dan lain-lain.
- Pelatihan model prediksi arus kas Head 2 (arsitektur *MLP + GRU*) untuk memprediksi pengeluaran per kategori selama 7 hari ke depan berdasarkan riwayat transaksi 30 hari terakhir.
- Pelatihan model rekomendasi keuangan Head 3 (arsitektur *MLP* tabular dengan dual output) yang menghasilkan 5 level rekomendasi, yaitu HEMAT, AMAN, WASPADA, BOROS, DARURAT, disertai tips tindakan spesifik.
- Pengembangan REST API backend dengan integrasi model AI dan database.
- Penyediaan opsi input manual jika foto struk tidak dapat dibaca oleh model Donut.

#### Out of Scope (Tidak Dikerjakan pada MVP)

- Sinkronisasi otomatis dengan saldo bank, e-wallet, atau rekening digital.
- Sistem hanya melayani transaksi dalam mata uang Rupiah.
- Fitur berbagi laporan keuangan antar pengguna atau sistem point/reward.
- Integrasi dengan platform e-commerce atau marketplace.
- Pemrosesan struk fisik yang dicetak dengan printer dot-matrix berkualitas sangat rendah.

---

### Milestone Proyek

| Minggu | Periode | Target Deliverable | PIC |
|---|---|---|---|
| **Week 1** | 20 Apr - 26 Apr | Setup environment dan repository; Fine-tuning Donut dengan CORD v2 (decoder only); Training Head 1C BiLSTM + Attention; Desain database schema dan API endpoint; EDA dataset CORD v2 dan dataset sintetis. | AI Engineer, Data Science, Full-Stack |
| **Week 2** | 27 Apr - 3 Mei | Integrasi pipeline Donut + Head 1C (foto > JSON > kategori); Training Head 2 MLP+GRU prediksi 7 hari; Pengembangan UI halaman Dashboard dan Scan Struk; Visualisasi pola pengeluaran (EDA Data Science). | AI Engineer, Data Science, Full-Stack |
| **Week 3** | 4 Mei - 10 Mei | Training Head 3 FinancialRecommender; integrasi seluruh pipeline AI ke REST API backend; Pengembangan UI halaman Prediksi, Rekomendasi, Laporan; Validasi end-to-end dengan struk nyata. | AI Engineer, Data Science, Full-Stack |
| **Week 4** | 11 Mei - 17 Mei | Testing end-to-end pipeline dengan berbagai jenis struk; Bug fixing dan optimasi performa model; Deployment (Vercel + Railway/Render); Penyusunan dokumentasi teknis. | AI Engineer, Data Science, Full-Stack |
| **Week 5** | 18 Mei - 24 Mei | User acceptance testing (UAT); Finalisasi presentasi dan demo video; Penyerahan proyek dan dokumentasi final; Persiapan sesi tanya jawab capstone. | AI Engineer, Data Science, Full-Stack |

---

## C. Jadwal Pengerjaan

Jadwal pengerjaan proyek dirancang selama 5 minggu dengan pendekatan sprint mingguan. Setiap awal minggu dilakukan sprint planning untuk menetapkan target, dan setiap akhir minggu dilakukan sprint review untuk mengevaluasi progres. Daily standup dilakukan setiap hari kerja melalui platform komunikasi tim, yaitu Discord dan Google Meet.

| Aktivitas | W1 | W2 | W3 | W4 | W5 |
|---|:---:|:---:|:---:|:---:|:---:|
| Setup Environment & Repository | ✅ | | | | |
| Fine-tuning Donut dengan Dataset CORD V2 | ✅ | | | | |
| Training Head 1C (BiLSTM + Attention) | ✅ | | | | |
| Training Head 2 (MLP + GRU) | | ✅ | | | |
| Training Head 3 (Financial Recommender) | | | ✅ | | |
| Integrasi Pipeline AI ke Backend | | ✅ | ✅ | | |
| Pengembangan Frontend Dashboard | | ✅ | ✅ | | |
| EDA & Visualisasi Data Science | ✅ | ✅ | | | |
| Testing & Bug Fixing | | | | ✅ | |
| Deployment | | | | ✅ | ✅ |
| UAT & Finalisasi Dokumen | | | | | ✅ |

---

## D. Uraian Rencana Penugasan / Job Desk Setiap Learning Path

Tim Capstone terdiri dari tiga learning path yang berbeda (AI Engineer, Data Science, dan Full Stack Web Developer), pembagian tugas dilakukan berdasarkan keahlian masing-masing learning path dengan tetap mengutamakan kolaborasi lintas tim.

### AI Engineer
**Anggota:** Aprizal, Cholid Muntaha

- Implementasi Donut untuk parsing struk foto ke JSON
- Training Head 1C: BiLSTM + Attention + Residual, FocalLossSmooth, GradientTape
- Training Head 2: MLP Encoder + StackedGRU, WeightMAELoss, prediksi 7 hari
- Training Head 3: FinancialRecommender MLP, CombinedFocalLoss, dual output
- Membuat API endpoint untuk inference semua model
- Menulis notebook capstone sesuai standar (subclassing, GradientTape, custom loss)

### Data Science
**Anggota:** Rifqi Surya Permana, Aldi Zulfan Azhari

- Mengumpulkan dataset CORD v2 dari Hugging Face dan men-generate dataset sintetis untuk Head 1C, Head 2, dan Head 3
- Mengevaluasi kualitas distribusi data sintetis terhadap referensi BPS Indonesia
- Membersihkan dan mempersiapkan data sebelum masuk ke tahap training model
- Mendefinisikan pertanyaan bisnis yang terukur: seberapa besar penghematan waktu pencatatan dan peningkatan disiplin keuangan yang dihasilkan oleh SnapBudget dibandingkan pencatatan manual
- Melakukan EDA pada dataset CORD v2 dan dataset sintetis
- Membuat visualisasi data EDA: wordcloud nama item per kategori, heatmap distribusi pengeluaran per hari, confusion matrix per model, f1_score per kelas
- Mengembangkan dashboard interaktif menggunakan Streamlit untuk menampilkan insight pola pengeluaran mahasiswa dan kesimpulan hasil analisis model
- Memastikan data sudah siap diproses oleh model dan membuat Data Dictionary untuk setiap dataset (CORD v2, sintetis Head 1C, Head 2, Head 3)

### Full Stack Web Developer
**Anggota:** Muhammad Rizky

- Pengembangan frontend React.js: halaman upload struk, dashboard, laporan
- Integrasi frontend dengan FastAPI backend melalui REST API
- Pengembangan backend REST API: autentikasi JWT, manajemen user, riwayat transaksi
- Setup database PostgreSQL + Redis untuk caching hasil OCR
- Deployment: frontend ke Vercel, backend ke Railway/Render
- Implementasi fitur chatbot AI (Asisten Keuangan) di halaman dashboard
- UI/UX optimization untuk pengalaman upload foto yang cepat dan intuitif

---

## E. Sumber Daya Proyek

### Dataset

| Dataset | Sumber | Fungsi |
|---|---|---|
| CORD v2 (naver-clova-ix/cord-v2) | Hugging Face Dataset | Dataset struk restoran Asia Tenggara untuk fine-tuning Donut. Berisi 800 sampel training dan 100 validasi dengan anotasi JSON lengkap berformat menu, sub_total, dan total. |
| Dataset Sintetis Head 1C (9.600 sampel) | Generate oleh AI (Claude) programatik dari keyword rules | Dataset teks nama item pengeluaran mahasiswa, 1.200 sampel per kategori x 8 kategori. Digunakan untuk training model klasifikasi BiLSTM. |
| Dataset Sintetis Head 2 (9.000 baris) | Generate oleh AI (Claude) dengan pola perilaku mahasiswa | Riwayat transaksi harian 100 user simulasi x 90 hari dengan 3 profil (hemat, normal, boros). Digunakan untuk training model prediksi GRU. |
| Dataset Sintetis Head 3 (8.000 sampel) | Generate oleh AI (Claude) dari fitur kondisi keuangan | Dataset fitur numerik kondisi keuangan mahasiswa (% budget terpakai, proyeksi akhir bulan, saldo sisa) dengan label HEMAT/AMAN/WASPADA/BOROS/DARURAT. |

---

### Bahasa Pemrograman & Framework

| Tools/Library | Kategori | Fungsi |
|---|---|---|
| Python 3.12 | Backend / AI | Bahasa utama pengembangan model AI, preprocessing data dan backend API |
| TensorFlow / Keras | AI Framework | Framework training model Head 1C, 2 dan 3 (tf.keras.Model subclassing, GradientTape) |
| PyTorch + HuggingFace Transformers | AI Framework | Digunakan untuk inference Donut (Vision Encoder Decoder Model) dan DonutProcessor. GPU acceleration untuk parsing struk |
| FastAPI | Backend | Framework untuk menyajikan semua endpoint inference model AI ke frontend |
| React.js + TailwindCSS | Frontend | Library dan styling framework untuk membangun antarmuka dashboard 8 halaman yang responsif |
| PostgreSQL | Database | Penyimpanan data pengguna, riwayat transaksi, dan hasil analisis keuangan |
| Redis | Caching | Caching hasil OCR dan prediksi model untuk performa lebih cepat |
| Google Colab (T4 GPU) | Training Environment | Platform training model AI dengan GPU gratis. Semua notebook Head 1C, Head 2, dan Head 3 dijalankan di sini |
| Google Drive | Model Storage | Penyimpanan weights model (.h5), scaler (.pkl), dan config (.json) |
| Pandas / NumPy | Data Science | Manipulasi dan preprocessing data tabular untuk training dan inference |
| Matplotlib / Plotly | Visualisasi | Pembuatan chart evaluasi model, distribusi data dan grafik analisis pengeluaran di dashboard |
| Scikit-learn | ML Utility | MinMaxScaler, StandardScaler, F1-score, confusion matrix, dan train_test_split untuk evaluasi model |
| Vercel | Deployment | Hosting frontend React.js dengan CDN global untuk akses yang cepat |
| Railway / Render | Deployment | Hosting backend FastAPI dan PostgreSQL di cloud |
| Docker | DevOps | Containerisasi aplikasi untuk memastikan konsistensi environment antara development dan production |
| Github | Version Control | Pengelolaan kode sumber dengan strategi branching yang rapi dan CI/CD via GitHub Actions |

---

### Communication & Project Management

- **Discord**: Platform komunikasi utama tim untuk daily standup dan diskusi teknis real-time
- **Google Meet**: Video conference untuk sprint planning dan weekly retrospective
- **Trello / Linear**: Project management tool untuk task tracking, dokumentasi, dan knowledge base
- **Github**: Version control dengan branching strategy dan CI/CD via Github Actions
- **Google Drive**: Shared folder untuk dokumen, dataset, dan backup proyek

---

### Referensi Terkait

- Kim et al (2022). "OCR-Free Document Understanding Transformer"
- Hochreiter & Schmidhuber (1997). "Long Short-Term Memory"
- Schuster & Paliwal (1997). "Bidirectional recurrent neural network"
- Park et al. (2019). "CORD: A Consolidated Receipt Dataset for Post-OCR Parsing"
- Lin et al. (2017). "Focal Loss for Dense Object Detection"
- OJK SNLIK 2024 "Survei Nasional Literasi dan Inklusi Keuangan"

---

## F. Rencana Manajemen Risiko dan Isu

### Analisis SWOT

| **Strengths (Kekuatan)** | **Weaknesses (Kelemahan)** |
|---|---|
| Tim lengkap: AI Engineer, Data Science, Full Stack Developer | Semua dataset training (kecuali CORD v2) bersifat sintetis, belum divalidasi dengan data nyata berlabel |
| Pipeline AI multimodal end-to-end yang sudah berjalan (Donut → Head 1C → Head 2 → Head 3) | Donut hanya bekerja optimal untuk struk dengan format yang mirip dataset CORD v2 |
| Dataset CORD v1 yang berkualitas tinggi dari struk Indonesia | Inference Donut membutuhkan waktu 40–70 detik per gambar di T4 GPU |
| Arsitektur AI multimodal yang mencakup CV + NLP + Tabular | Integrasi API ke website belum dimulai pada tahap ini |

| **Opportunities (Peluang)** | **Threats (Ancaman)** |
|---|---|
| Penetrasi smartphone Indonesia 73% mendukung adopsi aplikasi berbasis web mobile | Kompetitor aplikasi keuangan yang sudah mapan |
| Literasi keuangan mahasiswa yang rendah (56,42%) menciptakan kebutuhan nyata akan solusi seperti ini | Waktu pengerjaan 5 minggu terbatas untuk pipeline yang kompleks |
| Potensi pengembangan lanjutan: integrasi e-wallet, fitur tabungan otomatis, dan saran investasi | Ketergantungan pada koneksi internet untuk inference model di cloud |

---

### Risk Register

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| Donut tidak bisa membaca struk dengan format yang tidak ada di CORD v2 | Tinggi | Tinggi | Sediakan fallback input manual. Tambahkan preprocessing gambar (denoise, deskew). Kumpulkan struk nyata Indonesia secara bertahap untuk fine-tuning lanjutan. |
| Dataset sintetis kurang merepresentasikan kondisi keuangan mahasiswa nyata | Sedang | Sedang | Validasi distribusi data sintetis dengan referensi BPS Indonesia. Tambahkan variasi profil dan pola pengeluaran. Dokumentasikan keterbatasan sebagai future work. |
| CUDA OOM saat training model di Google Colab T4 | Sedang | Sedang | Gunakan gradient checkpointing + mixed precision (FP16). Kurangi batch size. Freeze encoder Donut, hanya train decoder. |
| Inference Donut terlalu lambat (40–70 detik) untuk pengalaman pengguna yang baik | Tinggi | Sedang | Tampilkan loading state dengan progress pipeline. Kompres gambar sebelum dikirim ke model. Pertimbangkan async inference di background. |
| Training model memakan waktu lebih lama dari alokasi sprint | Sedang | Tinggi | Gunakan early stopping agresif. Prioritaskan Head 1C dan pipeline utama terlebih dahulu. Jika perlu, kurangi epochs atau gunakan arsitektur yang lebih ringan. |
| Integrasi frontend-backend-AI gagal atau tidak selesai tepat waktu | Rendah | Tinggi | Buat API contract (format request/response JSON) di awal. Gunakan mock data untuk pengembangan frontend. Testing endpoint dengan Postman sebelum integrasi penuh. |
| Anggota tim tidak aktif | Rendah | Sedang | Daily standup untuk memantau progres. Dokumentasi tugas di project management tool. Backup plan: redistribusi tugas jika ada anggota yang tidak dapat berkontribusi. |

---

### Issue Management Plan

#### Proses Identifikasi Isu

1. **Daily Standup** (15 menit setiap hari kerja jam 21.00 WIB melalui Google Meet)
   - Setiap anggota menyampaikan progress kemarin, hari ini, dan blocker yang dihadapi
   - Identifikasi blocker dan risiko potensial

2. **Weekly Sprint Review**
   - Review progress vs target sprint
   - Evaluasi kualitas model AI
   - Planning sprint berikutnya

3. **Bi-weekly Checkpoint**
   - Isi worksheet capstone individu
   - Monitoring oleh Tim Coding Camp

#### Proses Penyelesaian Isu

- **Low Impact Issue**: Diselesaikan langsung oleh PIC yang bersangkutan, konsultasi dokumentasi terlebih dahulu.
- **Medium Impact Issue**: Diskusi di grup Discord tim, selesaikan dalam 1-2 hari, pair programming atau debugging session bersama jika stuck.
- **High Impact Issue**: Emergency meeting via Google Meet, eskalasi ke Advisor/Mentor jika diperlukan.
- **Critical Issue**: Ketua tim langsung koordinasi, hubungi Tim Coding Camp jika blocker tidak dapat diatasi dalam 24 jam.

#### Komunikasi dan Eskalasi

- **Internal Team**: Grup Discord khusus tim untuk komunikasi lebih cepat
- **With Advisor**: Email + Dicoding Mentoring Platform (untuk sesi resmi)

---

### Strategi Mitigasi Proaktif

- **Penerapan API Contract-First**: Tim AI dan Full-Stack menyepakati format request/response JSON di awal pengembangan untuk memastikan integrasi antara backend FastAPI dan frontend React.js berjalan mulus tanpa ketergantungan sepihak.
- **Pengembangan Berbasis Mock Data**: Frontend dikembangkan menggunakan data tiruan (mock data) sejak awal. Hal ini memungkinkan pengembangan antarmuka tetap berjalan meskipun model AI masih dalam tahap pelatihan.
- **Sistem Checkpoint & Logging**: Setiap model AI dikonfigurasi untuk menyimpan checkpoint secara otomatis pada setiap epoch. Strategi ini memungkinkan pemulihan proses pelatihan (*resume training*) tanpa harus mengulang dari awal jika terjadi kegagalan sistem atau koneksi.
- **Pengujian Inkremental (Unit Testing)**: Melakukan validasi mandiri pada setiap komponen (OCR, klasifikasi, dan prediksi) sebelum digabungkan ke dalam satu pipeline besar guna mempercepat deteksi bug di level atomik.
- **Manajemen Data dan Kode Terpusat**: Seluruh kode sumber dikelola melalui GitHub dengan strategi branching yang rapi, sementara dataset dan dokumen teknis dibackup secara mingguan ke Google Drive untuk mencegah kehilangan data.
- **Monitoring Kemajuan Harian**: Melalui daily standup di Discord/Google Meet, setiap potensi hambatan (blocker) diidentifikasi sedini mungkin agar solusi dapat segera dirumuskan sebelum menjadi masalah besar.

---

### Contingency Plan

#### Skenario 1: Akurasi Model Donut di Bawah Target

Jika performa model Donut tidak mencapai threshold akurasi yang diinginkan pada dataset struk Indonesia (CORD v2):

- Mengimplementasikan pipeline pemrosesan gambar adaptif menggunakan OpenCV untuk menangani struk dengan kualitas rendah, mencakup teknik *denoising*, *deskewing* (koreksi kemiringan), dan *contrast enhancement* guna memperjelas fitur tekstual sebelum masuk ke model.
- Memperluas variasi dataset pelatihan menggunakan pustaka Albumentations untuk menyimulasikan kondisi dunia nyata, seperti efek blur, noise sensor kamera, serta distorsi lipatan struk agar model lebih robust.
- Melakukan pengecekan ulang terhadap ground truth pada dataset untuk memastikan tidak ada kesalahan pelabelan yang menghambat proses konvergensi model selama pelatihan.

#### Skenario 2: Training Model Melebihi Alokasi Waktu

Jika training melebihi alokasi waktu sprint, prioritas ditetapkan sebagai berikut: Head 1C (pipeline utama) harus selesai terlebih dahulu karena merupakan inti dari produk. Head 2 dan Head 3 dapat didemonstrasikan dengan model yang sudah ada meskipun belum fully optimized. Gunakan early stopping dengan patience yang lebih agresif dan kurangi epoch jika diperlukan.

#### Skenario 3: Timeline Terlambat

Jika tim tertinggal lebih dari 3 hari dari jadwal:

- Pivot ke MVP minimal: fokus pada fitur upload struk + klasifikasi pengeluaran + laporan sederhana
- Dokumentasikan fitur yang belum sempat dikerjakan sebagai "future work" di Project Brief
- Lembur akhir pekan dengan sprint khusus untuk mengejar ketertinggalan

#### Skenario 4: Integrasi API Tidak Selesai Tepat Waktu

Jika integrasi API tidak selesai sesuai jadwal, demo capstone akan menggunakan pendekatan dua layer: pipeline AI ditampilkan melalui notebook Colab (yang sudah berjalan end-to-end), sementara dashboard statis ditampilkan secara terpisah sebagai visualisasi hasil. Kedua komponen ini sudah siap dan dapat didemonstrasikan secara meyakinkan kepada penilai.

---

## Kesimpulan

Dokumen Project Plan ini telah disusun untuk memastikan dapat diselesaikan tepat waktu dengan kualitas yang baik menggunakan pendekatan sprint mingguan selama 5 minggu. SnapBudget hadir sebagai solusi inovatif dalam ekosistem teknologi keuangan (fintech) Indonesia, khususnya bagi mahasiswa dan generasi muda yang seringkali menghadapi hambatan nyata dalam disiplin pencatatan keuangan harian. Dengan memanfaatkan integrasi teknologi:

- **Pipeline AI Multimodal**: Donut untuk parsing foto struk, *BiLSTM* untuk klasifikasi pengeluaran 8 kategori, *MLP + GRU* untuk prediksi arus kas 7 hari ke depan, Financial Recommender untuk menghasilkan rekomendasi berlabel HEMAT hingga DARURAT.
- **Sistem Rekomendasi Berbasis Proyeksi**: Kombinasi rule-based projection sebagai anchor dan model tabular *MLP* sebagai classifier menghasilkan rekomendasi yang akurat dan dapat ditindaklanjuti oleh mahasiswa.
- **Arsitektur Web Modern**: Membangun aplikasi berbasis *React.js* untuk frontend dan *FastAPI* untuk backend, didukung oleh *PostgreSQL* dan *Redis* untuk performa data yang cepat.

Proyek ini dipimpin oleh tim lintas disiplin yang terdiri dari *AI Engineer*, *Data Science*, dan *Full Stack* untuk memastikan setiap aspek, mulai dari akurasi model hingga pengalaman pengguna (UI/UX), terpenuhi sesuai target deliverable capstone.
