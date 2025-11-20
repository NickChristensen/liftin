'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Workout } from '@/types/workout';
import { formatDate, formatDuration } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface WorkoutListItemProps {
  workout: Workout;
}

export default function WorkoutListItem({ workout }: WorkoutListItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/workouts/${workout.id}`;

  return (
    <Link
      href={`/workouts/${workout.id}`}
      className={cn(
        'block p-4 border-b border-border transition-colors hover:bg-accent/50',
        isActive && 'bg-accent border-l-4 border-l-primary'
      )}
    >
      <div className="space-y-1">
        <h3 className="font-semibold text-sm line-clamp-1">
          {workout.routineName}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(workout.startDate)}</span>
          {workout.duration >= 60 && (
            <>
              <span>•</span>
              <span>{formatDuration(workout.duration)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
