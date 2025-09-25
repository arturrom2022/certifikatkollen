// lib/favorites.ts
type FavoritesState = {
  projects: string[]
  employees: string[]
}

const KEY = "favorites:v1"

function read(): FavoritesState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as FavoritesState
  } catch {}
  return { projects: [], employees: [] }
}

function write(next: FavoritesState) {
  localStorage.setItem(KEY, JSON.stringify(next))
  // trigga UI-refresh om du redan lyssnar på "storage"
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }))
}

/* ---- Projekt ---- */
export function isFavoriteProject(id: string): boolean {
  return read().projects.includes(id)
}

export function toggleFavoriteProject(id: string): boolean {
  const cur = read()
  const exists = cur.projects.includes(id)
  const next = exists
    ? { ...cur, projects: cur.projects.filter((x) => x !== id) }
    : { ...cur, projects: [...cur.projects, id] }
  write(next)
  return !exists // returnerar nytt läge (true om nu favoriten är på)
}

/* ---- Anställd ---- */
export function isFavoriteEmployee(id: string): boolean {
  return read().employees.includes(id)
}

export function toggleFavoriteEmployee(id: string): boolean {
  const cur = read()
  const exists = cur.employees.includes(id)
  const next = exists
    ? { ...cur, employees: cur.employees.filter((x) => x !== id) }
    : { ...cur, employees: [...cur.employees, id] }
  write(next)
  return !exists
}

/* ---- Hämtning (översikten behöver detta) ---- */
export function getFavorites(): FavoritesState {
  return read()
}
