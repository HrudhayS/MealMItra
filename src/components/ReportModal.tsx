import React, { useState } from 'react';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  donation,
}) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('Food safety or spoilage concern');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !donation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.submitReport(donation.id, reason, details, currentUser);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#344E41]/15 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-[#FFF8ED] border-b border-[#344E41]/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#C97B63] font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Report Surplus Food Listing</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#373A36]/60 hover:text-[#344E41]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-[#344E41]">Report Submitted</h3>
            <p className="text-xs text-[#373A36]/70">
              Our food safety inspection team will review this listing immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <p className="text-[#373A36]/80">
              Flagging: <strong className="text-[#344E41]">{donation.foodName}</strong> by {donation.donorName}
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-[#344E41]">Primary Concern *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs bg-white"
              >
                <option value="Food safety or spoilage concern">Food safety, improper holding or spoilage</option>
                <option value="Incorrect allergen or dietary tags">Incorrect allergen or dietary tags</option>
                <option value="Inaccurate quantity or item description">Inaccurate quantity or item description</option>
                <option value="Unreachable donor or wrong pickup address">Unreachable donor or wrong pickup address</option>
                <option value="Commercial resale or spam">Commercial resale or unauthorized listing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#344E41]">Additional Context</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe what you observed upon contact or pickup..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#344E41]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl font-semibold bg-[#C97B63] hover:bg-[#b56e58] text-white shadow-xs"
              >
                {submitting ? 'Submitting...' : 'Send Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
