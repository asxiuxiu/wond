import { WondToolType } from '@wond/core';
import MoveToolIcon from '@/assets/icons/move.svg?react';
import RectangleToolIcon from '@/assets/icons/rect.svg?react';
import HandToolIcon from '@/assets/icons/hand.svg?react';

export interface ToolConfig {
  name: string;
  hotkey: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  toolType: WondToolType;
}

export const ToolConfig: ToolConfig[][] = [
  [
    {
      name: 'Move',
      hotkey: 'M',
      icon: MoveToolIcon,
      toolType: WondToolType.Move,
    },
    {
      name: 'Hand tool',
      hotkey: 'H',
      icon: HandToolIcon,
      toolType: WondToolType.Hand,
    },
  ],
  [
    {
      name: 'Rectangle',
      hotkey: 'R',
      icon: RectangleToolIcon,
      toolType: WondToolType.DrawRect,
    },
  ],
];
