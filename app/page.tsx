import { Searchbar } from "../components/Searchbar";

const Home = () => {
  return (
    <header className="flex items-center gap-4 px-2 border-b border-gray-700/50 backdrop-blur-sm bg-black/30 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        <Searchbar />
      </div>
    </header>
  );
};

export default Home;
