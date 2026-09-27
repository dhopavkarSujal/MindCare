export default function Card({
  children,
  className = "",
  padding = true,
}) {
  return (
    <div
      className={`
        rounded-2xl
        border border-[#E2E8F0]
        bg-white
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}