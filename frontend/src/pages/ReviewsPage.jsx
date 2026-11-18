import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Compass,
  Quote,
  Star,
} from 'lucide-react';
import { reviewApi } from '../api/reviewApi';
import { StarRating } from '../components/common/StarRating';
import { Reveal } from '../components/ui/Reveal';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, distribution: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await reviewApi.getFeatured({ limit: 24 });
        if (!alive) return;
        setReviews(res.data?.reviews || []);
        if (res.data?.stats) setStats(res.data.stats);
      } catch {
        if (alive) setError('Reviews could not be loaded right now. Please try again shortly.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const distributionMap = useMemo(() => {
    const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    (stats.distribution || []).forEach((d) => {
      if (map[d.rating] !== undefined) map[d.rating] = d.count;
    });
    return map;
  }, [stats.distribution]);

  const filtered = useMemo(() => {
    if (ratingFilter === 'all') return reviews;
    return reviews.filter((review) => Math.round(Number(review.rating)) === Number(ratingFilter));
  }, [reviews, ratingFilter]);

  return (
    <div>
      {/* Header */}
      <section className="border-b border-ink/10 bg-cream-200/50">
        <div className="container-x py-14 sm:py-20">
          <Reveal>
            <span className="eyebrow">Verified traveller notes</span>
            <h1 className="display-hero mt-4 max-w-3xl text-[2.9rem] text-ink sm:text-[4.2rem]">
              Honest words from{' '}
              <em className="font-light italic text-clay-500">people who went.</em>
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-500">
              Every review below is tied to a booking that was paid for and completed. No
              incentives, no editing, no invented five-star quotes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold text-ink-500">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-moss" /> Completed journeys only
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-moss" /> One review per traveller
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" /> Published unedited
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container-x py-12">
        {/* Aggregate */}
        <Reveal>
          <div className="grid gap-8 rounded-[2rem] border border-ink/10 bg-cream-50 p-6 shadow-soft sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="flex items-center gap-6 lg:pr-10">
              <div>
                <p className="font-display text-[4rem] leading-none text-ink">
                  {stats.avgRating ? Number(stats.avgRating).toFixed(1) : '—'}
                </p>
                <div className="mt-2">
                  <StarRating
                    rating={stats.avgRating || 0}
                    showValue={false}
                    showCount={false}
                    size="sm"
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  {stats.totalReviews || 0} reviews
                </p>
              </div>
              <div className="hidden h-20 w-px bg-ink/10 sm:block" />
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distributionMap[star] || 0;
                const percent = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="flex w-8 items-center gap-1 text-[10px] font-bold text-ink-500">
                      {star}
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[10px] font-bold text-ink-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-ink/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="max-w-[220px] text-[12px] leading-relaxed text-ink-500">
                Travelled with us? Your review becomes available in your dashboard once the
                trip ends.
              </p>
              <Link to="/dashboard?tab=bookings" className="link-arrow mt-3">
                Go to my bookings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Filters */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            {['all', '5', '4', '3', '2', '1'].map((value) => {
              const active = ratingFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setRatingFilter(value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold transition ${
                    active
                      ? 'bg-ink text-cream-50'
                      : 'border border-ink/10 text-ink-500 hover:border-ink/25 hover:text-ink'
                  }`}
                >
                  {value === 'all' ? 'All reviews' : `${value} star${value === '1' ? '' : 's'}`}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-bold text-ink-400">
            Showing {filtered.length} of {reviews.length}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl border border-ink/10 bg-cream-50 p-6">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton mt-4 h-4 w-full" />
                <div className="skeleton mt-2 h-4 w-5/6" />
                <div className="skeleton mt-2 h-4 w-2/3" />
                <div className="mt-6 flex items-center gap-3">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-28" />
                    <div className="skeleton h-2.5 w-36" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-cream-50 px-6 py-20 text-center">
            <Compass className="mx-auto h-9 w-9 text-ink-300" />
            <h2 className="mt-4 font-display text-2xl text-ink">No reviews at this rating yet.</h2>
            <button
              onClick={() => setRatingFilter('all')}
              className="mt-4 text-[12px] font-extrabold text-clay-600 underline underline-offset-4"
            >
              Show all reviews
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((review, index) => (
              <Reveal key={review._id} delay={(index % 3) * 70}>
                <article className="flex h-full flex-col justify-between rounded-3xl border border-ink/10 bg-cream-50 p-6 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-card">
                  <div>
                    <div className="flex items-center justify-between">
                      <StarRating rating={review.rating} showCount={false} showValue={false} size="sm" />
                      <Quote className="h-6 w-6 text-clay-200" />
                    </div>

                    <blockquote className="mt-4 text-[13.5px] leading-[1.85] text-ink-600">
                      “{review.comment}”
                    </blockquote>
                  </div>

                  <div className="mt-6 border-t border-ink/10 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-[10px] font-extrabold uppercase text-cream-50">
                        {(review.user?.name || 'T').slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-[12px] font-extrabold text-ink">
                          {review.user?.name || 'Verified traveller'}
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-moss" />
                        </p>
                        <p className="text-[10px] font-semibold text-ink-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    {review.package && (
                      <Link
                        to={`/packages/${review.package._id}`}
                        className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-cream-100 px-3 py-2 text-[10.5px] font-bold text-ink-500 transition hover:bg-cream-200 hover:text-ink"
                      >
                        <span className="truncate">{review.package.title}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                      </Link>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal>
          <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-[2rem] bg-forest-deep px-7 py-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-clay-300">
                Your turn
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight text-cream-50">
                Go somewhere worth writing about.
              </h2>
            </div>
            <Link to="/packages" className="btn-light shrink-0">
              Explore journeys <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
