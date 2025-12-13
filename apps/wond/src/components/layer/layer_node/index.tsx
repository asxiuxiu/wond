import './index.scss';
import type { IGraphics } from '@wond/core';
import classNames from 'classnames';
import { type RowComponentProps } from 'react-window';
import { useEditor } from '@/context/useEditor';
import LockedIcon from '@/assets/icons/locked.svg?react';
import UnlockedIcon from '@/assets/icons/unlocked.svg?react';
import InvisibleIcon from '@/assets/icons/invisible.svg?react';
import VisibleIcon from '@/assets/icons/visible.svg?react';
import { useCallback } from 'react';

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

  const handleLayoutNodeClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (event.ctrlKey) {
        editor?.toggleSelection(node.data.attrs.id);
      } else {
        editor?.setSelections([node.data.attrs.id]);
      }
    },
    [editor, node],
  );

  const handleLayoutNodeMouseEnter = useCallback(() => {
    editor?.setHoverNode(node.data.attrs.id);
  }, [editor, node]);

  const handleLayoutNodeMouseLeave = useCallback(() => {
    editor?.setHoverNode(null);
  }, [editor]);

  const handleLayoutNodeLockButtonClick = useCallback(() => {
    editor?.setNodeLocked(node.data.attrs.id, !node.isLocked);
  }, [editor, node]);

  const handleLayoutNodeVisibilityButtonClick = useCallback(() => {
    editor?.setNodeVisibility(node.data.attrs.id, !node.isVisible);
  }, [editor, node]);

  return (
    <div
      className={classNames('wond-layer-node', {
        selected: node.isSelected,
        hovered: node.isHovered,
        invisible: !node.isVisible,
        locked: node.isLocked,
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
      <span className="suffix-button-wrapper">
        <button className="icon-button lock" onClick={handleLayoutNodeLockButtonClick}>
          {node.isLocked ? <LockedIcon width={16} height={16} /> : <UnlockedIcon width={16} height={16} />}
        </button>
      </span>
      <span className="suffix-button-wrapper">
        <button className="icon-button visibility" onClick={handleLayoutNodeVisibilityButtonClick}>
          {node.isVisible ? <VisibleIcon width={16} height={16} /> : <InvisibleIcon width={16} height={16} />}
        </button>
      </span>
    </div>
  );
};
