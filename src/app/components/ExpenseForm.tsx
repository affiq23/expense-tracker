"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { createWorker } from "tesseract.js";

type ExpenseFormData = {
  amount: string;
  date: string;
  category: string;
  memo: string;
};

// Backend API URL
const API_URL = "http://localhost:3001/api";

export default function ExpenseForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ExpenseFormData>();
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const scanReceipt = async () => {
    if (!receiptImage) {
      setErrorMessage("Please select an image first");
      return;
    }
    setIsProcessing(true);
    setProgressUpdate("Initializing OCR...");
    try {
      const worker = await createWorker("eng", 1, {
        logger: m => setProgressUpdate(`Processing: ${(m.progress*100).toFixed(0)}%: ${m.status}`)
      });
      setProgressUpdate("Recognizing text...");
      const { data } = await worker.recognize(receiptImage);
      await worker.terminate();

      const text = data.text;
      console.log("OCR Text:", text);

      // Simple amount extraction: largest number
      const allAmounts = Array.from(text.matchAll(/\$?(\d+\.\d{2})/g))
        .map(m => parseFloat(m[1]))
        .filter(n => !isNaN(n));
      if (allAmounts.length) {
        setValue("amount", Math.max(...allAmounts).toFixed(2));
      }

      // Simple date extraction (MM/DD/YYYY)
      const dateMatch = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/);
      if (dateMatch) {
        const [m1, m2, y] = dateMatch[1].split(/[\/]/);
        const iso = `20${y.length===2?y:y}`.padStart(4, "20") + "-" +
                    m1.padStart(2,"0") + "-" +
                    m2.padStart(2,"0");
        setValue("date", iso);
      }

      setProgressUpdate("OCR complete!");
    } catch (err) {
      console.error(err);
      setErrorMessage("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!receiptImage) {
      setErrorMessage("Please select an image first");
      return;
    }
    setIsProcessing(true);
    setProgressUpdate("Saving expense...");
    try {
      const formData = new FormData();
      formData.append("receipt", receiptImage);
      formData.append("amount", data.amount);
      formData.append("date", data.date);
      formData.append("category", data.category);
      formData.append("memo", data.memo);

      const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();

      // reset form
      setReceiptImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setValue("amount", "");
      setValue("date", "");
      setValue("category", "");
      setValue("memo", "");
      setProgressUpdate("Expense saved!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Error saving expense: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block font-semibold">Upload Receipt</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="block w-full text-sm"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Receipt preview" className="mt-2 max-h-40" />
          )}
          <button
            type="button"
            onClick={scanReceipt}
            disabled={isProcessing}
            className="mt-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
          >
            {isProcessing ? "Processing..." : "Scan Receipt"}
          </button>
          {progressUpdate && <p className="text-blue-700">{progressUpdate}</p>}
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        </div>

        {/* Form Fields */}
        <div>
          <label className="block font-semibold">Amount</label>
          <input
            type="text"
            {...register("amount", { required: true })}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Date</label>
          <input
            type="date"
            {...register("date", { required: true })}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Category</label>
          <select
            {...register("category", { required: true })}
            className="mt-1 w-full border rounded p-2"
          >
            <option value="">Select a category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Travel">Travel</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Memo</label>
          <input
            type="text"
            {...register("memo", { required: true })}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isProcessing ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </div>
  );
}
