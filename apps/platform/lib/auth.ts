// lib/auth.ts
"use client"

export type CurrentUser = {
  id: string
  name: string
  email: string
  role: string // t.ex. "Admin", "Platschef", "HR"
}

// Nyckel i localStorage (byt om du vill)
const LS_USER_KEY = "currentUser"

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}
// lib/auth.ts
export function updateCurrentUserProfile(patch: Partial<CurrentUser>) {
  try {
    const raw = localStorage.getItem("currentUser")
    const cur = raw ? (JSON.parse(raw) as CurrentUser) : ({} as CurrentUser)
    const next = { ...cur, ...patch }
    localStorage.setItem("currentUser", JSON.stringify(next))
    // trigga UI-uppdatering
    window.dispatchEvent(new StorageEvent("storage", { key: "currentUser" }))
    return next
  } catch {
    // no-op
  }
}

// (Frivilligt) uppdatera användare
export function setCurrentUser(u: CurrentUser | null) {
  if (u) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(u))
  } else {
    localStorage.removeItem(LS_USER_KEY)
  }
  // trigga reaktivitet i appen
  window.dispatchEvent(new StorageEvent("storage", { key: LS_USER_KEY }))
}

// (Stub) Logga ut – byt mot riktig auth när du har det
export function signOut() {
  setCurrentUser(null)
  alert("Utloggning demo: här kan du koppla riktig auth senare.")
}
