import { useState, useMemo } from "react";
import type { Match, Standing } from "../types/footballData";
import { MatchCard } from "./MatchCard";
import { GroupStage } from "./GroupStage";

interface MatchListProps {
  matches: Match[];
  standings: Standing[];
  onMatchClick: (match: Match) => void;
}

type Filter = "upcoming" | "today" | "recent" | "all";

export function MatchList({ matches, standings, onMatchClick }: MatchListProps) {
  const [filter, setFilter] = useState<Filter>("upcoming");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400_000);

  const filtered = useMemo(() => {
    switch (filter) {
      case "upcoming":
        return [...matches]
          .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
          .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
      case "today":
        return matches
          .filter((m) => {
            const d = new Date(m.utcDate);
            return d >= todayStart && d < todayEnd;
          })
          .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
      case "recent":
        return matches
          .filter((m) => m.status === "FINISHED")
          .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
          .slice(0, 20);
      case "all":
        return [...matches].sort(
          (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        );
    }
  }, [matches, filter]);

  // 日付ごとにグループ化
  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const d = new Date(m.utcDate);
      const key = d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return [...map.entries()];
  }, [filtered]);

  const liveMatches = matches.filter(
    (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
  );

  const filterButtons: { id: Filter; label: string }[] = [
    { id: "upcoming", label: "今後の試合" },
    { id: "today", label: "本日" },
    { id: "recent", label: "直近結果" },
    { id: "all", label: "全試合" },
  ];

  return (
    <div className="space-y-6">
      {/* ライブ中 */}
      {liveMatches.length > 0 && (
        <div>
          <h2 className="text-green-400 font-bold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            ライブ中
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} onClick={onMatchClick} />
            ))}
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === btn.id
                ? "bg-green-500 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 試合一覧（日付グループ） */}
      {byDate.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          {filter === "today" ? "本日の試合はありません" : "該当する試合はありません"}
        </p>
      ) : (
        <div className="space-y-5">
          {byDate.map(([dateLabel, dayMatches]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-400 rounded-full inline-block" />
                {dateLabel}
                <span className="text-slate-500 font-normal">({dayMatches.length}試合)</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {dayMatches.map((m) => (
                  <MatchCard key={m.id} match={m} onClick={onMatchClick} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* グループステージ順位表 */}
      {standings.length > 0 && (
        <div className="pt-2 border-t border-slate-700">
          <h2 className="text-white font-bold mb-4 text-base">グループステージ 順位表</h2>
          <GroupStage standings={standings} />
        </div>
      )}
    </div>
  );
}
