import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

const LandingForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/users/login', { username: username, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md flex flex-col items-center relative"
      style={{
        background: '#2563EB33',
        borderRadius: '18px',
        padding: '2.5rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <style jsx>{`
        .gradient-border-form::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: 18px;
          padding: 2px;
          background: radial-gradient(circle at 60% 40%, #5B58FF 0%, #2563EB 40%, #7981B4AD 75%, #34374EAD 100%);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
      <div className="gradient-border-form absolute inset-0 pointer-events-none" />
      <div className="relative z-10 w-full">
        <h2 className="text-3xl font-extrabold text-white mb-1 text-left w-full">Welcome Back</h2>
        <p className="text-gray-200 text-opacity-80 mb-7 text-left w-full text-base">Please Enter Your Username & Password</p>
        <form className="w-full flex flex-col gap-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-white text-sm font-semibold mb-1" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-[#34374E] bg-opacity-80 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{fontWeight: 500}}
            />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-[#34374E] bg-opacity-80 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 placeholder-gray-400"
                placeholder="Enter Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{fontWeight: 500}}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                {/* Eye icon placeholder, add toggle logic if needed */}
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
              </span>
            </div>
          </div>
          {error && <div className="text-red-400 text-sm text-center mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center text-base"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
            <span className="ml-2">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingForm; 