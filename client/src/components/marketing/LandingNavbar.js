import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../Logo';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

const LandingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const scrollTo = (href) => {
    closeMenu();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800/80' : 'bg-transparent'
      }`}
    >
      <nav
        className="container flex items-center justify-between gap-4 py-3 sm:py-4"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={closeMenu}>
          <Logo size={40} />
          <span className="text-lg sm:text-xl font-bold text-white">DayScore</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm px-5 py-2.5 rounded-xl shadow-md">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2.5 rounded-xl text-gray-200 hover:bg-gray-800 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-gray-900/98 backdrop-blur-md animate-fade-in">
          <ul className="container py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-3 py-3 text-base font-medium text-gray-200 hover:bg-gray-800 rounded-xl transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li className="pt-3 flex flex-col gap-2 border-t border-gray-800 mt-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full text-center py-3 text-gray-200 font-semibold rounded-xl border border-gray-700 hover:bg-gray-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="w-full text-center py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600"
              >
                Get Started Free
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
