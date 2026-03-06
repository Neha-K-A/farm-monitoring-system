const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseStyles =
    'font-medium rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#4CAF50] text-[#FFFFFF] hover:bg-[#43A047] active:scale-95 shadow-sm',
    secondary:
      'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#DCEEDC] active:scale-95',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
    ghost: 'text-[#2E7D32] hover:bg-[#E8F5E9] active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-[16px] py-[10px] text-base rounded-[10px]',
    lg: 'px-6 py-3 text-lg rounded-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="inline-block animate-spin">⟳</span>}
      {children}
    </button>
  );
};

export default Button;
