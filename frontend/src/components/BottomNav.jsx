import { Home, DollarSign, Wrench } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex bg-white p-3 shadow-md justify-around text-sm fixed bottom-0 right-0 left-0">
      
      {/* Dashboard */}
      <div
        onClick={() => navigate("/dashboard")}
        className={`flex flex-col items-center cursor-pointer ${
          isActive("/dashboard") ? "text-indigo-500" : "text-gray-400"
        }`}
      >
        <Home size={20} />
        <span>Dashboard</span>
      </div>

      {/* Payments */}
      <div
        onClick={() => navigate("/payments")}
        className={`flex flex-col items-center cursor-pointer ${
          isActive("/payments") ? "text-indigo-500" : "text-gray-400"
        }`}
      >
        <DollarSign size={20} />
        <span>Payments</span>
      </div>

      {/* Maintenance */}
      <div
        onClick={() => navigate("/maintenance")}
        className={`flex flex-col items-center cursor-pointer ${
          isActive("/maintenance") ? "text-indigo-500" : "text-gray-400"
        }`}
      >
        <Wrench size={20} />
        <span>Maintenance</span>
      </div>
    </div>
  );
}
