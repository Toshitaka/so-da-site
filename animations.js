/**
 * CAIL SO-DA Site - Authentication & Animations
 * GSAP-powered unlock experience with liquid bubble effects
 */

(function () {
    'use strict';

    // Constants
    const AUTH_CODE = '1923';
    const STORAGE_KEY = 'soda_authenticated';

    // DOM Elements
    const authInput = document.getElementById('sodaIdInput');
    const authWrapper = document.getElementById('authWrapper');
    const authHint = document.getElementById('authHint');
    const fallbackCta = document.getElementById('fallbackCta');
    const lockedSection = document.getElementById('lockedSection');
    const briefingForm = document.getElementById('briefingForm');

    // Check if already authenticated
    function checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem(STORAGE_KEY) === 'true';
        if (isAuthenticated) {
            unlockContent(false); // No animation for already authenticated users
        }
        return isAuthenticated;
    }

    // Create bubble particle
    function createBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = `${x + (Math.random() - 0.5) * 100}px`;
        bubble.style.top = `${y}px`;
        bubble.style.width = `${10 + Math.random() * 20}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.animationDuration = `${1 + Math.random() * 1}s`;
        return bubble;
    }

    // Create bubble container and spawn bubbles
    function spawnBubbles(centerX, centerY) {
        const container = document.createElement('div');
        container.className = 'bubble-container';
        document.body.appendChild(container);

        // Create multiple bubbles
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const bubble = createBubble(centerX, centerY);
                container.appendChild(bubble);

                // Remove bubble after animation
                setTimeout(() => {
                    bubble.remove();
                }, 2000);
            }, i * 50);
        }

        // Remove container after all bubbles are done
        setTimeout(() => {
            container.remove();
        }, 3500);
    }

    // Unlock content with cinematic animation
    function unlockContent(animate = true) {
        // Save authentication state
        sessionStorage.setItem(STORAGE_KEY, 'true');

        // Hide fallback CTA
        if (fallbackCta) {
            fallbackCta.style.display = 'none';
        }

        if (animate && typeof gsap !== 'undefined') {
            // Get input position for bubble origin
            const inputRect = authInput.getBoundingClientRect();
            const centerX = inputRect.left + inputRect.width / 2;
            const centerY = inputRect.top + inputRect.height / 2;

            // Show success state
            authWrapper.classList.add('success');
            authHint.textContent = 'Access Granted';
            authHint.className = 'auth-hint success';

            // Input glow animation
            gsap.to(authInput, {
                duration: 0.5,
                boxShadow: '0 0 80px rgba(0, 240, 255, 0.8), 0 0 120px rgba(0, 240, 255, 0.5)',
                borderColor: '#00F0FF',
                ease: 'power2.out'
            });

            // Spawn bubbles
            setTimeout(() => {
                spawnBubbles(centerX, centerY);
            }, 300);

            // Reveal locked section with stagger animation
            setTimeout(() => {
                lockedSection.classList.add('unlocked');

                // Smooth scroll to moat section
                setTimeout(() => {
                    document.getElementById('moat').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 500);
            }, 1000);

        } else {
            // Instant unlock (no animation)
            lockedSection.classList.add('unlocked');
            if (authHint) {
                authHint.textContent = '';
            }
        }
    }

    // Handle authentication attempt
    function attemptAuthentication(code) {
        if (code === AUTH_CODE) {
            authInput.disabled = true;
            unlockContent(true);
            return true;
        } else if (code.length === 4) {
            authHint.textContent = 'コードが正しくありません';
            authHint.className = 'auth-hint error';

            // Shake animation
            if (typeof gsap !== 'undefined') {
                gsap.to(authInput, {
                    duration: 0.1,
                    x: -10,
                    ease: 'power2.inOut',
                    yoyo: true,
                    repeat: 5,
                    onComplete: () => {
                        gsap.set(authInput, { x: 0 });
                    }
                });
            }

            // Clear after delay
            setTimeout(() => {
                authInput.value = '';
                authHint.textContent = '';
                authHint.className = 'auth-hint';
            }, 1500);
            return false;
        }
        return false;
    }

    // Event Listeners
    if (authInput) {
        authInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only numbers
            e.target.value = value;

            if (value.length === 4) {
                attemptAuthentication(value);
            }
        });

        authInput.addEventListener('keypress', (e) => {
            // Allow only numbers
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    // Briefing Form Handler
    if (briefingForm) {
        briefingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const experience = document.getElementById('experience').value;
            const asset = document.getElementById('asset').value;
            const email = document.getElementById('contactEmail').value;

            const subject = encodeURIComponent('ブリーフィング権利申請');
            const body = encodeURIComponent(
                `【体験した瞬間】\n${experience}\n\n` +
                `【提供できるアセット】\n${asset}\n\n` +
                `【連絡先】\n${email}`
            );

            window.location.href = `mailto:info@cail.inc?subject=${subject}&body=${body}`;

            // Show success feedback
            if (typeof gsap !== 'undefined') {
                gsap.to(briefingForm, {
                    duration: 0.3,
                    scale: 1.02,
                    boxShadow: '0 0 60px rgba(0, 240, 255, 0.3)',
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    }

    // Initialize page animations
    function initPageAnimations() {
        if (typeof gsap === 'undefined') return;

        // Hero animations
        gsap.from('.hero-image', {
            duration: 1.5,
            opacity: 0,
            y: 50,
            ease: 'power3.out'
        });

        gsap.from('.hero-text', {
            duration: 1,
            opacity: 0,
            y: 30,
            ease: 'power3.out',
            delay: 0.5
        });

        // Barrier section
        gsap.from('.barrier-content', {
            duration: 1,
            opacity: 0,
            y: 40,
            ease: 'power3.out',
            delay: 0.8
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthentication();
        initPageAnimations();
    });

})();
