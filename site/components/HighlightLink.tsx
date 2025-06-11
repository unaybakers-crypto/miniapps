export function HighlightLink({
  href,
  title,
}: { title: string; href: string }) {
  return (
    <a
      href={href}
      style={{ textDecoration: 'none' }}
      className="vocs_Anchor vocs_link vocs_Link_accent"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}{' '}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>right arrow</title>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </a>
  )
}
