import os
import urllib.parse
import json
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini API using the provided key
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

app = FastAPI(title="AI Chatbot for eCommerce - LLM Powered")

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ChatRequest(BaseModel):
    message: str

def get_chatbot_response(message: str) -> dict:
    prompt = f"""
    You are a highly helpful and friendly AI eCommerce Shopping Assistant inside an online store.
    A user has sent you a message: "{message}"
    
    If the user is asking for general information (like returns, shipping) or just saying Hi, respond nicely.
    If the user is asking about products to buy (like laptops, phones, shoes, etc.), recommend 2 to 4 fantastic real-world products that fit their request, and provide estimated current market prices in INR (₹).
    Crucially, determine which website the product is most commonly bought from (Amazon, Flipkart, Myntra, or Croma).
    
    Your response must be ONLY a raw JSON object (parseable by json.loads) with the following exact structure:
    {{
      "reply_text": "A friendly conversational response to the user's message.",
      "products": [
        {{
           "name": "Full Product Title",
           "desc": "Short description and estimated price.",
           "platform": "Amazon" or "Flipkart" or "Myntra" or "Croma"
        }}
      ]
    }}
    
    If no products are relevant, leave the "products" array empty. Do NOT include markdown code blocks like ```json around the response, output ONLY the raw JSON string.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        response_text = response.text.strip()
        
        # Clean markdown formatting if gemini accidentally added it
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        data = json.loads(response_text)
        
        products = []
        for p in data.get("products", []):
            title = p.get("name", "")
            platform = p.get("platform", "Amazon").lower()
            encoded_title = urllib.parse.quote(title)
            
            # Create direct link based on the AI's intelligent platform routing
            if "amazon" in platform:
                link = f"https://www.amazon.in/s?k={encoded_title}"
                platform_display = "Amazon"
            elif "flipkart" in platform:
                link = f"https://www.flipkart.com/search?q={encoded_title}"
                platform_display = "Flipkart"
            elif "myntra" in platform:
                link = f"https://www.myntra.com/{encoded_title}"
                platform_display = "Myntra"
            elif "croma" in platform:
                link = f"https://www.croma.com/searchB?q={encoded_title}"
                platform_display = "Croma"
            else:
                link = f"https://www.google.com/search?q=buy+{encoded_title}"
                platform_display = platform.capitalize()
                
            products.append({
                "name": title,
                "desc": p.get("desc", ""),
                "platform": platform_display,
                "link": link
            })
            
        if products:
            return {"type": "products", "text": data.get("reply_text", "Here are some top recommendations for you:"), "products": products}
        else:
            return {"type": "text", "text": data.get("reply_text", "How can I help you shop today?")}
            
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"type": "text", "text": "Oops, my intelligent brain is having a bit of trouble right now. Please try asking again!"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    return get_chatbot_response(request.message)

@app.get("/")
async def serve_ui():
    with open("static/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(content=html)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
