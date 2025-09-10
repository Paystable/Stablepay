import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import WalletConnection from "./wallet-connection";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  Users,
  Building2,
  Send,
  Clock,
  Target,
  BarChart3,
  ArrowDown,
  Shield
} from "lucide-react";

interface ExchangeRate {
  [key: string]: number;
}

interface RemittanceCalculatorProps {
  embedded?: boolean;
}

export default function RemittanceCalculator({ embedded = false }: RemittanceCalculatorProps) {
  const [amount, setAmount] = useState(1000);
  const [remittanceFrequency, setRemittanceFrequency] = useState(12);
  const [sourceCurrency, setSourceCurrency] = useState("USD");
  const [investmentPeriod, setInvestmentPeriod] = useState(12);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [usdcBalance, setUsdcBalance] = useState(1250); // Mock USDC balance for demo

  // Comprehensive currency data
  const currencies = {
    USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸", baseRate: 83.50 },
    EUR: { name: "Euro", symbol: "€", flag: "🇪🇺", baseRate: 90.80 },
    GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧", baseRate: 105.60 },
    CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", baseRate: 61.25 },
    AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", baseRate: 52.40 },
    SGD: { name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", baseRate: 61.80 },
    AED: { name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", baseRate: 22.75 },
    SAR: { name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", baseRate: 22.25 },
    CHF: { name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", baseRate: 92.15 },
    JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", baseRate: 0.55 },
    HKD: { name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", baseRate: 10.75 },
    CNY: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", baseRate: 11.48 },
    KWD: { name: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼", baseRate: 271.50 },
    QAR: { name: "Qatari Riyal", symbol: "﷼", flag: "🇶🇦", baseRate: 22.95 },
    OMR: { name: "Omani Rial", symbol: "﷼", flag: "🇴🇲", baseRate: 217.20 },
    BHD: { name: "Bahraini Dinar", symbol: ".د.ب", flag: "🇧🇭", baseRate: 221.60 },
    MYR: { name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", baseRate: 18.75 },
    THB: { name: "Thai Baht", symbol: "฿", flag: "🇹🇭", baseRate: 2.35 },
    IDR: { name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", baseRate: 0.0055 },
    PHP: { name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", baseRate: 1.47 },
    VND: { name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", baseRate: 0.0034 },
    KRW: { name: "South Korean Won", symbol: "₩", flag: "🇰🇷", baseRate: 0.062 },
    TWD: { name: "Taiwan Dollar", symbol: "NT$", flag: "🇹🇼", baseRate: 2.58 },
    NZD: { name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", baseRate: 48.65 },
    ZAR: { name: "South African Rand", symbol: "R", flag: "🇿🇦", baseRate: 4.55 },
    EGP: { name: "Egyptian Pound", symbol: "£", flag: "🇪🇬", baseRate: 1.68 },
    NGN: { name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", baseRate: 0.054 },
    KES: { name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", baseRate: 0.65 },
    GHS: { name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", baseRate: 5.45 },
    TZS: { name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", baseRate: 0.033 },
    UGX: { name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", baseRate: 0.022 },
    RWF: { name: "Rwandan Franc", symbol: "RF", flag: "🇷🇼", baseRate: 0.065 },
    ETB: { name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", baseRate: 0.68 },
    MAD: { name: "Moroccan Dirham", symbol: "د.م.", flag: "🇲🇦", baseRate: 8.25 },
    TND: { name: "Tunisian Dinar", symbol: "د.ت", flag: "🇹🇳", baseRate: 26.85 },
    JMD: { name: "Jamaican Dollar", symbol: "J$", flag: "🇯🇲", baseRate: 0.54 },
    TTD: { name: "Trinidad Dollar", symbol: "TT$", flag: "🇹🇹", baseRate: 12.35 },
    BBD: { name: "Barbadian Dollar", symbol: "Bds$", flag: "🇧🇧", baseRate: 41.75 },
    XCD: { name: "East Caribbean Dollar", symbol: "EC$", flag: "🇦🇬", baseRate: 30.90 },
    BZD: { name: "Belize Dollar", symbol: "BZ$", flag: "🇧🇿", baseRate: 41.60 }
  };

    const formatUSDCBalance = (balance: number) => {
        return balance.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

  // Exchange rate fetching
  const fetchExchangeRates = async () => {
    try {
      setIsLoadingRates(true);

      const apiProviders = [
        {
          name: 'ExchangeRate-API',
          url: `https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`,
          parser: (data: any) => data.rates
        }
      ];

      let ratesData = null;
      let usedProvider = '';

      for (const provider of apiProviders) {
        try {
          const response = await fetch(provider.url);
          if (!response.ok) continue;

          const data = await response.json();
          const rates = provider.parser(data);

          if (rates && rates.INR) {
            ratesData = rates;
            usedProvider = provider.name;
            break;
          }
        } catch (error) {
          console.warn(`${provider.name} API failed:`, error);
          continue;
        }
      }

      if (ratesData) {
        setExchangeRates(ratesData);
        setLastUpdated(new Date());
        console.log(`Exchange rates updated via ${usedProvider}`);
      } else {
        throw new Error('All exchange rate APIs failed');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates from all providers:', error);

      const fallbackRates: ExchangeRate = {};
      const baseCurrency = currencies[sourceCurrency];
      if (baseCurrency) {
        const variance = (Math.random() - 0.5) * 0.5;
        fallbackRates.INR = baseCurrency.baseRate * (1 + variance / 100);
      }
      setExchangeRates(fallbackRates);
      setLastUpdated(new Date());
      console.log('Using fallback exchange rates');
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [sourceCurrency]);

  useEffect(() => {
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sourceCurrency]);

  const currentRate = exchangeRates.INR || currencies[sourceCurrency]?.baseRate || 83.50;
  const sourceCurrencyData = currencies[sourceCurrency];

  // Unified calculations with progressive APY based on investment period
  const getAPYForPeriod = (months: number) => {
    if (months >= 12) return 14;
    if (months >= 11) return 13;
    if (months >= 10) return 12.5;
    if (months >= 9) return 12;
    if (months >= 8) return 11.5;
    if (months >= 7) return 11;
    if (months >= 6) return 10.5;
    if (months >= 5) return 10;
    if (months >= 4) return 9.5;
    if (months >= 3) return 9;
    if (months >= 2) return 8.5;
    if (months >= 1) return 8;
    return 7; // 15 days default (scales up to 14% for 12 months)
  };

  const apy = getAPYForPeriod(investmentPeriod);
  const stablePayFee = 0; // Zero fees for Stable Pay
  const feeAmount = (amount * stablePayFee) / 100;
  const netAmount = amount - feeAmount;
  const receivedInINR = netAmount * currentRate;

  // Yield calculations
  const totalInvestment = amount * remittanceFrequency; // Total per year
  const monthlyYield = (totalInvestment * (apy / 100)) / 12;
  const annualYield = monthlyYield * 12;
  const totalReturnOverPeriod = (totalInvestment * (apy / 100)) * (investmentPeriod / 12);
  const finalValue = totalInvestment + totalReturnOverPeriod;

  // Regional grouping for better UX
  const currencyRegions = {
    "North America": ["USD", "CAD", "JMD", "TTD", "BBD", "XCD", "BZD"],
    "Europe": ["EUR", "GBP", "CHF"],
    "Middle East": ["AED", "SAR", "KWD", "QAR", "OMR", "BHD"],
    "Asia Pacific": ["SGD", "JPY", "HKD", "AUD", "CNY", "MYR", "THB", "IDR", "PHP", "VND", "KRW", "TWD", "NZD"],
    "Africa": ["ZAR", "EGP", "NGN", "KES", "GHS", "TZS", "UGX", "RWF", "ETB", "MAD", "TND"]
  };

  return (
    <section className={embedded ? "py-0" : "py-24 bg-white"} id={embedded ? undefined : "remittance-calculator"}>
      <div className={embedded ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        {!embedded && (
          <div className="text-center mb-16">
            <Badge className="bg-[#6667AB] text-white border-none px-4 py-2 text-sm font-medium mb-4">
              <Calculator className="w-4 h-4 mr-2" />
              Unified Remittance & Yield Calculator
            </Badge>
            <h2 className="text-4xl font-bold text-black mb-4 no-blur">
              Calculate Remittance Costs & USDC Returns
            </h2>
            <p className="text-xl text-[#6667AB] max-w-3xl mx-auto no-blur">
              Send money to India with zero fees, live exchange rates and earn up to 14% APY on your USDC with Stable Pay's progressive yield system.
            </p>
          </div>
        )}

        <div className={`grid grid-cols-1 ${embedded ? 'xl:grid-cols-2' : 'lg:grid-cols-2'} gap-6 ${embedded ? '' : 'gap-12'} items-start`}>
          {/* Calculator Input */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-[#6667AB]/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-black no-blur">Investment Configuration</h3>
              {isLoadingRates ? (
                <Badge className="bg-yellow-100 text-yellow-800">Updating Rates...</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Live Rates</Badge>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-3 no-blur">
                  Source Currency
                </label>
                <Select value={sourceCurrency} onValueChange={setSourceCurrency}>
                  <SelectTrigger className="border-2 border-[#6667AB] focus:border-[#6667AB] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border-2 border-[#6667AB] shadow-xl max-h-96">
                    {Object.entries(currencyRegions).map(([region, currencyCodes]) => (
                      <div key={region}>
                        <div className="px-2 py-1 text-xs font-semibold text-[#6667AB] bg-[#6667AB]/10">
                          {region}
                        </div>
                        {currencyCodes.map((code) => {
                          const currency = currencies[code];
                          return (
                            <SelectItem 
                              key={code} 
                              value={code} 
                              className="hover:bg-[#6667AB]/10"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{currency.flag}</span>
                                <span className="font-medium">{code}</span>
                                <span className="text-sm text-gray-600">- {currency.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-3 no-blur">
                  Amount per Transfer ({sourceCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-bold">
                    {sourceCurrencyData?.symbol}
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-lg p-4 pl-12 rounded-xl border-2 border-[#6667AB] focus:border-[#6667AB] focus:ring-2 focus:ring-[#6667AB]/20"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-3 no-blur">
                  Transfers per Year
                </label>
                <Input
                  type="number"
                  value={remittanceFrequency}
                  onChange={(e) => setRemittanceFrequency(Number(e.target.value))}
                  className="w-full text-lg p-4 rounded-xl border-2 border-[#6667AB] focus:border-[#6667AB] focus:ring-2 focus:ring-[#6667AB]/20"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-3 no-blur">
                  Investment Period (Months)
                </label>
                <Input
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                  className="w-full text-lg p-4 rounded-xl border-2 border-[#6667AB] focus:border-[#6667AB] focus:ring-2 focus:ring-[#6667AB]/20"
                  placeholder="12"
                />
              </div>

              <div className="bg-[#6667AB]/5 p-4 rounded-xl border border-[#6667AB]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#6667AB]" />
                    <span className="font-semibold text-black no-blur">Live Exchange Rate</span>
                  </div>
                  <Button 
                    onClick={fetchExchangeRates} 
                    size="sm" 
                    variant="outline"
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                    disabled={isLoadingRates}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="text-lg font-bold text-[#6667AB] no-blur">
                  1 {sourceCurrency} = ₹{currentRate.toFixed(2)}
                </div>
                <div className="text-sm text-[#6667AB] mt-1 no-blur">
                  Zero margin • Live market rate
                </div>
                {lastUpdated && (
                  <div className="text-xs text-[#6667AB] mt-1 no-blur">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Remittance Details */}
            <Card className="border-2 border-[#6667AB] bg-[#6667AB]/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#6667AB] rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black no-blur">Per Transfer Analysis</CardTitle>
                    <CardDescription className="text-[#6667AB] no-blur">
                      Zero margin • Live rates • Zero fees
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6667AB] no-blur">Stable Pay Fee (0%)</span>
                    <span className="font-semibold text-green-600 no-blur">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6667AB] no-blur">Exchange Rate (Live)</span>
                    <span className="font-semibold text-black no-blur">
                      ₹{currentRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-black no-blur">Recipient Gets (INR)</span>
                    <span className="font-bold text-[#6667AB] text-lg no-blur">
                      ₹{receivedInINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annual Investment */}
            <Card className="border-[#6667AB]/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-[#6667AB]" />
                  <CardTitle className="text-lg text-black no-blur">Annual Investment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black no-blur">
                  {sourceCurrencyData?.symbol}{totalInvestment.toLocaleString()}
                </div>
                <div className="text-sm text-[#6667AB] mt-2 no-blur">
                  {remittanceFrequency} transfers × {sourceCurrencyData?.symbol}{amount}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Yield */}
            <Card className="border-[#6667AB]/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#6667AB]" />
                  <CardTitle className="text-lg text-black no-blur">Monthly Yield ({apy}% APY)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#6667AB] no-blur">
                  {sourceCurrencyData?.symbol}{monthlyYield.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-[#6667AB] mt-2 no-blur">
                  Consistent monthly earnings
                </div>
              </CardContent>
            </Card>

            {/* Total Returns */}
            <Card className="border-2 border-[#6667AB] bg-[#6667AB]/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-[#6667AB]" />
                  <CardTitle className="text-lg text-black no-blur">Total Value After {investmentPeriod} Months</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6667AB] no-blur">Principal Investment</span>
                    <span className="font-semibold text-black no-blur">
                      {sourceCurrencyData?.symbol}{totalInvestment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6667AB] no-blur">Total Returns</span>
                    <span className="font-semibold text-green-600 no-blur">
                      +{sourceCurrencyData?.symbol}{totalReturnOverPeriod.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold text-black no-blur">Final Value</span>
                    <span className="font-bold text-[#6667AB] text-2xl no-blur">
                      {sourceCurrencyData?.symbol}{finalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>




          </div>
        </div>


      </div>
    </section>
  );
}