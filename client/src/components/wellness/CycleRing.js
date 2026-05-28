import React, { useMemo } from 'react';
import { PHASES } from '../../data/wellnessHubData';
import { buildCycleRingSegments } from '../../utils/wellnessHub';

function arcPath(cx, cy, r, startAngle, endAngle) {
  const sr = (startAngle * Math.PI) / 180;
  const er = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(sr);
  const y1 = cy + r * Math.sin(sr);
  const x2 = cx + r * Math.cos(er);
  const y2 = cy + r * Math.sin(er);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const CycleRing = ({ cycleLen, periodLen, currentPhase, day, daysLeft }) => {
  const cx = 110;
  const cy = 110;
  const r = 85;
  const stroke = 20;

  const segments = useMemo(
    () => buildCycleRingSegments(cycleLen, periodLen),
    [cycleLen, periodLen]
  );

  const marker = useMemo(() => {
    const da = (day / cycleLen) * 360 - 90;
    const dr = (da * Math.PI) / 180;
    return { x: cx + r * Math.cos(dr), y: cy + r * Math.sin(dr) };
  }, [day, cycleLen, cx, cy, r]);

  const p = PHASES[currentPhase];

  return (
    <>
      <div className="cycle-ring-wrap">
        <svg viewBox="0 0 220 220" className="cycle-svg">
          {segments.map((seg) => {
            const sa = (seg.start / cycleLen) * 360 - 90;
            const ea = ((seg.start + seg.len) / cycleLen) * 360 - 90;
            return (
              <path
                key={seg.phase}
                d={arcPath(cx, cy, r, sa, ea)}
                fill="none"
                stroke={PHASES[seg.phase].color}
                strokeWidth={stroke}
                strokeLinecap="round"
                opacity={seg.phase === currentPhase ? 1 : 0.2}
              />
            );
          })}
          <circle
            cx={marker.x}
            cy={marker.y}
            r={10}
            fill={p.color}
            stroke="#fff"
            strokeWidth={3}
          />
        </svg>
        <div className="cycle-ring-center">
          <div className="cycle-day-num">{day}</div>
          <div className="cycle-phase-name">
            {p.emoji} {p.name}
          </div>
          <div className="cycle-days-left">{daysLeft}d to next period</div>
        </div>
      </div>
      <div className="phase-legend">
        {Object.entries(PHASES).map(([k, v]) => (
          <div key={k} className={`legend-item ${k === currentPhase ? 'active' : ''}`}>
            <div className="legend-dot" style={{ background: v.color }} />
            <span>
              {v.emoji} {v.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default CycleRing;
