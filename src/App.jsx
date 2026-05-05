import React, { Suspense } from 'react'
import Home from './pages/Home'
const Live = React.lazy(() => import('./pages/Live'))
const Recent = React.lazy(() => import('./pages/Recent'))
const Create = React.lazy(() => import('./pages/Create'))
const ScoreCard = React.lazy(() => import('./pages/ScoreCard'))
const CompletedMatches = React.lazy(() => import('./pages/CompleteMatches'))
const LiveMatches = React.lazy(() => import('./pages/LiveMatches'))
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading">Loading...</div>}>
      <Routes>
        <Route path="/create" element={<Create />} />
        <Route path="/match/:id" element={<Live />} />
       <Route path="/live/:id" element={<Live />} />
        <Route path="/completed" element={<CompletedMatches />} />
        <Route path="/scorecard/:id" element={<ScoreCard />} />
        <Route path="/" element={<LiveMatches />} />
      </Routes>
      </Suspense>
    </Router>
  )
}

export default App