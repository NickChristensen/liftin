'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Workout } from '@/types/workout';
import WorkoutListItem from './workout-list-item';

interface WorkoutListProps {
  workouts: Workout[];
}

export default function WorkoutList({ workouts }: WorkoutListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: workouts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated height of each item in pixels
    overscan: 5, // Render 5 items above/below the visible area
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const workout = workouts[virtualRow.index];
          return (
            <div
              key={workout.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <WorkoutListItem workout={workout} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
