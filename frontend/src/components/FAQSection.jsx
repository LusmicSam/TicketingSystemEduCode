import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * FAQ Accordion Component - Clean & Professional
 */
export default function FAQSection({ faqs = defaultFAQs, title = "Frequently Asked Questions" }) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-subtle)] flex items-center justify-center">
                    <HelpCircle size={16} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold theme-text tracking-tight">{title}</h3>
            </div>

            <div className="space-y-2">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-[var(--color-border)] rounded-lg overflow-hidden"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors text-left ${openIndex === index
                                    ? 'bg-[var(--color-surface-hover)]'
                                    : 'bg-transparent hover:bg-[var(--color-surface-hover)]'
                                }`}
                        >
                            <span className="theme-text text-sm font-medium pr-4">{faq.question}</span>
                            <div className={`w-6 h-6 rounded-md bg-[var(--color-surface-hover)] flex items-center justify-center flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} className="theme-text-muted" />
                            </div>
                        </button>

                        {openIndex === index && (
                            <div className="px-4 py-4 bg-[var(--color-surface-hover)] border-t border-[var(--color-border)]">
                                <p className="theme-text-secondary text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const defaultFAQs = [
    {
        question: "What is the typical response time for support tickets?",
        answer: "Our support team responds to all tickets within 24-48 business hours. For urgent technical issues, please indicate the priority in your ticket description."
    },
    {
        question: "Can I modify a ticket after submission?",
        answer: "Submitted tickets cannot be edited directly. If you need to add information, please create a follow-up ticket and reference the original ticket ID."
    },
    {
        question: "How do I track the status of my ticket?",
        answer: "Navigate to 'My Tickets' to view all your submissions and their current status. Enable WhatsApp notifications for real-time updates."
    },
    {
        question: "What happens if my issue isn't resolved satisfactorily?",
        answer: "If the resolution doesn't meet your expectations, create a follow-up ticket referencing the original. Our team will prioritize escalated issues."
    },
    {
        question: "How can I provide feedback on the support experience?",
        answer: "Once your ticket is resolved, you'll receive a feedback prompt. Your ratings help us improve our support quality."
    }
];
