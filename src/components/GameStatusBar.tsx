import type { GameStats, MazeLevel } from "../types/maze";

type GameStatusBarProps = {
  level: MazeLevel;
  stats: GameStats;
  meetingShield: number;
  effectLabel: string;
};

export function GameStatusBar({ level, stats, meetingShield, effectLabel }: GameStatusBarProps) {
  const items = [
    ["关卡", `第 ${level.id} 关`],
    ["剩余时间", `${stats.remainingTimeSeconds}s`],
    ["当前分数", stats.score.toString()],
    ["摸鱼券", `${stats.collectedTickets}/${stats.totalTickets}`],
    ["惩罚", stats.penaltyCount.toString()],
    ["被抓", stats.caughtCount.toString()],
    ["免会卡", meetingShield.toString()],
    ["状态", effectLabel],
  ];

  return (
    <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-panel shadow-glow sm:grid-cols-4 xl:grid-cols-8">
      {items.map(([label, value]) => (
        <div className="border-b border-r border-line p-3 last:border-r-0 sm:p-4" key={label}>
          <p className="text-xs text-slate-400">{label}</p>
          <strong className="mt-1 block truncate text-base text-white">{value}</strong>
        </div>
      ))}
    </section>
  );
}
