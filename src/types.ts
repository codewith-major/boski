/**
 * Base Types for the Boski Platform
 */

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type Size = 'sm' | 'md' | 'lg';

export type ResourceType = 'ITEM' | 'SKILL' | 'HELP';
export type OrderStatus = 'REQUESTED' | 'ACCEPTED' | 'PAID' | 'ACTIVE' | 'RETURNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DECLINED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PricingUnit = 'day' | 'session' | 'project' | 'hour' | 'event' | 'fixed';

export interface School {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type UserRole = 'STUDENT' | 'ADMIN';
export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  initials: string;
  isVerified: boolean; // Keeping for backward compatibility if needed
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  role: UserRole;
  schoolId?: string;
  avatarUrl?: string;
  rating?: number;
  totalRatings?: number;
  completedOrders?: number;
  completionRate?: number;
}

export type ReportTargetType = 'USER' | 'RESOURCE' | 'ORDER';
export type ReportReason = 'INAPPROPRIATE' | 'MISLEADING' | 'NO_SHOW' | 'SAFETY_CONCERN' | 'OTHER';
export type ReportStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

export interface Rating {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  feedback?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface Order {
  id: string;
  resourceId: string;
  customerId: string;
  providerId: string;
  resourceType: ResourceType;
  status: OrderStatus;
  /** @deprecated Legacy database compatibility only; not used in active marketplace logic */
  paymentStatus?: PaymentStatus;
  price: number;
  currency: 'NGN';
  pricingUnit: PricingUnit;
  requestedAt: string;
  startDate?: string;
  endDate?: string;
  timing?: string;
  message?: string;
}

export interface Resource {
  id: string;
  type: ResourceType;
  intent?: 'HAVE' | 'NEED';
  title: string;
  description: string;
  provider: User;
  status: 'available' | 'unavailable' | 'active';
  createdAt: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  condition?: string;
  availability?: string;
  price?: number;
  currency?: 'NGN';
  pricingUnit?: PricingUnit;
  budget?: number; // Optional for NEEDs
}

export type ActivityType = 
  | 'ORDER_REQUEST_RECEIVED'
  | 'ORDER_REQUEST_ACCEPTED'
  | 'ORDER_REQUEST_DECLINED'
  | 'ORDER_STARTED'
  | 'ORDER_COMPLETED'
  | 'NEW_ORDER_MESSAGE'
  | 'RATING_RECEIVED'
  | 'RESOURCE_REQUESTED';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  actorId?: string;
  resourceId?: string;
  orderId?: string;
  messageId?: string;
  ratingId?: string;
  title: string;
  description?: string;
  createdAt: string;
  readAt?: string;
}
