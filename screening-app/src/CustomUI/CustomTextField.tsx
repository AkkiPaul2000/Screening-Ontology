import React, { useState } from "react";
import "./CustomTextField.css";

interface CustomTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  error = false,
  disabled = false,
  placeholder = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value !== "";

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="custom-textfield-wrapper">
      <div
        className={`custom-textfield-field ${isFocused ? "focused" : ""} ${
          error ? "error" : ""
        } ${disabled ? "disabled" : ""} ${hasValue ? "has-value" : ""}`}
      >
        <label className="custom-textfield-label">{label}</label>

        <input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={isFocused && !hasValue ? placeholder : ""}
          className="custom-textfield-input"
        />

        {value && !disabled && onClear && (
          <button
            type="button"
            className="custom-textfield-clear-button"
            onClick={() => {
              onChange("");
              onClear();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}

        <fieldset className="custom-textfield-fieldset">
          <legend className="custom-textfield-legend">
            <span>{hasValue || isFocused ? label : ""}</span>
          </legend>
        </fieldset>
      </div>
    </div>
  );
};

export default CustomTextField;
