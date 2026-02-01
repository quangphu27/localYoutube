import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from './Header'
import VideoPlayer from './VideoPlayer'
import VideoList from './VideoList'
import './WatchPage.css'

function WatchPage({ setIsAuthenticated }) {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/videos')
      setVideos(response.data)
      if (response.data.length > 0) {
        if (videoId) {
          const video = response.data.find(v => v.id === parseInt(videoId))
          setCurrentVideo(video || response.data[0])
        } else if (!currentVideo) {
          setCurrentVideo(response.data[0])
          navigate(`/watch/${response.data[0].id}`, { replace: true })
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (videoId && videos.length > 0) {
      const video = videos.find(v => v.id === parseInt(videoId))
      if (video && (!currentVideo || currentVideo.id !== video.id)) {
        setCurrentVideo(video)
      }
    }
  }, [videoId, videos])

  const handleVideoSelect = (video) => {
    setCurrentVideo(video)
    navigate(`/watch/${video.id}`)
  }

  const handleVideoDelete = async (videoId) => {
    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`)
      if (currentVideo?.id === videoId) {
        const remainingVideos = videos.filter(v => v.id !== videoId)
        if (remainingVideos.length > 0) {
          setCurrentVideo(remainingVideos[0])
          navigate(`/watch/${remainingVideos[0].id}`)
        } else {
          setCurrentVideo(null)
          navigate('/watch')
        }
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

  if (videos.length === 0) {
    return (
      <div className="watch-page">
        <Header setIsAuthenticated={setIsAuthenticated} />
        <div className="watch-empty">
          <p>Chưa có video nào. Hãy tải video từ trang "Tải Video"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="watch-page">
      <Header setIsAuthenticated={setIsAuthenticated} />
      <div className="watch-content">
        <div className="watch-main">
          {currentVideo && (
            <VideoPlayer video={currentVideo} />
          )}
        </div>
        <div className="watch-sidebar">
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

export default WatchPage
