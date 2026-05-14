import type { MazeLevel, Position } from "../types/maze";

const passable = new Set([".", "S", "E", "M", "B", "C", "T", "R", "N", "D"]);

export type MazeValidationResult = {
  valid: boolean;
  errors: string[];
};

export function findPositions(level: MazeLevel, marker: string): Position[] {
  const positions: Position[] = [];

  level.map.forEach((row, rowIndex) => {
    [...row].forEach((cell, colIndex) => {
      if (cell === marker) {
        positions.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  return positions;
}

export function validateMazeLevel(level: MazeLevel): MazeValidationResult {
  const errors: string[] = [];
  const rowLength = level.map[0]?.length ?? 0;
  const starts = findPositions(level, "S");
  const exits = findPositions(level, "E");

  if (starts.length !== 1) {
    errors.push(`关卡 ${level.id}「${level.name}」必须有且只有一个 S，当前 ${starts.length} 个。`);
  }

  if (exits.length !== 1) {
    errors.push(`关卡 ${level.id}「${level.name}」必须有且只有一个 E，当前 ${exits.length} 个。`);
  }

  if (level.map.some((row) => row.length !== rowLength)) {
    errors.push(`关卡 ${level.id}「${level.name}」地图行宽不一致。`);
  }

  level.map.forEach((row, rowIndex) => {
    [...row].forEach((cell, colIndex) => {
      if (!passable.has(cell) && cell !== "W") {
        errors.push(`关卡 ${level.id}「${level.name}」包含未知格子 ${cell} (${rowIndex}, ${colIndex})。`);
      }
    });
  });

  if (starts.length === 1 && exits.length === 1 && rowLength > 0) {
    const start = starts[0];
    const exit = exits[0];
    const queue: Position[] = [start];
    const visited = new Set([toKey(start)]);

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];

      for (const next of neighbors(current)) {
        const cell = level.map[next.row]?.[next.col];
        const key = toKey(next);

        if (cell && cell !== "W" && !visited.has(key)) {
          visited.add(key);
          queue.push(next);
        }
      }
    }

    if (!visited.has(toKey(exit))) {
      errors.push(`关卡 ${level.id}「${level.name}」S 到 E 不可达。`);
    }
  }

  level.enemies?.forEach((enemy) => {
    if (enemy.path.length < 2) {
      errors.push(`关卡 ${level.id}「${level.name}」敌人 ${enemy.name} 巡逻路径至少需要 2 格。`);
    }

    enemy.path.forEach((position) => {
      if (level.map[position.row]?.[position.col] === "W") {
        errors.push(`关卡 ${level.id}「${level.name}」敌人 ${enemy.name} 路径穿墙。`);
      }
    });
  });

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAllMazeLevels(levels: MazeLevel[]): boolean {
  return levels.every((level) => validateMazeLevel(level).valid);
}

function neighbors(position: Position): Position[] {
  return [
    { row: position.row - 1, col: position.col },
    { row: position.row + 1, col: position.col },
    { row: position.row, col: position.col - 1 },
    { row: position.row, col: position.col + 1 },
  ];
}

function toKey(position: Position): string {
  return `${position.row}:${position.col}`;
}
