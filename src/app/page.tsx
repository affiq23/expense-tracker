"use client";

import Link from "next/link";
import ExpenseForm from "./components/ExpenseForm";

export default function AddExpensePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-white">Expense Tracker</h1>
        <Link
          href="/expenses"
          className="text-blue-400 hover:text-blue-200 font-medium transition"
        >
          View All Expenses
        </Link>
      </header>

 
      <main className="flex-1 flex flex-col justify-start items-center px-6 pb-12">
        <p className="max-w-md text-center text-gray-400 mb-8">
          Upload receipts and automatically save them to track your expenses.
        </p>

        <div className="w-full max-w-lg bg-white text-gray-900 p-8 rounded-2xl shadow-2xl">
          <ExpenseForm />
        </div>
      </main>

      <footer className="text-center py-4 text-gray-600 text-sm">
        © {new Date().getFullYear()} Expense Tracker
      </footer>
    </div>
  );
}
