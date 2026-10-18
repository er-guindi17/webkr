const overlay = document.getElementById("key-overlay");
const mainContent = document.getElementById("main-content");
const keyInput = document.getElementById("key-input");
const keySubmit = document.getElementById("key-submit");
const keyError = document.getElementById("key-error");
const output = document.getElementById("output");

function showError(msg) {
  keyError.textContent = msg;
  keyError.style.display = "block";
}

keySubmit.addEventListener("click", verifyKey);
keyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") verifyKey();
});

async function verifyKey() {
  const key = keyInput.value.trim();
  if (!key) return showError("Introduce una clave");

  keySubmit.disabled = true;
  keySubmit.textContent = "Verificando…";
  try {
    const res = await fetch("/api/verify-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const result = await res.json();
    if (result.valid) {
      sessionStorage.setItem("kr_key", key);
      overlay.style.display = "none";
      mainContent.style.display = "flex";
      keyError.style.display = "none";
    } else {
      showError(result.message || "Clave incorrecta");
    }
  } catch {
    showError("Error de conexión con el servidor");
  } finally {
    keySubmit.disabled = false;
    keySubmit.textContent = "Verificar";
  }
}

document.getElementById("start-btn").addEventListener("click", async () => {
  const pin = document.getElementById("pin").value.trim();
  const count = parseInt(document.getElementById("count").value, 10);
  const base = document.getElementById("base").value || "SuperIdol";

  if (!pin || isNaN(count) || count <= 0) {
    alert("Introduce un PIN válido y un número de bots mayor que 0");
    return;
  }

  output.style.display = "block";
  output.textContent = "Enviando…";
  try {
    const res = await fetch("/api/bot-gateway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: sessionStorage.getItem("kr_key") || "", pin, count, base }),
    });
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch {
    output.textContent = "Error de conexión con el servidor";
  }
});
