import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModeration } from '../../contexts/ModerationContext';
import { useResources } from '../../contexts/ResourceContext';
import { useOrders } from '../../contexts/OrderContext';
import { ShieldAlert, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allUsers, suspendUser, restoreUser, reports } = useModeration();
  const { resources } = useResources();
  const { orders } = useOrders();
  
  const [showConfirm, setShowConfirm] = useState(false);

  const user = allUsers.find(u => u.id === id);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-stone-900">Student not found</h2>
        <button onClick={() => navigate('/admin/students')} className="text-lime-700 mt-4 font-medium hover:underline">
          Back to Students
        </button>
      </div>
    );
  }

  const isSuspended = user.accountStatus === 'SUSPENDED';
  const studentResources = resources.filter(r => r.provider.id === user.id);
  const studentOrders = orders.filter(e => e.customerId === user.id || e.providerId === user.id);
  const studentReports = reports.filter(r => r.targetId === user.id && r.targetType === 'USER');

  const handleToggleSuspension = () => {
    if (isSuspended) {
      restoreUser(user.id);
      setShowConfirm(false);
    } else {
      suspendUser(user.id);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Link to="/admin/students" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Students
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 font-bold text-2xl font-display">
            {user.initials}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-900">{user.name}</h1>
            <p className="text-stone-500 flex items-center space-x-2 mt-1">
              <span>{user.schoolId === 's_1' ? 'University of Lagos' : user.schoolId === 's_2' ? 'Obafemi Awolowo University' : 'Unknown School'}</span>
              <span>•</span>
              <span className={`font-medium ${user.verificationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {user.verificationStatus}
              </span>
            </p>
          </div>
        </div>
        
        {user.role !== 'ADMIN' && (
          <div className="relative">
            {showConfirm ? (
              <div className="flex items-center space-x-2 bg-stone-100 p-2 rounded-lg border border-stone-200">
                <span className="text-sm font-medium text-stone-700 px-2">Are you sure?</span>
                <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded">Cancel</button>
                <button onClick={handleToggleSuspension} className={`px-3 py-1.5 text-sm font-medium text-white rounded ${isSuspended ? 'bg-stone-900 hover:bg-stone-800' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirm
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowConfirm(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSuspended 
                    ? 'bg-stone-900 text-white hover:bg-stone-800' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {isSuspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{isSuspended ? 'Restore Account' : 'Suspend Account'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm text-stone-500 font-medium mb-1">Trust Rating</p>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-display font-bold text-stone-900">{user.rating?.toFixed(1) || '--'}</span>
            <span className="text-sm text-stone-400 mb-1">/ 5.0</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm text-stone-500 font-medium mb-1">Completed Orders</p>
          <p className="text-3xl font-display font-bold text-stone-900">{user.completedOrders || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm text-stone-500 font-medium mb-1">Completion Rate</p>
          <p className="text-3xl font-display font-bold text-stone-900">{user.completionRate ? `${user.completionRate}%` : '--'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4">Active Listings ({studentResources.length})</h2>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
            {studentResources.length > 0 ? (
              studentResources.map(resource => (
                <Link key={resource.id} to={`/admin/listings`} className="block p-4 hover:bg-stone-50">
                  <p className="font-medium text-stone-900">{resource.title}</p>
                  <p className="text-sm text-stone-500 capitalize">{resource.intent} • {resource.type}</p>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-stone-500 text-sm">No active listings</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4">Reports Filed Against ({studentReports.length})</h2>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
            {studentReports.length > 0 ? (
              studentReports.map(report => (
                <Link key={report.id} to={`/admin/reports/${report.id}`} className="block p-4 hover:bg-stone-50">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-stone-900">{report.reason.replace('_', ' ')}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">{report.status}</span>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-1">{report.description || 'No description provided.'}</p>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-stone-500 text-sm">No reports filed against this user.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
