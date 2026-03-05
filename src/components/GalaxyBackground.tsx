import { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    speed: number;     // drift speed
    angle: number;     // drift direction (radians)
    twinkleSpeed: number;
    twinklePhase: number;
    color: string;
}

interface NebulaParticle {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    driftX: number;
    driftY: number;
    hue: number;
}

const STAR_COLORS = [
    '#ffffff',
    '#ffe4c4', // warm white
    '#ffd6b0', // orange-ish
    '#ffc0d0', // pinkish
    '#d0e8ff', // blue-ish
];

export function GalaxyBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const starsRef = useRef<Star[]>([]);
    const nebulaRef = useRef<NebulaParticle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;

        function init() {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;

            // ── Stars ──────────────────────────────────────────────
            const starCount = Math.floor(width * height / 2500);
            starsRef.current = Array.from({ length: starCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.4 + 0.2,
                opacity: Math.random() * 0.7 + 0.25,
                speed: Math.random() * 0.28 + 0.06,
                angle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
            }));

            // ── Nebula / Galaxy band particles ──────────────────────
            const nebulaCount = 18;
            nebulaRef.current = Array.from({ length: nebulaCount }, (_, i) => ({
                // place diagonally across like a galactic band
                x: (i / nebulaCount) * width * 1.4 - width * 0.2 + (Math.random() - 0.5) * 200,
                y: height * 0.3 + Math.sin((i / nebulaCount) * Math.PI * 2) * height * 0.3 + (Math.random() - 0.5) * 150,
                radius: Math.random() * 180 + 80,
                opacity: Math.random() * 0.07 + 0.02,
                driftX: (Math.random() - 0.5) * 0.45,
                driftY: (Math.random() - 0.5) * 0.25,
                hue: Math.random() < 0.5 ? 350 : 25, // red/orange tones matching theme
            }));
        }

        function draw(time: number) {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            // ── Nebula / galactic band ──────────────────────────────
            for (const n of nebulaRef.current) {
                // slow drift
                n.x += n.driftX;
                n.y += n.driftY;
                // wrap around
                if (n.x > width + n.radius) n.x = -n.radius;
                if (n.x < -n.radius) n.x = width + n.radius;
                if (n.y > height + n.radius) n.y = -n.radius;
                if (n.y < -n.radius) n.y = height + n.radius;

                const pulse = 1 + 0.04 * Math.sin(time * 0.0005 + n.x);
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * pulse);
                grad.addColorStop(0, `hsla(${n.hue}, 80%, 55%, ${n.opacity * 1.6})`);
                grad.addColorStop(0.4, `hsla(${n.hue}, 70%, 40%, ${n.opacity * 0.8})`);
                grad.addColorStop(1, `hsla(${n.hue}, 60%, 30%, 0)`);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            // ── Stars ───────────────────────────────────────────────
            for (const s of starsRef.current) {
                // drift
                s.x += Math.cos(s.angle) * s.speed;
                s.y += Math.sin(s.angle) * s.speed;

                // wrap
                if (s.x < -2) s.x = width + 2;
                if (s.x > width + 2) s.x = -2;
                if (s.y < -2) s.y = height + 2;
                if (s.y > height + 2) s.y = -2;

                // twinkle
                s.twinklePhase += s.twinkleSpeed;
                const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
                const alpha = s.opacity * (0.4 + 0.6 * twinkle);

                // glow for bigger stars
                if (s.radius > 1.0) {
                    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 4);
                    glow.addColorStop(0, `rgba(255,220,200,${alpha * 0.35})`);
                    glow.addColorStop(1, 'rgba(255,220,200,0)');
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.radius * 4, 0, Math.PI * 2);
                    ctx.fillStyle = glow;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                // parse hex → rgba with alpha
                const hexColor = s.color;
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.fill();
            }

            animFrameRef.current = requestAnimationFrame(draw);
        }

        init();
        animFrameRef.current = requestAnimationFrame(draw);

        const onResize = () => init();
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}
