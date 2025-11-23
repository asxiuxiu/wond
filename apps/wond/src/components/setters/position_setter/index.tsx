import './index.scss';
import { InputPropertyAccessor, SetterButton, SetterFieldSet, SetterHeader } from '@/components/common';
import type { IPositionSetter } from '@wond/core';
import { useEffect, useState } from 'react';
import Rotate90RightIcon from './rotate_90_right.svg?react';
import FlipHorizontalIcon from './flip_horizontal.svg?react';
import FlipVerticalIcon from './flip_vertical.svg?react';
import { setterNumberPipe } from '@/utils';

export interface IPositionSetterProps {
  setter: IPositionSetter;
}

export const PositionSetter = ({ setter }: IPositionSetterProps) => {
  const [x, setX] = useState<number | 'Mixed'>(setter.x);
  const [y, setY] = useState<number | 'Mixed'>(setter.y);
  const [rotation, setRotation] = useState<number | 'Mixed'>(setter.rotation);
  useEffect(() => {
    const handler = () => {
      setX(setter.mixed.has('x') ? 'Mixed' : setterNumberPipe(setter.x));
      setY(setter.mixed.has('y') ? 'Mixed' : setterNumberPipe(setter.y));
      setRotation(setter.mixed.has('rotation') ? 'Mixed' : setterNumberPipe(setter.rotation));
    };
    setter.on('onDirty', handler);
    handler();
    return () => {
      setter.off('onDirty', handler);
    };
  }, [setter]);

  return (
    <div className="wond-position-setter">
      <SetterHeader title={setter.title} />
      <SetterFieldSet title={'Position'}>
        <>
          <InputPropertyAccessor
            style={{ gridArea: 'input1' }}
            prefix="X"
            value={x}
            onValueChange={(value) => setter.setX(+value)}
          />
          <InputPropertyAccessor
            style={{ gridArea: 'input2' }}
            prefix="Y"
            value={y}
            onValueChange={(value) => setter.setY(+value)}
          />
        </>
      </SetterFieldSet>
      <SetterFieldSet title={'Rotation'}>
        <>
          <InputPropertyAccessor
            style={{ gridArea: 'input1' }}
            prefix="R"
            value={rotation}
            valueUnit="°"
            onValueChange={(value) => setter.setRotation(+value)}
          />
          <div className="rotation-buttons" style={{ gridArea: 'input2' }}>
            <SetterButton
              style={{ flex: 1, borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
              icon={<Rotate90RightIcon />}
              onClick={() => setter.rotate90()}
            />
            <SetterButton style={{ flex: 1 }} icon={<FlipHorizontalIcon />} onClick={() => setter.flipHorizontal()} />
            <SetterButton
              style={{ flex: 1, borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
              icon={<FlipVerticalIcon />}
              onClick={() => setter.flipVertical()}
            />
          </div>
        </>
      </SetterFieldSet>
    </div>
  );
};
