import type {
  MatchesResponse,
  StandingsResponse,
  ScorersResponse,
  H2HResponse,
  NewsResponse,
} from "../types/footballData";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export function fetchMatches(): Promise<MatchesResponse> {
  return apiFetch<MatchesResponse>("/competitions/WC/matches");
}

export function fetchStandings(): Promise<StandingsResponse> {
  return apiFetch<StandingsResponse>("/competitions/WC/standings");
}

export function fetchScorers(): Promise<ScorersResponse> {
  return apiFetch<ScorersResponse>("/competitions/WC/scorers?limit=20");
}

export function fetchH2H(matchId: number): Promise<H2HResponse> {
  return apiFetch<H2HResponse>(`/matches/${matchId}`);
}

export async function fetchNews(query: string): Promise<NewsResponse> {
  const res = await fetch(`/api/news/search?q=${encodeURIComponent(query)}&lang=en&max=5`);
  if (!res.ok) throw new Error(`News API error ${res.status}`);
  return res.json() as Promise<NewsResponse>;
}
