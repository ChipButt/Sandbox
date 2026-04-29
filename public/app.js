const form = document.getElementById("characterForm");
const generateBtn = document.getElementById("generateBtn");
const exportBtn = document.getElementById("exportBtn");
const downloadLink = document.getElementById("downloadLink");
const previewBox = document.getElementById("previewBox");
const directions = document.getElementById("directions");
const logBox = document.getElementById("log");
const statusDot = document.getElementById("statusDot");
const modeText = document.getElementById("modeText");
const modeHelp = document.getElementById("modeHelp");

let currentSessionId = null;

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

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    if (data.mode === "openai") {
      statusDot.classList.add("ok");
      modeText.textContent = "Real AI generation enabled";
      modeHelp.textContent = "OPENAI_API_KEY detected.";
    } else {
      statusDot.classList.remove("ok");
      modeText.textContent = "Mock mode";
      modeHelp.textContent = "Add OPENAI_API_KEY to .env for real character generation.";
    }
  } catch (error) {
    modeText.textContent = "Server not reachable";
    modeHelp.textContent = "Start the app with npm start.";
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
  preview.src = cacheBust(images.previewSheet);
  preview.alt = "NESW 48px preview sheet";
  previewBox.appendChild(preview);

  directions.innerHTML = "";
  for (const dir of ["north", "east", "south", "west"]) {
    const card = document.createElement("div");
    card.className = "direction-card";

    const img = document.createElement("img");
    img.src = cacheBust(images[dir]);
    img.alt = `${dir} view`;

    const label = document.createElement("strong");
    label.textContent = dir.toUpperCase();

    card.appendChild(img);
    card.appendChild(label);
    directions.appendChild(card);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  normaliseCheckboxes(formData, form);

  setBusy(true);
  downloadLink.hidden = true;
  log("Generating the four NESW views. If you are in real AI mode, this can take a little while.");

  try {
    const response = await fetch("/api/generate", {
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
        ? "Generated in mock mode. The full pack export works, but add an OpenAI API key for real likeness generation."
        : "Generated. Review the four views. Add tweak notes and regenerate if needed."
    );
  } catch (error) {
    console.error(error);
    log(`Error: ${error.message}`);
  } finally {
    setBusy(false);
  }
});

exportBtn.addEventListener("click", async () => {
  if (!currentSessionId) return;

  exportBtn.disabled = true;
  log("Building the character pack ZIP…");

  try {
    const response = await fetch("/api/export", {
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

    downloadLink.href = data.downloadUrl;
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