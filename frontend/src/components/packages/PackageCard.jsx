import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, MapPin, Clock, ArrowUpRight, Users } from 'lucide-react';
import { StarRating } from '../common/StarRating';
import { useWishlist } from '../../context/WishlistContext';

const categoryLabels = {
  beach: 'Beach & islands',
  mountain: 'Mountain',
  city: 'City & culture',
  adventure: 'Adventure',
  religious: 'Spiritual',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80';

export const PackageCard = ({ pkg, className = '' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const pkgId = pkg._id || pkg.id;
  const isSaved = isInWishlist(pkgId);
  const imageUrl = pkg.images?.[0] || FALLBACK_IMAGE;
  const seatsLeft = Number(pkg.availableSeats) || 0;

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    const res = await toggleWishlist(pkg);
    if (res?.requireAuth) navigate('/login');
    setIsToggling(false);
  };

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-soft transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-ink/20 hover:shadow-card ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-300">
        <Link to={`/packages/${pkgId}`} aria-label={pkg.title} className="block h-full w-full">
          <img
            src={imageUrl}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/5" />
        </Link>

        <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-full border border-white/30 bg-white/85 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink backdrop-blur-md">
          {categoryLabels[pkg.category] || pkg.category}
        </span>

        <button
          onClick={handleHeartClick}
          disabled={isToggling}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isSaved
              ? 'bg-clay-500 text-white'
              : 'bg-white/85 text-ink-600 hover:bg-white hover:text-clay-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} strokeWidth={1.8} />
        </button>

        {seatsLeft > 0 && seatsLeft <= 5 && (
          <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1 rounded-full bg-clay-500 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
            <Users className="h-2.5 w-2.5" /> Only {seatsLeft} seats left
          </span>
        )}
        {seatsLeft === 0 && (
          <span className="absolute bottom-3.5 left-3.5 rounded-full bg-ink px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-cream-100">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0 text-clay-500" />
            <span className="truncate">{pkg.destination}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" />
            {pkg.durationDays}D
          </span>
        </div>

        <Link to={`/packages/${pkgId}`} className="mt-2.5 block">
          <h3 className="line-clamp-2 font-display text-[20px] leading-[1.18] tracking-[-0.02em] text-ink transition-colors group-hover:text-clay-700">
            {pkg.title}
          </h3>
        </Link>

        <div className="mt-2.5">
          <StarRating rating={pkg.avgRating || 0} count={pkg.reviewCount || 0} size="xs" />
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-ink/[0.08] pt-4">
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
              From
            </span>
            <p className="mt-0.5 text-[19px] font-extrabold tracking-tight text-ink">
              ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
              <span className="ml-1 text-[10px] font-semibold text-ink-400">/ person</span>
            </p>
          </div>

          <Link
            to={`/packages/${pkgId}`}
            aria-label={`View ${pkg.title}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-300 group-hover:border-clay-500 group-hover:bg-clay-500 group-hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};
