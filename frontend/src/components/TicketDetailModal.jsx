import { X, Calendar, MessageSquare, User, Tag, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui';

export default function TicketDetailModal({ ticket, onClose, onSubmitFeedback, email }) {
    const [feedbackData, setFeedbackData] = useState({ rating: 0, feedback: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!ticket) return null;

    const handleSubmit = async () => {
        if (feedbackData.rating === 0) return;
        setIsSubmitting(true);
        await onSubmitFeedback(ticket.id, feedbackData);
        setIsSubmitting(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-2xl animate-slide-up"
            >
                {/* Header */}
                <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-primary-subtle)] rounded-[var(--radius-md)]">
                            <MessageSquare size={20} className="text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <h2 className="font-semibold theme-text">Ticket Details</h2>
                            <p className="text-xs theme-text-muted font-mono">#{ticket.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-sm)] transition-colors theme-text-muted hover:theme-text"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status & Category */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={ticket.status === 'Open' ? 'warning' : ticket.status === 'In Progress' ? 'info' : 'success'}>
                            {ticket.status}
                        </Badge>
                        <Badge variant="primary">{ticket.category}</Badge>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)]">
                            <Calendar size={16} className="theme-text-muted" />
                            <div>
                                <p className="text-xs theme-text-muted">Created</p>
                                <p className="text-sm theme-text font-medium">{formatDate(ticket.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)]">
                            <User size={16} className="theme-text-muted" />
                            <div>
                                <p className="text-xs theme-text-muted">Email</p>
                                <p className="text-sm theme-text font-medium truncate">{ticket.email || ticket.user?.email || email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-medium theme-text mb-2 flex items-center gap-2">
                            <Tag size={14} className="theme-text-muted" />
                            Description
                        </h3>
                        <div className="p-4 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
                            <p className="theme-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>
                    </div>

                    {/* Admin Remark */}
                    {ticket.adminRemark && (
                        <div>
                            <h3 className="text-sm font-medium theme-text mb-2 flex items-center gap-2">
                                <CheckCircle size={14} className="text-[var(--color-primary)]" />
                                Admin Response
                            </h3>
                            <div className="p-4 bg-[var(--color-primary-subtle)] rounded-[var(--radius-md)] border-l-3 border-l-[var(--color-primary)]" style={{ borderLeftWidth: '3px' }}>
                                <p className="theme-text-secondary text-sm leading-relaxed">
                                    {ticket.adminRemark}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Feedback Section */}
                    {ticket.status === 'Resolved' && !ticket.userRating && (
                        <div className="p-5 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                            <h3 className="text-sm font-medium theme-text mb-4">How was your experience?</h3>

                            {/* Star Rating */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors ${feedbackData.rating >= star
                                                ? 'text-amber-500 fill-amber-500'
                                                : 'text-[var(--color-border)] hover:text-amber-400'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Feedback Text */}
                            <textarea
                                placeholder="Additional comments (optional)"
                                value={feedbackData.feedback}
                                onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                                className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] theme-text placeholder:theme-text-muted focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)] outline-none text-sm min-h-[80px] resize-none transition-all"
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={feedbackData.rating === 0 || isSubmitting}
                                className="mt-4 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-[var(--radius-md)] font-medium transition-all hover:-translate-y-0.5"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    )}

                    {/* Already Rated */}
                    {ticket.userRating && (
                        <div className="flex items-center gap-3 p-4 bg-[var(--color-success-subtle)] rounded-[var(--radius-md)]">
                            <CheckCircle size={20} className="text-[var(--color-success)]" />
                            <div>
                                <p className="theme-text text-sm font-medium">Feedback Submitted</p>
                                <div className="flex text-amber-500 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < ticket.userRating ? "fill-current" : "text-[var(--color-border)]"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
