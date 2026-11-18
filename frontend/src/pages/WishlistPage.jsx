import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Heart, LogIn, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { PackageCard } from '../components/packages/PackageCard';
import { Reveal } from '../components/ui/Reveal';

export const WishlistPage = () => {
  const { wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <div className="overflow-x-clip">
      <section className="border-b border-ink/10 bg-cream-200/40">
        <div className="container-x py-12 sm:py-16">
          <Reveal>
            <span className="eyebrow">Your shortlist</span>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h1 className="display-hero text-[2.9rem] text-ink sm:text-[4rem]">
                  Saved for{' '}
                  <em className="font-light italic text-clay-500">someday.</em>
                </h1>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-500">
                  The journeys you keep coming back to. Seat counts update live, so you can pick
                  up exactly where you left off.
                </p>
              </div>
              {isAuthenticated && wishlistItems.length > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-cream-50 px-4 py-2 text-[11px] font-extrabold text-ink-500">
                  <Heart className="h-3.5 w-3.5 fill-clay-500 text-clay-500" />
                  {wishlistItems.length} saved
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-x py-10 sm:py-14">
        {!isAuthenticated ? (
          <Reveal>
            <div className="mx-auto max-w-xl rounded-[2rem] border border-ink/10 bg-cream-50 px-7 py-14 text-center shadow-soft">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay-50 text-clay-600">
                <Heart className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <h2 className="mt-5 font-display text-3xl leading-tight text-ink">
                Your shortlist travels with you.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-ink-500">
                Sign in to save journeys across devices and keep an eye on live availability.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/login" className="btn-ink">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link to="/packages" className="btn-outline">
                  Browse journeys
                </Link>
              </div>
            </div>
          </Reveal>
        ) : wishlistItems.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-ink/15 bg-cream-50 px-7 py-16 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-200 text-ink-400">
                <Sparkles className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <h2 className="mt-5 font-display text-3xl leading-tight text-ink">
                Nothing saved yet.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-ink-500">
                Tap the heart on any journey to keep it here. We will not email you about it —
                this list is just for you.
              </p>
              <Link to="/packages" className="btn-ink mt-7">
                Find your next journey <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((pkg, index) => (
                <Reveal key={pkg._id || pkg.id} delay={(index % 3) * 70}>
                  <PackageCard pkg={pkg} />
                </Reveal>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[2rem] bg-forest-deep px-7 py-7 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-clay-300">
                  Still deciding?
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight text-cream-50">
                  A specialist can compare these for you.
                </h2>
              </div>
              <Link to="/contact" className="btn-light btn-sm shrink-0">
                Ask for a comparison <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
