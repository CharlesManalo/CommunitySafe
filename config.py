import os

class Config:
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database configuration
    DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hazard.db')
    
    # Upload configuration
    UPLOAD_FOLDER_BEFORE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'before')
    UPLOAD_FOLDER_AFTER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'after')
    
    # Maximum upload size (16MB)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Application settings
    APP_NAME = "Infrastructure Hazard Reporting System"
    
    @staticmethod
    def init_app(app):
        pass