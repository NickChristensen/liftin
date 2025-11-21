import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Database is in the project root
    const dbPath = path.join(process.cwd(), "db.sqlite");

    db = new Database(dbPath, {
      readonly: true, // Read-only mode
      fileMustExist: true,
    });
  }

  return db;
}

// Cleanup on process exit (development only)
if (process.env.NODE_ENV !== "production") {
  process.on("exit", () => db?.close());
  process.on("SIGINT", () => {
    db?.close();
    process.exit(0);
  });
}
