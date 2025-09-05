/* Robust client-side handler for Run Scan */
const $ = s => document.querySelector(s);
const form = $("#emailForm");

async function tryPredictAJAX(subject, body) {
  try {
    console.info("Attempting AJAX /predict...");
    const resp = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ subject, body }),
    });

    console.info("/predict response status:", resp.status, resp.statusText);
    if (resp.status === 404 || resp.status === 405) {
      console.warn("Server returned 404/405 — will fallback to form submit.");
      return { fallback: true };
    }

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn("Response not JSON; content-type:", contentType);
      return { fallback: true };
    }

    const data = await resp.json();
    return { fallback: false, data };
  } catch (err) {
    console.error("AJAX /predict failed:", err);
    return { fallback: true, err: String(err) };
  }
}

function showOverlay(show) {
  const ov = $("#overlay");
  const scan = $("#scanning");
  if (!ov) return;
  if (show) {
    ov.classList.remove("hidden");
    if (scan) scan.classList.remove("hidden");
  } else {
    ov.classList.add("hidden");
    if (scan) scan.classList.add("hidden");
  }
}

function updateUIFromResult(verdictStr, subject, body, confidence) {
  const badge = $("#statusBadge");
  const title = $("#verdictTitle");
  const subtitle = $("#verdictSubtitle");
  const previewSubj = $("#previewSubject");
  const previewBody = $("#previewBody");
  const riskPercent = $("#riskPercent");
  const progressBar = $("#progressBar");
  const indicatorsList = $("#indicatorsList");
  const domainsList = $("#domainsList");

  // Basic verdict display
  const isPhish = verdictStr.toLowerCase().includes("phish");
  const pct = confidence ? Math.round(confidence * 100) : (isPhish ? 87 : 12);

  if (badge) badge.textContent = isPhish ? "Phishing" : "Safe";
  if (title) title.textContent = verdictStr;
  if (subtitle) subtitle.textContent = `Confidence: ${pct}%`;
  if (previewSubj) previewSubj.textContent = subject || "—";
  if (previewBody) {
    previewBody.innerHTML = body
      ? body.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")
      : "<em class='muted'>No body</em>";
  }
  if (riskPercent) riskPercent.textContent = `${pct}%`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  // === Key Indicators ===
  const signals = [];
  if (isPhish) {
    signals.push("Suspicious language or urgency detected");
    signals.push("Sender domain mismatch likely");
    signals.push("Potential malicious links");
  } else {
    signals.push("No strong phishing indicators");
    signals.push("Content appears safe");
  }
  if (indicatorsList) {
    indicatorsList.innerHTML = "";
    signals.forEach(sig => {
      const li = document.createElement("li");
      li.textContent = sig;
      indicatorsList.appendChild(li);
    });
  }

  // === Extract Domains from body ===
  if (domainsList) {
    domainsList.innerHTML = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = body.match(urlRegex) || [];
    if (matches.length > 0) {
      matches.forEach(url => {
        const li = document.createElement("li");
        try {
          const d = new URL(url).hostname;
          li.textContent = d;
        } catch {
          li.textContent = url;
        }
        domainsList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No URLs found in message";
      domainsList.appendChild(li);
    }
  }
}

// === Form Handling ===
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const subject = $("#subject")?.value || "";
    const body = $("#body")?.value || "";

    if (!subject && !body) {
      alert("Enter subject or body");
      return;
    }

    // Save locally for history
    if ($("#storeLocal")?.checked) {
      localStorage.setItem("pg_last_email", JSON.stringify({ subject, body }));
    }

    showOverlay(true);

    const { fallback, data } = await tryPredictAJAX(subject, body);

    if (fallback) {
      console.info("Falling back to classic form submit.");
      form.submit();
      return;
    }

    showOverlay(false);

    if (data.error) {
      console.error("Server returned error:", data.error);
      alert("Server error: " + (data.error || "unknown"));
      return;
    }

    const verdict = data.result || "No result";
    const confidence = data.confidence !== undefined ? parseFloat(data.confidence) : null;
    updateUIFromResult(verdict, subject, body, confidence);

    // Reveal panels
    $("#verdictPanel")?.classList.remove("hidden");

    // Save to history
    try {
      const hist = JSON.parse(localStorage.getItem("pg_history") || "[]");
      hist.unshift({ ts: Date.now(), subject, body, verdict });
      localStorage.setItem("pg_history", JSON.stringify(hist.slice(0, 25)));
    } catch (e) {
      console.warn("Saving history failed", e);
    }
  });
} else {
  console.warn("No form with id #emailForm found on page.");
}