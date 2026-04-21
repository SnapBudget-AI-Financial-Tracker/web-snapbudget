import { useState, useEffect } from 'react';
import { Save, Loader2, User, Wallet, Calendar, Target } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import userService from '../services/userService';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    budgetBulanan: 2000000,
    budgetMakanan: 700000,
    budgetMinuman: 200000,
    budgetTransportasi: 300000,
    budgetBelanja: 200000,
    budgetTagihan: 240000,
    budgetHiburan: 160000,
    budgetKesehatan: 100000,
    budgetLainLain: 100000,
    tanggalGajian: 25,
    targetTabungan: 0,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getBudgetSettings();
        setFormData({
          budgetBulanan: data.budgetBulanan,
          budgetMakanan: data.budgetMakanan,
          budgetMinuman: data.budgetMinuman,
          budgetTransportasi: data.budgetTransportasi,
          budgetBelanja: data.budgetBelanja,
          budgetTagihan: data.budgetTagihan,
          budgetHiburan: data.budgetHiburan,
          budgetKesehatan: data.budgetKesehatan,
          budgetLainLain: data.budgetLainLain,
          tanggalGajian: data.tanggalGajian,
          targetTabungan: data.targetTabungan,
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Gagal memuat pengaturan', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await userService.updateBudget(formData);
      showToast('Pengaturan berhasil disimpan', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(
        error.response?.data?.message || 'Gagal menyimpan pengaturan',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value) => {
    const absValue = Math.abs(Math.round(value));
    return absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const totalAllocated =
    formData.budgetMakanan +
    formData.budgetMinuman +
    formData.budgetTransportasi +
    formData.budgetBelanja +
    formData.budgetTagihan +
    formData.budgetHiburan +
    formData.budgetKesehatan +
    formData.budgetLainLain;

  const difference = formData.budgetBulanan - totalAllocated;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Pengaturan Budget
          </h1>
          <p className="text-zinc-600">
            Kelola budget bulanan dan alokasi per kategori
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Budget Bulanan */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Wallet className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Budget Bulanan
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Total Budget per Bulan
                </label>
                <Input
                  type="number"
                  value={formData.budgetBulanan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budgetBulanan: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="100000"
                  required
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Rp {formatCurrency(formData.budgetBulanan)}
                </p>
              </div>
            </div>

            {/* Alokasi per Kategori */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Alokasi per Kategori
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
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
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Rp {formatCurrency(formData[item.key])}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-zinc-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Total Dialokasikan:</span>
                    <span className="font-semibold text-zinc-900">
                      Rp {formatCurrency(totalAllocated)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Budget Bulanan:</span>
                    <span className="font-semibold text-zinc-900">
                      Rp {formatCurrency(formData.budgetBulanan)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between pt-2 border-t border-zinc-200 ${
                      difference < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    <span className="font-semibold">
                      {difference < 0 ? 'Kelebihan:' : 'Sisa:'}
                    </span>
                    <span className="font-bold">
                      Rp {formatCurrency(Math.abs(difference))}
                    </span>
                  </div>
                </div>

                {difference < 0 && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <p className="text-sm text-rose-800">
                      Total alokasi melebihi budget bulanan. Sesuaikan alokasi
                      agar tidak melebihi budget.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tanggal Gajian & Target */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Informasi Tambahan
                </h2>
              </div>

              <div className="space-y-4">
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
                    Target Tabungan per Bulan
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
                    {formData.targetTabungan > 0
                      ? `Rp ${formatCurrency(formData.targetTabungan)}`
                      : 'Kosongkan jika tidak ada target'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={isSaving || difference < 0}
                variant="gradient"
                icon={isSaving ? Loader2 : Save}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
