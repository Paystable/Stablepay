
import { ChevronDown } from "lucide-react";
import { BrandDropdown, BrandDropdownItem } from "./ui/brand-dropdown";

interface LockPeriodDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function LockPeriodDropdown({ value, onValueChange, className }: LockPeriodDropdownProps) {
  const lockPeriods = [
    { id: "15-days", label: "15 Days", months: 0.5, apy: 7, description: "Short-term liquidity with base returns" },
    { id: "1-months", label: "1 Month", months: 1, apy: 8, description: "Higher than traditional savings accounts" },
    { id: "2-months", label: "2 Months", months: 2, apy: 8.5, description: "Beat inflation with stable returns" },
    { id: "3-months", label: "3 Months", months: 3, apy: 9, description: "Quarterly commitment with solid gains" },
    { id: "4-months", label: "4 Months", months: 4, apy: 9.5, description: "Extended lock-in for enhanced yield" },
    { id: "5-months", label: "5 Months", months: 5, apy: 10, description: "Mid-term strategy with growing returns" },
    { id: "6-months", label: "6 Months", months: 6, apy: 10.5, description: "Semi-annual commitment, substantial APY" },
    { id: "7-months", label: "7 Months", months: 7, apy: 11, description: "Extended commitment with premium rates" },
    { id: "8-months", label: "8 Months", months: 8, apy: 11.5, description: "Long-term focus with excellent returns" },
    { id: "9-months", label: "9 Months", months: 9, apy: 12, description: "Premium lock-in with superior yields" },
    { id: "10-months", label: "10 Months", months: 10, apy: 12.5, description: "Extended tenure with exceptional rates" },
    { id: "11-months", label: "11 Months", months: 11, apy: 13, description: "Near-annual commitment, premium APY" },
    { id: "12-months", label: "12 Months", months: 12, apy: 14, description: "Maximum tenure with highest returns" }
  ];

  const selectedPeriod = lockPeriods.find(p => p.id === value);

  return (
    <div className="space-y-4">
      <BrandDropdown
        value={value}
        onValueChange={onValueChange}
        placeholder="Select lock period"
        className={className}
      >
        {lockPeriods.map((period) => (
          <BrandDropdownItem key={period.id} value={period.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-4">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-black text-sm sm:text-base truncate">{period.label}</span>
                <span className="text-xs text-[#6667AB] leading-tight line-clamp-2 sm:line-clamp-1">{period.description}</span>
              </div>
              <div className="flex items-center justify-end sm:justify-start">
                <span className="text-green-600 font-bold text-sm sm:text-base whitespace-nowrap">
                  Up to {period.apy}% APY
                </span>
              </div>
            </div>
          </BrandDropdownItem>
        ))}
      </BrandDropdown>

      {selectedPeriod && (
        <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-[#6667AB]/20">
          <div className="text-sm font-semibold text-black mb-2">Lock Period Details</div>
          <div className="space-y-1">
            <div className="text-xs text-[#6667AB]">
              Selected: <span className="font-medium">{selectedPeriod.label}</span> at <span className="font-medium text-green-600">{selectedPeriod.apy}% APY</span>
            </div>
            <div className="text-xs text-[#6667AB]">
              Estimated unlock: <span className="font-medium">{new Date(Date.now() + selectedPeriod.months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
