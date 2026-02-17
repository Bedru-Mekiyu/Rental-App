import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Upload,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";

import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import Card from "../components/Card";

export default function Payments() {
  const [rent] = useState(4500);
  const [dueDate] = useState("October 31, 2026");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const dueDateObj = new Date(dueDate);

  /* 🔹 Load payment history from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("paymentHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  /* 🔹 Save payment history */
  useEffect(() => {
    localStorage.setItem("paymentHistory", JSON.stringify(history));
  }, [history]);

  /* 🔹 Determine payment status */
  useEffect(() => {
    const today = new Date();
    if (history.length > 0 && history[0].status === "Paid") {
      setPaymentStatus("Paid");
      return;
    }

    if (today > dueDateObj) {
      setPaymentStatus("Overdue");
    } else if (dueDateObj - today < 7 * 24 * 60 * 60 * 1000) {
      setPaymentStatus("Due Soon");
    } else {
      setPaymentStatus("Upcoming");
    }
  }, [history]);

  /* 🔹 Digital Payment Handler */
  const handleDigitalPayment = async (method) => {
    setLoading(true);

    // Simulate API/delay
    await new Promise((r) => setTimeout(r, 1000));

    const newPayment = {
      id: Date.now(),
      amount: rent,
      date: new Date().toISOString(),
      status: "Paid",
      method,
      fileName: null,
    };

    setHistory((prev) => [newPayment, ...prev]);
    setLoading(false);
    toast.success(`${method} payment successful!`);
  };

  /* 🔹 Manual Receipt Handlers */
  const handleReceiptUpload = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Only image or PDF files allowed");
      setReceipt(null);
      return;
    }

    setError("");
    setReceipt(file);
  };

  const handleSubmitReceipt = async () => {
    if (!receipt) {
      setError("Please upload a receipt first");
      return;
    }

    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500));

    const newPayment = {
      id: Date.now(),
      amount: rent,
      date: new Date().toISOString(),
      status: "Paid",
      method: "Manual Receipt",
      fileName: receipt.name,
    };

    setHistory((prev) => [newPayment, ...prev]);
    setReceipt(null);
    setLoading(false);

    toast.success("Receipt submitted and verified successfully!");
  };

  const statusColor =
    paymentStatus === "Overdue"
      ? "text-red-500"
      : paymentStatus === "Due Soon"
      ? "text-yellow-500"
      : paymentStatus === "Paid"
      ? "text-green-500"
      : "text-gray-600";

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Payments" />

        {/* 🔹 Rent Overview */}
        <Card>
          <div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 font-medium">Current Monthly Rent</p>
              <CalendarDays className="text-indigo-500" />
            </div>

            <h2 className="text-indigo-500 text-3xl font-bold mt-2">
              ETB {rent.toLocaleString()}
            </h2>

            <p className="text-sm text-gray-400 mt-1">Due: {dueDate}</p>

            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              <span className={`font-medium ${statusColor}`}>{paymentStatus}</span>
            </div>
          </div>
        </Card>

        {/* 🔹 Digital Payments */}
        <Card>
          <p className="font-medium mb-3">Digital Payment Options</p>

          <div
            onClick={() => handleDigitalPayment("Telebirr")}
            className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">Telebirr</p>
              <p className="text-sm text-gray-400">Linked account: +251-912-345-678</p>
            </div>
            <span>›</span>
          </div>

          <div
            onClick={() => handleDigitalPayment("CBE Birr")}
            className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">CBE Birr</p>
              <p className="text-sm text-gray-400">Linked account: 1000012345678</p>
            </div>
            <span>›</span>
          </div>
        </Card>

        {/* 🔹 Manual Receipt Upload */}
        <Card>
          <p className="font-medium">Upload Manual Payment Receipt</p>
          <p className="text-sm text-gray-400 mt-1">
            Attach image or PDF of payment proof.
          </p>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <label className="mt-3 flex items-center justify-center gap-2 border rounded-md py-2 text-sm cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            Choose File
            <input
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => handleReceiptUpload(e.target.files[0])}
            />
          </label>

          {receipt && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <FileText className="w-4 h-4" />
              {receipt.name}
            </div>
          )}

          <button
            onClick={handleSubmitReceipt}
            disabled={!receipt || loading}
            className={`w-full mt-4 py-2 rounded-lg text-white ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {loading ? "Verifying..." : "Submit Receipt"}
          </button>
        </Card>

        {/* 🔹 Payment History */}
        {history.length > 0 && (
          <Card>
            <h3 className="font-semibold mb-3">Payment History</h3>

            {history.map((item) => (
              <div key={item.id} className="border-b py-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    ETB {item.amount.toLocaleString()} - {item.method}
                  </p>
                  <span className="text-green-500 flex items-center gap-1 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  {new Date(item.date).toLocaleString()}
                </p>

                {item.fileName && (
                  <p className="text-xs text-gray-500">File: {item.fileName}</p>
                )}
              </div>
            ))}
          </Card>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
