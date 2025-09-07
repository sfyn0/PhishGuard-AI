

PhishGuard AI — Enterprise Email Threat Console



PhishGuard AI is an AI-powered phishing email detection system. It analyzes email subjects and body text to identify phishing attempts in real-time. Built with Python, Flask, and machine learning, this project provides a professional, interactive dashboard for scanning emails and visualizing threats.


---

Features

🔍 AI-Powered Detection: Detects phishing emails using a trained machine learning model.

🖥 Interactive Dashboard: Submit emails and view real-time threat reports.

📊 Threat Analysis: Shows confidence score, risk meter, key indicators, and extracted URLs/domains.

💾 Local History: Optionally store scan results locally for reference.

⚡ Extensible & Lightweight: Automatically generates model and vectorizer files if they don’t exist.



---

Installation

1. Clone the repository



git clone https://github.com/your-username/PhishGuard-AI.git
cd PhishGuard-AI

2. Create a virtual environment (optional but recommended)



python -m venv venv
source venv/bin/activate      # Linux / macOS
venv\Scripts\activate         # Windows

3. Install dependencies



pip install -r requirements.txt


---

Usage

1. Run the Flask application



python app.py

2. Open your browser at



http://127.0.0.1:5000

3. Submit an email

Enter the subject and body of an email.

Click Run Scan to analyze.



4. View results

Phishing or Safe verdict

Confidence score (%)

Key indicators

Extracted domains/URLs

Local scan history (optional)




> Note: On first run, app.py will automatically generate the required phishing_detector.pkl and vectorizer.pkl files if they are not present.




---
Results:
<img width="1882" height="917" alt="image" src="https://github.com/user-attachments/assets/5d454cdc-f4f3-43b7-86d0-963f3c28eb53" />

Project Structure

PhishGuard-AI/
│
├── app.py # Flask backend and model integration
├── monitor.py             # (Optional) File monitoring for future extensions
├── static/
│   ├── style.css          # Dashboard styles
│   └── script.js          # Frontend JavaScript
├── templates/
│   └── index.html         # Dashboard HTML template
├── requirements.txt       # Python dependencies
└── README.md


---

Dependencies

Python 3.8+

Flask

scikit-learn

pandas

numpy


Install all dependencies via:

pip install -r requirements.txt


---

How it Works

1. User submits an email via the web dashboard.


2. The backend vectorizes the email text and passes it through the trained machine learning model.


3. The model predicts whether the email is phishing or safe.


4. Results, confidence score, and key indicators are displayed on the dashboard.




---

Future Enhancements

Add multi-language phishing detection.

Expand model with additional phishing datasets.

Real-time monitoring of incoming emails.

User authentication and organization-wide deployment.



---

License

This project is MIT Licensed.


---

Author

Mohammed Sufiyan
GitHub | LinkedIn


---
