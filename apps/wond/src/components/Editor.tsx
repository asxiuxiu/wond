import './Editor.scss';
import React, { useEffect, useRef, useState } from 'react';
import { initWondEditor, type WondEditor } from '@wond/core';
import LeftPanel from './left_panel/index';
import RightPanel from './right_panel/index';
import { EditorContext } from '@/context/editor-context';
import { ToolBar } from './tool';

const Editor: React.FC = () => {
  const [editor, setEditor] = useState<WondEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    console.time('initWondEditor');
    initWondEditor({
      container: containerEl,
    })
      .then((editor) => {
        setEditor(editor);
        console.timeEnd('initWondEditor');
      })
      .catch((error) => {
        console.error('init wond editor failed', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [containerRef]);

  return (
    <EditorContext.Provider value={{ editor, loading }}>
      <div className="wond-editor">
        <LeftPanel />
        <div className="canvas-container" ref={containerRef}></div>
        <RightPanel />
        <ToolBar />
      </div>
    </EditorContext.Provider>
  );
};

export default Editor;
