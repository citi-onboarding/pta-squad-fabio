import LatestLoans from "@/components/ui/LatestLoans";
import { latestLoansMock } from "@/components/ui/LatestLoans/mock";

export default function DashboardPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F7F9FA] px-[clamp(16px,4vw,80px)] py-6 min-[1920px]:min-h-[calc(100vh-88px)] min-[1920px]:px-[120px]">
      <div className="flex w-full flex-col gap-6">
        <LatestLoans loans={latestLoansMock} />
      </div>
    </main>
  );
}
