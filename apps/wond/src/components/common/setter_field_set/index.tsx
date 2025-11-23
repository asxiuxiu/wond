import './index.scss';

export interface ISetterFieldSetProps {
  title: string;
  children: React.ReactNode;
}

export const SetterFieldSet: React.FC<ISetterFieldSetProps> = ({ title, children }) => {
  return (
    <fieldset className="wond-setter-field-set">
      <legend className="setter-field-set-title">
        <span>{title}</span>
      </legend>
      {children}
    </fieldset>
  );
};
