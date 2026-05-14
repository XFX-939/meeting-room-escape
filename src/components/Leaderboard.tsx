import type { LeaderboardEntry } from "../types/maze";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  compact?: boolean;
};

export function Leaderboard({ entries, compact = false }: LeaderboardProps) {
  return (
    <section className="rounded-2xl border border-line bg-panel/90 p-4 shadow-glow">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">排行榜 Top10</h2>
        <span className="rounded-full border border-cyan/30 px-3 py-1 text-xs text-cyan">PK</span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-panelSoft/70 p-4 text-sm text-slate-400">
          暂无成绩，先逃出一关。
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl border border-line bg-panelSoft/80 p-3"
              key={entry.id}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan/20 text-sm font-black text-cyan">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{entry.playerName}</p>
                {!compact && (
                  <p className="truncate text-xs text-slate-400">
                    最高第 {entry.highestLevel} 关 · 通关 {entry.clearedLevelCount} 关 · 用时{" "}
                    {entry.totalTimeSeconds}s
                  </p>
                )}
              </div>
              <strong className="text-mint">{entry.score}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
