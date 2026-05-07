export default function Input({
  label,
  id,
  type = "text",
  icon: Icon,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          className="text-[13px] font-medium text-teal-800 block"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-teal-400" strokeWidth={2.5} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`
            block w-full pr-3 py-2.5 border rounded-[var(--radius-md)] transition-all outline-none text-sm
            ${Icon ? "pl-10" : "pl-3"}
            ${
              error
                ? "border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50"
                : "border-teal-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-teal-900 placeholder:text-teal-900/40"
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[12px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
