import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export function normalizeAuthUser(user) {
  if (!user) return null

  const normalizedRole = typeof user.role === 'string'
    ? user.role.trim().toLowerCase()
    : (user.is_admin || user.isAdmin ? 'admin' : 'customer')

  return {
    ...user,
    role: normalizedRole,
  }
}

export function isAdminUser(user) {
  return normalizeAuthUser(user)?.role === 'admin'
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user: normalizeAuthUser(user), token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        user: normalizeAuthUser(persistedState?.user ?? currentState.user),
      }),
    }
  )
)
