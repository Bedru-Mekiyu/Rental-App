import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Clock,
  CalendarDays,
  Wrench,
} from "lucide-react";

import AppHeader from "../components/AppHeader";
import Card from "../components/Card";
import BottomNav from "../components/BottomNav";

export default function Dashboard() {
  const [rent] = useState(8500);
  const [dueDate] = useState("October 25, 2024");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [maintenanceStatus] = useState("In Progress");

  const dueDateObj = new Date("October 25, 2026");
  const leaseEnd = new Date("December 31, 2026");

  /* PAYMENT STATUS LOGIC */

  useEffect(() => {
    const today = new Date();

    if (today > dueDateObj) {
      setPaymentStatus("Overdue");
    } else if (dueDateObj - today < 7 * 24 * 60 * 60 * 1000) {
      setPaymentStatus("Due Soon");
    } else {
      setPaymentStatus("Upcoming");
    }

    setLoading(false);
  }, []);

  /* LEASE DAYS REMAINING */

  const today = new Date();
  const daysRemaining = Math.ceil(
    (leaseEnd - today) / (1000 * 60 * 60 * 24)
  );

  /* HANDLERS */

  const handleViewDetails = () => {
    toast.success("Opening rent details...");
  };

  const handleManagePayments = async () => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPaymentStatus("Paid");
      toast.success("Payment completed successfully!");
    } catch {
      toast.error("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenewLease = () => {
    toast.success("Renewal request sent to property manager");
  };

  /*ICON STYLE*/

  const iconStyle = "w-5 h-5 text-indigo-500";

  /* LOADING SPINNER */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-b-4 border-indigo-600" />
      </div>
    );
  }


  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Dashboard" />

        <div className="space-y-4 p-4">

          {/*MONTHLY RENT*/}
          <Card>
            <div className="flex justify-between items-start mt-2">
              <div>
                <p className="text-gray-600 font-medium">Monthly Rent</p>
                <h2 className="text-indigo-500 text-3xl font-bold mt-2">
                  ETB {rent.toLocaleString()}.00
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Due by {dueDate}
                </p>

                <button
                  onClick={handleViewDetails}
                  className="text-indigo-500 text-sm mt-3 inline-block hover:underline"
                >
                  View Details
                </button>
              </div>

              <Mail className="w-6 h-6 text-indigo-500" />
            </div>
          </Card>

          {/*PAYMENT STATUS*/}
          <Card>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={iconStyle} />
                <p className="font-medium text-gray-700">
                  Payment Status
                </p>
              </div>

              <p
                className={`font-semibold mb-3 ${
                  paymentStatus === "Overdue"
                    ? "text-red-500"
                    : paymentStatus === "Due Soon"
                    ? "text-yellow-500"
                    : paymentStatus === "Paid"
                    ? "text-green-500"
                    : "text-gray-600"
                }`}
              >
                {paymentStatus}
              </p>

              <button
                onClick={handleManagePayments}
                className="text-indigo-500 text-sm hover:underline"
              >
                Manage Payments
              </button>
            </div>
          </Card>

          {/*LEASE EXPIRATION*/}
          <Card>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className={iconStyle} />
                <p className="font-medium">Lease Expiration</p>
              </div>

              <p className="text-indigo-500 text-sm">
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining`
                  : "Lease expired"}
              </p>

              <button
                onClick={handleRenewLease}
                className="mt-3 text-sm border rounded-md px-3 py-1 text-indigo-500 hover:bg-indigo-50"
              >
                Renew Lease
              </button>
            </div>
          </Card>

          {/* MAINTENACE */}
          <Card>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className={iconStyle} />
                <p className="font-medium">Maintenance Request</p>
              </div>

              <p className="font-semibold mt-2">
                Leaky Faucet in Kitchen
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-indigo-100 text-indigo-500 px-2 py-0.5 rounded">
                  {maintenanceStatus}
                </span>

                <span className="text-xs text-gray-400">
                  Last updated: October 15, 2024
                </span>
              </div>
            </div>
          </Card>

        </div>

        <BottomNav />
      </div>
    </div>
  );
}
