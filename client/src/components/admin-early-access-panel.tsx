import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Search, Filter, Download, Eye, Edit, Trash2, RefreshCw, AlertCircle, Users, DollarSign } from 'lucide-react';
import { 
  getEarlyAccessSubmissions, 
  getEarlyAccessStats, 
  updateEarlyAccessSubmission, 
  deleteEarlyAccessSubmission,
  type EarlyAccessSubmissionsResponse,
  type EarlyAccessStatsResponse
} from '@/lib/early-access-api';

interface EarlyAccessSubmission {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  formType: 'savings' | 'investment';
  monthlyRemittance?: number;
  investmentAmount?: number;
  lockPeriod?: string;
  riskTolerance?: string;
  primaryGoal?: string;
  referralSource?: string;
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

interface AdminStats {
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

export function AdminEarlyAccessPanel() {
  const [submissions, setSubmissions] = useState<EarlyAccessSubmission[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<EarlyAccessSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  const fetchSubmissions = async (page = 1, formType = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEarlyAccessSubmissions(
        page,
        20,
        formType !== 'all' ? formType : undefined
      );

      if (data && data.data) {
        const submissions = (data.data.submissions || []).map((sub: any) => ({
          ...sub,
          formType: sub.formType as 'savings' | 'investment'
        }));
        setSubmissions(submissions);
        setTotalPages(data.data.pagination?.pages || 1);
        setTotalSubmissions(data.data.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        setError('No data received from server');
        setSubmissions([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch submissions';
      setError(`Failed to fetch submissions: ${errorMessage}`);
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await getEarlyAccessStats();
      if (data && data.data) {
        setStats(data.data);
      } else {
        console.warn('No stats data received from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      console.error('Error fetching stats:', err);
      // Don't set error for stats as it's not critical
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, []);

  const handleFormTypeFilter = (value: string) => {
    setFormTypeFilter(value);
    fetchSubmissions(1, value);
  };

  const handleSearch = () => {
    // Filter submissions based on search term
    const filtered = submissions.filter(sub => 
      sub.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.phoneNumber.includes(searchTerm)
    );
    setSubmissions(filtered);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await deleteEarlyAccessSubmission(id);
      // Refresh submissions
      fetchSubmissions(currentPage, formTypeFilter);
      fetchStats();
    } catch (err) {
      setError('Failed to delete submission');
      console.error('Error deleting submission:', err);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        'Name', 'Email', 'Phone', 'Form Type', 'Monthly Remittance', 'Investment Amount',
        'Lock Period', 'Risk Tolerance', 'Primary Goal', 'Referral Source', 'Wallet Address',
        'Monthly Savings', 'Annual Savings', '5-Year Savings', 'APY Rate', 'Annual Yield',
        '5-Year Yield', 'Combined Benefit', 'IP Address', 'Submitted At'
      ].join(','),
      ...submissions.map(sub => [
        `"${sub.fullName}"`,
        `"${sub.email}"`,
        `"${sub.phoneNumber}"`,
        sub.formType,
        sub.monthlyRemittance || '',
        sub.investmentAmount || '',
        sub.lockPeriod || '',
        sub.riskTolerance || '',
        sub.primaryGoal || '',
        sub.referralSource || '',
        sub.walletAddress || '',
        sub.calculations?.monthlySavings || '',
        sub.calculations?.annualSavings || '',
        sub.calculations?.totalSavings5Years || '',
        sub.calculations?.projectedYield || '',
        sub.calculations?.annualYield || '',
        sub.calculations?.totalYield5Years || '',
        sub.calculations?.combinedBenefit || '',
        sub.ipAddress || '',
        new Date(sub.submittedAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stablepay-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubmissions = submissions.filter(sub => 
    searchTerm === '' || 
    sub.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Early Access Admin Panel</h1>
          <p className="text-muted-foreground">Manage early access submissions and view analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchSubmissions(currentPage, formTypeFilter)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                fetchSubmissions(currentPage, formTypeFilter);
              }}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentSubmissions} in last 24h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.formTypeBreakdown.savings}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.formTypeBreakdown.savings / stats.totalSubmissions) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.formTypeBreakdown.investment}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.formTypeBreakdown.investment / stats.totalSubmissions) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Potential Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCalculatedSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Over 5 years
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Financial Summary */}
      {submissions.length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription className="text-gray-600">
              Comprehensive financial overview of all submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800">
                  ${submissions.reduce((sum, sub) => sum + (sub.monthlyRemittance || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-green-700 font-medium">Total Monthly Remittance</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">
                  ${submissions.reduce((sum, sub) => sum + (sub.investmentAmount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700 font-medium">Total Investment Amount</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-800">
                  ${submissions.reduce((sum, sub) => sum + (sub.calculations?.annualSavings || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-purple-700 font-medium">Total Annual Savings</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-800">
                  ${submissions.reduce((sum, sub) => sum + (sub.calculations?.combinedBenefit || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-orange-700 font-medium">Total 5-Year Benefits</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-900">Filters</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={formTypeFilter} onValueChange={handleFormTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Form Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-900">Submissions ({totalSubmissions})</CardTitle>
          <CardDescription className="text-gray-600">
            Showing {filteredSubmissions.length} of {totalSubmissions} submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'No early access submissions have been received yet'}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    fetchSubmissions(currentPage, formTypeFilter);
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Phone</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Type</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Amount</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Savings/Returns</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Referral</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Submitted</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{submission.fullName}</TableCell>
                      <TableCell className="text-gray-900">{submission.email}</TableCell>
                      <TableCell className="text-gray-900">{submission.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant={submission.formType === 'savings' ? 'default' : 'secondary'}>
                          {submission.formType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {submission.monthlyRemittance 
                          ? `$${submission.monthlyRemittance.toLocaleString()}/month`
                          : submission.investmentAmount 
                          ? `$${submission.investmentAmount.toLocaleString()}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {submission.calculations ? (
                          <div className="text-xs space-y-1">
                            {submission.calculations.annualSavings && (
                              <div className="text-green-700 font-semibold">
                                ${submission.calculations.annualSavings.toLocaleString()}/yr
                              </div>
                            )}
                            {submission.calculations.annualYield && (
                              <div className="text-blue-700 font-semibold">
                                ${submission.calculations.annualYield.toLocaleString()}/yr
                              </div>
                            )}
                            {submission.calculations.combinedBenefit && (
                              <div className="text-purple-700 font-bold">
                                ${submission.calculations.combinedBenefit.toLocaleString()}/5yr
                              </div>
                            )}
                          </div>
                        ) : <span className="text-gray-500">N/A</span>}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {submission.referralSource ? (
                            <Badge variant="outline" className="text-xs">
                              {submission.referralSource.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ) : <span className="text-gray-500">N/A</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-900">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                          <br />
                          <span className="text-gray-500">
                            {new Date(submission.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Complete Submission Details
                                </DialogTitle>
                                <DialogDescription>
                                  Comprehensive information for {submission.fullName}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-6">
                                  {/* Personal Information */}
                                  <Card className="bg-white border border-gray-200">
                                    <CardHeader className="bg-gray-50">
                                      <CardTitle className="text-lg text-gray-900">👤 Personal Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="bg-white">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                                          <p className="text-sm font-semibold text-gray-900">{selectedSubmission.fullName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Email Address</label>
                                          <p className="text-sm font-semibold text-gray-900">{selectedSubmission.email}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                          <p className="text-sm font-semibold text-gray-900">{selectedSubmission.phoneNumber}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Form Type</label>
                                          <div className="mt-1">
                                            <Badge variant={selectedSubmission.formType === 'savings' ? 'default' : 'secondary'} className="text-sm">
                                              {selectedSubmission.formType === 'savings' ? '💰 Savings Calculator' : '📈 Investment Profile'}
                                            </Badge>
                                          </div>
                                        </div>
                                        {selectedSubmission.walletAddress && (
                                          <div className="col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                                            <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all text-gray-900">{selectedSubmission.walletAddress}</p>
                                          </div>
                                        )}
                                        {selectedSubmission.ipAddress && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">IP Address</label>
                                            <p className="text-sm font-mono text-gray-900">{selectedSubmission.ipAddress}</p>
                                          </div>
                                        )}
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Submitted At</label>
                                          <p className="text-sm text-gray-900">
                                            {new Date(selectedSubmission.submittedAt).toLocaleDateString()} at {new Date(selectedSubmission.submittedAt).toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Financial Information */}
                                  <Card className="bg-white border border-gray-200">
                                    <CardHeader className="bg-gray-50">
                                      <CardTitle className="text-lg text-gray-900">💵 Financial Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="bg-white">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedSubmission.monthlyRemittance && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Monthly Remittance</label>
                                            <p className="text-lg font-bold text-green-600">${selectedSubmission.monthlyRemittance.toLocaleString()}/month</p>
                                          </div>
                                        )}
                                        {selectedSubmission.investmentAmount && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Investment Amount</label>
                                            <p className="text-lg font-bold text-blue-600">${selectedSubmission.investmentAmount.toLocaleString()}</p>
                                          </div>
                                        )}
                                        {selectedSubmission.lockPeriod && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Lock Period</label>
                                            <p className="text-sm font-semibold text-gray-900">{selectedSubmission.lockPeriod.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                          </div>
                                        )}
                                        {selectedSubmission.riskTolerance && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Risk Tolerance</label>
                                            <p className="text-sm font-semibold text-gray-900">{selectedSubmission.riskTolerance.replace(/\b\w/g, l => l.toUpperCase())}</p>
                                          </div>
                                        )}
                                        {selectedSubmission.primaryGoal && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Primary Goal</label>
                                            <p className="text-sm font-semibold text-gray-900">{selectedSubmission.primaryGoal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                          </div>
                                        )}
                                        {selectedSubmission.referralSource && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Referral Source</label>
                                            <p className="text-sm font-semibold text-gray-900">{selectedSubmission.referralSource.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Calculations & Benefits */}
                                  {selectedSubmission.calculations && (
                                    <Card className="bg-white border border-gray-200">
                                      <CardHeader className="bg-gray-50">
                                        <CardTitle className="text-lg text-gray-900">📊 Calculated Benefits</CardTitle>
                                      </CardHeader>
                                      <CardContent className="bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {selectedSubmission.calculations.monthlySavings && (
                                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                              <label className="text-xs font-medium text-green-700">Monthly Savings</label>
                                              <p className="text-lg font-bold text-green-800">${selectedSubmission.calculations.monthlySavings.toLocaleString()}</p>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.annualSavings && (
                                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                              <label className="text-xs font-medium text-green-700">Annual Savings</label>
                                              <p className="text-lg font-bold text-green-800">${selectedSubmission.calculations.annualSavings.toLocaleString()}</p>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.totalSavings5Years && (
                                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                              <label className="text-xs font-medium text-green-700">5-Year Savings</label>
                                              <p className="text-lg font-bold text-green-800">${selectedSubmission.calculations.totalSavings5Years.toLocaleString()}</p>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.projectedYield && (
                                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                              <label className="text-xs font-medium text-blue-700">APY Rate</label>
                                              <p className="text-lg font-bold text-blue-800">{selectedSubmission.calculations.projectedYield}%</p>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.annualYield && (
                                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                              <label className="text-xs font-medium text-blue-700">Annual Returns</label>
                                              <p className="text-lg font-bold text-blue-800">${selectedSubmission.calculations.annualYield.toLocaleString()}</p>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.totalYield5Years && (
                                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                              <label className="text-xs font-medium text-blue-700">5-Year Returns</label>
                                              <p className="text-lg font-bold text-blue-800">${selectedSubmission.calculations.totalYield5Years.toLocaleString()}</p>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.combinedBenefit && (
                                            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 col-span-full">
                                              <label className="text-sm font-medium text-purple-700">Total 5-Year Benefit</label>
                                              <p className="text-2xl font-bold text-purple-800">${selectedSubmission.calculations.combinedBenefit.toLocaleString()}</p>
                                              <p className="text-xs text-purple-700">Combined savings + returns</p>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubmission(submission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSubmissions(currentPage - 1, formTypeFilter)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSubmissions(currentPage + 1, formTypeFilter)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
