export default function CardBase({ children, style, onClick }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', borderRadius: 12,
      border: '1px solid var(--border)', padding: '14px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}
