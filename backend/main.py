from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os

# .env dosyasından API anahtarını al
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY bulunamadı! .env dosyasını kontrol et")

# Gemini konfigürasyonu
genai.configure(api_key=api_key)

# FastAPI uygulaması başlat
app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gelen POST isteği modeli
class ChatRequest(BaseModel):
    question: str

# Chat endpoint'i
@app.post("/chat")
async def chat(request: ChatRequest):
    prompt = f"""
Sen sadece lise fizik konularında uzmanlaşmış bir öğretmensin. 
Lise fiziği dışındaki hiçbir konuda cevap veremezsin ve o tür soruları kibarca reddedersin. 
Sadece lise fiziği konularında, sade ve anlaşılır bir dille açıklama yap. 
Soru: "{request.question}"
Cevap:
"""
    try:
        # Doğru kullanım: Model oluştur ve generate_content ile içerik üret
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        print(f"HATA: {str(e)}")
        return {"error": str(e)}

# Test route
@app.get("/")
def read_root():
    return {"message": "API çalışıyor"}