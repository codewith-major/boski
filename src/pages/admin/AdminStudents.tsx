import React, { useState } from 'react';
import { useModeration } from '../../contexts/ModerationContext';
import { Search, Filter, Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminStudents() {
  const { allUsers } = useModeration();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase());
    const isSuspended = user.accountStatus === 'SUSPENDED';
    const actualStatus = isSuspended ? 'SUSPENDED' : user.accountStatus;
    
    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') matchesStatus = user.verificationStatus === 'VERIFIED';
    if (statusFilter === 'PENDING') matchesStatus = user.verificationStatus === 'PENDING';
    if (statusFilter === 'SUSPENDED') matchesStatus = actualStatus === 'SUSPENDED';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900">Students</h1>
          <p className="text-stone-500 mt-1">Manage network participants.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
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
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending Verification</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-sm font-medium text-stone-500">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Verification</th>
              <th className="px-6 py-4">Account Status</th>
              <th className="px-6 py-4 text-right">Orders</th>
              <th className="px-6 py-4 text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isSuspended = user.accountStatus === 'SUSPENDED';
                return (
                  <tr key={user.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/admin/students/${user.id}`} className="flex items-center space-x-3 group-hover:text-lime-700">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-xs">
                          {user.initials}
                        </div>
                        <span className="font-medium text-stone-900">{user.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        {user.verificationStatus === 'VERIFIED' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Shield className="w-4 h-4 text-stone-300" />}
                        <span className="text-sm text-stone-600 capitalize">{user.verificationStatus.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isSuspended ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-stone-600">
                      {user.completedOrders || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-stone-600">
                      {user.rating ? user.rating.toFixed(1) : '--'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                  No students found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
