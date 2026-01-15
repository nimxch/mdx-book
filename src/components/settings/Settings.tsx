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

export function Settings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily } = useSettings()
  if (!isOpen) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <Card className="fixed top-[72px] right-6 w-80 z-50 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Profile & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </>
  )
}
