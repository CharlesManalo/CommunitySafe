#!/bin/bash

# Infrastructure Hazard Reporting System - Quick Start Script

echo "🚧 Infrastructure Hazard Reporting System"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️  Initializing database..."
python -c "
from app import init_db
import os
if not os.path.exists('hazard.db'):
    print('Creating new database...')
    init_db()
    print('✅ Database initialized')
else:
    print('✅ Database already exists')
"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting the application..."
echo "📱 Open your browser and go to: http://localhost:5001"
echo "🔐 Admin login: http://localhost:5001/admin/login"
echo ""
echo "📋 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change admin credentials in production!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Flask application
python app.py

echo ""
echo "👋 Application stopped. Goodbye!"
