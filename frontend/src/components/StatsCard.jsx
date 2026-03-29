export default function StatsCard({ icon, label, value, color = 'primary' }) {
    const colors = {
        primary: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
        accent: 'from-accent/20 to-accent/5 border-accent/20 text-accent',
        success: 'from-success/20 to-success/5 border-success/20 text-success',
        warning: 'from-warning/20 to-warning/5 border-warning/20 text-warning',
        error: 'from-error/20 to-error/5 border-error/20 text-error',
    };
    return (
        <div className={`glass-card p-5 bg-gradient-to-br ${colors[color]}`}>
            <div className="flex items-center gap-3">
                <div className={`text-2xl ${colors[color].split(' ').pop()}`}>{icon}</div>
                <div>
                    <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-text mt-0.5">{value}</p>
                </div>
            </div>
        </div>
    );
}
