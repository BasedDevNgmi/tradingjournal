import { TradeList } from "@/components/trade-list";

export default function Home() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
          Trading Journal
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">
          Suen System / Superflat Edition
        </p>
      </header>

      <TradeList />
      
      <footer className="pt-12 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-black mt-12">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          © 2026 Trading Journal
        </p>
        <div className="flex gap-4">
          <div className="w-4 h-4 bg-black"></div>
          <div className="w-4 h-4 bg-green-400"></div>
          <div className="w-4 h-4 bg-red-400"></div>
          <div className="w-4 h-4 bg-yellow-300"></div>
        </div>
      </footer>
    </div>
  );
}
