import { useRef, useEffect } from 'react'
import './VideoPlayer.css'

function VideoPlayer({ video }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && video) {
      videoRef.current.load()
    }
  }, [video])

  if (!video) {
    return null
  }

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          controls
          autoPlay
          className="video-element"
        >
          <source src={`http://localhost:5000/api/videos/${video.id}/stream`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="video-info">
        <h2 className="video-title">{video.title || video.filename}</h2>
        {video.duration && (
          <p className="video-duration">
            Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>
    </div>
  )
}

export default VideoPlayer
