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

function applyThemeColors(theme: Theme, themeColors: CompanySettings['themeColors'] | null | undefined) {
  const colors = themeColors?.[theme] ?? DEFAULT_THEME_COLORS[theme]
  const root = document.documentElement

  root.style.setProperty('--primary', colors.primary)
  root.style.setProperty('--primary-foreground', colors.primaryForeground)
  root.style.setProperty('--primary-mid', colors.primaryMid)
  root.style.setProperty('--primary-light', colors.primaryLight)
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