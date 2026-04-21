import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AIPredictionCard({ prediksi, rekomendasi, statusPerKategori }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (label) => {
    const status = label?.toLowerCase();
    switch (status) {
      case 'hemat':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'aman':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'waspada':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'boros':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'darurat':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      default:
        return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const getStatusIcon = (label) => {
    const status = label?.toLowerCase();
    switch (status) {
      case 'hemat':
      case 'aman':
        return <CheckCircle className="h-4 w-4" />;
      case 'waspada':
      case 'boros':
      case 'darurat':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-zinc-900">Prediksi AI - 7 Hari Ke Depan</h3>
      </div>

      {/* Predictions Grid */}
      {prediksi && Object.keys(prediksi).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(prediksi).map(([kategori, amount]) => {
            const statusData = statusPerKategori?.[kategori];
            const label = statusData?.label || 'aman';
            return (
              <div
                key={kategori}
                className={`rounded-lg border p-3 ${getStatusColor(label)}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {getStatusIcon(label)}
                  <span className="text-xs font-semibold uppercase">
                    {kategori.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm font-bold">{formatCurrency(amount)}</p>
                {statusData && (
                  <p className="text-xs mt-1 opacity-80">
                    {Math.round(statusData.confidence)}% confidence
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {rekomendasi && (
        <div className={`rounded-lg border p-4 ${getStatusColor(rekomendasi.label)}`}>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            {getStatusIcon(rekomendasi.label)}
            Status: {rekomendasi.label_upper}
          </h4>
          <p className="text-sm mb-3">{rekomendasi.pesan}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="opacity-75">Sisa Saldo:</span>
              <p className="font-bold">{formatCurrency(rekomendasi.saldo_rp)}</p>
            </div>
            <div>
              <span className="opacity-75">Hari Tersisa:</span>
              <p className="font-bold">{rekomendasi.days_remaining} hari</p>
            </div>
            <div>
              <span className="opacity-75">Proyeksi Penggunaan:</span>
              <p className="font-bold">{Math.round(rekomendasi.proj_overall_pct)}%</p>
            </div>
            <div>
              <span className="opacity-75">Est. Saldo 7 Hari:</span>
              <p className="font-bold">{formatCurrency(rekomendasi.est_saldo_7hari_rp)}</p>
            </div>
          </div>
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
