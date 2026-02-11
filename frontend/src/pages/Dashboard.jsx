import React from "react";
import AppHeader from "../components/AppHeader";
import Card from "../components/Card";
import BottomNav from "../components/BottomNav";
export default function Dashboard() {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Dashboard" />
        <div>
          <Card>
            <div className="flex justify-between items-start mt-4">
              <p className="text-gray-600 font-medium">Monthly Rent</p>

              <div className="w-8 h-8 flex items-center justify-center">
                📩
              </div>
            </div>
            <h2 className="text-indigo-500 text-3xl font-bold mt-2">
              ETB 8,500.00
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Due by October 25, 2024
            </p>
            <button className="text-indigo-500 text-sm mt-3 inline-block">
              View Details
            </button>
          </Card>
          <Card>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span>⏰</span>
                <p className="font-medium text-gray-700">Payment Status</p>
              </div>

              <p className="font-semibold mb-3">Due Soon</p>

              <a href="#" class="text-indigo-500 text-sm">
                Manage Payments
              </a>
            </div>
          </Card>
          <Card>
            <div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <p className="font-medium">Lease Expiration</p>
              </div>

              <p className="font-semibold mt-2">December 31, 2024</p>
              <p className="text-indigo-500 text-sm">70 days remaining</p>

              <button className="mt-3 text-sm border rounded-md px-3 py-1 text-indigo-500">
                Renew Lease
              </button>
            </div>
          </Card>
          <Card>
            <div>
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <p className="font-medium">Maintenance Request</p>
              </div>

              <p className="font-semibold mt-2">Leaky Faucet in Kitchen</p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-indigo-100 text-indigo-500 px-2 py-0.5 rounded">
                  In Progress
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
