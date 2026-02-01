# YouTube Downloader Web Application

Web application để tải và phát video YouTube với giao diện giống YouTube.

## Cài đặt

### Backend (Flask)

1. Cài đặt Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Tạo database MySQL:
- Tạo database tên `youtube_downloader`
- Cập nhật thông tin kết nối trong `backend/app.py` (dòng 15):
  ```python
  app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://username:password@localhost/youtube_downloader'
  ```

3. Chạy backend:
```bash
python app.py
```

Backend sẽ chạy tại `http://localhost:5000`

### Frontend (React + Vite)

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## Tính năng

- Đăng ký và đăng nhập
- Tải video YouTube từ link (hỗ trợ nhiều link cùng lúc)
- Phát video đã tải xuống
- Danh sách video bên phải với khả năng kéo thả để sắp xếp
- Xóa video (xóa cả file trên server)
- Giao diện giống YouTube với theme tối

## Lưu ý

- Đảm bảo MySQL đã được cài đặt và chạy
- Video sẽ được lưu trong thư mục `backend/media/`
- Cần cài đặt `yt-dlp` để tải video (đã có trong requirements.txt)
