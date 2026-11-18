import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Heart,
  KeyRound,
  Loader2,
  MapPin,
  ReceiptText,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import { paymentApi } from '../api/paymentApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { PaymentModal } from '../components/booking/PaymentModal';
import { PackageCard } from '../components/packages/PackageCard';
import { Reveal } from '../components/ui/Reveal';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value, options = {}) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

const statusStyles = {
  confirmed: 'border-moss/20 bg-moss/10 text-moss',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-moss/20 bg-moss/10 text-moss',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  refunded: 'border-ink/15 bg-ink/[0.06] text-ink-600',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${
      statusStyles[status] || statusStyles.pending
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);

const EmptyState = ({ icon, title, copy, action }) => {
  const Icon = icon;
  return (
    <div className="rounded-[2rem] border border-dashed border-ink/15 bg-cream-50 px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-200 text-ink-400">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <h2 className="mx-auto mt-5 max-w-md font-display text-3xl leading-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2.5 max-w-md text-[13px] leading-relaxed text-ink-500">{copy}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export const DashboardPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'bookings';

  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [bookingsRes, paymentsRes] = await Promise.all([
        bookingApi.getMyBookings(),
        paymentApi.getMyPayments(),
      ]);
      setBookings(bookingsRes.data?.bookings || []);
      setPayments(paymentsRes.data?.payments || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError(err.response?.data?.message || 'We could not load your account just now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      setActionError('');
      await bookingApi.cancel(bookingId);
      setConfirmCancelId(null);
      await fetchDashboardData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'We could not cancel this booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    try {
      setPasswordLoading(true);
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password updated. Other active sessions have been signed out.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Could not update the password. Check your current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const stats = useMemo(() => {
    const upcoming = bookings.filter(
      (booking) =>
        booking.status === 'confirmed' &&
        booking.package?.startDate &&
        new Date(booking.package.startDate) >= new Date()
    ).length;
    const spend = payments
      .filter((payment) => payment.status === 'success')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return { upcoming, spend };
  }, [bookings, payments]);

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, count: bookings.length },
    { id: 'payments', label: 'Receipts', icon: ReceiptText, count: payments.length },
    { id: 'wishlist', label: 'Saved', icon: Heart, count: wishlistItems.length },
    { id: 'settings', label: 'Account', icon: Settings },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Traveller';

  if (!isAuthenticated) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-6 w-6 animate-spin text-clay-500" />
        <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
          Opening your account
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-clip">
      {/* Account header */}
      <section className="bg-forest-deep text-cream-100">
        <div className="container-x py-10 sm:py-14">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cream-100/10 font-display text-3xl text-cream-50 ring-1 ring-cream-100/15">
                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-clay-300">
                  {user?.role === 'admin' ? 'Staff account' : 'Member account'}
                </span>
                <h1 className="mt-1.5 font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
                  Hello, {firstName}.
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-cream-200/55">
                  <span>{user?.email}</span>
                  <span className="text-cream-200/20">·</span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-clay-300" /> Secure account
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/packages" className="btn-light btn-sm">
                Find a journey <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream-100/20 px-4 py-2 text-[11px] font-extrabold text-cream-100 transition hover:bg-cream-100/10"
                >
                  Admin console <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Upcoming journeys', value: stats.upcoming, icon: CalendarDays },
              { label: 'Total trips', value: bookings.length, icon: Ticket },
              { label: 'Paid to date', value: formatCurrency(stats.spend), icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-cream-100/10 bg-cream-100/[0.05] px-4 py-3.5"
                >
                  <Icon className="h-4 w-4 text-clay-300" strokeWidth={1.7} />
                  <p className="mt-2 font-display text-2xl leading-none text-cream-50">{item.value}</p>
                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cream-200/45">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container-x py-8 sm:py-10">
        {/* Tabs */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-ink/10 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-extrabold transition ${
                  isActive
                    ? 'bg-ink text-cream-50 shadow-soft'
                    : 'text-ink-500 hover:bg-ink/[0.04] hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      isActive ? 'bg-cream-100/15 text-cream-100' : 'bg-ink/[0.06] text-ink-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {(error || actionError) && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || actionError}</span>
            <button
              type="button"
              onClick={() => {
                setError('');
                setActionError('');
              }}
              className="ml-auto text-[10px] font-extrabold uppercase tracking-wide underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="mt-6 space-y-3">
            {loading ? (
              [1, 2, 3].map((item) => (
                <div key={item} className="rounded-3xl border border-ink/10 bg-cream-50 p-5">
                  <div className="flex gap-4">
                    <div className="skeleton h-24 w-32 shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="skeleton h-3 w-20" />
                      <div className="skeleton h-5 w-1/2" />
                      <div className="skeleton h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No journeys booked yet."
                copy="When you reserve a place, it will appear here with your dates, travellers and payment status."
                action={
                  <Link to="/packages" className="btn-ink">
                    Explore journeys <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            ) : (
              bookings.map((booking) => {
                const pkg = booking.package;
                const isConfirming = confirmCancelId === booking._id;
                return (
                  <Reveal key={booking._id}>
                    <article className="rounded-3xl border border-ink/10 bg-cream-50 p-4 shadow-soft transition hover:shadow-card sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <Link
                          to={`/packages/${pkg?._id || pkg}`}
                          className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-cream-300 sm:h-28 sm:w-40"
                        >
                          <img
                            src={
                              pkg?.images?.[0] ||
                              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
                            }
                            alt={pkg?.title || 'Journey'}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={booking.status} />
                                <span className="text-[10px] font-semibold text-ink-400">
                                  Booked {formatDate(booking.createdAt)}
                                </span>
                              </div>
                              <h2 className="mt-2 truncate font-display text-2xl leading-tight text-ink">
                                {pkg?.title || 'Travel package'}
                              </h2>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-ink-400">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-clay-500" />
                                  {pkg?.destination || 'Destination'}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {booking.travelers}{' '}
                                  {booking.travelers === 1 ? 'traveller' : 'travellers'}
                                </span>
                                {pkg?.startDate && (
                                  <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    Departure {formatDate(pkg.startDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                                Total
                              </p>
                              <p className="text-lg font-extrabold text-ink">
                                {formatCurrency(booking.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 border-t border-ink/[0.08] pt-3">
                            {booking.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBookingForPayment(booking);
                                  setPaymentModalOpen(true);
                                }}
                                className="btn-clay btn-sm"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Complete payment
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <>
                                {isConfirming ? (
                                  <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-2 py-1">
                                    <span className="pl-1.5 text-[10px] font-bold text-rose-700">
                                      Cancel this trip?
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelBooking(booking._id)}
                                      disabled={cancellingId === booking._id}
                                      className="rounded-full bg-rose-600 px-3 py-1 text-[10px] font-extrabold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                    >
                                      {cancellingId === booking._id ? 'Cancelling…' : 'Yes, cancel'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmCancelId(null)}
                                      className="rounded-full px-2 py-1 text-[10px] font-extrabold text-rose-600 transition hover:bg-rose-100"
                                    >
                                      Keep it
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmCancelId(booking._id)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-2 text-[11px] font-extrabold text-ink-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                  >
                                    <XCircle className="h-3.5 w-3.5" /> Cancel booking
                                  </button>
                                )}
                              </>
                            )}
                            <Link
                              to={`/packages/${pkg?._id || pkg}`}
                              className="ml-auto inline-flex items-center gap-1 text-[11px] font-extrabold text-ink-500 transition hover:text-clay-600"
                            >
                              View journey <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })
            )}
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="mt-6">
            {payments.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No receipts yet."
                copy="Once a payment is completed, the receipt and transaction reference will be kept here."
                action={
                  <Link to="/packages" className="btn-ink">
                    Find a journey <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-soft">
                <div className="hidden grid-cols-[1.4fr_0.8fr_1fr_0.7fr_0.8fr] gap-4 border-b border-ink/10 bg-cream-100 px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-400 md:grid">
                  <span>Transaction</span>
                  <span>Amount</span>
                  <span>Card</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                <div className="divide-y divide-ink/[0.07]">
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_0.8fr_1fr_0.7fr_0.8fr] md:items-center md:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] font-bold text-ink">
                          {payment.transactionId || 'Session pending'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-400">
                          Booking {payment.booking?._id?.slice(-6) || '—'}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-ink">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-[11px] font-semibold text-ink-500">
                        {payment.cardLast4
                          ? `•••• ${payment.cardLast4} · ${payment.cardBrand || 'Card'}`
                          : '—'}
                      </p>
                      <div>
                        <StatusBadge status={payment.status} />
                      </div>
                      <p className="text-[11px] font-semibold text-ink-400">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="mt-6">
            {wishlistItems.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Nothing saved yet."
                copy="Tap the heart on any journey to keep it here for later. Saved trips sync across your devices."
                action={
                  <Link to="/packages" className="btn-ink">
                    Browse journeys <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((pkg, index) => (
                  <Reveal key={pkg._id || pkg.id} delay={(index % 3) * 70}>
                    <PackageCard pkg={pkg} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <Reveal>
              <div className="card-surface p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-cream-50">
                    <KeyRound className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl leading-tight text-ink">Change password</h2>
                    <p className="text-[11px] text-ink-400">
                      Other sessions will be signed out for safety.
                    </p>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-[12px] font-semibold text-moss">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="current-password" className="field-label">
                      Current password
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="field-label">
                      New password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Min 8 characters, one letter, one number"
                      className="field-input"
                    />
                  </div>
                  <button type="submit" disabled={passwordLoading} className="btn-ink">
                    {passwordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                      </>
                    ) : (
                      'Save new password'
                    )}
                  </button>
                </form>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="flex h-full flex-col justify-between rounded-3xl bg-forest-deep p-6 text-cream-100 sm:p-8">
                <div>
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100/10 text-clay-300">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h2 className="mt-5 font-display text-2xl leading-tight text-cream-50">
                    Your account, protected.
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-cream-200/60">
                    Payments are handled in a secure session and your full card number is never
                    stored. Only the last four digits are kept on receipts.
                  </p>
                  <dl className="mt-6 space-y-3 border-t border-cream-100/10 pt-5 text-[11px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-cream-200/45">Account</dt>
                      <dd className="truncate font-bold text-cream-50">{user?.email}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-cream-200/45">Role</dt>
                      <dd className="font-bold capitalize text-cream-50">{user?.role}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-cream-200/45">Member since</dt>
                      <dd className="font-bold text-cream-50">
                        {user?.createdAt ? formatDate(user.createdAt) : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-cream-100/20 px-4 py-2 text-[11px] font-extrabold text-cream-100 transition hover:bg-cream-100/10"
                >
                  Sign out of this device
                </button>
              </div>
            </Reveal>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        booking={selectedBookingForPayment}
        packageData={
          selectedBookingForPayment?.package &&
          typeof selectedBookingForPayment.package === 'object'
            ? selectedBookingForPayment.package
            : null
        }
        onPaymentSuccess={fetchDashboardData}
      />
    </div>
  );
};
