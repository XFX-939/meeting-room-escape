import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellCode, EnemyRuntime, GameStats, GameStatus, MazeLevel, Position } from "../types/maze";
import {
  calculateLevelScore,
  createEnemies,
  directionFromKey,
  getExit,
  getRespawnPosition,
  getStart,
  getTotalTickets,
  isDirectionKey,
  nextEnemy,
  parseMap,
  samePosition,
} from "../utils/mazeGameLogic";
import { addLeaderboardEntry, getSavedPlayerName, savePlayerName } from "../utils/leaderboardStorage";
import { GameStatusBar } from "./GameStatusBar";
import { Leaderboard } from "./Leaderboard";
import { MazeBoard } from "./MazeBoard";
import { MobileControls } from "./MobileControls";
import { ResultPanel } from "./ResultPanel";
import { validatePlayerName } from "./PlayerNameInput";
import type { LeaderboardEntry } from "../types/maze";

type MazeGameProps = {
  level: MazeLevel;
  leaderboardEntries: LeaderboardEntry[];
  onLeaderboardChange: () => void;
  onBackHome: () => void;
  onSelectLevel: () => void;
  onNextLevel: (nextLevelId: number) => void;
};

const normalMoveMs = 180;
const slowMoveMs = 360;
const fastMoveMs = 105;
const autoAdvanceDelaySeconds = 3;

export function MazeGame({
  level,
  leaderboardEntries,
  onLeaderboardChange,
  onBackHome,
  onSelectLevel,
  onNextLevel,
}: MazeGameProps) {
  const totalTickets = useMemo(() => getTotalTickets(level), [level]);
  const [map, setMap] = useState<CellCode[][]>(() => parseMap(level));
  const [player, setPlayer] = useState<Position>(() => getStart(level));
  const [enemies, setEnemies] = useState<EnemyRuntime[]>(() => createEnemies(level));
  const [status, setStatus] = useState<GameStatus>("running");
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(level.timeLimitSeconds);
  const [collectedTickets, setCollectedTickets] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [meetingShield, setMeetingShield] = useState(0);
  const [effect, setEffect] = useState<"normal" | "fast" | "slow">("normal");
  const [message, setMessage] = useState("方向键或 WASD 移动，找到电梯口。");
  const [submitted, setSubmitted] = useState(false);
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState<number | null>(null);
  const lastMoveAt = useRef(0);
  const effectTimer = useRef<number | null>(null);
  const start = useMemo(() => getStart(level), [level]);
  const exit = useMemo(() => getExit(level), [level]);

  const stats: GameStats = useMemo(() => {
    const elapsedTimeSeconds = level.timeLimitSeconds - remainingTimeSeconds;
    const score = calculateLevelScore(level, {
      remainingTimeSeconds,
      elapsedTimeSeconds,
      collectedTickets,
      totalTickets,
      penaltyCount,
      caughtCount,
      clearedLevelCount: status === "cleared" ? 1 : 0,
      highestLevel: status === "cleared" ? level.id : level.id - 1,
    });

    return {
      score,
      remainingTimeSeconds,
      elapsedTimeSeconds,
      collectedTickets,
      totalTickets,
      penaltyCount,
      caughtCount,
      clearedLevelCount: status === "cleared" ? 1 : 0,
      highestLevel: status === "cleared" ? level.id : level.id - 1,
    };
  }, [caughtCount, collectedTickets, level, penaltyCount, remainingTimeSeconds, status, totalTickets]);

  const resetGame = useCallback(() => {
    setMap(parseMap(level));
    setPlayer(getStart(level));
    setEnemies(createEnemies(level));
    setStatus("running");
    setRemainingTimeSeconds(level.timeLimitSeconds);
    setCollectedTickets(0);
    setPenaltyCount(0);
    setCaughtCount(0);
    setMeetingShield(0);
    setEffect("normal");
    setMessage("方向键或 WASD 移动，找到电梯口。");
    setSubmitted(false);
    setAutoAdvanceSeconds(null);
    lastMoveAt.current = 0;
    if (effectTimer.current) {
      window.clearTimeout(effectTimer.current);
      effectTimer.current = null;
    }
  }, [level]);

  useEffect(() => {
    resetGame();
    return () => {
      if (effectTimer.current) {
        window.clearTimeout(effectTimer.current);
      }
    };
  }, [resetGame]);

  useEffect(() => {
    if (status !== "running") return undefined;

    const timer = window.setInterval(() => {
      setRemainingTimeSeconds((current) => {
        if (current <= 1) {
          setStatus("failed");
          setMessage("倒计时结束，本局失败。");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "cleared") {
      setAutoAdvanceSeconds(null);
      return undefined;
    }

    if (level.id >= 10) {
      setAutoAdvanceSeconds(null);
      return undefined;
    }

    setAutoAdvanceSeconds(autoAdvanceDelaySeconds);
    const countdownTimer = window.setInterval(() => {
      setAutoAdvanceSeconds((current) => {
        if (current === null) return current;
        return Math.max(1, current - 1);
      });
    }, 1000);
    const advanceTimer = window.setTimeout(() => {
      onNextLevel(level.id + 1);
    }, autoAdvanceDelaySeconds * 1000);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(advanceTimer);
    };
  }, [level.id, onNextLevel, status]);

  const applyTimedEffect = useCallback((nextEffect: "fast" | "slow", durationMs: number) => {
    setEffect(nextEffect);
    if (effectTimer.current) {
      window.clearTimeout(effectTimer.current);
    }
    effectTimer.current = window.setTimeout(() => {
      setEffect("normal");
      effectTimer.current = null;
    }, durationMs);
  }, []);

  const changeTime = useCallback((delta: number) => {
    setRemainingTimeSeconds((current) => {
      const next = Math.max(0, current + delta);
      if (next === 0) {
        setStatus("failed");
        setMessage("时间耗尽，本局失败。");
      }
      return next;
    });
  }, []);

  const handleEnemyCaught = useCallback(
    (enemy: EnemyRuntime) => {
      if (status !== "running") return;
      setCaughtCount((current) => current + 1);
      setPlayer(start);
      changeTime(-enemy.penaltySeconds);
      setMessage(`被${enemy.name}抓住，-${enemy.penaltySeconds} 秒，回到起点。`);
    },
    [changeTime, start, status],
  );

  useEffect(() => {
    if (status !== "running" || enemies.length === 0) return undefined;

    const timers = enemies.map((enemy) =>
      window.setInterval(() => {
        setEnemies((currentEnemies) => {
          const nextEnemies = currentEnemies.map((item) => (item.id === enemy.id ? nextEnemy(item) : item));
          const hitEnemy = nextEnemies.find((item) => samePosition(item.position, player));
          if (hitEnemy) {
            handleEnemyCaught(hitEnemy);
          }
          return nextEnemies;
        });
      }, enemy.speedMs),
    );

    return () => timers.forEach((timer) => window.clearInterval(timer));
  }, [enemies.length, handleEnemyCaught, player, status]);

  const movePlayer = useCallback(
    (direction: Position) => {
      if (status !== "running") return;

      const now = Date.now();
      const moveDelay = effect === "fast" ? fastMoveMs : effect === "slow" ? slowMoveMs : normalMoveMs;
      if (now - lastMoveAt.current < moveDelay) return;

      const next = { row: player.row + direction.row, col: player.col + direction.col };
      const nextCell = map[next.row]?.[next.col];
      if (!nextCell || nextCell === "W") return;

      lastMoveAt.current = now;
      setPlayer(next);

      const hitEnemy = enemies.find((enemy) => samePosition(enemy.position, next));
      if (hitEnemy) {
        handleEnemyCaught(hitEnemy);
        return;
      }

      if (nextCell === "E" || samePosition(next, exit)) {
        setStatus("cleared");
        setMessage(level.id === 10 ? "终极下班逃生成功，额外奖励已计入。" : "通关成功，可以提交排行榜。");
        return;
      }

      if (nextCell === "T") {
        setCollectedTickets((current) => current + 1);
        setMessage("摸鱼券 +100 分。");
        clearCell(next);
      }

      if (nextCell === "C") {
        applyTimedEffect("fast", 5000);
        setMessage("咖啡加速 5 秒。");
        clearCell(next);
      }

      if (nextCell === "D") {
        setMeetingShield((current) => current + 1);
        setMessage("获得免会卡，可抵消一次会议惩罚。");
        clearCell(next);
      }

      if (nextCell === "B") {
        setPenaltyCount((current) => current + 1);
        applyTimedEffect("slow", 3000);
        setMessage("踩到 Bug，减速 3 秒。");
      }

      if (nextCell === "M") {
        setMeetingShield((shield) => {
          if (shield > 0) {
            setMessage("免会卡抵消了一次会议惩罚。");
            return shield - 1;
          }
          setPenaltyCount((current) => current + 1);
          changeTime(-5);
          setMessage("被会议拖住，-5 秒。");
          return 0;
        });
      }

      if (nextCell === "R") {
        setPenaltyCount((current) => current + 1);
        changeTime(-5);
        setPlayer(getRespawnPosition(level));
        setMessage("需求变更袭来，-5 秒并被送回起点附近。");
      }

      if (nextCell === "N") {
        setPenaltyCount((current) => current + 1);
        changeTime(-3);
        setMessage("群消息轰炸，-3 秒。");
      }
    },
    [applyTimedEffect, changeTime, effect, enemies, exit, handleEnemyCaught, level, map, player, status],
  );

  function clearCell(position: Position) {
    setMap((current) =>
      current.map((row, rowIndex) =>
        row.map((cell, colIndex) => (rowIndex === position.row && colIndex === position.col ? "." : cell)),
      ),
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (status === "cleared" || status === "failed") return;

      if (isDirectionKey(event.key)) {
        event.preventDefault();
        const direction = directionFromKey(event.key);
        if (direction) movePlayer(direction);
      }

      if (event.key.toLowerCase() === "p") {
        setStatus((current) => (current === "running" ? "paused" : current === "paused" ? "running" : current));
      }

      if (event.key.toLowerCase() === "r") {
        resetGame();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (status === "running") {
          setStatus("paused");
          setMessage("已暂停。Esc 再按一次返回关卡选择。");
        } else if (status === "paused") {
          onSelectLevel();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, onSelectLevel, resetGame, status]);

  function submitScore() {
    const trimmedName = playerName.trim();
    if (validatePlayerName(trimmedName) || submitted || status !== "cleared") return;
    savePlayerName(trimmedName);

    const entry = addLeaderboardEntry({
      playerName: trimmedName,
      score: stats.score,
      highestLevel: level.id,
      clearedLevelCount: 1,
      totalTimeSeconds: stats.elapsedTimeSeconds,
      penaltyCount: stats.penaltyCount,
      caughtCount: stats.caughtCount,
    });

    if (entry) {
      setSubmitted(true);
      onLeaderboardChange();
      setMessage("成绩已提交排行榜。");
    } else {
      setMessage("成绩提交失败，请检查浏览器存储权限。");
    }
  }

  const effectLabel = effect === "fast" ? "咖啡加速" : effect === "slow" ? "Bug 减速" : status === "paused" ? "暂停" : "正常";

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-4 lg:px-8 lg:py-6">
      <div className="mb-4 flex flex-col justify-between gap-3 rounded-3xl border border-line bg-panel/80 p-4 shadow-glow md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black text-cyan">第 {level.id} 关</p>
          <h1 className="text-2xl font-black text-white">{level.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{level.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button className="h-10 rounded-xl border border-line bg-panelSoft px-4 text-white" onClick={onBackHome} type="button">
            返回首页
          </button>
          <button className="h-10 rounded-xl border border-line bg-panelSoft px-4 text-white" onClick={onSelectLevel} type="button">
            返回关卡选择
          </button>
        </div>
      </div>

      <GameStatusBar effectLabel={effectLabel} level={level} meetingShield={meetingShield} stats={stats} />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <MazeBoard enemies={enemies} map={map} player={player} />
          <div className="rounded-2xl border border-line bg-panel/90 p-4 text-slate-300 shadow-glow">
            <p className="min-h-6">{message}</p>
            {status === "paused" && <p className="mt-2 text-cyan">游戏已暂停，计时器和巡逻都已停止。</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <button
              className="h-11 rounded-xl bg-cyan font-black text-slate-950"
              onClick={() => setStatus((current) => (current === "running" ? "paused" : "running"))}
              type="button"
            >
              {status === "paused" ? "继续" : "暂停"}
            </button>
            <button className="h-11 rounded-xl border border-line bg-panelSoft text-white" onClick={resetGame} type="button">
              重新开始
            </button>
            <button className="h-11 rounded-xl border border-line bg-panelSoft text-white" onClick={onSelectLevel} type="button">
              关卡选择
            </button>
            <button className="h-11 rounded-xl border border-line bg-panelSoft text-white" onClick={onBackHome} type="button">
              首页
            </button>
          </div>
          <MobileControls onMove={movePlayer} />
          {(status === "cleared" || status === "failed") && (
            <ResultPanel
              cleared={status === "cleared"}
              level={level}
              onNextLevel={() => onNextLevel(level.id + 1)}
              onPlayerNameChange={setPlayerName}
              onRestart={resetGame}
              onSelectLevel={onSelectLevel}
              onSubmitScore={submitScore}
              playerName={playerName}
              stats={stats}
              submitted={submitted}
            />
          )}
        </section>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-panel/90 p-4 shadow-glow">
            <h2 className="text-lg font-bold text-white">关卡提示</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(level.tips ?? []).map((tip) => (
                <li className="rounded-xl border border-line bg-panelSoft/70 p-3" key={tip}>
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
              <span>🧑‍💻 玩家</span>
              <span>🚪 出口</span>
              <span>📅 会议</span>
              <span>🐞 Bug</span>
              <span>☕ 咖啡</span>
              <span>🎫 摸鱼券</span>
              <span>🔁 需求变更</span>
              <span>💬 群消息</span>
              <span>🛡️ 免会卡</span>
              <span>👔 老板</span>
            </div>
          </section>
          <Leaderboard compact entries={leaderboardEntries} />
        </aside>
      </div>

      {status === "cleared" && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/65 px-4 backdrop-blur-sm">
          <section
            aria-live="polite"
            className="w-full max-w-md rounded-3xl border border-line bg-panel p-6 text-center shadow-glow"
            role="dialog"
          >
            <p className="text-sm font-black uppercase tracking-normal text-cyan">
              {level.id >= 10 ? "Mission Complete" : "Level Clear"}
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              {level.id >= 10 ? "恭喜，全部通关！" : `恭喜通过第 ${level.id} 关`}
            </h2>
            <p className="mt-3 leading-7 text-slate-300">
              本关得分 <strong className="text-mint">{stats.score}</strong>，用时 {stats.elapsedTimeSeconds} 秒。
            </p>
            {level.id < 10 ? (
              <>
                <p className="mt-2 text-slate-400">
                  {autoAdvanceSeconds ?? autoAdvanceDelaySeconds} 秒后自动进入第 {level.id + 1} 关。
                </p>
                <button
                  className="mt-6 h-12 w-full rounded-xl bg-cyan font-black text-slate-950"
                  onClick={() => onNextLevel(level.id + 1)}
                  type="button"
                >
                  立即进入下一关
                </button>
              </>
            ) : (
              <button
                className="mt-6 h-12 w-full rounded-xl bg-mint font-black text-slate-950"
                onClick={onSelectLevel}
                type="button"
              >
                返回关卡选择
              </button>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
