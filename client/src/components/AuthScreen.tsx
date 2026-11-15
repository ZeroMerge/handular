import React, { useState } from 'react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from './ui/icons';
import { StudentUser } from '../types';
import { Button } from './ui/button';
import { CustomDropdown } from './ui/CustomDropdown';

interface AuthScreenProps {
  apiBaseUrl: string;
  onAuthSuccess: (user: StudentUser, token: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  apiBaseUrl,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState('UNILAG');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campusOptions = [
    { value: 'UNILAG', label: 'University of Lagos (UNILAG)' },
    { value: 'UI', label: 'University of Ibadan (UI)' },
    { value: 'OAU', label: 'Obafemi Awolowo University (OAU)' },
    { value: 'FUTA', label: 'Fed. Univ. of Tech. Akure (FUTA)' },
    { value: 'UNIBEN', label: 'University of Benin (UNIBEN)' },
    { value: 'LASU', label: 'Lagos State University (LASU)' },
    { value: 'COVENANT', label: 'Covenant University' },
    { value: 'OTHER', label: 'Other Campus' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
        }
        onAuthSuccess(data.user, data.token);
      } else {
        if (!fullName.trim() || !phone.trim()) {
          throw new Error('Please enter your full name and WhatsApp phone number');
        }
        const res = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            fullName: fullName.trim(),
            phone: phone.trim(),
            campus,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed. Please try again.');
        }
        onAuthSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Network error connecting to Handular server');
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
          className="w-14 h-14 max-w-[56px] rounded-[10px] object-contain mx-auto"
        />
      </div>

      {/* Main Centered Squircle Card - ZERO BORDERS, ZERO SHADOWS, 18px RADIUS */}
      <div className="w-full max-w-[400px] bg-white rounded-[18px] p-6 sm:p-8">
        {/* Title - Clean, No Jargon, No Subheading */}
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#10393b]">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-50 text-red-600 text-xs flex items-center gap-2 font-normal">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-normal text-[#555555] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babatunde Fashola"
                    className="w-full h-11 pl-10 pr-4 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] placeholder:text-[#999999] outline-none transition-all focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#555555] mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full h-11 pl-10 pr-4 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] placeholder:text-[#999999] outline-none transition-all focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#555555] mb-1">
                  Campus Pickup Hub
                </label>
                <CustomDropdown
                  options={campusOptions}
                  value={campus}
                  onChange={setCampus}
                  icon={<MapPinIcon className="w-4 h-4" />}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-normal text-[#555555] mb-1">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@unilag.edu.ng"
                className="w-full h-11 pl-10 pr-4 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] placeholder:text-[#999999] outline-none transition-all focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
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
                className="w-full h-11 pl-10 pr-10 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] placeholder:text-[#999999] outline-none transition-all focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#10393b]"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1.5">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 text-sm font-normal"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-[#666666]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-normal text-[#10393b] hover:underline"
              >
                Create one
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#666666]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-normal text-[#10393b] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-6 text-center text-xs text-[#888888] flex items-center gap-2 font-normal">
        <span>Safe Campus Purchases</span>
        <span>•</span>
        <span>Verified Working Devices</span>
      </div>
    </div>
  );
};
