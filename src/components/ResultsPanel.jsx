import React, { useState } from 'react';
import { Layers, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateRiceScore, getScoreColorClass, getPriorityBadgeInfo, CATEGORIES, getCategoryColor } from '../utils';

export default function ResultsPanel({ features, onLoadSample }) {
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rice'); // rice, reach, impact, effort
  const [expandedRow, setExpandedRow] = useState(null);

  if (!features || features.length < 2) {
    return (
      <div className="right-panel">
        <div className="empty-state">
          <Layers size={64} className="empty-state-icon" strokeWidth={1} />
          <h2>Add features to see rankings</h2>
          <p>Enter at least 2 features on the left to generate your prioritized roadmap</p>
          <button className="btn btn-primary" style={{width: 'auto'}} onClick={onLoadSample}>Load Sample Data</button>
        </div>
      </div>
    );
  }

  // Calculate scores and filter/sort
  const processedFeatures = features.map(f => ({
    ...f,
    score: calculateRiceScore(f.reach, f.impact, f.confidence, f.effort)
  }));

  const filtered = processedFeatures.filter(f => {
    if (filterCat !== 'All' && f.category !== filterCat) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rice') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'reach') return b.reach - a.reach;
    if (sortBy === 'impact') return b.impact - a.impact;
    if (sortBy === 'effort') return b.effort - a.effort;
    return 0;
  });

  // Stats
  const validScores = processedFeatures.filter(f => f.score !== null);
  const avgRice = validScores.length ? Math.round(validScores.reduce((acc, f) => acc + f.score, 0) / validScores.length) : 0;
  const topFeature = processedFeatures.length > 0 ? [...processedFeatures].sort((a,b) => (b.score||0)-(a.score||0))[0] : null;
  const quickWins = processedFeatures.filter(f => f.score > 100 && f.effort <= 2).length;

  return (
    <div className="right-panel">
      <div className="results-content">
        
        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Features</div>
            <div className="stat-value">{features.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg RICE Score</div>
            <div className="stat-value text-secondary">{avgRice}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top Priority</div>
            <div className="stat-value text-accent" style={{fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{topFeature ? topFeature.name : '-'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Quick Wins (High Score, Low Effort)</div>
            <div className="stat-value text-success">{quickWins}</div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="filters-bar">
          <div className="filter-group">
            <div className="category-pills">
              <button className={`pill ${filterCat === 'All' ? 'active' : ''}`} onClick={() => setFilterCat('All')}>All</button>
              {CATEGORIES.map(c => (
                <button key={c} className={`pill ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="filter-group" style={{flex: 1, justifyContent: 'flex-end'}}>
            <input type="text" className="search-input" placeholder="Search features..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="rice">Sort by: RICE Score</option>
              <option value="reach">Sort by: Reach</option>
              <option value="impact">Sort by: Impact</option>
              <option value="effort">Sort by: Effort</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th className="col-rank">Rank</th>
                <th className="col-feature">Feature</th>
                <th className="col-category">Category</th>
                <th className="col-metric" title="Reach">R</th>
                <th className="col-metric" title="Impact">I</th>
                <th className="col-metric" title="Confidence">C</th>
                <th className="col-metric" title="Effort">E</th>
                <th className="col-score">Score</th>
                <th className="col-badge">Priority</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((feature, idx) => {
                const rank = idx + 1;
                let rankDisplay = `#${rank}`;
                if (rank === 1) rankDisplay = '🥇';
                if (rank === 2) rankDisplay = '🥈';
                if (rank === 3) rankDisplay = '🥉';

                const isExpanded = expandedRow === feature.id;
                const badgeInfo = getPriorityBadgeInfo(feature.score);

                return (
                  <React.Fragment key={feature.id}>
                    <tr onClick={() => setExpandedRow(isExpanded ? null : feature.id)} style={{cursor: 'pointer'}}>
                      <td className="col-rank">{rankDisplay}</td>
                      <td className="col-feature">
                        <div className="feature-cell-name">{feature.name}</div>
                        {!isExpanded && <div className="feature-cell-desc">{feature.description || 'No description'}</div>}
                      </td>
                      <td className="col-category">
                        <div className="tag" style={{backgroundColor: `${getCategoryColor(feature.category)}20`, color: getCategoryColor(feature.category)}}>
                          {feature.category}
                        </div>
                      </td>
                      <td className="col-metric">{feature.reach}</td>
                      <td className="col-metric">{feature.impact}</td>
                      <td className="col-metric">{feature.confidence}%</td>
                      <td className="col-metric">{feature.effort}w</td>
                      <td className="col-score">
                        <span className={getScoreColorClass(feature.score)}>{feature.score}</span>
                      </td>
                      <td className="col-badge">
                        <span className={`priority-badge ${badgeInfo.class}`}>{badgeInfo.text}</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="editing-row">
                        <td colSpan={9} style={{padding: '1.5rem'}}>
                          <div style={{color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600}}>Description:</div>
                          <p style={{marginBottom: '1rem', lineHeight: 1.5}}>{feature.description || 'No description provided.'}</p>
                          <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                            Score Calculation: ({feature.reach} × {feature.impact} × {feature.confidence/100}) / {feature.effort} = {feature.score}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={9} style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                    No features match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
