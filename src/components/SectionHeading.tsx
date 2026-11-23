export default function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 h-1 w-8 rounded-full bg-brand" />
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
