const form = document.getElementById("characterForm");
const generateBtn = document.getElementById("generateBtn");
const exportBtn = document.getElementById("exportBtn");
const testBackendBtn = document.getElementById("testBackendBtn");
const downloadLink = document.getElementById("downloadLink");
const previewBox = document.getElementById("previewBox");
const directions = document.getElementById("directions");
const logBox = document.getElementById("log");
const statusDot = document.getElementById("statusDot");
const modeText = document.getElementById("modeText");
const modeHelp = document.getElementById("modeHelp");
const backendUrlInput = document.getElementById("backendUrl");

let currentSessionId = null;
let currentBackendUrl = localStorage.getItem("characterBuilderBackendUrl") || "http://localhost:3333";
backendUrlInput.value = currentBackendUrl;

function getBackendUrl() {
  const raw = backendUrlInput.value.trim().replace(/\/$/, "");
  currentBackendUrl = raw || "http://localhost:3333";
  localStorage.setItem("characterBuilderBackendUrl", currentBackendUrl);
  return currentBackendUrl;
}

function log(message) {
  logBox.textContent = message;
}

function setBusy(isBusy) {
  generateBtn.disabled = isBusy;
  exportBtn.disabled = isBusy || !currentSessionId;
  generateBtn.textContent = isBusy ? "Generating…" : "Generate NESW character";
}

function cacheBust(url) {
  return `${url}?t=${Date.now()}`;
}

function absoluteApiImage(url) {
  if (url.startsWith("http")) return url;
  return `${getBackendUrl()}${url}`;
}

async function checkHealth() {
  const backend = getBackendUrl();

  try {
    const response = await fetch(`${backend}/api/health`);
    const data = await response.json();

    if (!data.ok) throw new Error("Backend did not return ok.");

    if (data.mode === "openai") {
      statusDot.classList.add("ok");
      modeText.textContent = "Backend connected: real AI mode";
      modeHelp.textContent = "OPENAI_API_KEY detected on the backend.";
      log("Backend connected. Real AI generation is available.");
    } else {
      statusDot.classList.add("ok");
      modeText.textContent = "Backend connected: mock mode";
      modeHelp.textContent = "Backend is running, but no OpenAI API key is set.";
      log("Backend connected in mock mode. Add OPENAI_API_KEY to the backend .env for real image generation.");
    }
  } catch (error) {
    statusDot.classList.remove("ok");
    modeText.textContent = "Backend not connected";
    modeHelp.textContent = "The page loaded, but generation needs the Node backend running.";
    log(`Backend not connected at ${backend}.\n\nFor local testing:\n1. Open Terminal\n2. cd into api-server\n3. npm install\n4. cp .env.example .env\n5. npm start`);
  }
}

function normaliseCheckboxes(formData, formEl) {
  for (const name of ["canTalk", "canTrade", "canGiveQuest", "hostile"]) {
    const input = formEl.querySelector(`input[name="${name}"]`);
    formData.set(name, input?.checked ? "true" : "false");
  }
}

function renderImages(images) {
  previewBox.innerHTML = "";
  const preview = document.createElement("img");
  preview.src = cacheBust(absoluteApiImage(images.previewSheet));
  preview.alt = "NESW 48px preview sheet";
  previewBox.appendChild(preview);

  directions.innerHTML = "";
  for (const dir of ["north", "east", "south", "west"]) {
    const card = document.createElement("div");
    card.className = "direction-card";

    const img = document.createElement("img");
    img.src = cacheBust(absoluteApiImage(images[dir]));
    img.alt = `${dir} view`;

    const label = document.createElement("strong");
    label.textContent = dir.toUpperCase();

    card.appendChild(img);
    card.appendChild(label);
    directions.appendChild(card);
  }
}

testBackendBtn.addEventListener("click", checkHealth);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const backend = getBackendUrl();
  const formData = new FormData(form);
  formData.delete("backendUrl");
  normaliseCheckboxes(formData, form);

  setBusy(true);
  downloadLink.hidden = true;
  log("Sending request to backend…");

  try {
    const response = await fetch(`${backend}/api/generate`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || "Generation failed.");
    }

    currentSessionId = data.sessionId;
    renderImages(data.images);
    exportBtn.disabled = false;

    log(
      data.mode === "mock"
        ? "Generated in mock mode. The full pack export works, but add an OpenAI API key to the backend for real likeness generation."
        : "Generated. Review the four views. Add tweak notes and regenerate if needed."
    );

    await checkHealth();
  } catch (error) {
    console.error(error);
    log(`Error: ${error.message}\n\nMost likely cause: the backend is not running or the backend URL is wrong.`);
  } finally {
    setBusy(false);
  }
});

exportBtn.addEventListener("click", async () => {
  if (!currentSessionId) return;

  const backend = getBackendUrl();

  exportBtn.disabled = true;
  log("Building the character pack ZIP…");

  try {
    const response = await fetch(`${backend}/api/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sessionId: currentSessionId })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || "Export failed.");
    }

    downloadLink.href = absoluteApiImage(data.downloadUrl);
    downloadLink.hidden = false;
    downloadLink.textContent = "Download ZIP";
    log("Export ready. Download the ZIP and drop the pack into your game project.");
  } catch (error) {
    console.error(error);
    log(`Error: ${error.message}`);
  } finally {
    exportBtn.disabled = false;
  }
});

checkHealth();