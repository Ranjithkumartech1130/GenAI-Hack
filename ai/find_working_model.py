import google.generativeai as genai
import os
import time

key = "AIzaSyBcG-Ct_pHaUMhXBOsPvPriFIddPJfVcHI"
genai.configure(api_key=key)

models_to_test = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-8b", # commonly available sometimes
    "gemini-1.5-flash",    # Retry just in case
    "gemini-pro"
]

for model_name in models_to_test:
    print(f"Testing {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"SUCCESS with {model_name}: {response.text}")
        break 
    except Exception as e:
        print(f"FAILED {model_name}: {e}")
        time.sleep(1)
