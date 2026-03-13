import google.generativeai as genai
import os

key = "AIzaSyBcG-Ct_pHaUMhXBOsPvPriFIddPJfVcHI"
genai.configure(api_key=key)

model_name = "gemini-2.5-flash"
print(f"Testing {model_name}...")
try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello")
    print(f"SUCCESS with {model_name}: {response.text}")
except Exception as e:
    print(f"FAILED {model_name}: {e}")
