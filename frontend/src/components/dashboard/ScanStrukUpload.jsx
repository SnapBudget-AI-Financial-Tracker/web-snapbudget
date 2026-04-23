import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import transactionService from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';

export default function ScanStrukUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      showToast("Hanya file gambar yang diperbolehkan", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 5MB", "error");
      return;
    }

    setFile(selectedFile);
    setScanResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await transactionService.scanStruk(file);
      setScanResult(result);
      showToast(
        `Berhasil scan ${result.transaksi_disimpan} item dari struk`,
        "success",
      );
      if (onSuccess) onSuccess(result);
    } catch (error) {
      console.error("Scan error:", error);
      showToast(
        error.response?.data?.message || "Gagal memproses struk",
        "error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setScanResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatCurrency = (amount) => {
    const absAmount = Math.abs(Math.round(amount));
    const formatted = absAmount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-zinc-900 mb-4">Scan Struk Belanja</h3>

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
        >
          <Upload className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-900 mb-1">
            Klik untuk upload foto struk
          </p>
          <p className="text-xs text-zinc-500">PNG, JPG hingga 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Preview struk"
              className="w-full h-64 object-contain bg-zinc-50 rounded-lg border border-zinc-200"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-zinc-100 transition-colors"
            >
              <X className="h-4 w-4 text-zinc-600" />
            </button>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-2">
                    Scan Berhasil!
                  </h4>
                  <div className="space-y-2 text-sm text-emerald-800">
                    <p>
                      <strong>{scanResult.scan_result.items.length} item</strong>{' '}
                      terdeteksi
                    </p>
                    <p>
                      Total: <strong>{formatCurrency(scanResult.scan_result.total_rp)}</strong>
                    </p>
                    {scanResult.scan_result.store_name && scanResult.scan_result.store_name !== 'Tidak terdeteksi' && (
                      <p>
                        Toko: <strong>{scanResult.scan_result.store_name}</strong>
                      </p>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="mt-3 space-y-1.5">
                    {scanResult.scan_result.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs bg-white rounded px-2 py-1.5"
                      >
                        <div className="flex-1">
                          <span className="text-zinc-700">{item.item_name}</span>
                          <span className="ml-2 text-zinc-500">({item.kategori})</span>
                        </div>
                        <span className="font-medium text-zinc-900">
                          {formatCurrency(item.harga)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI Recommendation */}
                  {scanResult.rekomendasi && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-900 mb-1.5">
                        Status: {scanResult.rekomendasi.label_upper}
                      </p>
                      <p className="text-xs text-emerald-800">
                        {scanResult.rekomendasi.pesan}
                      </p>
                      {scanResult.rekomendasi.saldo_rp > 0 && (
                        <p className="text-xs text-emerald-700 mt-1">
                          Sisa saldo: <strong>{formatCurrency(scanResult.rekomendasi.saldo_rp)}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!scanResult && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                variant="gradient"
                className="flex-1"
                icon={isUploading ? Loader2 : Upload}
              >
                {isUploading ? 'Memproses...' : 'Scan Struk'}
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" className="flex-1">
              {scanResult ? 'Scan Lagi' : 'Batal'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
