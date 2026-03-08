/* ════════════════════════════════════════════════════════
   Dipak Bohara – Campaign Website
   Optimized JavaScript – Performance-first interactions
   ════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── Feature detection ───
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Custom Cursor (skip on touch devices) ───
    if (!isTouchDevice) {
        const cursor = document.getElementById('cursor');
        const ring = document.getElementById('cursorRing');

        if (cursor && ring) {
            let mx = 0, my = 0, rx = 0, ry = 0;
            let rafId = null;

            document.addEventListener('mousemove', function (e) {
                mx = e.clientX;
                my = e.clientY;
            }, { passive: true });

            function animateCursor() {
                cursor.style.left = mx + 'px';
                cursor.style.top = my + 'px';

                rx += (mx - rx) * 0.12;
                ry += (my - ry) * 0.12;
                ring.style.left = rx + 'px';
                ring.style.top = ry + 'px';

                rafId = requestAnimationFrame(animateCursor);
            }
            animateCursor();

            // Cleanup when page is hidden (save resources)
            document.addEventListener('visibilitychange', function () {
                if (document.hidden && rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                } else if (!document.hidden && !rafId) {
                    animateCursor();
                }
            });
        }
    }

    // ─── Nav scroll state ───
    var nav = document.getElementById('mainNav');
    var lastScrollY = 0;
    var navTicking = false;

    function updateNav() {
        nav.classList.toggle('scrolled', lastScrollY > 60);
        navTicking = false;
    }

    window.addEventListener('scroll', function () {
        lastScrollY = window.scrollY;
        if (!navTicking) {
            requestAnimationFrame(updateNav);
            navTicking = true;
        }
    }, { passive: true });

    // ─── Reveal on scroll (IntersectionObserver) ───
    if (!prefersReducedMotion) {
        var reveals = document.querySelectorAll('.reveal');
        var revealObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('visible');
                    revealObserver.unobserve(entries[i].target);
                }
            }
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        for (var i = 0; i < reveals.length; i++) {
            revealObserver.observe(reveals[i]);
        }
    } else {
        // If reduced motion — make everything visible immediately
        var allReveals = document.querySelectorAll('.reveal');
        for (var j = 0; j < allReveals.length; j++) {
            allReveals[j].classList.add('visible');
        }
    }

    // ─── Vote counter animation ───
    var voteEl = document.getElementById('voteCounter');
    if (voteEl) {
        var voteTarget = 33952;
        var voteAnimated = false;

        var voteObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !voteAnimated) {
                voteAnimated = true;
                var start = performance.now();
                var duration = 1600; // ms

                function easeOutQuart(t) {
                    return 1 - Math.pow(1 - t, 4);
                }

                function animateVote(now) {
                    var elapsed = now - start;
                    var progress = Math.min(elapsed / duration, 1);
                    var easedProgress = easeOutQuart(progress);
                    var current = Math.floor(easedProgress * voteTarget);

                    voteEl.textContent = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(animateVote);
                    } else {
                        voteEl.textContent = voteTarget.toLocaleString();
                    }
                }

                requestAnimationFrame(animateVote);
                voteObserver.unobserve(voteEl);
            }
        }, { threshold: 0.5 });

        voteObserver.observe(voteEl);
    }

    // ─── Multi-layer Hero Parallax (skip on reduced motion / touch) ───
    if (!prefersReducedMotion && !isTouchDevice) {
        var heroSection = document.getElementById('hero');
        var grid = document.getElementById('heroGrid');
        var heroPhoto = document.querySelector('.hero-photo-container');
        var heroContent = document.querySelector('.hero-content');
        var heroBg = document.querySelector('.hero-bg');

        // --- Mouse-follow parallax (3D depth illusion) ---
        if (heroSection) {
            var mouseX = 0, mouseY = 0;
            var targetX = 0, targetY = 0;
            var mouseRafId = null;
            var isHeroVisible = true;

            heroSection.addEventListener('mousemove', function (e) {
                var rect = heroSection.getBoundingClientRect();
                // Normalize to -1 to 1 range from center
                mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            }, { passive: true });

            heroSection.addEventListener('mouseleave', function () {
                mouseX = 0;
                mouseY = 0;
            }, { passive: true });

            function animateMouseParallax() {
                // Smooth interpolation (lerp)
                targetX += (mouseX - targetX) * 0.06;
                targetY += (mouseY - targetY) * 0.06;

                if (isHeroVisible) {
                    // Photo moves opposite to mouse (deeper layer, subtle)
                    if (heroPhoto) {
                        heroPhoto.style.transform = 'translate(' + (targetX * -15) + 'px, ' + (targetY * -8) + 'px)';
                    }

                    // Text moves with mouse slightly (foreground layer)
                    if (heroContent) {
                        heroContent.style.transform = 'translate(' + (targetX * 8) + 'px, ' + (targetY * 5) + 'px)';
                    }

                    // Grid shifts subtly (mid layer)
                    if (grid) {
                        grid.style.transform = 'translate(' + (targetX * -6) + 'px, ' + (targetY * -4) + 'px)';
                    }

                    // Background gradient shifts for a living feel
                    if (heroBg) {
                        heroBg.style.transform = 'translate(' + (targetX * -4) + 'px, ' + (targetY * -3) + 'px) scale(1.05)';
                    }
                }

                mouseRafId = requestAnimationFrame(animateMouseParallax);
            }
            animateMouseParallax();

            // Pause when page is hidden
            document.addEventListener('visibilitychange', function () {
                if (document.hidden && mouseRafId) {
                    cancelAnimationFrame(mouseRafId);
                    mouseRafId = null;
                } else if (!document.hidden && !mouseRafId) {
                    animateMouseParallax();
                }
            });
        }

        // --- Scroll-based multi-speed parallax ---
        var scrollParallaxTicking = false;

        window.addEventListener('scroll', function () {
            if (!scrollParallaxTicking) {
                requestAnimationFrame(function () {
                    var y = window.scrollY;
                    var vh = window.innerHeight;

                    // Only apply when hero is in/near viewport
                    if (y < vh * 1.5) {
                        var scrollProgress = y / vh; // 0 → 1 as user scrolls past hero

                        // Grid drifts upward slowly
                        if (grid) {
                            var currentTransform = grid.style.transform || '';
                            // Combine with mouse transform by using separate properties
                            grid.style.setProperty('--scroll-y', (y * 0.3) + 'px');
                        }

                        // Photo moves up slower → feels further back
                        if (heroPhoto) {
                            heroPhoto.style.setProperty('--scroll-y', (y * 0.15) + 'px');
                        }

                        // Text fades and rises as user scrolls away
                        if (heroContent) {
                            var textOpacity = 1 - scrollProgress * 1.2;
                            heroContent.style.opacity = Math.max(0, textOpacity);
                            heroContent.style.setProperty('--scroll-y', (y * -0.4) + 'px');
                        }

                        isHeroVisible = true;
                    } else {
                        isHeroVisible = false;
                    }

                    scrollParallaxTicking = false;
                });
                scrollParallaxTicking = true;
            }
        }, { passive: true });

        // --- Floating particles (atmospheric) ---
        if (heroSection) {
            var particleCanvas = document.createElement('canvas');
            particleCanvas.className = 'hero-particles';
            particleCanvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.6;';
            heroSection.appendChild(particleCanvas);

            var ctx = particleCanvas.getContext('2d');
            var particles = [];
            var particleCount = 30;

            function resizeCanvas() {
                particleCanvas.width = heroSection.offsetWidth;
                particleCanvas.height = heroSection.offsetHeight;
            }
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Create particles
            for (var p = 0; p < particleCount; p++) {
                particles.push({
                    x: Math.random() * particleCanvas.width,
                    y: Math.random() * particleCanvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.2 - 0.1,
                    opacity: Math.random() * 0.5 + 0.1,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                    // Gold or blue tint
                    color: Math.random() > 0.6 ? '201,168,76' : '74,144,217'
                });
            }

            function animateParticles() {
                if (!isHeroVisible && window.scrollY > window.innerHeight) {
                    requestAnimationFrame(animateParticles);
                    return;
                }

                ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

                for (var i = 0; i < particles.length; i++) {
                    var pt = particles[i];
                    pt.x += pt.speedX;
                    pt.y += pt.speedY;
                    pt.pulse += pt.pulseSpeed;

                    // Pulsing opacity
                    var currentOpacity = pt.opacity * (0.5 + 0.5 * Math.sin(pt.pulse));

                    // Wrap around edges
                    if (pt.x < -10) pt.x = particleCanvas.width + 10;
                    if (pt.x > particleCanvas.width + 10) pt.x = -10;
                    if (pt.y < -10) pt.y = particleCanvas.height + 10;
                    if (pt.y > particleCanvas.height + 10) pt.y = -10;

                    // Draw glow
                    ctx.beginPath();
                    var gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 4);
                    gradient.addColorStop(0, 'rgba(' + pt.color + ',' + currentOpacity + ')');
                    gradient.addColorStop(1, 'rgba(' + pt.color + ',0)');
                    ctx.fillStyle = gradient;
                    ctx.arc(pt.x, pt.y, pt.size * 4, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw bright center
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(' + pt.color + ',' + (currentOpacity * 1.5) + ')';
                    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                requestAnimationFrame(animateParticles);
            }
            animateParticles();
        }
    }

    // ─── Pillar hover lift ───
    var pillars = document.querySelectorAll('.pillar');
    for (var k = 0; k < pillars.length; k++) {
        (function (p) {
            p.addEventListener('mouseenter', function () {
                p.style.transform = 'translateY(-4px)';
            });
            p.addEventListener('mouseleave', function () {
                p.style.transform = 'translateY(0)';
            });
        })(pillars[k]);
    }

    // ─── Smooth scroll for nav links ───
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    for (var l = 0; l < navLinks.length; l++) {
        navLinks[l].addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

})();
