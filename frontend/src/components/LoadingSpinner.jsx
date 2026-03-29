export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className={`${sizes[size]} border-3 border-primary/30 border-t-primary rounded-full animate-spin`} />
            {text && <p className="text-text-muted text-sm">{text}</p>}
        </div>
    );
}

export function ShimmerCard() {
    return (
        <div className="glass-card p-6 space-y-4">
            <div className="shimmer h-5 w-2/3 rounded" />
            <div className="shimmer h-4 w-full rounded" />
            <div className="shimmer h-4 w-5/6 rounded" />
            <div className="shimmer h-10 w-1/3 rounded-lg mt-2" />
        </div>
    );
}
