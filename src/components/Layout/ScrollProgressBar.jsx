import React from 'react';
import useScrollProgress from '../../hooks/useScrollProgress';

export default function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      className="scroll-progress"
      id="scrollProgress"
      style={{ width: `${progress}%` }}
    />
  );
}
