import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  CheckSquare,
  Clock,
  Heart,
  Smile,
  TrendingUp,
  ArrowRight,
  Star,
  Zap,
  Shield,
} from 'lucide-react';
import Logo from '../components/Logo';
import LandingNavbar from '../components/marketing/LandingNavbar';
import ContactForm from '../components/marketing/ContactForm';
import useScrollReveal from '../hooks/useScrollReveal';
import { useServerAuth } from '../context/ServerAuthContext';

function RevealSection({ children, className = '' }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useServerAuth();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !hasUserInteracted) {
      const fromDashboard = location.state?.from?.includes('/app/');
      if (!fromDashboard) {
        const timer = setTimeout(() => navigate('/app/dashboard', { replace: true }), 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, loading, navigate, hasUserInteracted, location.state]);

  const handleGetStarted = (e) => {
    e.preventDefault();
    setHasUserInteracted(true);
    navigate(isAuthenticated ? '/app/dashboard' : '/register', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Logo size={56} />
          <span className="text-white text-lg">Loading…</span>
        </div>
      </div>
    );
  }

  const features = [
    { icon: BarChart3, title: 'Day Score Tracking', description: 'A comprehensive 0–100 score from productivity, health, mood, and focus.' },
    { icon: CheckSquare, title: 'Task Management', description: 'Priorities, due dates, and completion tracking in one place.' },
    { icon: Clock, title: 'Time Tracking', description: 'Study and work sessions with detailed analytics.' },
    { icon: Heart, title: 'Health & Activity', description: 'Sleep, steps, MET-based calorie burn, and wellness metrics.' },
    { icon: Smile, title: 'Mood & Wellness', description: 'Daily mood logs and cycle-aware wellness guidance.' },
    { icon: TrendingUp, title: 'Analytics & Insights', description: 'Trends and AI-powered reports to improve over time.' },
  ];

  const testimonials = [
    { name: 'Priya S.', role: 'Graduate Student', text: 'DayScore helped me balance study hours with sleep and mood. My weekly score went up 18% in a month.', stars: 5 },
    { name: 'Alex M.', role: 'Software Engineer', text: 'The physical activity calculator and time tracker are exactly what I needed. Clean UI on mobile too.', stars: 5 },
    { name: 'Jordan L.', role: 'Wellness Coach', text: 'I recommend DayScore to clients who want data-driven habit change without overwhelming complexity.', stars: 5 },
  ];

  const plans = [
    { name: 'Free', price: '$0', period: 'forever', features: ['Day Score dashboard', 'Task & time tracking', 'Basic health logs', '7-day history'], cta: 'Get Started', featured: false },
    { name: 'Pro', price: '$9', period: '/month', features: ['Everything in Free', 'AI insights & reports', 'Women\'s Wellness Hub', 'Unlimited history', 'Priority support'], cta: 'Start Pro Trial', featured: true },
    { name: 'Team', price: '$24', period: '/month', features: ['Up to 10 members', 'Shared analytics', 'Admin dashboard', 'Custom goals', 'Dedicated support'], cta: 'Contact Sales', featured: false },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative isolate pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-28">
        <div className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl sm:-top-80" aria-hidden>
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-primary-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
        </div>

        <div className="container max-w-4xl text-center">
          <RevealSection>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Track Your Day.{' '}
              <span className="text-gradient bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Improve Your Life.
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Analyze your daily rhythm. Master productivity. Optimize health, mood, and focus — on any device.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-4 px-2">
              <button
                type="button"
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center gap-2 bg-primary-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-white rounded-xl shadow-lg hover:bg-primary-600 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/login"
                className="inline-flex items-center justify-center py-3.5 text-sm sm:text-base font-semibold text-gray-300 hover:text-white border border-gray-600 rounded-xl hover:border-gray-500 transition-colors"
              >
                Sign In →
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-padding scroll-mt-nav bg-gray-900/50">
        <div className="container">
          <RevealSection className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Everything you need to optimize your day
            </h2>
            <p className="mt-4 text-gray-400 text-base sm:text-lg">
              Comprehensive tracking and analytics for habits that actually stick.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <RevealSection key={feature.title}>
                <article className="feature-card h-full" style={{ transitionDelay: `${i * 50}ms` }}>
                  <feature.icon className="h-8 w-8 text-primary-400 mb-4" aria-hidden />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </article>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding scroll-mt-nav">
        <div className="container">
          <RevealSection className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Loved by productive people</h2>
            <p className="mt-4 text-gray-400">Real feedback from students and professionals using DayScore daily.</p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <RevealSection key={t.name}>
                <blockquote className="testimonial-card">
                  <div className="flex gap-0.5 mb-4" aria-label={`${t.stars} stars`}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                  <footer className="mt-6 pt-4 border-t border-gray-700/50">
                    <cite className="not-italic font-semibold text-white">{t.name}</cite>
                    <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                  </footer>
                </blockquote>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding scroll-mt-nav bg-gray-900/50">
        <div className="container">
          <RevealSection className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="mt-4 text-gray-400">Start free. Upgrade when you need AI insights and advanced wellness tools.</p>
          </RevealSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan) => (
              <RevealSection key={plan.name}>
                <div className={plan.featured ? 'pricing-card-featured' : 'pricing-card'}>
                  {plan.featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary-400 mb-3">
                      <Zap className="w-3.5 h-3.5" /> Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <Shield className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className={`mt-8 w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.featured
                        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding scroll-mt-nav">
        <div className="container max-w-xl">
          <RevealSection className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Get in touch</h2>
            <p className="mt-3 text-gray-400">Questions, feedback, or partnership inquiries — we read every message.</p>
          </RevealSection>
          <RevealSection>
            <div className="rounded-2xl border border-gray-700 bg-gray-800/40 p-6 sm:p-8 backdrop-blur-sm">
              <ContactForm />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-gray-800">
        <div className="container max-w-2xl text-center">
          <RevealSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to improve your daily score?</h2>
            <p className="mt-4 text-gray-400 text-base sm:text-lg">
              Join users tracking productivity and wellness with DayScore.
            </p>
            <button
              type="button"
              onClick={handleGetStarted}
              className="mt-8 bg-primary-500 px-8 py-3.5 font-semibold text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg"
            >
              Start tracking today
            </button>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 sm:py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="font-semibold text-gray-300">DayScore</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-500" aria-label="Footer">
            <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-gray-300 transition-colors">Contact</a>
            <Link to="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
          </nav>
          <p className="text-xs text-gray-500 text-center md:text-right">
            &copy; {new Date().getFullYear()} DayScore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
