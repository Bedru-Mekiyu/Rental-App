// src/components/ProtectedRoute.jsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuthStore } from "../store/authStore"; // ← Use Zustand now

import { Outlet } from "react-router-dom";
export default function ProtectedRoute() {
  return <Outlet />;
}

// export default function ProtectedRoute({ children }) {
//   const { user, loading } = useAuthStore(); // ← Get user and loading from Zustand

//   // Show loading spinner while checking auth state
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
//           <p className="mt-6 text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // If no user → redirect to login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // If user exists → render the protected content
//   return children ? children : <Outlet />;
// }
