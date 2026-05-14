import type { LeaderboardEntry } from "../types/maze";

const STORAGE_KEY = "meeting-room-escape-leaderboard-v1";
const PLAYER_NAME_KEY = "meeting-room-escape-player-name";

export function getLeaderboard(limit = 10): LeaderboardEntry[] {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as LeaderboardEntry[];
    return entries
      .sort(
        (a, b) =>
          b.highestLevel - a.highestLevel ||
          b.score - a.score ||
          a.totalTimeSeconds - b.totalTimeSeconds,
      )
      .slice(0, limit);
  } catch (error) {
    console.error("排行榜读取失败", error);
    return [];
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "createdAt">): LeaderboardEntry | null {
  try {
    const entries = getAllEntries();
    const nextEntry: LeaderboardEntry = {
      ...entry,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };

    entries.push(nextEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return nextEntry;
  } catch (error) {
    console.error("排行榜写入失败", error);
    return null;
  }
}

export function getSavedPlayerName(): string {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch (error) {
    console.error("玩家姓名保存失败", error);
  }
}

function getAllEntries(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as LeaderboardEntry[];
  } catch (error) {
    console.error("排行榜读取失败", error);
    return [];
  }
}
