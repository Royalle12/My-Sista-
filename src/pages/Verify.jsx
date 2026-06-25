/**
 * src/pages/Verify.jsx
 * Sista Verification Page — OTP input blocks + resend countdown.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, MailWarning } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Verify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // References to input elements
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Autofocus first box on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Handle Input Changes
  const handleChange = (index, value) => {
    // Keep only numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is filled
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-trigger verification if all digits are entered
    if (newOtp.every((digit) => digit !== '')) {
      handleVerification(newOtp.join(''));
    }
  };

  // Handle Backspace Key Down
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current?.focus();
      } else if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle paste events
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) {
      toast.error('Please paste a 6-digit number');
      return;
    }

    const pasteDigits = pasteData.split('');
    setOtp(pasteDigits);
    inputRefs[5].current?.focus();
    handleVerification(pasteData);
  };

  // Trigger Verification (Simulated for prototype)
  const handleVerification = async (code) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setVerified(true);
    toast.success('Identity Verified Successfully! Welcome 🌸');
    
    // Redirect to onboarding after 2s
    setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 2000);
  };

  // Handle Resend Code Action
  const handleResend = () => {
    setResendTimer(60);
    toast.success('Verification code resent! Please check your inbox 🌸');
  };

  return (
    <div className="min-h-screen bg-[#F0F0E8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-scale-in">
        
        {/* Back Link */}
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-mid text-sm mb-6 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to portal
        </Link>

        {/* Verification Card */}
        <div className="card p-8 bg-white border border-primary/5 shadow-card text-center">
          
          {verified ? (
            /* ── SUCCESS STATE ── */
            <div className="py-8 animate-fade-in flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 animate-pulse-soft border border-green-200">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="font-display text-2xl font-bold text-dark mb-2">Sista Verified</h2>
              <p className="text-mid text-sm">
                Your portal is unlocked. Preparing your sacred space...
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            /* ── VERIFY CODE INPUT STATE ── */
            <div>
              <div className="w-14 h-14 rounded-2xl bg-soft flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={28} className="text-primary" />
              </div>

              <h2 className="font-display text-2xl font-semibold text-dark mb-2">Verify Your Account</h2>
              <p className="text-mid text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                We've sent a 6-digit confirmation code to your email. Enter it below to secure your circle.
              </p>

              {/* OTP Boxes */}
              <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold text-dark rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={loading || otp.some((d) => d === '')}
                onClick={() => handleVerification(otp.join(''))}
                className="w-full btn-primary justify-center bg-gradient-brand text-white py-3.5 mb-6"
              >
                {loading ? "Verifying code..." : "Confirm Code"}
              </button>

              {/* Resend Countdown */}
              <div className="mb-8 text-sm">
                {resendTimer > 0 ? (
                  <p className="text-mid font-medium">
                    Resend code in <span className="text-primary font-semibold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary hover:text-secondary font-semibold transition-colors underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              {/* Spam Tip Warning */}
              <div className="flex items-start gap-2.5 bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 text-left">
                <MailWarning size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-800">Check your spam folder</h4>
                  <p className="text-amber-700/80 text-2xs leading-relaxed mt-0.5">
                    If you don't see the email in your inbox within a couple of minutes, please check your promotion or junk mail filters.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
