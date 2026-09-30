import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { Message } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface MessageContextType {
  messages: Message[];
  sendMessage: (orderId: string, senderId: string, body: string) => Promise<void>;
  getMessagesForOrder: (orderId: string) => Message[];
  hasUnreadMessages: (orderId: string, userId: string) => boolean;
  markOrderMessagesRead: (orderId: string, userId: string) => Promise<void>;
  loadAndSubscribeToOrder: (orderId: string) => () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

function adaptRowToMessage(row: any): Message {
  return {
    id: row.id,
    orderId: row.order_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

export function MessageProvider({ children }: { children: ReactNode }) {
  // Store messages scoped strictly by orderId to prevent cross-order state contamination
  const [messagesByOrder, setMessagesByOrder] = useState<Record<string, Message[]>>({});
  const { profile } = useAuth();
  
  // Track active Realtime subscriptions to guarantee clean teardown
  const activeSubscriptions = useRef<Record<string, any>>({});

  const loadAndSubscribeToOrder = useCallback((orderId: string) => {
    if (!profile || !orderId) return () => {};

    // 1. Fetch messages strictly scoped to this specific order
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          const adapted = data.map(adaptRowToMessage);
          setMessagesByOrder(prev => {
            const currentForOrder = prev[orderId] || [];
            const existingIds = new Set(currentForOrder.map(m => m.id));
            const newMessages = adapted.filter(m => !existingIds.has(m.id));
            const merged = currentForOrder.map(m => adapted.find(a => a.id === m.id) || m);
            return {
              ...prev,
              [orderId]: [...merged, ...newMessages].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
            };
          });
        }
      } catch (err) {
        console.error("Error fetching order messages:", err);
      }
    };

    fetchMessages();

    // 2. Setup Scoped Realtime Subscription (order-specific channel)
    const channelName = `messages_order_${orderId}`;
    if (!activeSubscriptions.current[channelName]) {
      const channel = supabase.channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMsg = adaptRowToMessage(payload.new);
              setMessagesByOrder(prev => {
                const current = prev[orderId] || [];
                if (current.some(m => m.id === newMsg.id)) return prev;
                return {
                  ...prev,
                  [orderId]: [...current, newMsg]
                };
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedMsg = adaptRowToMessage(payload.new);
              setMessagesByOrder(prev => {
                const current = prev[orderId] || [];
                return {
                  ...prev,
                  [orderId]: current.map(m => m.id === updatedMsg.id ? updatedMsg : m)
                };
              });
            } else if (payload.eventType === 'DELETE') {
              setMessagesByOrder(prev => {
                const current = prev[orderId] || [];
                return {
                  ...prev,
                  [orderId]: current.filter(m => m.id !== payload.old.id)
                };
              });
            }
          }
        )
        .subscribe();
        
      activeSubscriptions.current[channelName] = channel;
    }

    // Return cleanup function to unsubscribe and free channel
    return () => {
      if (activeSubscriptions.current[channelName]) {
        supabase.removeChannel(activeSubscriptions.current[channelName]);
        delete activeSubscriptions.current[channelName];
      }
    };
  }, [profile]);

  const sendMessage = async (orderId: string, _senderId: string, body: string) => {
    if (!profile) throw new Error("Must be logged in to send a message");

    const trimmed = body.trim();
    if (!trimmed) throw new Error("Message body cannot be empty");
    if (trimmed.length > 10000) throw new Error("Message cannot exceed 10,000 characters");

    // Authenticated Supabase session is authoritative source of identity
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || profile.id;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: currentUserId,
          body: trimmed
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state with confirmed database message (avoiding duplicates)
      if (data) {
        const confirmedMsg = adaptRowToMessage(data);
        setMessagesByOrder(prev => {
          const current = prev[orderId] || [];
          if (current.some(m => m.id === confirmedMsg.id)) return prev;
          return {
            ...prev,
            [orderId]: [...current, confirmedMsg]
          };
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  const getMessagesForOrder = useCallback((orderId: string) => {
    const list = messagesByOrder[orderId] || [];
    return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messagesByOrder]);

  const hasUnreadMessages = useCallback((orderId: string, userId: string) => {
    const list = messagesByOrder[orderId] || [];
    return list.some(
      m => m.orderId === orderId && m.senderId !== userId && !m.readAt
    );
  }, [messagesByOrder]);

  const markOrderMessagesRead = async (orderId: string, userId: string) => {
    if (!profile) return;
    
    // Only target messages where the current user is the recipient (sender != userId)
    const currentList = messagesByOrder[orderId] || [];
    const unreadMessages = currentList.filter(
      m => m.orderId === orderId && m.senderId !== userId && !m.readAt
    );
    
    if (unreadMessages.length === 0) return;
    
    try {
      const now = new Date().toISOString();
      // Optimistic update locally for this order
      setMessagesByOrder(prev => {
        const current = prev[orderId] || [];
        return {
          ...prev,
          [orderId]: current.map(m => {
            if (m.orderId === orderId && m.senderId !== userId && !m.readAt) {
              return { ...m, readAt: now };
            }
            return m;
          })
        };
      });
      
      // Update in DB: Restrict update strictly to unread messages sent by the other party
      const { error } = await supabase
        .from('messages')
        .update({ read_at: now })
        .eq('order_id', orderId)
        .neq('sender_id', userId)
        .is('read_at', null);
        
      if (error) throw error;
      
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Flattened view for components requiring global list while preserving order scoping
  const allMessages = Object.values(messagesByOrder).flat();

  return (
    <MessageContext.Provider value={{ 
      messages: allMessages, 
      sendMessage, 
      getMessagesForOrder, 
      hasUnreadMessages, 
      markOrderMessagesRead,
      loadAndSubscribeToOrder
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
