import { useState, useRef } from 'react';
import { X, Upload, Plus, Loader2, Receipt, Wallet } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import transactionService from '../../services/transactionService';
import { useToast } from '../../context/ToastContext';

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('manual'); // 'manual' or 'scan'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  // Manual form state
  const [formData, setFormData] = useState({
    amount: '',
    category: 'makanan',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = [
    { value: 'makanan', label: 'Makanan' },
    { value: 'minuman', label: 'Minuman' },
    { value: 'transportasi', label: 'Transportasi' },
    { value: 'belanja', label: 'Belanja' },
    { value: 'tagihan', label: 'Tagihan' },
    { value: 'hiburan', label: 'Hiburan' },
    { value: 'kesehatan', label: 'Kesehatan' },
    { value: 'lain-lain', label: 'Lain-lain' },
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Masukkan jumlah yang valid', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionService.createTransaction({
        amount: -Math.abs(parseFloat(formData.amount)),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });

      showToast('Transaksi berhasil ditambahkan', 'success');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Create transaction error:', error);
      showToast(
        error.response?.data?.message || 'Gagal menambahkan transaksi',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanSubmit = async () => {
    if (!file) {
      showToast('Pilih foto struk terlebih dahulu', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await transactionService.scanStruk(file);
      showToast(
        `Berhasil scan ${result.transaksi_disimpan} item dari struk`,
        'success'
      );
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Scan error:', error);
      showToast(
        error.response?.data?.message || 'Gagal memproses struk',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMode('manual');
    setFile(null);
    setPreview(null);
    setFormData({
      amount: '',
      category: 'makanan',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900">Tambah Transaksi</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-6 border-b border-zinc-200">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Manual
            </button>
            <button
              onClick={() => setMode('scan')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'scan'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Receipt className="h-4 w-4" />
              Scan Struk
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {mode === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Jumlah (Rp)
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="50000"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Deskripsi
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Makan siang di restoran"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Tanggal
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="gradient"
                  className="flex-1"
                  icon={isSubmitting ? Loader2 : Plus}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 rounded-xl p-12 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all"
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
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview struk"
                      className="w-full h-64 object-contain bg-zinc-50 rounded-xl border border-zinc-200"
                    />
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-zinc-100 transition-colors"
                    >
                      <X className="h-4 w-4 text-zinc-600" />
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      AI akan mengekstrak item dari struk dan menambahkannya ke
                      transaksi Anda secara otomatis.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleScanSubmit}
                      disabled={isSubmitting}
                      variant="gradient"
                      className="flex-1"
                      icon={isSubmitting ? Loader2 : Receipt}
                    >
                      {isSubmitting ? 'Memproses...' : 'Scan Struk'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
