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

const API_URL = "http://localhost:3001/api";

export default function ExpenseForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ExpenseFormData>();
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptImage(file);
    setStatusMessage(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const scanReceipt = async () => {
    if (!receiptImage) {
      setStatusMessage("Please select an image first.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage("Initializing OCR...");
    try {
      const worker = await createWorker("eng", 1, {
        logger: m => setStatusMessage(`Processing: ${(m.progress * 100).toFixed(0)}%`)
      });
      setStatusMessage("Recognizing text...");
      const { data } = await worker.recognize(receiptImage);
      await worker.terminate();
      const text = data.text;
      console.log("OCR Text:", text);

      // Extract total amount
      const amounts = Array.from(text.matchAll(/\$?(\d+[\,\d]*\.\d{2})/g))
        .map(m => parseFloat(m[1].replace(/,/g, "")))
        .filter(n => !isNaN(n));
      if (amounts.length) setValue("amount", Math.max(...amounts).toFixed(2));

      // Extract and normalize date
      const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (dateMatch) {
        let [mo, da, yr] = dateMatch[1].split(/[\/\-]/);
        if (yr.length === 2) yr = '20' + yr;
        mo = mo.padStart(2, '0');
        da = da.padStart(2, '0');
        setValue("date", `${yr}-${mo}-${da}`);
      }

      setStatusMessage("OCR complete!");
    } catch {
      setStatusMessage("Error processing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsProcessing(true);
    setStatusMessage("Saving expense...");
    try {
      const formData = new FormData();
      if (receiptImage) formData.append("receipt", receiptImage);
      formData.append("amount", data.amount);
      formData.append("date", data.date);
      formData.append("category", data.category);
      formData.append("memo", data.memo);

      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error(await response.text());
      await response.json();
      setStatusMessage("Expense saved successfully!");

      // reset
      setReceiptImage(null);
      setImagePreview(null);
      fileInputRef.current && (fileInputRef.current.value = "");
      setValue("amount", "");
      setValue("date", "");
      setValue("category", "");
      setValue("memo", "");
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">Upload Receipt</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="w-full text-sm"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Receipt Preview"
                className="mt-2 w-full object-contain rounded"
              />
            )}
            <button
              type="button"
              onClick={scanReceipt}
              disabled={isProcessing || !receiptImage}
              className="mt-2 w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Scan Receipt"}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold">Amount</label>
              <input
                type="text"
                {...register("amount", { required: true })}
                className="mt-1 w-full border rounded p-2"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-600 text-sm">Required</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold">Date</label>
              <input
                type="date"
                {...register("date", { required: true })}
                className="mt-1 w-full border rounded p-2"
              />
              {errors.date && <p className="text-red-600 text-sm">Required</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold">Category</label>
              <select
                {...register("category", { required: true })}
                className="mt-1 w-full border rounded p-2"
              >
                <option value="">Select a category</option>
                <option>Food</option>
                <option>Transport</option>
                <option>Utilities</option>
                <option>Entertainment</option>
                <option>Shopping</option>
                <option>Travel</option>
                <option>Other</option>
              </select>
              {errors.category && <p className="text-red-600 text-sm">Required</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold">Memo</label>
              <input
                type="text"
                {...register("memo", { required: true })}
                className="mt-1 w-full border rounded p-2"
                placeholder="Add a note..."
              />
              {errors.memo && <p className="text-red-600 text-sm">Required</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? "Saving..." : "Save Expense"}
            </button>
          </div>

          {statusMessage && (
            <p className="text-center text-blue-600 mt-2">{statusMessage}</p>
          )}
        </form>
      </div>
    
  );
}
