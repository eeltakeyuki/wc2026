import type { Match } from "../types/footballData";

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "未開始", className: "text-slate-400" },
  TIMED: { label: "予定", className: "text-slate-400" },
  IN_PLAY: { label: "試合中", className: "text-green-400 animate-pulse" },
  PAUSED: { label: "HT", className: "text-yellow-400" },
  FINISHED: { label: "終了", className: "text-slate-500" },
  POSTPONED: { label: "延期", className: "text-red-400" },
  CANCELLED: { label: "中止", className: "text-red-400" },
};

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "グループ",
  ROUND_OF_32: "R32",
  ROUND_OF_16: "ベスト16",
  QUARTER_FINALS: "準々決勝",
  SEMI_FINALS: "準決勝",
  THIRD_PLACE: "3位",
  FINAL: "決勝",
};

export function MatchCard({ match, onClick }: MatchCardProps) {
  const statusInfo = STATUS_LABELS[match.status] ?? { label: match.status, className: "text-slate-400" };
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const hasScore = match.score.fullTime.home !== null;
  const hasHalfTime = match.score.halfTime.home !== null;
  const referee = match.referees?.find((r) => r.type === "REFEREE");

  const matchDate = new Date(match.utcDate);
  const dateStr = matchDate.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
  const timeStr = matchDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  const stageLabel = STAGE_LABELS[match.stage] ?? match.stage;
  const groupLabel = match.group ? ` ${match.group.replace(/^GROUP_/, "").replace(/^Group /, "")}組` : "";

  return (
    <div
      onClick={() => onClick?.(match)}
      className={`bg-slate-800 rounded-lg p-3 sm:p-4 border transition-colors ${
        isLive ? "border-green-500/50" : "border-slate-700"
      } ${onClick ? "cursor-pointer hover:border-slate-500 active:bg-slate-700/50" : ""}`}
    >
      {/* ヘッダー行 */}
      <div className="flex justify-between items-center mb-2 sm:mb-3 text-xs text-slate-400">
        <span>{stageLabel}{groupLabel}</span>
        <span className={statusInfo.className}>{statusInfo.label}</span>
      </div>

      {/* チーム・スコア */}
      <div className="flex items-center gap-2 sm:gap-3">
        <TeamBlock team={match.homeTeam} align="right" />

        <div className="flex-shrink-0 text-center w-[70px] sm:w-[90px]">
          {hasScore ? (
            <div>
              <div className={`text-xl sm:text-2xl font-bold ${isFinished ? "text-white" : "text-green-400"}`}>
                {match.score.fullTime.home} - {match.score.fullTime.away}
              </div>
              {hasHalfTime && (
                <div className="text-xs text-slate-500 mt-0.5">
                  前半 {match.score.halfTime.home}-{match.score.halfTime.away}
                </div>
              )}
              {isFinished && match.score.duration !== "REGULAR" && (
                <div className="text-xs text-yellow-500 mt-0.5">
                  {match.score.duration === "PENALTY_SHOOTOUT" ? "PK戦" : "延長"}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-xs sm:text-sm">
              <div className="font-medium leading-tight">{dateStr}</div>
              <div>{timeStr}</div>
            </div>
          )}
        </div>

        <TeamBlock team={match.awayTeam} align="left" />
      </div>

      {/* 審判 */}
      {referee && (
        <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-700/50 text-xs text-slate-500 text-center truncate">
          主審: {referee.name}（{referee.nationality}）
        </div>
      )}
    </div>
  );
}

function TeamBlock({ team, align }: { team: Match["homeTeam"]; align: "left" | "right" }) {
  return (
    <div className={`flex-1 flex items-center gap-1.5 sm:gap-2 min-w-0 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <img
        src={team.crest}
        alt={team.name}
        className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className={`text-xs sm:text-sm font-medium text-white truncate ${align === "right" ? "text-right" : "text-left"}`}>
        {team.shortName || team.tla}
      </span>
    </div>
  );
}
