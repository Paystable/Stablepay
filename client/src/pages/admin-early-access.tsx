import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Mail, 
  Phone, 
  Wallet,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";

interface EarlyAccessSubmission {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  formType: 'savings' | 'investment';
  walletAddress?: string;
  calculations?: {
    annualSavings?: number;
    monthlySavings?: number;
    totalSavings5Years?: number;
    projectedYield?: number;
    annualYield?: number;
    totalYield5Years?: number;
    combinedBenefit?: number;
  };
  submittedAt: string;
  ipAddress?: string;
}

interface EarlyAccessStats {
  totalSubmissions: number;
  formTypeBreakdown: {
    savings: number;
    investment: number;
  };
  recentSubmissions: number;
  totalCalculatedSavings: number;
  totalCalculatedReturns: number;
  lastUpdated: string;
}

export default function AdminEarlyAccess() {
  const [submissions, setSubmissions] = useState<EarlyAccessSubmission[]>([]);
  const [stats, setStats] = useState<EarlyAccessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [submissionsResponse, statsResponse] = await Promise.all([
        fetch('/api/early-access/submissions'),
        fetch('/api/early-access/stats')
      ]);

      if (!submissionsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const submissionsData = await submissionsResponse.json();
      const statsData = await statsResponse.json();

      setSubmissions(submissionsData.data.submissions);
      setStats(statsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Form Type', 'Wallet Address', 'Monthly Remittance', 'Investment Amount', 'Combined Benefit', 'Submitted At'],
      ...submissions.map(sub => [
        sub.fullName,
        sub.email,
        sub.phoneNumber,
        sub.formType,
        sub.walletAddress || '',
        sub.calculations?.monthlySavings ? formatCurrency(sub.calculations.monthlySavings * 12) : '',
        sub.calculations?.annualYield ? formatCurrency(sub.calculations.annualYield / (sub.calculations.projectedYield || 1) * 100) : '',
        sub.calculations?.combinedBenefit ? formatCurrency(sub.calculations.combinedBenefit) : '',
        new Date(sub.submittedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `early-access-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#6667AB]" />
          <p className="text-[#6667AB]">Loading early access data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="bg-[#6667AB] hover:bg-[#6667AB]/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Early Access Dashboard</h1>
          <p className="text-[#6667AB]">Monitor and manage early access submissions</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="brand-card">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-[#6667AB] mx-auto mb-3" />
                <div className="text-3xl font-bold text-black">{stats.totalSubmissions}</div>
                <div className="text-sm text-[#6667AB]">Total Submissions</div>
              </CardContent>
            </Card>

            <Card className="brand-card">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-[#6667AB] mx-auto mb-3" />
                <div className="text-3xl font-bold text-black">{stats.formTypeBreakdown.savings}</div>
                <div className="text-sm text-[#6667AB]">Savings Forms</div>
              </CardContent>
            </Card>

            <Card className="brand-card">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-[#6667AB] mx-auto mb-3" />
                <div className="text-3xl font-bold text-black">{stats.formTypeBreakdown.investment}</div>
                <div className="text-sm text-[#6667AB]">Investment Forms</div>
              </CardContent>
            </Card>

            <Card className="brand-card">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-[#6667AB] mx-auto mb-3" />
                <div className="text-3xl font-bold text-black">{stats.recentSubmissions}</div>
                <div className="text-sm text-[#6667AB]">Last 24 Hours</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button onClick={fetchData} variant="outline" className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} className="bg-[#6667AB] hover:bg-[#6667AB]/90">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Submissions Table */}
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="text-xl text-black">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#6667AB]/20">
                    <th className="text-left py-3 px-4 font-semibold text-black">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-black">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-black">Form Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-black">Wallet</th>
                    <th className="text-left py-3 px-4 font-semibold text-black">Benefits</th>
                    <th className="text-left py-3 px-4 font-semibold text-black">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-[#6667AB]/10">
                      <td className="py-3 px-4">
                        <div className="font-medium text-black">{submission.fullName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-[#6667AB]">
                            <Mail className="w-3 h-3 mr-1" />
                            {submission.email}
                          </div>
                          <div className="flex items-center text-sm text-[#6667AB]">
                            <Phone className="w-3 h-3 mr-1" />
                            {submission.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${
                          submission.formType === 'savings' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.formType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {submission.walletAddress ? (
                          <div className="flex items-center text-sm text-[#6667AB]">
                            <Wallet className="w-3 h-3 mr-1" />
                            {submission.walletAddress.slice(0, 6)}...{submission.walletAddress.slice(-4)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not connected</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {submission.calculations?.combinedBenefit ? (
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(submission.calculations.combinedBenefit)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-[#6667AB]">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
