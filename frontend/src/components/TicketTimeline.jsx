import { CheckCircle, Clock, MessageSquare, ArrowRight, AlertCircle, Star } from 'lucide-react';

/**
 * Timeline component showing ticket history
 */
export default function TicketTimeline({ events = [] }) {
    const getEventIcon = (type) => {
        switch (type) {
            case 'created': return <MessageSquare size={14} />;
            case 'picked': return <Clock size={14} />;
            case 'resolved': return <CheckCircle size={14} />;
            case 'transferred': return <ArrowRight size={14} />;
            case 'feedback': return <Star size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'created': return 'bg-blue-500';
            case 'picked': return 'bg-amber-500';
            case 'resolved': return 'bg-green-500';
            case 'transferred': return 'bg-purple-500';
            case 'feedback': return 'bg-amber-500';
            default: return 'bg-[var(--color-border)]';
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-6 theme-text-muted text-sm">
                No activity yet
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[var(--color-border)]" />

            <div className="space-y-4">
                {events.map((event, index) => (
                    <div key={index} className="relative flex gap-4 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Dot */}
                        <div className={`relative z-10 w-6 h-6 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white shadow-sm`}>
                            {getEventIcon(event.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="theme-text text-sm font-medium">{event.title}</p>
                                <span className="theme-text-muted text-xs">{formatTime(event.date)}</span>
                            </div>
                            {event.description && (
                                <p className="theme-text-muted text-xs mt-1 leading-relaxed">
                                    {event.description}
                                </p>
                            )}
                            {event.by && (
                                <p className="text-xs mt-1 text-[var(--color-primary)] font-medium">
                                    by {event.by}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper to generate timeline events from ticket data
export function generateTimelineEvents(ticket) {
    const events = [];

    // Created
    events.push({
        type: 'created',
        title: 'Ticket Created',
        description: `Category: ${ticket.category}`,
        date: ticket.createdAt
    });

    // If picked up (In Progress or Resolved)
    if (ticket.status !== 'Open' && ticket.resolvedBy) {
        events.push({
            type: 'picked',
            title: 'Picked Up',
            by: ticket.resolvedBy?.name || 'Admin',
            date: ticket.updatedAt || ticket.createdAt
        });
    }

    // If resolved
    if (ticket.status === 'Resolved') {
        events.push({
            type: 'resolved',
            title: 'Resolved',
            description: ticket.adminRemark,
            by: ticket.resolvedBy?.name || 'Admin',
            date: ticket.resolvedAt || ticket.updatedAt
        });
    }

    // If has feedback
    if (ticket.userRating) {
        events.push({
            type: 'feedback',
            title: 'Feedback Received',
            description: `Rating: ${ticket.userRating}/5 stars`,
            date: ticket.feedbackAt || ticket.updatedAt
        });
    }

    return events;
}
