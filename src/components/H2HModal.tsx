import { useState, useEffect } from "react";
import type { Match, H2HResponse } from "../types/footballData";
import { fetchH2H } from "../api/footballData";

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
  SCHEDULED: { label: "未開始", color: "text-slate-400" },
  TIMED:     { label: "予定",   color: "text-slate-400" },
  IN_PLAY:   { label: "試合中", color: "text-green-400" },
  PAUSED:    { label: "ハーフタイム", color: "text-yellow-400" },
  FINISHED:  { label: "終了",   color: "text-slate-400" },
  POSTPONED: { label: "延期",   color: "text-red-400" },
  CANCELLED: { label: "中止",   color: "text-red-400" },
};

export function H2HModal({ match, onClose }: MatchDetailModalProps) {
  const [h2h, setH2h] = useState<H2HResponse | null>(null);
  const [h2hOpen, setH2hOpen] = useState(false);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [h2hError, setH2hError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function toggleH2h() {
    setH2hOpen((prev) => !prev);
    if (!h2h && !h2hLoading) {
      setH2hLoading(true);
      fetchH2H(match.id)
        .then(setH2h)
        .catch((e) => setH2hError(e instanceof Error ? e.message : String(e)))
        .finally(() => setH2hLoading(false));
    }
  }

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
          {/* ステージ・状態 */}
          <div className="text-center">
            <span className="text-xs text-slate-400">{stageLabel}{groupLabel}</span>
            {match.matchday && <span className="text-xs text-slate-500 ml-2">第{match.matchday}節</span>}
          </div>

          {/* チームとスコア */}
          <div className="flex items-center gap-3">
            {/* ホーム */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {match.homeTeam?.crest && (
                <img src={match.homeTeam.crest} alt={homeName}
                  className="w-14 h-14 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <span className="text-sm font-bold text-white text-center leading-tight">{homeName}</span>
            </div>

            {/* スコア中央 */}
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
                <div className="text-slate-300 text-sm">
                  <div className="text-2xl font-bold text-slate-500">vs</div>
                </div>
              )}
              <div className={`text-xs mt-2 font-medium ${statusInfo.color} ${isLive ? "animate-pulse" : ""}`}>
                {statusInfo.label}
              </div>
            </div>

            {/* アウェイ */}
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

          {/* H2H アコーディオン */}
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={toggleH2h}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              <span>過去の直接対決</span>
              <span className="text-slate-500">{h2hOpen ? "▲" : "▼"}</span>
            </button>

            {h2hOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-700 space-y-3">
                {h2hLoading && (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {h2hError && <p className="text-red-400 text-xs text-center">{h2hError}</p>}
                {h2h && (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <StatBox label={match.homeTeam?.tla ?? "-"} value={h2h.aggregates.homeTeam.wins} sub="勝" color="text-green-400" />
                      <StatBox label="分" value={h2h.aggregates.homeTeam.draws} sub="" color="text-slate-300" />
                      <StatBox label={match.awayTeam?.tla ?? "-"} value={h2h.aggregates.awayTeam.wins} sub="勝" color="text-blue-400" />
                    </div>
                    <p className="text-center text-xs text-slate-500">
                      通算 {h2h.aggregates.numberOfMatches} 試合 / 総得点 {h2h.aggregates.totalGoals}
                    </p>
                    {h2h.matches.filter((m) => m.homeTeam && m.awayTeam).map((m) => (
                      <H2HMatchRow key={m.id} match={m} homeId={match.homeTeam?.id ?? 0} />
                    ))}
                    {h2h.matches.length === 0 && (
                      <p className="text-slate-500 text-xs text-center">過去の対戦データはありません</p>
                    )}
                  </>
                )}
              </div>
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

function StatBox({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="bg-slate-700/50 rounded-lg py-2">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label} {sub}</div>
    </div>
  );
}

function H2HMatchRow({ match, homeId }: { match: Match; homeId: number }) {
  const date = new Date(match.utcDate).toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  const isHomeWin = match.score?.winner === "HOME_TEAM";
  const isAwayWin = match.score?.winner === "AWAY_TEAM";
  const perspectiveHome = match.homeTeam?.id === homeId;
  const resultColor =
    match.status !== "FINISHED" ? "text-slate-400"
    : (perspectiveHome ? isHomeWin : isAwayWin) ? "text-green-400"
    : (perspectiveHome ? isAwayWin : isHomeWin) ? "text-red-400"
    : "text-slate-400";

  return (
    <div className="flex items-center gap-2 text-xs bg-slate-700/30 rounded px-3 py-2">
      <span className="text-slate-500 w-20 flex-shrink-0">{date}</span>
      <span className="text-slate-300 flex-1 text-right">{match.homeTeam?.tla ?? "-"}</span>
      <span className={`font-bold w-12 text-center ${resultColor}`}>
        {homeScore ?? "-"} - {awayScore ?? "-"}
      </span>
      <span className="text-slate-300 flex-1">{match.awayTeam?.tla ?? "-"}</span>
      {match.score?.duration !== "REGULAR" && match.status === "FINISHED" && (
        <span className="text-slate-500 flex-shrink-0">
          {match.score?.duration === "PENALTY_SHOOTOUT" ? "PK" : "延長"}
        </span>
      )}
    </div>
  );
}
