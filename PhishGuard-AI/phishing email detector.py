import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import pickle
import re

# Load dataset
df = pd.read_csv(r"C:\Users\DELL\Desktop\phishing email detector\SpamAssasin.csv") # Ensure this CSV has 'email_text' and 'label' columns

df['email_text'] = df['subject'].astype(str) + " " + df['urls'].astype(str)
# Clean email text
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'\n', ' ', text)
    text = re.sub(r'http\S+', 'url', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

df['email_text'] = df['email_text'].apply(clean_text)

# Feature extraction
vectorizer = TfidfVectorizer(ngram_range=(1,2), max_features=5000)
X = vectorizer.fit_transform(df['email_text'])
y = df['label']

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X, y)

# Save model and vectorizer
pickle.dump(model, open("phishing_detector.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("Training complete! Model and vectorizer saved.")