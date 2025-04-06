import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.scss'

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    )
}

export default ThemeToggle
