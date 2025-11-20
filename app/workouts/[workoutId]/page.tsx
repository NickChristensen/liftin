import { notFound } from 'next/navigation';
import { getWorkoutDetail } from '@/lib/db/queries';
import WorkoutHeader from '@/components/workouts/workout-header';
import ExerciseCard from '@/components/workouts/exercise-card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workout = getWorkoutDetail(Number(workoutId));

  if (!workout) {
    notFound();
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <WorkoutHeader workout={workout} />

        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
            <ExerciseCard key={exercise.exerciseId} exercise={exercise} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
