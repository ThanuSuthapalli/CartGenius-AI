# CartGenius AI - eCommerce Shopping Assistant

CartGenius AI is a premium, AI-powered e-commerce shopping assistant built using FastAPI and Google Gemini. It seamlessly understands natural language to simulate an expert store assistant. When queried about products, it intuitively finds and recommends precise real-world items and seamlessly formulates direct shopping links to top retailers like Amazon, Flipkart, Myntra, and Croma based on multi-source intelligence.

## Features
- ✨ **Generative AI Responses**: Chatbot powered naturally by the ultra-fast `gemini-2.5-flash` model.
- 🛍️ **Multi-Source Web Intelligence**: Gemini categorizes real-world item requests and maps them precisely to the best vendor platform (e.g. Myntra for clothes, Amazon/Croma for electronics) and dynamically generates a searchable shopping cart link.
- 💬 **Sleek Vanilla Web UI**: An elegant frontend layout built without bloated frameworks—featuring dark mode, glassmorphism UI, inline typing indicators, and aesthetic product display cards right inside the chat bubble.
- 🔒 **Secure Environment Variables**: API keys are securely managed via `.env`.

## Tech Stack
- **Backend:** Python 3, FastAPI, Uvicorn, Google GenAI SDK (`google-genai`).
- **Frontend:** Vanilla HTML, CSS (`style.css`), JavaScript (`script.js`), FontAwesome.

## Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/ThanuSuthapalli/CartGenius-AI.git
   cd CartGenius-AI
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your environment**
   Create a new `.env` file in the root directory and add your Google Gemini API Key:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the FastAPI Server**
   ```bash
   python main.py
   ```
   > The server will automatically start at `http://127.0.0.1:8000`

## Author
[Thanu Suthapalli](https://github.com/ThanuSuthapalli)
