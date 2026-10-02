// Mauritanian leatherwork motif (triangles and diamonds), tiled as a background.
// Used only at the top of the admin sidebar.
// Strokes inherit currentColor, so the caller sets the tone with text-ochre.

const patternId = "census-geo-pattern";

export function GeoPattern({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%">
      <defs>
        <pattern
          id={patternId}
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M32 4 L60 32 L32 60 L4 32 Z" />
            <path d="M32 18 L46 32 L32 46 L18 32 Z" />
            <path d="M0 0 L12 0 L0 12 Z" />
            <path d="M64 0 L52 0 L64 12 Z" />
            <path d="M0 64 L12 64 L0 52 Z" />
            <path d="M64 64 L52 64 L64 52 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
