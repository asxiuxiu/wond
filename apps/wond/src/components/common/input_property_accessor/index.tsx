import React, { useState, useEffect } from 'react';
import './index.scss';

export interface IInputPropertyAccessorProps {
  prefix: string | React.ReactNode;
  value: string | number;
  valueUnit?: string;
  onValueChange: (value: string) => void;
  style?: React.CSSProperties;
}

export const InputPropertyAccessor = ({
  prefix,
  value,
  valueUnit,
  onValueChange,
  style,
}: IInputPropertyAccessorProps) => {
  const [inputValue, setInputValue] = useState(`${value}${valueUnit || ''}`);

  useEffect(() => {
    setInputValue(`${value}${valueUnit || ''}`);
  }, [value, valueUnit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const submitValue = () => {
    if (Number.isNaN(+inputValue)) {
      setInputValue(`${value}${valueUnit || ''}`);
      return;
    }
    onValueChange(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="wond-input-property-accessor" style={style}>
      <div className="accessor-prefix">{prefix}</div>
      <div className="accessor-input-container">
        <input
          className="accessor-input"
          type="text"
          value={inputValue}
          onFocus={(e) => e.target.select()}
          onChange={handleChange}
          onBlur={submitValue}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
