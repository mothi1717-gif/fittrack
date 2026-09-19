"use client";

export function WeightChart({ points }: { points: { date: string; weight: number }[] }) {
  if (points.length < 2) {
    return <p className="text-sm text-neutral-400">Log at least 2 weigh-ins to see a trend.</p>;
  }

  const width = 320;
  const height = 120;
  const padding = 8;

  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.weight - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-neutral-900" role="img" aria-label="Weight trend">
      <polyline points={coords.join(" ")} fill="none" stroke="currentColor" strokeWidth={2} />
      {coords.map((c, i) => {
        const [x, y] = c.split(",");
        return <circle key={i} cx={x} cy={y} r={2.5} fill="currentColor" />;
      })}
    </svg>
  );
}
