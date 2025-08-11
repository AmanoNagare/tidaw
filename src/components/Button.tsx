interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors duration-200";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

export default Button;
