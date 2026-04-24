export const CONSULTATION_CHAT_EVENT = 'hok:consultation-chat'

export function requestConsultationChat(detail) {
  window.dispatchEvent(new CustomEvent(CONSULTATION_CHAT_EVENT, { detail }))
}