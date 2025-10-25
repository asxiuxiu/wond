import './index.scss';
import type { WondGraphics } from '@wond/core';
import classNames from 'classnames';
import { type RowComponentProps } from 'react-window';

export interface LayerNodeData {
  data: WondGraphics;
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

const LayerNode = ({ index, style, nodes }: RowComponentProps<LayerNodeProps>) => {
  const node = nodes[index];
  if (!node) return null;
  return (
    <div
      className={classNames('layer-node', {
        selected: node.isSelected,
        hovered: node.isHovered,
      })}
      style={style}
    >
      <div className="layer-node-indent"></div>
      {node.data.attrs.name}
    </div>
  );
};

export default LayerNode;
