import { useEffect, useState } from "react";
import { getSavedPlayerName, savePlayerName } from "../utils/leaderboardStorage";

type PlayerNameInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function validatePlayerName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 12) {
    return "姓名需要 2-12 个字符。";
  }
  if (!/^[\u4e00-\u9fa5A-Za-z0-9]+$/.test(trimmed)) {
    return "姓名仅支持中文、英文和数字。";
  }
  return null;
}

export function PlayerNameInput({ value, onChange }: PlayerNameInputProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedName = getSavedPlayerName();
    if (savedName && !value) {
      onChange(savedName);
    }
  }, [onChange, value]);

  function handleBlur() {
    const trimmed = value.trim();
    const nextError = trimmed ? validatePlayerName(trimmed) : null;
    setError(nextError);
    if (!nextError && trimmed) {
      onChange(trimmed);
      savePlayerName(trimmed);
    }
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">玩家姓名</span>
      <input
        className="h-11 w-full rounded-xl border border-line bg-slate-950/70 px-3 text-white outline-none transition focus:border-cyan"
        maxLength={12}
        onBlur={handleBlur}
        onChange={(event) => {
          onChange(event.target.value);
          setError(null);
        }}
        placeholder="2-12 位中文/英文/数字"
        value={value}
      />
      {error && <p className="mt-2 text-sm text-orange-300">{error}</p>}
    </label>
  );
}
