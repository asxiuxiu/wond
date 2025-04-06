import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import './main.scss'
import Editor from './components/Editor'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ThemeToggle />
            <Editor />
        </ThemeProvider>
    )
}

export default App
