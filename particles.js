/**
 * CAIL Particle System (Ultra-Optimized for Mobile)
 * Floating neon particles with mouse interaction
 * Performance optimized for smooth scrolling on mobile devices
 */

(function () {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationId;
    let lastTime = 0;
    let isScrolling = false;
    let scrollTimeout;

    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Mobile: 20fps, Desktop: 30fps
    const targetFPS = isMobile ? 20 : 30;
    const frameInterval = 1000 / targetFPS;

    // Colors
    const colors = [
        { r: 0, g: 242, b: 255 },   // Neon Blue
        { r: 124, g: 58, b: 237 }   // Purple
    ];

    // Resize handler with debounce
    let resizeTimeout;
    function resize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }, 150);
    }

    // Initial resize without debounce
    function initialResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Particle class (simplified for performance)
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.4 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Boundary check
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Initialize particles (ultra-reduced count for mobile)
    function initParticles() {
        particles = [];
        // Mobile: max 15, Tablet: max 40, Desktop: max 70
        const maxCount = isMobile ? 15 : (width < 1024 ? 40 : 70);
        const count = Math.min(Math.floor((width * height) / 25000), maxCount);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections (optimized - skip on mobile, limit distance checks)
    function drawConnections() {
        if (isMobile) return; // Skip connections on mobile

        const maxDistance = 100;
        const len = particles.length;

        for (let i = 0; i < len; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < len; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;

                // Quick distance check (avoid sqrt when possible)
                if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) continue;

                const distSq = dx * dx + dy * dy;
                if (distSq < maxDistance * maxDistance) {
                    const opacity = (1 - Math.sqrt(distSq) / maxDistance) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 242, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop with frame limiting
    function animate(currentTime) {
        animationId = requestAnimationFrame(animate);

        // Skip updates during scroll on mobile for smooth scrolling
        if (isScrolling && isMobile) return;

        const delta = currentTime - lastTime;
        if (delta < frameInterval) return;
        lastTime = currentTime - (delta % frameInterval);

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        drawConnections();
    }

    // Event listeners
    window.addEventListener('resize', resize, { passive: true });

    // Scroll detection - pause animation during scroll on mobile for smooth scrolling
    if (isMobile) {
        window.addEventListener('scroll', () => {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        }, { passive: true });
    }

    // Mouse interaction (desktop only)
    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        }, { passive: true });
    }

    // Visibility API - pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            lastTime = performance.now();
            animate(lastTime);
        }
    });

    // Initialize
    initialResize();
    initParticles();
    animate(0);
})();

