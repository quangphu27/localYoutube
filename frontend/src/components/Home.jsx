import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import VideoPlayer from './VideoPlayer'
import VideoList from './VideoList'
import DownloadForm from './DownloadForm'
import './Home.css'

function Home({ setIsAuthenticated }) {
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/videos')
      setVideos(response.data)
      if (response.data.length > 0 && !currentVideo) {
        setCurrentVideo(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const handleDownload = async (urls) => {
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/videos/download', { urls })
      await fetchVideos()
    } catch (error) {
      console.error('Error downloading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelect = (video) => {
    setCurrentVideo(video)
  }

  const handleVideoDelete = async (videoId) => {
    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`)
      if (currentVideo?.id === videoId) {
        const remainingVideos = videos.filter(v => v.id !== videoId)
        setCurrentVideo(remainingVideos.length > 0 ? remainingVideos[0] : null)
      }
      await fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const handleReorder = async (newOrder) => {
    try {
      await axios.post('http://localhost:5000/api/videos/reorder', {
        video_ids: newOrder
      })
      await fetchVideos()
    } catch (error) {
      console.error('Error reordering videos:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    setIsAuthenticated(false)
  }

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1>YouTube Downloader</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="main-content">
        <div className="video-section">
          <DownloadForm onDownload={handleDownload} loading={loading} />
          {currentVideo && (
            <VideoPlayer video={currentVideo} />
          )}
        </div>
        
        <div className="sidebar">
          <VideoList
            videos={videos}
            currentVideo={currentVideo}
            onVideoSelect={handleVideoSelect}
            onVideoDelete={handleVideoDelete}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
