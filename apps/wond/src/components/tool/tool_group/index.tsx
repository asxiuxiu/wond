import './index.scss';
import type { ToolConfig } from '../tool_config';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useEditor } from '@/context/useEditor';
import { WondToolType } from '@wond/core';

export interface ToolGroupProps {
  tools: ToolConfig[];
}

export const ToolGroup = ({ tools }: ToolGroupProps) => {
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);
  const [editorActiveToolType, setEditorActiveToolType] = useState<WondToolType | null>(null);

  const { editor } = useEditor();
  useEffect(() => {
    if (tools.length > 0) {
      setActiveTool(tools[0]);
    }
  }, [tools]);

  useEffect(() => {
    if (editor) {
      setEditorActiveToolType(editor.getActiveToolType());
    }

    editor?.on('onActiveToolChange', setEditorActiveToolType);

    return () => {
      editor?.off('onActiveToolChange', setEditorActiveToolType);
    };
  }, [editor]);

  if (activeTool === null) {
    return <></>;
  }
  return (
    <div className="wond-tool-group">
      <button
        className={classNames('group-active-tool', {
          'editor-active': activeTool.toolType === editorActiveToolType,
        })}
        onClick={() => {
          editor?.setActiveToolType(activeTool.toolType);
        }}
      >
        <activeTool.icon width={24} height={24} />
      </button>

      {tools.length > 1 && <button className="tool-group-flyout"></button>}
    </div>
  );
};
