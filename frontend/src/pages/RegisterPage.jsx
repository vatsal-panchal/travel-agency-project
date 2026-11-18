import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthFrame } from '../components/auth/AuthFrame';

const checks = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'letter', label: 'One letter', test: (value) => /[a-zA-Z]/.test(value) },
  { id: 'number', label: 'One number', test: (value) => /\d/.test(value) },
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = useMemo(
    () => checks.map((check) => ({ ...check, passed: check.test(password) })),
    [password]
  );
  const passwordValid = passwordChecks.every((check) => check.passed);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Please choose a password that meets all three requirements.');
      return;
    }
    if (!accepted) {
      setError('Please accept the booking and privacy terms to continue.');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError(
          'Cannot reach the server. Make sure the backend is running, then try again.'
        );
      } else {
        setError(
          err.response.data?.message ||
            'We could not create your account just now. Please check your details and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85"
      imageAlt="A winding road through a quiet landscape"
      quote="A good trip begins long before the airport. It begins with someone listening properly."
      author="The Wanderlust studio"
    >
      <div className="mx-auto w-full max-w-md">
        <span className="eyebrow">Join the atelier</span>
        <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] text-ink sm:text-[3rem]">
          Your next journey starts{' '}
          <em className="font-light italic text-clay-500">here.</em>
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
          Create a free account to reserve seats, save journeys and keep every receipt in one
          place.
        </p>

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
            <label htmlFor="register-name" className="field-label">
              Full name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Morgan"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-email" className="field-label">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-password" className="field-label">
              Create a password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="A password you will remember"
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

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {passwordChecks.map((check) => (
                <span
                  key={check.id}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                    check.passed ? 'text-moss' : 'text-ink-400'
                  }`}
                >
                  <span
                    className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${
                      check.passed
                        ? 'border-moss bg-moss text-white'
                        : 'border-ink/20 bg-transparent'
                    }`}
                  >
                    {check.passed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  {check.label}
                </span>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-ink/10 bg-cream-100 p-3.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/20 text-clay-500 focus:ring-clay-500"
            />
            <span className="text-[11px] leading-relaxed text-ink-500">
              I agree to the booking terms, cancellation rules and privacy policy. I understand
              that payment is simulated in this demo environment.
            </span>
          </label>

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? (
              'Creating account…'
            ) : (
              <>
                Create free account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-clay-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
};
