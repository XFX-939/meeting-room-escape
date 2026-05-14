import type { CellCode, EnemyRuntime, GameStats, MazeLevel, Position } from "../types/maze";
import { findPositions } from "./mazeValidation";

export const cellMeta: Record<CellCode, { label: string; icon: string; className: string }> = {
  W: { label: "墙", icon: "", className: "bg-slate-700 border-slate-500 shadow-inner dark:bg-slate-950 dark:border-slate-700" },
  ".": { label: "通路", icon: "", className: "bg-white border-slate-300 dark:bg-slate-800/80 dark:border-slate-700/60" },
  S: { label: "起点", icon: "", className: "bg-cyan/10 border-cyan/50 dark:bg-slate-800/80" },
  E: { label: "出口", icon: "🚪", className: "bg-emerald-100 border-emerald-400 dark:bg-emerald-500/20 dark:border-emerald-300/70" },
  M: { label: "会议", icon: "📅", className: "bg-violet-100 border-violet-400 dark:bg-violet-500/20 dark:border-violet-300/60" },
  B: { label: "Bug", icon: "🐞", className: "bg-orange-100 border-orange-400 dark:bg-orange-500/20 dark:border-orange-300/60" },
  C: { label: "咖啡", icon: "☕", className: "bg-sky-100 border-sky-400 dark:bg-sky-500/20 dark:border-sky-300/60" },
  T: { label: "摸鱼券", icon: "🎫", className: "bg-amber-100 border-amber-400 dark:bg-amber-500/20 dark:border-amber-300/60" },
  R: { label: "需求变更", icon: "🔁", className: "bg-pink-100 border-pink-400 dark:bg-pink-500/20 dark:border-pink-300/60" },
  N: { label: "群消息", icon: "💬", className: "bg-indigo-100 border-indigo-400 dark:bg-indigo-500/20 dark:border-indigo-300/60" },
  D: { label: "免会卡", icon: "🛡️", className: "bg-teal-100 border-teal-400 dark:bg-teal-500/20 dark:border-teal-300/60" },
};

export function parseMap(level: MazeLevel): CellCode[][] {
  return level.map.map((row) => [...row] as CellCode[]);
}

export function getStart(level: MazeLevel): Position {
  return findPositions(level, "S")[0] ?? { row: 1, col: 1 };
}

export function getExit(level: MazeLevel): Position {
  return findPositions(level, "E")[0] ?? { row: 1, col: 1 };
}

export function getTotalTickets(level: MazeLevel): number {
  return level.map.reduce((total, row) => total + [...row].filter((cell) => cell === "T").length, 0);
}

export function getRespawnPosition(level: MazeLevel): Position {
  const start = getStart(level);
  const candidates = [
    { row: start.row, col: start.col + 1 },
    { row: start.row + 1, col: start.col },
    { row: start.row, col: start.col - 1 },
    { row: start.row - 1, col: start.col },
  ];

  return candidates.find((position) => level.map[position.row]?.[position.col] !== "W") ?? start;
}

export function createEnemies(level: MazeLevel): EnemyRuntime[] {
  return (level.enemies ?? []).map((enemy) => ({
    ...enemy,
    position: enemy.path[0],
    pathIndex: 0,
    direction: 1,
  }));
}

export function nextEnemy(enemy: EnemyRuntime): EnemyRuntime {
  let nextIndex = enemy.pathIndex + enemy.direction;
  let nextDirection = enemy.direction;

  if (nextIndex >= enemy.path.length || nextIndex < 0) {
    nextDirection = (enemy.direction * -1) as 1 | -1;
    nextIndex = enemy.pathIndex + nextDirection;
  }

  return {
    ...enemy,
    pathIndex: nextIndex,
    direction: nextDirection,
    position: enemy.path[nextIndex],
  };
}

export function samePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function calculateLevelScore(level: MazeLevel, stats: Omit<GameStats, "score">): number {
  let score =
    level.baseScore +
    stats.remainingTimeSeconds * 10 +
    stats.collectedTickets * 100 +
    level.id * 200 -
    stats.penaltyCount * 50 -
    stats.caughtCount * 100;

  if (stats.penaltyCount === 0 && stats.caughtCount === 0) {
    score += 500;
  }

  if (stats.totalTickets > 0 && stats.collectedTickets === stats.totalTickets) {
    score += 300;
  }

  if (level.id === 10) {
    score += 2000;
  }

  return Math.max(0, score);
}

export function isDirectionKey(key: string): boolean {
  return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(key);
}

export function directionFromKey(key: string): Position | null {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return { row: -1, col: 0 };
    case "arrowdown":
    case "s":
      return { row: 1, col: 0 };
    case "arrowleft":
    case "a":
      return { row: 0, col: -1 };
    case "arrowright":
    case "d":
      return { row: 0, col: 1 };
    default:
      return null;
  }
}
