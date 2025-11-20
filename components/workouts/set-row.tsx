import type { GymSet } from "@/types/workout";
import { formatWeight } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SetRowProps {
  set: GymSet;
  index: number;
}

function getRPEColor(rpe: number): string {
  if (rpe <= 4) return "text-green-600";
  if (rpe <= 7) return "text-yellow-600";
  return "text-red-600";
}

export default function SetRow({ set, index }: SetRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground w-4">
          {index}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium w-5 text-right">
            {set.reps}
          </span>
          <span className="text-muted-foreground">×</span>
          <span className="font-mono font-medium">
            {formatWeight(set.weight)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {set.rpe !== null && (
          <Badge
            variant="outline"
            className={cn("text-xs", getRPEColor(set.rpe))}
          >
            RPE {set.rpe}
          </Badge>
        )}
      </div>
    </div>
  );
}
