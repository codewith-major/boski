import React from 'react';
import { useModeration } from '../../contexts/ModerationContext';
import { useResources } from '../../contexts/ResourceContext';
import { useOrders } from '../../contexts/OrderContext';
import { Users, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOverview() {
  const { reports, allUsers } = useModeration();
  const { resources } = useResources();
  const { orders } = useOrders();

  const metrics = [
    { label: 'Total Students', value: allUsers.length, icon: Users, color: 'text-stone-900', bg: 'bg-stone-100' },
    { label: 'Verified Students', value: allUsers.filter(u => u.verificationStatus === 'VERIFIED').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Listings', value: resources.filter(r => r.status === 'available').length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Open Reports', value: reports.filter(r => r.status === 'OPEN').length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const needsAttentionUsers = allUsers.filter(u => u.verificationStatus === 'PENDING' || u.accountStatus === 'SUSPENDED');
  const recentReports = reports.filter(r => r.status === 'OPEN' || r.status === 'REVIEWING').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-900">Admin Overview</h1>
        <p className="text-stone-500 mt-2">Operational metrics and tasks requiring attention.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col">
              <div className={`w-10 h-10 rounded-lg ${metric.bg} ${metric.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-display font-bold text-stone-900 mb-1">{metric.value}</span>
              <span className="text-sm text-stone-500 font-medium">{metric.label}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900 font-display">Needs Attention</h2>
            <Link to="/admin/students" className="text-sm font-medium text-stone-600 hover:text-stone-900">View all</Link>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            {needsAttentionUsers.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {needsAttentionUsers.map(user => (
                  <li key={user.id}>
                    <Link to={`/admin/students/${user.id}`} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold">
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{user.name}</p>
                          <p className="text-xs text-stone-500">
                            {user.verificationStatus === 'PENDING' ? 'Pending Verification' : 'Suspended Account'}
                          </p>
                        </div>
                      </div>
                      <Clock className="w-5 h-5 text-stone-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-stone-500">
                No students require immediate attention.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900 font-display">Active Reports</h2>
            <Link to="/admin/reports" className="text-sm font-medium text-stone-600 hover:text-stone-900">View all</Link>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            {recentReports.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {recentReports.map(report => (
                  <li key={report.id}>
                    <Link to={`/admin/reports/${report.id}`} className="block p-4 hover:bg-stone-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-stone-900">{report.reason.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          report.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 line-clamp-1">Target: {report.targetType}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-stone-500">
                No active reports.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
