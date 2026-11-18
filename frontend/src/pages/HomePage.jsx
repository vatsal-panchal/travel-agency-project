import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Compass,
  MapPin,
  Quote,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
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

const mapPins = [
  {
    label: 'Bali',
    image: categories[0].image,
    position: 'left-[12%] top-[57%]',
  },
  {
    label: 'Swiss Alps',
    image: categories[1].image,
    position: 'right-[12%] top-[51%]',
  },
  {
    label: 'Serengeti',
    image: categories[2].image,
    position: 'left-[27%] bottom-[10%]',
  },
  {
    label: 'Kyoto',
    image: categories[3].image,
    position: 'right-[26%] bottom-[12%]',
  },
  {
    label: 'Maldives',
    image: categories[0].image,
    position: 'left-[49%] top-[72%]',
  },
  {
    label: 'Amalfi Coast',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=160&q=80',
    position: 'left-[43%] top-[33%]',
  },
];

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
  const [packageCount, setPackageCount] = useState(0);
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
          setPackageCount(pkgRes.value.data?.total || 0);
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
    : '—';
  const reviewLabel = reviewStats.totalReviews
    ? `${reviewStats.totalReviews} verified reviews`
    : 'No verified reviews yet';

  return (
    <div className="overflow-x-clip">
      {/* ============================= HERO ============================= */}
      <section className="relative isolate overflow-hidden bg-[#f5f7f5] pb-10 sm:pb-12">
        <div className="container-x relative pt-10 sm:pt-14">
          <Reveal className="text-center">
            <span className="eyebrow">Journeys made personal · Wanderlust Atelier</span>
            <h1 className="display-hero mx-auto mt-4 max-w-4xl text-[2.75rem] text-ink sm:text-[4rem] lg:text-[4.65rem]">
              Find a place that{' '}
              <em className="font-light italic text-clay-500">changes your pace.</em>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[13px] leading-relaxed text-ink-500 sm:text-[15px]">
              Thoughtfully planned escapes, small groups and local guides. Choose your
              direction; we’ll take care of the details.
            </p>
          </Reveal>

          <div className="relative mx-auto mt-9 max-w-[1240px]">
            <div className="relative h-[470px] overflow-hidden rounded-[2rem] border border-ink/10 bg-[#e7ede9] shadow-soft sm:h-[500px] lg:h-[530px]">
              <svg
                viewBox="0 0 1200 530"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="journey-map-grid" width="70" height="70" patternUnits="userSpaceOnUse">
                    <path d="M 70 0 L 0 0 0 70" fill="none" stroke="#cbd5cf" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="1200" height="530" fill="url(#journey-map-grid)" />
                <g fill="#f8f8f2" opacity=".78">
                  <path d="M0 115 180 65l140 62-42 110L75 255 0 210z" />
                  <path d="m370 0 190 44 26 132-134 40-114-95z" />
                  <path d="m786 30 180-18 126 86-40 144-177 17-92-103z" />
                  <path d="m82 340 164-79 121 73-36 160H96z" />
                  <path d="m510 302 143-75 145 75 28 153-192 79-136-101z" />
                  <path d="m906 299 190-53 104 85v199H1015l-93-119z" />
                </g>
                <path
                  d="M1200 170c-156 10-205 131-336 152s-188-49-317-24-205 132-323 122S98 355 0 402"
                  fill="none"
                  stroke="#d7e5e5"
                  strokeWidth="22"
                  opacity=".8"
                />
                <path
                  d="M1200 170c-156 10-205 131-336 152s-188-49-317-24-205 132-323 122S98 355 0 402"
                  fill="none"
                  stroke="#c2d5d5"
                  strokeWidth="1.5"
                />
                <g fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="18" opacity=".9">
                  <path d="M-25 388C151 305 201 398 317 323s156-133 287-94 168 90 282 37 168-161 345-121" />
                  <path d="M67-20c91 143 163 123 206 244s-6 164 93 237 184 65 246 105" />
                  <path d="M648-24c-9 109 62 148 45 255s-72 137-35 221 129 111 161 142" />
                  <path d="M1040-36c-47 120-7 196 41 256s10 117 67 179 82 66 86 137" />
                  <path d="M-12 165c132 15 190-32 303 12s144 127 268 129 198-67 318-19 177 115 340 78" />
                </g>
                <g fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="7" opacity=".95">
                  <path d="M-20 286c106-64 143-43 231-88s144-32 206 13 116 38 173-5 116-62 215-26 153 38 238-16 106-68 177-68" />
                  <path d="M-20 454c91-44 133-33 195-3s109 39 166 4 91-97 160-80 95 92 174 99 129-42 209-57 173 17 336-54" />
                  <path d="M312-20c-4 86 55 131 15 219s-89 126-51 212 111 87 132 158" />
                  <path d="M866-20c45 87 18 143-33 201s-53 118 3 184 97 98 88 190" />
                  <path d="M1092 0c-92 83-112 132-91 212s77 115 67 190-71 97-101 154" />
                  <path d="M22 98c84 56 140 70 217 50s130-15 196 31 88 59 160 45 93-58 168-57 125 46 198 30 134-60 252-45" />
                </g>
                <g fill="none" stroke="#cbd5cf" strokeLinecap="round" strokeWidth="1">
                  <path d="M-20 286c106-64 143-43 231-88s144-32 206 13 116 38 173-5 116-62 215-26 153 38 238-16 106-68 177-68" />
                  <path d="M-20 454c91-44 133-33 195-3s109 39 166 4 91-97 160-80 95 92 174 99 129-42 209-57 173 17 336-54" />
                  <path d="M312-20c-4 86 55 131 15 219s-89 126-51 212 111 87 132 158" />
                  <path d="M866-20c45 87 18 143-33 201s-53 118 3 184 97 98 88 190" />
                  <path d="M1092 0c-92 83-112 132-91 212s77 115 67 190-71 97-101 154" />
                  <path d="M22 98c84 56 140 70 217 50s130-15 196 31 88 59 160 45 93-58 168-57 125 46 198 30 134-60 252-45" />
                </g>
                <g fill="none" stroke="#bdc9c1" strokeLinecap="round" strokeWidth="1.5">
                  <path d="M-25 388C151 305 201 398 317 323s156-133 287-94 168 90 282 37 168-161 345-121" />
                  <path d="M67-20c91 143 163 123 206 244s-6 164 93 237 184 65 246 105" />
                  <path d="M648-24c-9 109 62 148 45 255s-72 137-35 221 129 111 161 142" />
                  <path d="M1040-36c-47 120-7 196 41 256s10 117 67 179 82 66 86 137" />
                  <path d="M-12 165c132 15 190-32 303 12s144 127 268 129 198-67 318-19 177 115 340 78" />
                </g>
                <path
                  d="M155 390c115-95 157-8 256-92s157-100 244-14 145 103 231 17 130-101 212-66"
                  fill="none"
                  stroke="#c75b39"
                  strokeDasharray="5 10"
                  strokeLinecap="round"
                  strokeWidth="3"
                  opacity=".65"
                />
                <circle cx="155" cy="390" r="6" fill="#c75b39" />
                <circle cx="1098" cy="235" r="6" fill="#c75b39" />
              </svg>

              <div className="absolute left-[8%] top-[48%] hidden text-[9px] font-extrabold uppercase tracking-[0.2em] text-ink-400/70 sm:block">
                Coastal escapes
              </div>
              <div className="absolute right-[8%] top-[35%] hidden text-[9px] font-extrabold uppercase tracking-[0.2em] text-ink-400/70 sm:block">
                Mountain routes
              </div>
              <div className="absolute bottom-[10%] left-[8%] hidden text-[9px] font-extrabold uppercase tracking-[0.2em] text-ink-400/70 sm:block">
                Made for wandering
              </div>

              {mapPins.map((pin) => (
                <button
                  key={pin.label}
                  type="button"
                  onClick={() => handleQuickSearch(pin.label)}
                  aria-label={`Explore journeys in ${pin.label}`}
                  className={`group absolute z-10 hidden flex-col items-center sm:flex ${pin.position}`}
                >
                  <span className="relative block transition duration-300 group-hover:-translate-y-1">
                    <img
                      src={pin.image}
                      alt=""
                      className="h-11 w-11 rounded-full border-[3px] border-cream-50 object-cover shadow-card"
                      loading="lazy"
                    />
                    <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-br-sm bg-cream-50 shadow-sm" />
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-clay-500 text-white shadow-soft">
                      <MapPin className="h-2.5 w-2.5" />
                    </span>
                  </span>
                  <span className="mt-1 rounded-full border border-ink/5 bg-cream-50/95 px-2.5 py-1 text-[9px] font-extrabold text-ink shadow-soft backdrop-blur">
                    {pin.label}
                  </span>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
              className="absolute left-3 right-3 top-3 z-20 mx-auto max-w-[760px] rounded-2xl border border-white/80 bg-cream-50/95 p-2 shadow-card backdrop-blur-md sm:left-6 sm:right-6 sm:top-5 sm:rounded-full sm:p-2"
            >
              <div className="grid items-stretch gap-1 sm:grid-cols-[1.25fr_1fr_auto]">
                <label className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition focus-within:bg-cream-100 sm:rounded-full sm:px-4">
                  <MapPin className="h-4 w-4 shrink-0 text-clay-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[8px] font-extrabold uppercase tracking-[0.15em] text-ink-400">
                      Destination
                    </span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                      placeholder="Where would you like to go?"
                      className="mt-0.5 w-full truncate bg-transparent text-[11px] font-bold text-ink placeholder:font-medium placeholder:text-ink-300 focus:outline-none sm:text-[12px]"
                    />
                  </span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border-t border-ink/[0.07] px-3 py-2 text-left transition focus-within:bg-cream-100 sm:rounded-full sm:border-l sm:border-t-0 sm:px-4">
                  <Compass className="h-4 w-4 shrink-0 text-clay-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[8px] font-extrabold uppercase tracking-[0.15em] text-ink-400">
                      Journey style
                    </span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="mt-0.5 w-full cursor-pointer truncate bg-transparent text-[11px] font-bold text-ink focus:outline-none sm:text-[12px]"
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
                  className="btn-ink min-h-10 gap-2 rounded-xl px-5 sm:min-h-12 sm:rounded-full"
                >
                  <Search className="h-4 w-4" />
                  <span>Find a journey</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="container-x mt-5">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-card sm:grid-cols-4">
            {[
              {
                value: packageCount ? packageCount.toLocaleString('en-IN') : '—',
                label: 'Journeys to explore',
              },
              {
                value: Number(reviewStats.totalReviews || 0).toLocaleString('en-IN'),
                label: 'Verified reviews',
              },
              {
                value: reviewStats.totalReviews ? `${ratingLabel}/5` : '—',
                label: 'Traveller rating',
              },
              { value: 'Human', label: 'Personal trip support' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`px-4 py-5 text-center sm:px-6 sm:py-6 ${
                  index > 0 ? 'border-l border-ink/[0.08]' : ''
                } ${index > 1 ? 'border-t border-ink/[0.08] sm:border-t-0' : ''}`}
              >
                <p className="font-display text-2xl leading-none text-ink sm:text-[1.8rem]">
                  {stat.value}
                </p>
                <p className="mt-2 text-[8px] font-extrabold uppercase tracking-[0.12em] text-ink-400 sm:text-[9px]">
                  {stat.label}
                </p>
              </div>
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
              style={{ background: 'radial-gradient(circle, #DE6D50 0%, transparent 70%)' }}
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
                    <span className="block font-extrabold text-white">
                      {reviewStats.totalReviews ? `Rated ${ratingLabel}/5` : 'Real traveller notes'}
                    </span>
                    {reviewStats.totalReviews
                      ? `${reviewLabel} from completed journeys`
                      : 'Ratings appear after completed journeys.'}
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
                [packageCount ? packageCount.toLocaleString('en-IN') : '—', 'Journeys in collection'],
                [Number(reviewStats.totalReviews || 0).toLocaleString('en-IN'), 'Verified trip reviews'],
                [reviewStats.totalReviews ? `${ratingLabel}/5` : '—', 'Average trip rating'],
                ['24/7', 'On-trip support'],
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
