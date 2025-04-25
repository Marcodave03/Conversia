import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/landing-bg.jpg';
import logo from '../assets/conversia-lg.png';
import { addressEllipsis, ConnectButton, useWallet } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css"; 

const LandingPage: React.FC = () => {
  const wallet = useWallet();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(email, password);
        alert('Login successful!');
      } else {
        await signup(email, password);
        alert('Signup successful!');
      }
      navigate('/'); // Redirect to the main page upon success
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

     <div className="flex flex-col items-center">
      <img
        src={logo}
        alt="Conversia Logo"
        className="w-82 h-32 mb-6" 
      />


      <ConnectButton />
      <p>
        <span className='gradient'>Wallet Address : </span>{wallet.status}
      </p>
      {wallet.status === 'connected' && (
        <>
          <p>
            <span className="bg-gradient-to-tr"> Connected Account : </span>
            {wallet.account?.address}
          </p>
          <p>
            <span className="bg-gradient-to-t">Connected Account with ellipsis</span>
            {addressEllipsis(wallet.account?.address || '')}
          </p>
          <p>
            <span className="bg-gradient-to-t">Current chain of wallet</span>
            {wallet.chain?.name}
          </p>
          
          
        </>
      )}

      <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 w-full py-2 rounded hover:bg-blue-600 transition"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p
          className="mt-4 text-blue-400 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Create an account' : 'Already have an account? Sign In'}
        </p>
      </div>
    </div>
   </div>
  );
};

export default LandingPage;
