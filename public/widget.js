(function () {
    const script = document.currentScript;

    if (!script) {
        console.error("Lumora widget script not found.");
        return;
    }

    const businessId = script.getAttribute("data-business-id");

    if (!businessId) {
        console.error("Lumora widget: data-business-id is required.");
        return;
    }

    const apiUrl =
        script.getAttribute("data-api-url") || "http://localhost:4000";

    const sessionKey = `lumora_webchat_session_${businessId}`;

    function getOrCreateSessionId() {
        const existingSessionId = localStorage.getItem(sessionKey);

        if (existingSessionId) {
            return existingSessionId;
        }

        const newSessionId =
            crypto.randomUUID?.() ||
            `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        localStorage.setItem(sessionKey, newSessionId);

        return newSessionId;
    }

    const sessionId = getOrCreateSessionId();

    const styles = document.createElement("style");

    styles.innerHTML = `
    .lumora-widget-button {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 64px;
      height: 64px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #00aaff, #0077ff);
      color: white;
      font-size: 26px;
      cursor: pointer;
      box-shadow: 0 18px 45px rgba(0, 119, 255, 0.35);
      z-index: 999999;
    }

    .lumora-widget-window {
      position: fixed;
      right: 24px;
      bottom: 100px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 130px);
      border-radius: 22px;
      overflow: hidden;
      background: #05070a;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 25px 80px rgba(0,0,0,0.5);
      z-index: 999999;
      display: none;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .lumora-widget-window.lumora-open {
      display: flex;
      flex-direction: column;
    }

    .lumora-widget-header {
      padding: 18px;
      background: #070b12;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      color: white;
    }

    .lumora-widget-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }

    .lumora-widget-subtitle {
      margin: 4px 0 0;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
    }

    .lumora-widget-fields {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: #05070a;
    }

    .lumora-widget-input,
    .lumora-widget-text {
      width: 100%;
      box-sizing: border-box;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.12);
      background: #02040a;
      color: white;
      padding: 10px 12px;
      outline: none;
      font-size: 13px;
    }

    .lumora-widget-input:focus,
    .lumora-widget-text:focus {
      border-color: #00aaff;
    }

    .lumora-widget-messages {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      background: #030509;
    }

    .lumora-message-row {
      display: flex;
      margin-bottom: 10px;
    }

    .lumora-message-row.user {
      justify-content: flex-end;
    }

    .lumora-message-row.assistant {
      justify-content: flex-start;
    }

    .lumora-message-bubble {
      max-width: 82%;
      padding: 10px 12px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .lumora-message-row.user .lumora-message-bubble {
      background: #00aaff;
      color: white;
      border-bottom-right-radius: 5px;
    }

    .lumora-message-row.assistant .lumora-message-bubble {
      background: #111722;
      color: white;
      border-bottom-left-radius: 5px;
    }

    .lumora-widget-footer {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      background: #05070a;
    }

    .lumora-widget-send {
      border: none;
      border-radius: 12px;
      background: #00aaff;
      color: white;
      padding: 0 16px;
      cursor: pointer;
      font-weight: 600;
    }

    .lumora-widget-send:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .lumora-widget-window {
        right: 12px;
        left: 12px;
        bottom: 90px;
        width: auto;
        height: 70vh;
      }

      .lumora-widget-button {
        right: 18px;
        bottom: 18px;
      }
    }
  `;

    document.head.appendChild(styles);

    const button = document.createElement("button");
    button.className = "lumora-widget-button";
    button.innerHTML = "💬";
    button.setAttribute("aria-label", "Open Lumora chat");

    const windowEl = document.createElement("div");
    windowEl.className = "lumora-widget-window";

    windowEl.innerHTML = `
    <div class="lumora-widget-header">
      <p class="lumora-widget-title">Lumora AI</p>
      <p class="lumora-widget-subtitle">Ask us anything. We usually reply instantly.</p>
    </div>

    <div class="lumora-widget-fields">
      <input class="lumora-widget-input" data-lumora-name placeholder="Name">
      <input class="lumora-widget-input" data-lumora-phone placeholder="Phone">
      <input class="lumora-widget-input" data-lumora-email placeholder="Email">
    </div>

    <div class="lumora-widget-messages" data-lumora-messages></div>

    <div class="lumora-widget-footer">
      <input class="lumora-widget-text" data-lumora-message placeholder="Type your message...">
      <button class="lumora-widget-send" data-lumora-send>Send</button>
    </div>
  `;

    document.body.appendChild(button);
    document.body.appendChild(windowEl);

    const messagesEl = windowEl.querySelector("[data-lumora-messages]");
    const messageInput = windowEl.querySelector("[data-lumora-message]");
    const sendButton = windowEl.querySelector("[data-lumora-send]");
    const nameInput = windowEl.querySelector("[data-lumora-name]");
    const phoneInput = windowEl.querySelector("[data-lumora-phone]");
    const emailInput = windowEl.querySelector("[data-lumora-email]");

    function addMessage(role, content) {
        const row = document.createElement("div");
        row.className = `lumora-message-row ${role}`;

        const bubble = document.createElement("div");
        bubble.className = "lumora-message-bubble";
        bubble.textContent = content;

        row.appendChild(bubble);
        messagesEl.appendChild(row);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    addMessage("assistant", "Hi! I’m Lumora AI. How can I help you today?");

    button.addEventListener("click", function () {
        windowEl.classList.toggle("lumora-open");
    });

    async function sendMessage() {
        const message = messageInput.value.trim();

        if (!message) return;

        addMessage("user", message);
        messageInput.value = "";
        sendButton.disabled = true;
        sendButton.textContent = "...";

        try {
            const response = await fetch(`${apiUrl}/api/webchat/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    businessId,
                    sessionId,
                    message,
                    visitor: {
                        name: nameInput.value.trim() || undefined,
                        phone: phoneInput.value.trim() || undefined,
                        email: emailInput.value.trim() || undefined,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Message failed.");
            }

            addMessage("assistant", data.reply);
        } catch (error) {
            console.error("Lumora widget error:", error);
            addMessage(
                "assistant",
                "Sorry, I could not send your message right now. Please try again."
            );
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = "Send";
        }
    }

    sendButton.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
})();