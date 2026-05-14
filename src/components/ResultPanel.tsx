import type { GameStats, MazeLevel } from "../types/maze";
import { PlayerNameInput, validatePlayerName } from "./PlayerNameInput";

type ResultPanelProps = {
  level: MazeLevel;
  stats: GameStats;
  cleared: boolean;
  playerName: string;
  submitted: boolean;
  onPlayerNameChange: (name: string) => void;
  onSubmitScore: () => void;
  onNextLevel: () => void;
  onRestart: () => void;
  onSelectLevel: () => void;
};

export function ResultPanel({
  level,
  stats,
  cleared,
  playerName,
  submitted,
  onPlayerNameChange,
  onSubmitScore,
  onNextLevel,
  onRestart,
  onSelectLevel,
}: ResultPanelProps) {
  const nameError = validatePlayerName(playerName.trim());

  return (
    <section className="rounded-2xl border border-line bg-panel/95 p-5 shadow-glow">
      <p className="text-sm font-bold uppercase tracking-normal text-cyan">
        {cleared ? "Clear" : "Failed"}
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        {cleared ? `第 ${level.id} 关通关` : "本局失败"}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Metric label="本关得分" value={stats.score} />
        <Metric label="用时" value={`${stats.elapsedTimeSeconds}s`} />
        <Metric label="剩余时间" value={`${stats.remainingTimeSeconds}s`} />
        <Metric label="摸鱼券" value={`${stats.collectedTickets}/${stats.totalTickets}`} />
        <Metric label="惩罚次数" value={stats.penaltyCount} />
        <Metric label="被抓次数" value={stats.caughtCount} />
      </div>

      {cleared && (
        <div className="mt-5 rounded-2xl border border-line bg-panelSoft/80 p-4">
          <PlayerNameInput value={playerName} onChange={onPlayerNameChange} />
          <button
            className="mt-4 h-11 w-full rounded-xl bg-cyan px-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            disabled={submitted || Boolean(nameError)}
            onClick={onSubmitScore}
            type="button"
          >
            {submitted ? "成绩已提交" : "提交排行榜"}
          </button>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {cleared && level.id < 10 && (
          <button className="h-11 rounded-xl bg-mint font-black text-slate-950" onClick={onNextLevel} type="button">
            下一关
          </button>
        )}
        <button className="h-11 rounded-xl border border-line bg-panelSoft text-white" onClick={onRestart} type="button">
          再玩一次
        </button>
        <button
          className="h-11 rounded-xl border border-line bg-panelSoft text-white"
          onClick={onSelectLevel}
          type="button"
        >
          返回关卡选择
        </button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <strong className="mt-1 block text-lg text-white">{value}</strong>
    </div>
  );
}
