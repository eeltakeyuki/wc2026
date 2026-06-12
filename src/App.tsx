import { useState, useEffect, useCallback } from "react";
import type { Match, Standing, Scorer } from "./types/footballData";
import { fetchMatches, fetchStandings, fetchScorers } from "./api/footballData";
import { usePolling } from "./hooks/usePolling";
import { NavBar, type Tab } from "./components/NavBar";
import { MatchList } from "./components/MatchList";
import { GroupStage } from "./components/GroupStage";
import { Bracket } from "./components/Bracket";
import { Scorers } from "./components/Scorers";
import { H2HModal } from "./components/H2HModal";

export default function App() {
  const [tab, setTab] = useState<Tab>("matches");
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const hasLive = matches.some(
    (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
  );
  const pollInterval = hasLive ? 60_000 : 300_000;

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [matchRes, standRes, scorerRes] = await Promise.all([
        fetchMatches(),
        fetchStandings(),
        fetchScorers(),
      ]);
      setMatches(matchRes.matches);
      setStandings(standRes.standings);
      setScorers(scorerRes.scorers);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePolling(loadData, pollInterval);

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar active={tab} onChange={setTab} lastUpdated={lastUpdated} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
            <p className="font-medium mb-1">エラーが発生しました</p>
            <p>{error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-white text-xs"
            >
              再試行
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {tab === "matches" && (
              <MatchList matches={matches} standings={standings} onMatchClick={setSelectedMatch} />
            )}
            {tab === "groups" && <GroupStage standings={standings} />}
            {tab === "bracket" && <Bracket matches={matches} />}
            {tab === "scorers" && <Scorers scorers={scorers} />}
          </>
        )}
      </main>

      {selectedMatch && (
        <H2HModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
