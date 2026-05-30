import LatestLoans from "@/components/ui/LatestLoans";
import { latestLoansMock } from "@/components/ui/LatestLoans/mock";
import CardsDashboard from "@/components/ui/CardsDoDashboard";
import { BookChart } from "@/components/ui/Chart/BookChart/bookChart";

export default function DashboardPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F7F9FA] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[#0B0F19]">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280]">
            Visão geral da biblioteca
          </p>
        </div>

        <CardsDashboard />
        <BookChart />
        <LatestLoans loans={latestLoansMock} />
      </div>
    </main>
  );
}