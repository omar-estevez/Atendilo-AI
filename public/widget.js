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

  if (!BUSINESS_ID) {
    console.error("[Atendilo Widget] Missing business id.");
    return;
  }

  const state = {
    config: null,
    isOpen: false,
    isMinimized: false,
    isLoading: false,
    isSending: false,
    sessionId: crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`,
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
    .atendilo-widget-root,
    .atendilo-widget-root * {
      box-sizing: border-box;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .atendilo-launcher {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 64px;
      height: 64px;
      border-radius: 999px;
      border: 0;
      cursor: pointer;
      z-index: 2147483646;
      background: linear-gradient(135deg, var(--atendilo-primary), #2563eb);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 180ms ease, box-shadow 180ms ease;
    }

    .atendilo-launcher:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 26px 60px rgba(0, 0, 0, 0.45);
    }

    .atendilo-launcher img {
      width: 34px;
      height: 34px;
      object-fit: contain;
    }

    .atendilo-launcher svg {
      width: 31px;
      height: 31px;
      color: white;
    }

    .atendilo-panel {
      position: fixed;
      right: 24px;
      bottom: 100px;
      width: 370px;
      height: 620px;
      max-height: calc(100vh - 130px);
      z-index: 2147483646;
      border-radius: 22px;
      overflow: hidden;
      background: #070b14;
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
      display: none;
      color: #f8fafc;
    }

    .atendilo-panel.open {
      display: flex;
      flex-direction: column;
    }

    .atendilo-header {
      padding: 14px 16px;
      background: #090e19;
      border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    }

    .atendilo-header-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .atendilo-avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(56, 189, 248, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .atendilo-avatar svg {
      width: 24px;
      height: 24px;
      color: var(--atendilo-primary);
    }

    .atendilo-title-area {
      min-width: 0;
      flex: 1;
    }

    .atendilo-title {
      font-size: 15px;
      font-weight: 800;
      line-height: 1.1;
      color: #ffffff;
      margin: 0;
    }

    .atendilo-subtitle {
      margin: 3px 0 0;
      font-size: 12px;
      color: rgba(226, 232, 240, 0.7);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .atendilo-minimize {
      width: 30px;
      height: 30px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.8);
      color: rgba(226, 232, 240, 0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
    }

    .atendilo-status-row {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .atendilo-online {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(226, 232, 240, 0.8);
    }

    .atendilo-online-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
    }

    .atendilo-end-btn {
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(15, 23, 42, 0.85);
      color: rgba(226, 232, 240, 0.85);
      font-size: 11px;
      padding: 6px 11px;
      border-radius: 999px;
      cursor: pointer;
    }

    .atendilo-end-btn:hover {
      border-color: rgba(248, 113, 113, 0.45);
      color: #fecaca;
      background: rgba(127, 29, 29, 0.25);
    }

    .atendilo-chatting-as {
      padding: 8px 14px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(2, 6, 23, 0.8);
      color: rgba(226, 232, 240, 0.82);
      font-size: 12px;
    }

    .atendilo-chatting-as strong {
      color: #ffffff;
      font-weight: 800;
    }

    .atendilo-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      background: #060a12;
    }

    .atendilo-lead-form-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 20px 14px;
    }

    .atendilo-lead-form {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(15, 23, 42, 0.5);
      border-radius: 16px;
      padding: 14px;
    }

    .atendilo-lead-form h3 {
      margin: 0;
      font-size: 16px;
      color: #ffffff;
    }

    .atendilo-lead-form p {
      margin: 5px 0 12px;
      font-size: 12px;
      color: rgba(226, 232, 240, 0.68);
    }

    .atendilo-input {
      width: 100%;
      height: 38px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(2, 6, 23, 0.7);
      color: #ffffff;
      outline: none;
      padding: 0 10px;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .atendilo-input:focus,
    .atendilo-message-input:focus {
      border-color: var(--atendilo-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--atendilo-primary) 20%, transparent);
    }

    .atendilo-start-btn,
    .atendilo-send-btn {
      border: 0;
      cursor: pointer;
      background: var(--atendilo-primary);
      color: white;
      font-weight: 800;
      border-radius: 10px;
      height: 40px;
      padding: 0 14px;
      font-size: 13px;
    }

    .atendilo-start-btn {
      width: 100%;
    }

    .atendilo-start-btn:disabled,
    .atendilo-send-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .atendilo-messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 14px;
      scroll-behavior: smooth;
    }

    .atendilo-messages::-webkit-scrollbar {
      width: 7px;
    }

    .atendilo-messages::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.4);
    }

    .atendilo-messages::-webkit-scrollbar-thumb {
      background: var(--atendilo-primary);
      border-radius: 999px;
    }

    .atendilo-message {
      display: flex;
      margin-bottom: 12px;
    }

    .atendilo-message.customer {
      justify-content: flex-end;
    }

    .atendilo-message.ai,
    .atendilo-message.agent {
      justify-content: flex-start;
    }

    .atendilo-bubble {
      max-width: 82%;
      border-radius: 16px;
      padding: 10px 12px;
      font-size: 13px;
      line-height: 1.42;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .atendilo-message.customer .atendilo-bubble {
      background: var(--atendilo-primary);
      color: white;
      border-bottom-right-radius: 6px;
    }

    .atendilo-message.ai .atendilo-bubble,
    .atendilo-message.agent .atendilo-bubble {
      background: #111827;
      color: #f8fafc;
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-bottom-left-radius: 6px;
    }

    .atendilo-bubble-label {
      display: block;
      color: rgba(226, 232, 240, 0.58);
      font-size: 11px;
      margin-bottom: 5px;
      font-weight: 700;
    }

    .atendilo-handoff-banner {
      margin: 8px 12px;
      padding: 10px 12px;
      border: 1px solid rgba(245, 158, 11, 0.35);
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.35;
      display: none;
    }

    .atendilo-handoff-banner strong {
      display: block;
      color: #fcd34d;
      font-size: 12px;
      margin-bottom: 2px;
    }

    .atendilo-handoff-banner span {
      display: block;
      color: rgba(253, 230, 138, 0.9);
    }

    .atendilo-composer {
      display: flex;
      gap: 8px;
      padding: 10px 12px 12px;
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      background: #070b14;
    }

    .atendilo-message-input {
      flex: 1;
      min-width: 0;
      height: 44px;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(2, 6, 23, 0.72);
      color: #ffffff;
      outline: none;
      padding: 0 12px;
      font-size: 13px;
    }

    .atendilo-send-btn {
      height: 44px;
      min-width: 72px;
      border-radius: 12px;
    }

    .atendilo-loading {
      padding: 10px 14px;
      color: rgba(226, 232, 240, 0.58);
      font-size: 12px;
    }

    .atendilo-hidden {
      display: none !important;
    }

    @media (max-width: 520px) {
      .atendilo-panel {
        right: 10px;
        left: 10px;
        bottom: 86px;
        width: auto;
        height: min(620px, calc(100vh - 110px));
      }

      .atendilo-launcher {
        right: 18px;
        bottom: 18px;
      }
    }
  `;

  function injectStyles(primaryColor) {
    if (document.getElementById("atendilo-widget-styles")) return;

    const style = document.createElement("style");
    style.id = "atendilo-widget-styles";
    style.textContent = styles;

    document.head.appendChild(style);
    document.documentElement.style.setProperty(
      "--atendilo-primary",
      primaryColor || "#ee82ee"
    );
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

  function createRoot() {
    const root = document.createElement("div");
    root.className = "atendilo-widget-root";
    root.innerHTML = `
      <button class="atendilo-launcher" type="button" aria-label="Open chat">
        ${botIconSvg()}
      </button>

      <section class="atendilo-panel" aria-label="Atendilo web chat">
        <header class="atendilo-header">
          <div class="atendilo-header-top">
            <div class="atendilo-avatar">
              ${botIconSvg()}
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

              <input class="atendilo-input atendilo-name" placeholder="Name *" autocomplete="name" />
              <input class="atendilo-input atendilo-phone" placeholder="Phone *" autocomplete="tel" />
              <input class="atendilo-input atendilo-email" placeholder="Email" autocomplete="email" />

              <button class="atendilo-start-btn" type="submit">Start chat</button>
            </form>
          </div>

          <div class="atendilo-messages"></div>

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
  const nameInput = $(".atendilo-name");
  const phoneInput = $(".atendilo-phone");
  const emailInput = $(".atendilo-email");
  const messagesEl = $(".atendilo-messages");
  const composer = $(".atendilo-composer");
  const messageInput = $(".atendilo-message-input");
  const sendBtn = $(".atendilo-send-btn");
  const handoffBanner = $(".atendilo-handoff-banner");

  function showPanel() {
    state.isOpen = true;
    panel.classList.add("open");
    setTimeout(() => messageInput?.focus(), 80);
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

  function renderChattingAs() {
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

    if (!showLeadForm) {
      renderChattingAs();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeSender(senderType) {
    if (senderType === "contact" || senderType === "customer" || senderType === "user") {
      return "customer";
    }

    if (senderType === "agent" || senderType === "profile") {
      return "agent";
    }

    return "ai";
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    if (!state.messages.length && state.config?.welcomeMessage) {
      appendMessage({
        sender_type: "ai",
        content: state.config.welcomeMessage,
        synthetic: true,
      });
      return;
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
        : `<span class="atendilo-bubble-label">${sender === "agent" ? "Agent" : escapeHtml(state.config?.widgetTitle || "AI")}</span>`;

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

  async function fetchJson(url, options) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Request failed");
    }

    return data;
  }

  async function loadConfig() {
    setLoading(true);

    try {
      const config = await fetchJson(endpoints.config);

      state.config = {
        businessId: config.businessId || BUSINESS_ID,
        channelId: config.channelId || null,
        status: config.status || "inactive",
        widgetTitle: config.widgetTitle || "Angela AI",
        welcomeMessage:
          config.welcomeMessage ||
          `Hi! Welcome to my business. How can I help you today?`,
        primaryColor: config.primaryColor || "#ee82ee",
        captureLeads:
          typeof config.captureLeads === "boolean" ? config.captureLeads : true,
      };

      injectStyles(state.config.primaryColor);

      titleEl.textContent = state.config.widgetTitle;
      subtitleEl.textContent = "Ask us anything. We usually reply instantly.";

      if (!state.config.captureLeads) {
        state.visitor = null;
      }

      updateUIByLeadMode();
      await loadMessages();
    } catch (error) {
      console.error("[Atendilo Widget] Config error:", error);
      injectStyles("#ee82ee");
      updateUIByLeadMode();
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    try {
      const params = new URLSearchParams({
        businessId: BUSINESS_ID,
        sessionId: state.sessionId,
      });

      const data = await fetchJson(`${endpoints.messages}?${params.toString()}`);

      state.conversationId = data.conversationId || state.conversationId;
      state.conversationStatus = data.status || state.conversationStatus;
      state.messages = Array.isArray(data.messages) ? data.messages : [];

      renderMessages();
      renderHandoffBanner();
    } catch (error) {
      console.error("[Atendilo Widget] Load messages error:", error);
    }
  }

  async function sendMessage(content) {
    const text = String(content || "").trim();
    if (!text || state.isSending) return;

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

    try {
      const data = await fetchJson(endpoints.send, {
        method: "POST",
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          sessionId: state.sessionId,
          message: text,
          visitor: state.visitor,
          clientMessageId: optimisticMessage.id,
        }),
      });

      state.conversationId = data.conversationId || state.conversationId;
      state.conversationStatus = data.status || state.conversationStatus;

      await loadMessages();

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
      setSending(false);
      messageInput.focus();
    }
  }

  async function endChat() {
    try {
      await fetchJson(endpoints.end, {
        method: "POST",
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          sessionId: state.sessionId,
          reason: "customer",
        }),
      });
    } catch (error) {
      console.error("[Atendilo Widget] End chat error:", error);
    }

    state.messages = [];
    state.conversationId = null;
    state.conversationStatus = null;
    state.visitor = null;
    state.sessionId = crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    renderHandoffBanner();
    updateUIByLeadMode();
    renderMessages();
    hidePanel();
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

    if (!name || !phone) {
      if (!name) nameInput.focus();
      else phoneInput.focus();
      return;
    }

    state.visitor = {
      name,
      phone,
      email: email || null,
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