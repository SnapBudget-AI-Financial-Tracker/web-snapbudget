import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import transactionService from "../services/transactionService";
import {
  LogOut,
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  User,
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlySpending: 0,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await transactionService.getTransactions();
        setTransactions(data);

        // Calculate basic summary
        const total = data.reduce((acc, curr) => acc + curr.amount, 0);
        // Simplified monthly spending (just summing all for now as a placeholder)
        setSummary({
          totalBalance: total,
          monthlySpending: total > 0 ? total : 0,
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl text-zinc-900">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">S</span>
            </div>
            SnapBudget
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg text-sm font-medium transition-colors"
          >
            <Receipt size={18} />
            Transactions
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg text-sm font-medium transition-colors"
          >
            <PieChart size={18} />
            Analytics
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg text-sm font-medium transition-colors"
          >
            <Settings size={18} />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-zinc-900">
            Dashboard Overview
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-zinc-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
              <User size={20} className="text-zinc-600" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="text-emerald-600 h-5 w-5" />
                </div>
              </div>
              <p className="text-sm text-zinc-500 mb-1 font-medium">
                Total Balance
              </p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {formatCurrency(summary.totalBalance)}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingDown className="text-orange-600 h-5 w-5" />
                </div>
              </div>
              <p className="text-sm text-zinc-500 mb-1 font-medium">
                Monthly Spending
              </p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {formatCurrency(summary.monthlySpending)}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <PieChart className="text-blue-600 h-5 w-5" />
                </div>
              </div>
              <p className="text-sm text-zinc-500 mb-1 font-medium">
                Budget Status
              </p>
              <h3 className="text-2xl font-bold text-zinc-900">On Track</h3>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900">
              Recent Transactions
            </h2>
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              <Plus size={16} />
              Add Transaction
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-4" />
              <p className="text-zinc-500 text-sm">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
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
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                            {t.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-zinc-900 text-right">
                          {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt size={32} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                Start tracking your expenses by scanning a receipt or entering a
                transaction manually.
              </p>
              <button className="bg-zinc-100 text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors border border-zinc-200">
                View Sample Guide
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
