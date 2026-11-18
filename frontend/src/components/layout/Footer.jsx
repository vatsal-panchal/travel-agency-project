import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowUpRight,
  ShieldCheck,
  Send,
  Check,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { Logo } from './Logo';

const socialLinks = [
  {
    label: 'Instagram',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <path d="M14 21v-7h2.4l.6-3H14V9.2c0-.9.3-1.5 1.6-1.5H17V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H8.5v3H11v7h3Z" />
    ),
  },
  {
    label: 'YouTube',
    icon: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10 9.2 5 2.8-5 2.8V9.2Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'All journeys', to: '/packages' },
      { label: 'Destinations', to: '/destinations' },
      { label: 'Saved journeys', to: '/wishlist' },
    ],
  },
  {
    title: 'Journey types',
    links: [
      { label: 'Beach & islands', to: '/packages?category=beach' },
      { label: 'Mountain treks', to: '/packages?category=mountain' },
      { label: 'Wildlife & safari', to: '/packages?category=adventure' },
      { label: 'City & culture', to: '/packages?category=city' },
      { label: 'Spiritual escapes', to: '/packages?category=religious' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our story', to: '/about' },
      { label: 'Contact concierge', to: '/contact' },
      { label: 'Custom itinerary', to: '/contact' },
      { label: 'My account', to: '/dashboard' },
      { label: 'Admin dashboard', to: '/admin' },
    ],
  },
];

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-deep text-cream-200">
      <div className="grain pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #DE6D50 0%, transparent 70%)' }}
      />

      <div className="container-x relative">
        {/* Top CTA */}
        <div className="grid gap-10 border-b border-cream-100/10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="eyebrow eyebrow-light">The Wanderlust letter</span>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.05] tracking-[-0.03em] text-cream-50 sm:text-5xl">
              Rare places, quiet seasons and{' '}
              <em className="font-light italic text-clay-300">honest travel notes.</em>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream-200/65">
              One considered email each month. New journeys, member fares and the small
              discoveries our specialists bring back from the road.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full max-w-md lg:justify-self-end">
            {subscribed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-cream-100/20 bg-cream-100/[0.06] px-5 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-clay-500 text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-cream-50">You're on the list.</p>
                  <p className="text-xs text-cream-200/60">Look out for our next dispatch.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 flex-1 rounded-full border border-cream-100/20 bg-cream-100/[0.06] px-5 text-sm text-cream-50 placeholder:text-cream-200/35 focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-500/30"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cream-100 px-6 text-[12px] font-extrabold text-ink transition hover:bg-white"
                >
                  Subscribe <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="mt-2.5 pl-2 text-[10px] text-cream-200/40">
              No noise. Unsubscribe with one click.
            </p>
          </form>
        </div>

        {/* Link grid */}
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,0.7fr)]">
          <div className="space-y-5">
            <Logo light />
            <p className="max-w-xs text-sm leading-relaxed text-cream-200/60">
              A travel atelier designing small-group journeys and private escapes for people
              who would rather feel a place than simply see it.
            </p>
            <div className="space-y-2.5 text-xs text-cream-200/65">
              <p className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-clay-300" />
                Connaught Place, New Delhi 110001
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-clay-300" />
                concierge@wanderlust.agency
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-clay-300" />
                +91 11 4982 3000
              </p>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-cream-100/15 text-cream-200/60 transition hover:border-cream-100/40 hover:text-cream-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-cream-200/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-[13px] font-semibold text-cream-200/70 transition hover:text-cream-50"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant wordmark */}
        <div className="select-none border-t border-cream-100/10 pt-8">
          <p className="font-display text-[15vw] leading-[0.78] tracking-[-0.05em] text-cream-100/[0.07] sm:text-[11vw]">
            Wanderlust
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-cream-100/10 py-6 text-[11px] text-cream-200/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Wanderlust Travel Atelier. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5 text-cream-200/55">
              <ShieldCheck className="h-3.5 w-3.5 text-clay-300" /> Secure encrypted checkout
            </span>
            <Link to="/about" className="transition hover:text-cream-100">
              Privacy
            </Link>
            <Link to="/about" className="transition hover:text-cream-100">
              Terms
            </Link>
            <Link to="/contact" className="transition hover:text-cream-100">
              Cancellation rules
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
