# ConcentraTrack - Student Concentration Tracker

A comprehensive web application designed to help students track and improve their concentration levels through interactive vision and hearing tests.

## 🌟 Features

### 🔐 User Authentication
- **Secure Login/Signup** with form validation
- **Session management** with persistent storage
- **User profiles** with personalized statistics

### 👁️ Vision Tests (Pattern Recognition)
- **3 Difficulty Levels:**
  - **Easy**: 20 seconds per question, simple patterns
  - **Medium**: 10 seconds per question, moderate complexity
  - **Hard**: 5 seconds per question, complex patterns
- **Interactive timer** with visual countdown
- **Multiple choice answers** with immediate feedback
- **Pattern types**: Sequences, shapes, colors, logic puzzles

### 🎧 Hearing Tests (Audio Comprehension)
- **3 Difficulty Levels:**
  - **Easy**: 5-second audio clips with simple words
  - **Medium**: 10-second clips with short sentences
  - **Hard**: 20-second clips with complex sentences
- **Text-to-speech integration** for audio playback
- **Accuracy calculation** based on text similarity
- **Progress tracking** with visual feedback

### 📊 Analytics & Progress Tracking
- **Dashboard overview** with key statistics
- **Performance analysis** by difficulty level
- **Progress charts** showing improvement over time
- **Concentration level assessment** with recommendations

### 🎨 Modern UI/UX
- **Responsive design** for desktop and mobile
- **Glassmorphism effects** with gradient backgrounds
- **Smooth animations** and transitions
- **Intuitive navigation** with sidebar menu

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/concentra-track.git
   cd concentra-track
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
concentra-track/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AuthPage.js
│   │   ├── Dashboard.js
│   │   ├── VisionTest.js
│   │   ├── HearingTest.js
│   │   ├── Analysis.js
│   │   └── Profile.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── TestContext.js
│   ├── data/
│   │   └── testData.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── server.js
├── package.json
└── README.md
```

## 🧪 Test Types

### Vision Tests
- **Alphabetical sequences** (A, B, C, ?)
- **Numerical patterns** (2, 4, 6, ?)
- **Shape recognition** (○, ●, ○, ?)
- **Complex logic** (Fibonacci, prime numbers)
- **Visual patterns** (colors, symbols)

### Hearing Tests
- **Word recognition** (simple vocabulary)
- **Sentence comprehension** (everyday phrases)
- **Complex passages** (academic/technical content)
- **Audio quality assessment** with similarity matching

## 📈 Concentration Assessment

The app evaluates concentration based on:
- **Response accuracy** (correct answers)
- **Response time** (within time limits)
- **Consistency** (performance across questions)
- **Difficulty progression** (improvement over levels)

### Concentration Levels
- **Excellent** (90-100%): Outstanding focus
- **Good** (75-89%): Above average concentration
- **Average** (60-74%): Normal attention span
- **Needs Improvement** (40-59%): Consider breaks
- **Poor** (0-39%): Rest recommended

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icon library

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **JSON** - Data storage (can be upgraded to database)

### Features
- **Web Speech API** - Text-to-speech for audio tests
- **Local Storage** - Offline data persistence
- **Responsive Design** - Mobile-friendly interface

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Test Settings
Modify test parameters in `src/data/testData.js`:

```javascript
export const testSettings = {
    vision: {
        easy: { timeLimit: 20, questionsCount: 10 },
        medium: { timeLimit: 10, questionsCount: 12 },
        hard: { timeLimit: 5, questionsCount: 15 }
    },
    hearing: {
        easy: { audioDuration: 5, questionsCount: 10 },
        medium: { audioDuration: 10, questionsCount: 12 },
        hard: { audioDuration: 20, questionsCount: 15 }
    }
};
```

## 📱 Browser Compatibility

- **Chrome** 60+ (recommended)
- **Firefox** 55+
- **Safari** 11+
- **Edge** 79+

**Note**: Speech synthesis requires modern browser support.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Pattern recognition concepts from cognitive psychology research
- Audio processing techniques for accessibility
- Modern web design principles for user experience
- Educational assessment methodologies

## 📞 Support

For support, email support@concentratrack.com or create an issue in the GitHub repository.

## 🔮 Future Enhancements

- **Database integration** (MongoDB/PostgreSQL)
- **Real-time multiplayer** tests
- **Advanced analytics** with machine learning
- **Mobile app** (React Native)
- **Accessibility features** (screen readers, keyboard navigation)
- **Gamification** (achievements, leaderboards)
- **Export reports** (PDF, CSV)
- **Teacher dashboard** for classroom management

---

**ConcentraTrack** - Empowering students to understand and improve their concentration through interactive assessments.