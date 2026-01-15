import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Theme = "light" | "dark" | "sepia"
export type FontSize = "sm" | "md" | "lg" | "xl"
export type FontFamily = "serif" | "sans" | "mono"

interface SettingsContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  fontFamily: FontFamily
  setFontFamily: (family: FontFamily) => void
}

const defaultSettings: SettingsContextType = {
  theme: "light",
  setTheme: () => {},
  fontSize: "md",
  setFontSize: () => {},
  fontFamily: "serif",
  setFontFamily: () => {},
}

const SettingsContext = createContext<SettingsContextType>(defaultSettings)

export function useSettings() {
  return useContext(SettingsContext)
}

const themeStorageKey = "book-reader-theme"
const fontSizeStorageKey = "book-reader-font-size"
const fontFamilyStorageKey = "book-reader-font-family"

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(themeStorageKey) as Theme) || "light"
    }
    return "light"
  })

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(fontSizeStorageKey) as FontSize) || "md"
    }
    return "md"
  })

  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(fontFamilyStorageKey) as FontFamily) || "serif"
    }
    return "serif"
  })

  useEffect(() => {
    localStorage.setItem(themeStorageKey, theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(fontSizeStorageKey, fontSize)
    document.documentElement.setAttribute("data-font-size", fontSize)
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem(fontFamilyStorageKey, fontFamily)
    document.documentElement.setAttribute("data-font-family", fontFamily)
  }, [fontFamily])

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
