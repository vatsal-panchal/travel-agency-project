import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthFrame } from '../components/auth/AuthFrame';

const demoAccounts = [
  {
    label: 'Traveller demo',
    email: 'traveler@test.com',
    password: 'Traveler@123',
  },
  {
    label: 'Admin demo',
    email: 'admin@travel.com',
    password: 'Admin@12345',
  },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from || '/dashboard';
  const notice = location.state?.notice;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError(
          'Cannot reach the server. Make sure the backend is running, then try again.'
        );
      } else {
        setError(
          err.response.data?.message ||
            'Those details did not match an account. Please check and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <AuthFrame
      image="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85"
      imageAlt="A quiet lake beneath alpine mountains"
      quote="The journey is the thing. We simply make sure the small details are already taken care of."
      author="Wanderlust travel atelier"
    >
      <div className="mx-auto w-full max-w-md">
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] text-ink sm:text-[3rem]">
          Pick up where you{' '}
          <em className="font-light italic text-clay-500">left off.</em>
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
          Sign in to view bookings, receipts and the journeys you have saved.
        </p>

        {notice && (
          <div className="mt-5 rounded-2xl border border-clay-200 bg-clay-50 px-4 py-3 text-[12px] font-semibold text-clay-800">
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="field-label">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <Link
                to="/contact"
                className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink-400 transition hover:text-clay-600"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                className="field-input pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition hover:bg-ink/[0.05] hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? (
              'Signing in…'
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-ink/10 bg-cream-100 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-clay-500" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
              Reviewer or staff access
            </p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">
            Use a demo account to explore the booking and admin flows. No real payment is taken.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoLogin(account)}
                className="flex-1 rounded-xl border border-ink/10 bg-cream-50 px-3 py-2 text-left transition hover:border-ink/25 hover:bg-white"
              >
                <span className="block text-[11px] font-extrabold text-ink">{account.label}</span>
                <span className="block truncate text-[10px] text-ink-400">{account.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-ink-400">
            <ShieldCheck className="h-3 w-3 text-moss" /> Credentials fill only. You still press
            sign in.
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-ink-500">
          New here?{' '}
          <Link to="/register" className="font-extrabold text-clay-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
};
