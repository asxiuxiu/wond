import './index.scss';
import type { IGraphics } from '@wond/core';
import classNames from 'classnames';
import { type RowComponentProps } from 'react-window';
import lockedIcon from './locked.svg';
import { useEditor } from '@/context/useEditor';

export interface LayerNodeData {
  data: IGraphics;
  nestingLevel: number;
  isSelected: boolean;
  isHovered: boolean;
  isVisible: boolean;
  isLocked: boolean;
  isOpened: boolean;
}

interface LayerNodeProps {
  nodes: LayerNodeData[];
  toggleNodeOpened: (nodeId: string, expanded: boolean) => void;
}

export const LayerNode = ({ index, style, nodes }: RowComponentProps<LayerNodeProps>) => {
  const node = nodes[index];
  const { editor } = useEditor();
  if (!node) return null;

  const handleLayoutNodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.ctrlKey) {
      editor?.toggleSelection(node.data.attrs.id);
    } else {
      editor?.setSelections([node.data.attrs.id]);
    }
  };

  const handleLayoutNodeMouseEnter = () => {
    editor?.setHoverNode(node.data.attrs.id);
  };

  const handleLayoutNodeMouseLeave = () => {
    editor?.setHoverNode(null);
  };

  return (
    <div
      className={classNames('wond-layer-node', {
        selected: node.isSelected,
        hovered: node.isHovered,
      })}
      style={style}
      onClick={handleLayoutNodeClick}
      onMouseEnter={handleLayoutNodeMouseEnter}
      onMouseLeave={handleLayoutNodeMouseLeave}
    >
      <div className="layer-node-indent">
        <svg width={10} height={10}>
          <path d={node.data.getSvgString()} fill="none" strokeWidth={1} stroke="currentColor"></path>
        </svg>
      </div>
      <span className="layer-node-name">{node.data.attrs.name}</span>
      {node.data.attrs.locked && <img src={lockedIcon} alt="locked" />}
    </div>
  );
};
