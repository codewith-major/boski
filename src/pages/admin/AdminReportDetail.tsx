import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useModeration } from '../../contexts/ModerationContext';
import { useResources } from '../../contexts/ResourceContext';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, allUsers, updateReportStatus } = useModeration();
  const { resources } = useResources();
  
  const report = reports.find(r => r.id === id);
  const [note, setNote] = useState(report?.adminNote || '');

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-stone-900">Report not found</h2>
        <button onClick={() => navigate('/admin/reports')} className="text-lime-700 mt-4 font-medium hover:underline">
          Back to Reports
        </button>
      </div>
    );
  }

  const reporter = allUsers.find(u => u.id === report.reporterId);
  const targetUser = report.targetType === 'USER' ? allUsers.find(u => u.id === report.targetId) : null;
  const targetResource = report.targetType === 'RESOURCE' ? resources.find(r => r.id === report.targetId) : null;

  const handleUpdate = (status: any) => {
    updateReportStatus(report.id, status, note);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <Link to="/admin/reports" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Reports
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-900">Report Detail</h1>
          <p className="text-stone-500 mt-1">ID: {report.id}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          report.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
          report.status === 'REVIEWING' ? 'bg-blue-100 text-blue-800' :
          report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
          'bg-stone-100 text-stone-600'
        }`}>
          {report.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-stone-900 text-lg border-b border-stone-100 pb-2">Report Info</h2>
          <div>
            <p className="text-sm font-medium text-stone-500">Reason</p>
            <p className="text-stone-900 font-medium">{report.reason.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Date Filed</p>
            <p className="text-stone-900">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Description</p>
            <p className="text-stone-900 bg-stone-50 p-3 rounded-lg mt-1 text-sm">{report.description || 'No description provided.'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Reporter</p>
            {reporter ? (
              <Link to={`/admin/students/${reporter.id}`} className="text-lime-700 font-medium hover:underline block mt-1">
                {reporter.name}
              </Link>
            ) : (
              <p className="text-stone-900">Unknown User ({report.reporterId})</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-stone-900 text-lg border-b border-stone-100 pb-2">Target Info</h2>
          <div>
            <p className="text-sm font-medium text-stone-500">Type</p>
            <p className="text-stone-900">{report.targetType}</p>
          </div>
          
          {targetUser && (
            <div>
              <p className="text-sm font-medium text-stone-500">Target User</p>
              <Link to={`/admin/students/${targetUser.id}`} className="text-lime-700 font-medium hover:underline block mt-1">
                {targetUser.name}
              </Link>
            </div>
          )}

          {targetResource && (
            <div>
              <p className="text-sm font-medium text-stone-500">Target Resource</p>
              <p className="font-medium text-stone-900 mt-1">{targetResource.title}</p>
              <p className="text-sm text-stone-500 mt-1">Owner: {targetResource.provider.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-lg border-b border-stone-100 pb-2">Moderation Action</h2>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Admin Note (Internal)</label>
          <textarea
            className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            rows={3}
            placeholder="Add internal notes about your investigation..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {report.status !== 'REVIEWING' && (
            <button onClick={() => handleUpdate('REVIEWING')} className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg hover:bg-blue-200 transition-colors">
              Mark as Reviewing
            </button>
          )}
          <button onClick={() => handleUpdate('RESOLVED')} className="px-4 py-2 bg-emerald-100 text-emerald-800 font-medium rounded-lg hover:bg-emerald-200 transition-colors">
            Resolve
          </button>
          <button onClick={() => handleUpdate('DISMISSED')} className="px-4 py-2 bg-stone-100 text-stone-800 font-medium rounded-lg hover:bg-stone-200 transition-colors">
            Dismiss
          </button>
          
          <div className="flex-1"></div>
          
          <button onClick={() => handleUpdate(report.status)} className="px-4 py-2 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Save Note Only
          </button>
        </div>
      </div>
    </div>
  );
}
