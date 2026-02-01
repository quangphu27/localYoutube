import { useState } from 'react'
import './DownloadForm.css'

function DownloadForm({ onDownload, loading }) {
  const [urls, setUrls] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const urlList = urls.split('\n').filter(url => url.trim())
    
    if (urlList.length === 0) {
      setError('Please enter at least one URL')
      return
    }

    onDownload(urlList)
    setUrls('')
  }

  return (
    <div className="download-form-container">
      <form onSubmit={handleSubmit} className="download-form">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter YouTube URLs (one per line)"
          rows="3"
          disabled={loading}
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Downloading...' : 'Download Videos'}
        </button>
      </form>
    </div>
  )
}

export default DownloadForm
