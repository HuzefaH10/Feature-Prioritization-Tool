import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import FeatureInputPanel from './components/FeatureInputPanel'
import ResultsPanel from './components/ResultsPanel'
import { SAMPLE_DATA } from './utils'
import './index.css'

function App() {
  const [features, setFeatures] = useState(() => {
    const saved = localStorage.getItem('priorityiq_features')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  const [lastAddedId, setLastAddedId] = useState(null)

  useEffect(() => {
    localStorage.setItem('priorityiq_features', JSON.stringify(features))
  }, [features])

  const handleAddFeature = (feature) => {
    setFeatures(prev => [...prev, feature])
    setLastAddedId(feature.id)
  }

  const handleDeleteFeature = (id) => {
    setFeatures(prev => prev.filter(f => f.id !== id))
  }

  const handleClearAll = () => {
    setFeatures([])
  }

  const handleLoadSample = () => {
    setFeatures(SAMPLE_DATA)
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <FeatureInputPanel 
          features={features} 
          onAddFeature={handleAddFeature} 
          onDeleteFeature={handleDeleteFeature}
          onClearAll={handleClearAll}
          onLoadSample={handleLoadSample}
        />
        <ResultsPanel 
          features={features}
          onLoadSample={handleLoadSample}
          onDeleteFeature={handleDeleteFeature}
          lastAddedId={lastAddedId}
        />
      </main>
      <Footer />
    </div>
  )
}

export default App
