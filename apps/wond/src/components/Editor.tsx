import './Editor.scss';
import React, { useEffect, useRef, useState } from 'react';
import { initWondEditor, type WondEditor } from '@wond/core';
import LeftPanel from './LeftPanel/index';
import RightPanel from './RightPanel/index';
import { EditorContext } from '../context/editor-context';

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
      </div>
    </EditorContext.Provider>
  );
};

export default Editor;
