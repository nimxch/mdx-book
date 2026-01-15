import { useState } from "react"
import { Settings as SettingsIcon, Sun, Moon, BookOpen, Type, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings, type Theme, type FontSize, type FontFamily } from "@/context/SettingsContext"

const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "sepia", label: "Sepia", icon: BookOpen },
]

const fontSizes: { id: FontSize; label: string; size: string }[] = [
  { id: "sm", label: "Small", size: "14px" },
  { id: "md", label: "Medium", size: "16px" },
  { id: "lg", label: "Large", size: "18px" },
  { id: "xl", label: "Extra Large", size: "20px" },
]

const fontFamilies: { id: FontFamily; label: string; css: string }[] = [
  { id: "serif", label: "Serif", css: "font-serif" },
  { id: "sans", label: "Sans Serif", css: "font-sans" },
  { id: "mono", label: "Monospace", css: "font-mono" },
]

import { logout } from "@/services/auth"
import { LogOut, AlertTriangle } from "lucide-react"

export function Settings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily } = useSettings()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  if (!isOpen) return null

  // Confirmation Modal Overlay
  if (showLogoutConfirm) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
        <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 lg:w-96 z-[70] shadow-2xl border-destructive/20 animate-in fade-in zoom-in duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Clear all data?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will log you out and <strong>permanently delete</strong> all downloaded books, bookmarks, and local data from this device.
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Yes, Clear Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <Card className="fixed top-[72px] right-6 w-80 z-50 shadow-xl animate-in slide-in-from-bottom-2 duration-200 border-border bg-popover text-popover-foreground">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Profile & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                      theme === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {fontSizes.map((fs) => (
                <button
                  key={fs.id}
                  onClick={() => setFontSize(fs.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    fontSize === fs.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                  style={{ fontSize: fs.size }}
                >
                  Aa
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Font Family</label>
            <div className="space-y-2">
              {fontFamilies.map((ff) => (
                <button
                  key={ff.id}
                  onClick={() => setFontFamily(ff.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                    fontFamily === ff.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className={ff.css}>{ff.label}</span>
                  {fontFamily === ff.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6">
             <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
