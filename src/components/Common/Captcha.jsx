import React, { useRef, useEffect } from 'react';

const Captcha = ({ value, onRefresh, width = 120, height = 40 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
    ctx.fillStyle = '#999';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        1,
        1
      );
    }
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = value.split('');
    const charWidth = width / chars.length;
    chars.forEach((char, index) => {
      ctx.save();
      ctx.translate(charWidth * index + charWidth / 2, height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.3); 
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }, [value, width, height]);

  return (
    <div className="flex items-center space-x-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded cursor-pointer"
        onClick={onRefresh}
        style={{ imageRendering: 'pixelated' }}
      />
      <button
        type="button"
        onClick={onRefresh}
        className="p-1 hover:bg-gray-100 rounded transition"
        title="Refresh verification code"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};

export default Captcha;

