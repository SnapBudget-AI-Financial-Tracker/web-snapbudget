import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Search, Filter, Plus, Receipt } from "lucide-react";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  // Placeholder untuk fetch data dari backend nantinya
  const [transactions] = useState([]);
  const [isLoading] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">
              Transactions
            </h1>
            <p className="text-sm text-zinc-500">
              Manage and view all your recorded expenses and incomes.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors w-full sm:w-auto cursor-pointer shadow-sm">
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors cursor-pointer">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mb-4"></div>
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
            
            {/* Pagination Controls Wrapper (Placeholder) */}
            <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-sm text-zinc-500">Showing 1-10 of 24 transactions</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-zinc-200 rounded text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 border border-zinc-200 rounded text-sm text-zinc-600 hover:bg-zinc-50">Next</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Receipt size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              No transactions found
            </h3>
            <p className="text-zinc-500 max-w-sm mb-6 text-sm">
              You haven't recorded any transactions yet or none match your current filters.
            </p>
            <button className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2">
               <Plus size={16} />
              Add Your First Transaction
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
