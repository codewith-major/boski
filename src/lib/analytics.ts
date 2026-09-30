import { Order, Resource, User, Rating } from '../types';
import { getMatchesForResource } from './matching';

export interface AnalyticsData {
  marketplace: {
    totalStudents: number;
    verifiedStudents: number;
    activeProviders: number;
    activeCustomers: number;
    activeListings: number;
    activeHaveListings: number;
    activeNeedListings: number;
  };
  supplyDemand: {
    totalHaveListings: number;
    totalNeedListings: number;
    supplyDemandRatio: number;
    mostDemandedCategories: { category: string; count: number }[];
    mostSuppliedCategories: { category: string; count: number }[];
  };
  orders: {
    totalOrders: number;
    requestedOrders: number;
    acceptedOrders: number;
    paidOrders?: number; // legacy compatibility
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    acceptanceRate: number; // accepted / requested
    activationRate: number; // active / accepted
    paymentRate?: number; // legacy compatibility
    completionRate: number; // completed / active
  };
  transactionValue: {
    grossTransactionValue: number;
    completedTransactionValue: number;
    averageOrderValue: number;
  };
  matching: {
    totalNeedListings: number;
    matchedNeeds: number;
    unmatchedNeeds: number;
    matchRate: number;
    averageMatchScore: number;
  };
  providers: {
    activeProviders: number;
    providersWithOrders: number;
    averageListingsPerProvider: number;
    averageOrdersPerProvider: number;
    providerCompletionRate: number;
    providerAverageRating: number;
  };
  customers: {
    activeCustomers: number;
    customersWithOrders: number;
    averageOrdersPerCustomer: number;
    customerCompletionRate: number;
    averageCustomerOrderValue: number;
  };
  trust: {
    averageRating: number;
    totalRatings: number;
    ratedCompletedOrders: number;
    ratingCoverage: number;
  };
  insights: string[];
}

export function calculateAnalytics(
  users: User[],
  resources: Resource[],
  orders: Order[],
  ratings: Rating[]
): AnalyticsData {
  // Helpers
  const safeDiv = (num: number, den: number) => den === 0 ? 0 : num / den;
  const countBy = <T>(arr: T[], fn: (item: T) => boolean) => arr.filter(fn).length;
  
  // MARKETPLACE
  const students = users.filter(u => u.role === 'STUDENT');
  const totalStudents = students.length;
  const verifiedStudents = countBy(students, u => u.verificationStatus === 'VERIFIED');
  
  const providerIds = new Set(resources.filter(r => r.intent === 'HAVE').map(r => r.provider.id));
  orders.forEach(o => providerIds.add(o.providerId));
  const activeProviders = providerIds.size;
  
  const customerIds = new Set(resources.filter(r => r.intent === 'NEED').map(r => r.provider.id));
  orders.forEach(o => customerIds.add(o.customerId));
  const activeCustomers = customerIds.size;

  const activeListings = countBy(resources, r => r.status === 'available');
  const activeHaveListings = countBy(resources, r => r.status === 'available' && r.intent === 'HAVE');
  const activeNeedListings = countBy(resources, r => r.status === 'available' && r.intent === 'NEED');

  // SUPPLY DEMAND
  const totalHaveListings = countBy(resources, r => r.intent === 'HAVE');
  const totalNeedListings = countBy(resources, r => r.intent === 'NEED');
  const supplyDemandRatio = safeDiv(totalHaveListings, totalNeedListings);

  const getTopCategories = (intent: 'HAVE' | 'NEED') => {
    const cats: Record<string, number> = {};
    resources.filter(r => r.intent === intent && r.category).forEach(r => {
      cats[r.category!] = (cats[r.category!] || 0) + 1;
    });
    return Object.entries(cats)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };
  
  const mostDemandedCategories = getTopCategories('NEED');
  const mostSuppliedCategories = getTopCategories('HAVE');

  // ORDERS
  const totalOrders = orders.length;
  const requestedOrders = countBy(orders, o => o.status === 'REQUESTED');
  
  // Orders that reached at least ACCEPTED status
  const reachedAccepted = countBy(orders, o => ['ACCEPTED', 'PAID', 'ACTIVE', 'COMPLETED'].includes(o.status));
  const acceptedOrders = reachedAccepted;
  
  // Orders that reached at least ACTIVE status (including historical PAID)
  const reachedActive = countBy(orders, o => ['PAID', 'ACTIVE', 'COMPLETED'].includes(o.status));
  const paidOrders = countBy(orders, o => o.status === 'PAID');

  const activeOrders = countBy(orders, o => o.status === 'ACTIVE');
  const completedOrders = countBy(orders, o => o.status === 'COMPLETED');
  const cancelledOrders = countBy(orders, o => o.status === 'CANCELLED' || o.status === 'DECLINED');

  // To calculate acceptanceRate: accepted / (requested + all subsequent states + cancelled/declined)
  // Basically, orders that were acted upon (accepted or declined).
  const actedUponOrders = reachedAccepted + countBy(orders, o => o.status === 'DECLINED');
  const acceptanceRate = safeDiv(reachedAccepted, actedUponOrders || totalOrders);
  
  const activationRate = safeDiv(reachedActive, reachedAccepted);
  const paymentRate = safeDiv(paidOrders, reachedAccepted);
  const completionRate = safeDiv(completedOrders, reachedActive);

  // TRANSACTION VALUE
  const ordersWithValue = orders.filter(o => o.price !== undefined);
  const grossTransactionValue = ordersWithValue.reduce((sum, o) => sum + (o.price || 0), 0);
  const completedTransactionValue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + (o.price || 0), 0);
  const averageOrderValue = safeDiv(grossTransactionValue, ordersWithValue.length);

  // MATCHING
  const needListings = resources.filter(r => r.intent === 'NEED' && r.status === 'available');
  let matchedNeeds = 0;
  let totalMatchScore = 0;
  let totalMatches = 0;

  needListings.forEach(need => {
    const matches = getMatchesForResource(need, resources);
    if (matches.length > 0) {
      matchedNeeds++;
      matches.forEach(m => {
        totalMatchScore += m.score;
        totalMatches++;
      });
    }
  });

  const unmatchedNeeds = needListings.length - matchedNeeds;
  const matchRate = safeDiv(matchedNeeds, needListings.length);
  const averageMatchScore = safeDiv(totalMatchScore, totalMatches);

  // PROVIDER ANALYTICS
  const providersWithOrders = new Set(orders.map(o => o.providerId)).size;
  const providerListings = resources.filter(r => r.intent === 'HAVE');
  const averageListingsPerProvider = safeDiv(providerListings.length, activeProviders);
  const averageOrdersPerProvider = safeDiv(totalOrders, activeProviders);
  
  const providerCompleted = countBy(orders, o => o.status === 'COMPLETED');
  const providerCompletionRate = safeDiv(providerCompleted, reachedActive);

  const providerRatings = ratings.filter(r => providerIds.has(r.toUserId));
  const providerAverageRating = safeDiv(
    providerRatings.reduce((sum, r) => sum + r.score, 0),
    providerRatings.length
  );

  // CUSTOMER ANALYTICS
  const customersWithOrders = new Set(orders.map(o => o.customerId)).size;
  const averageOrdersPerCustomer = safeDiv(totalOrders, activeCustomers);
  const customerCompletionRate = safeDiv(completedOrders, reachedActive); // Same overall rate conceptually
  const averageCustomerOrderValue = averageOrderValue; // Same average

  // TRUST ANALYTICS
  const averageRating = safeDiv(
    ratings.reduce((sum, r) => sum + r.score, 0),
    ratings.length
  );
  const totalRatings = ratings.length;
  const ratedCompletedOrders = new Set(ratings.map(r => r.orderId)).size;
  const ratingCoverage = safeDiv(ratedCompletedOrders, completedOrders);

  // INSIGHTS
  const insights: string[] = [];
  
  if (mostDemandedCategories.length > 0) {
    const topDemand = mostDemandedCategories[0];
    const topSupply = mostSuppliedCategories.find(c => c.category === topDemand.category);
    if (!topSupply || topSupply.count < topDemand.count) {
      insights.push(`${topDemand.category} has the highest demand with insufficient supply.`);
    } else {
      insights.push(`${topDemand.category} is the most demanded category.`);
    }
  }

  if (mostSuppliedCategories.length > 0) {
    const topSupply = mostSuppliedCategories[0];
    const topDemand = mostDemandedCategories.find(c => c.category === topSupply.category);
    if (!topDemand || topDemand.count < topSupply.count / 2) {
      insights.push(`${topSupply.category} is oversupplied relative to demand.`);
    }
  }

  if (matchRate < 0.3 && needListings.length > 0) {
    insights.push(`Match rate is low (${Math.round(matchRate * 100)}%). Consider acquiring more supply.`);
  } else if (matchRate > 0.7) {
    insights.push(`Strong match rate (${Math.round(matchRate * 100)}%) indicating healthy marketplace liquidity.`);
  }

  if (completionRate < 0.5 && reachedActive > 0) {
    insights.push(`Order completion rate is low (${Math.round(completionRate * 100)}%). Providers may be failing to deliver.`);
  }

  return {
    marketplace: {
      totalStudents,
      verifiedStudents,
      activeProviders,
      activeCustomers,
      activeListings,
      activeHaveListings,
      activeNeedListings,
    },
    supplyDemand: {
      totalHaveListings,
      totalNeedListings,
      supplyDemandRatio,
      mostDemandedCategories,
      mostSuppliedCategories,
    },
    orders: {
      totalOrders,
      requestedOrders,
      acceptedOrders,
      paidOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      acceptanceRate,
      activationRate,
      paymentRate,
      completionRate,
    },
    transactionValue: {
      grossTransactionValue,
      completedTransactionValue,
      averageOrderValue,
    },
    matching: {
      totalNeedListings: needListings.length, // use active need listings for match
      matchedNeeds,
      unmatchedNeeds,
      matchRate,
      averageMatchScore,
    },
    providers: {
      activeProviders,
      providersWithOrders,
      averageListingsPerProvider,
      averageOrdersPerProvider,
      providerCompletionRate,
      providerAverageRating,
    },
    customers: {
      activeCustomers,
      customersWithOrders,
      averageOrdersPerCustomer,
      customerCompletionRate,
      averageCustomerOrderValue,
    },
    trust: {
      averageRating,
      totalRatings,
      ratedCompletedOrders,
      ratingCoverage,
    },
    insights,
  };
}
