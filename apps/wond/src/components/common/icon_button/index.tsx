import './index.scss';
import classNames from 'classnames';

export interface IIconButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const IconButton = ({ icon, active, onClick, style }: IIconButtonProps) => {
  return (
    <button className={classNames('wond-icon-button', { active })} onClick={onClick} style={style}>
      <span className="icon-button-icon">{icon}</span>
    </button>
  );
};
