import './index.scss';
import { IconButton, InputPropertyAccessor, SetterFieldSet, SetterHeader } from '@/components/common';
import type { IAppearanceSetter } from '@wond/core';
import { useEffect, useState } from 'react';
import VisibleIcon from '@/assets/icons/visible.svg?react';
import InvisibleIcon from '@/assets/icons/invisible.svg?react';
import OpacityIcon from '@/assets/icons/opacity.svg?react';
import { setterNumberPipe } from '@/utils';

export interface IAppearanceSetterProps {
  setter: IAppearanceSetter;
}

export const AppearanceSetter = ({ setter }: IAppearanceSetterProps) => {
  const [visible, setVisible] = useState<boolean>(setter.visible);
  const [opacity, setOpacity] = useState<number>(setter.opacity);
  useEffect(() => {
    const handler = () => {
      setVisible(setter.visible);
      setOpacity(setterNumberPipe(setter.opacity * 100));
    };
    setter.on('onDirty', handler);
    handler();
    return () => {
      setter.off('onDirty', handler);
    };
  }, [setter]);

  return (
    <div className="wond-appearance-setter">
      <SetterHeader
        title={setter.title}
        headButtons={
          <IconButton
            icon={visible ? <VisibleIcon width={16} height={16} /> : <InvisibleIcon width={16} height={16} />}
            active={!visible}
            onClick={() => setter.setVisible(!visible)}
          />
        }
      />
      <SetterFieldSet title={'Opacity'}>
        <>
          <InputPropertyAccessor
            style={{ gridArea: 'input1' }}
            prefix={<OpacityIcon width={24} height={24} />}
            value={opacity}
            valueUnit="%"
            onValueChange={(value) => setter.setOpacity(+value / 100)}
          />
        </>
      </SetterFieldSet>
    </div>
  );
};
