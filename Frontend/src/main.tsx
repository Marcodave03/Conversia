import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import { AuthProvider } from "./context/AuthProvider";
import { WalletProvider } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import ProtectedRoute from "./components/ProtectedRoute";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <WalletProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <App interview_prompt="You are my girlfriend" />
                </ProtectedRoute>
              }
            />
            <Route path="/landing" element={<LandingPage />} />
          </Routes>
        </Router>
      </WalletProvider>
    </AuthProvider>
  </React.StrictMode>
);
