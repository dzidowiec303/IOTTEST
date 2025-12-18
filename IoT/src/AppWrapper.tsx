import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { isExpired } from "react-jwt";

import App from "./App";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import SignUpForm from "./components/SignUpForm";

const AppContent: React.FC = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const isLoggedIn = token && !isExpired(token);

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
