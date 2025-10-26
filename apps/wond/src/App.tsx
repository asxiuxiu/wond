import React, { useState } from 'react';
import './main.scss';
import Editor from './components/Editor';

const App: React.FC = () => {
  const [load, setLoad] = useState(false);

  if (load) {
    return <Editor />;
  } else {
    return <button onClick={() => setLoad(true)}>Load Editor</button>;
  }
};

export default App;
