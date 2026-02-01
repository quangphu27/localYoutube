import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from './Header'
import DownloadForm from './DownloadForm'
import VideoManagement from './VideoManagement'
import './DownloadPage.css'

function DownloadPage({ setIsAuthenticated }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/videos')
      setVideos(response.data)
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

  const handleVideoDelete = async (videoId) => {
    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`)
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

  return (
    <div className="download-page">
      <Header setIsAuthenticated={setIsAuthenticated} />
      <div className="download-content">
        <div className="download-section">
          <h2>Tải Video YouTube</h2>
          <DownloadForm onDownload={handleDownload} loading={loading} />
        </div>
        <div className="management-section">
          <h2>Quản Lý Video ({videos.length})</h2>
          <VideoManagement
            videos={videos}
            onVideoDelete={handleVideoDelete}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  )
}

export default DownloadPage
