import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import './main.scss';
import Editor from './components/Editor';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Editor />
    </ThemeProvider>
  );
};

export default App;
