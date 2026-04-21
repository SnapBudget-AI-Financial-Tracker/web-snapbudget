import { TrendingUp, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

export default function AIPredictionCard({ prediksi, rekomendasi, statusPerKategori }) {
  const formatCurrency = (amount) => {
    const absAmount = Math.abs(Math.round(amount));
    const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${formatted}`;
  };

  const getStatusColor = (label) => {
    const status = label?.toLowerCase();
    switch (status) {
      case 'hemat':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'aman':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'waspada':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'boros':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'darurat':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      default:
        return 'bg-zinc-50 border-zinc-200 text-zinc-900';
    }
  };

  const getStatusIcon = (label) => {
    const status = label?.toLowerCase();
    switch (status) {
      case 'hemat':
      case 'aman':
        return <CheckCircle className="h-5 w-5" />;
      case 'waspada':
      case 'boros':
      case 'darurat':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Calculate total prediction
  const totalPrediksi = Object.values(prediksi || {}).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-zinc-900">Prediksi & Rekomendasi AI</h3>
      </div>

      {/* Status & Recommendation */}
      {rekomendasi && (
        <div className={`rounded-lg border p-4 mb-6 ${getStatusColor(rekomendasi.label)}`}>
          <div className="flex items-start gap-3 mb-3">
            {getStatusIcon(rekomendasi.label)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold">Status: {rekomendasi.label_upper}</h4>
                <span className="text-xs opacity-75">
                  ({Math.round(rekomendasi.confidence)}% confidence)
                </span>
              </div>
              <p className="text-sm">{rekomendasi.pesan}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-current/20">
            <div>
              <p className="text-xs opacity-75 mb-1">Sisa Budget</p>
              <p className="text-sm font-bold">{formatCurrency(rekomendasi.saldo_rp)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1">Hari Tersisa</p>
              <p className="text-sm font-bold">{rekomendasi.days_remaining} hari</p>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Prediction */}
      {prediksi && Object.keys(prediksi).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Prediksi 7 Hari Ke Depan
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Berdasarkan pola pengeluaran Anda, estimasi total pengeluaran dalam 7 hari ke depan:
              </p>
              
              <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-3">
                <span className="text-sm font-medium text-blue-900">Total Estimasi</span>
                <span className="text-lg font-bold text-blue-900">{formatCurrency(totalPrediksi)}</span>
              </div>

              {rekomendasi?.est_saldo_7hari_rp !== undefined && (
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <ArrowRight className="h-3 w-3" />
                  <span>
                    Sisa budget setelah 7 hari: <strong>{formatCurrency(rekomendasi.est_saldo_7hari_rp)}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown - Collapsible */}
          <details className="mt-3">
            <summary className="text-xs font-medium text-blue-900 cursor-pointer hover:text-blue-700 transition-colors">
              Lihat detail per kategori
            </summary>
            <div className="mt-3 space-y-2">
              {Object.entries(prediksi).map(([kategori, amount]) => {
                const statusData = statusPerKategori?.[kategori];
                const label = statusData?.label || 'aman';
                const labelColor = label === 'darurat' || label === 'boros' ? 'text-rose-600' : 
                                   label === 'waspada' ? 'text-amber-600' : 'text-emerald-600';
                
                return (
                  <div key={kategori} className="flex items-center justify-between text-xs bg-white rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-700 capitalize">{kategori.replace('_', ' ')}</span>
                      {statusData && (
                        <span className={`text-xs font-medium ${labelColor}`}>
                          ({label})
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-zinc-900">{formatCurrency(amount)}</span>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      )}

      {!prediksi && !rekomendasi && (
        <p className="text-sm text-zinc-500 text-center py-4">
          Belum ada data prediksi. Tambahkan transaksi untuk mendapatkan insight AI.
        </p>
      )}
    </div>
  );
}
