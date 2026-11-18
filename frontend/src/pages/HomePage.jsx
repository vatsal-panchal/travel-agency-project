import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Compass,
  MapPin,
  Quote,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { packageApi } from '../api/packageApi';
import { enquiryApi } from '../api/enquiryApi';
import { reviewApi } from '../api/reviewApi';
import { PackageCard } from '../components/packages/PackageCard';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { StarRating } from '../components/common/StarRating';

const categories = [
  {
    id: 'beach',
    title: 'Beach & islands',
    subtitle: 'Slow days, warm water',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'mountain',
    title: 'Mountain air',
    subtitle: 'Alpine trails & peaks',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'adventure',
    title: 'Wild places',
    subtitle: 'Safari & adrenaline',
    image:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'city',
    title: 'City & culture',
    subtitle: 'Food, art, after dark',
    image:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'religious',
    title: 'Quiet pilgrimage',
    subtitle: 'Heritage & stillness',
    image:
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80',
  },
];

const marqueePlaces = [
  'Bali',
  'Santorini',
  'Serengeti',
  'Kyoto',
  'Maldives',
  'Swiss Alps',
  'Varanasi',
  'Amalfi',
  'Banff',
  'Dubai',
  'Rishikesh',
  'Paris',
];

const avatarInitials = ['AM', 'RK', 'SA', 'DW', 'PN'];

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0 });

  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');

  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadHome = async () => {
      try {
        setLoading(true);
        const [pkgRes, reviewRes] = await Promise.allSettled([
          packageApi.getAll({ limit: 6, sort: 'rating_desc' }),
          reviewApi.getFeatured({ limit: 6 }),
        ]);

        if (!alive) return;

        if (pkgRes.status === 'fulfilled') {
          setFeatured(pkgRes.value.data?.packages || []);
        }
        if (reviewRes.status === 'fulfilled') {
          setReviews(reviewRes.value.data?.reviews || []);
          if (reviewRes.value.data?.stats) setReviewStats(reviewRes.value.data.stats);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadHome();
    return () => {
      alive = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('search', destination.trim());
    if (category) params.set('category', category);
    navigate(`/packages${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleQuickSearch = (value) => {
    navigate(`/packages?search=${encodeURIComponent(value)}`);
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySuccess(false);
    try {
      setEnquiryLoading(true);
      await enquiryApi.submit(enquiry);
      setEnquirySuccess(true);
      setEnquiry({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setEnquiryError(
        err.response?.data?.message ||
          'We could not send your request just now. Please try again in a moment.'
      );
    } finally {
      setEnquiryLoading(false);
    }
  };

  const ratingLabel = reviewStats.avgRating
    ? reviewStats.avgRating.toFixed(1)
    : '4.9';
  const reviewLabel = reviewStats.totalReviews
    ? `${reviewStats.totalReviews} verified reviews`
    : 'Verified traveller reviews';

  const heroPackage = useMemo(() => featured[0], [featured]);

  return (
    <div className="overflow-x-clip">
      {/* ============================= HERO ============================= */}
      <section className="relative">
        <div className="container-x grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-24 lg:pt-16">
          <div className="relative z-10">
            <Reveal>
              <span className="eyebrow">Small-group journeys · Est. 2014</span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="display-hero mt-5 max-w-[15ch] text-[3.35rem] text-ink sm:text-[4.5rem] lg:text-[5.2rem]">
                Go somewhere that{' '}
                <em className="font-light italic text-clay-500">stays with you.</em>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-500 sm:text-base">
                Thoughtfully paced itineraries, local guides who actually live there, and
                small groups that leave room for the unexpected. We handle the details, so
                you can be present for the good parts.
              </p>
            </Reveal>

            {/* Search */}
            <Reveal delay={240}>
              <form
                onSubmit={handleSearch}
                className="mt-9 max-w-2xl rounded-[1.6rem] border border-ink/10 bg-cream-50 p-2 shadow-card"
              >
                <div className="grid items-stretch gap-1 sm:grid-cols-[1.25fr_0.9fr_auto]">
                  <label className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition focus-within:bg-cream-100">
                    <MapPin className="h-4 w-4 shrink-0 text-clay-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                        Where to
                      </span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Bali, Kyoto, Serengeti…"
                        className="mt-0.5 w-full truncate bg-transparent text-[13px] font-bold text-ink placeholder:font-medium placeholder:text-ink-300 focus:outline-none"
                      />
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border-t border-ink/[0.07] px-4 py-3 text-left transition focus-within:bg-cream-100 sm:border-l sm:border-t-0">
                    <Compass className="h-4 w-4 shrink-0 text-clay-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                        Journey type
                      </span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-0.5 w-full cursor-pointer truncate bg-transparent text-[13px] font-bold text-ink focus:outline-none"
                      >
                        <option value="">Any experience</option>
                        <option value="beach">Beach & islands</option>
                        <option value="mountain">Mountain</option>
                        <option value="adventure">Adventure & safari</option>
                        <option value="city">City & culture</option>
                        <option value="religious">Spiritual</option>
                      </select>
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="btn-clay h-full min-h-[54px] gap-2 rounded-2xl px-7"
                  >
                    <Search className="h-4 w-4" />
                    <span className="sm:hidden lg:inline">Search</span>
                  </button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                  Popular
                </span>
                {['Bali', 'Swiss Alps', 'Maldives', 'Japan'].map((place) => (
                  <button
                    key={place}
                    onClick={() => handleQuickSearch(place)}
                    className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-bold text-ink-600 transition hover:border-clay-400 hover:text-clay-700"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Trust row */}
            <Reveal delay={320}>
              <div className="mt-9 flex flex-wrap items-center gap-6 border-t border-ink/10 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {avatarInitials.map((initials, i) => (
                      <span
                        key={initials}
                        className={`grid h-8 w-8 place-items-center rounded-full border-2 border-cream-100 text-[9px] font-extrabold ${
                          ['bg-forest text-cream-50', 'bg-clay-500 text-white', 'bg-cream-300 text-ink', 'bg-ink-600 text-cream-50', 'bg-moss text-white'][i]
                        }`}
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="h-3 w-3 fill-current" strokeWidth={0} />
                      ))}
                      <span className="ml-1 text-[11px] font-extrabold text-ink">{ratingLabel}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-ink-400">{reviewLabel}</p>
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-ink/10 sm:block" />

                <p className="flex items-center gap-2 text-[11px] font-bold text-ink-500">
                  <ShieldCheck className="h-4 w-4 text-moss" />
                  Secure checkout · Free cancellation within 48h
                </p>
              </div>
            </Reveal>
          </div>

          {/* Hero collage */}
          <Reveal delay={180} className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.4rem] bg-cream-300 shadow-lift">
                <img
                  src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1100&q=80"
                  alt="Santorini caldera at golden hour"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-cream-200/80">
                      Editor’s pick · Greece
                    </p>
                    <p className="mt-1 font-display text-2xl leading-tight text-white">
                      Santorini & the Cyclades
                    </p>
                  </div>
                  <Link
                    to="/packages?search=Greece"
                    aria-label="View Santorini journey"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream-50 text-ink transition hover:bg-clay-500 hover:text-white"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Secondary image */}
              <div className="absolute -bottom-8 -left-4 hidden w-[42%] overflow-hidden rounded-[1.6rem] border-4 border-cream-100 shadow-card sm:block lg:-left-10">
                <img
                  src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
                  alt="Rice terraces in Bali"
                  className="aspect-[5/6] h-full w-full object-cover"
                />
              </div>

              {/* Floating next departure card */}
              <div className="absolute -right-3 top-6 w-[190px] animate-float rounded-2xl border border-white/40 bg-cream-50/95 p-4 shadow-card backdrop-blur sm:-right-6 sm:top-10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                    Next departure
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="mt-2 font-display text-[17px] leading-tight text-ink">
                  {heroPackage?.title || 'Bali Tropical Paradise'}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2.5">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-ink-500">
                    <CalendarDays className="h-3 w-3 text-clay-500" />
                    {heroPackage?.startDate
                      ? new Date(heroPackage.startDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : '12 seats'}
                  </span>
                  <Link
                    to={heroPackage ? `/packages/${heroPackage._id || heroPackage.id}` : '/packages'}
                    className="text-[10px] font-extrabold text-clay-600 hover:text-clay-800"
                  >
                    View →
                  </Link>
                </div>
              </div>

              {/* Rotating badge */}
              <div className="absolute -left-2 top-8 hidden h-20 w-20 -rotate-12 place-items-center rounded-full border border-ink/15 bg-cream-100/90 text-center shadow-soft backdrop-blur lg:grid">
                <div>
                  <p className="font-display text-[19px] leading-none text-ink">12</p>
                  <p className="mt-0.5 text-[7px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                    Years of
                    <br />
                    journeys
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================= MARQUEE ============================= */}
      <section className="border-y border-ink/10 bg-cream-50 py-4">
        <div className="mask-fade-x flex overflow-hidden">
          <div className="flex min-w-full shrink-0 animate-marquee items-center">
            {[...marqueePlaces, ...marqueePlaces].map((place, i) => (
              <span
                key={`${place}-${i}`}
                className="flex items-center gap-6 whitespace-nowrap px-6 text-[11px] font-extrabold uppercase tracking-[0.24em] text-ink-400"
              >
                {place}
                <span className="h-1 w-1 rounded-full bg-clay-400" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CATEGORIES ============================= */}
      <section className="container-x py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Find your rhythm"
            title="Choose the kind of away you need."
            description="Five ways to travel, each with its own pace. Every journey is capped at a small group and led by people who know the place by heart."
            action={
              <Link to="/packages" className="link-arrow">
                Browse all journeys <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, index) => (
            <Reveal key={cat.id} delay={index * 70}>
              <Link
                to={`/packages?category=${cat.id}`}
                className={`group relative block overflow-hidden rounded-3xl bg-cream-300 shadow-soft transition-all duration-500 ease-smooth hover:-translate-y-1 hover:shadow-card ${
                  index % 2 === 1 ? 'lg:mt-8' : ''
                }`}
              >
                <div className="aspect-[3/4]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                </div>
                <span className="absolute left-4 top-4 text-[10px] font-extrabold tracking-[0.2em] text-white/60">
                  0{index + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-[19px] leading-tight text-white">{cat.title}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-cream-200/70">
                    {cat.subtitle}
                  </p>
                  <span className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-all duration-300 group-hover:bg-clay-500">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================= FEATURED ============================= */}
      <section className="bg-cream-50 py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Most loved this season"
              title="Journeys our travellers keep recommending."
              description="Handpicked departures with the highest verified ratings, honest group sizes and a little breathing room built into every day."
              action={
                <Link to="/packages" className="link-arrow">
                  See all {featured.length ? `(${featured.length}+)` : ''} <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>

          {loading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-ink/10 bg-cream-100">
                  <div className="skeleton aspect-[4/3] rounded-none" />
                  <div className="space-y-3 p-5">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-5 w-4/5" />
                    <div className="skeleton h-3 w-1/4" />
                    <div className="skeleton mt-6 h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-ink/15 bg-cream-100 px-6 py-16 text-center">
              <Compass className="mx-auto h-10 w-10 text-ink-300" />
              <h3 className="mt-4 font-display text-2xl text-ink">The catalogue is being prepared</h3>
              <p className="mt-2 text-sm text-ink-500">
                Run the backend seed script to load the first collection of journeys.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((pkg, index) => (
                <Reveal key={pkg._id || pkg.id} delay={(index % 3) * 80}>
                  <PackageCard pkg={pkg} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================= WHY US ============================= */}
      <section className="container-x py-20 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-deep text-cream-100">
            <div className="grain pointer-events-none absolute inset-0 opacity-50" />
            <div
              className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full opacity-25 blur-3xl"
              style={{ background: 'radial-gradient(circle, #C75B39 0%, transparent 70%)' }}
            />
            <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[320px] lg:min-h-full">
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
                  alt="Guide leading a small group through the mountains"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/70 via-forest-deep/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-forest-deep/80" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-ink/40 p-3 backdrop-blur-md sm:max-w-xs">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-clay-500 text-white">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] font-semibold leading-snug text-cream-100">
                    <span className="block font-extrabold text-white">Rated {ratingLabel}/5</span>
                    {reviewLabel} from real, completed journeys
                  </p>
                </div>
              </div>

              <div className="p-7 sm:p-10 lg:p-12">
                <span className="eyebrow eyebrow-light">Why travel with us</span>
                <h2 className="mt-4 font-display text-[2.15rem] leading-[1.05] tracking-[-0.03em] text-cream-50 sm:text-[2.7rem]">
                  The difference is in the{' '}
                  <em className="font-light italic text-clay-300">unglamorous details.</em>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-cream-200/65">
                  The 5am airport pickup that is actually there. The restaurant that is not
                  in the guidebook. The guide who changes the plan when the weather turns.
                </p>

                <div className="mt-8 space-y-6">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Seats held atomically',
                      copy: 'No double bookings. Your seats are locked for 15 minutes while you check out, then released automatically if you change your mind.',
                    },
                    {
                      icon: BadgeCheck,
                      title: 'Reviews only after the trip',
                      copy: 'Every rating comes from a traveller who booked and completed the journey. No incentive, no editing, no fake five stars.',
                    },
                    {
                      icon: Sparkles,
                      title: 'A real human on call',
                      copy: 'Our travel specialists can help with live availability and pricing, with personal support when it matters.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream-100/15 bg-cream-100/[0.06] text-clay-300">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold tracking-tight text-cream-50">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-cream-200/60">
                          {item.copy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-2 divide-x divide-cream-100/10 border-t border-cream-100/10 sm:grid-cols-4">
              {[
                ['12', 'Years designing journeys'],
                ['48', 'Destinations on the ground'],
                ['8', 'Average group size'],
                ['96%', 'Travellers who rebook'],
              ].map(([value, label]) => (
                <div key={label} className="px-5 py-5 text-center sm:px-6">
                  <p className="font-display text-[28px] leading-none text-cream-50">{value}</p>
                  <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cream-200/45">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================= REAL REVIEWS ============================= */}
      {reviews.length > 0 && (
        <section className="bg-cream-200/60 py-20 sm:py-24">
          <div className="container-x">
            <Reveal>
              <SectionHeading
                eyebrow="Notes from the road"
                title="What travellers wrote when they got home."
                description="Unfiltered words from people who booked, travelled and came back. Every review is tied to a completed journey."
              />
            </Reveal>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((review, index) => (
                <Reveal key={review._id} delay={index * 90}>
                  <figure className="flex h-full flex-col justify-between rounded-3xl border border-ink/10 bg-cream-50 p-6 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-card">
                    <div>
                      <div className="flex items-center justify-between">
                        <StarRating rating={review.rating} showCount={false} size="sm" />
                        <Quote className="h-6 w-6 text-clay-200" />
                      </div>
                      <blockquote className="mt-4 text-[14px] leading-[1.8] text-ink-600">
                        “{review.comment}”
                      </blockquote>
                    </div>

                    <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-[10px] font-extrabold uppercase text-cream-50">
                        {(review.user?.name || 'T').slice(0, 2)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-extrabold text-ink">
                          {review.user?.name || 'Verified traveller'}
                        </p>
                        <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-ink-400">
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-moss" />
                          {review.package?.destination || 'Verified journey'} ·{' '}
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================= ENQUIRY ============================= */}
      <section id="enquiry" className="container-x py-20 sm:py-24">
        <div className="grid overflow-hidden rounded-[2.5rem] border border-ink/10 bg-cream-50 shadow-card lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[300px] overflow-hidden bg-forest-deep lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80"
              alt="Traveller looking out over a valley"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-7 sm:p-10">
              <span className="eyebrow eyebrow-light">Bespoke planning</span>
              <h2 className="mt-4 max-w-sm font-display text-[2rem] leading-[1.08] text-cream-50 sm:text-[2.4rem]">
                Tell us the trip you keep almost booking.
              </h2>
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-cream-200/70">
                A family reunion, a milestone birthday, a route you cannot find anywhere
                else. Our specialists design it around you, not a template.
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-cream-100/15 pt-5">
                <Users className="h-4 w-4 text-clay-300" />
                <p className="text-[11px] font-semibold text-cream-200/70">
                  Typical reply within 24 hours · No obligation
                </p>
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            {enquirySuccess ? (
              <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-moss/10 text-moss">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-3xl text-ink">Request received.</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
                  One of our senior specialists will write to you within 24 hours with
                  ideas, honest pricing and a few questions.
                </p>
                <button
                  onClick={() => setEnquirySuccess(false)}
                  className="mt-6 text-[12px] font-extrabold text-clay-600 underline underline-offset-4 hover:text-clay-800"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-[1.8rem] leading-tight text-ink">
                  Request a custom itinerary
                </h3>
                <p className="mt-1.5 text-[13px] text-ink-400">
                  A few details are enough. We will do the rest.
                </p>

                {enquiryError && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
                    {enquiryError}
                  </div>
                )}

                <form onSubmit={handleEnquiry} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="enq-name">
                        Full name
                      </label>
                      <input
                        id="enq-name"
                        required
                        value={enquiry.name}
                        onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                        placeholder="Alex Morgan"
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="enq-email">
                        Email
                      </label>
                      <input
                        id="enq-email"
                        type="email"
                        required
                        value={enquiry.email}
                        onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="enq-phone">
                      Phone / WhatsApp <span className="font-medium normal-case text-ink-300">(optional)</span>
                    </label>
                    <input
                      id="enq-phone"
                      type="tel"
                      value={enquiry.phone}
                      onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="enq-message">
                      What are you imagining?
                    </label>
                    <textarea
                      id="enq-message"
                      required
                      rows={4}
                      value={enquiry.message}
                      onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                      placeholder="Dates, group size, places on your list, budget range…"
                      className="field-input resize-none"
                    />
                  </div>

                  <button type="submit" disabled={enquiryLoading} className="btn-ink w-full sm:w-auto">
                    {enquiryLoading ? (
                      'Sending request…'
                    ) : (
                      <>
                        Send request <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
