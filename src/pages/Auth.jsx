/**
 * src/pages/Auth.jsx
 * Identity Portal — Login + Register tabbed view with validation & Yoco-style/Supabase hooks.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { getProfile } from '../lib/supabase.js';
import toast from 'react-hot-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, routeAfterAuth } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  // Password Strength
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too short', color: 'bg-red-500' });

  // Forgot Password state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Refs for Autofocus
  const emailInputRef = useRef(null);
  const registerEmailRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'login' && !isForgotMode) {
      emailInputRef.current?.focus();
    } else if (activeTab === 'register') {
      registerEmailRef.current?.focus();
    }
  }, [activeTab, isForgotMode]);

  // Score password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Too short', color: 'bg-red-500/20' });
      return;
    }
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500';

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-green-600';
    } else if (score >= 2) {
      label = 'Good';
      color = 'bg-orange-500';
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const data = await login({ email, password });
      if (data.user) {
        try {
          const profile = await getProfile(data.user.id);
          routeAfterAuth(profile);
        } catch (err) {
          // If no profile exists yet, route to onboarding
          navigate('/onboarding', { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !nickname) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const data = await register({ email, password, displayName: nickname });
      if (data.user) {
        // Redirection to verification OTP flow
        navigate('/auth/verify', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submission
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Password reset link sent to ' + forgotEmail + ' 🌸');
    setIsForgotMode(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F0E8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Warm Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        
        {/* Back Link */}
        <Link 
          to="/" 
          id="auth-back-link" 
          className="inline-flex items-center gap-2 text-mid text-sm mb-6 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Auth Card */}
        <div className="card p-8 bg-white border border-primary/5 shadow-card animate-scale-in">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 mb-8 border-b border-primary/5 pb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-soft border border-primary/10">
              <img src="/my_sista_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-dark text-xl">My Sista</h1>
              <p className="text-mid text-xs">Your sacred wellness space</p>
            </div>
          </div>

          {isForgotMode ? (
            /* ── FORGOT PASSWORD STATE ── */
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-bold text-dark mb-2">Reset Password</h2>
              <p className="text-mid text-sm mb-6 leading-relaxed">
                Enter your email address and we'll send you a recovery link to access your circle.
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-mid" />
                    <input 
                      type="email" 
                      required
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary justify-center bg-gradient-brand text-white py-3.5 mt-2"
                >
                  Send Recovery Link
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsForgotMode(false)}
                  className="w-full text-center text-sm font-medium text-primary hover:text-secondary transition-colors mt-2"
                >
                  Back to Log In
                </button>
              </form>
            </div>
          ) : (
            /* ── STANDARD AUTH TABS STATE ── */
            <div>
              
              {/* Tab Selector */}
              <div className="flex bg-[#F0F0E8] rounded-xl p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={[
                    'w-1/2 text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === 'login' 
                      ? 'bg-white text-dark shadow-soft font-semibold' 
                      : 'text-mid hover:text-primary'
                  ].join(' ')}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={[
                    'w-1/2 text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === 'register' 
                      ? 'bg-white text-dark shadow-soft font-semibold' 
                      : 'text-mid hover:text-primary'
                  ].join(' ')}
                >
                  Join the Sisterhood
                </button>
              </div>

              {/* Login Form */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-mid" />
                      <input 
                        type="email" 
                        ref={emailInputRef}
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="label mb-0">Password</label>
                      <button 
                        type="button"
                        onClick={() => setIsForgotMode(true)}
                        className="text-xs font-semibold text-primary hover:text-secondary transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-mid" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input pl-10 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-mid hover:text-primary"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-primary justify-center bg-gradient-brand text-white py-3.5 mt-2"
                  >
                    {loading ? "Signing in..." : "Enter the Circle"}
                  </button>
                </form>
              )}

              {/* Register Form */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="label">Nickname</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-mid" />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Thandi"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                    <span className="text-mid text-2xs mt-1 block">This is how you will appear in discussions.</span>
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-mid" />
                      <input 
                        type="email" 
                        ref={registerEmailRef}
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-mid" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input pl-10 pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-mid hover:text-primary"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-2.5">
                        <div className="flex justify-between items-center mb-1 text-2xs font-semibold">
                          <span className="text-mid">Password Strength:</span>
                          <span className="text-dark">{passwordStrength.label}</span>
                        </div>
                        <div className="w-full bg-[#F0F0E8] h-1.5 rounded-full overflow-hidden flex gap-0.5">
                          <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${Math.min(100, passwordStrength.score * 20)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-mid" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-primary justify-center bg-gradient-brand text-white py-3.5 mt-2"
                  >
                    {loading ? "Creating account..." : "Join the Sisterhood"}
                  </button>
                </form>
              )}

              {/* Social Logins */}
              <div className="mt-8 border-t border-primary/5 pt-6 text-center">
                <p className="text-mid text-xs mb-4">Or continue with</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={loginWithGoogle}
                    className="flex items-center justify-center gap-2 border border-primary/10 rounded-xl py-2.5 hover:bg-soft text-sm font-medium transition-all"
                  >
                    {/* Google SVG Icon */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.48 0-6.3-2.82-6.3-6.3s2.82-6.3 6.3-6.3c1.64 0 3.1.63 4.2 1.66l3.05-3.05C18.96 2.37 15.82 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c5.96 0 10.5-4.22 10.5-10.5 0-.776-.08-1.5-.235-2.215h-10.265z"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button"
                    onClick={() => toast.success('Apple login placeholder clicked 🌸')}
                    className="flex items-center justify-center gap-2 border border-primary/10 rounded-xl py-2.5 hover:bg-soft text-sm font-medium transition-all"
                  >
                    {/* Apple SVG Icon */}
                    <svg className="w-4 h-4 fill-dark" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.23.67-2.95 1.51-.64.73-1.2 1.88-1.05 2.99 1.12.09 2.26-.57 3.01-1.44z"/>
                    </svg>
                    Apple
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
