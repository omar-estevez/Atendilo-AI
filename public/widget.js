(function () {
  const currentScript = document.currentScript;

  const API_BASE =
    currentScript?.dataset.apiBase ||
    currentScript?.getAttribute("data-api-base") ||
    currentScript?.src?.replace(/\/widget\.js.*$/, "") ||
    "";

  const BUSINESS_ID =
    currentScript?.dataset.businessId ||
    currentScript?.getAttribute("data-business-id") ||
    window.ATENDILO_BUSINESS_ID ||
    "";

  const ICON_URL =
    currentScript?.dataset.iconUrl ||
    currentScript?.getAttribute("data-icon-url") ||
    "";

  if (!BUSINESS_ID) {
    console.error("[Atendilo Widget] Missing business id.");
    return;
  }

  const state = {
    config: null,
    isOpen: false,
    isLoading: false,
    isSending: false,
    sessionId: createSessionId(),
    sessionVersion: 0,
    conversationId: null,
    conversationStatus: null,
    messages: [],
    visitor: null,
    pollingInterval: null,
  };

  const endpoints = {
    config: `${API_BASE}/api/webchat/config/${BUSINESS_ID}`,
    messages: `${API_BASE}/api/webchat/messages`,
    send: `${API_BASE}/api/webchat/message`,
    end: `${API_BASE}/api/webchat/end`,
  };

  const styles = `
    .atendilo-widget-root {
      all: initial;
      position: relative;
      z-index: 2147483646;
    }

    .atendilo-widget-root,
    .atendilo-widget-root * {
      box-sizing: border-box !important;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }

    .atendilo-widget-root button,
    .atendilo-widget-root input,
    .atendilo-widget-root form {
      font: inherit !important;
    }

    .atendilo-launcher {
      position: fixed !important;
      right: 24px !important;
      bottom: 24px !important;
      width: 64px !important;
      height: 64px !important;
      border-radius: 999px !important;
      border: 0 !important;
      cursor: pointer !important;
      z-index: 2147483646 !important;
      background: linear-gradient(135deg, var(--atendilo-primary), #2563eb) !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 180ms ease, box-shadow 180ms ease !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .atendilo-launcher:hover {
      transform: translateY(-2px) scale(1.03) !important;
      box-shadow: 0 26px 60px rgba(0, 0, 0, 0.45) !important;
    }

    .atendilo-launcher img {
      width: 34px !important;
      height: 34px !important;
      max-width: 34px !important;
      max-height: 34px !important;
      object-fit: contain !important;
      display: block !important;
    }

    .atendilo-launcher svg {
      width: 31px !important;
      height: 31px !important;
      color: white !important;
      display: block !important;
    }

    .atendilo-panel {
  position: fixed !important;
  right: 24px !important;
  bottom: 100px !important;
  width: 380px !important;
  height: 620px !important;
  max-height: calc(100vh - 130px) !important;
  z-index: 2147483646 !important;
  border-radius: 22px !important;
  overflow: hidden !important;
  background: #070b14 !important;
  border: 1px solid rgba(148, 163, 184, 0.18) !important;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55) !important;
  display: none !important;
  color: #f8fafc !important;
}

    .atendilo-panel.open {
      display: flex !important;
      flex-direction: column !important;
    }

    .atendilo-header {
      padding: 14px 16px !important;
      background: #090e19 !important;
      border-bottom: 1px solid rgba(148, 163, 184, 0.14) !important;
      flex-shrink: 0 !important;
    }

    .atendilo-header-top {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
    }

    .atendilo-avatar {
      width: 42px !important;
      height: 42px !important;
      border-radius: 12px !important;
      background: rgba(56, 189, 248, 0.12) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }

    .atendilo-avatar svg {
      width: 24px !important;
      height: 24px !important;
      color: var(--atendilo-primary) !important;
      display: block !important;
    }

    .atendilo-avatar img {
      width: 24px !important;
      height: 24px !important;
      max-width: 24px !important;
      max-height: 24px !important;
      object-fit: contain !important;
      display: block !important;
    }

    .atendilo-title-area {
      min-width: 0 !important;
      flex: 1 !important;
    }

    .atendilo-title {
      font-size: 15px !important;
      font-weight: 800 !important;
      line-height: 1.1 !important;
      color: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .atendilo-subtitle {
      margin: 3px 0 0 !important;
      padding: 0 !important;
      font-size: 12px !important;
      line-height: 1.3 !important;
      color: rgba(226, 232, 240, 0.7) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .atendilo-minimize {
      width: 30px !important;
      height: 30px !important;
      border-radius: 999px !important;
      border: 1px solid rgba(148, 163, 184, 0.18) !important;
      background: rgba(15, 23, 42, 0.8) !important;
      color: rgba(226, 232, 240, 0.8) !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 18px !important;
      line-height: 1 !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .atendilo-status-row {
      margin-top: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    .atendilo-online {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      font-size: 12px !important;
      color: rgba(226, 232, 240, 0.8) !important;
      line-height: 1 !important;
    }

    .atendilo-online-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 999px !important;
      background: #22c55e !important;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1) !important;
      flex-shrink: 0 !important;
    }

    .atendilo-end-btn {
      border: 1px solid rgba(148, 163, 184, 0.22) !important;
      background: rgba(15, 23, 42, 0.85) !important;
      color: rgba(226, 232, 240, 0.85) !important;
      font-size: 11px !important;
      line-height: 1 !important;
      padding: 7px 11px !important;
      border-radius: 999px !important;
      cursor: pointer !important;
      margin: 0 !important;
    }

    .atendilo-end-btn:hover {
      border-color: rgba(248, 113, 113, 0.45) !important;
      color: #fecaca !important;
      background: rgba(127, 29, 29, 0.25) !important;
    }

    .atendilo-chatting-as {
      padding: 8px 14px !important;
      border-bottom: 1px solid rgba(148, 163, 184, 0.14) !important;
      background: rgba(2, 6, 23, 0.8) !important;
      color: rgba(226, 232, 240, 0.82) !important;
      font-size: 12px !important;
      line-height: 1.3 !important;
      flex-shrink: 0 !important;
    }

    .atendilo-chatting-as strong {
      color: #ffffff !important;
      font-weight: 800 !important;
    }

    .atendilo-body {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      background: #060a12 !important;
    }

    .atendilo-lead-form-wrap {
      flex: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px 14px !important;
      min-height: 0 !important;
    }

    .atendilo-lead-form {
      width: 100% !important;
      border: 1px solid rgba(148, 163, 184, 0.16) !important;
      background: rgba(15, 23, 42, 0.5) !important;
      border-radius: 16px !important;
      padding: 14px !important;
      margin: 0 !important;
    }

    .atendilo-lead-form h3 {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 16px !important;
      line-height: 1.2 !important;
      color: #ffffff !important;
      font-weight: 800 !important;
    }

    .atendilo-lead-form p {
      margin: 5px 0 12px !important;
      padding: 0 !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      color: rgba(226, 232, 240, 0.68) !important;
    }

    .atendilo-input {
      width: 100% !important;
      height: 40px !important;
      border-radius: 12px !important;
      border: 1px solid rgba(148, 163, 184, 0.18) !important;
      background: rgba(2, 6, 23, 0.75) !important;
      color: #ffffff !important;
      outline: none !important;
      padding: 0 12px !important;
      font-size: 13px !important;
      margin: 0 0 10px !important;
      display: block !important;
    }

    .atendilo-input::placeholder,
    .atendilo-message-input::placeholder {
      color: rgba(226, 232, 240, 0.48) !important;
    }

    .atendilo-input:focus,
    .atendilo-message-input:focus {
      border-color: var(--atendilo-primary) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--atendilo-primary) 20%, transparent) !important;
    }

    .atendilo-form-error {
      display: none !important;
      margin: 0 0 10px !important;
      padding: 8px 10px !important;
      border-radius: 10px !important;
      background: rgba(239, 68, 68, 0.12) !important;
      border: 1px solid rgba(239, 68, 68, 0.25) !important;
      color: #fecaca !important;
      font-size: 12px !important;
      line-height: 1.35 !important;
    }

    .atendilo-form-error.show {
      display: block !important;
    }

    .atendilo-start-btn,
    .atendilo-send-btn {
      border: 0 !important;
      cursor: pointer !important;
      background: var(--atendilo-primary) !important;
      color: white !important;
      font-weight: 800 !important;
      border-radius: 10px !important;
      height: 40px !important;
      padding: 0 14px !important;
      font-size: 13px !important;
      line-height: 1 !important;
      margin: 0 !important;
    }

    .atendilo-start-btn {
      width: 100% !important;
    }

    .atendilo-start-btn:disabled,
    .atendilo-send-btn:disabled {
      opacity: 0.65 !important;
      cursor: not-allowed !important;
    }

    .atendilo-messages {
  flex: 1 !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  padding: 16px 14px 18px !important;
  scroll-behavior: smooth !important;
}

    .atendilo-messages::-webkit-scrollbar {
      width: 7px !important;
    }

    .atendilo-messages::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.4) !important;
    }

    .atendilo-messages::-webkit-scrollbar-thumb {
      background: var(--atendilo-primary) !important;
      border-radius: 999px !important;
    }

    .atendilo-message {
  display: flex !important;
  width: 100% !important;
  margin-bottom: 12px !important;
}

    .atendilo-message.customer {
      justify-content: flex-end !important;
    }

    .atendilo-message.ai,
    .atendilo-message.agent {
      justify-content: flex-start !important;
    }

    .atendilo-bubble {
  display: inline-block !important;
  width: auto !important;
  max-width: 76% !important;
  min-width: 0 !important;
  border-radius: 16px !important;
  padding: 11px 13px !important;
  font-size: 13px !important;
  line-height: 1.45 !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
  text-align: left !important;
  margin: 0 !important;
}

    .atendilo-message.customer .atendilo-bubble {
  background: var(--atendilo-primary) !important;
  color: white !important;
  border-bottom-right-radius: 6px !important;
  max-width: 68% !important;
}

    .atendilo-message.ai .atendilo-bubble,
.atendilo-message.agent .atendilo-bubble {
  background: #111827 !important;
  color: #f8fafc !important;
  border: 1px solid rgba(148, 163, 184, 0.12) !important;
  border-bottom-left-radius: 6px !important;
  max-width: 74% !important;
}

    .atendilo-bubble-label {
      display: block !important;
      color: rgba(226, 232, 240, 0.58) !important;
      font-size: 11px !important;
      line-height: 1.2 !important;
      margin-bottom: 5px !important;
      font-weight: 700 !important;
    }

    .atendilo-typing {
      padding: 0 14px !important;
      flex-shrink: 0 !important;
    }

    .atendilo-typing .atendilo-message {
      margin-bottom: 12px !important;
    }

    .atendilo-typing-bubble {
      width: fit-content !important;
      max-width: 150px !important;
      min-width: 112px !important;
    }

    .atendilo-typing-dots {
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      height: 14px !important;
    }

    .atendilo-typing-dots span {
      width: 6px !important;
      height: 6px !important;
      border-radius: 999px !important;
      background: rgba(226, 232, 240, 0.75) !important;
      animation: atendiloTyping 1s infinite ease-in-out !important;
    }

    .atendilo-typing-dots span:nth-child(2) {
      animation-delay: 0.15s !important;
    }

    .atendilo-typing-dots span:nth-child(3) {
      animation-delay: 0.3s !important;
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

    .atendilo-handoff-banner {
      margin: 8px 12px !important;
      padding: 10px 12px !important;
      border: 1px solid rgba(245, 158, 11, 0.35) !important;
      background: rgba(245, 158, 11, 0.12) !important;
      color: #fbbf24 !important;
      border-radius: 12px !important;
      font-size: 12px !important;
      line-height: 1.35 !important;
      display: none;
      flex-shrink: 0 !important;
    }

    .atendilo-handoff-banner strong {
      display: block !important;
      color: #fcd34d !important;
      font-size: 12px !important;
      margin-bottom: 2px !important;
    }

    .atendilo-handoff-banner span {
      display: block !important;
      color: rgba(253, 230, 138, 0.9) !important;
    }

    .atendilo-composer {
  display: flex !important;
  gap: 8px !important;
  padding: 12px !important;
  border-top: 1px solid rgba(148, 163, 184, 0.14) !important;
  background: #070b14 !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
}

    .atendilo-message-input {
  flex: 1 !important;
  min-width: 0 !important;
  height: 44px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(148, 163, 184, 0.18) !important;
  background: rgba(2, 6, 23, 0.72) !important;
  color: #ffffff !important;
  outline: none !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  margin: 0 !important;
}

    .atendilo-send-btn {
  height: 44px !important;
  min-width: 72px !important;
  border-radius: 12px !important;
  flex-shrink: 0 !important;
}

    .atendilo-hidden {
      display: none !important;
    }

    @media (max-width: 520px) {
      .atendilo-panel {
        right: 10px !important;
        left: 10px !important;
        bottom: 86px !important;
        width: auto !important;
        height: min(620px, calc(100vh - 110px)) !important;
      }

      .atendilo-launcher {
        right: 18px !important;
        bottom: 18px !important;
      }
    }
  `;

  function createSessionId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function injectStyles(primaryColor) {
    let style = document.getElementById("atendilo-widget-styles");

    if (!style) {
      style = document.createElement("style");
      style.id = "atendilo-widget-styles";
      document.head.appendChild(style);
    }

    style.textContent = styles;

    document.documentElement.style.setProperty(
      "--atendilo-primary",
      primaryColor || "#ee82ee"
    );
  }

  function escapeAttribute(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function botIconSvg() {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 3h6v2h-2v2h4a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h4V5H9V3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 13h.01M15 13h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M9.5 17h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M3 12H2M22 12h-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;
  }

  function renderWidgetIcon() {
    if (ICON_URL) {
      return `<img src="${escapeAttribute(ICON_URL)}" alt="Atendilo" />`;
    }

    return botIconSvg();
  }

  function createRoot() {
    const existingRoot = document.querySelector(".atendilo-widget-root");

    if (existingRoot) {
      existingRoot.remove();
    }

    const root = document.createElement("div");
    root.className = "atendilo-widget-root";

    root.innerHTML = `
      <button class="atendilo-launcher" type="button" aria-label="Open chat">
        ${renderWidgetIcon()}
      </button>

      <section class="atendilo-panel" aria-label="Atendilo web chat">
        <header class="atendilo-header">
          <div class="atendilo-header-top">
            <div class="atendilo-avatar">
              ${renderWidgetIcon()}
            </div>

            <div class="atendilo-title-area">
              <h2 class="atendilo-title">Angela AI</h2>
              <p class="atendilo-subtitle">Ask us anything. We usually reply instantly.</p>
            </div>

            <button class="atendilo-minimize" type="button" aria-label="Minimize chat">−</button>
          </div>

          <div class="atendilo-status-row">
            <div class="atendilo-online">
              <span class="atendilo-online-dot"></span>
              <span>Online now</span>
            </div>

            <button class="atendilo-end-btn" type="button">End chat</button>
          </div>
        </header>

        <div class="atendilo-chatting-as atendilo-hidden"></div>

        <main class="atendilo-body">
          <div class="atendilo-lead-form-wrap atendilo-hidden">
            <form class="atendilo-lead-form">
              <h3>Start your chat</h3>
              <p>Please enter your details so we can help you better.</p>

              <div class="atendilo-form-error"></div>

              <input class="atendilo-input atendilo-name" placeholder="Name *" autocomplete="name" />
              <input class="atendilo-input atendilo-phone" placeholder="Phone *" autocomplete="tel" />
              <input class="atendilo-input atendilo-email" placeholder="Email *" autocomplete="email" />

              <button class="atendilo-start-btn" type="submit">Start chat</button>
            </form>
          </div>

          <div class="atendilo-messages"></div>

          <div class="atendilo-typing atendilo-hidden">
            <div class="atendilo-message ai">
              <div class="atendilo-bubble atendilo-typing-bubble">
                <span class="atendilo-bubble-label">Angela AI</span>
                <span class="atendilo-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>

          <div class="atendilo-handoff-banner">
            <strong>Human agent requested</strong>
            <span>A human agent will join the conversation soon. You can keep sending messages here.</span>
          </div>

          <form class="atendilo-composer">
            <input class="atendilo-message-input" placeholder="Type your message..." autocomplete="off" />
            <button class="atendilo-send-btn" type="submit">Send</button>
          </form>
        </main>
      </section>
    `;

    document.body.appendChild(root);

    return root;
  }

  injectStyles("#ee82ee");

  const root = createRoot();

  const $ = (selector) => root.querySelector(selector);

  const launcher = $(".atendilo-launcher");
  const panel = $(".atendilo-panel");
  const titleEl = $(".atendilo-title");
  const subtitleEl = $(".atendilo-subtitle");
  const minimizeBtn = $(".atendilo-minimize");
  const endBtn = $(".atendilo-end-btn");
  const chattingAs = $(".atendilo-chatting-as");
  const leadWrap = $(".atendilo-lead-form-wrap");
  const leadForm = $(".atendilo-lead-form");
  const leadError = $(".atendilo-form-error");
  const nameInput = $(".atendilo-name");
  const phoneInput = $(".atendilo-phone");
  const emailInput = $(".atendilo-email");
  const messagesEl = $(".atendilo-messages");
  const typingEl = $(".atendilo-typing");
  const composer = $(".atendilo-composer");
  const messageInput = $(".atendilo-message-input");
  const sendBtn = $(".atendilo-send-btn");
  const handoffBanner = $(".atendilo-handoff-banner");

  function showPanel() {
    state.isOpen = true;
    panel.classList.add("open");

    setTimeout(() => {
      if (shouldShowLeadForm()) {
        nameInput?.focus();
      } else {
        messageInput?.focus();
      }
    }, 80);

    startPolling();
  }

  function hidePanel() {
    state.isOpen = false;
    panel.classList.remove("open");
    stopPolling();
  }

  function minimizePanel() {
    hidePanel();
  }

  function setLoading(value) {
    state.isLoading = value;
  }

  function setSending(value) {
    state.isSending = value;
    sendBtn.disabled = value;
    messageInput.disabled = value;
  }

  function setLeadError(message) {
    if (!leadError) return;

    if (!message) {
      leadError.textContent = "";
      leadError.classList.remove("show");
      return;
    }

    leadError.textContent = message;
    leadError.classList.add("show");
  }

  function getVisitorLabel() {
    if (!state.visitor) return "Customer";

    const name = state.visitor.name?.trim();
    const phone = state.visitor.phone?.trim();
    const email = state.visitor.email?.trim();

    if (name && phone) return `${name} · ${phone}`;
    if (name && email) return `${name} · ${email}`;
    if (name) return name;
    if (phone) return phone;
    if (email) return email;

    return "Customer";
  }

  function getAiLabel() {
    return escapeHtml(state.config?.widgetTitle || "AI");
  }

  function renderChattingAs() {
    if (shouldShowLeadForm()) {
      chattingAs.innerHTML = "";
      chattingAs.classList.add("atendilo-hidden");
      return;
    }

    const label = getVisitorLabel();
    chattingAs.innerHTML = `Chatting as <strong>${escapeHtml(label)}</strong>`;
    chattingAs.classList.remove("atendilo-hidden");
  }

  function renderHandoffBanner() {
    const shouldShow = state.conversationStatus === "pending";
    handoffBanner.style.display = shouldShow ? "block" : "none";
  }

  function shouldShowLeadForm() {
    return Boolean(state.config?.captureLeads) && !state.visitor;
  }

  function updateUIByLeadMode() {
    const showLeadForm = shouldShowLeadForm();

    leadWrap.classList.toggle("atendilo-hidden", !showLeadForm);
    messagesEl.classList.toggle("atendilo-hidden", showLeadForm);
    composer.classList.toggle("atendilo-hidden", showLeadForm);

    hideTyping();
    renderChattingAs();

    if (!showLeadForm) {
      renderMessages();
      setTimeout(() => messageInput?.focus(), 80);
    }
  }

  function normalizeSender(senderType) {
    if (
      senderType === "contact" ||
      senderType === "customer" ||
      senderType === "user"
    ) {
      return "customer";
    }

    if (senderType === "agent" || senderType === "profile") {
      return "agent";
    }

    return "ai";
  }

  function getWelcomeMessage() {
    return (
      state.config?.welcomeMessage ||
      state.config?.welcome_message ||
      "Hi! Welcome to my business. How can I help you today?"
    );
  }

  function shouldRenderWelcome() {
    return Boolean(getWelcomeMessage()) && !shouldShowLeadForm();
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    if (shouldRenderWelcome()) {
      appendMessage({
        sender_type: "ai",
        content: getWelcomeMessage(),
        synthetic: true,
      });
    }

    state.messages.forEach(appendMessage);

    scrollToBottom();
  }

  function appendMessage(message) {
    const sender = normalizeSender(message.sender_type);
    const item = document.createElement("div");

    item.className = `atendilo-message ${sender}`;

    const label =
      sender === "customer"
        ? ""
        : `<span class="atendilo-bubble-label">${sender === "agent" ? "Agent" : getAiLabel()
        }</span>`;

    item.innerHTML = `
      <div class="atendilo-bubble">
        ${label}
        ${escapeHtml(message.content)}
      </div>
    `;

    messagesEl.appendChild(item);
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function showTyping() {
    const labelEl = typingEl?.querySelector(".atendilo-bubble-label");

    if (labelEl) {
      labelEl.textContent = state.config?.widgetTitle || "AI";
    }

    typingEl?.classList.remove("atendilo-hidden");
    scrollToBottom();
  }

  function hideTyping() {
    typingEl?.classList.add("atendilo-hidden");
  }

  function isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getCleanVisitorPayload() {
    if (!state.visitor) return null;

    const name = String(state.visitor.name || "").trim();
    const phone = String(state.visitor.phone || "").trim();
    const email = String(state.visitor.email || "").trim();

    if (!name || !phone || !email || !isValidEmail(email)) {
      return null;
    }

    return {
      name,
      phone,
      email,
    };
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(
        `Invalid JSON response from ${url}. Check API_BASE / data-api-base.`
      );
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Request failed");
    }

    return data;
  }

  async function loadConfig() {
    setLoading(true);

    try {
      const configResponse = await fetchJson(endpoints.config);
      const config = configResponse || {};

      state.config = {
        businessId: config.businessId || config.business_id || BUSINESS_ID,
        channelId: config.channelId || config.channel_id || null,
        status: config.status || "inactive",
        widgetTitle:
          config.widgetTitle ||
          config.widget_title ||
          config.aiName ||
          config.ai_name ||
          "Angela AI",
        welcomeMessage:
          config.welcomeMessage ||
          config.welcome_message ||
          "Hi! Welcome to my business. How can I help you today?",
        primaryColor: config.primaryColor || config.primary_color || "#ee82ee",
        captureLeads:
          typeof config.captureLeads === "boolean"
            ? config.captureLeads
            : typeof config.capture_leads === "boolean"
              ? config.capture_leads
              : true,
      };

      injectStyles(state.config.primaryColor);

      titleEl.textContent = state.config.widgetTitle;
      subtitleEl.textContent = "Ask us anything. We usually reply instantly.";

      if (!state.config.captureLeads) {
        state.visitor = {
          name: "Customer",
          phone: "",
          email: "",
        };
      }

      updateUIByLeadMode();
      await loadMessages();
    } catch (error) {
      console.error("[Atendilo Widget] Config error:", error);

      state.config = {
        businessId: BUSINESS_ID,
        channelId: null,
        status: "active",
        widgetTitle: "Angela AI",
        welcomeMessage: "Hi! Welcome to my business. How can I help you today?",
        primaryColor: "#ee82ee",
        captureLeads: true,
      };

      injectStyles(state.config.primaryColor);

      titleEl.textContent = state.config.widgetTitle;
      subtitleEl.textContent = "Ask us anything. We usually reply instantly.";

      updateUIByLeadMode();
      await loadMessages();
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    const sessionId = state.sessionId;
    const sessionVersion = state.sessionVersion;

    try {
      const params = new URLSearchParams({
        businessId: BUSINESS_ID,
        sessionId,
      });

      const dataResponse = await fetchJson(
        `${endpoints.messages}?${params.toString()}`
      );

      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) {
        return;
      }

      const data = dataResponse || {};

      state.conversationId =
        data.conversationId ||
        data.conversation_id ||
        state.conversationId ||
        null;

      state.conversationStatus =
        data.status ||
        data.conversationStatus ||
        data.conversation_status ||
        state.conversationStatus ||
        null;

      state.messages = Array.isArray(data.messages) ? data.messages : [];

      renderMessages();
      renderHandoffBanner();
    } catch (error) {
      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) {
        return;
      }

      console.error("[Atendilo Widget] Load messages error:", error);

      state.conversationId = state.conversationId || null;
      state.conversationStatus = state.conversationStatus || null;
      state.messages = Array.isArray(state.messages) ? state.messages : [];

      renderMessages();
      renderHandoffBanner();
    }
  }

  async function sendMessage(content) {
    const text = String(content || "").trim();

    if (!text || state.isSending) return;

    const visitorPayload = getCleanVisitorPayload();

    if (state.config?.captureLeads && !visitorPayload) {
      setLeadError("Please enter your name, phone, and a valid email before chatting.");
      state.visitor = null;
      updateUIByLeadMode();
      return;
    }

    const sessionId = state.sessionId;
    const sessionVersion = state.sessionVersion;

    setSending(true);

    const optimisticMessage = {
      id: `local_${Date.now()}`,
      sender_type: "contact",
      content: text,
      created_at: new Date().toISOString(),
    };

    state.messages.push(optimisticMessage);
    renderMessages();

    messageInput.value = "";
    showTyping();

    try {
      const dataResponse = await fetchJson(endpoints.send, {
        method: "POST",
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          sessionId,
          message: text,
          visitor: visitorPayload,
          clientMessageId: optimisticMessage.id,
        }),
      });

      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) {
        return;
      }

      const data = dataResponse || {};

      state.conversationId =
        data.conversationId ||
        data.conversation_id ||
        state.conversationId ||
        null;

      state.conversationStatus =
        data.status ||
        data.conversationStatus ||
        data.conversation_status ||
        state.conversationStatus ||
        null;

      await loadMessages();

      hideTyping();

      if (data.reply && !state.messages.some((m) => m.content === data.reply)) {
        state.messages.push({
          id: `ai_${Date.now()}`,
          sender_type: "ai",
          content: data.reply,
          created_at: new Date().toISOString(),
        });

        renderMessages();
      }

      renderHandoffBanner();
    } catch (error) {
      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) {
        return;
      }

      hideTyping();

      console.error("[Atendilo Widget] Send error:", error);

      state.messages.push({
        id: `error_${Date.now()}`,
        sender_type: "ai",
        content:
          "Sorry, something went wrong while sending your message. Please try again.",
        created_at: new Date().toISOString(),
      });

      renderMessages();
    } finally {
      if (sessionId === state.sessionId && sessionVersion === state.sessionVersion) {
        hideTyping();
        setSending(false);
        messageInput.focus();
      }
    }
  }

  async function endChat() {
    const oldSessionId = state.sessionId;

    stopPolling();

    state.sessionVersion += 1;
    state.messages = [];
    state.conversationId = null;
    state.conversationStatus = null;
    state.visitor = null;
    state.sessionId = createSessionId();
    state.isSending = false;

    nameInput.value = "";
    phoneInput.value = "";
    emailInput.value = "";
    messageInput.value = "";
    setLeadError("");
    hideTyping();
    setSending(false);

    chattingAs.innerHTML = "";
    chattingAs.classList.add("atendilo-hidden");

    renderHandoffBanner();
    updateUIByLeadMode();
    renderMessages();

    try {
      await fetchJson(endpoints.end, {
        method: "POST",
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          sessionId: oldSessionId,
          reason: "user",
        }),
      });
    } catch (error) {
      console.error("[Atendilo Widget] End chat error:", error);
    }

    if (state.isOpen) {
      startPolling();
    }
  }

  function startPolling() {
    stopPolling();

    state.pollingInterval = window.setInterval(() => {
      if (!state.isOpen || shouldShowLeadForm()) return;
      loadMessages();
    }, 3500);
  }

  function stopPolling() {
    if (state.pollingInterval) {
      window.clearInterval(state.pollingInterval);
      state.pollingInterval = null;
    }
  }

  launcher.addEventListener("click", () => {
    if (state.isOpen) {
      hidePanel();
    } else {
      showPanel();
    }
  });

  minimizeBtn.addEventListener("click", minimizePanel);

  endBtn.addEventListener("click", endChat);

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    setLeadError("");

    if (!name) {
      setLeadError("Please enter your name.");
      nameInput.focus();
      return;
    }

    if (!phone) {
      setLeadError("Please enter your phone number.");
      phoneInput.focus();
      return;
    }

    if (!email) {
      setLeadError("Please enter your email.");
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setLeadError("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    state.visitor = {
      name,
      phone,
      email,
    };

    updateUIByLeadMode();
    renderMessages();
    startPolling();
  });

  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(messageInput.value);
  });

  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  window.addEventListener("beforeunload", () => {
    stopPolling();
  });

  loadConfig();
})();