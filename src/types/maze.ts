export type CellCode = "W" | "." | "S" | "E" | "M" | "B" | "C" | "T" | "R" | "N" | "D";

export type Position = {
  row: number;
  col: number;
};

export type PatrolEnemy = {
  id: string;
  name: string;
  icon: string;
  path: Position[];
  speedMs: number;
  penaltySeconds: number;
};

export type MazeLevel = {
  id: number;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeLimitSeconds: number;
  baseScore: number;
  map: string[];
  enemies?: PatrolEnemy[];
  tips?: string[];
};

export type EnemyRuntime = PatrolEnemy & {
  position: Position;
  pathIndex: number;
  direction: 1 | -1;
};

export type GameStatus = "idle" | "running" | "paused" | "cleared" | "failed";

export type GameStats = {
  score: number;
  remainingTimeSeconds: number;
  elapsedTimeSeconds: number;
  collectedTickets: number;
  totalTickets: number;
  penaltyCount: number;
  caughtCount: number;
  clearedLevelCount: number;
  highestLevel: number;
};

export type LeaderboardEntry = {
  id: string;
  playerName: string;
  score: number;
  highestLevel: number;
  clearedLevelCount: number;
  totalTimeSeconds: number;
  penaltyCount: number;
  caughtCount: number;
  createdAt: string;
};
