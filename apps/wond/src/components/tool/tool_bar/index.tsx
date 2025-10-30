import { useEditor } from '@/context/useEditor';
import './index.scss';
import { ToolGroup } from '../tool_group';
import { ToolConfig } from '../tool_config';

export const ToolBar = () => {
  const { loading } = useEditor();
  if (loading) {
    return <></>;
  }

  return (
    <div className="wond-tool-bar">
      <div className="tool-bar-box">
        {ToolConfig.map((toolGroup, index) => (
          <ToolGroup key={index} tools={toolGroup} />
        ))}
      </div>
    </div>
  );
};
