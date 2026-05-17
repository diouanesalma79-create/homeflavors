import React from 'react';
import '../../style/ChefShared.css';

const FormField = ({
  id,
  label,
  error,
  as = 'input',
  className = '',
  ...props
}) => {
  const Field = as;

  return (
    <div className={`hf-form-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <Field
        id={id}
        className={error ? 'hf-field-error' : ''}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <span id={`${id}-error`} className="hf-form-error">{error}</span>}
    </div>
  );
};

export default FormField;
