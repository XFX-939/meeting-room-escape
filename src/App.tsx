import { useEffect, useMemo, useState } from "react";
import { HomePage } from "./components/HomePage";
import { Leaderboard } from "./components/Leaderboard";
import { LevelSelect } from "./components/LevelSelect";
import { MazeGame } from "./components/MazeGame";
import { ThemeToggle, type ThemeMode } from "./components/ThemeToggle";
import { mazeLevels } from "./levels/mazeLevels";
import type { LeaderboardEntry } from "./types/maze";
import { getLeaderboard } from "./utils/leaderboardStorage";
import { validateAllMazeLevels } from "./utils/mazeValidation";

type Page = "home" | "levels" | "game" | "leaderboard";
const THEME_STORAGE_KEY = "meeting-room-escape-theme";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    } catch {
      // Ignore storage failures and fall back to a calm office default.
    }
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      validateAllMazeLevels(mazeLevels);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("主题偏好保存失败", error);
    }
  }, [theme]);

  const selectedLevel = useMemo(
    () => mazeLevels.find((level) => level.id === selectedLevelId) ?? mazeLevels[0],
    [selectedLevelId],
  );

  function refreshLeaderboard() {
    setLeaderboardEntries(getLeaderboard());
  }

  function openLevel(levelId: number) {
    const nextLevel = mazeLevels.find((level) => level.id === levelId);
    if (!nextLevel) {
      console.error(`当前关卡不存在：${levelId}`);
      setPage("levels");
      return;
    }
    setSelectedLevelId(levelId);
    setPage("game");
  }

  if (page === "levels") {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <LevelSelect levels={mazeLevels} onBackHome={() => setPage("home")} onSelectLevel={openLevel} />
      </>
    );
  }

  if (page === "game") {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <MazeGame
          leaderboardEntries={leaderboardEntries}
          level={selectedLevel}
          onBackHome={() => setPage("home")}
          onLeaderboardChange={refreshLeaderboard}
          onNextLevel={openLevel}
          onSelectLevel={() => setPage("levels")}
        />
      </>
    );
  }

  if (page === "leaderboard") {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 lg:px-8 lg:py-10">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-3xl border border-line bg-panel/80 p-5 shadow-glow">
            <div>
              <p className="text-sm font-black text-cyan">Leaderboard</p>
              <h1 className="text-3xl font-black text-white">排行榜</h1>
            </div>
            <button className="h-11 rounded-xl border border-line bg-panelSoft px-5 text-white" onClick={() => setPage("home")} type="button">
              返回首页
            </button>
          </div>
          <Leaderboard entries={leaderboardEntries} />
        </main>
      </>
    );
  }

  return (
    <>
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <HomePage
        entries={leaderboardEntries}
        onSelectLevel={() => setPage("levels")}
        onShowLeaderboard={() => setPage("leaderboard")}
        onStartCampaign={() => openLevel(1)}
      />
    </>
  );
}
