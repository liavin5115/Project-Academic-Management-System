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
        <p className="text-sm text-slate-400 mb-4">Enter the 8-digit code sent to your email to log in.</p>
        <input 
          type="text" 
          maxLength={8}
          className="bg-slate-800 border border-slate-600 text-white rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 outline-none transition-all mb-4 text-center tracking-[0.5em] text-xl font-mono placeholder:tracking-normal" 
          value={code} 
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="00000000"
        />
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all font-medium">Cancel</button>
            <button onClick={() => onSubmit(code)} disabled={loading || code.length !== 8} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <button onClick={resendOtp} className="text-sm text-indigo-400 hover:text-indigo-300 mt-2">
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.detail === 'unverified_email') {
        toast.error('Please verify your email to log in.');
        setUnverifiedUser(username);
      } else {
        toast.error('Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      toast.success('If an account exists, a reset link was sent!');
      setIsForgotPassword(false);
    } catch (err) {
      toast.error('Failed to request reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setOtpVerifying(true);
    try {
      await api.post('/auth/verify-registration', { username: unverifiedUser, code });
      toast.success('Email verified! Logging you in...');
      setUnverifiedUser(null);
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
      await api.post('/auth/resend-verification', { username: unverifiedUser });
      toast.success('Verification code resent!');
    } catch (err) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <>
      <OTPModal 
        isOpen={!!unverifiedUser} 
        onClose={() => setUnverifiedUser(null)} 
        onSubmit={handleVerifyOTP} 
        loading={otpVerifying} 
        resendOtp={handleResendOTP} 
      />

      <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-indigo-500/20 border border-indigo-500/30">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            {isForgotPassword ? 'Reset Password' : t('auth.login')}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="glass-card py-8 px-4 sm:px-10">
            {!isForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.username')}</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder={t('auth.username')}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">{t('auth.password')}</label>
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-indigo-400 hover:text-indigo-300">
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : t('auth.signIn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <p className="text-sm text-slate-400 mb-4 text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
                >
                  Back to Login
                </button>
              </form>
            )}

            {!isForgotPassword && (
              <p className="mt-6 text-center text-sm text-slate-400">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  {t('auth.signUp')}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
