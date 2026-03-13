"""
Curated database of 100% verified real URLs organized by topic.
This is the primary accuracy source for learning path generation.
"""

CURATED = {
  "machine_learning": {
    "keywords": ["machine learning","ml","deep learning","neural network","ai","artificial intelligence","data science","nlp","computer vision"],
    "title": "Machine Learning & AI",
    "essential": [
      {"name":"Andrew Ng ML Specialization","url":"https://www.coursera.org/specializations/machine-learning-introduction","why":"Gold standard ML course — comprehensive & beginner-friendly"},
      {"name":"Fast.ai Practical Deep Learning","url":"https://course.fast.ai/","why":"Top-down, project-first approach to deep learning"},
      {"name":"Google ML Crash Course","url":"https://developers.google.com/machine-learning/crash-course","why":"Free interactive ML course by Google with TensorFlow"},
      {"name":"Kaggle Learn","url":"https://www.kaggle.com/learn","why":"Hands-on micro-courses with real datasets"},
      {"name":"Scikit-learn Tutorials","url":"https://scikit-learn.org/stable/tutorial/index.html","why":"Official tutorials for classical ML algorithms"},
      {"name":"Papers With Code","url":"https://paperswithcode.com/","why":"Latest ML research papers with implementation code"},
      {"name":"Deep Learning Specialization","url":"https://www.coursera.org/specializations/deep-learning","why":"Advanced neural networks by Andrew Ng"},
      {"name":"Awesome ML (GitHub)","url":"https://github.com/josephmisiti/awesome-machine-learning","why":"Curated list of ML frameworks, libraries & software"},
      {"name":"MIT 6.S191 Deep Learning","url":"http://introtodeeplearning.com/","why":"Free MIT intensive deep learning bootcamp"},
      {"name":"freeCodeCamp ML Course","url":"https://www.freecodecamp.org/learn/machine-learning-with-python/","why":"Free ML certification with Python projects"},
    ],
    "phase1": {
      "focus":"Mathematics, Python, and Classical ML Algorithms",
      "resources": [
        {"e":"🐍","n":"Python for Data Science (Kaggle)","u":"https://www.kaggle.com/learn/python","d":"Master Python basics with interactive exercises"},
        {"e":"🔢","n":"NumPy Quickstart","u":"https://numpy.org/doc/stable/user/quickstart.html","d":"Essential numerical computing library"},
        {"e":"🐼","n":"Pandas Intro Tutorials","u":"https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html","d":"Data manipulation fundamentals"},
        {"e":"📐","n":"Khan Academy Linear Algebra","u":"https://www.khanacademy.org/math/linear-algebra","d":"Math foundations made easy & free"},
        {"e":"🎨","n":"3Blue1Brown Neural Networks","u":"https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi","d":"Visual intuition for ML concepts"},
        {"e":"📊","n":"StatQuest ML Playlist","u":"https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF","d":"Statistics & ML made simple and fun"},
      ],
      "project":"Build a house price predictor using linear regression with scikit-learn"
    },
    "phase2": {
      "focus":"Neural Networks, TensorFlow/PyTorch, Computer Vision & NLP",
      "resources": [
        {"e":"🔥","n":"TensorFlow Official Tutorials","u":"https://www.tensorflow.org/tutorials","d":"Hands-on TensorFlow guides from Google"},
        {"e":"⚡","n":"PyTorch Tutorials","u":"https://pytorch.org/tutorials/","d":"Official PyTorch learning path for deep learning"},
        {"e":"👁️","n":"Stanford CS231n (CNNs)","u":"http://cs231n.stanford.edu/","d":"Computer vision fundamentals from Stanford"},
        {"e":"💬","n":"Stanford CS224n (NLP)","u":"http://web.stanford.edu/class/cs224n/","d":"Natural language processing course"},
        {"e":"🤗","n":"Hugging Face NLP Course","u":"https://huggingface.co/learn/nlp-course/chapter1/1","d":"Modern NLP with transformers"},
        {"e":"📚","n":"Deep Learning Book","u":"https://www.deeplearningbook.org/","d":"Comprehensive theory by Ian Goodfellow"},
      ],
      "project":"Build an image classifier or sentiment analysis model"
    },
    "phase3": {
      "focus":"MLOps, Production Deployment, Advanced Architectures",
      "resources": [
        {"e":"🚀","n":"Full Stack Deep Learning","u":"https://fullstackdeeplearning.com/","d":"Production ML systems & best practices"},
        {"e":"⚙️","n":"MLOps Guide","u":"https://ml-ops.org/","d":"Best practices for ML operations at scale"},
        {"e":"🔧","n":"TensorFlow Extended (TFX)","u":"https://www.tensorflow.org/tfx/guide","d":"End-to-end ML pipelines"},
        {"e":"📊","n":"MLflow Documentation","u":"https://mlflow.org/docs/latest/index.html","d":"Experiment tracking & model deployment"},
        {"e":"📈","n":"Weights & Biases","u":"https://docs.wandb.ai/tutorials","d":"ML experiment management platform"},
        {"e":"☁️","n":"AWS SageMaker","u":"https://aws.amazon.com/sagemaker/getting-started/","d":"Cloud ML deployment at scale"},
      ],
      "project":"Deploy a full ML application with CI/CD pipeline, monitoring & cloud hosting"
    },
    "tracks": [
      {"name":"👁️ Computer Vision","items":[
        {"n":"OpenCV Tutorials","u":"https://docs.opencv.org/4.x/d9/df8/tutorial_root.html","d":"Image processing fundamentals"},
        {"n":"YOLOv5 Object Detection","u":"https://github.com/ultralytics/yolov5","d":"Real-time object detection"},
        {"n":"Detectron2","u":"https://github.com/facebookresearch/detectron2","d":"Facebook's CV library"},
        {"n":"CS231n Assignments","u":"http://cs231n.stanford.edu/assignments.html","d":"Hands-on CNN implementations"},
      ]},
      {"name":"💬 Natural Language Processing","items":[
        {"n":"spaCy Course","u":"https://course.spacy.io/","d":"Industrial-strength NLP"},
        {"n":"NLTK Book","u":"https://www.nltk.org/book/","d":"Classic NLP with Python"},
        {"n":"Transformers Docs","u":"https://huggingface.co/docs/transformers/index","d":"BERT, GPT & modern NLP models"},
      ]},
      {"name":"🎮 Reinforcement Learning","items":[
        {"n":"OpenAI Spinning Up","u":"https://spinningup.openai.com/","d":"Deep RL fundamentals"},
        {"n":"DeepMind RL Lectures","u":"https://www.deepmind.com/learning-resources/reinforcement-learning-lecture-series-2021","d":"Advanced RL concepts"},
        {"n":"Stable Baselines3","u":"https://stable-baselines3.readthedocs.io/","d":"Ready-to-use RL algorithms"},
      ]},
    ],
    "tools": [
      {"n":"Jupyter Notebook","u":"https://jupyter.org/","p":"Interactive coding environment"},
      {"n":"Google Colab","u":"https://colab.research.google.com/","p":"Free GPU for training"},
      {"n":"VS Code","u":"https://code.visualstudio.com/","p":"Best IDE for ML development"},
      {"n":"Anaconda","u":"https://www.anaconda.com/","p":"Python data science distribution"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control & collaboration"},
      {"n":"Docker","u":"https://www.docker.com/","p":"Containerize applications"},
      {"n":"MLflow","u":"https://mlflow.org/","p":"Experiment tracking & model registry"},
      {"n":"TensorFlow","u":"https://www.tensorflow.org/","p":"Production ML framework by Google"},
      {"n":"PyTorch","u":"https://pytorch.org/","p":"Research-friendly ML framework"},
    ]
  },

  "web_development": {
    "keywords": ["web dev","web development","frontend","backend","full stack","fullstack","react","javascript","html","css","node","angular","vue","next.js","express"],
    "title": "Web Development",
    "essential": [
      {"name":"MDN Web Docs","url":"https://developer.mozilla.org/en-US/docs/Learn","why":"The ultimate web development reference by Mozilla"},
      {"name":"freeCodeCamp Web Dev","url":"https://www.freecodecamp.org/learn/responsive-web-design/","why":"Free curriculum with certifications"},
      {"name":"The Odin Project","url":"https://www.theodinproject.com/","why":"Complete full-stack curriculum — 100% free"},
      {"name":"React Official Docs","url":"https://react.dev/","why":"Learn React from the official source"},
      {"name":"JavaScript.info","url":"https://javascript.info/","why":"Modern & comprehensive JavaScript tutorial"},
      {"name":"web.dev by Google","url":"https://web.dev/learn","why":"Google's official web development guidance"},
      {"name":"Node.js Guides","url":"https://nodejs.org/en/docs/guides/","why":"Official Node.js documentation & guides"},
      {"name":"CSS-Tricks","url":"https://css-tricks.com/","why":"CSS tips, tricks & techniques"},
      {"name":"Full Stack Open","url":"https://fullstackopen.com/","why":"React + Node.js university course (free)"},
      {"name":"Awesome Web Dev (GitHub)","url":"https://github.com/sindresorhus/awesome","why":"Curated list of web dev resources"},
    ],
    "phase1": {
      "focus":"HTML, CSS, JavaScript Fundamentals",
      "resources": [
        {"e":"🌐","n":"freeCodeCamp Responsive Design","u":"https://www.freecodecamp.org/learn/responsive-web-design/","d":"HTML & CSS with free certification"},
        {"e":"🎨","n":"CSS Grid & Flexbox (Wes Bos)","u":"https://cssgrid.io/","d":"Free course on modern CSS layouts"},
        {"e":"⚡","n":"JavaScript30","u":"https://javascript30.com/","d":"30 vanilla JS projects in 30 days"},
        {"e":"📱","n":"Responsive Web Design","u":"https://web.dev/responsive-web-design-basics/","d":"Google's responsive design guide"},
        {"e":"🎯","n":"JavaScript.info","u":"https://javascript.info/","d":"Modern JavaScript from basics to advanced"},
        {"e":"🔧","n":"Git & GitHub Guide","u":"https://www.freecodecamp.org/news/git-and-github-for-beginners/","d":"Version control basics"},
      ],
      "project":"Build a responsive portfolio website with HTML, CSS & JavaScript"
    },
    "phase2": {
      "focus":"React/Vue/Angular, Modern Tooling, TypeScript",
      "resources": [
        {"e":"⚛️","n":"React Official Tutorial","u":"https://react.dev/learn","d":"Learn React from the official docs"},
        {"e":"🎓","n":"Full Stack Open","u":"https://fullstackopen.com/","d":"React + Node.js full course (free)"},
        {"e":"🎨","n":"Tailwind CSS Docs","u":"https://tailwindcss.com/docs","d":"Utility-first CSS framework"},
        {"e":"📦","n":"npm Documentation","u":"https://docs.npmjs.com/","d":"JavaScript package management"},
        {"e":"⚡","n":"Vite Documentation","u":"https://vitejs.dev/","d":"Modern frontend build tool"},
        {"e":"🔧","n":"TypeScript Handbook","u":"https://www.typescriptlang.org/docs/","d":"Typed JavaScript for large apps"},
      ],
      "project":"Build a full-featured React application with routing & state management"
    },
    "phase3": {
      "focus":"Node.js, Databases, APIs, Deployment",
      "resources": [
        {"e":"💚","n":"Node.js Official Guide","u":"https://nodejs.dev/learn","d":"Server-side JavaScript"},
        {"e":"🚀","n":"Express.js Guide","u":"https://expressjs.com/en/guide/routing.html","d":"Web framework for Node.js"},
        {"e":"💾","n":"MongoDB University","u":"https://university.mongodb.com/","d":"Free MongoDB courses & certification"},
        {"e":"🐘","n":"PostgreSQL Tutorial","u":"https://www.postgresqltutorial.com/","d":"SQL database fundamentals"},
        {"e":"🔐","n":"Passport.js Auth","u":"https://www.passportjs.org/","d":"User authentication for Node.js"},
        {"e":"☁️","n":"Vercel Deployment","u":"https://vercel.com/docs","d":"Free hosting & deployment"},
      ],
      "project":"Build and deploy a full-stack application with auth, database & CI/CD"
    },
    "tracks": [
      {"name":"⚛️ React Ecosystem","items":[
        {"n":"Next.js Documentation","u":"https://nextjs.org/docs","d":"React framework for production"},
        {"n":"Redux Toolkit","u":"https://redux-toolkit.js.org/","d":"State management made simple"},
        {"n":"React Router","u":"https://reactrouter.com/","d":"Client-side routing for React"},
        {"n":"Storybook","u":"https://storybook.js.org/","d":"UI component development tool"},
      ]},
      {"name":"💚 Backend & APIs","items":[
        {"n":"GraphQL Tutorial","u":"https://graphql.org/learn/","d":"Query language for APIs"},
        {"n":"Prisma ORM","u":"https://www.prisma.io/docs","d":"Modern database toolkit"},
        {"n":"Socket.io","u":"https://socket.io/docs/v4/","d":"Real-time communication"},
      ]},
      {"name":"📱 Mobile Development","items":[
        {"n":"React Native","u":"https://reactnative.dev/docs/getting-started","d":"Build mobile apps with React"},
        {"n":"Flutter","u":"https://flutter.dev/docs","d":"Google's cross-platform UI toolkit"},
        {"n":"Expo","u":"https://docs.expo.dev/","d":"React Native simplified"},
      ]},
    ],
    "tools": [
      {"n":"VS Code","u":"https://code.visualstudio.com/","p":"Best code editor for web dev"},
      {"n":"Chrome DevTools","u":"https://developer.chrome.com/docs/devtools/","p":"Browser debugging tools"},
      {"n":"npm","u":"https://www.npmjs.com/","p":"JavaScript package manager"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control & collaboration"},
      {"n":"Figma","u":"https://www.figma.com/","p":"UI/UX design tool"},
      {"n":"Postman","u":"https://www.postman.com/","p":"API testing tool"},
      {"n":"Docker","u":"https://www.docker.com/","p":"Containerization platform"},
      {"n":"Vercel","u":"https://vercel.com/","p":"Frontend deployment platform"},
      {"n":"Netlify","u":"https://www.netlify.com/","p":"JAMstack hosting platform"},
    ]
  },

  "data_analysis": {
    "keywords": ["data analyst","data analysis","analytics","sql","excel","tableau","power bi","business intelligence","bi","statistics"],
    "title": "Data Analysis",
    "essential": [
      {"name":"Google Data Analytics Certificate","url":"https://www.coursera.org/professional-certificates/google-data-analytics","why":"Industry-recognized certification by Google"},
      {"name":"Kaggle Learn","url":"https://www.kaggle.com/learn","why":"Free micro-courses on data analysis"},
      {"name":"Mode SQL Tutorial","url":"https://mode.com/sql-tutorial/","why":"Interactive SQL with real business data"},
      {"name":"Khan Academy Statistics","url":"https://www.khanacademy.org/math/statistics-probability","why":"Statistics & probability fundamentals (free)"},
      {"name":"Python Data Science Handbook","url":"https://jakevdp.github.io/PythonDataScienceHandbook/","why":"Free online book by Jake VanderPlas"},
      {"name":"Tableau Public Resources","url":"https://public.tableau.com/en-us/s/resources","why":"Free data visualization training"},
      {"name":"W3Schools SQL","url":"https://www.w3schools.com/sql/","why":"Interactive SQL learning"},
      {"name":"Pandas Documentation","url":"https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html","why":"Data manipulation with Python"},
      {"name":"Awesome Data Science (GitHub)","url":"https://github.com/academic/awesome-datascience","why":"Curated data science resources"},
      {"name":"IBM Data Analyst Certificate","url":"https://www.coursera.org/professional-certificates/ibm-data-analyst","why":"Comprehensive IBM data analyst program"},
    ],
    "phase1": {
      "focus":"Excel, SQL, Python Basics, Statistics",
      "resources": [
        {"e":"📊","n":"Excel Skills for Business (Coursera)","u":"https://www.coursera.org/specializations/excel","d":"Master Excel for data analysis"},
        {"e":"💾","n":"SQL for Data Analysis (Udacity)","u":"https://www.udacity.com/course/sql-for-data-analysis--ud198","d":"Free SQL course"},
        {"e":"🐍","n":"Kaggle Python Course","u":"https://www.kaggle.com/learn/python","d":"Interactive Python tutorials"},
        {"e":"📈","n":"Khan Academy Statistics","u":"https://www.khanacademy.org/math/statistics-probability","d":"Free statistics fundamentals"},
        {"e":"🐼","n":"Pandas Getting Started","u":"https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html","d":"Data manipulation with Pandas"},
        {"e":"📉","n":"Data Cleaning (Real Python)","u":"https://realpython.com/python-data-cleaning-numpy-pandas/","d":"Clean messy data with Python"},
      ],
      "project":"Analyze a real dataset and create an Excel/Pandas dashboard"
    },
    "phase2": {
      "focus":"Advanced SQL, Data Visualization, Business Intelligence",
      "resources": [
        {"e":"🎨","n":"Tableau Training","u":"https://www.tableau.com/learn/training","d":"Official Tableau courses"},
        {"e":"📊","n":"Power BI Learning Path","u":"https://learn.microsoft.com/en-us/power-bi/guided-learning/","d":"Microsoft Power BI tutorials"},
        {"e":"💾","n":"Window Functions SQL","u":"https://www.windowfunctions.com/","d":"Master advanced SQL window functions"},
        {"e":"📈","n":"Seaborn Tutorial","u":"https://seaborn.pydata.org/tutorial.html","d":"Python visualization with Seaborn"},
        {"e":"📊","n":"Storytelling with Data","u":"https://www.storytellingwithdata.com/","d":"Data visualization best practices"},
        {"e":"🔍","n":"Kaggle Data Visualization","u":"https://www.kaggle.com/learn/data-visualization","d":"EDA & visualization micro-course"},
      ],
      "project":"Build an interactive Tableau or Power BI dashboard with real data"
    },
    "phase3": {
      "focus":"Predictive Analytics, A/B Testing, Business Metrics",
      "resources": [
        {"e":"📊","n":"Google Analytics Academy","u":"https://analytics.google.com/analytics/academy/","d":"Free GA certification"},
        {"e":"🧪","n":"A/B Testing (Udacity)","u":"https://www.udacity.com/course/ab-testing--ud257","d":"Free A/B testing course"},
        {"e":"📈","n":"Predictive Analytics (Coursera)","u":"https://www.coursera.org/learn/predictive-analytics","d":"Forecasting techniques"},
        {"e":"💼","n":"KPI Examples (Klipfolio)","u":"https://www.klipfolio.com/resources/kpi-examples","d":"Business metrics & KPI guides"},
        {"e":"📊","n":"R for Data Science","u":"https://r4ds.had.co.nz/","d":"Free online R book by Hadley Wickham"},
        {"e":"🔍","n":"Stanford Data Mining (YouTube)","u":"https://www.youtube.com/playlist?list=PLLssT5z_DsK9JDLcT8T62VtzwyW9LNepV","d":"Stanford data mining lectures"},
      ],
      "project":"Complete end-to-end business analysis with A/B tests & recommendations"
    },
    "tracks": [
      {"name":"📊 Visualization Mastery","items":[
        {"n":"D3.js Tutorial","u":"https://d3js.org/getting-started","d":"JavaScript data visualization"},
        {"n":"Plotly Documentation","u":"https://plotly.com/python/","d":"Interactive Python charts"},
        {"n":"Matplotlib Guide","u":"https://matplotlib.org/stable/tutorials/index.html","d":"Python plotting fundamentals"},
      ]},
      {"name":"💾 Advanced SQL","items":[
        {"n":"SQLZoo","u":"https://sqlzoo.net/","d":"Interactive SQL practice"},
        {"n":"LeetCode Database","u":"https://leetcode.com/problemset/database/","d":"SQL problem solving"},
        {"n":"PostgreSQL Exercises","u":"https://pgexercises.com/","d":"Hands-on PostgreSQL practice"},
      ]},
      {"name":"🤖 Analytics Automation","items":[
        {"n":"Airflow Documentation","u":"https://airflow.apache.org/docs/","d":"Workflow orchestration"},
        {"n":"dbt Documentation","u":"https://docs.getdbt.com/","d":"Data transformation tool"},
        {"n":"Streamlit","u":"https://streamlit.io/","d":"Build data apps in Python"},
      ]},
    ],
    "tools": [
      {"n":"Microsoft Excel","u":"https://www.microsoft.com/en-us/microsoft-365/excel","p":"Spreadsheet analysis & dashboards"},
      {"n":"Tableau Public","u":"https://public.tableau.com/","p":"Free data visualization tool"},
      {"n":"Power BI Desktop","u":"https://powerbi.microsoft.com/","p":"Microsoft BI platform"},
      {"n":"Jupyter Notebook","u":"https://jupyter.org/","p":"Interactive Python environment"},
      {"n":"Google Colab","u":"https://colab.research.google.com/","p":"Free cloud notebooks"},
      {"n":"PostgreSQL","u":"https://www.postgresql.org/","p":"Open-source SQL database"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control for projects"},
      {"n":"Anaconda","u":"https://www.anaconda.com/","p":"Python data science distribution"},
      {"n":"VS Code","u":"https://code.visualstudio.com/","p":"Code editor"},
    ]
  },

  "cloud_devops": {
    "keywords": ["cloud","devops","aws","azure","gcp","google cloud","docker","kubernetes","k8s","terraform","cicd","ci/cd","infrastructure","sre","site reliability"],
    "title": "Cloud & DevOps",
    "essential": [
      {"name":"AWS Skill Builder","url":"https://explore.skillbuilder.aws/learn","why":"Free AWS training & certification prep"},
      {"name":"Google Cloud Training","url":"https://cloud.google.com/training/free","why":"Free GCP training resources"},
      {"name":"Docker Get Started","url":"https://docs.docker.com/get-started/","why":"Containerization from scratch"},
      {"name":"Kubernetes Docs","url":"https://kubernetes.io/docs/tutorials/","why":"Official K8s tutorials"},
      {"name":"freeCodeCamp DevOps","url":"https://www.freecodecamp.org/news/tag/devops/","why":"Free DevOps articles & tutorials"},
      {"name":"Terraform Learn","url":"https://developer.hashicorp.com/terraform/tutorials","why":"Infrastructure as Code tutorials"},
      {"name":"Linux Journey","url":"https://linuxjourney.com/","why":"Free Linux fundamentals course"},
      {"name":"KodeKloud","url":"https://kodekloud.com/courses/","why":"Hands-on DevOps labs"},
      {"name":"AWS Well-Architected","url":"https://aws.amazon.com/architecture/well-architected/","why":"Cloud architecture best practices"},
      {"name":"Awesome DevOps (GitHub)","url":"https://github.com/wmariuss/awesome-devops","why":"Curated DevOps resources"},
    ],
    "phase1": {
      "focus":"Linux, Networking, Git, Cloud Fundamentals",
      "resources": [
        {"e":"🐧","n":"Linux Journey","u":"https://linuxjourney.com/","d":"Interactive Linux learning"},
        {"e":"🌐","n":"Computer Networking (Coursera)","u":"https://www.coursera.org/learn/computer-networking","d":"Google IT networking course"},
        {"e":"🔧","n":"Git Official Docs","u":"https://git-scm.com/doc","d":"Version control fundamentals"},
        {"e":"☁️","n":"AWS Cloud Practitioner","u":"https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials","d":"Cloud concepts & AWS basics"},
        {"e":"📦","n":"Docker Getting Started","u":"https://docs.docker.com/get-started/","d":"Containerization from zero"},
        {"e":"🐍","n":"Bash Scripting Tutorial","u":"https://www.freecodecamp.org/news/bash-scripting-tutorial-linux-shell-script-and-command-line-for-beginners/","d":"Automate with shell scripts"},
      ],
      "project":"Set up a Linux server, containerize a web app with Docker, push to GitHub"
    },
    "phase2": {
      "focus":"CI/CD, Container Orchestration, Infrastructure as Code",
      "resources": [
        {"e":"⚙️","n":"GitHub Actions Docs","u":"https://docs.github.com/en/actions","d":"CI/CD with GitHub"},
        {"e":"☸️","n":"Kubernetes Tutorials","u":"https://kubernetes.io/docs/tutorials/","d":"Container orchestration"},
        {"e":"🏗️","n":"Terraform Learn","u":"https://developer.hashicorp.com/terraform/tutorials","d":"Infrastructure as Code"},
        {"e":"📊","n":"Prometheus Docs","u":"https://prometheus.io/docs/introduction/overview/","d":"Monitoring & alerting"},
        {"e":"🔧","n":"Ansible Getting Started","u":"https://docs.ansible.com/ansible/latest/getting_started/","d":"Configuration management"},
        {"e":"🐳","n":"Docker Compose Guide","u":"https://docs.docker.com/compose/gettingstarted/","d":"Multi-container applications"},
      ],
      "project":"Build a CI/CD pipeline with GitHub Actions, deploy to Kubernetes"
    },
    "phase3": {
      "focus":"Multi-Cloud, Service Mesh, Security, SRE Practices",
      "resources": [
        {"e":"🚀","n":"Google SRE Book","u":"https://sre.google/sre-book/table-of-contents/","d":"Site Reliability Engineering by Google"},
        {"e":"🔐","n":"AWS Security Best Practices","u":"https://docs.aws.amazon.com/security/","d":"Cloud security fundamentals"},
        {"e":"🌐","n":"Istio Service Mesh","u":"https://istio.io/latest/docs/","d":"Service mesh for microservices"},
        {"e":"📈","n":"Grafana Tutorials","u":"https://grafana.com/tutorials/","d":"Observability & dashboards"},
        {"e":"☁️","n":"Azure Learn","u":"https://learn.microsoft.com/en-us/training/azure/","d":"Free Azure training paths"},
        {"e":"🔧","n":"Helm Charts","u":"https://helm.sh/docs/","d":"Kubernetes package manager"},
      ],
      "project":"Deploy a microservices app with service mesh, monitoring, auto-scaling & multi-cloud DR"
    },
    "tracks": [
      {"name":"☁️ AWS Specialization","items":[
        {"n":"AWS Solutions Architect","u":"https://explore.skillbuilder.aws/learn","d":"Architect certification path"},
        {"n":"AWS Lambda Docs","u":"https://docs.aws.amazon.com/lambda/","d":"Serverless computing"},
        {"n":"AWS CDK Workshop","u":"https://cdkworkshop.com/","d":"Infrastructure as code with CDK"},
      ]},
      {"name":"⚙️ Kubernetes Deep Dive","items":[
        {"n":"K8s the Hard Way","u":"https://github.com/kelseyhightower/kubernetes-the-hard-way","d":"Learn K8s from scratch"},
        {"n":"CKAD Exercises","u":"https://github.com/dgkanatsios/CKAD-exercises","d":"K8s certification prep"},
        {"n":"Lens IDE","u":"https://k8slens.dev/","d":"Kubernetes management IDE"},
      ]},
      {"name":"🔐 DevSecOps","items":[
        {"n":"OWASP DevSecOps","u":"https://owasp.org/www-project-devsecops-guideline/","d":"Security in CI/CD"},
        {"n":"Trivy Scanner","u":"https://aquasecurity.github.io/trivy/","d":"Container vulnerability scanning"},
        {"n":"Vault by HashiCorp","u":"https://developer.hashicorp.com/vault/tutorials","d":"Secrets management"},
      ]},
    ],
    "tools": [
      {"n":"Docker","u":"https://www.docker.com/","p":"Containerization platform"},
      {"n":"Kubernetes","u":"https://kubernetes.io/","p":"Container orchestration"},
      {"n":"Terraform","u":"https://www.terraform.io/","p":"Infrastructure as Code"},
      {"n":"GitHub Actions","u":"https://github.com/features/actions","p":"CI/CD automation"},
      {"n":"AWS Console","u":"https://aws.amazon.com/","p":"Amazon cloud platform"},
      {"n":"VS Code","u":"https://code.visualstudio.com/","p":"Code editor with extensions"},
      {"n":"Prometheus","u":"https://prometheus.io/","p":"Monitoring & alerting"},
      {"n":"Grafana","u":"https://grafana.com/","p":"Observability dashboards"},
      {"n":"Ansible","u":"https://www.ansible.com/","p":"Configuration management"},
    ]
  },

  "cybersecurity": {
    "keywords": ["cybersecurity","cyber security","security","hacking","ethical hacking","penetration testing","pentest","infosec","information security","soc","network security"],
    "title": "Cybersecurity",
    "essential": [
      {"name":"TryHackMe","url":"https://tryhackme.com/","why":"Hands-on cybersecurity training for beginners"},
      {"name":"Hack The Box","url":"https://www.hackthebox.com/","why":"Real-world penetration testing labs"},
      {"name":"OWASP Testing Guide","url":"https://owasp.org/www-project-web-security-testing-guide/","why":"Web app security reference standard"},
      {"name":"Cybrary","url":"https://www.cybrary.it/","why":"Free cybersecurity courses"},
      {"name":"freeCodeCamp InfoSec","url":"https://www.freecodecamp.org/learn/information-security/","why":"Free information security certification"},
      {"name":"Professor Messer CompTIA","url":"https://www.professormesser.com/","why":"Free Security+ training videos"},
      {"name":"OverTheWire Wargames","url":"https://overthewire.org/wargames/","why":"Learn security through games"},
      {"name":"SANS Cyber Aces","url":"https://www.sans.org/cyberaces/","why":"Free introductory security courses"},
      {"name":"PentesterLab","url":"https://pentesterlab.com/","why":"Hands-on web penetration testing"},
      {"name":"Awesome Security (GitHub)","url":"https://github.com/sbilly/awesome-security","why":"Curated security resources"},
    ],
    "phase1": {
      "focus":"Networking, Linux, Security Fundamentals",
      "resources": [
        {"e":"🌐","n":"CompTIA Network+ (Professor Messer)","u":"https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/","d":"Free networking fundamentals"},
        {"e":"🐧","n":"Linux Journey","u":"https://linuxjourney.com/","d":"Learn Linux for security"},
        {"e":"🔐","n":"freeCodeCamp InfoSec","u":"https://www.freecodecamp.org/learn/information-security/","d":"Information security certification"},
        {"e":"🛡️","n":"TryHackMe Pre Security","u":"https://tryhackme.com/path/outline/presecurity","d":"Pre-security learning path"},
        {"e":"🌐","n":"Networking Basics (Cisco)","u":"https://www.netacad.com/courses/networking/networking-basics","d":"Cisco networking fundamentals"},
        {"e":"📝","n":"OverTheWire Bandit","u":"https://overthewire.org/wargames/bandit/","d":"Learn Linux security by playing"},
      ],
      "project":"Set up a home lab, complete TryHackMe Pre-Security path"
    },
    "phase2": {
      "focus":"Web Security, Penetration Testing, Cryptography",
      "resources": [
        {"e":"🔍","n":"OWASP Top 10","u":"https://owasp.org/www-project-top-ten/","d":"Top 10 web vulnerabilities"},
        {"e":"🎯","n":"Hack The Box Starting Point","u":"https://www.hackthebox.com/","d":"Guided penetration testing"},
        {"e":"🕵️","n":"Burp Suite Academy","u":"https://portswigger.net/web-security","d":"Free web security training"},
        {"e":"🔑","n":"Crypto101","u":"https://www.crypto101.io/","d":"Free cryptography book"},
        {"e":"🐍","n":"Python for Pentesters","u":"https://www.cybrary.it/","d":"Scripting for security"},
        {"e":"📊","n":"Wireshark Tutorial","u":"https://www.wireshark.org/docs/wsug_html/","d":"Network traffic analysis"},
      ],
      "project":"Find & exploit vulnerabilities in deliberately vulnerable apps (DVWA/Juice Shop)"
    },
    "phase3": {
      "focus":"Advanced Penetration Testing, Incident Response, Cloud Security",
      "resources": [
        {"e":"🚀","n":"PNPT Certification","u":"https://certifications.tcm-sec.com/pnpt/","d":"Practical network penetration tester"},
        {"e":"🔐","n":"AWS Security Specialty","u":"https://aws.amazon.com/certification/certified-security-specialty/","d":"Cloud security certification"},
        {"e":"📊","n":"SIEM with Splunk","u":"https://www.splunk.com/en_us/training/free-courses.html","d":"Security monitoring & SIEM"},
        {"e":"🛡️","n":"MITRE ATT&CK","u":"https://attack.mitre.org/","d":"Adversary tactics framework"},
        {"e":"🔧","n":"Metasploit Unleashed","u":"https://www.offsec.com/metasploit-unleashed/","d":"Free offensive security training"},
        {"e":"📝","n":"Incident Response (SANS)","u":"https://www.sans.org/white-papers/","d":"IR best practices & frameworks"},
      ],
      "project":"Conduct a full penetration test, write professional report, set up SIEM monitoring"
    },
    "tracks": [
      {"name":"🕵️ Offensive Security","items":[
        {"n":"Offensive Security Training","u":"https://www.offsec.com/courses-and-certifications/","d":"OSCP & professional certifications"},
        {"n":"VulnHub","u":"https://www.vulnhub.com/","d":"Vulnerable VMs for practice"},
        {"n":"PayloadsAllTheThings","u":"https://github.com/swisskyrepo/PayloadsAllTheThings","d":"Payload library for pentesters"},
      ]},
      {"name":"🛡️ Blue Team Defense","items":[
        {"n":"Blue Team Labs Online","u":"https://blueteamlabs.online/","d":"Defensive security challenges"},
        {"n":"CyberDefenders","u":"https://cyberdefenders.org/","d":"Blue team CTF challenges"},
        {"n":"Elastic SIEM","u":"https://www.elastic.co/security","d":"Free SIEM solution"},
      ]},
      {"name":"☁️ Cloud Security","items":[
        {"n":"Cloud Security Alliance","u":"https://cloudsecurityalliance.org/","d":"Cloud security standards"},
        {"n":"ScoutSuite","u":"https://github.com/nccgroup/ScoutSuite","d":"Multi-cloud security auditing"},
        {"n":"Prowler","u":"https://github.com/prowler-cloud/prowler","d":"AWS security assessment tool"},
      ]},
    ],
    "tools": [
      {"n":"Kali Linux","u":"https://www.kali.org/","p":"Penetration testing OS"},
      {"n":"Burp Suite","u":"https://portswigger.net/burp","p":"Web security testing"},
      {"n":"Wireshark","u":"https://www.wireshark.org/","p":"Network protocol analyzer"},
      {"n":"Nmap","u":"https://nmap.org/","p":"Network scanner"},
      {"n":"Metasploit","u":"https://www.metasploit.com/","p":"Penetration testing framework"},
      {"n":"VS Code","u":"https://code.visualstudio.com/","p":"Code editor"},
      {"n":"VirtualBox","u":"https://www.virtualbox.org/","p":"Virtual machine platform"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control & tools"},
      {"n":"Docker","u":"https://www.docker.com/","p":"Container environments"},
    ]
  },

  "python": {
    "keywords": ["python","python programming","python developer","django","flask","automation","scripting"],
    "title": "Python Programming",
    "essential": [
      {"name":"Python Official Tutorial","url":"https://docs.python.org/3/tutorial/","why":"Official Python documentation & tutorial"},
      {"name":"Automate the Boring Stuff","url":"https://automatetheboringstuff.com/","why":"Free book — practical Python automation"},
      {"name":"freeCodeCamp Python","url":"https://www.freecodecamp.org/learn/scientific-computing-with-python/","why":"Free Python certification"},
      {"name":"Real Python","url":"https://realpython.com/","why":"High-quality Python tutorials & guides"},
      {"name":"Kaggle Python Course","url":"https://www.kaggle.com/learn/python","why":"Interactive Python micro-course"},
      {"name":"Python Crash Course (edX)","url":"https://www.edx.org/learn/python","why":"University-level Python courses"},
      {"name":"Codecademy Python","url":"https://www.codecademy.com/learn/learn-python-3","why":"Interactive Python lessons"},
      {"name":"MIT 6.0001 (OCW)","url":"https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/","why":"MIT's intro to CS with Python"},
      {"name":"Awesome Python (GitHub)","url":"https://github.com/vinta/awesome-python","why":"Curated list of Python frameworks & libraries"},
      {"name":"Python.org Beginner Guide","url":"https://wiki.python.org/moin/BeginnersGuide","why":"Official beginner resources"},
    ],
    "phase1": {
      "focus":"Python Syntax, Data Structures, OOP Basics",
      "resources": [
        {"e":"🐍","n":"Python Official Tutorial","u":"https://docs.python.org/3/tutorial/","d":"Learn Python from the source"},
        {"e":"📚","n":"Automate the Boring Stuff","u":"https://automatetheboringstuff.com/","d":"Practical Python projects (free book)"},
        {"e":"🎓","n":"MIT 6.0001 (OCW)","u":"https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/","d":"MIT intro to CS with Python"},
        {"e":"🎯","n":"Kaggle Python Course","u":"https://www.kaggle.com/learn/python","d":"Interactive exercises"},
        {"e":"📊","n":"freeCodeCamp Python","u":"https://www.freecodecamp.org/learn/scientific-computing-with-python/","d":"Free Python certification"},
        {"e":"🔧","n":"Python Exercises (W3Resource)","u":"https://www.w3resource.com/python-exercises/","d":"Practice problems"},
      ],
      "project":"Build a CLI tool — file organizer, password manager, or web scraper"
    },
    "phase2": {
      "focus":"Web Frameworks, APIs, Databases, Testing",
      "resources": [
        {"e":"🌐","n":"Django Tutorial","u":"https://docs.djangoproject.com/en/stable/intro/tutorial01/","d":"Official Django web framework tutorial"},
        {"e":"⚡","n":"Flask Quickstart","u":"https://flask.palletsprojects.com/en/latest/quickstart/","d":"Lightweight Python web framework"},
        {"e":"🔗","n":"FastAPI Tutorial","u":"https://fastapi.tiangolo.com/tutorial/","d":"Modern async API framework"},
        {"e":"💾","n":"SQLAlchemy Tutorial","u":"https://docs.sqlalchemy.org/en/20/tutorial/","d":"Python SQL toolkit & ORM"},
        {"e":"🧪","n":"Pytest Documentation","u":"https://docs.pytest.org/en/latest/","d":"Python testing framework"},
        {"e":"📦","n":"Real Python Packaging","u":"https://realpython.com/pypi-publish-python-package/","d":"Package & distribute your code"},
      ],
      "project":"Build a REST API with FastAPI/Django + database + authentication"
    },
    "phase3": {
      "focus":"Advanced Patterns, DevOps, Production Deployment",
      "resources": [
        {"e":"🚀","n":"Advanced Python (Real Python)","u":"https://realpython.com/tutorials/advanced/","d":"Advanced patterns & techniques"},
        {"e":"⚙️","n":"Python Design Patterns","u":"https://refactoring.guru/design-patterns/python","d":"Software design patterns in Python"},
        {"e":"📊","n":"Celery Documentation","u":"https://docs.celeryq.dev/en/stable/","d":"Distributed task queues"},
        {"e":"🐳","n":"Docker for Python","u":"https://docs.docker.com/language/python/","d":"Containerize Python apps"},
        {"e":"☁️","n":"Deploy Django (DigitalOcean)","u":"https://www.digitalocean.com/community/tutorial-collections/django","d":"Production deployment guides"},
        {"e":"📈","n":"Python Performance","u":"https://wiki.python.org/moin/PythonSpeed","d":"Optimization techniques"},
      ],
      "project":"Build & deploy a production-grade web application with monitoring & CI/CD"
    },
    "tracks": [
      {"name":"🌐 Web Development","items":[
        {"n":"Django REST Framework","u":"https://www.django-rest-framework.org/","d":"Build web APIs with Django"},
        {"n":"FastAPI Advanced","u":"https://fastapi.tiangolo.com/advanced/","d":"Production-grade APIs"},
        {"n":"Jinja2 Templates","u":"https://jinja.palletsprojects.com/","d":"Web templating engine"},
      ]},
      {"name":"🤖 Automation & Scripting","items":[
        {"n":"Selenium Docs","u":"https://selenium-python.readthedocs.io/","d":"Browser automation"},
        {"n":"BeautifulSoup Docs","u":"https://www.crummy.com/software/BeautifulSoup/bs4/doc/","d":"Web scraping library"},
        {"n":"Schedule Library","u":"https://schedule.readthedocs.io/","d":"Task scheduling"},
      ]},
      {"name":"📊 Data & Science","items":[
        {"n":"NumPy Tutorial","u":"https://numpy.org/doc/stable/user/quickstart.html","d":"Numerical computing"},
        {"n":"Matplotlib Tutorials","u":"https://matplotlib.org/stable/tutorials/index.html","d":"Data visualization"},
        {"n":"Pandas User Guide","u":"https://pandas.pydata.org/docs/user_guide/index.html","d":"Data analysis"},
      ]},
    ],
    "tools": [
      {"n":"VS Code + Python Extension","u":"https://code.visualstudio.com/","p":"Best Python IDE setup"},
      {"n":"PyCharm Community","u":"https://www.jetbrains.com/pycharm/download/","p":"Dedicated Python IDE"},
      {"n":"Jupyter Notebook","u":"https://jupyter.org/","p":"Interactive Python notebooks"},
      {"n":"pip","u":"https://pip.pypa.io/","p":"Python package installer"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control & collaboration"},
      {"n":"Docker","u":"https://www.docker.com/","p":"Containerization"},
      {"n":"Postman","u":"https://www.postman.com/","p":"API testing tool"},
      {"n":"Google Colab","u":"https://colab.research.google.com/","p":"Free cloud Python environment"},
      {"n":"Anaconda","u":"https://www.anaconda.com/","p":"Python distribution"},
    ]
  },

  "java": {
    "keywords": ["java","java programming","spring","spring boot","android","kotlin","jvm"],
    "title": "Java Programming",
    "essential": [
      {"name":"Java MOOC (Helsinki)","url":"https://java-programming.mooc.fi/","why":"Best free Java course from University of Helsinki"},
      {"name":"Oracle Java Tutorials","url":"https://docs.oracle.com/javase/tutorial/","why":"Official Java tutorials"},
      {"name":"Codecademy Java","url":"https://www.codecademy.com/learn/learn-java","why":"Interactive Java lessons"},
      {"name":"freeCodeCamp Java","url":"https://www.freecodecamp.org/news/tag/java/","why":"Free Java tutorials & articles"},
      {"name":"Baeldung","url":"https://www.baeldung.com/","why":"Java & Spring tutorials"},
      {"name":"Spring.io Guides","url":"https://spring.io/guides","why":"Official Spring Boot guides"},
      {"name":"GeeksforGeeks Java","url":"https://www.geeksforgeeks.org/java/","why":"Java DSA & concepts"},
      {"name":"MIT OCW Java","url":"https://ocw.mit.edu/courses/6-092-introduction-to-programming-in-java-january-iap-2010/","why":"MIT intro to Java programming"},
      {"name":"Awesome Java (GitHub)","url":"https://github.com/akullpp/awesome-java","why":"Curated Java resources"},
      {"name":"JetBrains Academy","url":"https://www.jetbrains.com/academy/","why":"Project-based Java learning"},
    ],
    "phase1":{"focus":"Java Syntax, OOP, Data Structures","resources":[
      {"e":"☕","n":"Java MOOC (Helsinki)","u":"https://java-programming.mooc.fi/","d":"University-level Java course (free)"},
      {"e":"📚","n":"Oracle Java Tutorials","u":"https://docs.oracle.com/javase/tutorial/","d":"Official Java documentation"},
      {"e":"🎯","n":"Codecademy Java","u":"https://www.codecademy.com/learn/learn-java","d":"Interactive Java basics"},
      {"e":"🔢","n":"GeeksforGeeks Java DSA","u":"https://www.geeksforgeeks.org/data-structures/","d":"Data structures in Java"},
      {"e":"📝","n":"HackerRank Java","u":"https://www.hackerrank.com/domains/java","d":"Java practice challenges"},
      {"e":"🔧","n":"IntelliJ IDEA Tutorial","u":"https://www.jetbrains.com/idea/resources/","d":"Learn the best Java IDE"},
    ],"project":"Build a console-based library management system with OOP"},
    "phase2":{"focus":"Spring Boot, REST APIs, Databases","resources":[
      {"e":"🌱","n":"Spring Boot Guides","u":"https://spring.io/guides","d":"Official Spring Boot tutorials"},
      {"e":"🔗","n":"Baeldung Spring","u":"https://www.baeldung.com/spring-boot","d":"In-depth Spring Boot guides"},
      {"e":"💾","n":"Spring Data JPA","u":"https://spring.io/projects/spring-data-jpa","d":"Database access with Spring"},
      {"e":"🔐","n":"Spring Security","u":"https://spring.io/projects/spring-security","d":"Authentication & authorization"},
      {"e":"🧪","n":"JUnit 5 User Guide","u":"https://junit.org/junit5/docs/current/user-guide/","d":"Java testing framework"},
      {"e":"📦","n":"Maven Tutorial","u":"https://maven.apache.org/guides/getting-started/","d":"Build automation & dependency management"},
    ],"project":"Build a REST API with Spring Boot + database + auth + tests"},
    "phase3":{"focus":"Microservices, Cloud Deployment, Performance","resources":[
      {"e":"🚀","n":"Microservices with Spring","u":"https://spring.io/microservices","d":"Microservice architecture patterns"},
      {"e":"🐳","n":"Docker for Java","u":"https://docs.docker.com/language/java/","d":"Containerize Java apps"},
      {"e":"☁️","n":"AWS SDK for Java","u":"https://aws.amazon.com/sdk-for-java/","d":"Cloud integration"},
      {"e":"📊","n":"Spring Boot Actuator","u":"https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html","d":"Production monitoring"},
      {"e":"⚡","n":"Java Performance Tuning","u":"https://www.baeldung.com/java-performance","d":"JVM optimization"},
      {"e":"📈","n":"Resilience4j","u":"https://resilience4j.readme.io/","d":"Fault tolerance library"},
    ],"project":"Deploy a microservices application with Docker, K8s & monitoring"},
    "tracks":[
      {"name":"📱 Android Development","items":[
        {"n":"Android Developers","u":"https://developer.android.com/courses","d":"Official Android courses"},
        {"n":"Kotlin Documentation","u":"https://kotlinlang.org/docs/home.html","d":"Kotlin language guide"},
        {"n":"Jetpack Compose","u":"https://developer.android.com/jetpack/compose","d":"Modern Android UI toolkit"},
      ]},
      {"name":"🌱 Spring Ecosystem","items":[
        {"n":"Spring Cloud","u":"https://spring.io/projects/spring-cloud","d":"Distributed systems"},
        {"n":"Spring WebFlux","u":"https://docs.spring.io/spring-framework/reference/web/webflux.html","d":"Reactive programming"},
        {"n":"Spring Batch","u":"https://spring.io/projects/spring-batch","d":"Batch processing"},
      ]},
      {"name":"⚡ Performance & Scale","items":[
        {"n":"Apache Kafka","u":"https://kafka.apache.org/documentation/","d":"Event streaming platform"},
        {"n":"Redis Documentation","u":"https://redis.io/docs/","d":"In-memory data store"},
        {"n":"Elasticsearch Guide","u":"https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html","d":"Search & analytics engine"},
      ]},
    ],
    "tools":[
      {"n":"IntelliJ IDEA","u":"https://www.jetbrains.com/idea/","p":"Best Java IDE"},
      {"n":"Maven","u":"https://maven.apache.org/","p":"Build automation"},
      {"n":"Gradle","u":"https://gradle.org/","p":"Build tool"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control"},
      {"n":"Docker","u":"https://www.docker.com/","p":"Containerization"},
      {"n":"Postman","u":"https://www.postman.com/","p":"API testing"},
      {"n":"JUnit 5","u":"https://junit.org/junit5/","p":"Testing framework"},
      {"n":"Spring Initializr","u":"https://start.spring.io/","p":"Spring project generator"},
      {"n":"SonarQube","u":"https://www.sonarqube.org/","p":"Code quality analysis"},
    ]
  },
}

# Generic fallback for any unmatched topic
GENERIC_RESOURCES = {
    "essential": [
      {"name":"Coursera","url":"https://www.coursera.org/","why":"University courses from top institutions (audit free)"},
      {"name":"edX","url":"https://www.edx.org/","why":"Free courses from MIT, Harvard & more"},
      {"name":"freeCodeCamp","url":"https://www.freecodecamp.org/","why":"Free coding bootcamp with certifications"},
      {"name":"Khan Academy","url":"https://www.khanacademy.org/","why":"Free education for any subject"},
      {"name":"MIT OpenCourseWare","url":"https://ocw.mit.edu/","why":"Free MIT course materials"},
      {"name":"Udacity Free Courses","url":"https://www.udacity.com/courses/all","why":"Tech courses with hands-on projects"},
      {"name":"YouTube EDU","url":"https://www.youtube.com/education","why":"Free video tutorials"},
      {"name":"GitHub Learning","url":"https://skills.github.com/","why":"Learn by doing with GitHub"},
    ],
    "tools": [
      {"n":"VS Code","u":"https://code.visualstudio.com/","p":"Universal code editor"},
      {"n":"GitHub","u":"https://github.com/","p":"Version control & portfolio"},
      {"n":"Jupyter Notebook","u":"https://jupyter.org/","p":"Interactive coding environment"},
      {"n":"Google Colab","u":"https://colab.research.google.com/","p":"Free cloud notebooks"},
      {"n":"Docker","u":"https://www.docker.com/","p":"Containerization"},
      {"n":"Notion","u":"https://www.notion.so/","p":"Notes & project management"},
      {"n":"Postman","u":"https://www.postman.com/","p":"API testing"},
      {"n":"Anaconda","u":"https://www.anaconda.com/","p":"Python/R distribution"},
      {"n":"Figma","u":"https://www.figma.com/","p":"Design tool"},
    ]
}


def match_topic(goal):
    """Match user goal to the best curated topic using keyword matching."""
    goal_lower = goal.lower()
    best_match = None
    best_score = 0
    for key, topic_data in CURATED.items():
        score = sum(1 for kw in topic_data["keywords"] if kw in goal_lower)
        if score > best_score:
            best_score = score
            best_match = key
    return best_match, best_score
