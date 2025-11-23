import './index.scss';
import { IconButton, InputPropertyAccessor, SetterFieldSet, SetterHeader } from '@/components/common';
import type { ILayoutSetter } from '@wond/core';
import { useEffect, useState } from 'react';
import { setterNumberPipe } from '@/utils';
import AspectRatioLockedIcon from './aspect_ratio_locked.svg?react';
import AspectRatioUnlockIcon from './aspect_ratio_unlock.svg?react';

export interface ILayoutSetterProps {
  setter: ILayoutSetter;
}

export const LayoutSetter = ({ setter }: ILayoutSetterProps) => {
  const [width, setWidth] = useState<number | 'Mixed'>(setter.width);
  const [height, setHeight] = useState<number | 'Mixed'>(setter.height);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState<boolean>(setter.isAspectRatioLocked);
  useEffect(() => {
    const handler = () => {
      setWidth(setter.mixed.has('width') ? 'Mixed' : setterNumberPipe(setter.width));
      setHeight(setter.mixed.has('height') ? 'Mixed' : setterNumberPipe(setter.height));
      setIsAspectRatioLocked(setter.mixed.has('isAspectRatioLocked') ? false : setter.isAspectRatioLocked);
    };
    setter.on('onDirty', handler);
    handler();
    return () => {
      setter.off('onDirty', handler);
    };
  }, [setter]);

  return (
    <div className="wond-layout-setter">
      <SetterHeader title={setter.title} />
      <SetterFieldSet title={'Layout'}>
        <>
          <InputPropertyAccessor
            style={{ gridArea: 'input1' }}
            prefix="W"
            value={width}
            onValueChange={(value) => setter.setWidth(+value)}
          />
          <InputPropertyAccessor
            style={{ gridArea: 'input2' }}
            prefix="H"
            value={height}
            onValueChange={(value) => setter.setHeight(+value)}
          />
          <IconButton
            style={{ gridArea: 'icon' }}
            icon={isAspectRatioLocked ? <AspectRatioLockedIcon /> : <AspectRatioUnlockIcon />}
            active={isAspectRatioLocked}
            onClick={() => setter.setIsAspectRatioLocked(!isAspectRatioLocked)}
          />
        </>
      </SetterFieldSet>
    </div>
  );
};
