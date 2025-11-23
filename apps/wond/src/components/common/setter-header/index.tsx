import './index.scss';

export interface ISetterHeaderProps {
  title: string;
}

export const SetterHeader = ({ title }: ISetterHeaderProps) => {
  return (
    <div className="wond-setter-header">
      <div className="setter-header-title">
        <span>{title}</span>
      </div>
    </div>
  );
};
