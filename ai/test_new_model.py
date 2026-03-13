import google.generativeai as genai
import os

key = "AIzaSyBcG-Ct_pHaUMhXBOsPvPriFIddPJfVcHI"
genai.configure(api_key=key)

# Using gemini-2.0-flash as seen in the list
model = genai.GenerativeModel("gemini-2.5-flash")

print("Testing gemini-2.5-flash...")
try:
    response = model.generate_content("Hello")
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
