import React, { useEffect, useState } from 'react';
import './CountdownOverlay.css';

const CountdownOverlay = ({ isCounting, onComplete }) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (!isCounting) {
            setCount(3);
            return;
        }

        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else if (count === 0) {
            onComplete();
        }
    }, [isCounting, count, onComplete]);

    if (!isCounting || count === 0) return null;

    return (
        <div className="countdown-overlay">
            <span className="countdown-text">{count}</span>
        </div>
    );
};

export default CountdownOverlay;
