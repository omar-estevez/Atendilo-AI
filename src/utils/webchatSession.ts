const WEBCHAT_SESSION_KEY = "Atendilo_webchat_session_id";

export function getOrCreateWebchatSessionId() {
    const existingSessionId = localStorage.getItem(WEBCHAT_SESSION_KEY);

    if (existingSessionId) {
        return existingSessionId;
    }

    const newSessionId = crypto.randomUUID();

    localStorage.setItem(WEBCHAT_SESSION_KEY, newSessionId);

    return newSessionId;
}