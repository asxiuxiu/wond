import './index.scss';

export interface ISetterHeaderProps {
  title: string;
  headButtons?: React.ReactNode;
}

export const SetterHeader = ({ title, headButtons }: ISetterHeaderProps) => {
  return (
    <div className="wond-setter-header">
      <div className="setter-header-title">
        <span>{title}</span>
      </div>
      <div className="setter-header-head-buttons">{headButtons}</div>
    </div>
  );
};
