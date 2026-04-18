import { Loader2 } from "lucide-react";

export default function Button({ 
  children, 
  isLoading, 
  icon: Icon, 
  type = "button", 
  variant = "primary", 
  className = "", 
  disabled,
  ...props 
}) {
  const baseStyles = "w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed group";
  
  const variants = {
    primary: "text-white bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-900 border border-transparent",
    secondary: "text-zinc-700 bg-white hover:bg-zinc-50 focus:ring-zinc-200 border border-zinc-200",
    outline: "text-zinc-900 bg-transparent hover:bg-zinc-50 focus:ring-zinc-200 border border-zinc-900",
  };

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {children}
          {Icon && <Icon className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />}
        </>
      )}
    </button>
  );
}
