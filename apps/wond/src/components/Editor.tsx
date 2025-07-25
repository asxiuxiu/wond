import './Editor.scss';
import React, { useEffect, useRef } from 'react';
import { initWondEditor, type WondEditor } from '@wond/core';
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

    console.time('initWondEditor');
    initWondEditor({
      container: containerEl,
    }).then((editor) => {
      window.editor = editor;
      console.timeEnd('initWondEditor');
    });
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
