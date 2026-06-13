import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { calculateRiceScore, getScoreColorClass, CATEGORIES, getCategoryColor } from '../utils';

export default function FeatureInputPanel({ features, onAddFeature, onDeleteFeature, onClearAll, onLoadSample }) {
  const initialForm = {
    name: '',
    description: '',
    reach: '',
    impact: 1,
    confidence: 80,
    effort: '',
    category: 'UX'
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value
    }));
  };

  const currentScore = calculateRiceScore(form.reach, form.impact, form.confidence, form.effort);
  
  const handleAdd = () => {
    if (!form.name || !form.reach || !form.effort || form.effort <= 0) return;
    
    onAddFeature({
      // eslint-disable-next-line react-hooks/purity
      id: crypto.randomUUID(),
      ...form,
      rice: currentScore
    });
    setForm(initialForm);
  };

  return (
    <div className="left-panel">
      <div className="panel-section">
        <h2 className="section-title">Add New Feature</h2>
        
        <div className="form-group">
          <label className="form-label">Feature Name *</label>
          <input type="text" name="name" className="form-input" placeholder="e.g. Dark Mode" value={form.name} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-textarea" placeholder="Brief description of what this feature does" value={form.description} onChange={handleChange} rows={2}></textarea>
        </div>
        
        <div className="form-group">
          <label className="form-label">Reach (Users/Qtr) *</label>
          <input type="number" name="reach" className="form-input" placeholder="Users affected per quarter" min="1" value={form.reach} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label className="form-label">Impact *</label>
          <div className="segmented-control">
            {[{v: 0.25, l: 'Minimal (0.25)'}, {v: 0.5, l: 'Low (0.5)'}, {v: 1, l: 'Medium (1)'}, {v: 2, l: 'High (2)'}, {v: 3, l: 'Massive (3)'}].map(opt => (
              <button key={opt.v} className={`segment-btn ${form.impact === opt.v ? 'active' : ''}`} onClick={() => setForm(p => ({...p, impact: opt.v}))}>
                {opt.l.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Confidence *</label>
          <div className="slider-container">
            <input type="range" name="confidence" min="10" max="100" step="10" value={form.confidence} onChange={handleChange} />
            <span className="slider-value">{form.confidence}%</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Effort (Person-weeks) *</label>
          <input type="number" name="effort" className="form-input" placeholder="Person-weeks to build" min="0.5" step="0.5" value={form.effort} onChange={handleChange} required />
          {form.effort !== '' && form.effort <= 0 && <span style={{color: 'var(--danger)', fontSize: '0.75rem'}}>Effort must be greater than 0</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Category</label>
          <select name="category" className="form-select" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="live-score-preview">
          <div className="live-score-label">Live RICE Score</div>
          <div className={`live-score-value ${getScoreColorClass(currentScore)}`}>
            {currentScore !== null ? currentScore : '—'}
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleAdd}
          disabled={!form.name || !form.reach || !form.effort || form.effort <= 0}
        >
          Add Feature
        </button>
      </div>

      <div className="panel-section">
        <div className="bulk-actions">
          <div className="bulk-actions-left">{features.length} feature{features.length !== 1 ? 's' : ''}</div>
          <div className="bulk-actions-right">
            <button className="btn btn-secondary btn-small" onClick={onLoadSample}>Load Sample Data</button>
            <button className="btn btn-danger btn-small" onClick={() => { if(window.confirm('Clear all features?')) onClearAll(); }}>Clear All</button>
          </div>
        </div>

        <div className="mini-feature-list">
          {features.map((f) => (
            <div key={f.id} className="mini-feature-card">
              <div className="drag-handle"><GripVertical size={16} /></div>
              <div className="mini-feature-info">
                <div className="mini-feature-name" title={f.name}>{f.name}</div>
                <div className="tag" style={{backgroundColor: `${getCategoryColor(f.category)}20`, color: getCategoryColor(f.category)}}>{f.category}</div>
              </div>
              <div className={`mini-feature-score ${getScoreColorClass(calculateRiceScore(f.reach, f.impact, f.confidence, f.effort))}`}>
                {calculateRiceScore(f.reach, f.impact, f.confidence, f.effort)}
              </div>
              <div className="mini-feature-actions">
                <button className="icon-btn" onClick={() => onDeleteFeature(f.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
