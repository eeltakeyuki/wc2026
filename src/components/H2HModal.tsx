import { useState, useEffect } from "react";
import type { Match, H2HResponse } from "../types/footballData";
import { fetchH2H } from "../api/footballData";

interface H2HModalProps {
  match: Match;
  onClose: () => void;
}

export function H2HModal({ match, onClose }: H2HModalProps) {
  const [data, setData] = useState<H2HResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchH2H(match.id)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [match.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const homeName = match.homeTeam?.shortName ?? match.homeTeam?.tla ?? "ホーム";
  const awayName = match.awayTeam?.shortName ?? match.awayTeam?.tla ?? "アウェイ";
  const homeTla = match.homeTeam?.tla ?? "-";
  const awayTla = match.awayTeam?.tla ?? "-";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-600 w-full sm:rounded-xl sm:max-w-lg
                   rounded-t-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2 min-w-0">
            {match.homeTeam?.crest && (
              <img src={match.homeTeam.crest} alt={homeName}
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <span className="font-bold text-white text-sm truncate">{homeName}</span>
            <span className="text-slate-400 text-sm flex-shrink-0">vs</span>
            <span className="font-bold text-white text-sm truncate">{awayName}</span>
            {match.awayTeam?.crest && (
              <img src={match.awayTeam.crest} alt={awayName}
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>
          <button onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none flex-shrink-0 ml-2 p-1">×</button>
        </div>

        <div className="p-4 space-y-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {data && (
            <>
              {data.aggregates && (
                <div>
                  <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">過去の直接対決</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <StatBox label={homeTla} value={data.aggregates.homeTeam.wins} sub="勝" color="text-green-400" />
                    <StatBox label="引き分け" value={data.aggregates.homeTeam.draws} sub="" color="text-slate-300" />
                    <StatBox label={awayTla} value={data.aggregates.awayTeam.wins} sub="勝" color="text-blue-400" />
                  </div>
                  <div className="text-center mt-2 text-xs text-slate-500">
                    通算 {data.aggregates.numberOfMatches} 試合 / 総得点 {data.aggregates.totalGoals}
                  </div>
                </div>
              )}

              {data.matches.length > 0 ? (
                <div>
                  <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">直近の対戦</h3>
                  <div className="space-y-2">
                    {data.matches
                      .filter((m) => m.homeTeam && m.awayTeam)
                      .map((m) => (
                        <H2HMatchRow key={m.id} match={m} homeId={match.homeTeam?.id ?? 0} />
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-2">過去の対戦データはありません</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="bg-slate-700/50 rounded-lg py-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
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
