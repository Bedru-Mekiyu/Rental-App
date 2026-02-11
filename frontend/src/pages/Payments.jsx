import React, { useState } from "react";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import Card from "../components/Card";

export default function Payments() {
  const [rent] = useState(4500);
  const [dueDate] = useState("October 31, 2024");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleViewDetails = () => {
    alert("Opening payment details");
  };

  const handleSelectPayment = (method) => {
    alert(`${method} selected`);
  };

  const handleReceiptUpload = (file) => {
    if (!file) return;

    if (
      !file.type.startsWith("image/") &&
      file.type !== "application/pdf"
    ) {
      setError("Only image or PDF files are allowed");
      setReceipt(null);
      return;
    }

    setError("");
    setSuccess("");
    setReceipt(file);
  };

  const handleSubmitReceipt = () => {
    if (!receipt) {
      setError("Please upload a receipt before submitting");
      return;
    }

    setError("");

    
    console.log("Submitted receipt:", receipt);

    setSuccess("Receipt submitted successfully. Pending verification");
    setReceipt(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Payments" />

        {/* Current Rent */}
        <Card>
          <div>
            <div className="flex justify-between items-start">
              <p className="text-gray-600 font-medium">
                Current Monthly Rent
              </p>
              <span>📅</span>
            </div>

            <h2 className="text-indigo-500 text-3xl font-bold mt-2">
              ETB {rent.toLocaleString()}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Due: {dueDate}
            </p>

            <button
              onClick={handleViewDetails}
              className="text-indigo-500 text-sm mt-3 inline-block hover:underline"
            >
              View Details
            </button>
          </div>
        </Card>

        {/* Digital Payments */}
        <Card>
          <div>
            <p className="font-medium mb-3">
              Digital Payment Options
            </p>

            <div
              onClick={() => handleSelectPayment("Telebirr")}
              className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">Telebirr</p>
                <p className="text-sm text-gray-400">
                  Linked account: +251-912-345-678
                </p>
              </div>
              <span>›</span>
            </div>

            <div
              onClick={() => handleSelectPayment("CBE Birr")}
              className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">CBE Birr</p>
                <p className="text-sm text-gray-400">
                  Linked account: 1000012345678
                </p>
              </div>
              <span>›</span>
            </div>
          </div>
        </Card>

        {/* Manual Receipt Upload */}
        <Card>
          <div>
            <p className="font-medium">
              Upload Manual Payment Receipt
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Attach an image or PDF of your payment proof.
            </p>

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 mt-2">{success}</p>
            )}

            <label className="mt-3 flex items-center justify-center gap-2 border rounded-md py-2 text-sm cursor-pointer hover:bg-gray-50">
              ⬆ Choose File
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) =>
                  handleReceiptUpload(e.target.files[0])
                }
              />
            </label>

            {receipt && (
              <p className="text-xs text-gray-500 mt-2">
                📄 {receipt.name}
              </p>
            )}

           
            <button
              onClick={handleSubmitReceipt}
              disabled={!receipt}
              className={`w-full mt-4 py-2 rounded-lg text-white ${
                receipt
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : "bg-indigo-500 cursor-not-allowed"
              }`}
            >
              Submit Receipt
            </button>
          </div>
        </Card>

        <BottomNav />
      </div>
    </div>
  );
}
