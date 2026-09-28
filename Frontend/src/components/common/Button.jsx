import {
  Loader2,
} from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-[#0F766E] text-white hover:bg-[#115E59] shadow-sm",

    secondary:
      "bg-white text-[#172033] border border-[#E2E8F0] hover:bg-[#F8FAFC]",

    soft:
      "bg-[#DFF5F1] text-[#0F766E] hover:bg-[#c9eee8]",

    ghost:
      "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#172033]",

    danger:
      "bg-red-50 text-red-600 hover:bg-red-100",
  };

  const sizes = {
    sm:
      "px-3 py-2 text-sm",

    md:
      "px-4 py-2.5 text-sm",

    lg:
      "px-5 py-3 text-base",
  };

  const isDisabled =
    disabled || loading;

  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium
        transition-all duration-200
        active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <Loader2
          size={17}
          className="animate-spin"
        />
      )}

      {children}
    </button>
  );
}