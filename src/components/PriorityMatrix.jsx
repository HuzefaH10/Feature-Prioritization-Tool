import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, ZAxis, ReferenceLine, Label
} from 'recharts';
import { calculateRiceScore, CATEGORIES } from '../utils';

const COLOR_MAP = {
  UX: '#7c3aed', Performance: '#0ea5e9', Revenue: '#10b981',
  Retention: '#f59e0b', Infrastructure: '#64748b', Other: '#475569'
};

export default function PriorityMatrix({ features, filterCat }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

  const data = useMemo(() => {
    const catGroups = {};
    features.forEach(f => {
      if (filterCat !== 'All' && f.category !== filterCat) return;
      const score = calculateRiceScore(f.reach, f.impact, f.confidence, f.effort);
      if (score === null) return;
      const cat = f.category || 'Other';
      if (!catGroups[cat]) catGroups[cat] = [];
      catGroups[cat].push({
        name: f.name,
        effort: f.effort,
        impact: f.impact,
        reach: f.reach,
        confidence: f.confidence,
        category: cat,
        score,
        bubbleSize: Math.max(f.reach / 5, 60)
      });
    });
    return catGroups;
  }, [features, filterCat]);

  const allPoints = Object.values(data).flat();
  if (allPoints.length === 0) return null;

  const efforts = allPoints.map(p => p.effort);
  const impacts = allPoints.map(p => p.impact);
  const medianEffort = [...efforts].sort((a, b) => a - b)[Math.floor(efforts.length / 2)];
  const medianImpact = [...impacts].sort((a, b) => a - b)[Math.floor(impacts.length / 2)];

  const maxEffort = Math.max(...efforts) + 1;


  const handleDotMouseMove = (entry, nativeEvent) => {
    setTooltip({
      visible: true,
      x: nativeEvent.clientX,
      y: nativeEvent.clientY,
      data: entry
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  };

  return (
    <div className="matrix-container">
      {/* Quadrant labels */}
      <div className="matrix-quadrants">
        <div className="quadrant-overlay">
          <div className="quadrant-grid">
            <div className="quadrant-cell quadrant-quickwins">🚀 Quick Wins</div>
            <div className="quadrant-cell quadrant-major">💎 Major Projects</div>
            <div className="quadrant-cell quadrant-fillins">🌱 Fill-ins</div>
            <div className="quadrant-cell quadrant-thankless">⚠️ Thankless Tasks</div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 30, right: 30, bottom: 20, left: 20 }} isAnimationActive={false}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" isAnimationActive={false} />
          <XAxis
            type="number"
            dataKey="effort"
            name="Effort"
            domain={[0, maxEffort]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
            isAnimationActive={false}
          >
            <Label value="Effort (weeks) →" position="bottom" offset={0} style={{ fill: '#94a3b8', fontSize: 12 }} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="impact"
            name="Impact"
            domain={[0, 3.5]}
            ticks={[0.25, 0.5, 1, 2, 3]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
            isAnimationActive={false}
          >
            <Label value="↑ Impact" position="top" offset={10} style={{ fill: '#94a3b8', fontSize: 12 }} />
          </YAxis>
          <ZAxis type="number" dataKey="bubbleSize" range={[100, 800]} />

          <ReferenceLine x={medianEffort} stroke="#334155" strokeDasharray="6 4" />
          <ReferenceLine y={medianImpact} stroke="#334155" strokeDasharray="6 4" />

          {CATEGORIES.map(cat => {
            if (!data[cat]) return null;
            return (
              <Scatter
                key={cat}
                name={cat}
                data={data[cat]}
                fill={COLOR_MAP[cat] || '#475569'}
                fillOpacity={0.8}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
                isAnimationActive={false}
                onMouseLeave={handleMouseLeave}
                shape={(props) => {
                  const { cx, cy, r, fill: dotFill, fillOpacity: fo, stroke: dotStroke, strokeWidth: sw, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r || 8}
                      fill={dotFill}
                      fillOpacity={fo}
                      stroke={dotStroke}
                      strokeWidth={sw}
                      style={{ cursor: 'pointer' }}
                      onMouseMove={(evt) => handleDotMouseMove(payload, evt.nativeEvent)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                }}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Custom tooltip rendered outside the chart */}
      {tooltip.visible && tooltip.data && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '10px 14px',
          pointerEvents: 'none',
          zIndex: 9999,
          minWidth: '180px',
          fontSize: '0.8rem',
          color: '#f8fafc',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: '0.875rem' }}>{tooltip.data.name}</div>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>Category: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{tooltip.data.category}</span></div>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>RICE Score: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{tooltip.data.score}</span></div>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>Reach: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{tooltip.data.reach}</span></div>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>Impact: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{tooltip.data.impact}</span></div>
          <div style={{ color: '#94a3b8' }}>Effort: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{tooltip.data.effort}w</span></div>
        </div>
      )}

      <div className="matrix-legend">
        {CATEGORIES.filter(c => data[c]).map(cat => (
          <div key={cat} className="matrix-legend-item">
            <span className="matrix-legend-dot" style={{ backgroundColor: COLOR_MAP[cat] }}></span>
            <span>{cat}</span>
          </div>
        ))}
        <div className="matrix-legend-item" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          Bubble size = Reach
        </div>
      </div>
    </div>
  );
}
