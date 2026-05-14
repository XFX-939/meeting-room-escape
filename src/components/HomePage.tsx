import type { LeaderboardEntry } from "../types/maze";
import { Leaderboard } from "./Leaderboard";

type HomePageProps = {
  entries: LeaderboardEntry[];
  onStartCampaign: () => void;
  onSelectLevel: () => void;
  onShowLeaderboard: () => void;
};

export function HomePage({ entries, onStartCampaign, onSelectLevel, onShowLeaderboard }: HomePageProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_390px] lg:px-8 lg:py-10">
      <section className="flex min-h-[70vh] flex-col justify-center rounded-3xl border border-line bg-panel/80 p-6 shadow-glow md:p-10">
        <p className="text-sm font-black uppercase tracking-normal text-cyan">Meeting Room Escape</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none text-white md:text-7xl">
          会议室逃生
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          从会议室一路逃到电梯口，躲开会议、Bug、需求变更和老板巡逻。适合办公室碎片时间的一局轻量迷宫。
        </p>
        <div className="mt-8 grid gap-3 sm:flex">
          <button className="h-12 rounded-xl bg-cyan px-6 font-black text-slate-950" onClick={onStartCampaign} type="button">
            开始闯关
          </button>
          <button
            className="h-12 rounded-xl border border-line bg-panelSoft px-6 font-bold text-white"
            onClick={onSelectLevel}
            type="button"
          >
            选择关卡
          </button>
          <button
            className="h-12 rounded-xl border border-line bg-panelSoft px-6 font-bold text-white"
            onClick={onShowLeaderboard}
            type="button"
          >
            排行榜
          </button>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          <Feature title="10 个固定关卡" text="从教学关到终极下班逃生。" />
          <Feature title="PC / 手机可玩" text="键盘、WASD 和虚拟方向键。" />
          <Feature title="排行榜 PK" text="本地持久化，后续可换后端。" />
        </div>
      </section>
      <Leaderboard compact entries={entries} />
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-950/40 p-4">
      <h2 className="font-bold text-white">{title}</h2>
      <p className="mt-2 leading-6 text-slate-400">{text}</p>
    </div>
  );
}
