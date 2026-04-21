import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    budgetBulanan: 2000000,
    allocationType: 'auto', // 'auto' or 'manual'
    tanggalGajian: 25,
    targetTabungan: 0,
    // Manual allocation
    budgetMakanan: 700000,
    budgetMinuman: 200000,
    budgetTransportasi: 300000,
    budgetBelanja: 200000,
    budgetTagihan: 240000,
    budgetHiburan: 160000,
    budgetKesehatan: 100000,
    budgetLainLain: 100000,
  });

  const budgetPresets = [
    { value: 1000000, label: 'Rp 1.000.000' },
    { value: 2000000, label: 'Rp 2.000.000', popular: true },
    { value: 3000000, label: 'Rp 3.000.000' },
    { value: 5000000, label: 'Rp 5.000.000' },
  ];

  // Auto calculate budget allocation based on total budget
  const calculateAutoAllocation = (totalBudget) => {
    return {
      budgetMakanan: Math.round(totalBudget * 0.35),
      budgetMinuman: Math.round(totalBudget * 0.10),
      budgetTransportasi: Math.round(totalBudget * 0.15),
      budgetBelanja: Math.round(totalBudget * 0.10),
      budgetTagihan: Math.round(totalBudget * 0.12),
      budgetHiburan: Math.round(totalBudget * 0.08),
      budgetKesehatan: Math.round(totalBudget * 0.05),
      budgetLainLain: Math.round(totalBudget * 0.05),
    };
  };

  const handleBudgetChange = (value) => {
    const budget = parseInt(value) || 0;
    setFormData({
      ...formData,
      budgetBulanan: budget,
      ...(formData.allocationType === 'auto' ? calculateAutoAllocation(budget) : {}),
    });
  };

  const handleAllocationTypeChange = (type) => {
    setFormData({
      ...formData,
      allocationType: type,
      ...(type === 'auto' ? calculateAutoAllocation(formData.budgetBulanan) : {}),
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await userService.updateBudget({
        ...formData,
        isOnboardingComplete: true,
      });

      showToast('Budget berhasil disimpan!', 'success');
      if (onComplete) onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      showToast(
        error.response?.data?.message || 'Gagal menyimpan budget',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Personalisasi Budget Anda
              </h2>
              <p className="text-sm text-zinc-600">
                Langkah {step} dari 3
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Lewati
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-zinc-200">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Budget Bulanan */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Berapa budget bulanan Anda?
                </h3>
                <p className="text-sm text-zinc-600">
                  Pilih atau masukkan total budget yang Anda miliki setiap bulan
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {budgetPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleBudgetChange(preset.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      formData.budgetBulanan === preset.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-zinc-200 hover:border-teal-300'
                    }`}
                  >
                    {preset.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-zinc-900">{preset.label}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Atau masukkan jumlah custom
                </label>
                <Input
                  type="number"
                  value={formData.budgetBulanan}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  placeholder="3500000"
                  min="0"
                  step="100000"
                />
              </div>
            </div>
          )}

          {/* Step 2: Alokasi Budget */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Bagaimana cara mengalokasikan budget?
                </h3>
                <p className="text-sm text-zinc-600">
                  Pilih alokasi otomatis atau atur manual per kategori
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAllocationTypeChange('auto')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.allocationType === 'auto'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-zinc-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                    <h4 className="font-bold text-zinc-900">Otomatis (AI)</h4>
                  </div>
                  <p className="text-sm text-zinc-600">
                    AI akan menyarankan alokasi optimal berdasarkan budget Anda
                  </p>
                </button>

                <button
                  onClick={() => handleAllocationTypeChange('manual')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.allocationType === 'manual'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-zinc-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-zinc-900">Manual</h4>
                  </div>
                  <p className="text-sm text-zinc-600">
                    Atur sendiri budget untuk setiap kategori sesuai kebutuhan
                  </p>
                </button>
              </div>

              {formData.allocationType === 'auto' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">
                    Alokasi yang Disarankan:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Makanan:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetMakanan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Minuman:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetMinuman)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Transportasi:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetTransportasi)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Belanja:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetBelanja)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Tagihan:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetTagihan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Hiburan:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetHiburan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Kesehatan:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetKesehatan)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Lain-lain:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {formatCurrency(formData.budgetLainLain)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {formData.allocationType === 'manual' && (
                <div className="space-y-3">
                  {[
                    { key: 'budgetMakanan', label: 'Makanan' },
                    { key: 'budgetMinuman', label: 'Minuman' },
                    { key: 'budgetTransportasi', label: 'Transportasi' },
                    { key: 'budgetBelanja', label: 'Belanja' },
                    { key: 'budgetTagihan', label: 'Tagihan' },
                    { key: 'budgetHiburan', label: 'Hiburan' },
                    { key: 'budgetKesehatan', label: 'Kesehatan' },
                    { key: 'budgetLainLain', label: 'Lain-lain' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        {item.label}
                      </label>
                      <Input
                        type="number"
                        value={formData[item.key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [item.key]: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        step="10000"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tanggal Gajian & Target */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  Informasi Tambahan
                </h3>
                <p className="text-sm text-zinc-600">
                  Bantu kami memberikan prediksi yang lebih akurat
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Tanggal Gajian
                </label>
                <select
                  value={formData.tanggalGajian}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggalGajian: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Setiap tanggal {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Target Tabungan per Bulan (Opsional)
                </label>
                <Input
                  type="number"
                  value={formData.targetTabungan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetTabungan: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="500000"
                  min="0"
                  step="100000"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Kosongkan jika tidak ada target tabungan
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-900 mb-1">
                      Siap untuk Mulai!
                    </h4>
                    <p className="text-sm text-emerald-800">
                      Dengan informasi ini, AI kami dapat memberikan prediksi dan
                      rekomendasi yang lebih akurat untuk membantu Anda mengelola
                      keuangan dengan lebih baik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-200 bg-zinc-50">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                icon={ArrowLeft}
              >
                Kembali
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                variant="gradient"
                icon={ArrowRight}
              >
                Lanjut
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                variant="gradient"
                icon={Check}
              >
                {isSubmitting ? 'Menyimpan...' : 'Selesai'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
