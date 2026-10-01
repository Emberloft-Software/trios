/* eslint-disable @next/next/no-img-element */
const PALETTE = [
  ["#ff3450", "#fff"],
  ["#ffba30", "#360253"],
  ["#360253", "#fff"],
  ["#6f3f8f", "#fff"],
  ["#ff7a59", "#fff"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Photo if approved, otherwise a coloured initial disc. */
export function Avatar({
  name,
  src,
  size = 40,
  className = "",
  ring = false,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const style = { width: size, height: size };
  const ringCls = ring ? "ring-[3px] ring-white" : "";
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={style}
        className={`shrink-0 rounded-full object-cover ${ringCls} ${className}`}
      />
    );
  }
  const [bg, fg] = PALETTE[hash(name) % PALETTE.length];
  return (
    <span
      aria-label={name}
      role="img"
      style={{ ...style, background: bg, color: fg, fontSize: Math.max(12, size * 0.4) }}
      className={`grid shrink-0 place-items-center rounded-full font-bold ${ringCls} ${className}`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
