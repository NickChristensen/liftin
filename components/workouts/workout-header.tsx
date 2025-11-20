import type { WorkoutDetail } from "@/types/workout";
import { formatDateTime, formatDuration, formatWeight } from "@/lib/formatters";
import { Separator } from "@/components/ui/separator";

interface WorkoutHeaderProps {
  workout: WorkoutDetail;
}

export default function WorkoutHeader({ workout }: WorkoutHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{workout.routineName}</h1>
        <p className="text-muted-foreground mt-1">
          {formatDateTime(workout.startDate)}
        </p>
      </div>

      <div className="flex gap-6 text-sm">
        {workout.duration >= 60 && (
          <div>
            <span className="text-muted-foreground">Duration: </span>
            <span className="font-medium">
              {formatDuration(workout.duration)}
            </span>
          </div>
        )}
        {workout.bodyweight && (
          <div>
            <span className="text-muted-foreground">Bodyweight: </span>
            <span className="font-medium">
              {formatWeight(workout.bodyweight, { rounded: true })}
            </span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Exercises: </span>
          <span className="font-medium">{workout.exercises.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Total Sets: </span>
          <span className="font-medium">
            {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
          </span>
        </div>
      </div>

      <Separator />
    </div>
  );
}
