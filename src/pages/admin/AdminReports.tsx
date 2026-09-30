import React, { useState } from 'react';
import { useModeration } from '../../contexts/ModerationContext';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function AdminReports() {
  const { reports, allUsers } = useModeration();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredReports = reports.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const getReporterName = (id: string) => allUsers.find(u => u.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900">Reports</h1>
          <p className="text-stone-500 mt-1">Review and manage user reports.</p>
        </div>
        <select 
          className="px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-sm font-medium text-stone-500">
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Target Type</th>
              <th className="px-6 py-4">Reporter</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <tr key={report.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link to={`/admin/reports/${report.id}`} className="flex items-center space-x-2 font-medium text-stone-900 group-hover:text-lime-700">
                      {report.status === 'OPEN' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      <span>{report.reason.replace('_', ' ')}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600 capitalize">
                    {report.targetType.toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {getReporterName(report.reporterId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                      report.status === 'REVIEWING' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                  No reports found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
