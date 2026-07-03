"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userName: string) => void;
  initialIsRegistering?: boolean;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialIsRegistering = false }: LoginModalProps) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [isRegistering, setIsRegistering] = useState(initialIsRegistering);
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [errorMessage, setErrorMessage]   = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsRegistering(initialIsRegistering);
      setErrorMessage('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setFullName('');
    }
  }, [isOpen, initialIsRegistering]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMessage('Please fill in all fields.'); return; }
    if (isRegistering && !fullName) { setErrorMessage('Please enter your full name.'); return; }
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      const name = isRegistering ? fullName : (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      setSuccessMessage(isRegistering ? 'Account created successfully!' : 'Signed in successfully!');
      if (onLoginSuccess) onLoginSuccess(name);
      setTimeout(() => { onClose(); window.location.reload(); }, 1000);
    }, 1400);
  };

  const handleSocial = (provider: string) => {
    const name = provider + ' User';
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    if (onLoginSuccess) onLoginSuccess(name);
    window.location.reload();
  };

  const toggle = () => { setIsRegistering(v => !v); setErrorMessage(''); setSuccessMessage(''); };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', padding:'16px', animation:'lm-fade 0.25s ease' }} onClick={onClose}>
      <style>{`
        @keyframes lm-fade { from { opacity:0; } to { opacity:1; } }
        @keyframes lm-slide { from { opacity:0; transform:translateY(18px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes lm-spin { to { transform:rotate(360deg); } }
        .lm-card { background:#fff; border-radius:24px; width:100%; max-width:420px; padding:0 0 28px; box-shadow:0 32px 80px rgba(0,0,0,0.25); animation:lm-slide 0.3s cubic-bezier(0.16,1,0.3,1); position:relative; font-family:var(--font-outfit),-apple-system,BlinkMacSystemFont,sans-serif; overflow:hidden; }
        .lm-card-top { background:#ffffff; padding:28px 36px 20px; text-align:center; position:relative; border-bottom:1px solid #f1f5f9; }
        .lm-card-body { padding:20px 36px 0; }
        .lm-close { position:absolute; top:14px; right:14px; width:28px; height:28px; border-radius:50%; border:none; background:#f3f4f6; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6b7280; transition:background 0.2s; z-index:1; }
        .lm-close:hover { background:#e5e7eb; color:#111; }
        .lm-logo { display:flex; justify-content:center; margin-bottom:12px; }
        .lm-logo img { height:56px; width:56px; object-fit:contain; border-radius:50%; border:1px solid #e2e8f0; background:#fff; padding:2px; }
        .lm-heading { text-align:center; font-size:21px; font-weight:800; color:#0f172a !important; margin:0 0 4px; letter-spacing:0.2px; font-family:var(--font-outfit),sans-serif !important; text-transform:none !important; }
        .lm-sub { text-align:center; font-size:13px; color:#64748b; margin:0; font-family:var(--font-outfit),sans-serif; }
        .lm-alert-err { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; font-size:13px; color:#dc2626; font-weight:600; margin-bottom:16px; }
        .lm-alert-ok  { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 14px; font-size:13px; color:#16a34a; font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:6px; }
        .lm-field { margin-bottom:13px; }
        .lm-label { display:block; font-size:13px; font-weight:700; color:#374151; margin-bottom:5px; letter-spacing:0.1px; font-family:var(--font-outfit),sans-serif !important; }
        .lm-input-wrap { position:relative; display:flex; align-items:center; border:1.5px solid #e2e8f0; border-radius:12px; height:50px; background:#fff; transition:border-color 0.2s, box-shadow 0.2s; overflow:hidden; }
        .lm-input-wrap:focus-within { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        .lm-icon { display:flex; align-items:center; justify-content:center; padding:0 12px; color:#9ca3af; flex-shrink:0; }
        .lm-input { flex:1; border:none; outline:none; background:transparent; font-size:14.5px; color:#0f172a; font-family:inherit; padding-right:12px; height:100%; }
        .lm-input::placeholder { color:#94a3b8; font-size:14px; }
        .lm-eye { background:none; border:none; cursor:pointer; color:#9ca3af; padding:0 12px; display:flex; align-items:center; }
        .lm-eye:hover { color:#6366f1; }
        .lm-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .lm-remember { display:flex; align-items:center; gap:7px; font-size:13.5px; color:#374151; cursor:pointer; }
        .lm-remember input[type=checkbox] { width:15px; height:15px; accent-color:#6366f1; cursor:pointer; }
        .lm-forgot { font-size:13.5px; color:#6366f1; font-weight:600; cursor:pointer; text-decoration:none; background:none; border:none; }
        .lm-forgot:hover { text-decoration:underline; }
        .lm-submit { width:100%; height:50px; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; letter-spacing:0.3px; cursor:pointer; font-family:inherit; transition:all 0.2s; box-shadow:0 4px 14px rgba(99,102,241,0.35); display:flex; align-items:center; justify-content:center; gap:8px; }
        .lm-submit:hover:not(:disabled) { background:linear-gradient(135deg,#4f46e5,#4338ca); box-shadow:0 6px 20px rgba(99,102,241,0.45); transform:translateY(-1px); }
        .lm-submit:disabled { background:#cbd5e1 !important; box-shadow:none !important; cursor:not-allowed; transform:none !important; color:#94a3b8; }
        .lm-spinner { width:20px; height:20px; border:2.5px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:lm-spin 0.7s linear infinite; }
        .lm-toggle { text-align:center; font-size:13.5px; color:#64748b; margin-top:16px; }
        .lm-toggle-link { color:#6366f1; font-weight:700; cursor:pointer; }
        .lm-toggle-link:hover { text-decoration:underline; }
        .lm-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
        .lm-divider-line { flex:1; height:1px; background:#e2e8f0; }
        .lm-divider-text { font-size:12px; font-weight:600; color:#94a3b8; letter-spacing:0.5px; text-transform:uppercase; white-space:nowrap; }
        .lm-social-row { display:flex; gap:12px; }
        .lm-social-btn { flex:1; height:46px; border:1.5px solid #e2e8f0; border-radius:12px; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; font-weight:600; color:#374151; font-family:inherit; transition:all 0.2s; }
        .lm-social-btn:hover { border-color:#6366f1; background:#fafafe; box-shadow:0 2px 8px rgba(99,102,241,0.12); }
        .lm-terms { text-align:center; font-size:11px; color:#94a3b8; margin-top:18px; line-height:1.5; }
        .lm-terms a { color:#6366f1; text-decoration:none; font-weight:600; }
      `}</style>

      <div className="lm-card" onClick={e => e.stopPropagation()}>

        {/* Gradient header */}
        <div className="lm-card-top">
          <button className="lm-close" onClick={onClose}><X size={13} strokeWidth={2.5} /></button>
          <div className="lm-logo">
            <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" alt="Braj Nidhi" />
          </div>
          <h2 className="lm-heading">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="lm-sub">{isRegistering ? 'Join Braj Nidhi for exclusive benefits' : 'Sign in to your Braj Nidhi account'}</p>
        </div>

        <div className="lm-card-body">
        {errorMessage   && <div className="lm-alert-err" style={{marginTop:'16px'}}>{errorMessage}</div>}
        {successMessage && <div className="lm-alert-ok" style={{marginTop:'16px'}}><Check size={14} strokeWidth={3} />{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="lm-field">
              <label className="lm-label">Full Name</label>
              <div className="lm-input-wrap">
                <span className="lm-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </span>
                <input className="lm-input" type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
              </div>
            </div>
          )}

          <div className="lm-field">
            <label className="lm-label">Email Address</label>
            <div className="lm-input-wrap">
              <span className="lm-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              </span>
              <input className="lm-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="lm-field">
            <label className="lm-label">Password</label>
            <div className="lm-input-wrap">
              <span className="lm-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input className="lm-input" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isRegistering ? 'new-password' : 'current-password'} />
              <button type="button" className="lm-eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="lm-row">
            <label className="lm-remember">
              <input type="checkbox" />
              Remember me
            </label>
            <button type="button" className="lm-forgot">Forgot password?</button>
          </div>

          <button type="submit" className="lm-submit" disabled={isLoading || !email || !password || (isRegistering && !fullName)}>
            {isLoading ? <div className="lm-spinner" /> : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="lm-toggle">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <span className="lm-toggle-link" onClick={toggle}>{isRegistering ? 'Sign In' : 'Sign Up'}</span>
        </p>

        <div className="lm-divider">
          <div className="lm-divider-line" />
          <span className="lm-divider-text">Or continue with</span>
          <div className="lm-divider-line" />
        </div>

        <div className="lm-social-row">
          <button type="button" className="lm-social-btn" onClick={() => handleSocial('Google')}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google
          </button>
          <button type="button" className="lm-social-btn" onClick={() => handleSocial('Apple')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.43c1.29.07 2.18.73 2.93.77.92-.04 1.81-.71 3.09-.82 1.52-.13 2.69.52 3.49 1.48-2.97 1.6-2.46 5.63.48 6.85-.5 1.48-1.18 2.95-1.99 4.57zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </button>
        </div>

        <p className="lm-terms">
          By continuing, you agree to our <a href="/privacy" target="_blank">Privacy Policy</a> and <a href="/terms" target="_blank">Terms of Service</a>
        </p>
        </div>{/* lm-card-body */}
      </div>
    </div>
  );
}
