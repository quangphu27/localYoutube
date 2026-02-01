import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './VideoList.css'

function VideoList({ videos, currentVideo, onVideoSelect, onVideoDelete, onReorder }) {
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
      <div className="video-list-container">
        <h3 className="video-list-title">Playlist</h3>
        <div className="empty-state">No videos downloaded yet</div>
      </div>
    )
  }

  return (
    <div className="video-list-container">
      <h3 className="video-list-title">Playlist ({displayVideos.length})</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="videos">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="video-list"
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
                      className={`video-item ${currentVideo?.id === video.id ? 'active' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                      onClick={() => onVideoSelect(video)}
                    >
                      <div className="video-item-thumbnail">
                        <div className="thumbnail-placeholder">
                          <span>▶</span>
                        </div>
                      </div>
                      <div className="video-item-info">
                        <div className="video-item-title" title={video.title || video.filename}>
                          {video.title || video.filename}
                        </div>
                        {video.duration && (
                          <div className="video-item-duration">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Are you sure you want to delete this video?')) {
                            onVideoDelete(video.id)
                          }
                        }}
                      >
                        ×
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

export default VideoList
