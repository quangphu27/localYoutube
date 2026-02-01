from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import yt_dlp
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Phu2722002@localhost/youtube_downloader'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'media'
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

db = SQLAlchemy(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(500))
    duration = db.Column(db.Integer)
    file_path = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    position = db.Column(db.Integer, default=0)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

@app.route('/api/videos', methods=['GET'])
def get_videos():
    videos = Video.query.order_by(Video.position).all()
    return jsonify([{
        'id': v.id,
        'filename': v.filename,
        'title': v.title,
        'duration': v.duration,
        'original_url': v.original_url,
        'created_at': v.created_at.isoformat(),
        'position': v.position
    } for v in videos]), 200

@app.route('/api/videos/download', methods=['POST'])
def download_videos():
    data = request.json
    urls = data.get('urls', [])
    
    if not urls:
        return jsonify({'error': 'No URLs provided'}), 400
    
    downloaded = []
    errors = []
    
    for url in urls:
        url = url.strip()
        if not url:
            continue
        
        try:
            safe_title = f'video_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
            format_selectors = [
                'best[height<=720]',
                'best[height<=480]',
                'worst[height>=240]',
                'best'
            ]
            
            downloaded_video = False
            last_error = None
            
            for format_selector in format_selectors:
                try:
                    ydl_opts = {
                        'format': format_selector,
                        'outtmpl': os.path.join(app.config['UPLOAD_FOLDER'], f'{safe_title}.%(ext)s'),
                        'quiet': False,
                        'no_warnings': False,
                        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'extractor_args': {
                            'youtube': {
                                'player_client': ['ios', 'android', 'web'],
                                'player_skip': ['webpage', 'configs'],
                            }
                        },
                        'http_headers': {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-us,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate',
                            'Connection': 'keep-alive',
                        },
                        'nocheckcertificate': True,
                        'ignoreerrors': False,
                    }
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(url, download=True)
                        filename = ydl.prepare_filename(info)
                        
                        if not os.path.exists(filename):
                            ext = info.get('ext', 'mp4')
                            filename = os.path.join(app.config['UPLOAD_FOLDER'], f'{safe_title}.{ext}')
                        
                        if os.path.exists(filename) and os.path.getsize(filename) > 0:
                            title = info.get('title', 'Unknown')
                            duration = info.get('duration', 0)
                            
                            video = Video(
                                filename=os.path.basename(filename),
                                original_url=url,
                                title=title,
                                duration=duration,
                                file_path=filename,
                                position=Video.query.count()
                            )
                            db.session.add(video)
                            db.session.commit()
                            
                            downloaded.append({
                                'id': video.id,
                                'title': title,
                                'filename': video.filename
                            })
                            downloaded_video = True
                            break
                except Exception as format_error:
                    last_error = format_error
                    continue
            
            if not downloaded_video:
                raise Exception(str(last_error) if last_error else 'Unable to download video')
                
        except Exception as e:
            errors.append({'url': url, 'error': str(e)})
    
    return jsonify({
        'downloaded': downloaded,
        'errors': errors
    }), 200

@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    video = Video.query.get_or_404(video_id)
    
    if os.path.exists(video.file_path):
        os.remove(video.file_path)
    
    db.session.delete(video)
    db.session.commit()
    
    return jsonify({'message': 'Video deleted successfully'}), 200

@app.route('/api/videos/reorder', methods=['POST'])
def reorder_videos():
    data = request.json
    video_ids = data.get('video_ids', [])
    
    for index, video_id in enumerate(video_ids):
        video = Video.query.get(video_id)
        if video:
            video.position = index
    db.session.commit()
    
    return jsonify({'message': 'Videos reordered successfully'}), 200

@app.route('/api/videos/<int:video_id>/stream', methods=['GET'])
def stream_video(video_id):
    video = Video.query.get_or_404(video_id)
    
    if not os.path.exists(video.file_path):
        return jsonify({'error': 'Video file not found'}), 404
    
    range_header = request.headers.get('Range', None)
    if not range_header:
        return send_file(video.file_path, mimetype='video/mp4')
    
    size = os.path.getsize(video.file_path)
    byte1 = 0
    byte2 = None
    
    range_match = range_header.replace('bytes=', '').split('-')
    if len(range_match) == 2:
        byte1 = int(range_match[0]) if range_match[0] else 0
        byte2 = int(range_match[1]) if range_match[1] else size - 1
    
    length = byte2 - byte1 + 1
    
    def generate():
        with open(video.file_path, 'rb') as f:
            f.seek(byte1)
            remaining = length
            while remaining:
                chunk_size = min(8192, remaining)
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk
    
    response = app.response_class(
        generate(),
        206,
        {
            'Content-Type': 'video/mp4',
            'Content-Length': str(length),
            'Content-Range': f'bytes {byte1}-{byte2}/{size}',
            'Accept-Ranges': 'bytes'
        }
    )
    return response

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
