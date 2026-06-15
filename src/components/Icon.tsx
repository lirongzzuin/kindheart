/** Material Symbols 아이콘. 장식용은 aria-hidden, 의미 있으면 label 제공. */
export function Icon({
  name,
  className = "",
  fill = false,
  label,
  size,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  label?: string;
  size?: number;
}) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? "fill" : ""} ${className}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {name}
    </span>
  );
}
