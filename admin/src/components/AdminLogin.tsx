import React, { useState } from 'react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from './ui/icons';
import { Button } from './ui/button';

interface AdminLoginProps {
  apiBaseUrl: string;
  onLoginSuccess: (user: any, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  apiBaseUrl,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid staff credentials');
      }
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Error connecting to admin auth server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4ef] flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#10393b] selection:text-white">
      {/* Brand Header - Standalone Full Logo Icon, Centered with Max Width */}
      <div className="flex justify-center mb-6">
        <img
          src="/handular_icon.png"
          alt="Handular"
          className="w-12 h-12 max-w-[48px] rounded-[6px] object-contain mx-auto"
        />
      </div>

      {/* Main Centered Squircle Card - ZERO BORDERS, ZERO SHADOWS, 10PX CURVE (2 levels reduced) */}
      <div className="w-full max-w-[380px] bg-white rounded-[10px] p-6 sm:p-8 animate-chat-morph">
        {/* Title - Clean without subheading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#10393b]">
            Admin Portal
          </h1>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-4 p-3 rounded-[6px] bg-red-50 text-red-600 text-xs flex items-center gap-2 font-normal">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-normal text-[#555555] mb-1">
              Staff Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@handular.com"
                className="w-full h-11 pl-10 pr-4 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] placeholder:text-[#999999] outline-none transition-all focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-[#555555] mb-1">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] placeholder:text-[#999999] outline-none transition-all focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#10393b] cursor-pointer"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1.5">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 text-sm font-normal"
              disabled={loading}
            >
              {loading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin-smooth text-white" />
              ) : (
                'Sign In to Ops'
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-[#888888] flex items-center gap-2 font-normal">
        <span>Handular Internal Platform</span>
        <span>•</span>
        <span>Fastify Backend</span>
        <span>•</span>
        <span>Zero Shadows & Borders</span>
      </div>
    </div>
  );
};
