import type { Position } from "../types/maze";

type MobileControlsProps = {
  onMove: (direction: Position) => void;
};

const controls = [
  { label: "↑", className: "col-start-2", direction: { row: -1, col: 0 } },
  { label: "←", className: "col-start-1 row-start-2", direction: { row: 0, col: -1 } },
  { label: "↓", className: "col-start-2 row-start-2", direction: { row: 1, col: 0 } },
  { label: "→", className: "col-start-3 row-start-2", direction: { row: 0, col: 1 } },
];

export function MobileControls({ onMove }: MobileControlsProps) {
  return (
    <div className="grid touch-none grid-cols-3 gap-3 md:hidden">
      {controls.map((control) => (
        <button
          className={`${control.className} h-16 rounded-2xl border border-line bg-panelSoft text-2xl font-black text-white active:border-cyan active:bg-cyan/20`}
          key={control.label}
          onPointerDown={(event) => {
            event.preventDefault();
            onMove(control.direction);
          }}
          type="button"
        >
          {control.label}
        </button>
      ))}
    </div>
  );
}
