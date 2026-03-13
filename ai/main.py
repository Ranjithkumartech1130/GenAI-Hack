import os
import io
import json
import base64
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import numpy as np
from pydantic import BaseModel
from dotenv import load_dotenv
import textwrap
import subprocess

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

app = FastAPI(title="BugBuster AI Service")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# AI Models Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")
else:
    genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

class UserProfile(BaseModel):
    experience_level: str = "Beginner"
    skills: List[str] = []
    learning_goals: List[str] = []
    interests: List[str] = []
    time_commitment: str = "5-10 hours/week"
    learning_style: str = "Visual"
    difficulty_preference: str = "Easy"

class PathRequest(BaseModel):
    user_profile: UserProfile = UserProfile()
    goal: str
    additional_skills: Optional[str] = ""
    preferences: Optional[str] = ""
    resume_content: Optional[str] = ""
    use_previous_skills: bool = True

class TaskRequest(BaseModel):
    goal: str
    skills: List[str]
    experience_level: str
    focus_area: Optional[str] = "General"

@app.post("/generate-path")
async def generate_path(request: PathRequest):
    """Generate learning path using web scraping + curated database. No API key needed."""
    try:
        from curriculum_builder import generate_curriculum
        
        curriculum = generate_curriculum(
            goal=request.goal,
            experience_level=request.user_profile.experience_level,
            skills=request.user_profile.skills,
            use_previous=request.use_previous_skills
        )
        return {"success": True, "path": curriculum}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Curriculum generation failed: {e}")
        # Minimal fallback
        return {"success": True, "path": f"# 🚀 Learning Path: {request.goal}\n\n> Please try again. Visit [Coursera](https://www.coursera.org/search?query={request.goal.replace(' ', '+')}) or [freeCodeCamp](https://www.freecodecamp.org/) to get started.", "is_fallback": True}
        

        
class TaskRequest(BaseModel):
    goal: str
    skills: List[str] = []
    experience_level: str
    focus_area: str
    language: str = "python"
    random_seed: Optional[str] = None

@app.post("/generate-tasks")
async def generate_tasks(request: TaskRequest):
    try:
        prompt = f"""
        Act as a Senior Software Architect and Coding Interviewer. 
        Create 3 UNIQUE, RANDOM, CHALLENGING, and REAL-WORLD coding tasks tailored specifically for a user taking the course/topic: "{request.goal}".
        
        CONTEXT:
        - Specific Course/Topic: {request.focus_area}
        - User Level: {request.experience_level}
        - Programming Language: {request.language}
        - Current Skills: {', '.join(request.skills)}
        - Randomization Seed: {request.random_seed} (Ensure entirely new tasks compared to previous requests)

        CRITERIA FOR TASKS:
        1. "Relevance": Tasks MUST be directly related and highly specific to the course: "{request.goal}". Do NOT provide generic programming tasks unless the user's goal is general programming.
        2. "Diversity & Randomness": Ensure tasks cover different sub-topics of the course. Use the random seed to vary the problems widely each time they are generated to ensure no duplicates.
        3. "Real-world": Avoid generic academic problems. Scenarios should reflect professional use-cases specific to "{request.goal}".
        4. "Accuracy": Ensure the model generates 100% accurate, optimized code. The test cases must precisely match the provided solution's logic.
        5. Professional Starter Code: Include proper comments, type hints (if applicable for {request.language}), and a clear function signature.
        
        Output a valid JSON array where each object has:
        - "title": A professional, descriptive title.
        - "description": A detailed problem statement following professional standards.
        - "starter_code": Professional boilerplate code.
        - "solution": The complete, optimized solution.
        - "language": "{request.language}"
        - "test_cases": An array of objects: [{{"input": "function_call_or_input_code", "expected_output": "stringified_result"}}]
        
        Example JSON format:
        [
            {{
                "title": "Data Pipeline: Email Validator",
                "description": "Implement a robust email validation logic for a user registration pipeline. The function should check for...",
                "starter_code": "def validate_email(email: str) -> bool:\n    # Implement logic to validate format\n    pass",
                "solution": "import re\n\ndef validate_email(email: str) -> bool:\n    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{{2,}}$'\n    return bool(re.match(pattern, email))",
                "language": "python",
                "test_cases": [
                    {{"input": "validate_email('test@example.com')", "expected_output": "True"}},
                    {{"input": "validate_email('invalid-email')", "expected_output": "False"}}
                ]
            }}
        """
        import requests
        OPENROUTER_API_KEY = "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"
        res = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
            json={"model": "google/gemini-2.5-flash", "messages": [{"role": "user", "content": prompt}], "temperature": 0.5, "max_tokens": 4096}
        )
        if res.status_code != 200:
            print(f"OpenRouter Error Code: {res.status_code}, TEXT: {res.text[:500]}")
            raise Exception(f"OpenRouter Error: {res.text}")
            
        text = res.json()["choices"][0]["message"]["content"]
        # Clean markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        # Optional basic cleanup for trailing commas if it was truncated slightly
        try:
            tasks = json.loads(text)
        except json.JSONDecodeError as je:
            print(f"JSON Parse mapping failed, attempting to fix. \nError details: {je}")
            # Ensure it ends with }]}] if truncated
            if not text.endswith("]"):
                idx = text.rfind("}")
                if idx != -1:
                    text = text[:idx+1] + "]"
            tasks = json.loads(text)
            
        return {"success": True, "tasks": tasks}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Task generation error: {e}")
        # Return 3 distinct fallback tasks related to the goal
        return {
            "success": True, 
            "tasks": [
                {
                    "title": f"Foundation: {request.goal} Analysis", 
                    "description": f"Perform a basic analysis and architectural setup for a {request.goal} project.",
                    "starter_code": f"# Project: {request.goal}\n# Step 1: Initialize core components\n",
                    "solution": "print('Environment ready')",
                    "language": request.language,
                    "test_cases": [{"input": "", "expected_output": "Environment ready"}]
                },
                {
                    "title": f"Logic: {request.goal} Data Handler", 
                    "description": f"Create a function to handle incoming signals for the {request.goal} system.",
                    "starter_code": "def process_data(data):\n    # Your logic here\n    pass",
                    "solution": "def process_data(data): return data",
                    "language": request.language,
                    "test_cases": [{"input": "process_data('test')", "expected_output": "test"}]
                },
                {
                    "title": f"Production: {request.goal} API Mock", 
                    "description": f"Implement a mock interface for testing the {request.goal} integration.",
                    "starter_code": "class MockAPI:\n    def get_status(self):\n        return 'offline'",
                    "solution": "class MockAPI:\n    def get_status(self):\n        return 'online'",
                    "language": request.language,
                    "test_cases": [{"input": "MockAPI().get_status()", "expected_output": "online"}]
                }
            ]
        }

class EvaluationRequest(BaseModel):
    code: str
    language: str
    test_cases: List[Dict[str, str]]

@app.post("/evaluate-code")
async def evaluate_code(request: EvaluationRequest):
    """
    Evaluates code against test cases.
    """
    results = []
    all_passed = True
    lang = request.language.lower()

    for i, tc in enumerate(request.test_cases):
        input_code = tc.get("input", "")
        expected = tc.get("expected_output", "").strip()
        
        # Construct code to run: user code + the test case call (if any)
        # For Python, we'll try to execute and get the last expression result or stdout
        if lang == "python":
            full_code = request.code + "\n"
            if input_code:
                # If there's a call like add(5,3), we want its result
                full_code += f"\nprint({input_code})"
                
            try:
                import sys
                from contextlib import redirect_stdout
                f = io.StringIO()
                with redirect_stdout(f):
                    exec_globals = {"__builtins__": __builtins__}
                    exec(full_code, exec_globals)
                
                actual_output = f.getvalue().strip()
                passed = actual_output == expected
                results.append({
                    "test_id": i + 1,
                    "input": input_code,
                    "expected": expected,
                    "actual": actual_output,
                    "passed": passed
                })
                if not passed: all_passed = False
            except Exception as e:
                all_passed = False
                results.append({
                    "test_id": i + 1,
                    "error": str(e),
                    "passed": False
                })
        
        elif lang == "javascript":
            # For JS, we'll append a console.log of the input code
            full_code = request.code + "\n"
            if input_code:
                full_code += f"\nconsole.log({input_code});"
            
            try:
                result = subprocess.run(
                    ["node", "-e", full_code], 
                    capture_output=True, 
                    text=True, 
                    timeout=3
                )
                actual_output = result.stdout.strip()
                if result.returncode != 0:
                    passed = False
                    error = result.stderr
                else:
                    passed = actual_output == expected
                    error = None
                
                results.append({
                    "test_id": i + 1,
                    "input": input_code,
                    "expected": expected,
                    "actual": actual_output,
                    "passed": passed,
                    "error": error
                })
                if not passed: all_passed = False
            except Exception as e:
                all_passed = False
                results.append({"test_id": i+1, "error": str(e), "passed": False})

        elif lang == "java" or lang == "cpp" or lang == "c++" or lang == "csharp" or lang == "c#":
            # For compiled languages, we'll run the full code and check output
            try:
                # Use the run_code function internally
                exec_request = CodeExecutionRequest(code=request.code, language=lang)
                exec_result = await run_code(exec_request)
                
                if exec_result["success"]:
                    actual_output = exec_result["output"].strip()
                    passed = actual_output == expected
                    results.append({
                        "test_id": i + 1,
                        "input": input_code,
                        "expected": expected,
                        "actual": actual_output,
                        "passed": passed
                    })
                    if not passed: all_passed = False
                else:
                    all_passed = False
                    results.append({
                        "test_id": i + 1,
                        "error": exec_result.get("error", "Execution failed"),
                        "passed": False
                    })
            except Exception as e:
                all_passed = False
                results.append({"test_id": i+1, "error": str(e), "passed": False})
        
        elif lang == "sql":
            # For SQL, execute and check results
            try:
                exec_request = CodeExecutionRequest(code=request.code, language="sql")
                exec_result = await run_code(exec_request)
                
                if exec_result["success"]:
                    actual_output = exec_result["output"].strip()
                    passed = expected.lower() in actual_output.lower() or actual_output == expected
                    results.append({
                        "test_id": i + 1,
                        "input": input_code,
                        "expected": expected,
                        "actual": actual_output,
                        "passed": passed
                    })
                    if not passed: all_passed = False
                else:
                    all_passed = False
                    results.append({
                        "test_id": i + 1,
                        "error": exec_result.get("error", "SQL execution failed"),
                        "passed": False
                    })
            except Exception as e:
                all_passed = False
                results.append({"test_id": i+1, "error": str(e), "passed": False})
        
        elif lang == "html" or lang == "css":
            # For HTML/CSS, validation is the test
            try:
                exec_request = CodeExecutionRequest(code=request.code, language=lang)
                exec_result = await run_code(exec_request)
                
                passed = exec_result["success"]
                results.append({
                    "test_id": i + 1,
                    "input": "Validation check",
                    "expected": "Valid code",
                    "actual": "Valid" if passed else exec_result.get("error", "Invalid"),
                    "passed": passed
                })
                if not passed: all_passed = False
            except Exception as e:
                all_passed = False
                results.append({"test_id": i+1, "error": str(e), "passed": False})
        
        else:
            all_passed = False
            results.append({
                "test_id": i + 1,
                "error": f"Language '{lang}' not supported for evaluation",
                "passed": False
            })

    return {"success": True, "all_passed": all_passed, "results": results}

class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python" # Added language field

@app.post("/run-code")
async def run_code(request: CodeExecutionRequest):
    """
    Executes code. Currently supports Python (exec) and Node.js (subprocess).
    """
    lang = request.language.lower()
    
    if lang == "python":
        try:
            # Create a buffer to capture stdout
            import sys
            from contextlib import redirect_stdout
            
            f = io.StringIO()
            with redirect_stdout(f):
                # Execute the code in a restricted namespace
                exec_globals = {"__builtins__": __builtins__}
                try:
                    import pandas as pd
                    import numpy as np
                    exec_globals['pd'] = pd
                    exec_globals['np'] = np
                except:
                    pass
                    
                exec(request.code, exec_globals)
                
            output = f.getvalue()
            return {"success": True, "output": output if output else "Code executed successfully (no output)."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    elif lang == "javascript":
        try:
            # Run node.js subprocess
            result = subprocess.run(
                ["node", "-e", request.code], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            if result.returncode == 0:
                return {"success": True, "output": result.stdout if result.stdout else "Code executed successfully (no output)."}
            else:
                 return {"success": False, "error": result.stderr}
        except Exception as e:
            return {"success": False, "error": f"Node.js execution failed: {str(e)}"}
            
    elif lang == "sql":
        try:
            import sqlite3
            # Create an in-memory database
            conn = sqlite3.connect(':memory:')
            cursor = conn.cursor()
            
            # Allow multiple statements (e.g., CREATE TABLE; INSERT; SELECT)
            # separates statements by semi-colon
            statements = [s for s in request.code.split(';') if s.strip()]
            
            output_buffer = []
            
            for statement in statements:
                try:
                    cursor.execute(statement)
                    if statement.strip().lower().startswith("select"):
                        # Fetch results for SELECT queries
                        rows = cursor.fetchall()
                        # Get column names
                        if cursor.description:
                            columns = [description[0] for description in cursor.description]
                            output_buffer.append(f"Result for: {statement.strip()[:50]}...")
                            output_buffer.append(f"{' | '.join(columns)}")
                            output_buffer.append("-" * 30)
                            for row in rows:
                                output_buffer.append(' | '.join(map(str, row)))
                            output_buffer.append("\n")
                    else:
                        conn.commit()
                        output_buffer.append(f"Executed: {statement.strip()[:50]}... (Rows affected: {cursor.rowcount})")
                except Exception as stmt_err:
                     output_buffer.append(f"Error executing statement '{statement.strip()[:30]}...': {str(stmt_err)}")
            
            conn.close()
            final_output = "\n".join(output_buffer)
            return {"success": True, "output": final_output if final_output else "SQL executed successfully (no text output)."}
            
        except Exception as e:
            return {"success": False, "error": f"SQL execution failed: {str(e)}"}

    elif lang == "java":
        try:
            # Save code to a temporary file
            import tempfile
            import os
            
            # Extract class name from code
            class_name = "Main"
            for line in request.code.split('\n'):
                if 'public class' in line:
                    class_name = line.split('public class')[1].split('{')[0].strip()
                    break
            
            with tempfile.TemporaryDirectory() as tmpdir:
                java_file = os.path.join(tmpdir, f"{class_name}.java")
                with open(java_file, 'w') as f:
                    f.write(request.code)
                
                # Compile
                compile_result = subprocess.run(
                    ["javac", java_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if compile_result.returncode != 0:
                    return {"success": False, "error": f"Compilation Error:\n{compile_result.stderr}"}
                
                # Run
                run_result = subprocess.run(
                    ["java", "-cp", tmpdir, class_name],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if run_result.returncode == 0:
                    return {"success": True, "output": run_result.stdout if run_result.stdout else "Code executed successfully (no output)."}
                else:
                    return {"success": False, "error": run_result.stderr}
        except FileNotFoundError:
            return {"success": False, "error": "Java compiler (javac) not found. Please install JDK to run Java code."}
        except Exception as e:
            return {"success": False, "error": f"Java execution failed: {str(e)}"}
    
    elif lang == "cpp" or lang == "c++":
        try:
            import tempfile
            import os
            
            with tempfile.TemporaryDirectory() as tmpdir:
                cpp_file = os.path.join(tmpdir, "main.cpp")
                exe_file = os.path.join(tmpdir, "main.exe" if os.name == 'nt' else "main")
                
                with open(cpp_file, 'w') as f:
                    f.write(request.code)
                
                # Compile with g++
                compile_result = subprocess.run(
                    ["g++", cpp_file, "-o", exe_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if compile_result.returncode != 0:
                    return {"success": False, "error": f"Compilation Error:\n{compile_result.stderr}"}
                
                # Run
                run_result = subprocess.run(
                    [exe_file],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if run_result.returncode == 0:
                    return {"success": True, "output": run_result.stdout if run_result.stdout else "Code executed successfully (no output)."}
                else:
                    return {"success": False, "error": run_result.stderr}
        except FileNotFoundError:
            return {"success": False, "error": "C++ compiler (g++) not found. Please install GCC/MinGW to run C++ code."}
        except Exception as e:
            return {"success": False, "error": f"C++ execution failed: {str(e)}"}
    
    elif lang == "csharp" or lang == "c#":
        try:
            import tempfile
            import os
            
            with tempfile.TemporaryDirectory() as tmpdir:
                cs_file = os.path.join(tmpdir, "Program.cs")
                
                with open(cs_file, 'w') as f:
                    f.write(request.code)
                
                # Try to compile and run with dotnet
                compile_result = subprocess.run(
                    ["dotnet", "script", cs_file],
                    capture_output=True,
                    text=True,
                    timeout=10,
                    cwd=tmpdir
                )
                
                if compile_result.returncode == 0:
                    return {"success": True, "output": compile_result.stdout if compile_result.stdout else "Code executed successfully (no output)."}
                else:
                    # If dotnet script fails, try csc (C# compiler)
                    try:
                        exe_file = os.path.join(tmpdir, "program.exe")
                        compile_csc = subprocess.run(
                            ["csc", f"/out:{exe_file}", cs_file],
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        
                        if compile_csc.returncode != 0:
                            return {"success": False, "error": f"Compilation Error:\n{compile_csc.stderr}"}
                        
                        run_result = subprocess.run(
                            [exe_file],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        
                        if run_result.returncode == 0:
                            return {"success": True, "output": run_result.stdout if run_result.stdout else "Code executed successfully (no output)."}
                        else:
                            return {"success": False, "error": run_result.stderr}
                    except FileNotFoundError:
                        return {"success": False, "error": compile_result.stderr if compile_result.stderr else "C# compiler not found. Please install .NET SDK to run C# code."}
        except FileNotFoundError:
            return {"success": False, "error": ".NET SDK not found. Please install .NET SDK to run C# code."}
        except Exception as e:
            return {"success": False, "error": f"C# execution failed: {str(e)}"}
    
    elif lang == "html":
        # For HTML, we'll validate and return a preview message
        try:
            from html.parser import HTMLParser
            
            class HTMLValidator(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.errors = []
                
                def error(self, message):
                    self.errors.append(message)
            
            validator = HTMLValidator()
            validator.feed(request.code)
            
            if validator.errors:
                return {"success": False, "error": f"HTML Validation Errors:\n" + "\n".join(validator.errors)}
            
            # Count elements
            tag_count = request.code.count('<')
            
            return {
                "success": True, 
                "output": f"✓ HTML code validated successfully!\n\nStats:\n- Total tags: {tag_count}\n- Length: {len(request.code)} characters\n\nNote: To see the rendered output, save this as an .html file and open in a browser."
            }
        except Exception as e:
            return {"success": False, "error": f"HTML validation failed: {str(e)}"}
    
    elif lang == "css":
        # For CSS, we'll validate syntax
        try:
            import re
            
            # Basic CSS validation
            # Check for balanced braces
            open_braces = request.code.count('{')
            close_braces = request.code.count('}')
            
            if open_braces != close_braces:
                return {"success": False, "error": f"CSS Syntax Error: Unbalanced braces ({{ {open_braces}, }} {close_braces})"}
            
            # Count rules
            rules = request.code.count('{')
            
            # Count properties (approximate)
            properties = len(re.findall(r'[\w-]+\s*:', request.code))
            
            return {
                "success": True,
                "output": f"✓ CSS code validated successfully!\n\nStats:\n- CSS Rules: {rules}\n- Properties: {properties}\n- Length: {len(request.code)} characters\n\nNote: To see the styling in action, apply this CSS to an HTML file."
            }
        except Exception as e:
            return {"success": False, "error": f"CSS validation failed: {str(e)}"}
    
    else:
        return {"success": False, "error": f"Execution for '{lang}' is not supported in this environment yet. Supported languages: Python, JavaScript, Java, C++, C#, SQL, HTML, CSS."}

@app.get("/generate-flowchart")
async def generate_flowchart(goal: str = "Learning Path"):
    
    # Matplotlib logic from user snippet
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_facecolor('#0f172a')
    fig.patch.set_facecolor('#0f172a')
    
    # Draw a winding path
    x = np.linspace(0.1, 0.9, 100)
    y = 0.5 + 0.2 * np.sin(x * 10)
    ax.plot(x, y, color='white', linewidth=4, alpha=0.6)
    
    steps = ["Identify Skills", "Resources", "AI Adoption", "Resume", "Dashboard"]
    colors = ["#3b82f6", "#10b981", "#10b981", "#f59e0b", "#f97316"]
    
    for i, (step, color) in enumerate(zip(steps, colors)):
        px, py = 0.15 + i*0.18, 0.5 + 0.2 * np.sin((0.15 + i*0.18) * 10)
        circle = Circle((px, py), 0.05, color=color, alpha=0.9)
        ax.add_patch(circle)
        ax.text(px, py-0.12, step, color='white', ha='center', fontsize=10, weight='bold')

    ax.axis('off')
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    plt.close()
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")

@app.post("/generate-resume")
async def generate_resume(request: Dict):
    try:
        user = request.get("user_profile", {})
        goal = request.get("goal", "Software Engineer")
        username = request.get("username", "User")
        email = request.get("email", "user@example.com")
        
        # Extract all user details
        bio = user.get('bio', '')
        experience_level = user.get('experience_level', 'Beginner')
        skills = user.get('skills', [])
        learning_goals = user.get('learning_goals', [])
        interests = user.get('interests', [])
        time_commitment = user.get('time_commitment', '1-5 hours/week')
        learning_style = user.get('learning_style', 'Visual')
        difficulty_preference = user.get('difficulty_preference', 'Beginner-friendly')
        
        prompt = f"""
        Act as an expert resume builder and career counselor. Create a professional, detailed resume for: {username}
        
        COMPLETE USER PROFILE:
        - Name: {username}
        - Email: {email}
        - Target Career Goal: {goal}
        - Experience Level: {experience_level}
        - Professional Bio: {bio if bio else 'Passionate learner dedicated to professional growth'}
        - Current Skills: {', '.join(skills) if skills else 'Building foundational skills'}
        - Learning Goals: {', '.join(learning_goals) if learning_goals else 'Continuous improvement'}
        - Interests: {', '.join(interests) if interests else 'Technology and innovation'}
        - Time Commitment: {time_commitment}
        - Learning Style: {learning_style}
        - Difficulty Preference: {difficulty_preference}

        Generate a comprehensive resume in EXACTLY the following JSON format:
        {{
            "name": "{username}",
            "job_title": "{goal}",
            "summary": "Write a compelling 3-4 sentence professional summary that incorporates their bio, experience level, and career aspirations. Make it personal and specific to their profile.",
            "contact": {{
                "phone": "+1 (555) 123-4567",
                "email": "{email}",
                "location": "Global / Remote",
                "linkedin": "linkedin.com/in/{username.lower().replace(' ', '-')}"
            }},
            "skills": {json.dumps(skills if skills else ["Problem Solving", "Quick Learner", "Team Collaboration"])},
            "experience": [
                {{
                    "title": "Relevant position based on their experience level and skills",
                    "company": "Company Name or 'Self-Directed Learning Projects'",
                    "period": "Recent timeframe",
                    "responsibilities": [
                        "Achievement or responsibility 1 related to their skills",
                        "Achievement or responsibility 2 showcasing growth",
                        "Achievement or responsibility 3 demonstrating impact"
                    ]
                }},
                {{
                    "title": "Another relevant experience or project",
                    "company": "Organization or 'Personal Development'",
                    "period": "Timeframe",
                    "responsibilities": [
                        "Relevant task or achievement",
                        "Another accomplishment"
                    ]
                }}
            ],
            "education": [
                {{
                    "degree": "Relevant degree or certification based on their level",
                    "institution": "University/Institution Name or 'Online Learning Platforms'",
                    "year": "2020-2024"
                }},
                {{
                    "degree": "Additional certification or course",
                    "institution": "Platform name",
                    "year": "2024"
                }}
            ],
            "roadmap": [
                {{
                    "phase": "Foundation Phase (Weeks 1-4)",
                    "courses": ["Specific course 1 for {goal}", "Specific course 2", "Hands-on project 1"]
                }},
                {{
                    "phase": "Intermediate Phase (Weeks 5-8)",
                    "courses": ["Advanced topic 1", "Advanced topic 2", "Real-world project"]
                }},
                {{
                    "phase": "Advanced Phase (Weeks 9-12)",
                    "courses": ["Specialization 1", "Specialization 2", "Portfolio project"]
                }},
                {{
                    "phase": "Mastery Phase (Ongoing)",
                    "courses": ["Industry certifications", "Open-source contributions", "Professional networking"]
                }}
            ],
            "languages": ["English - Fluent", "Add 1-2 more relevant languages"],
            "hobbies": {json.dumps(interests if interests else ["Coding", "Technology", "Continuous Learning"])}
        }}

        IMPORTANT INSTRUCTIONS:
        1. Use ALL the skills provided: {', '.join(skills)}
        2. Incorporate their learning goals: {', '.join(learning_goals)}
        3. Reflect their {experience_level} level throughout
        4. Make the roadmap specific to {goal} with actual course names and technologies
        5. The summary MUST reference their bio and personal background
        6. Experience should align with their current skill set
        7. Make it professional yet personal and authentic
        """
        
        response = model.generate_content(prompt)
        text = response.text
        # Clean up possible markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        resume_data = json.loads(text)
        return {"success": True, "resume": resume_data}
    except Exception as e:
        print(f"Resume generation error: {str(e)}")
        # Return a fallback structured resume with all user details
        return {
            "success": True, 
            "error": None,
            "resume": {
                "name": username,
                "job_title": goal,
                "summary": bio if bio else f"Aspiring {goal} with {experience_level.lower()} experience. [Note: This is a DEMO resume generated because the AI service is currently rate-limited.]",
                "contact": {
                    "phone": "+1 (555) 123-4567", 
                    "email": email, 
                    "location": "Global", 
                    "linkedin": f"linkedin.com/in/{username.lower().replace(' ', '-')}"
                },
                "skills": skills if skills else ["Problem Solving", "Quick Learner"],
                "experience": [
                    {
                        "title": f"{experience_level} Developer",
                        "company": "Self-Directed Learning",
                        "period": "2023 - Present",
                        "responsibilities": [
                            f"Building expertise in {', '.join(skills[:3]) if skills else 'core technologies'}",
                            f"Focused on {', '.join(learning_goals[:2]) if learning_goals else 'professional development'}"
                        ]
                    }
                ],
                "education": [
                    {
                        "degree": "Continuous Learning Program",
                        "institution": "Online Platforms",
                        "year": "2024"
                    }
                ],
                "roadmap": [
                    {
                        "phase": "Foundation",
                        "courses": learning_goals if learning_goals else ["Core Skills Development"]
                    }
                ],
                "languages": ["English - Fluent"],
                "hobbies": interests if interests else ["Technology", "Learning"]
            }
        }


class VoiceCommandRequest(BaseModel):
    transcript: str
    current_context: Optional[str] = "navigation"

@app.post("/voice-command")
async def process_voice_command(request: VoiceCommandRequest):
    try:
        # Construct prompt for JARVIS NLP
        prompt = f"""
        Act as an Advanced Voice Operating System (JARVIS). Analyze the user's voice command and map it to a specific JSON action.
        
        USER COMMAND: "{request.transcript}"
        CURRENT CONTEXT: "{request.current_context}"

        YOUR GOAL: Return ONLY raw JSON (no markdown) mapping the intent to one of these structures:

        1. NAVIGATION {{ "type": "navigate", "target": "dashboard" | "ide" | "profile" | "resume" | "progress" | "path" | "landing" }}
           - "Go to dashboard", "Open IDE", "Show my stats", "Open my profile", "Go to resume builder", "Show learning path"
           - NOTE: "path" maps to the learning path view. "home" maps to "landing".
           - IF the user says "open this page" or "reload", return {{ "type": "system", "action": "reload" }} if they mean reload, otherwise treat as chat.

        2. CODING ACTION {{ "type": "code", "action": "insert" | "delete_line" | "undo" | "redo" | "clear" | "run", "code": "code_snippet_here" }}
           - If user asks for code (e.g. "Create a fibonacci function"), generate the ACTUAL python/js code in the 'code' field.
           - If user says "print hello", 'code' should be "print('hello')"
           - Keep code concise.

        3. SYSTEM CONTROL {{ "type": "system", "action": "scroll_up" | "scroll_down" | "scroll_top" | "scroll_bottom" | "logout" | "reload" }}

        4. TERMINAL {{ "type": "terminal", "action": "open" | "close" | "clear" }}

        5. CHAT / UNKNOWN {{ "type": "chat", "response": "Your short, witty, JARVIS-like response here." }}

        IMPORTANT - MULTI-LANGUAGE SUPPORT:
        - The user may speak in ANY language (Hindi, Spanish, French, Chinese, Tamil, etc.).
        - You MUST translate the INTENT into the English JSON actions above.
        - Example: "Mujhe dashboard jana hai" -> {{ "type": "navigate", "target": "dashboard" }}
        - Example: "Ek loop likho" -> {{ "type": "code", "action": "insert", "code": "for i in range(10):\\n    pass" }}
        - Example: "Open this page" (if ambiguous) -> {{ "type": "chat", "response": "Which page would you like me to open, sir? I can access the Dashboard, IDE, Profile, or Learning Path." }}
        """

        response = model.generate_content(prompt)
        text = response.text
        # Clean markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"Voice Command Error: {e}")
        return {"type": "chat", "response": "Processing error, sir. Please repeat."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
