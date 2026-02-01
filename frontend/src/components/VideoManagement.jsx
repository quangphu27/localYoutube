import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './VideoManagement.css'

function VideoManagement({ videos, onVideoDelete, onReorder }) {
  const [localVideos, setLocalVideos] = useState(videos)

  useEffect(() => {
    setLocalVideos(videos)
  }, [videos])

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(localVideos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLocalVideos(items)
    onReorder(items.map(v => v.id))
  }

  const displayVideos = localVideos.length > 0 ? localVideos : videos

  if (displayVideos.length === 0) {
    return (
      <div className="empty-state">
        <p>Chưa có video nào được tải xuống</p>
      </div>
    )
  }

  return (
    <div className="video-management">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="videos">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="video-grid"
            >
              {displayVideos.map((video, index) => (
                <Draggable
                  key={video.id}
                  draggableId={video.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`video-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div className="video-card-thumbnail">
                        <div className="thumbnail-placeholder">
                          <span>▶</span>
                        </div>
                      </div>
                      <div className="video-card-info">
                        <div className="video-card-title" title={video.title || video.filename}>
                          {video.title || video.filename}
                        </div>
                        {video.duration && (
                          <div className="video-card-duration">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                        <div className="video-card-url">
                          {video.original_url}
                        </div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn xóa video này?')) {
                            onVideoDelete(video.id)
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default VideoManagement
