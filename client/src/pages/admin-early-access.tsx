import React, { useState, useEffect } from 'react';
import { AdminEarlyAccessPanel } from '../components/admin-early-access-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { getEarlyAccessStats, getEarlyAccessSubmissions } from '../lib/early-access-api';

interface AdminStats {
  totalSubmissions: number;
  totalSavings: number;
  averageSavings: number;
  growthRate: number;
  lastUpdated: string;
  recentSubmissions: number;
}

export default function AdminEarlyAccessPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats from API
      const statsData = await getEarlyAccessStats();
      const submissionsData = await getEarlyAccessSubmissions(1, 100);
      
      const adminStats: AdminStats = {
        totalSubmissions: statsData.data?.totalSubmissions || 0,
        totalSavings: statsData.data?.totalSavings || 0,
        averageSavings: statsData.data?.averageSavings || 0,
        growthRate: statsData.data?.growthRate || 0,
        lastUpdated: new Date().toISOString(),
        recentSubmissions: submissionsData.data?.submissions?.length || 0
      };
      
      setStats(adminStats);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    // Simple password check (in production, this should be more secure)
    const adminPassword = 'StablePay2024!'; // Change this to a more secure password
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      fetchStats();
    } else {
      setAuthError('Invalid password. Please try again.');
    }
    
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword('');
    setStats(null);
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-[#6667AB]" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Admin Access Required
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please enter the admin password to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {authError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  disabled={isAuthenticating || !password}
                  className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Default Password:</strong> StablePay2024!
                  <br />
                  <span className="text-xs text-blue-600">
                    Please change this password in production
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🔧 Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage early access submissions and monitor platform activity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchStats} 
                disabled={loading}
                className="bg-[#6667AB] hover:bg-[#6667AB]/90"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Submissions</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {loading ? (
                  <div className="animate-pulse bg-blue-200 h-8 w-16 rounded"></div>
                ) : (
                  formatNumber(stats?.totalSubmissions || 0)
                )}
              </div>
              <p className="text-xs text-blue-700 mt-1">Early access requests</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Savings</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {loading ? (
                  <div className="animate-pulse bg-green-200 h-8 w-20 rounded"></div>
                ) : (
                  formatCurrency(stats?.totalSavings || 0)
                )}
              </div>
              <p className="text-xs text-green-700 mt-1">Calculated savings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Average Savings</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {loading ? (
                  <div className="animate-pulse bg-purple-200 h-8 w-16 rounded"></div>
                ) : (
                  formatCurrency(stats?.averageSavings || 0)
                )}
              </div>
              <p className="text-xs text-purple-700 mt-1">Per submission</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Growth Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {loading ? (
                  <div className="animate-pulse bg-orange-200 h-8 w-12 rounded"></div>
                ) : (
                  `${(stats?.growthRate || 0).toFixed(1)}%`
                )}
              </div>
              <p className="text-xs text-orange-700 mt-1">Monthly growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Database Status</p>
                  <p className="text-2xl font-bold text-emerald-900">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-800">Last Updated</p>
                  <p className="text-sm font-bold text-indigo-900">
                    {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-rose-600" />
                <div>
                  <p className="text-sm font-medium text-rose-800">API Status</p>
                  <p className="text-sm font-bold text-rose-900">
                    {error ? 'Error' : 'Healthy'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel */}
        <div className="space-y-6">
          <AdminEarlyAccessPanel />
        </div>
      </div>
    </div>
  );
}