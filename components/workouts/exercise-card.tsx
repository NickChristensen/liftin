import type { Exercise } from "@/types/workout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SetRow from "./set-row";
import { formatWeight, formatMuscleName } from "@/lib/formatters";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const workingSets = exercise.sets.filter((s) => !s.isWarmup);
  const warmupSets = exercise.sets.filter((s) => s.isWarmup);

  // Parse muscles into arrays
  const primaryMuscles = exercise.muscles ? [exercise.muscles] : [];
  const secondaryMuscles = exercise.secondaryMuscles
    ? exercise.secondaryMuscles.split(",").map((m) => m.trim())
    : [];
  const hasMuscles = [...primaryMuscles, ...secondaryMuscles].length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
              {hasMuscles && (
                <div className="flex gap-1 flex-wrap">
                  {primaryMuscles.map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="outline-secondary"
                      className="text-xs"
                    >
                      {formatMuscleName(muscle)}
                    </Badge>
                  ))}
                  {secondaryMuscles.map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="outline-tertiary"
                      className="text-xs"
                    >
                      {formatMuscleName(muscle)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
            <div>{formatWeight(exercise.volume)} total</div>
            {exercise.maxWeight && (
              <div>{formatWeight(exercise.maxWeight)} max</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Warmup Sets */}
        {warmupSets.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Warmup
            </div>
            <div className="space-y-1">
              {warmupSets.map((set, idx) => (
                <SetRow key={set.setId} set={set} index={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Working Sets */}
        {workingSets.length > 0 && (
          <div className="space-y-1 px-3">
            {workingSets.map((set, idx) => (
              <SetRow key={set.setId} set={set} index={idx + 1} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
