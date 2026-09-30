import React, { useMemo } from 'react';
import { useModeration } from '../../contexts/ModerationContext';
import { useResources } from '../../contexts/ResourceContext';
import { useOrders } from '../../contexts/OrderContext';
import { useTrust } from '../../contexts/TrustContext';
import { calculateAnalytics } from '../../lib/analytics';
import { AnalyticsSection } from '../../components/analytics/AnalyticsSection';
import { MetricCard } from '../../components/analytics/MetricCard';

export default function AdminAnalytics() {
  const { allUsers } = useModeration();
  const { resources } = useResources();
  const { orders } = useOrders();
  const { ratings } = useTrust();

  const data = useMemo(() => {
    return calculateAnalytics(allUsers, resources, orders, ratings);
  }, [allUsers, resources, orders, ratings]);

  const formatPercent = (val: number) => `${Math.round(val * 100)}%`;
  const formatMoney = (val: number) => `₦${val.toLocaleString()}`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-900">Marketplace Analytics</h1>
        <p className="text-stone-500 mt-2">Understand demand, supply, orders, matching and marketplace health.</p>
      </div>

      {data.insights.length > 0 && (
        <div className="bg-lime-50 border border-lime-200 rounded-xl p-5 mb-8">
          <h3 className="font-display font-bold text-stone-900 mb-2">Marketplace Insights</h3>
          <ul className="list-disc pl-5 space-y-1 text-stone-800 text-sm">
            {data.insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 1 - OVERVIEW */}
      <AnalyticsSection title="Marketplace Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Completed Orders" value={data.orders.completedOrders} highlight />
          <MetricCard label="Active Orders" value={data.orders.activeOrders} />
          <MetricCard label="Active Providers" value={data.providers.activeProviders} />
          <MetricCard label="Active Customers" value={data.customers.activeCustomers} />
          <MetricCard label="Completion Rate" value={formatPercent(data.orders.completionRate)} />
        </div>
      </AnalyticsSection>

      {/* SECTION 2 - ORDER LIFECYCLE FUNNEL */}
      <AnalyticsSection title="Order Lifecycle Funnel">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 bg-stone-50 rounded-lg p-4 border border-stone-200 text-center relative">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Requested</div>
            <div className="text-2xl font-display font-bold text-stone-900">{data.orders.requestedOrders}</div>
          </div>
          <div className="hidden md:flex items-center text-stone-300">→</div>
          <div className="flex-1 bg-stone-50 rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Accepted</div>
            <div className="text-2xl font-display font-bold text-stone-900">{data.orders.acceptedOrders}</div>
            <div className="text-xs text-stone-400 mt-1">{formatPercent(data.orders.acceptanceRate)}</div>
          </div>
          <div className="hidden md:flex items-center text-stone-300">→</div>
          <div className="flex-1 bg-stone-50 rounded-lg p-4 border border-stone-200 text-center">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Active</div>
            <div className="text-2xl font-display font-bold text-stone-900">{data.orders.activeOrders}</div>
            {data.orders.activationRate !== undefined && (
              <div className="text-xs text-stone-400 mt-1">{formatPercent(data.orders.activationRate)}</div>
            )}
          </div>
          <div className="hidden md:flex items-center text-stone-300">→</div>
          <div className="flex-1 bg-stone-50 rounded-lg p-4 border border-stone-200 text-center border-l-4 border-l-lime-400">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Completed</div>
            <div className="text-2xl font-display font-bold text-stone-900">{data.orders.completedOrders}</div>
            <div className="text-xs text-stone-400 mt-1">{formatPercent(data.orders.completionRate)}</div>
          </div>
        </div>
      </AnalyticsSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 3 - SUPPLY VS DEMAND */}
        <AnalyticsSection title="Supply vs Demand">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard label="HAVE Listings" value={data.supplyDemand.totalHaveListings} />
            <MetricCard label="NEED Listings" value={data.supplyDemand.totalNeedListings} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-stone-500 mb-3 uppercase tracking-wider">Top Demanded (NEED)</h4>
              {data.supplyDemand.mostDemandedCategories.length > 0 ? (
                <ul className="space-y-2">
                  {data.supplyDemand.mostDemandedCategories.map(cat => (
                    <li key={cat.category} className="flex justify-between text-sm">
                      <span className="font-medium text-stone-800">{cat.category}</span>
                      <span className="text-stone-500">{cat.count} listings</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-400">No demand data available.</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-500 mb-3 uppercase tracking-wider">Top Supplied (HAVE)</h4>
              {data.supplyDemand.mostSuppliedCategories.length > 0 ? (
                <ul className="space-y-2">
                  {data.supplyDemand.mostSuppliedCategories.map(cat => (
                    <li key={cat.category} className="flex justify-between text-sm">
                      <span className="font-medium text-stone-800">{cat.category}</span>
                      <span className="text-stone-500">{cat.count} listings</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-400">No supply data available.</p>
              )}
            </div>
          </div>
        </AnalyticsSection>

        {/* SECTION 4 - MATCHING */}
        <AnalyticsSection title="Matching Performance">
          {data.matching.totalNeedListings > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <MetricCard label="Match Rate" value={formatPercent(data.matching.matchRate)} />
              <MetricCard label="Avg Match Score" value={Math.round(data.matching.averageMatchScore)} />
              <MetricCard label="Matched Needs" value={data.matching.matchedNeeds} />
              <MetricCard label="Unmatched Needs" value={data.matching.unmatchedNeeds} />
            </div>
          ) : (
            <div className="text-center p-8 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-stone-500 text-sm">No active NEED listings to match.</p>
            </div>
          )}
        </AnalyticsSection>

        {/* SECTION 5 - PROVIDERS */}
        <AnalyticsSection title="Provider Metrics">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Active Providers" value={data.providers.activeProviders} />
            <MetricCard label="Providers w/ Orders" value={data.providers.providersWithOrders} />
            <MetricCard label="Avg Listings / Provider" value={data.providers.averageListingsPerProvider.toFixed(1)} />
            <MetricCard label="Provider Completion Rate" value={formatPercent(data.providers.providerCompletionRate)} />
            <MetricCard label="Avg Provider Rating" value={data.providers.providerAverageRating > 0 ? data.providers.providerAverageRating.toFixed(1) : 'N/A'} />
          </div>
        </AnalyticsSection>

        {/* SECTION 6 - CUSTOMERS */}
        <AnalyticsSection title="Customer Metrics">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Active Customers" value={data.customers.activeCustomers} />
            <MetricCard label="Customers w/ Orders" value={data.customers.customersWithOrders} />
            <MetricCard label="Avg Orders / Customer" value={data.customers.averageOrdersPerCustomer.toFixed(1)} />
            <MetricCard label="Customer Completion Rate" value={formatPercent(data.customers.customerCompletionRate)} />
          </div>
        </AnalyticsSection>

        {/* SECTION 7 - MARKETPLACE EXCHANGE VALUE */}
        <AnalyticsSection title="Marketplace Exchange Value">
          <p className="text-xs text-stone-500 mb-4">
            Represents provider listing terms agreed between students. Boski does not collect or process these amounts.
          </p>
          {data.transactionValue.grossTransactionValue > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <MetricCard label="Gross Exchange Value" value={formatMoney(data.transactionValue.grossTransactionValue)} />
              <MetricCard label="Completed Exchange Value" value={formatMoney(data.transactionValue.completedTransactionValue)} />
              <MetricCard label="Average Order Value" value={formatMoney(data.transactionValue.averageOrderValue)} />
            </div>
          ) : (
            <div className="text-center p-8 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-stone-500 text-sm">No transaction value data available.</p>
            </div>
          )}
        </AnalyticsSection>

        {/* SECTION 8 - TRUST */}
        <AnalyticsSection title="Trust Metrics">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Platform Avg Rating" value={data.trust.averageRating > 0 ? data.trust.averageRating.toFixed(1) : 'N/A'} />
            <MetricCard label="Total Ratings" value={data.trust.totalRatings} />
            <MetricCard label="Rating Coverage" value={formatPercent(data.trust.ratingCoverage)} />
          </div>
        </AnalyticsSection>

      </div>
    </div>
  );
}
