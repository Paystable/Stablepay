import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Search, Filter, Download, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
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
      const data = await getEarlyAccessSubmissions(
        page,
        20,
        formType !== 'all' ? formType : undefined
      );

      setSubmissions(data.data.submissions);
      setTotalPages(data.data.pagination.pages);
      setTotalSubmissions(data.data.pagination.total);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getEarlyAccessStats();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
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
      ['Name', 'Email', 'Phone', 'Form Type', 'Amount', 'Submitted At'].join(','),
      ...submissions.map(sub => [
        sub.fullName,
        sub.email,
        sub.phoneNumber,
        sub.formType,
        sub.monthlyRemittance || sub.investmentAmount || 0,
        new Date(sub.submittedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `early-access-submissions-${new Date().toISOString().split('T')[0]}.csv`;
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
          <AlertDescription>{error}</AlertDescription>
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
              <div className="text-2xl font-bold">₹{stats.totalCalculatedSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Over 5 years
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
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
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({totalSubmissions})</CardTitle>
          <CardDescription>
            Showing {filteredSubmissions.length} of {totalSubmissions} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.fullName}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant={submission.formType === 'savings' ? 'default' : 'secondary'}>
                          {submission.formType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.monthlyRemittance 
                          ? `₹${submission.monthlyRemittance.toLocaleString()}/month`
                          : submission.investmentAmount 
                          ? `₹${submission.investmentAmount.toLocaleString()}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleDateString()}
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
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Submission Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for {submission.fullName}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Full Name</label>
                                      <p className="text-sm text-muted-foreground">{selectedSubmission.fullName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-muted-foreground">{selectedSubmission.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Phone</label>
                                      <p className="text-sm text-muted-foreground">{selectedSubmission.phoneNumber}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Form Type</label>
                                      <Badge variant={selectedSubmission.formType === 'savings' ? 'default' : 'secondary'}>
                                        {selectedSubmission.formType}
                                      </Badge>
                                    </div>
                                    {selectedSubmission.walletAddress && (
                                      <div className="col-span-2">
                                        <label className="text-sm font-medium">Wallet Address</label>
                                        <p className="text-sm text-muted-foreground font-mono">{selectedSubmission.walletAddress}</p>
                                      </div>
                                    )}
                                    {selectedSubmission.calculations && (
                                      <div className="col-span-2">
                                        <label className="text-sm font-medium">Calculations</label>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                          {selectedSubmission.calculations.annualSavings && (
                                            <div>
                                              <span className="text-xs text-muted-foreground">Annual Savings: </span>
                                              <span className="text-sm">₹{selectedSubmission.calculations.annualSavings.toLocaleString()}</span>
                                            </div>
                                          )}
                                          {selectedSubmission.calculations.totalSavings5Years && (
                                            <div>
                                              <span className="text-xs text-muted-foreground">5-Year Savings: </span>
                                              <span className="text-sm">₹{selectedSubmission.calculations.totalSavings5Years.toLocaleString()}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
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
