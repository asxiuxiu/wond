import './Editor.scss';
import LeftPanel from './LeftPanel/LeftPanel';
import RightPanel from './RightPanel/RightPanel';
import React from 'react';
import { hello } from '@wond/core';

const Editor: React.FC = () => {
  return (
    <div className="wond-editor">
      <LeftPanel />
      <div className="paint">
        <p>{hello()}</p>
      </div>
      <RightPanel />
    </div>
  );
};

export default Editor;
