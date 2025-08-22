const video = document.getElementById("video");
const identifyButton = document.getElementById("identifyButton");
const resultArea = document.getElementById("resultArea");
const loadingOverlay = document.getElementById("loading-overlay");
const initialOverlay = document.getElementById("initial-overlay");
const startErrorDiv = document.getElementById("start-error");
const canvas = document.getElementById("canvas");

let stream;

async function startCamera() {
  try {
    if (stream) return;
    const constraints = {
      video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    initialOverlay.classList.add("hidden");
  } catch (err) {
    startErrorDiv.textContent = "Erro ao acessar a câmera.";
  }
}

async function identifyProduct() {
  if (!stream || video.readyState !== 4) {
    alert("Câmera não está pronta");
    return;
  }

  loadingOverlay.classList.remove("hidden");
  identifyButton.disabled = true;

  try {
    const context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;
    context.drawImage(video, 0, 0, 640, 480);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.7)
    );

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64ImageData = reader.result.split(",")[1];
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Descreva este produto em português de forma clara e concisa." },
              { inlineData: { mimeType: "image/jpeg", data: base64ImageData } },
            ],
          },
        ],
      };

      const response = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível identificar.";

      resultArea.textContent = text;
      identifyButton.classList.add("hidden");
      resultArea.classList.remove("hidden");
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Erro:", error);
    resultArea.textContent = "Erro ao identificar o produto.";
  } finally {
    loadingOverlay.classList.add("hidden");
    identifyButton.disabled = false;
  }
}

initialOverlay.addEventListener("click", startCamera);
identifyButton.addEventListener("click", identifyProduct);
