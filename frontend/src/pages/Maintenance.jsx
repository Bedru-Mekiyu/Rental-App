import React from "react";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import Card from "../components/Card";

export default function Maintenance() {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden my-8">
        <AppHeader title="Maintenance" />
        <Card>
          <div>
            <h2 className="font-semibold mb-3">Submit New Request</h2>

            <label className="text-sm">Issue Category</label>
            <select className="w-full mt-1 mb-3 p-2 rounded bg-gray-200 outline-none">
              <option>Plumbing</option>
            </select>

            <label className="text-sm">Description</label>
            <textarea
              className="w-full mt-1 mb-3 p-2 rounded bg-gray-200 outline-none"
              rows="3"
              placeholder="Describe the issue in detail, including location and any symptoms."
            ></textarea>

            <label className="text-sm">Attach Photo (Optional)</label>

            <div className="border border-dashed rounded-lg p-4 mt-1 text-center text-gray-400">
              <div className="text-2xl">☁</div>
              <p className="text-sm">
                Drag and drop or click to upload an image
              </p>

              <div className="flex items-center justify-center mt-3 bg-gray-100 rounded p-2 text-xs">
                📄 image_of_leak.jpeg
              </div>
            </div>

            <button className="w-full mt-4 bg-indigo-500 text-white py-2 rounded-lg">
              Submit Request
            </button>
          </div>
        </Card>
        <Card>
          <div>
            <h3 className="font-semibold mb-3">Request Status</h3>

            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center text-indigo-500">
                <div className="w-6 h-6 border-2 border-indigo-500 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <span className="text-xs mt-1">Received</span>
              </div>

              <div className="h-0.5 w-full bg-indigo-500 mx-2"></div>

              <div className="flex flex-col items-center text-indigo-500">
                <div className="w-6 h-6 border-2 border-indigo-500 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <span className="text-xs mt-1">In Progress</span>
              </div>

              <div className="h-0.5 w-full bg-gray-300 mx-2"></div>

              <div className="flex flex-col items-center text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                <span className="text-xs mt-1">Completed</span>
              </div>
            </div>
          </div>
        </Card>
        <BottomNav />
      </div>
    </div>
  );
}
