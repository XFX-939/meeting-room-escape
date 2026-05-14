import type { MazeLevel } from "../types/maze";

type LevelSelectProps = {
  levels: MazeLevel[];
  onBackHome: () => void;
  onSelectLevel: (levelId: number) => void;
};

export function LevelSelect({ levels, onBackHome, onSelectLevel }: LevelSelectProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-line bg-panel/80 p-6 shadow-glow md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-cyan">Level Select</p>
          <h1 className="mt-2 text-4xl font-black text-white">选择关卡</h1>
          <p className="mt-3 max-w-2xl text-slate-300">第一版全部开放，后续可以接逐关解锁能力。</p>
        </div>
        <button className="h-11 rounded-xl border border-line bg-panelSoft px-5 font-bold text-white" onClick={onBackHome} type="button">
          返回首页
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((level) => (
          <article className="rounded-2xl border border-line bg-panel/90 p-5 shadow-glow" key={level.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-cyan">第 {level.id} 关</p>
                <h2 className="mt-1 text-xl font-black text-white">{level.name}</h2>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-slate-300">
                {level.timeLimitSeconds}s
              </span>
            </div>
            <p className="mt-3 min-h-12 leading-6 text-slate-400">{level.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span aria-label={`难度 ${level.difficulty} 星`} className="text-amber-300">
                {"★".repeat(level.difficulty)}
                <span className="text-slate-600">{"★".repeat(5 - level.difficulty)}</span>
              </span>
              <button
                className="h-10 rounded-xl bg-cyan px-4 font-black text-slate-950"
                onClick={() => onSelectLevel(level.id)}
                type="button"
              >
                进入
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
