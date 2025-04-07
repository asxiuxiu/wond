import './Editor.scss';
import LeftPanel from './LeftPanel/LeftPanel';
import RightPanel from './RightPanel/RightPanel';
import React, { useEffect } from 'react';
import { WondEditor } from '@wond/core';

const Editor: React.FC = () => {
  useEffect(() => {
    const editor = new WondEditor();
    console.log(editor);
  }, []);

  return (
    <div className="wond-editor">
      <LeftPanel />
      <div className="paint"></div>
      <RightPanel />
    </div>
  );
};

export default Editor;
