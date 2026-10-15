export default function YouTubeMark({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
      <path d="m10 9 6 3-6 3V9Z" fill="var(--bg, white)" />
    </svg>
  );
}
