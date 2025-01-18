# BrainCraft: AI-Powered Mermaid Diagram Generator

An intelligent tool that transforms natural language input into beautiful Mermaid diagrams through iterative refinement.

## 🌟 Features

- 🎤 Voice and Text Input Support
- 🎨 Real-time Mermaid Diagram Generation
- 🤖 AI-powered Code Generation with Mistral
- 💬 Interactive Refinement through Conversational AI
- 📤 Multiple Export Options (PNG, PDF)

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BrainCraft.git
cd BrainCraft
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Install dependencies:
```bash
# Backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

4. Run the application:
```bash
# Backend (in one terminal)
uvicorn src.api.main:app --reload

# Frontend (in another terminal)
cd frontend
npm start
```

## 🏗️ Architecture

- Frontend: React.js with Mermaid.js integration
- Backend: FastAPI with Python
- AI Components:
  - Mistral: Natural Language Understanding
  - Codestral: Mermaid Code Generation
  - Haystack: Conversational Agent

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mistral AI](https://mistral.ai/)
- [Haystack](https://haystack.deepset.ai/)
- [Mermaid.js](https://mermaid-js.github.io/)
