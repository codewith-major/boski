import React, { useState } from 'react';
import { useModeration } from '../../contexts/ModerationContext';
import { useAuth } from '../../contexts/AuthContext';
import { ReportReason, ReportTargetType } from '../../types';
import { AlertTriangle, X } from 'lucide-react';

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ targetType, targetId, isOpen, onClose }: ReportModalProps) {
  const { addReport } = useModeration();
  const { profile } = useAuth();
  const [reason, setReason] = useState<ReportReason>('INAPPROPRIATE');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSubmitting(true);
    try {
      await addReport({
        reporterId: profile.id,
        targetType,
        targetId,
        reason,
        description
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('INAPPROPRIATE');
        setDescription('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold font-display text-stone-900 mb-2">Report Submitted</h2>
            <p className="text-stone-600">
              Thank you for keeping Boski safe. Our moderation team will review this shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold font-display text-stone-900">Report {targetType.toLowerCase()}</h2>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Reason for report</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                >
                  <option value="INAPPROPRIATE">Inappropriate Content / Behavior</option>
                  <option value="MISLEADING">Misleading Information</option>
                  <option value="NO_SHOW">No Show / Did not fulfill order</option>
                  <option value="SAFETY_CONCERN">Safety Concern</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Additional details (Optional)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white resize-none"
                  rows={4}
                  placeholder="Please provide any additional context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors">
                  Submit Report
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
