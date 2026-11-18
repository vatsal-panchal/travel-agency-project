import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { bookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

const emptyTraveler = (name = '') => ({ name, age: 28, gender: 'other' });

export const BookingModal = ({ isOpen, onClose, pkg, onBookingCreated }) => {
  const { user, isAuthenticated, login } = useAuth();

  const [travelerCount, setTravelerCount] = useState(1);
  const [travelersInfo, setTravelersInfo] = useState([emptyTraveler(user?.name || '')]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [inlineEmail, setInlineEmail] = useState('');
  const [inlinePassword, setInlinePassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showSignInForm, setShowSignInForm] = useState(false);

  const maxAllowed = Math.min(10, Number(pkg?.availableSeats) || 1);
  const unitPrice = Number(pkg?.price) || 0;
  const totalPrice = unitPrice * travelerCount;

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setTravelerCount(1);
      setTravelersInfo([emptyTraveler(user?.name || '')]);
    }
  }, [isOpen, user?.name]);

  useEffect(() => {
    if (user?.name) {
      setTravelersInfo((prev) => {
        if (prev[0]?.name) return prev;
        const next = [...prev];
        next[0] = { ...next[0], name: user.name };
        return next;
      });
    }
  }, [user?.name]);

  const changeCount = (next) => {
    const count = Math.max(1, Math.min(maxAllowed, next));
    setTravelerCount(count);
    setTravelersInfo((prev) => {
      const copy = [...prev];
      while (copy.length < count) copy.push(emptyTraveler());
      return copy.slice(0, count);
    });
  };

  const changeField = (index, field, value) => {
    setTravelersInfo((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setError('');
      await login({ email: inlineEmail, password: inlinePassword });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Please check your details.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setAuthLoading(true);
      setError('');
      await login({ email: 'traveler@test.com', password: 'Traveler@123' });
    } catch {
      setError('The demo account is unavailable. Run the backend seed script first.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (let i = 0; i < travelersInfo.length; i += 1) {
      const traveler = travelersInfo[i];
      if (!traveler.name || traveler.name.trim().length < 2) {
        setError(`Please enter a full name for traveller ${i + 1}.`);
        return;
      }
      if (!traveler.age || Number(traveler.age) < 1 || Number(traveler.age) > 120) {
        setError(`Please enter a valid age for traveller ${i + 1}.`);
        return;
      }
    }

    try {
      setLoading(true);
      const pkgId = pkg._id || pkg.id;
      const res = await bookingApi.create({
        packageId: pkgId,
        travelers: travelerCount,
        travelersInfo: travelersInfo.map((t) => ({
          name: t.name.trim(),
          age: Number(t.age),
          gender: t.gender,
        })),
      });
      const newBooking = res.data?.booking;
      if (!newBooking) throw new Error('Booking response was incomplete');
      onBookingCreated?.(newBooking);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'We could not hold these seats. They may have just been booked by someone else.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Reservation · step 1 of 2"
      title={isAuthenticated ? 'Who is travelling?' : 'Sign in to reserve'}
      subtitle={`${pkg?.title || 'Journey'} · ${pkg?.destination || ''}`}
      maxWidth="max-w-2xl"
    >
      {!isAuthenticated ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-ink/10 bg-cream-100 px-5 py-5 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-ink text-cream-50">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-display text-2xl text-ink">Your seats are almost held.</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-ink-500">
              Sign in to save travellers, keep your booking history and receive receipts.
              It takes less than a minute.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="button"
            disabled={authLoading}
            onClick={handleDemoLogin}
            className="btn-clay w-full py-3.5"
          >
            <Sparkles className="h-4 w-4" />
            {authLoading ? 'Signing in…' : 'Use the demo traveller account'}
          </button>

          {!showSignInForm ? (
            <button
              type="button"
              onClick={() => setShowSignInForm(true)}
              className="w-full text-center text-[11.5px] font-extrabold text-ink-500 underline underline-offset-4 hover:text-ink"
            >
              Or sign in with your own account
            </button>
          ) : (
            <form onSubmit={handleInlineLogin} className="space-y-3 border-t border-ink/10 pt-4">
              <div>
                <label className="field-label" htmlFor="booking-email">
                  Email
                </label>
                <input
                  id="booking-email"
                  type="email"
                  required
                  value={inlineEmail}
                  onChange={(e) => setInlineEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="booking-password">
                  Password
                </label>
                <input
                  id="booking-password"
                  type="password"
                  required
                  value={inlinePassword}
                  onChange={(e) => setInlinePassword(e.target.value)}
                  placeholder="••••••••"
                  className="field-input"
                />
              </div>
              <button type="submit" disabled={authLoading} className="btn-ink w-full">
                {authLoading ? 'Signing in…' : 'Sign in and continue'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Stepper */}
          <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-cream-100 px-5 py-4">
            <div>
              <p className="flex items-center gap-2 text-[12.5px] font-extrabold text-ink">
                <Users className="h-4 w-4 text-clay-500" /> Number of travellers
              </p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-ink-400">
                {pkg?.availableSeats} seats available · max 10 per booking
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => changeCount(travelerCount - 1)}
                disabled={travelerCount <= 1}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-cream-50 text-ink transition hover:bg-cream-200 disabled:opacity-30"
                aria-label="Fewer travellers"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center font-display text-xl text-ink">{travelerCount}</span>
              <button
                type="button"
                onClick={() => changeCount(travelerCount + 1)}
                disabled={travelerCount >= maxAllowed}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-cream-50 text-ink transition hover:bg-cream-200 disabled:opacity-30"
                aria-label="More travellers"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Traveler details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
                Traveller details
              </h4>
              <span className="text-[10px] font-semibold text-ink-300">As per government ID</span>
            </div>

            {travelersInfo.map((info, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-ink/10 bg-cream-50 p-4"
              >
                <p className="mb-3 flex items-center gap-2 text-[11px] font-extrabold text-ink-600">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-cream-200 text-[9px]">
                    {idx + 1}
                  </span>
                  Traveller {idx + 1}
                  {idx === 0 && (
                    <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-moss">
                      Lead
                    </span>
                  )}
                </p>

                <div className="grid gap-3 sm:grid-cols-[1.6fr_0.55fr_0.85fr]">
                  <div>
                    <label className="field-label" htmlFor={`t-name-${idx}`}>
                      Full name
                    </label>
                    <input
                      id={`t-name-${idx}`}
                      type="text"
                      required
                      value={info.name}
                      onChange={(e) => changeField(idx, 'name', e.target.value)}
                      placeholder="As on passport / ID"
                      className="field-input bg-white py-2.5"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`t-age-${idx}`}>
                      Age
                    </label>
                    <input
                      id={`t-age-${idx}`}
                      type="number"
                      min="1"
                      max="120"
                      required
                      value={info.age}
                      onChange={(e) => changeField(idx, 'age', e.target.value)}
                      className="field-input bg-white py-2.5"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`t-gender-${idx}`}>
                      Gender
                    </label>
                    <select
                      id={`t-gender-${idx}`}
                      value={info.gender}
                      onChange={(e) => changeField(idx, 'gender', e.target.value)}
                      className="field-input cursor-pointer bg-white py-2.5"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="rounded-2xl border border-ink/10 bg-cream-100 px-5 py-4">
            <div className="flex items-center justify-between text-[11.5px] font-semibold text-ink-500">
              <span>
                ₹{unitPrice.toLocaleString('en-IN')} × {travelerCount}{' '}
                {travelerCount === 1 ? 'traveller' : 'travellers'}
              </span>
              <span className="font-extrabold text-ink">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-2.5">
              <span className="text-[12px] font-extrabold text-ink">Total due</span>
              <span className="font-display text-2xl leading-none text-ink">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="mt-1.5 text-right text-[9.5px] font-semibold text-ink-400">
              All taxes and fees included
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-moss/20 bg-moss/[0.05] px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-moss" />
            <p className="text-[10.5px] font-semibold leading-relaxed text-ink-500">
              Seats are locked for <span className="font-extrabold text-ink">15 minutes</span>{' '}
              while you pay. Nothing is charged until you confirm on the next step.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !pkg?.availableSeats}
            className="btn-clay w-full py-4"
          >
            {loading ? (
              'Holding your seats…'
            ) : (
              <>
                Hold seats & continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};
