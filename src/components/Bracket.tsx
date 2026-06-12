import type { Match } from "../types/footballData";

interface BracketProps {
  matches: Match[];
}

const KNOCKOUT_STAGES = [
  { key: "ROUND_OF_32", label: "ラウンド32" },
  { key: "ROUND_OF_16", label: "ベスト16" },
  { key: "QUARTER_FINALS", label: "準々決勝" },
  { key: "SEMI_FINALS", label: "準決勝" },
  { key: "THIRD_PLACE", label: "3位決定戦" },
  { key: "FINAL", label: "決勝" },
];

export function Bracket({ matches }: BracketProps) {
  const knockoutMatches = matches.filter(
    (m) => m.stage !== "GROUP_STAGE"
  );

  if (knockoutMatches.length === 0) {
    return (
      <p className="text-slate-400 text-center py-8">
        決勝トーナメントはまだ始まっていません
      </p>
    );
  }

  const byStage = KNOCKOUT_STAGES.map((stage) => ({
    ...stage,
    matches: knockoutMatches
      .filter((m) => m.stage === stage.key)
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()),
  })).filter((s) => s.matches.length > 0);

  return (
    <div className="space-y-6 overflow-x-auto">
      {byStage.map((stage) => (
        <div key={stage.key}>
          <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider border-b border-slate-700 pb-2">
            {stage.label}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stage.matches.map((match) => (
              <BracketMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketMatchCard({ match }: { match: Match }) {
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const hasScore = match.score.fullTime.home !== null;

  const homeWin =
    isFinished && match.score.winner === "HOME_TEAM";
  const awayWin =
    isFinished && match.score.winner === "AWAY_TEAM";

  const matchDate = new Date(match.utcDate);
  const dateStr = matchDate.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  const timeStr = matchDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`bg-slate-800 rounded-lg border p-3 ${
        isLive ? "border-green-500/50" : "border-slate-700"
      }`}
    >
      <div className="text-xs text-slate-400 mb-2">
        {hasScore || isLive ? (
          <span className={isLive ? "text-green-400 animate-pulse" : "text-slate-500"}>
            {isLive ? "試合中" : "終了"}
          </span>
        ) : (
          <span>{dateStr} {timeStr}</span>
        )}
      </div>
      <div className="space-y-1">
        <BracketTeamRow
          team={match.homeTeam}
          score={match.score.fullTime.home}
          isWinner={homeWin}
        />
        <BracketTeamRow
          team={match.awayTeam}
          score={match.score.fullTime.away}
          isWinner={awayWin}
        />
      </div>
      {isFinished && match.score.duration !== "REGULAR" && (
        <div className="text-xs text-slate-500 mt-1 text-right">
          {match.score.duration === "PENALTY_SHOOTOUT" ? "PK戦" : "延長戦"}
        </div>
      )}
    </div>
  );
}

function BracketTeamRow({
  team,
  score,
  isWinner,
}: {
  team: Match["homeTeam"];
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-2 py-1 rounded ${
        isWinner ? "bg-slate-700" : ""
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img
          src={team.crest}
          alt={team.name}
          className="w-5 h-5 object-contain flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span
          className={`text-sm truncate ${isWinner ? "text-white font-medium" : "text-slate-300"}`}
        >
          {team.shortName || team.tla}
        </span>
      </div>
      {score !== null && (
        <span className={`font-bold text-sm ${isWinner ? "text-white" : "text-slate-400"}`}>
          {score}
        </span>
      )}
    </div>
  );
}
