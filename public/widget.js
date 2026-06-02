(function () {
  const script = document.currentScript;

  if (!script) {
    console.error("Atendilo widget script not found.");
    return;
  }

  const businessId = script.getAttribute("data-business-id");

  if (!businessId) {
    console.error("Atendilo widget: data-business-id is required.");
    return;
  }

  const apiUrl = script.getAttribute("data-api-url") || "http://localhost:4000";

  const widgetOrigin = new URL(script.src).origin;
  const logoPath = script.getAttribute("data-logo-path") || "/icon.png";
  const logoUrl = `${widgetOrigin}${logoPath.startsWith("/") ? logoPath : `/${logoPath}`}`;

  const sessionKey = `atendilo_webchat_session_${businessId}`;
  const inactivityLimit = 30 * 60 * 1000;
  const pollingIntervalMs = 3000;

  let widgetConfig = {
    status: "inactive",
    widgetTitle: "Atendilo AI",
    welcomeMessage: "",
    primaryColor: "#38bdf8",
    captureLeads: true,
  };

  let widgetSession = loadSession();
  let pollingTimer = null;
  let isPollingMessages = false;
  let isSendingMessage = false;
  let typingRow = null;
  let unreadCount = 0;

  function getAiName() {
    return widgetConfig.widgetTitle || "Atendilo AI";
  }

  function createSessionId() {
    return (
      window.crypto?.randomUUID?.() ||
      `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    );
  }

  function createEmptySession() {
    return {
      sessionId: createSessionId(),
      conversationId: null,
      conversationStatus: "open",
      messages: [],
      visitor: {
        name: "",
        phone: "",
        email: "",
      },
      visitorLocked: false,
      agentMode: false,
      ended: false,
      lastActivityAt: Date.now(),
    };
  }

  function loadSession() {
    try {
      const rawSession = sessionStorage.getItem(sessionKey);

      if (!rawSession) {
        return createEmptySession();
      }

      const parsedSession = JSON.parse(rawSession);
      const lastActivityAt = Number(parsedSession.lastActivityAt || 0);

      const isExpired =
        lastActivityAt && Date.now() - lastActivityAt > inactivityLimit;

      if (isExpired) {
        endSessionInBackend(parsedSession.sessionId, "inactivity");
        sessionStorage.removeItem(sessionKey);

        return {
          ...createEmptySession(),
          ended: true,
        };
      }

      return {
        sessionId: parsedSession.sessionId || createSessionId(),
        conversationId: parsedSession.conversationId || null,
        conversationStatus: parsedSession.conversationStatus || "open",
        messages: Array.isArray(parsedSession.messages)
          ? parsedSession.messages
          : [],
        visitor: parsedSession.visitor || {
          name: "",
          phone: "",
          email: "",
        },
        visitorLocked: Boolean(parsedSession.visitorLocked),
        agentMode: Boolean(parsedSession.agentMode),
        ended: Boolean(parsedSession.ended),
        lastActivityAt: parsedSession.lastActivityAt || Date.now(),
      };
    } catch (error) {
      console.error("Atendilo load session error:", error);
      sessionStorage.removeItem(sessionKey);
      return createEmptySession();
    }
  }

  function saveSession() {
    widgetSession.lastActivityAt = Date.now();

    sessionStorage.setItem(
      sessionKey,
      JSON.stringify({
        sessionId: widgetSession.sessionId,
        conversationId: widgetSession.conversationId,
        conversationStatus: widgetSession.conversationStatus,
        messages: widgetSession.messages,
        visitor: widgetSession.visitor,
        visitorLocked: widgetSession.visitorLocked,
        agentMode: widgetSession.agentMode,
        ended: widgetSession.ended,
        lastActivityAt: widgetSession.lastActivityAt,
      })
    );
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isWidgetOpen(windowEl) {
    return windowEl.classList.contains("atendilo-open");
  }

  function isHumanAgentRequest(text) {
    const value = String(text || "").toLowerCase();

    return (
      value.includes("agent") ||
      value.includes("human") ||
      value.includes("person") ||
      value.includes("representative") ||
      value.includes("asesor") ||
      value.includes("agente") ||
      value.includes("persona") ||
      value.includes("humano") ||
      value.includes("alguien real") ||
      value.includes("hablar con alguien") ||
      value.includes("quiero hablar") ||
      value.includes("speak to someone") ||
      value.includes("talk to someone")
    );
  }

  function createFetchWithTimeout(url, options = {}, timeoutMs = 45000) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      window.clearTimeout(timeoutId);
    });
  }

  function normalizeMessage(item) {
    const senderType = item.sender_type || item.senderType || item.role;

    let role = "assistant";

    if (senderType === "contact" || senderType === "user") {
      role = "user";
    }

    if (senderType === "agent") {
      role = "agent";
    }

    if (senderType === "ai" || senderType === "assistant") {
      role = "assistant";
    }

    return {
      id:
        item.id ||
        item.messageId ||
        `${role}_${item.created_at || item.createdAt || Date.now()}_${Math.random()}`,
      role,
      content: item.content || item.message || "",
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    };
  }

  function getMessageFingerprint(message) {
    return `${message.role}::${String(message.content || "").trim()}`;
  }

  function mergeMessages(localMessages, serverMessages) {
    const merged = [];
    const seenIds = new Set();
    const seenFingerprints = new Set();

    [...localMessages, ...serverMessages].forEach((message) => {
      if (!message?.content) return;

      const id = message.id;
      const fingerprint = getMessageFingerprint(message);

      if (id && seenIds.has(id)) return;
      if (seenFingerprints.has(fingerprint)) return;

      if (id) seenIds.add(id);
      seenFingerprints.add(fingerprint);

      merged.push(message);
    });

    return merged.sort((a, b) => {
      return (
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
      );
    });
  }

  async function endSessionInBackend(sessionId, reason) {
    if (!sessionId) return;

    try {
      await fetch(`${apiUrl}/api/webchat/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          sessionId,
          reason,
        }),
      });
    } catch (error) {
      console.error("Atendilo end session error:", error);
    }
  }

  async function loadWidgetConfig() {
    try {
      const response = await fetch(`${apiUrl}/api/webchat/config/${businessId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Could not load widget config");
      }

      widgetConfig = {
        status: data.status || widgetConfig.status,
        widgetTitle: data.widgetTitle || data.widget_title || widgetConfig.widgetTitle,
        welcomeMessage:
          data.welcomeMessage ||
          data.welcome_message ||
          "",
        primaryColor:
          data.primaryColor ||
          data.primary_color ||
          widgetConfig.primaryColor,
        captureLeads:
          data.captureLeads ??
          data.capture_leads ??
          widgetConfig.captureLeads,
      };

      if (!widgetConfig.welcomeMessage) {
        widgetConfig.welcomeMessage = `Hi! I’m ${widgetConfig.widgetTitle}. How can I help you today?`;
      }
    } catch (error) {
      console.error("Atendilo widget config error:", error);
    }
  }

  initAtendiloWidget();

  async function initAtendiloWidget() {
    await loadWidgetConfig();

    if (widgetConfig.status !== "active") {
      console.warn("Atendilo widget is inactive for this business.");
      return;
    }

    const styles = document.createElement("style");

    styles.innerHTML = `
      .atendilo-widget-button {
        position: fixed;
        right: 22px;
        bottom: 22px;
        width: 58px;
        height: 58px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, ${widgetConfig.primaryColor}, #0077ff);
        color: white;
        cursor: pointer;
        box-shadow: 0 18px 45px rgba(0, 119, 255, 0.35);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .atendilo-widget-button:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 22px 55px rgba(0, 119, 255, 0.42);
      }

      .atendilo-widget-button-logo {
        width: 33px;
        height: 33px;
        object-fit: contain;
        display: block;
      }

      .atendilo-unread-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 999px;
        background: #ef4444;
        color: white;
        border: 2px solid #05070a;
        font-size: 11px;
        font-weight: 800;
        display: none;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }

      .atendilo-widget-button.atendilo-has-unread {
        animation: atendiloPulse 1.3s infinite ease-in-out;
      }

      @keyframes atendiloPulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 18px 45px rgba(0, 119, 255, 0.35);
        }
        50% {
          transform: scale(1.06);
          box-shadow: 0 22px 62px rgba(239, 68, 68, 0.38);
        }
      }

      .atendilo-widget-window {
        position: fixed;
        right: 22px;
        bottom: 92px;
        width: 370px;
        max-width: calc(100vw - 32px);
        height: min(570px, calc(100vh - 118px));
        max-height: calc(100vh - 118px);
        border-radius: 22px;
        overflow: hidden;
        background: #05070a;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 25px 80px rgba(0,0,0,0.52);
        z-index: 999999;
        display: none;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .atendilo-widget-window.atendilo-open {
        display: flex;
        flex-direction: column;
      }

      .atendilo-widget-header {
        padding: 13px;
        background: linear-gradient(180deg, #08101d, #060912);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        color: white;
        flex-shrink: 0;
      }

      .atendilo-widget-header-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .atendilo-widget-header-logo {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        object-fit: contain;
        background: rgba(255,255,255,0.07);
        padding: 5px;
        flex-shrink: 0;
      }

      .atendilo-widget-header-content {
        flex: 1;
        min-width: 0;
      }

      .atendilo-widget-title {
        margin: 0;
        font-size: 15px;
        font-weight: 800;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .atendilo-widget-subtitle {
        margin: 4px 0 0;
        font-size: 11.5px;
        line-height: 1.3;
        color: rgba(255,255,255,0.62);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .atendilo-widget-icon-btn {
        width: 30px;
        height: 30px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        line-height: 1;
        padding: 0;
      }

      .atendilo-widget-icon-btn:hover {
        background: rgba(255,255,255,0.12);
        color: white;
      }

      .atendilo-widget-header-bottom {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .atendilo-widget-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: rgba(255,255,255,0.65);
      }

      .atendilo-widget-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
      }

      .atendilo-widget-end {
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.78);
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        cursor: pointer;
        white-space: nowrap;
      }

      .atendilo-widget-end:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }

      .atendilo-lead-screen,
      .atendilo-ended-screen {
        flex: 1;
        min-height: 0;
        padding: 16px;
        background: radial-gradient(circle at top, rgba(56,189,248,0.08), transparent 34%), #030509;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .atendilo-lead-card,
      .atendilo-ended-card {
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        border-radius: 18px;
        padding: 16px;
      }

      .atendilo-lead-title,
      .atendilo-ended-title {
        margin: 0;
        color: white;
        font-size: 18px;
        font-weight: 800;
      }

      .atendilo-lead-text,
      .atendilo-ended-text {
        margin: 7px 0 14px;
        color: rgba(255,255,255,0.62);
        font-size: 13px;
        line-height: 1.45;
      }

      .atendilo-widget-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .atendilo-widget-input,
      .atendilo-widget-text {
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

      .atendilo-widget-input::placeholder,
      .atendilo-widget-text::placeholder {
        color: rgba(255,255,255,0.42);
      }

      .atendilo-widget-input:focus,
      .atendilo-widget-text:focus {
        border-color: ${widgetConfig.primaryColor};
        box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
      }

      .atendilo-lead-error {
        display: none;
        margin-top: 9px;
        color: #fca5a5;
        font-size: 12px;
      }

      .atendilo-primary-action {
        margin-top: 12px;
        width: 100%;
        min-height: 42px;
        border: none;
        border-radius: 12px;
        background: ${widgetConfig.primaryColor};
        color: white;
        cursor: pointer;
        font-weight: 800;
        font-size: 13px;
      }

      .atendilo-visitor-bar {
        display: none;
        padding: 9px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        background: #05070a;
        color: rgba(255,255,255,0.68);
        font-size: 12px;
        flex-shrink: 0;
      }

      .atendilo-visitor-bar strong {
        color: white;
      }

      .atendilo-widget-chat {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .atendilo-widget-messages {
        flex: 1;
        min-height: 0;
        padding: 14px;
        overflow-y: auto;
        overscroll-behavior: contain;
        background: radial-gradient(circle at top, rgba(56,189,248,0.06), transparent 34%), #030509;
        scrollbar-width: thin;
        scrollbar-color: ${widgetConfig.primaryColor} rgba(255,255,255,0.06);
      }

      .atendilo-widget-messages::-webkit-scrollbar {
        width: 8px;
      }

      .atendilo-widget-messages::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.04);
        border-radius: 999px;
      }

      .atendilo-widget-messages::-webkit-scrollbar-thumb {
        background: ${widgetConfig.primaryColor};
        border-radius: 999px;
        border: 2px solid #030509;
      }

      .atendilo-message-row {
        display: flex;
        margin-bottom: 10px;
      }

      .atendilo-message-row.user {
        justify-content: flex-end;
      }

      .atendilo-message-row.assistant,
      .atendilo-message-row.agent {
        justify-content: flex-start;
      }

      .atendilo-message-bubble {
        max-width: 84%;
        padding: 10px 12px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .atendilo-message-row.user .atendilo-message-bubble {
        background: ${widgetConfig.primaryColor};
        color: white;
        border-bottom-right-radius: 5px;
        box-shadow: 0 10px 28px rgba(0, 119, 255, 0.22);
      }

      .atendilo-message-row.assistant .atendilo-message-bubble {
        background: #111722;
        color: white;
        border: 1px solid rgba(255,255,255,0.06);
        border-bottom-left-radius: 5px;
      }

      .atendilo-message-row.agent .atendilo-message-bubble {
        background: #0b2540;
        color: white;
        border: 1px solid rgba(56,189,248,0.22);
        border-bottom-left-radius: 5px;
      }

      .atendilo-message-label {
        display: block;
        margin-bottom: 4px;
        font-size: 10.5px;
        color: rgba(255,255,255,0.55);
      }

      .atendilo-typing-dots {
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }

      .atendilo-typing-dots span {
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: rgba(255,255,255,0.7);
        animation: atendiloTyping 1s infinite ease-in-out;
      }

      .atendilo-typing-dots span:nth-child(2) {
        animation-delay: 0.15s;
      }

      .atendilo-typing-dots span:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes atendiloTyping {
        0%, 80%, 100% {
          opacity: 0.35;
          transform: translateY(0);
        }

        40% {
          opacity: 1;
          transform: translateY(-3px);
        }
      }

      .atendilo-widget-footer {
        display: flex;
        gap: 8px;
        padding: 10px;
        border-top: 1px solid rgba(255,255,255,0.1);
        background: #05070a;
        flex-shrink: 0;
      }

      .atendilo-widget-text {
        min-height: 44px;
      }

      .atendilo-widget-send {
        min-width: 72px;
        border: none;
        border-radius: 12px;
        background: ${widgetConfig.primaryColor};
        color: white;
        padding: 0 15px;
        cursor: pointer;
        font-weight: 800;
        font-size: 13px;
      }

      .atendilo-widget-send:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .atendilo-hidden {
        display: none !important;
      }

      @media (max-width: 640px) {
        .atendilo-widget-window {
          right: 12px;
          left: 12px;
          bottom: 82px;
          width: auto;
          height: min(540px, calc(100dvh - 104px));
          max-height: calc(100dvh - 104px);
          border-radius: 20px;
        }

        .atendilo-widget-button {
          right: 16px;
          bottom: 16px;
          width: 55px;
          height: 55px;
        }

        .atendilo-widget-header {
          padding: 12px;
        }

        .atendilo-widget-subtitle {
          max-width: 190px;
        }

        .atendilo-widget-messages {
          padding: 12px;
        }

        .atendilo-message-bubble {
          max-width: 88%;
          font-size: 12.8px;
        }

        .atendilo-widget-footer {
          padding: 9px;
        }

        .atendilo-widget-send {
          min-width: 64px;
          padding: 0 12px;
        }
      }

      @media (max-width: 380px) {
        .atendilo-widget-window {
          right: 8px;
          left: 8px;
          bottom: 76px;
          height: min(510px, calc(100dvh - 94px));
        }

        .atendilo-widget-subtitle {
          display: none;
        }

        .atendilo-widget-header-bottom {
          margin-top: 8px;
        }

        .atendilo-widget-status {
          font-size: 10.5px;
        }

        .atendilo-widget-end {
          font-size: 10.5px;
          padding: 5px 9px;
        }
      }
    `;

    document.head.appendChild(styles);

    const button = document.createElement("button");
    button.className = "atendilo-widget-button";
    button.setAttribute("aria-label", `Open ${getAiName()} chat`);
    button.innerHTML = `
      <img 
        src="${escapeHtml(logoUrl)}" 
        alt="${escapeHtml(getAiName())}" 
        class="atendilo-widget-button-logo"
      />
      <span class="atendilo-unread-badge" data-atendilo-unread>0</span>
    `;

    const windowEl = document.createElement("div");
    windowEl.className = "atendilo-widget-window";

    windowEl.innerHTML = `
      <div class="atendilo-widget-header">
        <div class="atendilo-widget-header-row">
          <img 
            src="${escapeHtml(logoUrl)}" 
            alt="${escapeHtml(getAiName())}" 
            class="atendilo-widget-header-logo"
          />

          <div class="atendilo-widget-header-content">
            <p class="atendilo-widget-title">${escapeHtml(getAiName())}</p>
            <p class="atendilo-widget-subtitle">Ask us anything. We usually reply instantly.</p>
          </div>

          <button class="atendilo-widget-icon-btn" data-atendilo-minimize type="button" aria-label="Minimize chat">
            −
          </button>
        </div>

        <div class="atendilo-widget-header-bottom">
          <span class="atendilo-widget-status">
            <span class="atendilo-widget-status-dot"></span>
            Online now
          </span>

          <button class="atendilo-widget-end" data-atendilo-end type="button">
            End chat
          </button>
        </div>
      </div>

      <div class="atendilo-lead-screen" data-atendilo-lead-screen>
        <div class="atendilo-lead-card">
          <p class="atendilo-lead-title">Start your chat</p>
          <p class="atendilo-lead-text">Please enter your details so we can help you better.</p>

          <div class="atendilo-widget-fields">
            <input class="atendilo-widget-input" data-atendilo-name placeholder="Name *">
            <input class="atendilo-widget-input" data-atendilo-phone placeholder="Phone *">
            <input class="atendilo-widget-input" data-atendilo-email placeholder="Email">
          </div>

          <div class="atendilo-lead-error" data-atendilo-lead-error>
            Please enter your name and phone number to start.
          </div>

          <button class="atendilo-primary-action" data-atendilo-start type="button">
            Start chat
          </button>
        </div>
      </div>

      <div class="atendilo-ended-screen atendilo-hidden" data-atendilo-ended-screen>
        <div class="atendilo-ended-card">
          <p class="atendilo-ended-title">Chat ended</p>
          <p class="atendilo-ended-text">This conversation has ended. You can start a new chat whenever you need help.</p>
          <button class="atendilo-primary-action" data-atendilo-new-chat type="button">
            Start new chat
          </button>
        </div>
      </div>

      <div class="atendilo-widget-chat" data-atendilo-chat>
        <div class="atendilo-visitor-bar" data-atendilo-visitor-bar></div>

        <div class="atendilo-widget-messages" data-atendilo-messages></div>

        <div class="atendilo-widget-footer">
          <input class="atendilo-widget-text" data-atendilo-message placeholder="Type your message...">
          <button class="atendilo-widget-send" data-atendilo-send>Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(button);
    document.body.appendChild(windowEl);

    const leadScreen = windowEl.querySelector("[data-atendilo-lead-screen]");
    const endedScreen = windowEl.querySelector("[data-atendilo-ended-screen]");
    const chatScreen = windowEl.querySelector("[data-atendilo-chat]");
    const messagesEl = windowEl.querySelector("[data-atendilo-messages]");
    const messageInput = windowEl.querySelector("[data-atendilo-message]");
    const sendButton = windowEl.querySelector("[data-atendilo-send]");
    const endButton = windowEl.querySelector("[data-atendilo-end]");
    const minimizeButton = windowEl.querySelector("[data-atendilo-minimize]");
    const startButton = windowEl.querySelector("[data-atendilo-start]");
    const newChatButton = windowEl.querySelector("[data-atendilo-new-chat]");
    const nameInput = windowEl.querySelector("[data-atendilo-name]");
    const phoneInput = windowEl.querySelector("[data-atendilo-phone]");
    const emailInput = windowEl.querySelector("[data-atendilo-email]");
    const leadError = windowEl.querySelector("[data-atendilo-lead-error]");
    const visitorBar = windowEl.querySelector("[data-atendilo-visitor-bar]");
    const unreadBadge = button.querySelector("[data-atendilo-unread]");

    function updateUnreadBadge() {
      if (!unreadBadge) return;

      if (unreadCount <= 0) {
        unreadBadge.style.display = "none";
        unreadBadge.textContent = "0";
        button.classList.remove("atendilo-has-unread");
        return;
      }

      unreadBadge.style.display = "flex";
      unreadBadge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
      button.classList.add("atendilo-has-unread");
    }

    function clearUnread() {
      unreadCount = 0;
      updateUnreadBadge();
    }

    function addUnread(count = 1) {
      unreadCount += count;
      updateUnreadBadge();
    }

    function requiresLeadCapture() {
      return Boolean(widgetConfig.captureLeads);
    }

    function canChat() {
      if (widgetSession.ended) return false;
      if (!requiresLeadCapture()) return true;
      return Boolean(widgetSession.visitorLocked);
    }

    function syncLeadInputs() {
      if (nameInput) nameInput.value = widgetSession.visitor?.name || "";
      if (phoneInput) phoneInput.value = widgetSession.visitor?.phone || "";
      if (emailInput) emailInput.value = widgetSession.visitor?.email || "";

      const disabled = Boolean(widgetSession.visitorLocked);

      if (nameInput) nameInput.disabled = disabled;
      if (phoneInput) phoneInput.disabled = disabled;
      if (emailInput) emailInput.disabled = disabled;
    }

    function renderVisitorBar() {
      if (!visitorBar) return;

      if (!widgetSession.visitorLocked) {
        visitorBar.style.display = "none";
        visitorBar.innerHTML = "";
        return;
      }

      visitorBar.style.display = "block";

      const name = widgetSession.visitor?.name || "Customer";
      const phone = widgetSession.visitor?.phone || "";

      visitorBar.innerHTML = `
        Chatting as <strong>${escapeHtml(name)}</strong>${phone ? ` · ${escapeHtml(phone)}` : ""}
      `;
    }

    function renderLayout() {
      syncLeadInputs();
      renderVisitorBar();

      if (widgetSession.ended) {
        leadScreen?.classList.add("atendilo-hidden");
        chatScreen?.classList.add("atendilo-hidden");
        endedScreen?.classList.remove("atendilo-hidden");
        stopPollingMessages();
        return;
      }

      endedScreen?.classList.add("atendilo-hidden");

      if (requiresLeadCapture() && !widgetSession.visitorLocked) {
        leadScreen?.classList.remove("atendilo-hidden");
        chatScreen?.classList.add("atendilo-hidden");
        stopPollingMessages();
        return;
      }

      leadScreen?.classList.add("atendilo-hidden");
      chatScreen?.classList.remove("atendilo-hidden");
      renderMessages();
      startPollingMessages();
    }

    function openWidget() {
      windowEl.classList.add("atendilo-open");
      clearUnread();

      setTimeout(function () {
        if (canChat()) {
          messageInput?.focus();
        } else if (!widgetSession.ended) {
          nameInput?.focus();
        }
      }, 80);
    }

    function closeWidget() {
      windowEl.classList.remove("atendilo-open");
    }

    function shouldShowLocalWelcome() {
      if (!widgetSession.messages.length) return true;

      const firstMessage = widgetSession.messages[0];

      if (!firstMessage) return true;

      return firstMessage.role === "user";
    }

    function renderMessages() {
      if (!messagesEl) return;

      messagesEl.innerHTML = "";

      if (shouldShowLocalWelcome()) {
        addMessage("assistant", widgetConfig.welcomeMessage, false, "welcome_message");
      }

      widgetSession.messages.forEach((item) => {
        if (item.role === "agent" && !widgetSession.agentMode) return;
        addMessage(item.role, item.content, false, item.id);
      });

      if (isSendingMessage) {
        showTypingIndicator();
      }
    }

    function addMessage(role, content, shouldSave = true, id) {
      if (!messagesEl || !content) return;

      const row = document.createElement("div");
      row.className = `atendilo-message-row ${role}`;

      const bubble = document.createElement("div");
      bubble.className = "atendilo-message-bubble";

      if (role === "agent") {
        const label = document.createElement("span");
        label.className = "atendilo-message-label";
        label.textContent = "Agent";
        bubble.appendChild(label);
      }

      if (role === "assistant") {
        const label = document.createElement("span");
        label.className = "atendilo-message-label";
        label.textContent = getAiName();
        bubble.appendChild(label);
      }

      const text = document.createElement("span");
      text.textContent = content;

      bubble.appendChild(text);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      if (shouldSave) {
        widgetSession.messages.push({
          id:
            id ||
            `local_${role}_${Date.now()}_${Math.random()
              .toString(36)
              .slice(2)}`,
          role,
          content,
          createdAt: new Date().toISOString(),
        });

        saveSession();
      }
    }

    function showTypingIndicator() {
      if (!messagesEl) return;

      hideTypingIndicator();

      typingRow = document.createElement("div");
      typingRow.className = "atendilo-message-row assistant";
      typingRow.setAttribute("data-atendilo-typing", "true");

      const bubble = document.createElement("div");
      bubble.className = "atendilo-message-bubble";

      const label = document.createElement("span");
      label.className = "atendilo-message-label";
      label.textContent = `${getAiName()} is thinking...`;

      const dots = document.createElement("span");
      dots.className = "atendilo-typing-dots";
      dots.innerHTML = "<span></span><span></span><span></span>";

      bubble.appendChild(label);
      bubble.appendChild(dots);
      typingRow.appendChild(bubble);

      messagesEl.appendChild(typingRow);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTypingIndicator() {
      if (typingRow?.parentNode) {
        typingRow.parentNode.removeChild(typingRow);
      }

      typingRow = null;
    }

    function lockVisitorAndStart() {
      const name = nameInput?.value.trim() || "";
      const phone = phoneInput?.value.trim() || "";
      const email = emailInput?.value.trim() || "";

      if (requiresLeadCapture() && (!name || !phone)) {
        if (leadError) leadError.style.display = "block";
        return;
      }

      if (leadError) leadError.style.display = "none";

      widgetSession.visitor = {
        name,
        phone,
        email,
      };

      widgetSession.visitorLocked = true;
      widgetSession.ended = false;

      saveSession();
      renderLayout();

      setTimeout(function () {
        messageInput?.focus();
      }, 80);
    }

    async function endCurrentChat(reason = "user") {
      const currentSessionId = widgetSession.sessionId;

      await endSessionInBackend(currentSessionId, reason);

      widgetSession.ended = true;
      isSendingMessage = false;
      hideTypingIndicator();
      saveSession();

      renderLayout();
    }

    function startNewChat() {
      sessionStorage.removeItem(sessionKey);

      widgetSession = createEmptySession();
      isSendingMessage = false;
      hideTypingIndicator();
      clearUnread();

      if (!requiresLeadCapture()) {
        widgetSession.visitorLocked = true;
      }

      saveSession();
      renderLayout();

      setTimeout(function () {
        if (requiresLeadCapture()) {
          nameInput?.focus();
        } else {
          messageInput?.focus();
        }
      }, 80);
    }

    async function fetchServerMessages() {
      if (!widgetSession.sessionId || widgetSession.ended || !canChat()) return;
      if (isPollingMessages) return;

      isPollingMessages = true;

      try {
        const response = await fetch(
          `${apiUrl}/api/webchat/messages?businessId=${encodeURIComponent(
            businessId
          )}&sessionId=${encodeURIComponent(widgetSession.sessionId)}`
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.status) {
          widgetSession.conversationStatus = data.status;
        }

        if (data.status === "pending") {
          widgetSession.agentMode = true;
          isSendingMessage = false;
          hideTypingIndicator();
          saveSession();
        }

        if (data.status === "closed" && !widgetSession.ended) {
          widgetSession.ended = true;
          isSendingMessage = false;
          hideTypingIndicator();
          saveSession();
          renderLayout();
          return;
        }

        const serverMessages = Array.isArray(data.messages)
          ? data.messages.map(normalizeMessage).filter((item) => item.content)
          : [];

        if (!serverMessages.length) return;

        const visibleServerMessages = serverMessages.filter((item) => {
          if (item.role === "agent" && !widgetSession.agentMode) return false;
          return true;
        });

        const previousFingerprints = new Set(
          widgetSession.messages.map(getMessageFingerprint)
        );

        const localPendingMessages = widgetSession.messages.filter((item) => {
          return String(item.id || "").startsWith("local_user_");
        });

        const mergedMessages = mergeMessages(
          widgetSession.messages,
          visibleServerMessages
        );

        const newIncomingMessages = mergedMessages.filter((item) => {
          const fingerprint = getMessageFingerprint(item);
          if (previousFingerprints.has(fingerprint)) return false;
          return item.role === "assistant" || item.role === "agent";
        });

        const currentSignature = widgetSession.messages
          .map(getMessageFingerprint)
          .join("|");

        const mergedSignature = mergedMessages.map(getMessageFingerprint).join("|");

        if (currentSignature !== mergedSignature) {
          widgetSession.messages = mergedMessages;
          widgetSession.conversationId =
            data.conversationId || widgetSession.conversationId;

          saveSession();
          renderMessages();

          if (!isWidgetOpen(windowEl) && newIncomingMessages.length > 0) {
            addUnread(newIncomingMessages.length);
          }
        }
      } catch (error) {
        console.error("Atendilo fetch messages error:", error);
      } finally {
        isPollingMessages = false;
      }
    }

    function startPollingMessages() {
      if (pollingTimer) return;

      fetchServerMessages();

      pollingTimer = window.setInterval(function () {
        fetchServerMessages();
      }, pollingIntervalMs);
    }

    function stopPollingMessages() {
      if (!pollingTimer) return;

      window.clearInterval(pollingTimer);
      pollingTimer = null;
    }

    async function sendMessage() {
      const message = messageInput?.value.trim();

      if (!message || !messageInput || !sendButton) return;

      if (!canChat()) {
        renderLayout();
        return;
      }

      if (isSendingMessage) return;

      if (isHumanAgentRequest(message)) {
        widgetSession.agentMode = true;
      }

      saveSession();

      addMessage("user", message);

      messageInput.value = "";
      sendButton.disabled = true;
      sendButton.textContent = "...";

      const shouldShowAiTyping =
        !widgetSession.agentMode &&
        widgetSession.conversationStatus !== "pending";

      isSendingMessage = shouldShowAiTyping;

      if (shouldShowAiTyping) {
        showTypingIndicator();
      }

      try {
        const response = await createFetchWithTimeout(
          `${apiUrl}/api/webchat/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              businessId,
              sessionId: widgetSession.sessionId,
              message,
              visitor: {
                name: widgetSession.visitor?.name || undefined,
                phone: widgetSession.visitor?.phone || undefined,
                email: widgetSession.visitor?.email || undefined,
              },
            }),
          },
          45000
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Message failed.");
        }

        if (data.conversationId) {
          widgetSession.conversationId = data.conversationId;
        }

        if (data.status) {
          widgetSession.conversationStatus = data.status;
        }

        if (data.status === "pending") {
          widgetSession.agentMode = true;
          isSendingMessage = false;
          hideTypingIndicator();
        }

        hideTypingIndicator();

        if (data.reply) {
          addMessage("assistant", data.reply);
        }

        await fetchServerMessages();
      } catch (error) {
        console.error("Atendilo widget error:", error);

        hideTypingIndicator();

        await fetchServerMessages();

        if (widgetSession.conversationStatus === "closed") {
          widgetSession.ended = true;
          saveSession();
          renderLayout();
          return;
        }

        if (widgetSession.conversationStatus !== "pending") {
          addMessage(
            "assistant",
            "Sorry, I could not send your message right now. Please try again."
          );
        }
      } finally {
        isSendingMessage = false;
        hideTypingIndicator();
        sendButton.disabled = false;
        sendButton.textContent = "Send";
        messageInput.focus();
      }
    }

    if (!requiresLeadCapture() && !widgetSession.visitorLocked) {
      widgetSession.visitorLocked = true;
      saveSession();
    }

    updateUnreadBadge();
    renderLayout();

    button.addEventListener("click", function () {
      if (isWidgetOpen(windowEl)) {
        closeWidget();
      } else {
        openWidget();
      }
    });

    minimizeButton?.addEventListener("click", function () {
      closeWidget();
    });

    startButton?.addEventListener("click", function () {
      lockVisitorAndStart();
    });

    newChatButton?.addEventListener("click", function () {
      startNewChat();
    });

    endButton?.addEventListener("click", async function () {
      await endCurrentChat("user");
    });

    sendButton?.addEventListener("click", sendMessage);

    messageInput?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });

    nameInput?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        lockVisitorAndStart();
      }
    });

    phoneInput?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        lockVisitorAndStart();
      }
    });

    emailInput?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        lockVisitorAndStart();
      }
    });

    setInterval(async function () {
      const lastActivityAt = Number(widgetSession.lastActivityAt || 0);

      if (!lastActivityAt || widgetSession.ended) return;

      const isExpired = Date.now() - lastActivityAt > inactivityLimit;

      if (!isExpired) return;

      await endCurrentChat("inactivity");
    }, 60 * 1000);
  }
})();