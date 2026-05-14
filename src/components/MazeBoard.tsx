import type { CellCode, EnemyRuntime, Position } from "../types/maze";
import type { CSSProperties } from "react";
import { cellMeta, samePosition } from "../utils/mazeGameLogic";

type MazeBoardProps = {
  map: CellCode[][];
  player: Position;
  enemies: EnemyRuntime[];
};

export function MazeBoard({ map, player, enemies }: MazeBoardProps) {
  const cols = map[0]?.length ?? 1;
  const cellSize = `clamp(18px, min(72vw / ${cols}, 46px), 46px)`;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-line bg-panelSoft/90 p-2 shadow-glow dark:bg-slate-950/80">
      <div
        className="maze-grid grid gap-1"
        style={{
          "--maze-cols": cols,
          gridAutoRows: cellSize,
        } as CSSProperties}
      >
        {map.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const enemy = enemies.find((item) => samePosition(item.position, position));
            const isPlayer = samePosition(player, position);
            const meta = cellMeta[cell];

            return (
              <div
                aria-label={isPlayer ? "玩家" : enemy?.name ?? meta.label}
                className={`grid min-w-0 place-items-center rounded-md border text-[clamp(0.8rem,2.4vw,1.45rem)] leading-none ${meta.className} ${
                  isPlayer ? "ring-2 ring-cyan ring-offset-1 ring-offset-panel dark:ring-offset-slate-950" : ""
                } ${enemy ? "ring-2 ring-orange-400 ring-offset-1 ring-offset-panel dark:ring-orange-300 dark:ring-offset-slate-950" : ""}`}
                key={`${rowIndex}-${colIndex}`}
              >
                {isPlayer ? "🧑‍💻" : enemy?.icon ?? meta.icon}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
