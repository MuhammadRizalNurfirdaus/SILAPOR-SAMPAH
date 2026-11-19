'use client';

import { useEffect, useState } from 'react';

export function DurasiPerjalanan({ mulaiAt }: { mulaiAt: string }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const startTime = new Date(mulaiAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = Math.max(0, now - startTime);

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const pad = (n: number) => String(n).padStart(2, '0');
      setElapsed(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [mulaiAt]);

  return (
    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">
      {elapsed || '00:00:00'}
    </div>
  );
}
