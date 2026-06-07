import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

const OTPModal = ({ isOpen, onClose, onSubmit, loading, resendOtp }) => {
  const [code, setCode] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
        <p className="text-sm text-slate-400 mb-4">Enter the 8-digit code sent to your email to complete registration.</p>
        <input 
          type="text" 
          maxLength={8}
          className="bg-slate-800 border border-slate-600 text-white rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 outline-none transition-all mb-4 text-center tracking-[0.5em] text-xl font-mono placeholder:tracking-normal" 
          value={code} 
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="00000000"
        />
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all font-medium">Cancel</button>
            <button onClick={() => onSubmit(code)} disabled={loading || code.length !== 8} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all font-medium">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <button onClick={resendOtp} className="text-sm text-emerald-400 hover:text-emerald-300 mt-2">
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(username, email, password);
      toast.success('Registration successful! Check your email for the verification code.');
      setOtpModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setOtpVerifying(true);
    try {
      await api.post('/auth/verify-registration', { username, code });
      toast.success('Email verified! Logging you in...');
      setOtpModalOpen(false);
      
      // Auto login now that it's verified
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/auth/resend-verification', { username });
      toast.success('Verification code resent!');
    } catch (err) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <>
      <OTPModal 
        isOpen={otpModalOpen} 
        onClose={() => setOtpModalOpen(false)} 
        onSubmit={handleVerifyOTP} 
        loading={otpVerifying} 
        resendOtp={handleResendOTP} 
      />

      <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-emerald-500/20 border border-emerald-500/30">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">{t('auth.register')}</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="glass-card py-8 px-4 sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.username')}</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder={t('auth.username')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.password')}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : t('auth.signUp')}
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-slate-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
