// backend/src/services/chatbotService.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const formatIDR = (val) =>
  `Rp ${Math.abs(Math.round(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

export const generateChatResponse = async ({
  userMessage,
  conversationHistory = [],
  userContext = {},
}) => {
  const {
    totalPengeluaran  = 0,
    budgetBulanan     = 2000000,
    sisaBudget        = 0,
    daysRemaining     = 0,
    statusKeuangan    = 'HEMAT',
    actualPerKategori = {},
    prediksi7Hari     = {},
    transaksiTerbaru  = [],
  } = userContext;

  const kategoriInfo = Object.entries(actualPerKategori)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `  - ${k.replace(/_/g, ' ')}: ${formatIDR(v)}`)
    .join('\n') || '  - Belum ada pengeluaran';

  const prediksiInfo = Object.entries(prediksi7Hari)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `  - ${k.replace(/_/g, ' ')}: ${formatIDR(v)}`)
    .join('\n') || '  - Belum ada prediksi';

  const transaksiInfo = transaksiTerbaru
    .slice(0, 5)
    .map(t => `  - ${t.description || t.category}: ${formatIDR(Math.abs(t.amount))}`)
    .join('\n') || '  - Belum ada transaksi';

  const systemPrompt = `Kamu adalah asisten keuangan pribadi SnapBudget yang cerdas, ramah, dan membantu mahasiswa mengelola keuangan.

KONTEKS KEUANGAN USER SAAT INI:
- Status keuangan    : ${statusKeuangan}
- Budget bulanan     : ${formatIDR(budgetBulanan)}
- Total pengeluaran  : ${formatIDR(totalPengeluaran)}
- Sisa budget        : ${formatIDR(sisaBudget)}
- Sisa hari bulan ini: ${daysRemaining} hari

PENGELUARAN PER KATEGORI BULAN INI:
${kategoriInfo}

PREDIKSI PENGELUARAN 7 HARI KE DEPAN:
${prediksiInfo}

TRANSAKSI TERBARU:
${transaksiInfo}

PANDUAN RESPONS:
1. Gunakan bahasa Indonesia yang ramah dan mudah dipahami
2. Berikan saran spesifik berdasarkan data keuangan user di atas
3. Gunakan angka yang ada di konteks untuk jawaban yang personal
4. Format jawaban rapi, gunakan emoji secukupnya 
5. Maksimal 250 kata per respons
6. Jika ditanya di luar konteks keuangan, arahkan kembali ke topik keuangan`;

  const messages = [
    ...conversationHistory.slice(-10), // simpan 10 pesan terakhir
    { role: 'user', content: userMessage },
  ];

  const response = await groq.chat.completions.create({
    model      : 'llama-3.3-70b-versatile',
    max_tokens : 1024,
    temperature: 0.7,
    messages   : [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  return {
    response: response.choices[0].message.content,
    usage   : response.usage,
  };
};