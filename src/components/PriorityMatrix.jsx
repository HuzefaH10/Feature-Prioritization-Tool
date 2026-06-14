import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis, ReferenceLine, Label
} from 'recharts';
import { calculateRiceScore, getCategoryColor, CATEGORIES } from '../utils';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="matrix-tooltip">
      <div className="matrix-tooltip-name">{d.name}</div>
      <div className="matrix-tooltip-row"><span>Category:</span> <span className="matrix-tooltip-val">{d.category}</span></div>
      <div className="matrix-tooltip-row"><span>RICE Score:</span> <span className="matrix-tooltip-val">{d.score}</span></div>
      <div className="matrix-tooltip-row"><span>Reach:</span> <span className="matrix-tooltip-val">{d.reach}</span></div>
      <div className="matrix-tooltip-row"><span>Impact:</span> <span className="matrix-tooltip-val">{d.impact}</span></div>
      <div className="matrix-tooltip-row"><span>Effort:</span> <span className="matrix-tooltip-val">{d.effort}w</span></div>
    </div>
  );
};

export default function PriorityMatrix({ features, filterCat }) {
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
        <ScatterChart margin={{ top: 30, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
          <XAxis
            type="number"
            dataKey="effort"
            name="Effort"
            domain={[0, maxEffort]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
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
          >
            <Label value="↑ Impact" position="top" offset={10} style={{ fill: '#94a3b8', fontSize: 12 }} />
          </YAxis>
          <ZAxis type="number" dataKey="bubbleSize" range={[100, 800]} />

          <ReferenceLine x={medianEffort} stroke="#334155" strokeDasharray="6 4" />
          <ReferenceLine y={medianImpact} stroke="#334155" strokeDasharray="6 4" />

          <Tooltip content={<CustomTooltip />} cursor={false} isAnimationActive={false} animationDuration={0} />

          {CATEGORIES.map(cat => {
            if (!data[cat]) return null;
            return (
              <Scatter
                key={cat}
                name={cat}
                data={data[cat]}
                fill={getCategoryColor(cat).replace('var(--cat-', '').replace(')', '')}
                fillOpacity={0.8}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                isAnimationActive={false}
              />
            );
          })}

          {/* Render each category with actual color */}
          {CATEGORIES.map(cat => {
            if (!data[cat]) return null;
            const colorMap = {
              UX: '#7c3aed', Performance: '#0ea5e9', Revenue: '#10b981',
              Retention: '#f59e0b', Infrastructure: '#64748b', Other: '#475569'
            };
            return (
              <Scatter
                key={`scatter-${cat}`}
                name={cat}
                data={data[cat]}
                fill={colorMap[cat] || '#475569'}
                fillOpacity={0.8}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="matrix-legend">
        {CATEGORIES.filter(c => data[c]).map(cat => {
          const colorMap = {
            UX: '#7c3aed', Performance: '#0ea5e9', Revenue: '#10b981',
            Retention: '#f59e0b', Infrastructure: '#64748b', Other: '#475569'
          };
          return (
            <div key={cat} className="matrix-legend-item">
              <span className="matrix-legend-dot" style={{ backgroundColor: colorMap[cat] }}></span>
              <span>{cat}</span>
            </div>
          );
        })}
        <div className="matrix-legend-item" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          Bubble size = Reach
        </div>
      </div>
    </div>
  );
}
