import './index.scss';
import { useEditor } from '@/context/useEditor';
import { useEffect, useState } from 'react';
import type { ISetterCollection, ISetter, SetterType } from '@wond/core';
import { PositionSetter } from '../position_setter';

const SETTER_COMPONENT_MAP: Record<SetterType, React.ComponentType<{ setter: ISetter }>> = {
  position: PositionSetter as React.ComponentType<{ setter: ISetter }>,
  layout: () => <div>Layout Setter (TODO)</div>,
  appearance: () => <div>Appearance Setter (TODO)</div>,
  fill: () => <div>Fill Setter (TODO)</div>,
};

export const SetterCollection = () => {
  const { editor } = useEditor();
  const [setterCollection, setSetterCollection] = useState<ISetterCollection | null>(null);
  useEffect(() => {
    if (!editor) return;
    setSetterCollection(editor.getSetterCollection());
    const handle = () => {
      setSetterCollection(editor.getSetterCollection());
    };
    editor.on('onSetterCollectionChange', handle);
    return () => {
      editor.off('onSetterCollectionChange', handle);
    };
  }, [editor]);

  if (setterCollection == null) return null;

  return (
    <div className="wond-setter-collection">
      <div className="collection-header">
        <div className="collection-name">{setterCollection.name}</div>
      </div>
      <div className="collection-setters-content">
        {setterCollection.setters.map((setter, index) => {
          const SetterComponent = SETTER_COMPONENT_MAP[setter.type];
          if (!SetterComponent) {
            console.warn(`Unknown setter type: ${setter.type}`);
            return null;
          }
          return <SetterComponent key={`${setter.type}-${index}`} setter={setter} />;
        })}
      </div>
    </div>
  );
};
