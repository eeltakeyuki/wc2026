import type { Scorer } from "../types/footballData";

interface ScorersProps {
  scorers: Scorer[];
}

export function Scorers({ scorers }: ScorersProps) {
  if (scorers.length === 0) {
    return <p className="text-slate-400 text-center py-8">得点者データがまだありません</p>;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-700 px-4 py-2">
        <h2 className="font-bold text-white text-sm">得点者ランキング</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 text-xs border-b border-slate-700">
            <th className="text-left px-3 py-2 w-8">#</th>
            <th className="text-left px-3 py-2">選手</th>
            <th className="text-left px-3 py-2 hidden sm:table-cell">チーム</th>
            <th className="text-center px-3 py-2">試合</th>
            <th className="text-center px-3 py-2 font-bold text-white">得点</th>
            <th className="text-center px-3 py-2">アシスト</th>
            <th className="text-center px-3 py-2 hidden sm:table-cell">PK</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, idx) => (
            <tr key={scorer.player.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
              <td className="px-3 py-2">
                <div className="font-medium text-white">{scorer.player.name}</div>
                <div className="text-xs text-slate-500 sm:hidden">{scorer.team.shortName || scorer.team.tla}</div>
              </td>
              <td className="px-3 py-2 hidden sm:table-cell">
                <div className="flex items-center gap-2">
                  <img
                    src={scorer.team.crest}
                    alt={scorer.team.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-slate-300">{scorer.team.shortName || scorer.team.tla}</span>
                </div>
              </td>
              <td className="text-center px-3 py-2 text-slate-400">{scorer.playedMatches}</td>
              <td className="text-center px-3 py-2 font-bold text-white text-base">{scorer.goals}</td>
              <td className="text-center px-3 py-2 text-slate-400">{scorer.assists ?? "-"}</td>
              <td className="text-center px-3 py-2 text-slate-400 hidden sm:table-cell">{scorer.penalties ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
