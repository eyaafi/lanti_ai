'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './Blackboard.module.css';
import { useLiveSession, Point } from '@/lib/live/context';

interface BlackboardProps {
    className?: string;
}

export default function Blackboard({ className }: BlackboardProps) {
    const { broadcastDrawing, clearBoard, drawingPaths } = useLiveSession();
    const currentPathRef = useRef<Point[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#FFFFFF');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    const colors = [
        '#FFFFFF', // White
        '#FF6B6B', // Red
        '#4DABF7', // Blue
        '#51CF66', // Green
        '#FCC419', // Yellow
        '#FF922B', // Orange
        '#BE4BDB', // Purple
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set initial canvas size
        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Save current content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(canvas, 0, 0);
        }

        // Resize
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Restore content
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.drawImage(tempCanvas, 0, 0);
        }
    };

    useEffect(() => {
        if (drawingPaths.length === 0) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [drawingPaths]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        currentPathRef.current = [];
        draw(e);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.beginPath();

        if (currentPathRef.current.length > 0) {
            broadcastDrawing({
                id: Math.random().toString(36).substring(2, 9),
                points: currentPathRef.current,
                color: tool === 'eraser' ? '#1A1A2E' : color,
                brushSize,
                isEraser: tool === 'eraser'
            });
            currentPathRef.current = [];
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        currentPathRef.current.push({ x, y });

        ctx.lineWidth = brushSize;
        ctx.strokeStyle = tool === 'eraser' ? '#1A1A2E' : color; // Match background for eraser

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        clearBoard();
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas with background to ensure it's not transparent
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.fillStyle = '#1A1A2E';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
        }

        const link = document.createElement('a');
        link.download = `blackboard-${new Date().getTime()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <button
                        className={`${styles.toolBtn} ${tool === 'pen' ? styles.active : ''}`}
                        onClick={() => setTool('pen')}
                        title="Pen"
                    >
                        ✏️
                    </button>
                    <button
                        className={`${styles.toolBtn} ${tool === 'eraser' ? styles.active : ''}`}
                        onClick={() => setTool('eraser')}
                        title="Eraser"
                    >
                        🧽
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.colorPalette}>
                    {colors.map(c => (
                        <button
                            key={c}
                            className={`${styles.colorBtn} ${color === c && tool === 'pen' ? styles.activeColor : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => {
                                setColor(c);
                                setTool('pen');
                            }}
                        />
                    ))}
                </div>

                <div className={styles.divider} />

                <div className={styles.sizeControl}>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className={styles.rangeInput}
                    />
                    <span className={styles.sizeLabel}>{brushSize}px</span>
                </div>

                <div className={styles.divider} />

                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={clearCanvas} title="Clear Blackboard">
                        🗑️ Clear
                    </button>
                    <button className={styles.actionBtn} onClick={downloadImage} title="Download as Image">
                        💾 Save
                    </button>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className={styles.canvas}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
            />
        </div>
    );
}
