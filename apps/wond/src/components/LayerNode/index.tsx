import './index.scss';
import type { WondGraphics } from '@wond/core';
import classNames from 'classnames';
import { type RowComponentProps } from 'react-window';
import lockedIcon from './locked.svg';

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
      <div className="layer-node-indent">
        <svg width={10} height={10}>
          <path d={node.data.getSvgString()} fill="none" strokeWidth={1} stroke="rgb(158, 158, 158)"></path>
        </svg>
      </div>
      <span className='layer-node-name'>{node.data.attrs.name}</span>
      {node.data.attrs.locked && <img src={lockedIcon} alt="locked" />}
    </div>
  );
};

export default LayerNode;
