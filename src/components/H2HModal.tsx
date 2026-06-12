import { useState, useEffect } from "react";
import type { Match, NewsArticle } from "../types/footballData";
import { fetchNews } from "../api/footballData";

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
  SCHEDULED: { label: "未開始",       color: "text-slate-400" },
  TIMED:     { label: "予定",         color: "text-slate-400" },
  IN_PLAY:   { label: "試合中",       color: "text-green-400" },
  PAUSED:    { label: "ハーフタイム", color: "text-yellow-400" },
  FINISHED:  { label: "終了",         color: "text-slate-400" },
  POSTPONED: { label: "延期",         color: "text-red-400" },
  CANCELLED: { label: "中止",         color: "text-red-400" },
};

export function H2HModal({ match, onClose }: MatchDetailModalProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const home = match.homeTeam?.name ?? match.homeTeam?.shortName ?? "";
    const away = match.awayTeam?.name ?? match.awayTeam?.shortName ?? "";
    const q = `${home} ${away} FIFA World Cup 2026`;
    fetchNews(q)
      .then((d) => setNews(d.articles))
      .catch((e) => setNewsError(e instanceof Error ? e.message : String(e)))
      .finally(() => setNewsLoading(false));
  }, [match.id]);

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
          {/* ステージ */}
          <div className="text-center">
            <span className="text-xs text-slate-400">{stageLabel}{groupLabel}</span>
            {match.matchday && <span className="text-xs text-slate-500 ml-2">第{match.matchday}節</span>}
          </div>

          {/* チームとスコア */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col items-center gap-2">
              {match.homeTeam?.crest && (
                <img src={match.homeTeam.crest} alt={homeName}
                  className="w-14 h-14 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <span className="text-sm font-bold text-white text-center leading-tight">{homeName}</span>
            </div>

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
                <div className="text-2xl font-bold text-slate-500">vs</div>
              )}
              <div className={`text-xs mt-2 font-medium ${statusInfo.color} ${isLive ? "animate-pulse" : ""}`}>
                {statusInfo.label}
              </div>
            </div>

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

          {/* 関連ニュース */}
          <div>
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📰</span> 関連ニュース
            </h3>

            {newsLoading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {newsError && (
              <p className="text-slate-500 text-xs text-center py-2">ニュースを取得できませんでした</p>
            )}

            {!newsLoading && !newsError && news.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-2">関連ニュースはありません</p>
            )}

            <div className="space-y-2">
              {news.map((article) => (
                <NewsCard key={article.url} article={article} />
              ))}
            </div>

            {/* Google検索ボタン */}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${match.homeTeam?.name ?? homeName} ${match.awayTeam?.name ?? awayName} FIFA ワールドカップ 2026`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
            >
              <GoogleIcon />
              Googleでもっと検索
            </a>
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

function NewsCard({ article }: { article: NewsArticle }) {
  const published = new Date(article.publishedAt).toLocaleDateString("ja-JP", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 bg-slate-700/40 hover:bg-slate-700 rounded-lg p-3 transition-colors group"
    >
      {article.image && (
        <img
          src={article.image}
          alt=""
          className="w-16 h-16 object-cover rounded flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium leading-snug line-clamp-2 group-hover:text-green-400 transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-slate-400 truncate">{article.source.name}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500 flex-shrink-0">{published}</span>
        </div>
      </div>
      <span className="text-slate-600 group-hover:text-slate-400 text-xs self-start flex-shrink-0">↗</span>
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
