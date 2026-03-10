const gradeColors: Record<string, string> = {
  "A+": "bg-green-500/20 text-green-400",
  A: "bg-green-500/20 text-green-400",
  "A-": "bg-green-500/20 text-green-400",
  "B+": "bg-blue-500/20 text-blue-400",
  B: "bg-blue-500/20 text-blue-400",
  "B-": "bg-blue-500/20 text-blue-400",
  "C+": "bg-yellow-500/20 text-yellow-400",
  C: "bg-yellow-500/20 text-yellow-400",
  "C-": "bg-yellow-500/20 text-yellow-400",
  D: "bg-orange-500/20 text-orange-400",
  F: "bg-red-500/20 text-red-400",
};

export default function GradeBadge({ grade, size = "sm" }: { grade: string; size?: "sm" | "lg" }) {
  const colorClass = gradeColors[grade] || "bg-gray-500/20 text-gray-400";
  const sizeClass = size === "lg" ? "w-12 h-12 text-lg" : "w-8 h-8 text-xs";

  return (
    <span className={`grade-badge ${colorClass} ${sizeClass}`}>
      {grade}
    </span>
  );
}
