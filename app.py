from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import sqlite3
import json

from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
def init_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    
    # Create hazard reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hazard_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            before_image TEXT NOT NULL,
            after_image TEXT,
            description TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            date_reported DATETIME NOT NULL,
            date_resolved DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create admin table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default admin if not exists
    default_admin = cursor.execute('SELECT id FROM admin WHERE username = ?', ('admin',)).fetchone()
    if not default_admin:
        password_hash = generate_password_hash('admin123')
        cursor.execute('''
            INSERT INTO admin (username, password_hash)
            VALUES (?, ?)
        ''', ('admin', password_hash))
    
    conn.commit()
    conn.close()

# Database helper
def get_db_connection():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/history')
def history():
    conn = get_db_connection()
    reports = conn.execute('''
        SELECT * FROM hazard_reports 
        ORDER BY date_reported DESC
    ''').fetchall()
    conn.close()
    return render_template('history.html', reports=reports)

@app.route('/api/report', methods=['POST'])
def report_hazard():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['before_image', 'description', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Save image
        before_image_data = data['before_image']
        if before_image_data.startswith('data:image'):
            # Extract base64 data
            header, base64_data = before_image_data.split(',', 1)
            file_extension = header.split(';')[0].split('/')[1]
            filename = f"hazard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER_BEFORE'], filename)
            
            # Ensure directory exists
            os.makedirs(app.config['UPLOAD_FOLDER_BEFORE'], exist_ok=True)
            
            # Save file
            import base64
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(base64_data))
        else:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO hazard_reports 
            (before_image, description, latitude, longitude, status, date_reported)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            filename,
            data['description'],
            data['latitude'],
            data['longitude'],
            'Pending',
            datetime.now()
        ))
        conn.commit()
        report_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'report_id': report_id,
            'message': 'Hazard reported successfully'
        })
        
    except Exception as e:
        app.logger.error(f'Error reporting hazard: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = get_db_connection()
        admin = conn.execute('''
            SELECT * FROM admin WHERE username = ?
        ''', (username,)).fetchone()
        conn.close()
        
        if admin and check_password_hash(admin['password_hash'], password):
            session['admin_logged_in'] = True
            session['admin_username'] = admin['username']
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    conn = get_db_connection()
    reports = conn.execute('''
        SELECT * FROM hazard_reports 
        ORDER BY date_reported DESC
    ''').fetchall()
    conn.close()
    
    return render_template('admin_dashboard.html', reports=reports)

@app.route('/admin/resolve/<int:report_id>', methods=['POST'])
def resolve_hazard(report_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.json
        after_image_data = data.get('after_image')
        
        if not after_image_data or not after_image_data.startswith('data:image'):
            return jsonify({'error': 'Invalid after image'}), 400
        
        # Save after image
        header, base64_data = after_image_data.split(',', 1)
        file_extension = header.split(';')[0].split('/')[1]
        filename = f"resolved_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER_AFTER'], filename)
        
        # Ensure directory exists
        os.makedirs(app.config['UPLOAD_FOLDER_AFTER'], exist_ok=True)
        
        # Save file
        import base64
        with open(filepath, 'wb') as f:
            f.write(base64.b64decode(base64_data))
        
        # Update database
        conn = get_db_connection()
        conn.execute('''
            UPDATE hazard_reports 
            SET after_image = ?, status = ?, date_resolved = ?
            WHERE id = ?
        ''', (filename, 'Resolved', datetime.now(), report_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Hazard marked as resolved'
        })
        
    except Exception as e:
        app.logger.error(f'Error resolving hazard: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/uploads/before/<filename>')
def uploaded_before_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_BEFORE'], filename)

@app.route('/uploads/after/<filename>')
def uploaded_after_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_AFTER'], filename)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5001)