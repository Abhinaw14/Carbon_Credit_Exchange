import { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

    useEffect(() => {
        const timer = setInterval(() => {
            const left = getTimeLeft(endTime);
            setTimeLeft(left);
            if (left.total <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (timeLeft.total <= 0) {
        return <span className="text-error font-semibold text-sm">Auction Ended</span>;
    }

    return (
        <div className="flex items-center gap-1.5">
            <TimeBox value={timeLeft.hours} label="h" />
            <span className="text-primary font-bold">:</span>
            <TimeBox value={timeLeft.minutes} label="m" />
            <span className="text-primary font-bold">:</span>
            <TimeBox value={timeLeft.seconds} label="s" />
        </div>
    );
}

function TimeBox({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <span className="bg-primary/10 text-primary font-mono font-bold text-lg px-2 py-1 rounded-lg min-w-[2.5rem] text-center">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-text-muted text-[10px] mt-0.5">{label}</span>
        </div>
    );
}

function getTimeLeft(endTime) {
    const total = endTime * 1000 - Date.now();
    if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        total,
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / (1000 * 60)) % 60),
        seconds: Math.floor((total / 1000) % 60),
    };
}
