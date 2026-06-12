import { useEffect } from "react";
import type { Match } from "../types/footballData";

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "グループステージ",
  ROUND_OF_32: "ラウンド32",
  ROUND_OF_16: "ベスト16",
  QUARTER_FINALS: "準々決勝",
  SEMI_FINALS: "準決勝",
  THIRD_PLACE: "3位決定戦",
  FINAL: "決勝",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "未開始",       color: "text-slate-400" },
  TIMED:     { label: "予定",         color: "text-slate-400" },
  IN_PLAY:   { label: "試合中",       color: "text-green-400" },
  PAUSED:    { label: "ハーフタイム", color: "text-yellow-400" },
  FINISHED:  { label: "終了",         color: "text-slate-400" },
  POSTPONED: { label: "延期",         color: "text-red-400" },
  CANCELLED: { label: "中止",         color: "text-red-400" },
};

export function H2HModal({ match, onClose }: MatchDetailModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const hasScore = match.score?.fullTime?.home !== null;
  const hasHalfTime = match.score?.halfTime?.home !== null;
  const statusInfo = STATUS_LABELS[match.status] ?? { label: match.status, color: "text-slate-400" };

  const matchDate = new Date(match.utcDate);
  const dateStr = matchDate.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", weekday: "short" });
  const timeStr = matchDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  const stageLabel = STAGE_LABELS[match.stage] ?? match.stage;
  const groupLabel = match.group ? ` ${match.group.replace(/^GROUP_/, "").replace(/^Group /, "")}組` : "";
  const referee = match.referees?.find((r) => r.type === "REFEREE");

  const homeName = match.homeTeam?.shortName ?? match.homeTeam?.tla ?? "ホーム";
  const awayName = match.awayTeam?.shortName ?? match.awayTeam?.tla ?? "アウェイ";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-600 w-full sm:rounded-xl sm:max-w-lg
                   rounded-t-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* 閉じるボタン */}
        <div className="flex justify-end px-4 pt-2 sm:pt-3">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none p-1">×</button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* ステージ */}
          <div className="text-center">
            <span className="text-xs text-slate-400">{stageLabel}{groupLabel}</span>
            {match.matchday && <span className="text-xs text-slate-500 ml-2">第{match.matchday}節</span>}
          </div>

          {/* チームとスコア */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col items-center gap-2">
              {match.homeTeam?.crest && (
                <img src={match.homeTeam.crest} alt={homeName}
                  className="w-14 h-14 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <span className="text-sm font-bold text-white text-center leading-tight">{homeName}</span>
            </div>

            <div className="flex-shrink-0 text-center min-w-[100px]">
              {hasScore ? (
                <div>
                  <div className={`text-4xl font-bold ${isLive ? "text-green-400" : "text-white"}`}>
                    {match.score.fullTime.home} - {match.score.fullTime.away}
                  </div>
                  {hasHalfTime && (
                    <div className="text-xs text-slate-400 mt-1">
                      前半 {match.score.halfTime.home} - {match.score.halfTime.away}
                    </div>
                  )}
                  {isFinished && match.score.duration !== "REGULAR" && (
                    <div className="text-xs text-yellow-400 mt-1">
                      {match.score.duration === "PENALTY_SHOOTOUT" ? "PK戦" : "延長戦"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold text-slate-500">vs</div>
              )}
              <div className={`text-xs mt-2 font-medium ${statusInfo.color} ${isLive ? "animate-pulse" : ""}`}>
                {statusInfo.label}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              {match.awayTeam?.crest && (
                <img src={match.awayTeam.crest} alt={awayName}
                  className="w-14 h-14 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <span className="text-sm font-bold text-white text-center leading-tight">{awayName}</span>
            </div>
          </div>

          {/* 試合情報 */}
          <div className="bg-slate-700/40 rounded-lg divide-y divide-slate-700">
            <InfoRow label="日時" value={`${dateStr} ${timeStr}`} />
            {referee && <InfoRow label="主審" value={`${referee.name}（${referee.nationality}）`} />}
            {isFinished && match.score.winner && (
              <InfoRow
                label="勝者"
                value={match.score.winner === "DRAW" ? "引き分け" : match.score.winner === "HOME_TEAM" ? homeName : awayName}
                highlight
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? "text-green-400 font-medium" : "text-white"}>{value}</span>
    </div>
  );
}
