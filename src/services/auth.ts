import { db, type User } from "@/lib/db"



export interface GitHubUser {
  id: number
  login: string
  name: string
  avatar_url: string
}

export async function getStoredUser(): Promise<User | null> {
  const users = await db.users.toArray()
  return users[0] || null
}

export async function saveUser(user: User): Promise<void> {
  await db.users.clear()
  await db.users.add(user)
}

export async function logout(): Promise<void> {
  // Clear all IndexedDB tables to remove all cached data
  await Promise.all([
    db.users.clear(),
    db.cachedRepos.clear(),
    db.cachedChapters.clear(),
    db.cachedPages.clear(),
    db.downloadProgress.clear(),
    db.bookmarks.clear(),
  ])

  // Clear all app specific local storage
  localStorage.removeItem("github_token")
  localStorage.removeItem("book-reader-user")
  localStorage.removeItem("book-reader-current-book")
  localStorage.removeItem("book-reader-current-chapter")
  
  // Clear settings to enforce default (light mode) state on logout
  localStorage.removeItem("book-reader-theme")
  localStorage.removeItem("book-reader-font-size")
  localStorage.removeItem("book-reader-font-family")
}

// Token management
export function getAccessToken(): string | null {
  return localStorage.getItem("github_token")
}

export function setAccessToken(token: string): void {
  localStorage.setItem("github_token", token)
}

export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid or expired token")
    }
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }

  return response.json()
}

export async function loginWithToken(token: string): Promise<User> {
  const githubUser = await fetchGitHubUser(token)

  const user: User = {
    id: githubUser.id,
    login: githubUser.login,
    name: githubUser.name || githubUser.login,
    avatar_url: githubUser.avatar_url,
    accessToken: token,
  }

  await saveUser(user)
  setAccessToken(token)

  return user
}

export async function loginAsGuest(): Promise<User> {
  const user: User = {
    id: 0,
    login: "guest",
    name: "Guest User",
    avatar_url: "https://ui-avatars.com/api/?name=Guest+User&background=random",
    accessToken: "",
  }

  await saveUser(user)
  // Ensure we don't have a token stored
  localStorage.removeItem("github_token")
  
  return user
}

export function openGitHubTokenPage(): void {
  const description = "MDX Book Reader Access"
  const scopes = "repo,read:user"
  const url = `https://github.com/settings/tokens/new?description=${encodeURIComponent(description)}&scopes=${encodeURIComponent(scopes)}`
  window.open(url, '_blank')
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
