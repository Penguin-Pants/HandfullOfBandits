/** Flag-derived faction marks for headers. Piece faces use their own simpler shapes. */
export function FactionMark({ faction }: { readonly faction: string }) {
  if (faction === "state") return (
    <svg className="faction-mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#bd1f2c" />
      <path d="M17 6a10 10 0 1 0 0 20 9 9 0 1 1 0-20Z" fill="white" />
      <polygon points="23,11 24.2,14.2 27.5,14.2 24.9,16.2 25.9,19.3 23,17.4 20.1,19.3 21.1,16.2 18.5,14.2 21.8,14.2" fill="white" />
    </svg>
  );
  if (faction === "pkk") return (
    <svg className="faction-mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#bd1f2c" />
      <circle cx="16" cy="16" r="11.5" fill="#26734e" />
      <circle cx="16" cy="16" r="9.5" fill="#e5be52" />
      <polygon points="16,8 17.9,13.4 23.5,13.4 19,16.8 20.8,22 16,18.7 11.2,22 13,16.8 8.5,13.4 14.1,13.4" fill="#bd1f2c" />
    </svg>
  );
  return null;
}
