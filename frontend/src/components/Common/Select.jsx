const Select = ({
  label,
  error,
  touched,
  options = [],
  placeholder = 'Select an option',
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 border-2 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white ${
          touched && error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 hover:border-gray-300'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {touched && error && (
        <p className="text-red-500 text-sm mt-1.5">{error}</p>
      )}
    </div>
  );
};

export default Select;
