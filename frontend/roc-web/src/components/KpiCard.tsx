interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
}: KpiCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#666",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: "#888",
            marginTop: 6,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}