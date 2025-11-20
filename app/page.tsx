const Home = () => {
  // Sample watchlist data based on the target image
  const watchlist = [
    { symbol: 'FCL', last: 25.05, chg: 0.82, chgPct: 3.38, active: true },
    { symbol: 'PAUSHAK', last: 570.55, chg: -3.75, chgPct: -0.65 },
    { symbol: 'INDUSINDB', last: 829.40, chg: -10.20, chgPct: -1.21 },
    { symbol: 'WABAG', last: 1413.00, chg: 9.40, chgPct: 0.67 },
    { symbol: 'TEJASNET', last: 509.60, chg: -2.00, chgPct: -0.39 },
    { symbol: 'KOTIC', last: 440.25, chg: -6.35, chgPct: -1.42 },
    { symbol: 'ACE', last: 986.30, chg: -6.10, chgPct: -0.63 },
    { symbol: 'HSCL', last: 446.25, chg: -5.30, chgPct: -1.17 },
    { symbol: 'TAJGVK', last: 403.85, chg: -1.30, chgPct: -0.32 },
    { symbol: 'MAHSEAML', last: 571.00, chg: 5.55, chgPct: 0.98 },
    { symbol: 'WSTCSTPARL', last: 423.05, chg: -5.75, chgPct: -1.34 },
    { symbol: 'COALINDIA', last: 379.65, chg: 0.60, chgPct: 0.16 },
    { symbol: 'UNIPARTS', last: 492.25, chg: 4.00, chgPct: 0.82 },
    { symbol: 'SICACHI', last: 35.27, chg: -0.15, chgPct: -0.42 },
    { symbol: 'PPL', last: 260.85, chg: 2.60, chgPct: 1.01 },
    { symbol: 'MARKSANS', last: 193.07, chg: 3.92, chgPct: 2.07 },
    { symbol: 'AREEM', last: 968.60, chg: 8.50, chgPct: 0.89 },
    { symbol: 'DARLHR', last: 525.05, chg: 7.50, chgPct: 1.45 },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Main Chart Area */}
      <div className="flex-1 flex items-center justify-center border-r border-gray-800">
        <div className="text-gray-500 text-lg">
          Chart Area - TradingView Integration
        </div>
      </div>

      {/* Watchlist Sidebar */}
      <div className="w-96 bg-gray-950 flex flex-col">
        {/* Watchlist Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-base font-semibold">Watchlist</h2>
          <button className="text-gray-500 hover:text-white text-xl leading-none">
            +
          </button>
        </div>

        {/* THE WATCHER Section */}
        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
          THE WATCHER
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
          <div>Symbol</div>
          <div className="text-right">Last</div>
          <div className="text-right">Chg</div>
          <div className="text-right">Chg%</div>
        </div>

        {/* Watchlist Items */}
        <div className="flex-1 overflow-y-auto">
          {watchlist.map((stock) => (
            <div
              key={stock.symbol}
              className={`grid grid-cols-4 gap-2 px-4 py-2 text-sm hover:bg-gray-800 cursor-pointer border-b border-gray-900 ${
                stock.active ? 'bg-gray-800' : ''
              }`}
            >
              <div className="font-medium flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  stock.chg >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                {stock.symbol}
              </div>
              <div className="text-right">{stock.last.toFixed(2)}</div>
              <div className={`text-right ${stock.chg >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.chg >= 0 ? '+' : ''}{stock.chg.toFixed(2)}
              </div>
              <div className={`text-right ${stock.chgPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.chgPct >= 0 ? '+' : ''}{stock.chgPct.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
