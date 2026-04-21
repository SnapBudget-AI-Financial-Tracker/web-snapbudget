import { useState, useEffect } from "react";
import transactionService from "../services/transactionService";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import ScanStrukUpload from "../components/dashboard/ScanStrukUpload";
import AIPredictionCard from "../components/dashboard/AIPredictionCard";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCategoryIcon } from "../utils/categoryIcons.js";
import { FinancialStatusBadge } from "../utils/categoryIcons.jsx";
import {
  PieChart,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Scan,
} from "lucide-react";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScanUpload, setShowScanUpload] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlySpending: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await transactionService.getDashboardData();
      setDashboardData(data);
      setTransactions(data.transaksi_bulan_ini || []);

      // Calculate summary
      const total = (data.transaksi_bulan_ini || []).reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      const spending = Object.values(data.actual_per_kategori || {}).reduce(
        (acc, curr) => acc + curr,
        0
      );

      setSummary({
        totalBalance: total,
        monthlySpending: spending,
      });
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Data gagal dimuat. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await transactionService.getDashboardData();
        setDashboardData(data);
        setTransactions(data.transaksi_bulan_ini || []);

        // Calculate summary
        const total = (data.transaksi_bulan_ini || []).reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
        const spending = Object.values(data.actual_per_kategori || {}).reduce(
          (acc, curr) => acc + curr,
          0
        );

        setSummary({
          totalBalance: total,
          monthlySpending: spending,
        });
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Data gagal dimuat. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleScanSuccess = () => {
    setShowScanUpload(false);
    fetchDashboardData();
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Determine overall budget status
  const getOverallStatus = () => {
    if (!dashboardData?.rekomendasi) return "AMAN";
    return dashboardData.rekomendasi.label_upper || "AMAN";
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {isLoading ? (
            <>
              <Skeleton variant="card" />
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </>
          ) : (
            <div className="contents animate-fadeIn">
              <StatCard
                title="Total Balance"
                value={formatCurrency(summary.totalBalance)}
                icon={<TrendingUp className="h-5 w-5" />}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                title="Monthly Spending"
                value={formatCurrency(summary.monthlySpending)}
                icon={<TrendingDown className="h-5 w-5" />}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
              />
              <StatCard
                title="Budget Status"
                value={<FinancialStatusBadge status={getOverallStatus()} />}
                icon={<PieChart className="h-5 w-5" />}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />
            </div>
          )}
        </div>

        {/* AI Prediction Card */}
        {!isLoading && dashboardData && (
          <div className="mb-8 animate-fadeIn">
            <AIPredictionCard
              prediksi={dashboardData.prediksi_7hari}
              rekomendasi={dashboardData.rekomendasi}
              statusPerKategori={dashboardData.status_per_kategori}
            />
          </div>
        )}

        {/* Scan Struk Section */}
        <div className="mb-8">
          {showScanUpload ? (
            <div className="animate-fadeIn">
              <ScanStrukUpload onSuccess={handleScanSuccess} />
            </div>
          ) : (
            <Button
              onClick={() => setShowScanUpload(true)}
              variant="outline"
              className="w-full sm:w-auto"
              icon={Scan}
            >
              Scan Struk Belanja
            </Button>
          )}
        </div>

        {/* Transactions Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900">
            Recent Transactions
          </h2>
          <Button 
            variant="gradient" 
            className="w-auto px-4 py-2" 
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Transaction
          </Button>
        </div>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />

        {isLoading ? (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-200 px-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="row" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-1">
              Gagal memuat data
            </h3>
            <p className="text-sm text-zinc-500 mb-6">{error}</p>
            <Button
              variant="outline"
              className="w-auto px-4 py-2"
              onClick={fetchDashboardData}
            >
              Coba Lagi
            </Button>
          </div>
        ) : transactions.length > 0 ? (
          <div className="animate-fadeIn bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                        {t.description || "No description"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                          {(() => {
                            const Icon = getCategoryIcon(t.category);
                            return <Icon className="h-3.5 w-3.5 shrink-0" />;
                          })()}
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900 text-right">
                        {formatCurrency(Math.abs(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
            {/* Inline SVG wallet illustration */}
            <div className="mx-auto mb-6 w-24 h-24">
              <svg
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Wallet body */}
                <rect
                  x="8"
                  y="28"
                  width="80"
                  height="52"
                  rx="10"
                  fill="#EEF2FF"
                  stroke="#C7D2FE"
                  strokeWidth="2"
                />
                {/* Wallet flap */}
                <path
                  d="M8 38 C8 32 13 28 19 28 H77 C83 28 88 32 88 38 V44 H8 V38Z"
                  fill="#C7D2FE"
                />
                {/* Card pocket */}
                <rect
                  x="56"
                  y="50"
                  width="24"
                  height="18"
                  rx="5"
                  fill="#A5B4FC"
                />
                {/* Coin stack */}
                <ellipse cx="32" cy="62" rx="12" ry="5" fill="#DDD6FE" />
                <ellipse cx="32" cy="59" rx="12" ry="5" fill="#C4B5FD" />
                <ellipse cx="32" cy="56" rx="12" ry="5" fill="#A78BFA" />
                {/* Receipt strip */}
                <rect
                  x="40"
                  y="10"
                  width="20"
                  height="26"
                  rx="3"
                  fill="#F5F3FF"
                  stroke="#DDD6FE"
                  strokeWidth="1.5"
                />
                <line
                  x1="44"
                  y1="16"
                  x2="56"
                  y2="16"
                  stroke="#C4B5FD"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="44"
                  y1="20"
                  x2="56"
                  y2="20"
                  stroke="#C4B5FD"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="44"
                  y1="24"
                  x2="52"
                  y2="24"
                  stroke="#DDD6FE"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-8">
              Start tracking your finances by adding your first transaction.
              Stay on top of your spending and savings in one place.
            </p>
            <div className="flex justify-center">
              <Button 
                variant="gradient" 
                className="w-auto px-6" 
                icon={Plus}
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Transaction
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
