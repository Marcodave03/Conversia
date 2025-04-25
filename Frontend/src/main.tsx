import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import LandingPage from '../src/pages/LandingPage';
import './App.css';
import { AuthProvider } from '../src/context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { WalletProvider } from "@suiet/wallet-kit";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          {/* <Route path="/" element={<App interview_prompt="You are my girlfriend" />}/> */}
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
    </AuthProvider>
  </React.StrictMode>
);
