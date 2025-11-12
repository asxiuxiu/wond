import './index.scss';
import { useEditor } from '@/context/useEditor';
import { useCallback, useEffect, useState } from 'react';
import { List } from 'react-window';
import { LayerNode, type LayerNodeData } from '../layer_node';
import type { IGraphics } from '@wond/core';

export const LayerTree = () => {
  const { editor, loading } = useEditor();
  const [layoutNodes, setLayoutNodes] = useState<LayerNodeData[]>([]);
  const [openedNodes, setOpenedNodes] = useState<Set<string>>(new Set());

  const toggleNodeOpened = useCallback(
    (nodeId: string, expanded: boolean) => {
      if (expanded && !openedNodes.has(nodeId)) {
        setOpenedNodes((prev) => new Set([...prev, nodeId]));
      } else if (!expanded && openedNodes.has(nodeId)) {
        setOpenedNodes((prev) => new Set([...prev].filter((id) => id !== nodeId)));
      }
    },
    [openedNodes],
  );

  useEffect(() => {
    if (!editor) return;

    const traverseTree = (node: IGraphics, flattenedNodes: LayerNodeData[], nestingLevel: number) => {
      const isOpened = openedNodes.has(node.attrs.id);

      flattenedNodes.push({
        data: node,
        nestingLevel,
        isSelected: editor.isNodeSelected(node.attrs.id),
        isHovered: editor.isNodeHovered(node.attrs.id),
        isVisible: node.attrs.visible,
        isLocked: node.attrs.locked,
        isOpened,
      });

      if (node.attrs.children && isOpened) {
        node.attrs.children.forEach((child) => {
          traverseTree(child, flattenedNodes, nestingLevel + 1);
        });
      }
    };

    const generateLayoutNodes = () => {
      const layoutTree = editor.getLayerTree();
      const layoutNodes: LayerNodeData[] = [];

      if (Array.isArray(layoutTree.attrs.children)) {
        for (const child of layoutTree.attrs.children) {
          traverseTree(child, layoutNodes, 0);
        }
      }
      setLayoutNodes(layoutNodes);
    };

    generateLayoutNodes();

    editor.on('onLayoutDirty', generateLayoutNodes);

    return () => {
      editor.off('onLayoutDirty', generateLayoutNodes);
    };
  }, [editor, openedNodes]);

  const handleLayersContentClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      editor?.setSelections([]);
    },
    [editor],
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="wond-layer-tree">
      <div className="layers-title">Layers</div>
      <div className="layers-content" onClick={handleLayersContentClick}>
        <List
          rowComponent={LayerNode}
          rowCount={layoutNodes.length}
          rowProps={{ nodes: layoutNodes, toggleNodeOpened }}
          rowHeight={32}
        />
      </div>
    </div>
  );
};
