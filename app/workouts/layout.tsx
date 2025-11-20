import { Suspense } from 'react';
import { getWorkouts } from '@/lib/db/queries';
import WorkoutList from '@/components/workouts/workout-list';

export default async function WorkoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch workouts on the server
  const workouts = getWorkouts();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Master: Workout List */}
      <aside className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {workouts.length} total sessions
          </p>
        </div>
        {/* Virtual scroller needs direct control of scroll element, no ScrollArea wrapper */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <WorkoutList workouts={workouts} />
          </Suspense>
        </div>
      </aside>

      {/* Detail: Selected Workout */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
