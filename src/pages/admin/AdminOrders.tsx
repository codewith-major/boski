import React, { useState } from 'react';
import { useOrders } from '../../contexts/OrderContext';
import { useResources } from '../../contexts/ResourceContext';
import { useModeration } from '../../contexts/ModerationContext';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const { orders } = useOrders();
  const { resources } = useResources();
  const { allUsers } = useModeration();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getResourceTitle = (id: string) => resources.find(r => r.id === id)?.title || 'Unknown Resource';
  const getUserName = (id: string) => allUsers.find(u => u.id === id)?.name || 'Unknown User';

  const filteredOrders = orders.filter(e => {
    const resourceTitle = getResourceTitle(e.resourceId);
    const customerName = getUserName(e.customerId);
    const providerName = getUserName(e.providerId);
    
    const matchesSearch = 
      resourceTitle.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      providerName.toLowerCase().includes(search.toLowerCase());
      
    let matchesStatus = true;
    if (statusFilter !== 'ALL') matchesStatus = e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900">Orders</h1>
          <p className="text-stone-500 mt-1">Oversight of platform interactions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by resource or user..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-sm font-medium text-stone-500">
              <th className="px-6 py-4">Resource</th>
              <th className="px-6 py-4">Participants</th>
              <th className="px-6 py-4">Date Requested</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900 line-clamp-1 max-w-[200px]">{getResourceTitle(order.resourceId)}</p>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">{order.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center text-stone-600">
                        <span className="w-16 text-xs font-medium text-stone-400">Customer</span>
                        <Link to={`/admin/students/${order.customerId}`} className="hover:text-lime-700 hover:underline">{getUserName(order.customerId)}</Link>
                      </div>
                      <div className="flex items-center text-stone-600">
                        <span className="w-16 text-xs font-medium text-stone-400">Provider</span>
                        <Link to={`/admin/students/${order.providerId}`} className="hover:text-lime-700 hover:underline">{getUserName(order.providerId)}</Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(order.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/orders/${order.id}`} className="text-sm font-medium text-lime-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
