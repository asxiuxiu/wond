import { useState } from 'react';
import { SetterCollection, ZoomSetter } from '../setters';
import './index.scss';
import classNames from 'classnames';
import { useEditor } from '@/context/useEditor';

export interface RightPanelTab {
  key: string;
  title: string;
  content: React.ReactNode | null;
}

const tabs: RightPanelTab[] = [
  {
    key: 'design',
    title: 'Design',
    content: <SetterCollection />,
  },
  {
    key: 'prototype',
    title: 'Prototype',
    content: null,
  },
];

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState<RightPanelTab>(tabs[0]);
  const { loading } = useEditor();
  return (
    <div className="wond-right-panel">
      {loading ? null : (
        <>
          <div className="tabs-title-row">
            <div className="tabs-title-content">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={classNames('tab-title-button', { active: activeTab.key === tab.key })}
                  onClick={() => setActiveTab(tab)}
                >
                  <span className="tab-title-strong-hidden">{tab.title}</span>
                  <span>{tab.title}</span>
                </button>
              ))}
            </div>
            <ZoomSetter />
          </div>
          <div className="tabs-content">{activeTab.content}</div>
        </>
      )}
    </div>
  );
};

export default RightPanel;
