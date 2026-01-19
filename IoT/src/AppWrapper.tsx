import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { isExpired } from "react-jwt";
import { jwtDecode } from "jwt-decode";

import App from "./App";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import SignUpForm from "./components/SignUpForm";
import ChartsPage from "./components/ChartsPage";
import AdminPage from "./components/AdminPage";

interface DecodedToken {
  _id: string;
  email: string;
  isAdmin: boolean;
}

const AppContent: React.FC = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const isLoggedIn = token && !isExpired(token);

  // Check if user is admin
  const isAdmin = (): boolean => {
    try {
      if (!token) return false;
      const decoded = jwtDecode(token) as DecodedToken;
      return decoded.isAdmin === true;
    } catch (e) {
      return false;
    }
  };

  return (
    <>
      {location.pathname !== "/" && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate replace to="/dashboard" /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isLoggedIn ? <Navigate replace to="/dashboard" /> : <SignUpForm />
          }
        />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <App /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/charts"
          element={isLoggedIn ? <ChartsPage /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/admin"
          element={isLoggedIn && isAdmin() ? <AdminPage /> : <Navigate replace to="/dashboard" />}
        />
        <Route
          path="/"
          element={
            <Navigate replace to={isLoggedIn ? "/dashboard" : "/login"} />
          }
        />
      </Routes>
    </>
  );
};

const AppWrapper: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default AppWrapper;
