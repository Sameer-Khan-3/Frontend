// pages/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove JWT
    localStorage.removeItem("user");  // optional: remove user info
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Dashboard</h1>
        <p className="mb-6 text-gray-600">Welcome to your dashboard!</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;