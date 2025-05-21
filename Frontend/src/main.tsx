import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import { WalletProvider } from "@suiet/wallet-kit";
import ProtectedRoute from './components/ProtectedRoute';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <App interview_prompt="You are my girlfriend" />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </WalletProvider>
  </React.StrictMode>
);
