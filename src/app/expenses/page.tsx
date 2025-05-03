"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Backend API URL
const API_URL = "http://localhost:3001/api";

type Expense = {
  id: string;
  amount: number;
  date: string;
  category: string;
  memo: string;
  receipt_url: string;
  created_at: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the latest list of expenses
  async function fetchExpenses() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/expenses`);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data: Expense[] = await response.json();
      setExpenses(data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
      setError(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  // Delete a single expense and refresh the list
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      await fetchExpenses();
    } catch (err: any) {
      console.error("Error deleting expense:", err);
      alert(err.message || "Could not delete expense");
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Formatters
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Expense History</h1>
          <Link
            href="/"
            className="px-5 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition"
          >
            Add New Expense
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">
            Loading expenses…
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No expenses found. Add your first expense!
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full table-auto border-separate border-spacing-y-2">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-300">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-300">
                    Memo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-300">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-300">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="bg-gray-800 hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 text-sm">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 text-sm">{expense.category}</td>
                    <td className="px-6 py-4 text-sm">{expense.memo}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {expense.receipt_url ? (
                        <a
                          href={`${API_URL}${expense.receipt_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-200 transition"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
