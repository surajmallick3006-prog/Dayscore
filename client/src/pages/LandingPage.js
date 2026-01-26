import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  Heart, 
  Smile, 
  TrendingUp,
  ArrowRight,
  Star
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Day Score Tracking',
      description: 'Get a comprehensive score (0-100) based on your daily productivity, health, mood, and focus.'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Organize your tasks with priorities, due dates, and track completion rates.'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Monitor study and work hours with detailed analytics and productivity insights.'
    },
    {
      icon: Heart,
      title: 'Health & Activity',
      description: 'Track sleep, steps, exercise, and overall wellness metrics.'
    },
    {
      icon: Smile,
      title: 'Mood & Wellness',
      description: 'Log daily mood, energy levels, and stress to understand patterns.'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Comprehensive reports and trends to help you improve over time.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Simplified Navigation - Logo Only */}
      <nav className="relative z-10 flex items-center justify-center pt-20 pb-6 px-6">
        <div className="flex items-center space-x-4">
          <Logo size={100} />
          <span className="text-2xl font-bold text-white">DayScore</span>
        </div>
      </nav>

      {/* Hero Section - Reduced padding and centered */}
      <div className="relative isolate px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-primary-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-4xl py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            {/* Global average badge */}
            

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Track Your Day.{' '}
              <span className="text-gradient bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Improve Your Life.
              </span>
            </h1>
            
            <p className="mt-4 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              Analyze your daily rhythm. Master your productivity. Optimize your life with 
              comprehensive tracking of tasks, time, health, and mood.
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors"
              >
                Sign In <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-400 to-primary-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features Section - Reduced padding */}
      <div className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to optimize your day
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Comprehensive tracking and analytics to help you understand and improve your daily habits.
            </p>
          </div>
          
          <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <feature.icon className="h-5 w-5 flex-none text-primary-400" />
                    {feature.title}
                  </dt>
                  <dd className="mt-3 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section - Reduced padding */}
      <div className="relative isolate px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to improve your daily score?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-300">
            Join thousands of users who are already tracking and improving their daily productivity and wellness.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              to="/register"
              className="bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded-lg transition-all duration-200"
            >
              Start tracking today
            </Link>
          </div>
        </div>
      </div>

      {/* Footer - Reduced padding */}
      <footer className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <div className="flex items-center space-x-3">
              <Logo size={24} />
              <span className="text-sm text-gray-400">DayScore</span>
            </div>
          </div>
          <div className="mt-6 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2024 DayScore. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;