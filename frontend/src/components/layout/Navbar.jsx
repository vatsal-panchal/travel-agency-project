import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  CalendarCheck,
  CreditCard,
  Heart,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Logo } from './Logo';

const navLinks = [
  { label: 'Explore', path: '/packages' },
  { label: 'Destinations', path: '/destinations' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const Navbar = () => {
  const { user, profilePhoto, isAuthenticated, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/packages'
      ? location.pathname.startsWith('/packages')
      : location.pathname === path;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ease-smooth ${
          scrolled
            ? 'border-b border-ink/10 bg-cream-100/90 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-cream-100/70 backdrop-blur-md'
        }`}
      >
        <div className="container-x">
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? 'h-[68px]' : 'h-[78px]'
            }`}
          >
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/packages"
                aria-label="Search journeys"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-600 transition hover:bg-ink/[0.05] hover:text-ink"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Link>

              <Link
                to="/wishlist"
                aria-label="Saved journeys"
                className="relative grid h-9 w-9 place-items-center rounded-full text-ink-600 transition hover:bg-ink/[0.05] hover:text-ink"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {wishlistCount > 0 && (
                  <span className="absolute right-0 top-0 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-clay-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-cream-100">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-expanded={dropdownOpen}
                    className="ml-1 flex items-center gap-2 rounded-full border border-ink/12 bg-cream-50 p-1 pr-1 transition hover:border-ink/30 sm:pr-3"
                  >
                    <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-ink text-[11px] font-extrabold text-cream-50">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </span>
                    <span className="hidden max-w-[90px] truncate text-[12px] font-bold text-ink sm:block">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-ink/10 bg-cream-50 p-2 shadow-lift">
                      <div className="rounded-xl bg-cream-100 px-3 py-2.5">
                        <p className="truncate text-xs font-extrabold text-ink">{user?.name}</p>
                        <p className="truncate text-[11px] text-ink-400">{user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream-100">
                            <ShieldCheck className="h-2.5 w-2.5" /> Admin
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-0.5">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-cream-100"
                          >
                            <ShieldCheck className="h-4 w-4 text-clay-600" /> Admin dashboard
                          </Link>
                        )}
                        <Link
                          to="/dashboard?tab=settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-cream-100"
                        >
                          <User className="h-4 w-4 text-moss" /> My profile
                        </Link>
                        <Link
                          to="/dashboard?tab=bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-cream-100"
                        >
                          <CalendarCheck className="h-4 w-4 text-moss" /> My bookings
                        </Link>
                        <Link
                          to="/dashboard?tab=payments"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-cream-100"
                        >
                          <CreditCard className="h-4 w-4 text-moss" /> Receipts
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-cream-100"
                        >
                          <Heart className="h-4 w-4 text-clay-500" /> Saved journeys
                        </Link>
                      </div>

                      <div className="mt-1 border-t border-ink/10 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ml-1 flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="hidden rounded-full px-3 py-2 text-[12px] font-extrabold text-ink-700 transition hover:text-clay-600 sm:block"
                  >
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-ink btn-sm hidden sm:inline-flex">
                    Join us
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="ml-0.5 grid h-9 w-9 place-items-center rounded-full text-ink-700 transition hover:bg-ink/[0.05] lg:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm animate-scale-in flex-col bg-cream-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between border-b border-ink/[0.07] py-4 font-display text-2xl text-ink transition hover:text-clay-600"
                >
                  {link.label}
                  <span className="text-[10px] font-sans font-extrabold tracking-widest text-ink-300">
                    0{index + 1}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-8">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard?tab=settings"
                    className="btn-ink w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" /> My profile
                  </Link>
                  <button onClick={handleLogout} className="btn-outline w-full">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-ink w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create free account
                  </Link>
                  <Link
                    to="/login"
                    className="btn-outline w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </>
              )}
              <p className="pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                Secure payments · Verified reviews
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
