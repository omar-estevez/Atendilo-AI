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

  const STORAGE_KEY = `atendilo_webchat_session_${BUSINESS_ID}`;

  const endpoints = {
    config: `${API_BASE}/api/webchat/config/${BUSINESS_ID}`,
    messages: `${API_BASE}/api/webchat/messages`,
    send: `${API_BASE}/api/webchat/message`,
    end: `${API_BASE}/api/webchat/end`,
  };

  function createSessionId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function getSavedSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.sessionId) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  const savedSession = getSavedSession();

  const state = {
    config: null,
    isOpen: false,
    isLoading: false,
    isSending: false,
    sessionId: savedSession?.sessionId || createSessionId(),
    sessionVersion: 0,
    conversationId: savedSession?.conversationId || null,
    conversationStatus: savedSession?.conversationStatus || null,
    // FIX: messages es la fuente de verdad del servidor solamente
    messages: [],
    // FIX: pendingLocalId guarda el id del mensaje optimista mientras se envía
    pendingLocalId: null,
    visitor: savedSession?.visitor || null,
    pollingInterval: null,
  };

  function saveSession() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sessionId: state.sessionId,
          conversationId: state.conversationId,
          conversationStatus: state.conversationStatus,
          visitor: state.visitor,
        })
      );
    } catch (error) {
      console.warn("[Atendilo Widget] Could not save session:", error);
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { }
  }

  // ─── STYLES ────────────────────────────────────────────────────────────────

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

    .atendilo-widget-root {
      all: initial !important;
      position: relative !important;
      z-index: 2147483646 !important;
    }

    .atendilo-widget-root,
    .atendilo-widget-root * {
      box-sizing: border-box !important;
      font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif !important;
      letter-spacing: normal !important;
      text-transform: none !important;
      text-shadow: none !important;
      direction: ltr !important;
      writing-mode: horizontal-tb !important;
    }

    .atendilo-widget-root button,
    .atendilo-widget-root input,
    .atendilo-widget-root form {
      font: inherit !important;
    }

    /* ── LAUNCHER ── */
    .atendilo-launcher {
      position: fixed !important;
      right: 24px !important;
      bottom: 24px !important;
      width: 58px !important;
      height: 58px !important;
      border-radius: 18px !important;
      border: 0 !important;
      cursor: pointer !important;
      z-index: 2147483646 !important;
      background: var(--atendilo-primary) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 200ms cubic-bezier(.34,1.56,.64,1), box-shadow 200ms ease !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .atendilo-launcher:hover {
      transform: translateY(-3px) scale(1.06) !important;
      box-shadow: 0 16px 48px rgba(0,0,0,0.35) !important;
    }

    .atendilo-launcher:active {
      transform: scale(0.96) !important;
    }

    .atendilo-launcher img {
      width: 30px !important;
      height: 30px !important;
      max-width: 30px !important;
      max-height: 30px !important;
      object-fit: contain !important;
      display: block !important;
    }

    .atendilo-launcher svg {
      width: 27px !important;
      height: 27px !important;
      color: white !important;
      display: block !important;
    }

    /* ── PANEL ── */
    .atendilo-panel {
      position: fixed !important;
      right: 24px !important;
      bottom: 96px !important;
      width: 375px !important;
      height: 600px !important;
      max-height: calc(100vh - 120px) !important;
      z-index: 2147483646 !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      background: #0d1117 !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      box-shadow:
        0 0 0 1px rgba(0,0,0,0.4),
        0 32px 80px rgba(0,0,0,0.6),
        0 8px 24px rgba(0,0,0,0.3) !important;
      display: none !important;
      color: #e2e8f0 !important;
      transform-origin: bottom right !important;
    }

    .atendilo-panel.open {
      display: flex !important;
      flex-direction: column !important;
      animation: atendiloSlideIn 220ms cubic-bezier(.34,1.3,.64,1) !important;
    }

    @keyframes atendiloSlideIn {
      from { opacity: 0; transform: scale(0.92) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ── HEADER ── */
    .atendilo-header {
      padding: 16px 16px 13px !important;
      background: #111720 !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
      flex-shrink: 0 !important;
    }

    .atendilo-header-top {
      display: flex !important;
      align-items: center !important;
      gap: 11px !important;
    }

    .atendilo-avatar {
      width: 40px !important;
      height: 40px !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, color-mix(in srgb, var(--atendilo-primary) 25%, #0d1117), color-mix(in srgb, var(--atendilo-primary) 10%, #0d1117)) !important;
      border: 1px solid color-mix(in srgb, var(--atendilo-primary) 35%, transparent) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }

    .atendilo-avatar svg {
      width: 22px !important;
      height: 22px !important;
      color: var(--atendilo-primary) !important;
      display: block !important;
    }

    .atendilo-avatar img {
      width: 22px !important;
      height: 22px !important;
      max-width: 22px !important;
      max-height: 22px !important;
      object-fit: contain !important;
      display: block !important;
    }

    .atendilo-title-area {
      min-width: 0 !important;
      flex: 1 !important;
    }

    .atendilo-title {
      display: block !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      color: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
      letter-spacing: -0.01em !important;
    }

    .atendilo-subtitle {
      display: block !important;
      margin: 2px 0 0 !important;
      padding: 0 !important;
      font-size: 11.5px !important;
      font-weight: 400 !important;
      line-height: 1.3 !important;
      color: rgba(226,232,240,0.5) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .atendilo-minimize {
      width: 28px !important;
      height: 28px !important;
      border-radius: 8px !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      background: rgba(255,255,255,0.05) !important;
      color: rgba(226,232,240,0.6) !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 16px !important;
      line-height: 1 !important;
      padding: 0 !important;
      margin: 0 !important;
      transition: background 150ms, color 150ms !important;
    }

    .atendilo-minimize:hover {
      background: rgba(255,255,255,0.1) !important;
      color: #ffffff !important;
    }

    .atendilo-status-row {
      margin-top: 11px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    .atendilo-online {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      font-size: 11.5px !important;
      font-weight: 500 !important;
      color: rgba(226,232,240,0.65) !important;
      line-height: 1 !important;
    }

    .atendilo-online-dot {
      width: 7px !important;
      height: 7px !important;
      border-radius: 999px !important;
      background: #22c55e !important;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.18) !important;
      flex-shrink: 0 !important;
      animation: atendiloOnlinePulse 2.5s ease-in-out infinite !important;
    }

    @keyframes atendiloOnlinePulse {
      0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.18); }
      50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0.06); }
    }

    .atendilo-end-btn {
      border: 1px solid rgba(255,255,255,0.1) !important;
      background: rgba(255,255,255,0.04) !important;
      color: rgba(226,232,240,0.6) !important;
      font-size: 11.5px !important;
      font-weight: 500 !important;
      line-height: 1 !important;
      padding: 6px 11px !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      margin: 0 !important;
      white-space: nowrap !important;
      transition: all 150ms !important;
    }

    .atendilo-end-btn:hover {
      border-color: rgba(248,113,113,0.4) !important;
      color: #fca5a5 !important;
      background: rgba(239,68,68,0.08) !important;
    }

    /* ── CHATTING AS ── */
    .atendilo-chatting-as {
      padding: 7px 16px !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      background: rgba(255,255,255,0.02) !important;
      color: rgba(226,232,240,0.55) !important;
      font-size: 11px !important;
      font-weight: 400 !important;
      line-height: 1.3 !important;
      flex-shrink: 0 !important;
      display: block !important;
    }

    .atendilo-chatting-as strong {
      color: rgba(255,255,255,0.85) !important;
      font-weight: 600 !important;
    }

    /* ── BODY ── */
    .atendilo-body {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      background: #0d1117 !important;
    }

    /* ── LEAD FORM ── */
    .atendilo-lead-form-wrap {
      flex: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px 16px !important;
      min-height: 0 !important;
    }

    .atendilo-lead-form {
      width: 100% !important;
      max-width: 340px !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      background: rgba(255,255,255,0.03) !important;
      border-radius: 16px !important;
      padding: 20px 16px !important;
      margin: 0 !important;
      display: block !important;
    }

    .atendilo-lead-form h3 {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      color: #ffffff !important;
      letter-spacing: -0.02em !important;
    }

    .atendilo-lead-form p {
      display: block !important;
      margin: 5px 0 16px !important;
      padding: 0 !important;
      font-size: 12px !important;
      line-height: 1.5 !important;
      color: rgba(226,232,240,0.5) !important;
    }

    .atendilo-input {
      width: 100% !important;
      height: 42px !important;
      border-radius: 10px !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      background: rgba(255,255,255,0.05) !important;
      color: #ffffff !important;
      outline: none !important;
      padding: 0 13px !important;
      font-size: 13px !important;
      font-weight: 400 !important;
      line-height: 42px !important;
      margin: 0 0 10px !important;
      display: block !important;
      box-shadow: none !important;
      transition: border-color 150ms, background 150ms !important;
    }

    .atendilo-input:hover {
      border-color: rgba(255,255,255,0.18) !important;
      background: rgba(255,255,255,0.07) !important;
    }

    .atendilo-input::placeholder,
    .atendilo-message-input::placeholder {
      color: rgba(226,232,240,0.35) !important;
      opacity: 1 !important;
    }

    .atendilo-input:focus,
    .atendilo-message-input:focus {
      border-color: var(--atendilo-primary) !important;
      background: rgba(255,255,255,0.06) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--atendilo-primary) 15%, transparent) !important;
    }

    .atendilo-form-error {
      display: none !important;
      margin: 0 0 12px !important;
      padding: 9px 12px !important;
      border-radius: 10px !important;
      background: rgba(239,68,68,0.1) !important;
      border: 1px solid rgba(239,68,68,0.22) !important;
      color: #fca5a5 !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
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
      font-weight: 600 !important;
      font-size: 13px !important;
      border-radius: 10px !important;
      height: 42px !important;
      padding: 0 16px !important;
      line-height: 1 !important;
      margin: 0 !important;
      box-shadow: 0 2px 12px color-mix(in srgb, var(--atendilo-primary) 40%, transparent) !important;
      text-align: center !important;
      transition: opacity 150ms, transform 150ms, box-shadow 150ms !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
    }

    .atendilo-start-btn {
      width: 100% !important;
    }

    .atendilo-start-btn:hover,
    .atendilo-send-btn:hover {
      opacity: 0.88 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 18px color-mix(in srgb, var(--atendilo-primary) 45%, transparent) !important;
    }

    .atendilo-start-btn:active,
    .atendilo-send-btn:active {
      transform: translateY(0) scale(0.98) !important;
    }

    .atendilo-start-btn:disabled,
    .atendilo-send-btn:disabled {
      opacity: 0.55 !important;
      cursor: not-allowed !important;
      transform: none !important;
      box-shadow: none !important;
    }

    /* Spinner inside send button */
    .atendilo-send-spinner {
      width: 14px !important;
      height: 14px !important;
      border: 2px solid rgba(255,255,255,0.35) !important;
      border-top-color: #ffffff !important;
      border-radius: 50% !important;
      animation: atendiloSpin 0.65s linear infinite !important;
      flex-shrink: 0 !important;
      display: none !important;
    }

    .atendilo-send-btn.sending .atendilo-send-spinner {
      display: block !important;
    }

    .atendilo-send-btn.sending .atendilo-send-label {
      display: none !important;
    }

    @keyframes atendiloSpin {
      to { transform: rotate(360deg); }
    }

    /* ── MESSAGES ── */
    .atendilo-messages {
      flex: 1 !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      padding: 16px 14px 12px !important;
      scroll-behavior: smooth !important;
      display: block !important;
    }

    .atendilo-messages::-webkit-scrollbar {
      width: 4px !important;
    }

    .atendilo-messages::-webkit-scrollbar-track {
      background: transparent !important;
    }

    .atendilo-messages::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1) !important;
      border-radius: 999px !important;
    }

    .atendilo-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.2) !important;
    }

    .atendilo-message {
      display: flex !important;
      width: 100% !important;
      max-width: 100% !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 0 10px !important;
      padding: 0 !important;
      align-items: flex-end !important;
      clear: both !important;
      animation: atendiloMsgIn 200ms cubic-bezier(.25,.46,.45,.94) both !important;
    }

    @keyframes atendiloMsgIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .atendilo-message.customer {
      justify-content: flex-end !important;
    }

    .atendilo-message.ai,
    .atendilo-message.agent {
      justify-content: flex-start !important;
    }

    /* FIX: mensaje optimista (pendiente) se muestra con opacidad reducida */
    .atendilo-message.pending {
      opacity: 0.65 !important;
    }

    .atendilo-bubble {
      display: inline-flex !important;
      flex-direction: column !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: 78% !important;
      height: auto !important;
      min-height: 0 !important;
      border-radius: 16px !important;
      padding: 10px 13px !important;
      margin: 0 !important;
      font-size: 13.5px !important;
      line-height: 1.5 !important;
      white-space: normal !important;
      overflow-wrap: break-word !important;
      word-break: break-word !important;
      text-align: left !important;
      vertical-align: top !important;
    }

    .atendilo-message.customer .atendilo-bubble {
      background: var(--atendilo-primary) !important;
      color: white !important;
      border-radius: 16px 16px 4px 16px !important;
      max-width: 72% !important;
      font-weight: 500 !important;
      box-shadow: 0 2px 12px color-mix(in srgb, var(--atendilo-primary) 35%, transparent) !important;
    }

    .atendilo-message.ai .atendilo-bubble,
    .atendilo-message.agent .atendilo-bubble {
      background: #161d2a !important;
      color: #e2e8f0 !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      border-radius: 16px 16px 16px 4px !important;
      max-width: 78% !important;
    }

    .atendilo-bubble-label {
      display: block !important;
      color: rgba(226,232,240,0.45) !important;
      font-size: 10.5px !important;
      font-weight: 600 !important;
      letter-spacing: 0.04em !important;
      text-transform: uppercase !important;
      line-height: 1.2 !important;
      margin: 0 0 5px !important;
      padding: 0 !important;
      white-space: normal !important;
    }

    .atendilo-bubble-text {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      color: inherit !important;
      font-size: 13.5px !important;
      line-height: 1.5 !important;
      white-space: pre-wrap !important;
      overflow-wrap: break-word !important;
      word-break: break-word !important;
    }

    /* timestamp debajo de burbuja */
    .atendilo-bubble-time {
      display: block !important;
      font-size: 10px !important;
      color: rgba(226,232,240,0.3) !important;
      margin: 4px 0 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
      text-align: right !important;
    }

    .atendilo-message.ai .atendilo-bubble-time,
    .atendilo-message.agent .atendilo-bubble-time {
      text-align: left !important;
    }

    /* ── TYPING ── */
    .atendilo-typing {
      padding: 0 14px !important;
      flex-shrink: 0 !important;
    }

    .atendilo-typing .atendilo-message {
      margin-bottom: 10px !important;
      animation: none !important;
    }

    .atendilo-typing-bubble {
      width: fit-content !important;
      max-width: 130px !important;
      min-width: 72px !important;
    }

    .atendilo-typing-dots {
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      height: 16px !important;
    }

    .atendilo-typing-dots span {
      width: 5px !important;
      height: 5px !important;
      border-radius: 999px !important;
      background: rgba(226,232,240,0.5) !important;
      animation: atendiloTyping 1.1s infinite ease-in-out !important;
    }

    .atendilo-typing-dots span:nth-child(2) { animation-delay: 0.16s !important; }
    .atendilo-typing-dots span:nth-child(3) { animation-delay: 0.32s !important; }

    @keyframes atendiloTyping {
      0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
      40%           { opacity: 1;   transform: translateY(-3px); }
    }

    /* ── NETWORK ERROR BANNER ── */
    .atendilo-net-error {
      margin: 0 12px 8px !important;
      padding: 9px 13px !important;
      border-radius: 10px !important;
      background: rgba(239,68,68,0.1) !important;
      border: 1px solid rgba(239,68,68,0.22) !important;
      color: #fca5a5 !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      display: none !important;
      flex-shrink: 0 !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .atendilo-net-error.show {
      display: flex !important;
    }

    .atendilo-net-error-icon {
      flex-shrink: 0 !important;
      font-size: 14px !important;
    }

    /* ── HANDOFF BANNER ── */
    .atendilo-handoff-banner {
      margin: 8px 12px !important;
      padding: 10px 13px !important;
      border: 1px solid rgba(245,158,11,0.3) !important;
      background: rgba(245,158,11,0.08) !important;
      color: #fbbf24 !important;
      border-radius: 10px !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      display: none !important;
      flex-shrink: 0 !important;
    }

    .atendilo-handoff-banner strong {
      display: block !important;
      color: #fcd34d !important;
      font-size: 11.5px !important;
      font-weight: 700 !important;
      margin: 0 0 2px !important;
      padding: 0 !important;
    }

    .atendilo-handoff-banner span {
      display: block !important;
      color: rgba(253,230,138,0.85) !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* ── COMPOSER ── */
    .atendilo-composer {
      display: flex !important;
      gap: 8px !important;
      padding: 10px 12px !important;
      border-top: 1px solid rgba(255,255,255,0.06) !important;
      background: #111720 !important;
      flex-shrink: 0 !important;
      margin: 0 !important;
      align-items: center !important;
    }

    .atendilo-message-input {
      flex: 1 !important;
      min-width: 0 !important;
      width: 100% !important;
      height: 42px !important;
      border-radius: 10px !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      background: rgba(255,255,255,0.05) !important;
      color: #ffffff !important;
      outline: none !important;
      padding: 0 13px !important;
      font-size: 13px !important;
      line-height: 42px !important;
      margin: 0 !important;
      box-shadow: none !important;
      transition: border-color 150ms, background 150ms !important;
    }

    .atendilo-message-input:hover {
      border-color: rgba(255,255,255,0.18) !important;
      background: rgba(255,255,255,0.07) !important;
    }

    .atendilo-send-btn {
      height: 42px !important;
      min-width: 52px !important;
      border-radius: 10px !important;
      flex-shrink: 0 !important;
      padding: 0 14px !important;
    }

    .atendilo-hidden {
      display: none !important;
    }

    @media (max-width: 520px) {
      .atendilo-panel {
        right: 10px !important;
        left: 10px !important;
        bottom: 84px !important;
        width: auto !important;
        height: min(600px, calc(100vh - 106px)) !important;
      }

      .atendilo-launcher {
        right: 16px !important;
        bottom: 16px !important;
      }
    }
  `;

  // ─── STYLE INJECTION ───────────────────────────────────────────────────────

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
      primaryColor || "#2563eb"
    );
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

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

  function formatTime(dateStr) {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function botIconSvg() {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M7.2 8h9.6c1.77 0 3.2 1.43 3.2 3.2v4.1c0 1.77-1.43 3.2-3.2 3.2H7.2c-1.77 0-3.2-1.43-3.2-3.2v-4.1C4 9.43 5.43 8 7.2 8Z" stroke="currentColor" stroke-width="2"/>
        <path d="M8.7 13h.01M15.3 13h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <path d="M9.5 16c.7.45 1.55.7 2.5.7s1.8-.25 2.5-.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M4 12H2.5M21.5 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  function renderWidgetIcon() {
    if (ICON_URL) {
      return `<img src="${escapeAttribute(ICON_URL)}" alt="Atendilo AI" />`;
    }
    return botIconSvg();
  }

  function isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ─── DOM ──────────────────────────────────────────────────────────────────

  function createRoot() {
    const existingRoot = document.querySelector(".atendilo-widget-root");
    if (existingRoot) existingRoot.remove();

    const root = document.createElement("div");
    root.className = "atendilo-widget-root";

    root.innerHTML = `
      <button class="atendilo-launcher" type="button" aria-label="Open chat">
        ${renderWidgetIcon()}
      </button>

      <section class="atendilo-panel" aria-label="Atendilo chat">
        <header class="atendilo-header">
          <div class="atendilo-header-top">
            <div class="atendilo-avatar">${renderWidgetIcon()}</div>
            <div class="atendilo-title-area">
              <div class="atendilo-title">Angela AI</div>
              <div class="atendilo-subtitle">Ask us anything. We usually reply instantly.</div>
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
          <div class="atendilo-lead-form-wrap">
            <form class="atendilo-lead-form">
              <h3>Start your chat</h3>
              <p>Please enter your details so we can help you better.</p>
              <div class="atendilo-form-error"></div>
              <input class="atendilo-input atendilo-name" type="text" placeholder="Name *" autocomplete="name" />
              <input class="atendilo-input atendilo-phone" type="tel" placeholder="Phone *" autocomplete="tel" />
              <input class="atendilo-input atendilo-email" type="email" placeholder="Email *" autocomplete="email" />
              <button class="atendilo-start-btn" type="submit">Start chat</button>
            </form>
          </div>

          <div class="atendilo-messages atendilo-hidden"></div>

          <div class="atendilo-typing atendilo-hidden">
            <div class="atendilo-message ai">
              <div class="atendilo-bubble atendilo-typing-bubble">
                <span class="atendilo-bubble-label">Angela AI</span>
                <span class="atendilo-typing-dots">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          </div>

          <div class="atendilo-net-error">
            <span class="atendilo-net-error-icon">⚠</span>
            <span class="atendilo-net-error-text">Could not send message. Please try again.</span>
          </div>

          <div class="atendilo-handoff-banner">
            <strong>Human agent requested</strong>
            <span>A human agent will join the conversation soon. You can keep sending messages here.</span>
          </div>

          <form class="atendilo-composer atendilo-hidden">
            <input class="atendilo-message-input" type="text" placeholder="Type your message..." autocomplete="off" maxlength="2000" />
            <button class="atendilo-send-btn" type="submit">
              <span class="atendilo-send-label">Send</span>
              <span class="atendilo-send-spinner"></span>
            </button>
          </form>
        </main>
      </section>
    `;

    document.body.appendChild(root);
    return root;
  }

  injectStyles("#2563eb");

  const root = createRoot();
  const $ = (sel) => root.querySelector(sel);

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
  const netError = $(".atendilo-net-error");
  const netErrorText = $(".atendilo-net-error-text");
  const composer = $(".atendilo-composer");
  const messageInput = $(".atendilo-message-input");
  const sendBtn = $(".atendilo-send-btn");
  const handoffBanner = $(".atendilo-handoff-banner");

  let netErrorTimer = null;

  // ─── UI HELPERS ───────────────────────────────────────────────────────────

  function showPanel() {
    state.isOpen = true;
    panel.classList.add("open");
    setTimeout(() => {
      if (shouldShowLeadForm()) nameInput?.focus();
      else messageInput?.focus();
    }, 80);
    startPolling();
  }

  function hidePanel() {
    state.isOpen = false;
    panel.classList.remove("open");
    stopPolling();
  }

  function setLoading(value) {
    state.isLoading = value;
  }

  function setSending(value) {
    state.isSending = value;
    messageInput.disabled = value;
    if (value) {
      sendBtn.disabled = true;
      sendBtn.classList.add("sending");
    } else {
      sendBtn.disabled = false;
      sendBtn.classList.remove("sending");
    }
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

  function showNetError(message) {
    netErrorText.textContent = message || "Could not send message. Please try again.";
    netError.classList.add("show");
    if (netErrorTimer) clearTimeout(netErrorTimer);
    netErrorTimer = setTimeout(() => {
      netError.classList.remove("show");
    }, 5000);
  }

  function hideNetError() {
    netError.classList.remove("show");
    if (netErrorTimer) {
      clearTimeout(netErrorTimer);
      netErrorTimer = null;
    }
  }

  function showTyping() {
    const labelEl = typingEl?.querySelector(".atendilo-bubble-label");
    if (labelEl) labelEl.textContent = state.config?.widgetTitle || "AI";
    typingEl?.classList.remove("atendilo-hidden");
    scrollToBottom();
  }

  function hideTyping() {
    typingEl?.classList.add("atendilo-hidden");
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ─── SESSION ──────────────────────────────────────────────────────────────

  function isClosedConversationStatus(status) {
    const normalized = String(status || "").toLowerCase();
    return ["closed", "ended", "end", "finished", "resolved", "archived", "deleted"].includes(normalized);
  }

  function resetLocalSession() {
    clearSession();
    state.sessionVersion += 1;
    state.messages = [];
    state.pendingLocalId = null;
    state.conversationId = null;
    state.conversationStatus = null;
    state.visitor = null;
    state.sessionId = createSessionId();
    state.isSending = false;

    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (emailInput) emailInput.value = "";
    if (messageInput) messageInput.value = "";

    setLeadError("");
    hideTyping();
    hideNetError();
    setSending(false);
    renderHandoffBanner();
    updateUIByLeadMode();
    renderMessages();
  }

  // ─── VISITOR ──────────────────────────────────────────────────────────────

  function getVisitorLabel() {
    if (!state.visitor) return "Customer";
    const name = state.visitor.name?.trim();
    const phone = state.visitor.phone?.trim();
    const email = state.visitor.email?.trim();
    if (name && phone) return `${name} · ${phone}`;
    if (name && email) return `${name} · ${email}`;
    return name || phone || email || "Customer";
  }

  function getCleanVisitorPayload() {
    if (!state.visitor) return null;
    const name = String(state.visitor.name || "").trim();
    const phone = String(state.visitor.phone || "").trim();
    const email = String(state.visitor.email || "").trim();
    if (!name || !phone || !email || !isValidEmail(email)) return null;
    return { name, phone, email };
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  function shouldShowLeadForm() {
    return Boolean(state.config?.captureLeads) && !state.visitor;
  }

  function getWelcomeMessage() {
    return (
      state.config?.welcomeMessage ||
      state.config?.welcome_message ||
      "Hi! Welcome to my business. How can I help you today?"
    );
  }

  function normalizeSender(senderType) {
    if (["contact", "customer", "user"].includes(senderType)) return "customer";
    if (["agent", "profile"].includes(senderType)) return "agent";
    return "ai";
  }

  function appendMessage(message, isPending) {
    if (!message || !message.content) return;

    const sender = normalizeSender(message.sender_type);
    const item = document.createElement("div");
    item.className = `atendilo-message ${sender}${isPending ? " pending" : ""}`;
    if (message.id) item.dataset.msgId = String(message.id);

    const bubble = document.createElement("div");
    bubble.className = "atendilo-bubble";

    // Label (AI / Agent only)
    if (sender !== "customer") {
      const label = document.createElement("span");
      label.className = "atendilo-bubble-label";
      label.textContent = sender === "agent" ? "Agent" : (state.config?.widgetTitle || "AI");
      bubble.appendChild(label);
    }

    // Text
    const text = document.createElement("span");
    text.className = "atendilo-bubble-text";
    text.textContent = String(message.content || "").trim();
    bubble.appendChild(text);

    // Timestamp
    const time = document.createElement("span");
    time.className = "atendilo-bubble-time";
    time.textContent = formatTime(message.created_at);
    bubble.appendChild(time);

    item.appendChild(bubble);
    messagesEl.appendChild(item);
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    // Welcome message
    if (
      Boolean(getWelcomeMessage()) &&
      !shouldShowLeadForm() &&
      state.messages.length === 0 &&
      !state.pendingLocalId
    ) {
      appendMessage({ sender_type: "ai", content: getWelcomeMessage(), created_at: null });
    }

    // Server messages
    state.messages.forEach((msg) => appendMessage(msg, false));

    // FIX: Si hay un mensaje pendiente (optimista) Y el servidor todavía no lo devuelve,
    // lo mostramos al final como "pending" para evitar el parpadeo de doble-render.
    // Solo lo mostramos si no aparece ya entre los mensajes del servidor.
    if (state.pendingLocalId && state.pendingLocalMessage) {
      const alreadyInServer = state.messages.some(
        (m) => m.id === state.pendingLocalId || m.clientMessageId === state.pendingLocalId
      );
      if (!alreadyInServer) {
        appendMessage(state.pendingLocalMessage, true);
      }
    }

    scrollToBottom();
  }

  function renderHandoffBanner() {
    handoffBanner.style.display =
      state.conversationStatus === "pending" ? "block" : "none";
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

  // ─── API ──────────────────────────────────────────────────────────────────

  async function fetchJson(url, options) {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Invalid JSON from ${url}.`);
    }
    if (!response.ok) throw new Error(data?.message || data?.error || "Request failed");
    return data;
  }

  async function loadMessages() {
    const sessionId = state.sessionId;
    const sessionVersion = state.sessionVersion;

    try {
      const params = new URLSearchParams({ businessId: BUSINESS_ID, sessionId });
      const dataResponse = await fetchJson(`${endpoints.messages}?${params.toString()}`);

      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) return;

      const data = dataResponse || {};
      const newStatus =
        data.status || data.conversationStatus || data.conversation_status ||
        state.conversationStatus || null;

      if (isClosedConversationStatus(newStatus)) {
        resetLocalSession();
        return;
      }

      state.conversationId =
        data.conversationId || data.conversation_id || state.conversationId || null;
      state.conversationStatus = newStatus;
      state.messages = Array.isArray(data.messages) ? data.messages : [];

      saveSession();
      renderMessages();
      renderHandoffBanner();
    } catch (error) {
      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) return;
      console.error("[Atendilo Widget] Load messages error:", error);
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
      clearSession();
      updateUIByLeadMode();
      return;
    }

    const sessionId = state.sessionId;
    const sessionVersion = state.sessionVersion;

    hideNetError();
    setSending(true);

    // FIX: guardamos el mensaje pendiente en estado, NO en state.messages
    // Así loadMessages() no lo duplica cuando re-renderiza
    const localId = `local_${Date.now()}`;
    const pendingMsg = {
      id: localId,
      sender_type: "contact",
      content: text,
      created_at: new Date().toISOString(),
    };
    state.pendingLocalId = localId;
    state.pendingLocalMessage = pendingMsg;

    messageInput.value = "";
    renderMessages(); // muestra el optimista como .pending
    showTyping();

    try {
      const dataResponse = await fetchJson(endpoints.send, {
        method: "POST",
        body: JSON.stringify({
          businessId: BUSINESS_ID,
          sessionId,
          message: text,
          visitor: visitorPayload,
          clientMessageId: localId,
        }),
      });

      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) return;

      const data = dataResponse || {};
      const newStatus =
        data.status || data.conversationStatus || data.conversation_status ||
        state.conversationStatus || null;

      if (isClosedConversationStatus(newStatus)) {
        resetLocalSession();
        return;
      }

      state.conversationId =
        data.conversationId || data.conversation_id || state.conversationId || null;
      state.conversationStatus = newStatus;

      saveSession();

      // FIX: Antes de loadMessages, limpiamos el pendiente para que el render
      // final use solo los datos del servidor (sin duplicados)
      state.pendingLocalId = null;
      state.pendingLocalMessage = null;

      await loadMessages();
      hideTyping();

      // FIX: Solo añadimos data.reply si loadMessages NO lo trajo ya
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
      if (sessionId !== state.sessionId || sessionVersion !== state.sessionVersion) return;

      hideTyping();
      console.error("[Atendilo Widget] Send error:", error);

      // FIX: en caso de error, quitamos el pending y mostramos banner de error
      // en lugar de meter un mensaje AI falso al hilo
      state.pendingLocalId = null;
      state.pendingLocalMessage = null;
      renderMessages();

      showNetError("Could not send message. Please try again.");
    } finally {
      if (sessionId === state.sessionId && sessionVersion === state.sessionVersion) {
        hideTyping();
        setSending(false);
        messageInput.focus();
      }
    }
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
        widgetTitle: config.widgetTitle || config.widget_title || config.aiName || config.ai_name || "Angela AI",
        welcomeMessage: config.welcomeMessage || config.welcome_message || "Hi! Welcome to my business. How can I help you today?",
        primaryColor: config.primaryColor || config.primary_color || "#ee82ee",
        captureLeads:
          typeof config.captureLeads === "boolean" ? config.captureLeads :
            typeof config.capture_leads === "boolean" ? config.capture_leads : true,
      };

      injectStyles(state.config.primaryColor);
      titleEl.textContent = state.config.widgetTitle;
      subtitleEl.textContent = "Ask us anything. We usually reply instantly.";

      if (!state.config.captureLeads && !state.visitor) {
        state.visitor = { name: "Customer", phone: "", email: "" };
        saveSession();
      }

      updateUIByLeadMode();
      await loadMessages();
    } catch (error) {
      console.error("[Atendilo Widget] Config error:", error);

      state.config = {
        businessId: BUSINESS_ID, channelId: null, status: "active",
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

  async function endChat() {
    const oldSessionId = state.sessionId;
    stopPolling();
    clearSession();

    state.sessionVersion += 1;
    state.messages = [];
    state.pendingLocalId = null;
    state.pendingLocalMessage = null;
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
    hideNetError();
    setSending(false);

    chattingAs.innerHTML = "";
    chattingAs.classList.add("atendilo-hidden");

    renderHandoffBanner();
    updateUIByLeadMode();
    renderMessages();

    try {
      await fetchJson(endpoints.end, {
        method: "POST",
        body: JSON.stringify({ businessId: BUSINESS_ID, sessionId: oldSessionId, reason: "user" }),
      });
    } catch (error) {
      console.error("[Atendilo Widget] End chat error:", error);
    }

    if (state.isOpen) startPolling();
  }

  // ─── POLLING ──────────────────────────────────────────────────────────────

  function startPolling() {
    stopPolling();
    state.pollingInterval = window.setInterval(() => {
      // FIX: no polling mientras hay un mensaje en vuelo (evita render race)
      if (!state.isOpen || shouldShowLeadForm() || state.isSending) return;
      loadMessages();
    }, 3500);
  }

  function stopPolling() {
    if (state.pollingInterval) {
      window.clearInterval(state.pollingInterval);
      state.pollingInterval = null;
    }
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  launcher.addEventListener("click", () => {
    if (state.isOpen) hidePanel();
    else showPanel();
  });

  minimizeBtn.addEventListener("click", hidePanel);
  endBtn.addEventListener("click", endChat);

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    setLeadError("");

    if (!name) { setLeadError("Please enter your name."); nameInput.focus(); return; }
    if (!phone) { setLeadError("Please enter your phone number."); phoneInput.focus(); return; }
    if (!email) { setLeadError("Please enter your email."); emailInput.focus(); return; }
    if (!isValidEmail(email)) { setLeadError("Please enter a valid email address."); emailInput.focus(); return; }

    state.visitor = { name, phone, email };
    saveSession();
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

  window.addEventListener("beforeunload", stopPolling);

  // ─── INIT ─────────────────────────────────────────────────────────────────

  loadConfig();
})();