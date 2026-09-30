import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, ResourceType, PaymentStatus, PricingUnit } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: Partial<Order> & { resourceId: string, providerId: string }) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  acceptOrder: (id: string) => Promise<void>;
  declineOrder: (id: string) => Promise<void>;
  activateOrder: (id: string) => Promise<void>;
  completeOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function adaptRowToOrder(row: any): Order {
  return {
    id: row.id,
    resourceId: row.listing_id,
    customerId: row.customer_id,
    providerId: row.provider_id,
    resourceType: row.listings?.type || 'ITEM',
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    price: row.price,
    currency: row.currency || 'NGN',
    pricingUnit: row.pricing_unit as PricingUnit,
    requestedAt: row.requested_at,
    startDate: row.start_date,
    endDate: row.end_date,
    timing: row.timing,
    message: row.message,
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchOrders = async () => {
    if (!profile) {
      setOrders([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      // RLS ensures we only get orders where customer_id = profile.id OR provider_id = profile.id
      let { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, listings(type)')
        .order('created_at', { ascending: false });
        
      if (fetchError && (fetchError.code === 'PGRST303' || fetchError.message?.includes('JWT issued at future'))) {
        console.warn('Clock skew or JWT issued in future detected (PGRST303). Attempting session refresh & retry for orders...');
        try {
          await supabase.auth.refreshSession();
        } catch {
          await supabase.auth.signOut({ scope: 'local' });
        }
        await new Promise((res) => setTimeout(res, 1200));

        const retryResult = await supabase
          .from('orders')
          .select('*, listings(type)')
          .order('created_at', { ascending: false });
        data = retryResult.data;
        fetchError = retryResult.error;
      }

      if (fetchError) throw fetchError;
      
      if (data) {
        setOrders(data.map(adaptRowToOrder));
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [profile]);

  const addOrder = async (orderData: Partial<Order> & { resourceId: string, providerId: string }) => {
    if (!profile) throw new Error("Must be logged in to create an order");
    if (profile.id === orderData.providerId) throw new Error("Cannot order your own listing");
    
    // We must fetch the actual listing to get the frozen price
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('price, currency, pricing_unit, status')
      .eq('id', orderData.resourceId)
      .single();
      
    if (listingError) throw listingError;
    if (!listingData) throw new Error("Listing not found");
    if (listingData.status !== 'available' && listingData.status !== 'ACTIVE') {
      throw new Error("Listing is no longer available");
    }

    try {
      const { data, error: insertError } = await supabase.from('orders').insert({
        listing_id: orderData.resourceId,
        customer_id: profile.id,
        provider_id: orderData.providerId,
        price: listingData.price || 0,
        currency: listingData.currency || 'NGN',
        pricing_unit: listingData.pricing_unit,
        start_date: orderData.startDate,
        end_date: orderData.endDate,
        timing: orderData.timing,
        message: orderData.message,
        status: 'REQUESTED'
        // payment_status defaults to UNPAID in DB via trigger
      }).select('*, listings(type)').single();

      if (insertError) throw insertError;
      
      if (data) {
        setOrders(prev => [adaptRowToOrder(data), ...prev]);
      }
    } catch (err) {
      console.error("Error creating order:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, newState: OrderStatus) => {
    if (!profile) return;
    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ status: newState })
        .eq('id', id)
        .select('*, listings(type)').single();
        
      if (updateError) throw updateError;
      if (data) {
        setOrders(prev => prev.map(ex => ex.id === id ? adaptRowToOrder(data) : ex));
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  };

  const acceptOrder = (id: string) => updateOrderStatus(id, 'ACCEPTED');
  const declineOrder = (id: string) => updateOrderStatus(id, 'DECLINED');
  const activateOrder = (id: string) => updateOrderStatus(id, 'ACTIVE');
  const completeOrder = (id: string) => updateOrderStatus(id, 'COMPLETED');
  const cancelOrder = (id: string) => updateOrderStatus(id, 'CANCELLED');

  const getOrderById = (id: string) => {
    return orders.find(ex => ex.id === id);
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading,
      error,
      addOrder, 
      getOrderById,
      acceptOrder,
      declineOrder,
      activateOrder,
      completeOrder,
      cancelOrder,
      refreshOrders: fetchOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
