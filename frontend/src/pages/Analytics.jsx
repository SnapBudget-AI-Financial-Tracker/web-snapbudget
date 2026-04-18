import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

// The mocked JSON response from the AI Engineer
const aiPredictionData = {
  store_name: "Tidak terdeteksi",
  date: "2026-04-18",
  items: [
    {
      item_name: "Tahu Ikan Oma Giok",
      harga: 20000,
      kategori: "makanan",
      confidence: 65.8,
    },
  ],
  total_struk_rp: 20000,
  prediksi_7hari: {
    makanan: 106000,
    minuman: 45000,
    transportasi: 45000,
    belanja: 127000,
    tagihan: 0,
    hiburan: 0,
    kesehatan: 0,
    lain_lain: 17000,
  },
  rekomendasi: {
    label: "HEMAT",
    conf: 68.4,
    pesan:
      "Pengeluaran sangat terkontrol! Pertahankan kebiasaan ini dan alokasikan sisa ke tabungan.",
    saldo_rp: 1640000,
    proj_pct: 30.0,
  },
  status_per_kategori: {
    makanan: {
      label: "DARURAT",
      aktual_rp: 360000,
      pred_rp: 106000,
      pct_used: 144.0,
    },
    minuman: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 45000,
      pct_used: 0.0,
    },
    transportasi: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 45000,
      pct_used: 0.0,
    },
    belanja: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 127000,
      pct_used: 0.0,
    },
    tagihan: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 0,
      pct_used: 0.0,
    },
    hiburan: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 0,
      pct_used: 0.0,
    },
    kesehatan: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 0,
      pct_used: 0.0,
    },
    lain_lain: {
      label: "HEMAT",
      aktual_rp: 0,
      pred_rp: 17000,
      pct_used: 0.0,
    },
  },
};

export default function Analytics() {
  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Transform prediksi_7hari object into an array suitable for Recharts
  const chartData = Object.entries(aiPredictionData.prediksi_7hari).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
      amount: value,
    })
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">
            Analytics & Insights
          </h1>
          <p className="text-sm text-zinc-500">
            Powered by AI recommendations to help you track and improve your
            spending habits.
          </p>
        </div>

        {/* AI Recommendation Banner */}
        <div
          className={`p-6 rounded-2xl border shadow-sm mb-8 flex items-start gap-4 ${
            aiPredictionData.rekomendasi.label === "HEMAT"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="mt-1">
            {aiPredictionData.rekomendasi.label === "HEMAT" ? (
              <CheckCircle2 className="text-emerald-500 h-6 w-6" />
            ) : (
              <AlertCircle className="text-red-500 h-6 w-6" />
            )}
          </div>
          <div>
            <h3
              className={`text-lg font-bold mb-1 ${
                aiPredictionData.rekomendasi.label === "HEMAT"
                  ? "text-emerald-900"
                  : "text-red-900"
              }`}
            >
              AI Status: {aiPredictionData.rekomendasi.label}
            </h3>
            <p
              className={`text-sm mb-3 ${
                aiPredictionData.rekomendasi.label === "HEMAT"
                  ? "text-emerald-800"
                  : "text-red-800"
              }`}
            >
              {aiPredictionData.rekomendasi.pesan}
            </p>
            <div className="flex gap-6">
               <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Proj. Savings</span>
                  <span className="font-medium">{formatIDR(aiPredictionData.rekomendasi.saldo_rp)}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Proj. Pct</span>
                  <span className="font-medium">{aiPredictionData.rekomendasi.proj_pct}%</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-6">
                7-Day Spending Prediction
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e4e4e7"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(value)
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "#f4f4f5" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e4e4e7",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                      }}
                       formatter={(value) => formatIDR(value)}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#18181b"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Status Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 mb-2">
              Category Status
            </h2>
            {Object.entries(aiPredictionData.status_per_kategori).map(
              ([categoryName, status]) => (
                <div
                  key={categoryName}
                  className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between group hover:border-zinc-300 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-zinc-900 capitalize mb-1">
                      {categoryName.replace("_", " ")}
                    </h4>
                    <div className="flex gap-3 text-xs">
                       <span className="text-zinc-500">Actual: <span className="font-medium text-zinc-700">{formatIDR(status.aktual_rp)}</span></span>
                       <span className="text-zinc-500">Pred: <span className="font-medium text-zinc-700">{formatIDR(status.pred_rp)}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        status.label === "DARURAT"
                          ? "bg-red-100 text-red-700"
                          : status.label === "WASPADA"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {status.label}
                    </span>
                    <span className="text-xs font-medium text-zinc-400 mt-2">
                       {status.pct_used}% Used
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
