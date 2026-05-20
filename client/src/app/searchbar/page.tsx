import SearchBarWithFilter from "@/components/ui/SearchBarWithFilter";
// Apenas para teste e debug do componente
export default function SearchBarPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10 bg-slate-100">
      <div className="w-full max-w-2xl">
        <SearchBarWithFilter />
      </div>
    </main>
  );
}