// src/App.jsx — Routes protégées + navigation + logout
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import FlashcardApp from "./FlashcardApp";
import HierarchyPage from "./HierarchyPage";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";

function NavBar() {
  const isLoggedIn = localStorage.getItem("auth") === "true";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <nav className="flex space-x-4 p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <Link className="hover:underline" to="/">🧠 Révision</Link>
      <Link className="hover:underline" to="/hierarchy">📚 Cours</Link>
      <Link className="hover:underline" to="/dashboard">📊 Tableau de bord</Link>
      {isLoggedIn ? (
        <button onClick={handleLogout} className="ml-auto text-red-500 hover:underline">Se déconnecter</button>
      ) : (
        <Link className="ml-auto hover:underline" to="/login">Se connecter</Link>
      )}
    </nav>
  );
}

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem("auth") === "true";
  const location = useLocation();
  return isLoggedIn ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

export default function App() {
  return (
    <Router>
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
        <NavBar />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<PrivateRoute><FlashcardApp /></PrivateRoute>} />
            <Route path="/hierarchy" element={<PrivateRoute><HierarchyPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
