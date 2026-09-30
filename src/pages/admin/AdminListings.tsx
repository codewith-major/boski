import React, { useState } from 'react';
import { useResources } from '../../contexts/ResourceContext';
import { useModeration } from '../../contexts/ModerationContext';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminListings() {
  const { resources } = useResources();
  const { deactivatedResourceIds, deactivateResource, restoreResource } = useModeration();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [intentFilter, setIntentFilter] = useState<string>('ALL');

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.provider.name.toLowerCase().includes(search.toLowerCase());
    
    const isDeactivated = deactivatedResourceIds.includes(r.id);
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = !isDeactivated;
    if (statusFilter === 'DEACTIVATED') matchesStatus = isDeactivated;

    let matchesIntent = true;
    if (intentFilter !== 'ALL') matchesIntent = r.intent === intentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesIntent;
  });

  const handleToggleStatus = (resourceId: string, isDeactivated: boolean) => {
    if (window.confirm(`Are you sure you want to ${isDeactivated ? 'restore' : 'deactivate'} this listing?`)) {
      if (isDeactivated) {
        restoreResource(resourceId);
      } else {
        deactivateResource(resourceId);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900">Listings</h1>
          <p className="text-stone-500 mt-1">Manage and moderate order listings.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search title or provider..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value)}
        >
          <option value="ALL">All Intents</option>
          <option value="OFFER">Offer</option>
          <option value="REQUEST">Request</option>
        </select>
        <select 
          className="px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-sm font-medium text-stone-500">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Intent / Type</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredResources.length > 0 ? (
              filteredResources.map(resource => {
                const isDeactivated = deactivatedResourceIds.includes(resource.id);
                return (
                  <tr key={resource.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/resource/${resource.id}`} className="font-medium text-stone-900 hover:text-lime-700 line-clamp-1 max-w-xs">
                        {resource.title}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">{new Date(resource.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/students/${resource.provider.id}`} className="text-sm text-stone-600 hover:text-lime-700">
                        {resource.provider.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 capitalize">
                      <span className={`font-medium ${resource.intent === 'HAVE' ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {resource.intent}
                      </span>
                      {' • '}{resource.type}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isDeactivated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(resource.id, isDeactivated)}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isDeactivated 
                            ? 'text-stone-700 bg-stone-100 hover:bg-stone-200' 
                            : 'text-red-700 bg-red-50 hover:bg-red-100'
                        }`}
                      >
                        {isDeactivated ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        <span>{isDeactivated ? 'Restore' : 'Deactivate'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                  No listings found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
