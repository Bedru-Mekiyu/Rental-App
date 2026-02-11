import { Home, DollarSign, Wrench } from "lucide-react";

export default function BottomNav() {
 

  return (
    <div className="flex bg-white p-3 shadow-md justify-around text-sm fixed bottom-0 right-0 left-0">
      <div className="flex flex-col items-center text-indigo-500">
        🏠
        <span>Dashboard</span>
      </div>
      <div className="flex flex-col items-center text-gray-400">
        💲
        <span>Payments</span>
      </div>
      <div className="flex flex-col items-center text-gray-400">
        🔧
        <span>Maintenance</span>
      </div>
    </div>
  );
}
