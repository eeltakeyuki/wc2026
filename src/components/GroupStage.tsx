import type { Standing } from "../types/footballData";
import { GroupTable } from "./GroupTable";

interface GroupStageProps {
  standings: Standing[];
}

export function GroupStage({ standings }: GroupStageProps) {
  const groupStandings = standings.filter(
    (s) => s.type === "TOTAL" && s.group !== null
  );

  if (groupStandings.length === 0) {
    return (
      <p className="text-slate-400 text-center py-8">
        グループステージのデータがまだありません
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groupStandings.map((s) => (
        <GroupTable key={s.group ?? s.stage} standing={s} />
      ))}
    </div>
  );
}
