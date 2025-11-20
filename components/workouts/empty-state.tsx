export default function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          Select a workout
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a workout from the list to view details
        </p>
      </div>
    </div>
  );
}
