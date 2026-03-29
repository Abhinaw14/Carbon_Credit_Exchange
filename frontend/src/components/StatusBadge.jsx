const variants = {
    PENDING: 'bg-warning/15 text-warning border-warning/30',
    APPROVED: 'bg-success/15 text-success border-success/30',
    REJECTED: 'bg-error/15 text-error border-error/30',
    ACTIVE: 'bg-primary/15 text-primary border-primary/30 animate-pulse-glow',
    ENDED: 'bg-text-muted/15 text-text-muted border-text-muted/30',
    CANCELED: 'bg-error/15 text-error border-error/30',
    WINNING: 'bg-success/15 text-success border-success/30',
    OUTBID: 'bg-warning/15 text-warning border-warning/30',
};

export default function StatusBadge({ status }) {
    const cls = variants[status] || variants.PENDING;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
            {status}
        </span>
    );
}
