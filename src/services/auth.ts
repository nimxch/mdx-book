import { db, type User } from "@/lib/db"

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ""
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin + "/callback"

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

export function initiateOAuth(): void {
  const scope = "repo read:user"
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&allow_signup=true`
  window.location.href = url
}

export async function handleOAuthCallback(code: string): Promise<User> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange code for token")
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return loginWithToken(data.access_token)
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
