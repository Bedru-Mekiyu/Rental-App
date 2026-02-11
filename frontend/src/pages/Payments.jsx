import React from "react";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import Card from "../components/Card";
export default function Payments() {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Payments" />
        <Card>
          <div>
            <div className="flex justify-between items-start">
              <p className="text-gray-600 font-medium">Current Monthly Rent</p>
              <span>📅</span>
            </div>

            <h2 className="text-indigo-500 text-3xl font-bold mt-2">
              ETB 4,500
            </h2>

            <p className="text-sm text-gray-400 mt-1">Due: October 31, 2024</p>
            <a className="text-indigo-500 text-sm mt-3 inline-block">
              View Details
            </a>
          </div>
        </Card>
        <Card>
            <div>
        <p className="font-medium mb-3">Digital Payment Options</p>

        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <p className="font-medium">Telebirr</p>
            <p className="text-sm text-gray-400">
              Linked account: +251-912-345-678
            </p>
          </div>
          <span>›</span>
        </div>
         <div className="flex justify-between items-center py-2">
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
        <Card>
            <div>
        <p className="font-medium">Upload Manual Payment Receipt</p>
        <p className="text-sm text-gray-400 mt-1">
          Attach an image or PDF of your payment proof.
        </p>

        <label className="mt-3 flex items-center justify-center gap-2 border rounded-md py-2 text-sm cursor-pointer">
          ⬆ Choose File
          <input type="file" hidden />
        </label>
      </div>
        </Card>
        <BottomNav />
      </div>
    </div>
  );
}
