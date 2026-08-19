import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Mail,
  Key,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  Sparkles,
  User
} from 'lucide-react';
import { AdminUser } from '../types';
import { playAnimeClickSound, playSuccessChime, playWrongChime } from '../utils/audioSynth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  currentUser: AdminUser | null;
  onLogout: () => void;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'viewer';
  avatar?: string;
  createdAt: string;
}

// Master Admin Accounts
export const DEFAULT_ADMINS: StoredUser[] = [
  {
    id: 'admin-1',
    email: 'callmejodsenx@gmail.com',
    name: 'Senx (Lead Administrator)',
    password: 'Admin@2025',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-2',
    email: 'g92478140@gmail.com',
    name: 'Master Admin',
    password: 'Admin@2025',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [unregisteredNotice, setUnregisteredNotice] = useState(false);

  // Load all registered users from LocalStorage
  const getRegisteredUsers = (): StoredUser[] => {
    try {
      const saved = localStorage.getItem('aniverse_registered_users');
      if (saved) {
        const parsed: StoredUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_ADMINS;
  };

  const saveRegisteredUsers = (users: StoredUser[]) => {
    try {
      localStorage.setItem('aniverse_registered_users', JSON.stringify(users));
    } catch (e) {}
  };

  // Reset errors on mode change
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setUnregisteredNotice(false);
  }, [authMode, isOpen]);

  if (!isOpen) return null;

  // Handle User Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    playAnimeClickSound();
    setErrorMsg('');
    setUnregisteredNotice(false);

    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const allUsers = getRegisteredUsers();
    const existingUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    // If user is not registered at all
    if (!existingUser) {
      playWrongChime();
      setUnregisteredNotice(true);
      setErrorMsg('Aapka account create / register nahi hai. Pehle "Create Account" par click karke register karein!');
      return;
    }

    // Verify Password
    if (existingUser.password !== loginPassword) {
      playWrongChime();
      setErrorMsg('Galat Password! Baraye meharbani apna theek password enter karein.');
      return;
    }

    // Successful Login
    const userObj: AdminUser = {
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      avatar: existingUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      lastLogin: new Date().toISOString(),
    };

    playSuccessChime();
    onLoginSuccess(userObj);
    setErrorMsg('');
    setLoginEmail('');
    setLoginPassword('');
    onClose();
  };

  // Handle User Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    playAnimeClickSound();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Please enter your full name or username.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      playWrongChime();
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    const allUsers = getRegisteredUsers();
    const alreadyExists = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);

    if (alreadyExists) {
      playWrongChime();
      setErrorMsg('An account with this email is already registered! Please switch to Login.');
      return;
    }

    // Determine Role: Admin if admin email, else regular viewer/member
    const isAdminEmail =
      cleanEmail === 'callmejodsenx@gmail.com' || cleanEmail === 'g92478140@gmail.com';
    const assignedRole: 'admin' | 'viewer' = isAdminEmail ? 'admin' : 'viewer';

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      password: regPassword,
      role: assignedRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...allUsers, newUser];
    saveRegisteredUsers(updatedUsers);

    playSuccessChime();
    setSuccessMsg('Account successfully created! Logging you in...');

    setTimeout(() => {
      const userObj: AdminUser = {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
        lastLogin: new Date().toISOString(),
      };
      onLoginSuccess(userObj);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        playAnimeClickSound();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FF2D55] text-white">
              {authMode === 'login' ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[9px] font-black text-[#FF2D55] uppercase tracking-widest block">
                AKIANIME // PORTAL
              </span>
              <h3 className="text-base font-editorial-serif font-black italic uppercase text-white tracking-tight">
                {currentUser ? 'Active Account' : authMode === 'login' ? 'Login' : 'Create Account'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playAnimeClickSound();
              onClose();
            }}
            className="p-1.5 text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current user status if logged in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#141414] border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF2D55] text-white font-black flex items-center justify-center text-sm">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">{currentUser.name}</h4>
                  <p className="text-xs font-mono text-white/60">{currentUser.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40 uppercase font-bold text-[10px]">Account Role</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    currentUser.role === 'admin'
                      ? 'bg-[#FF2D55] text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'ADMINISTRATOR' : 'OTAKU MEMBER'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  playAnimeClickSound();
                  onLogout();
                }}
                className="w-full py-3 bg-[#1A1A1A] hover:bg-red-600 border border-white/15 text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-white text-black hover:bg-[#FF2D55] hover:text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tab Navigation: Login vs Create Account */}
            <div className="grid grid-cols-2 p-1 bg-[#141414] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  playAnimeClickSound();
                  setAuthMode('login');
                }}
                className={`py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#FF2D55] text-white shadow'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playAnimeClickSound();
                  setAuthMode('register');
                }}
                className={`py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#FF2D55] text-white shadow'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-red-950/70 border border-red-500/80 text-red-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
                {unregisteredNotice && (
                  <button
                    type="button"
                    onClick={() => {
                      playAnimeClickSound();
                      setRegEmail(loginEmail);
                      setAuthMode('register');
                    }}
                    className="w-full mt-1 py-1.5 bg-[#FF2D55] hover:bg-white hover:text-black text-white font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    Abhi Account Create Karein (Register Now)
                  </button>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 bg-[#121212] border border-white/10 flex items-start gap-2.5 text-xs text-white/70">
                  <ShieldCheck className="w-4 h-4 text-[#FF2D55] flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    Apna registered email aur password daal kar login karein.
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setErrorMsg('');
                        setUnregisteredNotice(false);
                      }}
                      required
                      placeholder="name@example.com"
                      className="w-full bg-[#141414] text-xs text-white placeholder-white/30 pl-9 pr-4 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                      placeholder="Enter your password"
                      className="w-full bg-[#141414] text-xs text-white placeholder-white/30 pl-9 pr-10 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-white text-black hover:bg-[#FF2D55] hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>

                {/* Switch to Register Prompt */}
                <div className="text-center pt-2 border-t border-white/10">
                  <p className="text-[11px] text-white/50">
                    Account nahi hai?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        playAnimeClickSound();
                        setAuthMode('register');
                      }}
                      className="text-[#FF2D55] hover:underline font-bold ml-1 cursor-pointer"
                    >
                      Create Account karein
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* CREATE ACCOUNT / REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="p-3 bg-[#121212] border border-white/10 flex items-start gap-2.5 text-xs text-white/70">
                  <Sparkles className="w-4 h-4 text-[#FF2D55] flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    Naya account banayein taake aap apni watchlist aur anime access kar sakein.
                  </div>
                </div>

                {/* Full Name / Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                    Full Name / Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                      placeholder="e.g. Kenji Otaku"
                      className="w-full bg-[#141414] text-xs text-white placeholder-white/30 pl-9 pr-4 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                      placeholder="name@example.com"
                      className="w-full bg-[#141414] text-xs text-white placeholder-white/30 pl-9 pr-4 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                    Create Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                      placeholder="At least 4 characters"
                      className="w-full bg-[#141414] text-xs text-white placeholder-white/30 pl-9 pr-10 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                      placeholder="Re-type your password"
                      className="w-full bg-[#141414] text-xs text-white placeholder-white/30 pl-9 pr-4 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#FF2D55] text-white hover:bg-white hover:text-black text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-3"
                >
                  <UserCheck className="w-4 h-4" />
                  Create Account (Register)
                </button>

                {/* Switch to Login Prompt */}
                <div className="text-center pt-2 border-t border-white/10">
                  <p className="text-[11px] text-white/50">
                    Pehle se account hai?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        playAnimeClickSound();
                        setAuthMode('login');
                      }}
                      className="text-[#FF2D55] hover:underline font-bold ml-1 cursor-pointer"
                    >
                      Login karein
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
