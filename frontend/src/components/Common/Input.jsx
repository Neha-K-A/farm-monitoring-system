const Input = ({
  label,
  error,
  touched,
  type = 'text',
  placeholder = '',
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
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-[10px] py-[10px] bg-[#FFFFFF] border rounded-[8px] transition duration-300 focus:outline-none focus:ring-[2px] focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] ${touched && error
            ? 'border-red-300 bg-red-50'
            : 'border-[#C8E6C9]'
          } text-[#1B5E20] placeholder-[#6B8F6B] ${className}`}
        {...props}
      />
      {touched && error && (
        <p className="text-red-500 text-sm mt-1.5">{error}</p>
      )}
    </div>
  );
};

export default Input;
