import React, { useState } from "react";
import "./CustomSelectField.css";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectFieldProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const CustomSelectField: React.FC<CustomSelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  error = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = value !== "";

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setIsFocused(false);
    }, 150);
  };

  return (
    <div className="custom-select-wrapper">
      <div
        className={`custom-select-field ${isFocused ? "focused" : ""} ${
          error ? "error" : ""
        } ${disabled ? "disabled" : ""} ${hasValue ? "has-value" : ""}`}
        onClick={handleToggle}
        onBlur={handleBlur}
        tabIndex={disabled ? -1 : 0}
      >
        <label className="custom-select-label">{label}</label>

        <div className="custom-select-input">
          <span className="custom-select-value">
            {selectedOption ? selectedOption.label : ""}
          </span>

          <div className={`custom-select-arrow ${isOpen ? "open" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5z" fill="currentColor" />
            </svg>
          </div>
        </div>

        <fieldset className="custom-select-fieldset">
          <legend className="custom-select-legend">
            <span>{hasValue || isFocused ? label : ""}</span>
          </legend>
        </fieldset>

        {isOpen && (
          <div className="custom-select-dropdown">
            {options.map((option) => (
              <div
                key={option.value}
                className={`custom-select-option ${
                  option.value === value ? "selected" : ""
                }`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelectField;
