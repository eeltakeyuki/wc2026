type Tab = "matches" | "groups" | "bracket" | "scorers";

interface NavBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  lastUpdated: Date | null;
}

const tabs: { id: Tab; icon: string; label: string; short: string }[] = [
  { id: "matches",  icon: "📅", label: "試合スケジュール", short: "試合" },
  { id: "groups",   icon: "📊", label: "グループ順位",     short: "順位" },
  { id: "bracket",  icon: "🏆", label: "トーナメント",     short: "T組" },
  { id: "scorers",  icon: "⚽", label: "得点者",           short: "得点" },
];

export function NavBar({ active, onChange, lastUpdated }: NavBarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* タイトル行 */}
        <div className="flex items-center justify-between py-2 sm:py-3">
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl">⚽</span>
            <span>FIFA W杯 2026</span>
          </h1>
          {lastUpdated && (
            <span className="text-xs text-slate-400 hidden sm:block">
              更新: {lastUpdated.toLocaleTimeString("ja-JP")}
            </span>
          )}
        </div>

        {/* タブ */}
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5
                px-1 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors
                border-b-2 ${
                  active === tab.id
                    ? "border-green-400 text-white bg-slate-800"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <span className="text-base sm:text-sm">{tab.icon}</span>
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export type { Tab };
