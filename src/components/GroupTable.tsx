import type { Standing } from "../types/footballData";

interface GroupTableProps {
  standing: Standing;
}

export function GroupTable({ standing }: GroupTableProps) {
  const groupName = standing.group ?? "グループ";
  const letter = groupName.replace(/^GROUP_/, "").replace(/^Group /, "");

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-700 px-3 sm:px-4 py-2">
        <h3 className="font-bold text-white text-sm">グループ {letter}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-slate-700">
              <th className="text-left px-2 sm:px-3 py-2 w-6">#</th>
              <th className="text-left px-2 sm:px-3 py-2">チーム</th>
              <th className="text-center px-1.5 sm:px-2 py-2">試</th>
              <th className="text-center px-1.5 sm:px-2 py-2">勝</th>
              <th className="text-center px-1.5 sm:px-2 py-2">分</th>
              <th className="text-center px-1.5 sm:px-2 py-2">敗</th>
              <th className="text-center px-1.5 sm:px-2 py-2 hidden sm:table-cell">得</th>
              <th className="text-center px-1.5 sm:px-2 py-2 hidden sm:table-cell">失</th>
              <th className="text-center px-1.5 sm:px-2 py-2">差</th>
              <th className="text-center px-1.5 sm:px-2 py-2 font-bold text-white">点</th>
            </tr>
          </thead>
          <tbody>
            {standing.table.map((entry, idx) => (
              <tr
                key={entry.team.id}
                className={`border-b border-slate-700/50 ${
                  idx < 2 ? "text-white" : "text-slate-400"
                }`}
              >
                <td className="px-2 sm:px-3 py-2 text-center text-slate-500 text-xs">{entry.position}</td>
                <td className="px-2 sm:px-3 py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <img
                      src={entry.team.crest}
                      alt={entry.team.name}
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="truncate max-w-[72px] sm:max-w-[120px] text-xs sm:text-sm">
                      {entry.team.shortName || entry.team.tla}
                    </span>
                  </div>
                </td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm">{entry.playedGames}</td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm">{entry.won}</td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm">{entry.draw}</td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm">{entry.lost}</td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm hidden sm:table-cell">{entry.goalsFor}</td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm hidden sm:table-cell">{entry.goalsAgainst}</td>
                <td className="text-center px-1.5 sm:px-2 py-2 text-xs sm:text-sm">
                  {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                </td>
                <td className="text-center px-1.5 sm:px-2 py-2 font-bold text-white text-xs sm:text-sm">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
