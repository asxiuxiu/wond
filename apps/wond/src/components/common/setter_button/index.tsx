import './index.scss';

export interface ISetterButtonProps {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const SetterButton = ({ icon, disabled, onClick, style }: ISetterButtonProps) => {
  return (
    <button className="wond-setter-button" style={style} disabled={disabled} onClick={onClick}>
      <span className="setter-button-icon">{icon}</span>
    </button>
  );
};
