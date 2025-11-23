import { useEffect, useState } from 'react';
import './index.scss';
import { useEditor } from '@/context/useEditor';

export const ZoomSetter = () => {
  const { editor } = useEditor();
  const [zoom, setZoom] = useState(0);
  useEffect(() => {
    if (!editor) return;
    setZoom(editor.getZoom());
    const handle = () => {
      setZoom(editor.getZoom());
    };
    editor.on('onViewSpaceMetaChange', handle);
    return () => {
      editor.off('onViewSpaceMetaChange', handle);
    };
  }, [editor]);
  return <div className="wond-zoom-setter">{`${Math.round(zoom * 100)}%`}</div>;
};
