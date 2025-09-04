from flask import Flask, render_template, request, jsonify
import pickle, traceback, logging, sys

# Setup logging to stdout so you see it in your terminal
logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)

MODEL_PATH = "phishing_detector.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

# Try load model/vectorizer
model = None
vectorizer = None
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
    logger.info("Loaded model and vectorizer successfully.")
except Exception as e:
    logger.exception("Failed to load model/vectorizer. Make sure files exist and names match: %s , %s", MODEL_PATH, VECTORIZER_PATH)

def predict_text(text):
    """Return (result_string, confidence_float_or_None). Raises on errors."""
    if model is None or vectorizer is None:
        raise RuntimeError("Model or vectorizer not loaded.")
    X = vectorizer.transform([text])
    pred = model.predict(X)[0]
    prob = None
    try:
        if hasattr(model, "predict_proba"):
            p = model.predict_proba(X)[0]
            if len(p) >= 2:
                prob = float(p[1])
            else:
                prob = float(max(p))
    except Exception:
        # non-fatal: just ignore confidence
        logger.debug("predict_proba not available or failed.")
    label = "Phishing Email" if int(pred) == 1 else "Safe Email"
    return label, prob

@app.route("/", methods=["GET", "POST"])
def index():
    """
    Renders main page. Accepts classic form POST fallback:
    - If form POST -> compute and render page with result in template variable.
    - If GET -> render with empty result.
    """
    result = ""
    if request.method == "POST":
        # fallback from form submit
        try:
            subject = request.form.get("subject", "")
            body = request.form.get("body", "")
            logger.info("Received form POST to / with subject length %d body length %d", len(subject), len(body))
            result, prob = predict_text((subject or "") + " " + (body or ""))
            logger.info("Prediction (form POST): %s (prob=%s)", result, prob)
        except Exception as e:
            logger.exception("Error during prediction on / POST")
            result = f"Error: {str(e)}"
    return render_template("index.html", result=result)

@app.route("/predict", methods=["POST"])
def predict():
    """
    Preferred AJAX endpoint. Accepts JSON or form data.
    Returns JSON: {"result": "...", "confidence": 0.1234}
    """
    try:
        logger.info("Incoming /predict request, method=%s, is_json=%s", request.method, request.is_json)
        if request.is_json:
            data = request.get_json(force=True)
            logger.info("/predict JSON payload: %s", data)
            subject = data.get("subject", "")
            body = data.get("body", "")
        else:
            # Accept form-encoded fallback if someone POSTs form to /predict
            subject = request.form.get("subject", "")
            body = request.form.get("body", "")
            logger.info("/predict form payload: subject length %d body length %d", len(subject), len(body))

        text = (subject or "") + " " + (body or "")
        result, prob = predict_text(text)
        resp = {"result": result}
        if prob is not None:
            resp["confidence"] = round(float(prob), 4)
        logger.info("/predict => %s", resp)
        return jsonify(resp), 200
    except Exception as e:
        logger.exception("Error in /predict")
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

if __name__ == "__main__":
    # run with debug=True while developing; logs are printed to terminal
    app.run(host="127.0.0.1", port=5000, debug=True)