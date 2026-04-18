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
          className="text-[13px] font-medium text-zinc-700 block"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-zinc-400" strokeWidth={2.5} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`
            block w-full pr-3 py-2.5 border rounded-lg transition-all outline-none text-sm
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error 
              ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50' 
              : 'border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-white text-zinc-900 placeholder-zinc-400'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[12px] text-red-600 mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
