import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import DownloadPage from './components/DownloadPage'
import WatchPage from './components/WatchPage'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/download" /> : <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/download" /> : <Register />
          } 
        />
        <Route 
          path="/download" 
          element={
            isAuthenticated ? <DownloadPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/watch/:videoId?" 
          element={
            isAuthenticated ? <WatchPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/download" /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
