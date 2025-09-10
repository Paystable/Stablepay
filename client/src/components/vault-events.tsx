
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { ExternalLink, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface VaultEvent {
  type: string;
  user: string;
  amount: string;
  timestamp: Date;
  txHash: string;
  blockHeight: number;
}

interface VaultActivity {
  deposits: VaultEvent[];
  withdrawals: VaultEvent[];
  yieldClaims: VaultEvent[];
  totalEvents: number;
}

interface VaultEventsProps {
  userAddress?: string;
}

export function VaultEvents({ userAddress }: VaultEventsProps) {
  const [activity, setActivity] = useState<VaultActivity | null>(null);
  const [userEvents, setUserEvents] = useState<VaultEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/vault/recent-activity?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch vault activity');
      }
      const data = await response.json();
      setActivity(data);
    } catch (err) {
      console.error('Error fetching vault activity:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchUserEvents = async () => {
    if (!userAddress) return;
    
    try {
      const response = await fetch(`/api/vault/user-events/${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user events');
      }
      const data = await response.json();
      setUserEvents(data.events);
    } catch (err) {
      console.error('Error fetching user events:', err);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchRecentActivity(), fetchUserEvents()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRecentActivity(), fetchUserEvents()]);
      setLoading(false);
    };
    
    loadData();
  }, [userAddress]);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'DepositSuccessful':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'WithdrawalSuccessful':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'YieldClaimed':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'DepositSuccessful':
        return 'bg-green-100 text-green-800';
      case 'WithdrawalSuccessful':
        return 'bg-red-100 text-red-800';
      case 'YieldClaimed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const EventsList = ({ events, title }: { events: VaultEvent[]; title: string }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-700">{title} ({events.length})</h4>
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={`${event.txHash}-${index}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                {getEventIcon(event.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getEventBadgeColor(event.type)}>
                      {event.type.replace('Successful', '')}
                    </Badge>
                    <span className="text-sm font-medium">${event.amount}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatAddress(event.user)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://basescan.org/tx/${event.txHash}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No {title.toLowerCase()} found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vault Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vault Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vault Activity</CardTitle>
            <CardDescription>
              Recent transactions and events from the StablePay vault
            </CardDescription>
          </div>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({activity?.totalEvents || 0})
            </TabsTrigger>
            <TabsTrigger value="deposits">
              Deposits ({activity?.deposits.length || 0})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Withdrawals ({activity?.withdrawals.length || 0})
            </TabsTrigger>
            <TabsTrigger value="yields">
              Yields ({activity?.yieldClaims.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-6">
              {activity?.deposits && activity.deposits.length > 0 && (
                <EventsList events={activity.deposits.slice(0, 5)} title="Recent Deposits" />
              )}
              {activity?.withdrawals && activity.withdrawals.length > 0 && (
                <EventsList events={activity.withdrawals.slice(0, 5)} title="Recent Withdrawals" />
              )}
              {activity?.yieldClaims && activity.yieldClaims.length > 0 && (
                <EventsList events={activity.yieldClaims.slice(0, 5)} title="Recent Yield Claims" />
              )}
              {userAddress && userEvents.length > 0 && (
                <EventsList events={userEvents.slice(0, 5)} title="Your Activity" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="deposits" className="mt-4">
            <EventsList events={activity?.deposits || []} title="All Deposits" />
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <EventsList events={activity?.withdrawals || []} title="All Withdrawals" />
          </TabsContent>

          <TabsContent value="yields" className="mt-4">
            <EventsList events={activity?.yieldClaims || []} title="All Yield Claims" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
