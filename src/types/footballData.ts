export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface FullScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: Score;
  halfTime: Score;
}

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: FullScore;
  referees?: Referee[];
  minute?: number;
}

export interface StandingEntry {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: StandingEntry[];
}

export interface Player {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  nationality: string;
  position: string | null;
  shirtNumber: number | null;
}

export interface Scorer {
  player: Player;
  team: Team;
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface H2HAggregates {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: { id: number; name: string; wins: number; draws: number; losses: number };
  awayTeam: { id: number; name: string; wins: number; draws: number; losses: number };
}

export interface MatchesResponse {
  matches: Match[];
}

export interface StandingsResponse {
  standings: Standing[];
}

export interface ScorersResponse {
  scorers: Scorer[];
}

export interface H2HResponse {
  aggregates: H2HAggregates;
  matches: Match[];
}
