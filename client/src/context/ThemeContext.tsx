// src/context/ThemeContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useCompanySettings } from '@/lib/use-company-settings'
import type { CompanySettings } from '@/types/company'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const DEFAULT_THEME_COLORS: CompanySettings['themeColors'] = {
  light: {
    primary: '#000063',
    primaryForeground: '#ffffff',
    primaryMid: '#0043b3',
    primaryLight: '#009dff'
  },
  dark: {
    primary: '#000063',
    primaryForeground: '#ffffff',
    primaryMid: '#0043b3',
    primaryLight: '#009dff'
  }
}

function normalizeHex(input: string | undefined | null) {
  const s = (input ?? '').trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s) ? s : null
}

function applyThemeColors(theme: Theme, themeColors: CompanySettings['themeColors'] | null | undefined) {
  const fallback = DEFAULT_THEME_COLORS[theme]
  const colors = themeColors?.[theme] ?? fallback

  const primary = normalizeHex(colors.primary) ?? fallback.primary
  const primaryForeground = normalizeHex(colors.primaryForeground) ?? fallback.primaryForeground
  const primaryMid = normalizeHex(colors.primaryMid) ?? fallback.primaryMid
  const primaryLight = normalizeHex(colors.primaryLight) ?? fallback.primaryLight

  const root = document.documentElement

  root.style.setProperty('--primary', primary)
  root.style.setProperty('--primary-foreground', primaryForeground)
  root.style.setProperty('--primary-mid', primaryMid)
  root.style.setProperty('--primary-light', primaryLight)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const { data: companySettings } = useCompanySettings()

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = storedTheme || systemPreference
    setTheme(initialTheme)
    setMounted(true)
  }, [])

  // Apply theme class and persist preference
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  // Apply company theme colors to CSS variables
  useEffect(() => {
    if (!mounted) return
    applyThemeColors(theme, companySettings?.themeColors)
  }, [theme, companySettings, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}