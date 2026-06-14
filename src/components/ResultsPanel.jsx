import { useState, Fragment, useRef } from 'react';
import { Layers, Trash2, Download, Edit2 } from 'lucide-react';
import { calculateRiceScore, getPriorityBadgeInfo, CATEGORIES, getCategoryColor } from '../utils';
import PriorityMatrix from './PriorityMatrix';

const getDetailedScoreColor = (score) => {
  if (score === null) return 'score-none';
  if (score > 300) return 'score-ultra';
  if (score > 150) return 'score-violet';
  if (score >= 75) return 'score-sky';
  if (score >= 25) return 'score-med';
  return 'score-muted';
};

export default function ResultsPanel({ features, onLoadSample, onDeleteFeature, lastAddedId }) {
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rice');
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const rowRefs = useRef({});
  const highlightId = lastAddedId;

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

  const validScores = processedFeatures.filter(f => f.score !== null);
  const avgRice = validScores.length ? Math.round(validScores.reduce((acc, f) => acc + f.score, 0) / validScores.length) : 0;
  const topFeature = processedFeatures.length > 0 ? [...processedFeatures].sort((a,b) => (b.score||0)-(a.score||0))[0] : null;
  const quickWins = processedFeatures.filter(f => f.score > 100 && f.effort <= 2).length;

  const handleExportCSV = () => {
    const allSorted = [...processedFeatures].sort((a,b) => (b.score||0)-(a.score||0));
    const headers = ['Rank','Feature Name','Category','Reach','Impact','Confidence','Effort','RICE Score','Priority'];
    const rows = allSorted.map((f, i) => {
      const badge = getPriorityBadgeInfo(f.score);
      return [i+1, `"${f.name}"`, f.category, f.reach, f.impact, f.confidence, f.effort, f.score, badge.text];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `priorityiq_features_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { borderLeft: '3px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)' };
    if (rank === 2) return { borderLeft: '3px solid #9ca3af' };
    if (rank === 3) return { borderLeft: '3px solid #b45309' };
    return { borderLeft: '3px solid transparent' };
  };

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
            <div className="stat-label">Quick Wins</div>
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

        {/* Tabs + Export */}
        <div className="results-toolbar">
          <div className="view-tabs">
            <button className={`view-tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
              Ranked List
            </button>
            <button className={`view-tab ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')}>
              Priority Matrix
            </button>
          </div>
          {activeTab === 'list' && (
            <button className="btn btn-secondary btn-small" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        {/* Matrix View */}
        {activeTab === 'matrix' && (
          <PriorityMatrix features={features} />
        )}

        {/* Table View */}
        {activeTab === 'list' && (
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
                  const isHighlighted = highlightId === feature.id;

                  return (
                    <Fragment key={feature.id}>
                      <tr
                        ref={el => rowRefs.current[feature.id] = el}
                        onClick={() => setExpandedRow(isExpanded ? null : feature.id)}
                        style={{cursor: 'pointer', ...getRankStyle(rank)}}
                        className={isHighlighted ? 'row-highlight-flash' : ''}
                      >
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
                          <span className={getDetailedScoreColor(feature.score)}>{feature.score}</span>
                        </td>
                        <td className="col-badge">
                          <span className={`priority-badge ${badgeInfo.class}`}>{badgeInfo.text}</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="expanded-detail-row">
                          <td colSpan={9}>
                            <div className="expanded-content">
                              <div className="expanded-desc">
                                <div className="expanded-label">Description</div>
                                <p>{feature.description || 'No description provided.'}</p>
                              </div>
                              <div className="expanded-calc">
                                Score: ({feature.reach} × {feature.impact} × {feature.confidence}%) ÷ {feature.effort} = <strong className={getDetailedScoreColor(feature.score)}>{feature.score}</strong>
                              </div>
                              <div className="expanded-actions">
                                <button className="btn btn-secondary btn-small" onClick={(e) => { e.stopPropagation(); alert('Edit functionality to be implemented'); }} style={{ color: 'var(--accent)' }}>
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button className="btn btn-danger btn-small" onClick={(e) => { e.stopPropagation(); onDeleteFeature(feature.id); setExpandedRow(null); }}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
        )}

      </div>
    </div>
  );
}
