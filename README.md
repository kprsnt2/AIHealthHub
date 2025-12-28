# AI Health Hub 🏥

> **Your Complete AI-Powered Health Companion** - Symptom Analysis, Drug Safety & Diet Guidance with Telugu language support.

![AI Health Hub](public/logo.png)

## ✨ Features

### 🩺 Pancreatitis Care
- Disease symptom checker
- AI chat for pancreatitis guidance
- Personalized diet recommendations
- Telugu language support

### 💊 MolecuLearn - Drug Safety
- Comprehensive drug information
- Safety scoring system
- Pharmaceutical alternatives
- Natural remedy suggestions
- Drug interaction warnings

### 🏥 Health Pro
- AI-powered symptom analysis
- Second opinion feature
- Health profile management
- Personalized diet planning
- Consultation history

## 🌍 Language Support

- **English** - Full support
- **Telugu (తెలుగు)** - Full support for all modules

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **AI**: Google Gemini 1.5 Flash
- **Data Caching**: TanStack React Query
- **PDF Export**: jsPDF
- **PWA**: Vite PWA Plugin
- **Styling**: Custom CSS with Glassmorphism

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-health-hub.git
cd ai-health-hub

# Install dependencies
npm install

# Create .env file with your Gemini API key
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Header.tsx      # Navigation with mobile menu
│   ├── Footer.tsx      # Disclaimer and links
│   ├── SplashScreen.tsx
│   ├── LoadingSkeleton.tsx
│   └── ErrorBoundary.tsx
├── modules/            # Feature modules
│   ├── pancreatitis/   # Pancreatitis care module
│   ├── moleculearn/    # Drug safety module
│   └── healthpro/      # Health Pro module
├── services/           # API and storage services
│   ├── geminiService.ts
│   └── storageService.ts
├── hooks/              # Custom React hooks
│   ├── useQuery.tsx    # React Query integration
│   └── usePdfExport.ts # PDF generation
├── utils/              # Utility functions
│   ├── apiUtils.ts     # API helpers
│   ├── rateLimiter.ts  # Rate limiting
│   └── encryption.ts   # Data encryption
├── i18n/               # Translations
└── types.ts            # TypeScript types
```

## 📱 PWA Support

AI Health Hub is a Progressive Web App:
- Install on any device
- Works offline (cached data)
- Native app-like experience

## 🔒 Security Features

- Client-side rate limiting
- Optional data encryption (AES-256)
- No server-side health data storage
- Clear medical disclaimers

## ⚠️ Medical Disclaimer

> **Important**: AI Health Hub is for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ using React, TypeScript, and Google Gemini AI**
