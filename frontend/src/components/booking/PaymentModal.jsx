import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { paymentApi } from '../../api/paymentApi';

const TEST_SUCCESS_CARD = '4242424242424242';
const TEST_DECLINE_CARD = '4000000000000002';

const CONFETTI = [
  { tx: '-72px', ty: '-46px', tr: '-120deg', color: '#C75B39', delay: '0ms' },
  { tx: '-94px', ty: '2px', tr: '-70deg', color: '#3E6B58', delay: '40ms' },
  { tx: '-60px', ty: '44px', tr: '-190deg', color: '#D9A441', delay: '80ms' },
  { tx: '-34px', ty: '68px', tr: '-250deg', color: '#13211C', delay: '20ms' },
  { tx: '72px', ty: '-46px', tr: '120deg', color: '#3E6B58', delay: '30ms' },
  { tx: '94px', ty: '2px', tr: '70deg', color: '#C75B39', delay: '70ms' },
  { tx: '60px', ty: '44px', tr: '190deg', color: '#E59E81', delay: '110ms' },
  { tx: '34px', ty: '68px', tr: '250deg', color: '#D9A441', delay: '10ms' },
  { tx: '-20px', ty: '-82px', tr: '-40deg', color: '#E59E81', delay: '50ms' },
  { tx: '20px', ty: '-82px', tr: '40deg', color: '#C75B39', delay: '90ms' },
  { tx: '-78px', ty: '-12px', tr: '-150deg', color: '#D9A441', delay: '60ms' },
  { tx: '78px', ty: '-12px', tr: '150deg', color: '#13211C', delay: '100ms' },
  { tx: '-50px', ty: '22px', tr: '-100deg', color: '#3E6B58', delay: '120ms' },
  { tx: '50px', ty: '22px', tr: '100deg', color: '#C75B39', delay: '130ms' },
  { tx: '-10px', ty: '76px', tr: '-300deg', color: '#3E6B58', delay: '140ms' },
  { tx: '12px', ty: '78px', tr: '300deg', color: '#D9A441', delay: '150ms' },
];

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatJourneyDate = (value) => {
  if (!value) return 'To be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'To be confirmed';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const onlyDigits = (value) => value.replace(/\D/g, '');

const luhnCheck = (number) => {
  const digits = onlyDigits(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

const detectBrand = (number) => {
  const digits = onlyDigits(number);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(0|5)/.test(digits)) return 'RuPay';
  if (/^35/.test(digits)) return 'JCB';
  if (/^6011/.test(digits)) return 'Discover';
  return 'Card';
};

const formatCardNumber = (value) => {
  const digits = onlyDigits(value).slice(0, detectBrand(value) === 'Amex' ? 15 : 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const isValidExpiry = (value) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const endOfMonth = new Date(year, month, 1);
  return endOfMonth > now;
};

const formatCountdown = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const PaymentModal = ({
  isOpen,
  onClose,
  booking,
  packageData,
  onPaymentSuccess,
}) => {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [showTestCards, setShowTestCards] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cvvVisible, setCvvVisible] = useState(false);

  const amount = Number(booking?.totalAmount || session?.amount || 0);
  const brand = detectBrand(cardNumber);
  const digits = onlyDigits(cardNumber);
  const expiresAt = booking?.expiresAt ? new Date(booking.expiresAt).getTime() : null;

  const journey =
    packageData ||
    (booking?.package && typeof booking.package === 'object' ? booking.package : null);
  const journeyTitle = journey?.title || 'Your Wanderlust journey';
  const destinationCity =
    (journey?.destination || '').split(',')[0].trim() || 'somewhere extraordinary';
  const travelerCount = Number(booking?.travelers || 1);
  const durationDays = Number(journey?.durationDays || 0);
  const departureDate = journey?.startDate;

  const barcodeBars = useMemo(() => {
    const seed = success?.transactionId || 'WANDERLUST';
    return Array.from({ length: 58 }, (_, index) => {
      const code = seed.charCodeAt(index % seed.length) || index * 7 + 3;
      return {
        width: (code % 3) + 1,
        height: 28 + ((code + index * 11) % 22),
      };
    });
  }, [success?.transactionId]);

  // Seat-lock countdown
  useEffect(() => {
    if (!isOpen || !expiresAt) return;
    const tick = () => setRemaining(expiresAt - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isOpen, expiresAt]);

  // Start a payment session whenever the modal opens for a booking.
  useEffect(() => {
    if (!isOpen || !booking?._id) return;
    let alive = true;

    const start = async () => {
      try {
        setInitLoading(true);
        setInitError('');
        setSession(null);
        setSuccess(null);
        setPayError('');
        setFieldErrors({});
        const res = await paymentApi.initiate(booking._id);
        if (alive) setSession(res.data?.payment || null);
      } catch (err) {
        if (alive) {
          setInitError(
            err.response?.data?.message ||
              'We could not open a secure payment session. Please try again.'
          );
        }
      } finally {
        if (alive) setInitLoading(false);
      }
    };

    start();
    return () => {
      alive = false;
    };
  }, [isOpen, booking, retryToken]);

  // Reset the form when opening a new booking.
  useEffect(() => {
    if (!isOpen) return;
    setCardHolder('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCvvVisible(false);
  }, [isOpen, booking?._id]);

  const lockExpired = expiresAt ? remaining <= 0 : false;
  const canSubmit = Boolean(session?._id) && !paying && !lockExpired && !initLoading;

  const cardDisplay = useMemo(() => {
    if (!digits) return '•••• •••• •••• ••••';
    const padded = digits.padEnd(brand === 'Amex' ? 15 : 16, '•');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  }, [digits, brand]);

  const validateForm = () => {
    const errors = {};
    if (cardHolder.trim().length < 2) {
      errors.cardHolder = 'Enter the name exactly as it appears on the card.';
    }
    if (!luhnCheck(cardNumber)) {
      errors.cardNumber = 'That card number does not look valid. Please check it.';
    }
    if (!isValidExpiry(expiry)) {
      errors.expiry = 'Use a future expiry date in MM/YY format.';
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPayError('');

    if (!validateForm()) return;

    try {
      setPaying(true);
      const res = await paymentApi.confirm(session._id, {
        cardNumber: digits,
        cardHolder: cardHolder.trim(),
        expiry,
        cvv,
      });
      const payment = res.data?.payment || null;
      setSuccess({
        payment,
        transactionId: payment?.transactionId || `TXN-${Date.now()}`,
        cardLast4: payment?.cardLast4 || digits.slice(-4),
        cardBrand:
          payment?.cardBrand && payment.cardBrand !== 'Unknown'
            ? payment.cardBrand
            : brand,
        amount,
        paidAt: new Date(),
      });
      if (onPaymentSuccess) onPaymentSuccess(payment);
    } catch (err) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.message;
      const friendly = {
        PAYMENT_DECLINED: 'Your bank declined this card. Try a different card.',
        INSUFFICIENT_FUNDS: 'There are not enough funds on this card.',
        INVALID_CARD: 'That card number failed our security check.',
        BOOKING_EXPIRED: 'Your 15-minute seat hold has expired. Please start a new booking.',
        BOOKING_CANCELLED: 'This booking was cancelled, so it can no longer be paid.',
        ALREADY_PAID: 'This booking has already been paid.',
      };
      setPayError(friendly[code] || message || 'Payment could not be completed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const fillTestCard = (number) => {
    setCardNumber(formatCardNumber(number));
    setCardHolder(cardHolder || 'Arjun Sharma');
    setExpiry(expiry || '12/28');
    setCvv(cvv || '123');
    setFieldErrors({});
    setPayError('');
  };

  const downloadReceipt = () => {
    if (!success) return;
    const lines = [
      'WANDERLUST TRAVEL ATELIER',
      'Payment receipt',
      '----------------------------------------',
      `Transaction: ${success.transactionId}`,
      `Date: ${success.paidAt.toLocaleString('en-IN')}`,
      `Journey: ${journeyTitle}`,
      `Destination: ${journey?.destination || 'To be confirmed'}`,
      `Departure: ${formatJourneyDate(departureDate)}`,
      `Travelers: ${travelerCount}`,
      `Card: ${success.cardBrand} ending ${success.cardLast4}`,
      `Amount paid: ${formatINR(success.amount)}`,
      'Status: Confirmed',
      '----------------------------------------',
      'This is a sandbox transaction generated by the demo payment gateway.',
      'Wanderlust Travel Atelier · concierge@wanderlust.agency',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${success.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const goToBookings = () => {
    onClose();
    navigate('/dashboard?tab=bookings');
  };

  /* ------------------------------ SUCCESS ------------------------------ */
  if (success) {
    const paidOn = success.paidAt.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[580px]" hideClose>
        <div className="relative py-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
            className="absolute -right-1 -top-1 z-20 grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-cream-50/90 text-ink-500 shadow-soft backdrop-blur transition hover:bg-ink hover:text-cream-50"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-lift">
            <div className="h-1.5 bg-gradient-to-r from-forest via-moss to-clay-400" />

            <div className="relative px-5 pb-7 pt-6 text-center sm:px-8 sm:pt-7">
              <div className="flex items-center justify-between gap-3 text-left">
                <p className="text-[8.5px] font-extrabold uppercase leading-tight tracking-[0.2em] text-ink-400">
                  Wanderlust
                  <span className="mt-0.5 block text-[7px] tracking-[0.26em] text-ink-300">
                    Travel atelier
                  </span>
                </p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-moss">
                  <CheckCircle2 className="h-3 w-3" /> Confirmed
                </span>
              </div>

              <div className="relative mx-auto mt-8 h-20 w-20">
                {CONFETTI.map((piece, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 h-2 w-1.5 animate-confetti-pop rounded-[1px]"
                    style={{
                      backgroundColor: piece.color,
                      '--tx': piece.tx,
                      '--ty': piece.ty,
                      '--tr': piece.tr,
                      animationDelay: piece.delay,
                    }}
                  />
                ))}
                <span className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-moss text-cream-50 shadow-[0_18px_40px_-16px_rgba(62,107,88,0.75)] ring-[7px] ring-moss/10">
                  <CheckCircle2 className="h-9 w-9" strokeWidth={1.6} />
                </span>
              </div>

              <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.22em] text-clay-600">
                Payment received
              </p>
              <h2 className="mx-auto mt-2 max-w-[19rem] font-display text-[2.2rem] leading-[1.03] text-ink sm:max-w-[24rem] sm:text-[2.7rem]">
                You&apos;re going to{' '}
                <em className="font-light italic text-clay-500">{destinationCity}</em>.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[12px] font-semibold leading-relaxed text-ink-500">
                {journeyTitle}
                {journey?.destination ? ` · ${journey.destination}` : ''}
              </p>

              <div className="mt-6 grid grid-cols-3 divide-x divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-cream-100/70 text-left">
                <div className="px-3 py-3 sm:px-4">
                  <p className="text-[7.5px] font-extrabold uppercase tracking-[0.15em] text-ink-400">
                    Departure
                  </p>
                  <p className="mt-1 text-[10.5px] font-extrabold leading-snug text-ink">
                    {formatJourneyDate(departureDate)}
                  </p>
                </div>
                <div className="px-3 py-3 sm:px-4">
                  <p className="text-[7.5px] font-extrabold uppercase tracking-[0.15em] text-ink-400">
                    Travellers
                  </p>
                  <p className="mt-1 text-[10.5px] font-extrabold leading-snug text-ink">
                    {travelerCount} {travelerCount === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <div className="px-3 py-3 sm:px-4">
                  <p className="text-[7.5px] font-extrabold uppercase tracking-[0.15em] text-ink-400">
                    Duration
                  </p>
                  <p className="mt-1 text-[10.5px] font-extrabold leading-snug text-ink">
                    {durationDays ? `${durationDays} days` : 'Curated'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative border-t border-dashed border-ink/20 bg-cream-100/45">
              <span
                aria-hidden="true"
                className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-cream-50"
              />
              <span
                aria-hidden="true"
                className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-cream-50"
              />

              <div className="px-5 pb-6 pt-5 sm:px-8">
                <div className="flex items-end justify-between gap-4 border-b border-ink/10 pb-4">
                  <div className="text-left">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
                      Total paid
                    </p>
                    <p className="mt-0.5 font-display text-[2.1rem] leading-none text-ink">
                      {formatINR(success.amount)}
                    </p>
                  </div>
                  <div className="pb-0.5 text-right">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                      Paid with
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-[10.5px] font-extrabold text-ink">
                      <CreditCard className="h-3.5 w-3.5 text-ink-400" />
                      {success.cardBrand} •••• {success.cardLast4}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold text-ink-400">{paidOn}</p>
                  </div>
                </div>

                <div className="mt-5" aria-hidden="true">
                  <div className="flex h-[52px] items-end justify-center gap-[2px] overflow-hidden">
                    {barcodeBars.map((bar, index) => (
                      <span
                        key={index}
                        className="shrink-0 bg-ink"
                        style={{ width: `${bar.width}px`, height: `${bar.height}px` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 break-all text-center text-[7.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
                    {success.transactionId}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button onClick={goToBookings} className="btn-ink flex-1">
                    View my bookings <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={downloadReceipt} className="btn-outline flex-1">
                    <Download className="h-4 w-4" /> Download receipt
                  </button>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[9.5px] font-semibold text-ink-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-moss" />
                  Sandbox transaction · no real money was charged
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  /* ------------------------------ CHECKOUT ------------------------------ */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Checkout · step 2 of 2"
      title="Secure payment"
      subtitle={booking?.package?.title || 'Complete your reservation'}
      maxWidth="max-w-2xl"
    >
      {initLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-7 w-7 animate-spin text-clay-500" />
          <p className="mt-3 text-[12px] font-bold text-ink-500">Opening secure session…</p>
          <p className="mt-1 text-[10px] font-semibold text-ink-300">
            Encrypted connection to the payment gateway
          </p>
        </div>
      ) : !booking?._id ? (
        <div className="py-10 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-clay-500" />
          <p className="mt-3 text-sm font-bold text-ink">No booking selected</p>
          <p className="mt-1 text-[12px] text-ink-500">
            Choose a pending booking from your dashboard to continue.
          </p>
        </div>
      ) : initError ? (
        <div className="py-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
            <p className="mt-3 text-[13px] font-bold text-rose-800">{initError}</p>
            <p className="mt-1 text-[11px] text-rose-600">
              A seat hold is valid for 15 minutes. If it expired, start a new booking.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                onClick={() => setRetryToken((value) => value + 1)}
                className="btn-ink btn-sm"
              >
                Try again
              </button>
              <button onClick={goToBookings} className="btn-outline btn-sm">
                Go to my bookings
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-5">
          {/* Summary strip */}
          <div className="flex flex-col gap-3 rounded-2xl bg-forest-deep p-5 text-cream-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-cream-200/55">
                Total to pay
              </p>
              <p className="mt-1 font-display text-[2rem] leading-none text-cream-50">
                {formatINR(amount)}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold text-cream-200/60">
                <Users className="h-3 w-3" /> {booking.travelers || 1} traveller
                {(booking.travelers || 1) > 1 ? 's' : ''} · all taxes included
              </p>
            </div>

            {expiresAt && (
              <div
                className={`flex items-center gap-2 self-start rounded-xl border px-3 py-2 sm:self-center ${
                  lockExpired
                    ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
                    : remaining < 120000
                    ? 'border-clay-400/40 bg-clay-500/15 text-clay-200'
                    : 'border-cream-100/15 bg-cream-100/[0.06] text-cream-100'
                }`}
              >
                <Timer className="h-4 w-4" />
                <div>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] opacity-70">
                    Seats held
                  </p>
                  <p className="font-mono text-sm font-bold leading-tight">
                    {lockExpired ? 'Expired' : formatCountdown(remaining)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {lockExpired && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Your seat hold has expired. Close this window and create a fresh booking to try again.
            </div>
          )}

          {payError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {payError}
            </div>
          )}

          {/* Card preview */}
          <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-cream-100 shadow-card">
            <div className="grain pointer-events-none absolute inset-0 opacity-30" />
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl"
              style={{ background: 'radial-gradient(circle, #C75B39, transparent 70%)' }}
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-cream-100/10">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-cream-200/50">
                    Wanderlust secure
                  </span>
                </div>
                <span className="font-display text-[15px] italic text-cream-100/80">{brand}</span>
              </div>

              <p className="mt-5 font-mono text-[17px] tracking-[0.14em] text-cream-50">
                {cardDisplay}
              </p>

              <div className="mt-4 flex items-end justify-between text-[10px]">
                <div>
                  <p className="text-[7px] font-extrabold uppercase tracking-[0.18em] text-cream-200/40">
                    Card holder
                  </p>
                  <p className="mt-0.5 max-w-[190px] truncate font-extrabold uppercase tracking-wide text-cream-100/90">
                    {cardHolder.trim() || 'YOUR NAME'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-extrabold uppercase tracking-[0.18em] text-cream-200/40">
                    Expires
                  </p>
                  <p className="mt-0.5 font-extrabold text-cream-100/90">{expiry || 'MM/YY'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="card-holder">
                Name on card
              </label>
              <input
                id="card-holder"
                type="text"
                autoComplete="cc-name"
                value={cardHolder}
                onChange={(e) => {
                  setCardHolder(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, cardHolder: undefined }));
                }}
                placeholder="As printed on the card"
                className={`field-input ${fieldErrors.cardHolder ? 'border-rose-400' : ''}`}
              />
              {fieldErrors.cardHolder && (
                <p className="field-error">
                  <AlertCircle className="h-3 w-3" /> {fieldErrors.cardHolder}
                </p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="card-number">
                Card number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(formatCardNumber(e.target.value));
                    setFieldErrors((prev) => ({ ...prev, cardNumber: undefined }));
                  }}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className={`field-input pl-11 font-mono tracking-wide ${
                    fieldErrors.cardNumber ? 'border-rose-400' : ''
                  }`}
                />
              </div>
              {fieldErrors.cardNumber && (
                <p className="field-error">
                  <AlertCircle className="h-3 w-3" /> {fieldErrors.cardNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="card-expiry">
                  Expiry
                </label>
                <input
                  id="card-expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiry}
                  onChange={(e) => {
                    setExpiry(formatExpiry(e.target.value));
                    setFieldErrors((prev) => ({ ...prev, expiry: undefined }));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`field-input font-mono ${fieldErrors.expiry ? 'border-rose-400' : ''}`}
                />
                {fieldErrors.expiry && (
                  <p className="field-error">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.expiry}
                  </p>
                )}
              </div>

              <div>
                <label className="field-label" htmlFor="card-cvv">
                  CVV
                </label>
                <div className="relative">
                  <input
                    id="card-cvv"
                    type={cvvVisible ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(onlyDigits(e.target.value).slice(0, 4));
                      setFieldErrors((prev) => ({ ...prev, cvv: undefined }));
                    }}
                    placeholder="123"
                    maxLength={4}
                    className={`field-input pr-12 font-mono ${
                      fieldErrors.cvv ? 'border-rose-400' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setCvvVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-extrabold uppercase tracking-wider text-ink-400 hover:text-ink"
                  >
                    {cvvVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
                {fieldErrors.cvv && (
                  <p className="field-error">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.cvv}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sandbox helper */}
          <div className="rounded-xl border border-ink/10 bg-cream-100/70 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowTestCards((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-ink-500">
                <Sparkles className="h-3.5 w-3.5 text-clay-500" />
                Sandbox test cards
              </span>
              <span className="text-[10px] font-bold text-ink-400">
                {showTestCards ? 'Hide' : 'Show'}
              </span>
            </button>

            {showTestCards && (
              <div className="mt-3 space-y-2 border-t border-ink/10 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] font-bold text-ink">4242 4242 4242 4242</p>
                    <p className="text-[10px] text-ink-400">Any future expiry · any CVV</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillTestCard(TEST_SUCCESS_CARD)}
                    className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-extrabold text-cream-50 transition hover:bg-forest"
                  >
                    Fill success card
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.07] pt-2">
                  <div>
                    <p className="font-mono text-[11px] font-bold text-ink">4000 0000 0000 0002</p>
                    <p className="text-[10px] text-ink-400">Simulates a bank decline</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillTestCard(TEST_DECLINE_CARD)}
                    className="rounded-full border border-ink/15 px-3 py-1.5 text-[10px] font-extrabold text-ink-600 transition hover:border-rose-300 hover:text-rose-600"
                  >
                    Fill declined card
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pay */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-clay w-full py-4 text-[13px] disabled:opacity-50"
          >
            {paying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Confirming with your bank…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Pay {formatINR(amount)} securely
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-ink-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-moss" />
              256-bit encrypted · PCI-style sandbox
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> Card details are never stored
            </span>
          </div>

          <p className="text-center text-[10px] leading-relaxed text-ink-300">
            This demo uses a simulated payment gateway. No real card is charged, and no card
            details leave this browser except for validation on the API.
          </p>
        </form>
      )}
    </Modal>
  );
};
