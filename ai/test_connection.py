import requests
import json

try:
    data = {
        "user_profile": {
            "experience_level": "Beginner",
            "skills": ["python"],
            "learning_goals": ["web dev"],
            "interests": ["coding"],
            "time_commitment": "5 hours",
            "learning_style": "text",
            "difficulty_preference": "easy"
        },
        "goal": "Become a Web Developer"
    }
    url = "http://localhost:8001/generate-path"
    print(f"Sending request to {url}...")
    response = requests.post(url, json=data, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("Success!")
        print(f"Path Preview: {result.get('path', '')[:100]}...")
    else:
        print(f"Failed with status {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
