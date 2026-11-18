import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  MessageSquare,
  Minus,
  Shield,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { packageApi } from '../api/packageApi';
import { bookingApi } from '../api/bookingApi';
import { reviewApi } from '../api/reviewApi';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/common/StarRating';
import { BookingModal } from '../components/booking/BookingModal';
import { PaymentModal } from '../components/booking/PaymentModal';
import { Reveal } from '../components/ui/Reveal';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
];

const categoryLabels = {
  beach: 'Beach & islands',
  mountain: 'Mountain',
  city: 'City & culture',
  adventure: 'Adventure',
  religious: 'Spiritual',
};

const formatLongDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

const formatShortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';

export const PackageDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [bookingLookupLoading, setBookingLookupLoading] = useState(false);
  const [bookingLookupError, setBookingLookupError] = useState('');
  const [bookingLookupAttempt, setBookingLookupAttempt] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openDays, setOpenDays] = useState({ 1: true });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const pkgRes = await packageApi.getById(id);
        if (!alive) return;
        setPkg(pkgRes.data?.package);

        try {
          const revRes = await reviewApi.getByPackage(id);
          if (alive) setReviews(revRes.data?.reviews || []);
        } catch {
          if (alive) setReviews([]);
        }
      } catch (err) {
        if (alive) setError(err.response?.data?.message || 'This journey could not be found.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    let alive = true;

    if (!isAuthenticated) {
      setExistingBooking(null);
      setBookingLookupError('');
      setBookingLookupLoading(false);
      return () => {
        alive = false;
      };
    }

    const loadExistingBooking = async () => {
      try {
        setBookingLookupLoading(true);
        setBookingLookupError('');
        const res = await bookingApi.getMyBookings({ packageId: id });
        const matches = res.data?.bookings || [];
        const booking =
          matches.find((item) => item.status === 'confirmed') ||
          matches.find((item) => item.status === 'pending') ||
          null;
        if (alive) setExistingBooking(booking);
      } catch (err) {
        if (alive) {
          setExistingBooking(null);
          setBookingLookupError(
            err.response?.data?.message || 'We could not check your existing booking.'
          );
        }
      } finally {
        if (alive) setBookingLookupLoading(false);
      }
    };

    loadExistingBooking();
    return () => {
      alive = false;
    };
  }, [id, isAuthenticated, bookingLookupAttempt]);

  const images = useMemo(() => {
    if (pkg?.images?.length) return pkg.images;
    return FALLBACK_IMAGES;
  }, [pkg]);

  const ratingBreakdown = useMemo(() => {
    const base = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const key = Math.round(Number(r.rating));
      if (base[key] !== undefined) base[key] += 1;
    });
    return base;
  }, [reviews]);

  const loadPackage = async () => {
    try {
      const pkgRes = await packageApi.getById(id);
      setPkg(pkgRes.data?.package);
      const revRes = await reviewApi.getByPackage(id);
      setReviews(revRes.data?.reviews || []);
    } catch {
      /* keep the currently rendered content on background refresh */
    }
  };

  const handleBookingCreated = (newBooking) => {
    setBookingModalOpen(false);
    setActiveBooking(newBooking);
    setExistingBooking(newBooking);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setExistingBooking((booking) => (booking ? { ...booking, status: 'confirmed' } : booking));
    loadPackage();
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (newReviewComment.trim().length < 10) {
      setReviewError('Please write a little more about your experience.');
      return;
    }

    try {
      setReviewSubmitting(true);
      await reviewApi.create(id, {
        rating: Number(newReviewRating),
        comment: newReviewComment.trim(),
      });
      setReviewSuccess(true);
      setNewReviewComment('');
      setNewReviewRating(5);
      await loadPackage();
    } catch (err) {
      setReviewError(
        err.response?.data?.message ||
          'Reviews open after you have completed a confirmed journey. You can only review a trip once.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x space-y-6 py-12">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-12 w-2/3" />
        <div className="skeleton aspect-[21/9] w-full rounded-[2rem]" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <div className="skeleton h-6 w-1/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-clay-50 text-clay-600">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-4xl text-ink">This journey has moved on.</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
          {error || 'The itinerary you are looking for is no longer available.'}
        </p>
        <Link to="/packages" className="btn-ink mt-6">
          Explore other journeys
        </Link>
      </div>
    );
  }

  const pkgId = pkg._id || pkg.id;
  const isSaved = isInWishlist(pkgId);
  const seats = Number(pkg.availableSeats) || 0;
  const totalSeats = Number(pkg.totalSeats) || seats || 1;
  const occupiedPercent = Math.min(96, Math.round(((totalSeats - seats) / totalSeats) * 100));
  const nights = Math.max(1, (Number(pkg.durationDays) || 1) - 1);

  return (
    <div className="pb-4">
      {/* Top meta */}
      <div className="container-x pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-ink-400">
            <Link to="/" className="transition hover:text-ink">
              Home
            </Link>
            <span>/</span>
            <Link to="/packages" className="transition hover:text-ink">
              Journeys
            </Link>
            <span>/</span>
            <span className="max-w-[180px] truncate text-clay-600">{pkg.destination}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-cream-50 px-3.5 py-2 text-[11px] font-extrabold text-ink-600 transition hover:border-ink/30 hover:text-ink"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-moss" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Link copied' : 'Share'}
            </button>
            <button
              onClick={async () => {
                const res = await toggleWishlist(pkg);
                if (res?.requireAuth) navigate('/login');
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-extrabold transition ${
                isSaved
                  ? 'border-clay-300 bg-clay-50 text-clay-700'
                  : 'border-ink/12 bg-cream-50 text-ink-600 hover:border-ink/30 hover:text-ink'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Title block */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_0.45fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="chip border-clay-200 bg-clay-50 text-clay-700">
                {categoryLabels[pkg.category] || pkg.category}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                <MapPin className="h-3.5 w-3.5 text-clay-500" />
                {pkg.destination}
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-[1.02] tracking-[-0.035em] text-ink sm:text-[3.4rem]">
              {pkg.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold text-ink-500">
              <StarRating rating={pkg.avgRating || 0} count={pkg.reviewCount || 0} size="sm" />
              <span className="hidden h-3 w-px bg-ink/15 sm:block" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-clay-500" />
                {pkg.durationDays} days / {nights} nights
              </span>
              <span className="hidden h-3 w-px bg-ink/15 sm:block" />
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-clay-500" />
                Departs {formatLongDate(pkg.startDate)}
              </span>
              <span className="hidden h-3 w-px bg-ink/15 sm:block" />
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-clay-500" />
                Small group · max {pkg.totalSeats}
              </span>
            </div>
          </div>

          <div className="hidden text-right lg:block">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
              From
            </p>
            <p className="mt-1 font-display text-[2.6rem] leading-none text-ink">
              ₹{Number(pkg.price).toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-ink-400">per person, twin share</p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container-x mt-8">
        <div className="grid gap-3 lg:grid-cols-[1.7fr_0.3fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-cream-300 sm:aspect-[21/9] lg:aspect-[16/8]">
            <img
              key={images[activeImageIndex]}
              src={images[activeImageIndex] || images[0]}
              alt={`${pkg.title} — view ${activeImageIndex + 1}`}
              className="h-full w-full animate-fade-in object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/60 to-transparent p-5">
              <span className="rounded-full bg-ink/40 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cream-100 backdrop-blur">
                {activeImageIndex + 1} / {images.length}
              </span>
              <span className="hidden items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cream-100/90 sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-clay-300" /> Handpicked itinerary
              </span>
            </div>
          </div>

          <div className="no-scrollbar flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
            {images.slice(0, 3).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative flex-1 overflow-hidden rounded-2xl border-2 transition-all lg:flex-none lg:aspect-auto lg:h-[calc(33.333%-8px)] ${
                  activeImageIndex === idx
                    ? 'border-clay-500'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  className="h-24 w-32 object-cover sm:h-28 sm:w-40 lg:h-full lg:w-full"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-x mt-12 grid gap-10 lg:grid-cols-[1.62fr_0.98fr] lg:gap-14">
        <div className="space-y-14">
          {/* Overview */}
          <Reveal>
            <section>
              <span className="eyebrow">The journey</span>
              <h2 className="mt-3 font-display text-[2rem] leading-tight text-ink">
                A considered way to see {pkg.destination?.split(',')[0]}.
              </h2>
              <p className="prose-travel mt-4 whitespace-pre-line text-pretty">{pkg.description}</p>

              <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-4">
                {[
                  ['Duration', `${pkg.durationDays} days`],
                  ['Group size', `Max ${pkg.totalSeats}`],
                  ['Departs', formatShortDate(pkg.startDate)],
                  ['Pickup', pkg.pickupLocation || 'Central meeting point'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-cream-50 p-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-[12.5px] font-extrabold text-ink" title={value}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Itinerary */}
          {pkg.itinerary?.length > 0 && (
            <Reveal>
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="eyebrow">Day by day</span>
                    <h2 className="mt-3 font-display text-[2rem] leading-tight text-ink">
                      How the {pkg.durationDays} days unfold.
                    </h2>
                  </div>
                  <span className="hidden text-[11px] font-bold text-ink-400 sm:block">
                    Tap a day to read more
                  </span>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-cream-50">
                  {pkg.itinerary.map((item, index) => {
                    const open = Boolean(openDays[item.day]);
                    return (
                      <div
                        key={item.day}
                        className={index !== 0 ? 'border-t border-ink/[0.07]' : ''}
                      >
                        <button
                          onClick={() =>
                            setOpenDays((prev) => ({ ...prev, [item.day]: !prev[item.day] }))
                          }
                          aria-expanded={open}
                          className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-cream-100/70"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/12 bg-cream-100 text-[11px] font-extrabold text-ink-600">
                            {String(item.day).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-[13.5px] font-extrabold text-ink sm:text-sm">
                            {item.title}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-300 ${
                              open ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <div
                          className="grid transition-all duration-300 ease-smooth"
                          style={{
                            gridTemplateRows: open ? '1fr' : '0fr',
                            opacity: open ? 1 : 0,
                          }}
                        >
                          <div className="overflow-hidden">
                            <p className="px-5 pb-5 pl-[72px] text-[13px] leading-[1.8] text-ink-500">
                              {item.details}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          )}

          {/* Inclusions */}
          <Reveal>
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-moss/20 bg-moss/[0.04] p-5">
                <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-moss text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  What is included
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {(pkg.inclusions?.length ? pkg.inclusions : ['Standard inclusions apply.']).map(
                    (item, i) => (
                      <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-clay-200/60 bg-clay-50/50 p-5">
                <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-clay-500 text-white">
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  What is not
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {(pkg.exclusions?.length
                    ? pkg.exclusions
                    : ['Personal expenses and travel insurance.']
                  ).map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-600">
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Reveal>

          {/* Cancellation */}
          <Reveal>
            <section className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-cream-50 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-200 text-ink-500">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-[13px] font-extrabold text-ink">Flexible cancellation</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                  {pkg.cancellationPolicy}
                </p>
              </div>
            </section>
          </Reveal>

          {/* Reviews */}
          <Reveal>
            <section id="reviews">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow">Traveller notes</span>
                  <h2 className="mt-3 font-display text-[2rem] leading-tight text-ink">
                    Reviews from completed journeys.
                  </h2>
                  <p className="mt-1.5 text-[12px] text-ink-400">
                    Only travellers who booked and finished this trip can write here.
                  </p>
                </div>
                <StarRating rating={pkg.avgRating || 0} count={pkg.reviewCount || 0} size="md" />
              </div>

              {/* Summary */}
              <div className="mt-6 grid gap-5 rounded-2xl border border-ink/10 bg-cream-50 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                <div className="flex flex-col items-center justify-center border-b border-ink/10 pb-5 text-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
                  <p className="font-display text-5xl leading-none text-ink">
                    {pkg.avgRating ? Number(pkg.avgRating).toFixed(1) : '—'}
                  </p>
                  <div className="mt-2">
                    <StarRating
                      rating={pkg.avgRating || 0}
                      showValue={false}
                      showCount={false}
                      size="sm"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">
                    {pkg.reviewCount || 0} verified
                  </p>
                </div>

                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingBreakdown[star] || 0;
                    const percent = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2.5">
                        <span className="flex w-8 items-center gap-1 text-[10px] font-bold text-ink-400">
                          {star}
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-5 text-right text-[10px] font-bold text-ink-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write review */}
              <div className="mt-5 rounded-2xl border border-ink/10 bg-cream-50 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-clay-600" />
                  <h3 className="text-[13px] font-extrabold text-ink">
                    {isAuthenticated ? `Write as ${user?.name?.split(' ')[0] || 'a traveller'}` : 'Completed this trip?'}
                  </h3>
                </div>

                {reviewSuccess && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-moss/25 bg-moss/[0.06] px-4 py-3 text-[12px] font-bold text-moss">
                    <CheckCircle2 className="h-4 w-4" />
                    Thank you. Your verified review is now live.
                  </div>
                )}
                {reviewError && (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
                    {reviewError}
                  </div>
                )}

                {!isAuthenticated ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="text-[12px] text-ink-500">
                      Sign in to write a review after your journey.
                    </p>
                    <Link to="/login" className="btn-ink btn-sm">
                      Sign in
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                    <div>
                      <span className="field-label">Your rating</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setNewReviewRating(value)}
                            aria-label={`${value} star${value > 1 ? 's' : ''}`}
                            className="rounded-md p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                value <= newReviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-transparent text-ink-200'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-[11px] font-bold text-ink-400">
                          {['Poor', 'Fair', 'Good', 'Very good', 'Outstanding'][newReviewRating - 1]}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="review-comment">
                        Your experience
                      </label>
                      <textarea
                        id="review-comment"
                        required
                        rows={3}
                        maxLength={500}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="What stood out? The guide, the stays, the small moments…"
                        className="field-input resize-none"
                      />
                      <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink-300">
                        <span>Be specific and kind. Reviews cannot be edited later.</span>
                        <span>{newReviewComment.length}/500</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting || newReviewComment.trim().length < 10}
                      className="btn-ink btn-sm"
                    >
                      {reviewSubmitting ? 'Posting…' : 'Post verified review'}
                    </button>
                  </form>
                )}
              </div>

              {/* List */}
              {reviews.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-ink/15 px-5 py-10 text-center">
                  <Star className="mx-auto h-6 w-6 text-ink-200" />
                  <p className="mt-2 text-[12px] font-semibold text-ink-400">
                    No reviews yet. Completed travellers will be the first to write one.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {reviews.map((rev) => (
                    <article
                      key={rev._id}
                      className="rounded-2xl border border-ink/10 bg-cream-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-[10px] font-extrabold uppercase text-cream-50">
                            {(rev.user?.name || 'T').slice(0, 2)}
                          </span>
                          <div>
                            <p className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-ink">
                              {rev.user?.name || 'Verified traveller'}
                              <CheckCircle2 className="h-3.5 w-3.5 text-moss" />
                            </p>
                            <p className="text-[10px] font-semibold text-ink-400">
                              Travelled {formatLongDate(rev.createdAt)}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} showCount={false} showValue={false} size="xs" />
                      </div>
                      <p className="mt-3 text-[13px] leading-[1.8] text-ink-600">{rev.comment}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </div>

        {/* Booking panel */}
        <aside className="lg:relative">
          <div className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[1.8rem] border border-ink/10 bg-cream-50 shadow-card">
              <div className="border-b border-ink/10 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
                      From, per person
                    </p>
                    <p className="mt-1 font-display text-[2.3rem] leading-none text-ink">
                      ₹{Number(pkg.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <StarRating
                    rating={pkg.avgRating || 0}
                    count={pkg.reviewCount || 0}
                    size="xs"
                  />
                </div>

                <div className="mt-5 space-y-2.5 text-[11.5px] font-semibold text-ink-500">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-clay-500" /> Departure
                    </span>
                    <span className="font-extrabold text-ink">{formatLongDate(pkg.startDate)}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-clay-500" /> Duration
                    </span>
                    <span className="font-extrabold text-ink">
                      {pkg.durationDays} days / {nights} nights
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-clay-500" /> Pickup
                    </span>
                    <span className="max-w-[150px] truncate text-right font-extrabold text-ink">
                      {pkg.pickupLocation || 'On request'}
                    </span>
                  </p>
                </div>

                {/* Availability */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.12em]">
                    <span className="text-ink-400">Availability</span>
                    <span className={seats <= 5 ? 'text-clay-600' : 'text-moss'}>
                      {seats === 0 ? 'Sold out' : `${seats} of ${totalSeats} seats left`}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={`h-full rounded-full ${seats <= 5 ? 'bg-clay-500' : 'bg-moss'}`}
                      style={{ width: `${Math.max(6, 100 - occupiedPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {existingBooking?.status === 'confirmed' ? (
                  <div className="rounded-2xl border border-moss/20 bg-moss/10 p-4">
                    <p className="flex items-center gap-2 text-[12px] font-extrabold text-moss">
                      <CheckCircle2 className="h-4 w-4" /> Booking confirmed
                    </p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
                      Your payment is complete and your seats are secured.
                    </p>
                    <Link
                      to="/dashboard?tab=bookings"
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink transition hover:text-clay-600"
                    >
                      View your booking <Check className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : existingBooking?.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBooking(existingBooking);
                        setPaymentModalOpen(true);
                      }}
                      className="btn-clay w-full py-4 text-[13px]"
                    >
                      Complete payment
                    </button>
                    <p className="mt-3 text-center text-[10.5px] font-semibold leading-relaxed text-ink-400">
                      You already have a seat hold for this journey. Complete payment to confirm it.
                    </p>
                  </>
                ) : bookingLookupLoading ? (
                  <button
                    type="button"
                    disabled
                    className="btn-clay w-full cursor-wait py-4 text-[13px] opacity-70"
                  >
                    Checking your booking…
                  </button>
                ) : bookingLookupError ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center"
                  >
                    <p className="text-[11px] font-semibold text-rose-700">{bookingLookupError}</p>
                    <button
                      type="button"
                      onClick={() => setBookingLookupAttempt((attempt) => attempt + 1)}
                      className="mt-2 text-[11px] font-extrabold text-rose-700 underline underline-offset-2"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(true)}
                      disabled={seats === 0}
                      className="btn-clay w-full py-4 text-[13px]"
                    >
                      {seats === 0 ? 'Sold out' : 'Reserve your seats'}
                    </button>
                    <p className="mt-3 text-center text-[10.5px] font-semibold leading-relaxed text-ink-400">
                      No charge until checkout. Seats are held for 15 minutes while you pay.
                    </p>
                  </>
                )}

                <div className="mt-5 space-y-2.5 border-t border-ink/10 pt-4">
                  {[
                    'Free cancellation within 48 hours',
                    'Secure encrypted checkout',
                    'Verified reviews from real travellers',
                  ].map((line) => (
                    <p key={line} className="flex items-center gap-2 text-[11px] font-semibold text-ink-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-moss" /> {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-cream-200/60 px-4 py-3 text-[10.5px] font-bold text-ink-500">
              <Shield className="h-3.5 w-3.5 text-moss" />
              Card details are never stored on our servers.
            </div>
          </div>
        </aside>
      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        pkg={pkg}
        onBookingCreated={handleBookingCreated}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        booking={activeBooking}
        packageData={pkg}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
