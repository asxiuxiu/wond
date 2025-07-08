import './Editor.scss';
import React, { useEffect, useRef } from 'react';
import { WondEditor } from '@wond/core';
import LeftPanel from './LeftPanel/index';
import RightPanel from './RightPanel/index';

// Extend Window interface
declare global {
  interface Window {
    editor: WondEditor;
  }
}

const Editor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const editor = new WondEditor({
      container: containerEl,
    });

    window.editor = editor;
  }, [containerRef]);

  return (
    <div className="wond-editor">
      <LeftPanel />
      <div className="canvas-container" ref={containerRef}></div>
      <RightPanel />
    </div>
  );
};

export default Editor;
