'use client';

import { useRef, useEffect } from 'react';
import { useLiveSession } from '@/lib/live/context';
import styles from './StudentBlackboardView.module.css';

interface StudentBlackboardViewProps {
    className?: string;
}

export default function StudentBlackboardView({ className = '' }: StudentBlackboardViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { drawingPaths, activeSessionId } = useLiveSession();

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            drawAllPaths();
        };

        const drawAllPaths = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            drawingPaths.forEach(path => {
                if (path.points.length === 0) return;

                ctx.beginPath();
                ctx.lineWidth = path.brushSize;
                ctx.strokeStyle = path.isEraser ? '#1A1A2E' : path.color;

                const firstPoint = path.points[0];
                ctx.moveTo(firstPoint.x, firstPoint.y);

                for (let i = 1; i < path.points.length; i++) {
                    ctx.lineTo(path.points[i].x, path.points[i].y);
                }
                ctx.stroke();
            });
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [drawingPaths]);

    if (!activeSessionId) {
        return null; // Don't render the blackboard if there is no active live session
    }

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
            />
            {!drawingPaths.length && (
                <div className={styles.placeholder}>
                    Waiting for teacher to draw...
                </div>
            )}
        </div>
    );
}
