# Infrastructure Hazard Reporting & Monitoring System

A mobile-first web application for reporting infrastructure hazards with camera capture, GPS location, and admin management capabilities.

## Features

### 📱 Mobile-First Design
- Responsive design optimized for smartphones
- Touch-friendly interface
- Camera integration for hazard documentation
- GPS location capture

### 📸 Hazard Reporting
- Capture photos directly from device camera
- Automatic GPS location detection
- Description input for hazard details
- Real-time form validation

### 📋 Public History View
- Transparent display of all reported hazards
- Before/after image comparison
- Status tracking (Pending/Resolved)
- Filter by status functionality

### 🔐 Admin Management
- Secure authentication system
- Admin dashboard with statistics
- Upload resolution photos for resolved hazards
- Update hazard status from Pending to Resolved

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Python Flask |
| Database | SQLite (development) / PostgreSQL (production) |
| Styling | Custom CSS with mobile-first approach |
| APIs | Camera API, Geolocation API |

## Project Structure

```
hazard-monitoring-system/
│
├── app.py                  # Flask application
├── config.py               # App configuration
├── requirements.txt        # Python dependencies
├── README.md               # This file
│
├── templates/              # HTML templates
│   ├── index.html          # Report hazard page
│   ├── history.html        # Public history view
│   ├── admin_login.html    # Admin authentication
│   └── admin_dashboard.html # Admin dashboard
│
├── static/                 # Static files
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       ├── camera.js       # Camera functionality
│       └── location.js     # GPS location functionality
│
├── uploads/                # Image storage
│   ├── before/             # Hazard images
│   └── after/              # Resolution images
│
└── hazard.db               # SQLite database
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Local Development Setup

1. **Clone or download the project files**
   ```bash
   cd hazard-monitoring-system
   ```

2. **Create virtual environment (recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   - Main app: http://localhost:5001
   - Admin login: http://localhost:5001/admin/login

### Default Admin Credentials
- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change these credentials in production!

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
FLASK_ENV=production
FLASK_DEBUG=False
```

### Database Configuration

The system uses SQLite by default. For production, configure PostgreSQL in `config.py`:

```python
# For PostgreSQL
SQLALCHEMY_DATABASE_URI = 'postgresql://username:password@host/database'
```

## Deployment

### Using Gunicorn (Production)

1. **Install Gunicorn** (already in requirements.txt)
2. **Run with Gunicorn:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5001 app:app
   ```

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
```

### Platform-Specific Deployment

#### Render.com
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn -w 4 -b 0.0.0.0:5001 app:app`
4. Configure environment variables

#### Heroku
1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app
   ```
3. Deploy using Heroku Git

#### DigitalOcean App Platform
1. Create new app from GitHub source
2. Configure Python environment
3. Set run command: `gunicorn -w 4 -b 0.0.0.0:5001 app:app`

## Usage Guide

### Reporting a Hazard

1. **Open the application** on your mobile device
2. **Click "Open Camera"** to access device camera
3. **Capture a photo** of the infrastructure hazard
4. **Get Location** - Allow location access (automatic)
5. **Add Description** - Describe the hazard in detail
6. **Submit Report** - Click submit when all fields are complete

### Admin Management

1. **Login** using admin credentials
2. **View Dashboard** - See all reports with statistics
3. **Select a Report** - Click on pending hazards to review
4. **Upload Resolution** - Take "after" photo showing resolved hazard
5. **Mark as Resolved** - Update status and complete the record

### Viewing History

1. **Navigate to History** from bottom navigation
2. **Browse Reports** - See all submitted hazards
3. **Filter by Status** - View Pending or Resolved only
4. **Compare Images** - See before/after for resolved hazards

## API Endpoints

### Hazard Reporting
- `POST /api/report` - Submit new hazard report

### Admin Functions
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Authenticate admin
- `GET /admin/dashboard` - Admin dashboard
- `POST /admin/resolve/<id>` - Mark hazard as resolved

### File Access
- `GET /uploads/before/<filename>` - Access hazard images
- `GET /uploads/after/<filename>` - Access resolution images

## Database Schema

### hazard_reports Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | Unique report ID |
| before_image | TEXT | Path to hazard image |
| after_image | TEXT | Path to resolved image |
| description | TEXT | User description |
| latitude | REAL | GPS latitude |
| longitude | REAL | GPS longitude |
| status | TEXT | Pending / Resolved |
| date_reported | DATETIME | Report timestamp |
| date_resolved | DATETIME | Resolution timestamp |

### admin Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER PK | Admin ID |
| username | TEXT | Admin username |
| password_hash | TEXT | Hashed password |

## Security Considerations

1. **Change default admin credentials** immediately
2. **Use HTTPS** in production
3. **Validate file uploads** (type and size)
4. **Implement rate limiting** for API endpoints
5. **Use environment variables** for sensitive configuration
6. **Regular security updates** for dependencies

## Browser Compatibility

- **Modern browsers** with camera and geolocation support
- **Mobile Safari** (iOS 12+)
- **Chrome Mobile** (Android 8+)
- **Chrome Desktop** (version 80+)
- **Firefox** (version 75+)

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Try using back camera (facingMode: 'environment')
- Check browser compatibility

### Location Issues
- Enable location services on device
- Grant location permission to browser
- Ensure GPS is available

### Database Issues
- Check file permissions for SQLite database
- Ensure uploads directory is writable
- Verify database schema is initialized

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser compatibility
- Verify installation steps

---

**Built with ❤️ for safer infrastructure**