import React from 'react';
import { FileText, Save, CheckCircle } from 'lucide-react';

const CreateLease = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Lease</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Selection Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Tenant & Unit Selection</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Tenant Name</label>
              <input type="text" className="w-full p-2 border rounded mt-1" defaultValue="Abebe Kebede" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Unit Number</label>
              <input type="text" className="w-full p-2 border rounded mt-1" defaultValue="Unit 101-Studio" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Start Date</label>
                <input type="text" className="w-full p-2 border rounded mt-1" defaultValue="Dec 13, 2025" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">End Date</label>
                <input type="text" className="w-full p-2 border rounded mt-1" defaultValue="Dec 13, 2026" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Rent Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-4">Rent Calculation Summary</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr className="py-2"><td className="py-2">Base Rent</td><td className="text-right">ETB 15,000.00</td></tr>
              <tr className="py-2"><td className="py-2">Floor Adjustment</td><td className="text-right">ETB 500.00</td></tr>
              <tr className="py-2"><td className="py-2">Amenities Fee</td><td className="text-right">ETB 250.00</td></tr>
              <tr className="py-2"><td className="py-2 font-bold">Tax (15%)</td><td className="text-right">ETB 2,362.50</td></tr>
              <tr className="bg-blue-50">
                <td className="py-3 font-bold">Total Monthly Rent</td>
                <td className="py-3 text-right font-bold text-blue-600 text-lg">ETB 18,112.50</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-gray-200 py-2 rounded font-medium">Save Draft</button>
            <button className="flex-1 bg-blue-600 text-white py-2 rounded font-medium">Finalize Lease</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLease;