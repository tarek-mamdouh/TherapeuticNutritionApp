# Therapeutic Nutrition Web App for Diabetic Patients

A comprehensive AI-powered nutrition management application designed specifically for diabetic patients, featuring multilingual support, accessibility features, and advanced food analysis capabilities.

## Features

### 🍽️ Food Analysis
- **AI-Powered Recognition**: Upload meal photos for automatic food identification
- **Comprehensive Database**: 80+ pre-loaded foods with nutritional information
- **Manual Entry**: Search and select foods with detailed nutrition facts
- **Diabetes Assessment**: Real-time suitability analysis (safe/moderate/avoid)

### 🗣️ Accessibility
- **Voice Commands**: Speech-to-text input for hands-free operation
- **Audio Feedback**: Text-to-speech for nutritional information
- **Screen Reader Support**: WCAG 2.1 AA compliance
- **Special Needs Mode**: Enhanced accessibility features

### 🌍 Multilingual Support
- **Arabic & English**: Full RTL/LTR layout support
- **Cultural Foods**: Middle Eastern cuisine recognition
- **Dynamic Translation**: Real-time language switching

### 🤖 AI Assistant
- **Multi-Provider AI**: OpenAI, Gemini, and Perplexity integration
- **Nutrition Guidance**: Diabetes-specific dietary advice
- **Chat History**: Persistent conversation storage
- **Voice Interaction**: Speech input and audio responses

### 📊 Tracking & Analytics
- **Meal Logging**: Comprehensive food diary with timestamps
- **Weekly Charts**: Visual nutrition trends and analytics
- **Data Export**: Export capabilities for healthcare providers
- **Dual Storage**: Server and local backup for reliability

## Quick Start

### Docker Deployment (Recommended)

1. **Clone and Setup**
```bash
git clone <repository-url>
cd therapeutic-nutrition-app
cp .env.example .env
```

2. **Configure Environment**
Edit `.env` file with your API keys:
```env
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
SESSION_SECRET=your_secure_session_secret
```

3. **Deploy Application**
```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

4. **Access Application**
- Main App: http://localhost
- API: http://localhost/api
- Health Check: http://localhost/health

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application available at http://localhost:5000
```

## API Keys Required

### OpenAI API
- Visit: https://platform.openai.com/api-keys
- Create new secret key
- Add to `.env` as `OPENAI_API_KEY`

### Google Gemini API
- Visit: https://makersuite.google.com/app/apikey
- Generate API key
- Add to `.env` as `GEMINI_API_KEY`

### Perplexity API
- Visit: https://www.perplexity.ai/settings/api
- Create new API key
- Add to `.env` as `PERPLEXITY_API_KEY`

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **AI Integration**: OpenAI GPT-4, Google Gemini, Perplexity
- **Database**: PostgreSQL-ready schema (currently in-memory)
- **Authentication**: Session-based with bcrypt
- **Accessibility**: Web Speech API, ARIA labels
- **Deployment**: Docker, Docker Compose, Nginx

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React SPA     │◄──►│  Express API    │◄──►│  AI Services    │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Food Analysis │    │ • Authentication│    │ • OpenAI GPT-4  │
│ • Meal Logging  │    │ • Food Database │    │ • Google Gemini │
│ • AI Chatbot    │    │ • Chat API      │    │ • Perplexity    │
│ • Accessibility │    │ • Nutrition API │    │                 │
│ • Multilingual  │    │ • Session Mgmt  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## User Guide

### Getting Started
1. Register with username, email, and diabetes information
2. Choose language preference (Arabic/English)
3. Enable accessibility features if needed
4. Start analyzing meals through photo upload or manual entry

### Food Analysis
1. **Photo Upload**: Take/upload meal photo for AI recognition
2. **Manual Entry**: Search foods from comprehensive database
3. **Review Results**: Check nutrition facts and diabetes suitability
4. **Save to Log**: Track meals for weekly analytics

### AI Assistant
1. Ask nutrition questions in Arabic or English
2. Get personalized advice based on diabetes type
3. Use voice commands for hands-free interaction
4. Access chat history for reference

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and translations
├── server/                # Express backend
│   ├── services/          # AI integration services
│   ├── data/              # Food database
│   └── routes.ts          # API endpoints
├── shared/                # Shared types and schemas
├── scripts/               # Deployment scripts
└── nginx/                 # Reverse proxy configuration
```

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/analyze/image` - Food photo analysis
- `POST /api/analyze/manual` - Manual food entry
- `GET/POST/DELETE /api/meal-logs` - Meal logging
- `POST /api/chat` - AI chatbot interaction

### Development Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run docker:dev       # Run development with Docker
npm run docker:prod      # Run production with Docker
npm run docker:logs      # View container logs
```

## Deployment Options

### Docker Compose (Production)
```bash
docker-compose up -d --build
```

### Docker Hub Registry
```bash
# Build and push
./scripts/build-and-push.sh v1.0.0

# Pull and run
docker run -d -p 5000:5000 \
  -e OPENAI_API_KEY=your_key \
  tarekt7/therapeutic-nutrition-app:latest
```

### Manual Deployment
```bash
npm install
npm run build
npm start
```

## Security Features

- **Authentication**: Secure session-based login with bcrypt
- **Input Validation**: Zod schema validation on all inputs
- **XSS Protection**: React built-in XSS prevention
- **Rate Limiting**: API rate limiting via Nginx
- **Health Checks**: Container health monitoring

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with Web Speech API support

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the [Deployment Guide](DEPLOYMENT_GUIDE.md)
- Review [Project Documentation](PROJECT_DOCUMENTATION.md)
- Create an issue in the repository

---

**Note**: This application requires valid API keys for OpenAI, Google Gemini, and Perplexity services to function properly. Ensure you have obtained these keys before deployment.