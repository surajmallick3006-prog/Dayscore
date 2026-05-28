import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, ArrowRight } from 'lucide-react';
import { useServerAuth } from '../../context/ServerAuthContext';
import { getCurrentPhase, getPhaseBonusFromStorage } from '../../utils/wellnessHub';
import { PHASES } from '../../data/wellnessHubData';

const WellnessHubPromoCard = () => {
  const { user } = useServerAuth();

  const cycleData = useMemo(() => {
    if (!user) return {};
    try {
      const raw = localStorage.getItem(`dayscore_wellness_${user.id || user._id}_cycle`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [user]);

  const phaseResult = getCurrentPhase(cycleData);
  const bonus = getPhaseBonusFromStorage(user);

  if (!phaseResult) {
    return (
      <div className="rounded-xl p-6 shadow-sm border border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Flower2 className="w-8 h-8 text-pink-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Women&apos;s Wellness Hub</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cycle-aware nutrition, fitness, mindset tips, and daily logging — personalized to your
              hormonal phase.
            </p>
            <Link
              to="/app/wellness-hub"
              className="inline-flex items-center gap-2 text-sm font-semibold text-pink-700 hover:text-pink-800"
            >
              Set up your cycle tracker
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const p = PHASES[phaseResult.phase];

  return (
    <div
      className="rounded-xl p-6 shadow-sm border"
      style={{ borderColor: p.color, background: `linear-gradient(135deg, ${p.light}, #fff)` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flower2 className="w-5 h-5" style={{ color: p.color }} />
            <h3 className="text-lg font-semibold text-gray-900">Women&apos;s Wellness Hub</h3>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: p.color }}>
            {p.emoji} {p.name} · Day {phaseResult.day}
          </p>
          {bonus && (
            <p className="text-sm text-gray-600 mb-3">
              +{bonus.boost} DayScore phase bonus active today
            </p>
          )}
          <Link
            to="/app/wellness-hub"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80"
            style={{ color: p.color }}
          >
            Open Wellness Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WellnessHubPromoCard;
