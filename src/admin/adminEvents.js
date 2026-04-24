export const ADMIN_DATA_CHANGED_EVENT = 'admin:data-changed'

export function emitAdminDataChanged(detail) {
  window.dispatchEvent(new CustomEvent(ADMIN_DATA_CHANGED_EVENT, { detail }))
}

export function onAdminDataChanged(handler) {
  window.addEventListener(ADMIN_DATA_CHANGED_EVENT, handler)
  return () => window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, handler)
}