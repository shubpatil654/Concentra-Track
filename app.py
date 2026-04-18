from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os
from functools import wraps
import json
import numpy as np
from sklearn.linear_model import LinearRegression
import pandas as pd

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///concentratrack.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    tests = db.relationship('TestResult', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'join_date': self.join_date.isoformat()
        }

class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    test_type = db.Column(db.String(20), nullable=False)  # 'vision' or 'hearing'
    level = db.Column(db.String(10), nullable=False)  # 'easy', 'medium', 'hard'
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    time_taken = db.Column(db.Integer)  # in seconds
    answers = db.Column(db.Text)  # JSON string of answers
    date_taken = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.test_type,
            'level': self.level,
            'score': self.score,
            'total': self.total_questions,
            'percentage': self.percentage,
            'time_taken': self.time_taken,
            'answers': json.loads(self.answers) if self.answers else [],
            'date': self.date_taken.isoformat()
        }

class ConcentrationSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_date = db.Column(db.DateTime, default=datetime.utcnow)
    vision_score = db.Column(db.Float)
    hearing_score = db.Column(db.Float)
    overall_score = db.Column(db.Float)
    concentration_level = db.Column(db.String(20))
    recommendations = db.Column(db.Text)

# JWT Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User already exists'}), 400
        
        user = User(
            name=data['name'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=7)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict(),
                'token': token
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Routes
@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<int:user_id>/tests', methods=['GET'])
def get_user_tests(user_id):
    try:
        tests = TestResult.query.filter_by(user_id=user_id).order_by(TestResult.date_taken.desc()).all()
        return jsonify([test.to_dict() for test in tests])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Test Result Routes
@app.route('/api/test-result', methods=['POST'])
def save_test_result():
    try:
        data = request.get_json()
        
        test_result = TestResult(
            user_id=data['userId'],
            test_type=data['type'],
            level=data['level'],
            score=data['score'],
            total_questions=data['total'],
            percentage=data['percentage'],
            time_taken=data.get('time_taken'),
            answers=json.dumps(data.get('answers', []))
        )
        
        db.session.add(test_result)
        db.session.commit()
        
        # Update concentration session
        update_concentration_session(data['userId'], data['type'], data['percentage'])
        
        return jsonify({
            'message': 'Test result saved successfully',
            'result': test_result.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Analytics Routes
@app.route('/api/user/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    try:
        tests = TestResult.query.filter_by(user_id=user_id).all()
        
        vision_tests = [t for t in tests if t.test_type == 'vision']
        hearing_tests = [t for t in tests if t.test_type == 'hearing']
        
        stats = {
            'totalTests': len(tests),
            'visionTests': len(vision_tests),
            'hearingTests': len(hearing_tests),
            'averageScore': calculate_average_score(tests),
            'bestScore': max([t.percentage for t in tests]) if tests else 0,
            'visionStats': calculate_level_stats(vision_tests),
            'hearingStats': calculate_level_stats(hearing_tests),
            'progressTrend': calculate_progress_trend(tests),
            'concentrationLevel': get_current_concentration_level(user_id)
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<int:user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    try:
        # Get tests from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        tests = TestResult.query.filter(
            TestResult.user_id == user_id,
            TestResult.date_taken >= thirty_days_ago
        ).order_by(TestResult.date_taken).all()
        
        # Group by date and calculate daily averages
        daily_scores = {}
        for test in tests:
            date_key = test.date_taken.date().isoformat()
            if date_key not in daily_scores:
                daily_scores[date_key] = []
            daily_scores[date_key].append(test.percentage)
        
        progress_data = []
        for date, scores in daily_scores.items():
            progress_data.append({
                'date': date,
                'average_score': sum(scores) / len(scores),
                'test_count': len(scores)
            })
        
        return jsonify(progress_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<int:user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    try:
        # Get recent test performance
        recent_tests = TestResult.query.filter_by(user_id=user_id)\
            .order_by(TestResult.date_taken.desc()).limit(10).all()
        
        if not recent_tests:
            return jsonify({
                'recommendations': ['Take your first test to get personalized recommendations!']
            })
        
        recommendations = generate_recommendations(recent_tests)
        
        return jsonify({'recommendations': recommendations})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Get top performers (anonymized)
        users_with_stats = []
        users = User.query.all()
        
        for user in users:
            tests = TestResult.query.filter_by(user_id=user.id).all()
            if tests:
                avg_score = sum(t.percentage for t in tests) / len(tests)
                users_with_stats.append({
                    'name': user.name[:1] + '*' * (len(user.name) - 1),  # Anonymize
                    'averageScore': round(avg_score, 1),
                    'totalTests': len(tests)
                })
        
        # Sort by average score and take top 10
        leaderboard = sorted(users_with_stats, key=lambda x: x['averageScore'], reverse=True)[:10]
        
        return jsonify(leaderboard)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI-Powered Analysis Routes
@app.route('/api/user/<int:user_id>/ai-analysis', methods=['GET'])
def get_ai_analysis(user_id):
    try:
        tests = TestResult.query.filter_by(user_id=user_id).all()
        
        if len(tests) < 3:
            return jsonify({
                'analysis': 'Need at least 3 tests for AI analysis',
                'insights': []
            })
        
        analysis = perform_ai_analysis(tests)
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper Functions
def calculate_average_score(tests):
    if not tests:
        return 0
    return round(sum(t.percentage for t in tests) / len(tests), 1)

def calculate_level_stats(tests):
    stats = {'easy': {'average': 0, 'count': 0}, 'medium': {'average': 0, 'count': 0}, 'hard': {'average': 0, 'count': 0}}
    
    for level in ['easy', 'medium', 'hard']:
        level_tests = [t for t in tests if t.level == level]
        if level_tests:
            stats[level] = {
                'average': round(sum(t.percentage for t in level_tests) / len(level_tests), 1),
                'count': len(level_tests)
            }
    
    return stats

def calculate_progress_trend(tests):
    if len(tests) < 2:
        return 'neutral'
    
    # Sort by date and compare recent vs older performance
    sorted_tests = sorted(tests, key=lambda x: x.date_taken)
    recent_half = sorted_tests[len(sorted_tests)//2:]
    older_half = sorted_tests[:len(sorted_tests)//2]
    
    recent_avg = sum(t.percentage for t in recent_half) / len(recent_half)
    older_avg = sum(t.percentage for t in older_half) / len(older_half)
    
    if recent_avg > older_avg + 5:
        return 'improving'
    elif recent_avg < older_avg - 5:
        return 'declining'
    else:
        return 'stable'

def update_concentration_session(user_id, test_type, score):
    today = datetime.utcnow().date()
    session = ConcentrationSession.query.filter(
        ConcentrationSession.user_id == user_id,
        db.func.date(ConcentrationSession.session_date) == today
    ).first()
    
    if not session:
        session = ConcentrationSession(user_id=user_id)
        db.session.add(session)
    
    if test_type == 'vision':
        session.vision_score = score
    else:
        session.hearing_score = score
    
    # Calculate overall score if both tests are completed
    if session.vision_score and session.hearing_score:
        session.overall_score = (session.vision_score + session.hearing_score) / 2
        session.concentration_level = get_concentration_level_name(session.overall_score)
    
    db.session.commit()

def get_concentration_level_name(score):
    if score >= 90:
        return 'excellent'
    elif score >= 75:
        return 'good'
    elif score >= 60:
        return 'average'
    elif score >= 40:
        return 'needs_improvement'
    else:
        return 'poor'

def get_current_concentration_level(user_id):
    recent_session = ConcentrationSession.query.filter_by(user_id=user_id)\
        .order_by(ConcentrationSession.session_date.desc()).first()
    
    if recent_session and recent_session.overall_score:
        return {
            'level': recent_session.concentration_level,
            'score': recent_session.overall_score,
            'recommendations': recent_session.recommendations
        }
    
    return {'level': 'unknown', 'score': 0, 'recommendations': None}

def generate_recommendations(tests):
    recommendations = []
    
    # Analyze performance patterns
    vision_tests = [t for t in tests if t.test_type == 'vision']
    hearing_tests = [t for t in tests if t.test_type == 'hearing']
    
    # Vision-specific recommendations
    if vision_tests:
        avg_vision = sum(t.percentage for t in vision_tests) / len(vision_tests)
        if avg_vision < 60:
            recommendations.append("Practice pattern recognition exercises to improve visual concentration")
        elif avg_vision > 85:
            recommendations.append("Excellent vision test performance! Try harder difficulty levels")
    
    # Hearing-specific recommendations
    if hearing_tests:
        avg_hearing = sum(t.percentage for t in hearing_tests) / len(hearing_tests)
        if avg_hearing < 60:
            recommendations.append("Practice active listening exercises to improve auditory concentration")
        elif avg_hearing > 85:
            recommendations.append("Great hearing test results! Challenge yourself with complex audio content")
    
    # General recommendations based on overall performance
    overall_avg = sum(t.percentage for t in tests) / len(tests)
    
    if overall_avg < 50:
        recommendations.extend([
            "Consider taking regular breaks during study sessions",
            "Try meditation or mindfulness exercises to improve focus",
            "Ensure you're getting adequate sleep (7-9 hours per night)"
        ])
    elif overall_avg > 80:
        recommendations.extend([
            "Maintain your excellent concentration habits",
            "Consider helping others improve their focus skills",
            "Try advanced concentration challenges"
        ])
    
    # Time-based recommendations
    recent_tests = sorted(tests, key=lambda x: x.date_taken, reverse=True)[:3]
    if len(recent_tests) >= 3:
        recent_avg = sum(t.percentage for t in recent_tests) / len(recent_tests)
        if recent_avg < overall_avg - 10:
            recommendations.append("Recent performance decline detected. Consider stress management techniques")
    
    return recommendations[:5]  # Limit to 5 recommendations

def perform_ai_analysis(tests):
    # Convert tests to DataFrame for analysis
    data = []
    for test in tests:
        data.append({
            'date': test.date_taken,
            'type': test.test_type,
            'level': test.level,
            'percentage': test.percentage,
            'time_taken': test.time_taken or 0
        })
    
    df = pd.DataFrame(data)
    
    insights = []
    
    # Trend analysis
    df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
    if len(df) >= 5:
        # Simple linear regression for trend
        X = df['days_since_start'].values.reshape(-1, 1)
        y = df['percentage'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        slope = model.coef_[0]
        if slope > 0.1:
            insights.append("📈 Your concentration is improving over time!")
        elif slope < -0.1:
            insights.append("📉 Your concentration shows a declining trend. Consider reviewing your study habits.")
        else:
            insights.append("📊 Your concentration levels are stable.")
    
    # Performance by test type
    vision_avg = df[df['type'] == 'vision']['percentage'].mean()
    hearing_avg = df[df['type'] == 'hearing']['percentage'].mean()
    
    if abs(vision_avg - hearing_avg) > 15:
        if vision_avg > hearing_avg:
            insights.append("🎯 You perform better on vision tests than hearing tests. Consider practicing auditory focus.")
        else:
            insights.append("🎧 You perform better on hearing tests than vision tests. Consider practicing visual attention.")
    
    # Performance by difficulty
    difficulty_performance = df.groupby('level')['percentage'].mean()
    if 'hard' in difficulty_performance and 'easy' in difficulty_performance:
        if difficulty_performance['hard'] > difficulty_performance['easy'] - 10:
            insights.append("🚀 You handle difficult challenges well! Your concentration is strong under pressure.")
    
    # Time of day analysis (if we had time data)
    # This would require storing test time information
    
    return {
        'analysis': f"Based on {len(tests)} tests, your average concentration score is {df['percentage'].mean():.1f}%",
        'insights': insights,
        'trend': 'improving' if len(df) >= 5 and model.coef_[0] > 0.1 else 'stable',
        'strongest_area': 'vision' if vision_avg > hearing_avg else 'hearing',
        'recommendation_priority': 'high' if df['percentage'].mean() < 60 else 'medium'
    }

# Initialize database
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)