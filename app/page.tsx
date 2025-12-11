import Image from "next/image";

const Home = () => {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white">
      <header className="flex items-center gap-4 px-2 border-b border-gray-700/50 backdrop-blur-sm bg-black/30 sticky top-0 z-10">
        <div className="w-[120px] h-20 relative shrink-0">
          <Image
            src="/logo.webp"
            alt="Destiny Logo"
            fill
            sizes="120px"
            priority
            className="rounded-lg object-contain"
          />
        </div>
        <div className="flex-1 max-w-2xl">
          <input
            placeholder="Search stocks, symbols, or portfolio..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xs
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:white focus:border-transparent transition-all"
          />
        </div>
      </header>
    </main>
  );
};

export default Home;
