document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scrolling & Active Nav Link
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('header')?.offsetHeight || 70;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
            document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            const navLinks = document.getElementById('navLinks');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form Submitted:", Object.fromEntries(new FormData(this)));
            alert("Thank you! Your message has been sent. (This is a demo)");
            this.reset();
        });
    }

    // Canvas Floating Symbols Animation - REFINED
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let symbols = [];
        const accentColorsRGB = [ // In order of var(--primary-accent) then "fun" accents
            '0, 127, 255',   // Electric Blue
            '255, 0, 255',    // Magenta
            '50, 205, 50',    // Lime Green
            '255, 165, 0',    // Bright Orange
            '0, 255, 255'     // Bright Cyan
        ];
        const mathSymbols = ['∫','∑','∏','∂','∇','Δ','∈','∀','∃','∴','∵','≅','≈','≠','≤','≥','⊂','⊃','∩','∪','α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω','X̄','σ²','μₓ','P(A|B)','∇J(θ)','argmax','log(x)','exp(x)','lim','det(A)','Tr(M)','||v||','ƒ(x)','E[X]','Var(X)','ReLU','Sigmoid','0','1','e','i','∞','ℏ','∇²','∮'];
        
        function getRandomChar() { return mathSymbols[Math.floor(Math.random() * mathSymbols.length)]; }
        function getRandomFunColorRgb() { return accentColorsRGB[Math.floor(Math.random() * (accentColorsRGB.length -1))+1]; }
        function getPrimaryColorRgb() { return accentColorsRGB[0]; }

        function createSymbol(properties) {
            const defaults = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                char: getRandomChar(),
                size: (Math.random() < 0.7 ? Math.random()*5+4 : (Math.random() < 0.94 ? Math.random()*4+9 : Math.random()*5+14)), // Generally smaller
                speedX: (Math.random() - 0.5) * 0.3, 
                speedY: (Math.random() * -0.20) - 0.01, 
                opacity: 0.005 + Math.random() * 0.15, 
                targetOpacity: 0.03 + Math.random() * 0.25, 
                colorRgb: getPrimaryColorRgb(), 
                rotation: (Math.random() - 0.5) * 0.007,
                angle: Math.random() * Math.PI * 2,
                fadeSpeed: 0.001 + Math.random() * 0.001,
                life: Infinity 
            };
            symbols.push({ ...defaults, ...properties });
        }
        
        const targetParticleDensity = 0.00005; // Further reduced for subtlety
        let targetAmbientParticles = Math.max(12, Math.min(50, Math.floor(canvas.width * canvas.height * targetParticleDensity)));

        function populateInitialAmbientParticles() {
            symbols = symbols.filter(s => s.life !== Infinity); // Keep click bursts if any
            const currentAmbientCount = symbols.filter(s => s.life === Infinity).length;
            for(let i = currentAmbientCount; i < targetAmbientParticles ; i++) createSymbol({});
        }
        populateInitialAmbientParticles();
        window.addEventListener('resize', () => {
            targetAmbientParticles = Math.max(12, Math.min(50, Math.floor(canvas.width * canvas.height * targetParticleDensity)));
            populateInitialAmbientParticles(); // Repopulate ambient particles maintaining bursts
        });

        // Click interaction - ENSURED AND REFINED
        document.body.addEventListener('click', (event) => { // Listen on body for general clicks
            if (event.target.closest('a, button, input, textarea, .menu-toggle')) {
                return; // Don't trigger on specific interactive elements
            }
            const burstCount = 6 + Math.floor(Math.random() * 5);
            for (let i = 0; i < burstCount; i++) {
                createSymbol({
                    x: event.clientX,
                    y: event.clientY,
                    speedX: (Math.random() - 0.5) * 3, 
                    speedY: (Math.random() - 0.5) * 3,
                    opacity: 0.75 + Math.random() * 0.25, 
                    targetOpacity: 0, 
                    colorRgb: getRandomFunColorRgb(), 
                    fadeSpeed: 0.02 + Math.random() * 0.01, 
                    life: 45 + Math.random() * 25, // Shorter, more impactful burst life
                    size: (Math.random() < 0.5 ? Math.random()*6+8 : Math.random()*7+14) // Click burst particles can be slightly larger
                });
            }
        });

        let lastAmbientParticleAddTime = 0;
        const ambientParticleAddInterval = 350;

        function animateParticles(currentTime) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const currentAmbientCount = symbols.filter(s => s.life === Infinity).length;

            if (currentTime - lastAmbientParticleAddTime > ambientParticleAddInterval && currentAmbientCount < targetAmbientParticles) {
                const edge = Math.floor(Math.random() * 4);
                let x,y,sX=0,sY=0; const off = 30;
                if(edge===0){x=Math.random()*canvas.width;y=canvas.height+off;sY=-(0.01+Math.random()*0.08);}
                else if(edge===1){x=canvas.width+off;y=Math.random()*canvas.height;sX=-(0.01+Math.random()*0.08);}
                else if(edge===2){x=Math.random()*canvas.width;y=-off;sY=(0.01+Math.random()*0.08);}
                else{x=-off;y=Math.random()*canvas.height;sX=(0.01+Math.random()*0.08);}
                createSymbol({x,y,speedX:sX,speedY:sY,opacity:0.001});
                lastAmbientParticleAddTime = currentTime;
            }

            for (let i = 0; i < symbols.length; i++) {
                const s = symbols[i];
                ctx.save(); ctx.translate(s.x, s.y); s.angle += s.rotation; ctx.rotate(s.angle);
                ctx.font = `bold ${s.size}px var(--font-mono, 'Courier New', monospace)`; 
                
                if (s.life === Infinity && s.opacity < s.targetOpacity) s.opacity += s.fadeSpeed;
                else if (s.life !== Infinity && s.opacity > s.targetOpacity) s.opacity -= s.fadeSpeed; 
                if (s.opacity < 0) s.opacity = 0;

                ctx.fillStyle = `rgba(${s.colorRgb}, ${s.opacity})`;
                ctx.shadowColor = `rgba(${s.colorRgb}, ${s.opacity * 0.35})`; 
                ctx.shadowBlur = s.size / 3;
                ctx.fillText(s.char, -ctx.measureText(s.char).width/2, s.size/3);
                ctx.restore();

                s.x += s.speedX; s.y += s.speedY;
                if (s.life !== Infinity) s.life--;

                if (s.life <= 0 || s.x < -50 || s.x > canvas.width + 50 || s.y < -50 || s.y > canvas.height + 50) {
                    symbols.splice(i, 1); i--;
                }
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        }
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    // Typed Text Animation for Hero Sub-tagline
    // (CSS handles this primarily, JS only if more complex logic needed)

    // Skills Carousel - REMOVED as per request for static skills section

    // Scroll Animations (IntersectionObserver)
    const scrollElements = document.querySelectorAll(".scroll-animate");
    const scrollChildren = document.querySelectorAll(".scroll-animate-child");
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.05 }); // Trigger early for subtle effect
    scrollElements.forEach(el => intersectionObserver.observe(el));
    scrollChildren.forEach(el => intersectionObserver.observe(el));

    // Active Nav Link on Scroll (IntersectionObserver)
    const sections = document.querySelectorAll("main section");
    const navLiAnchors = document.querySelectorAll("nav ul li a");
    const headerHeight = document.querySelector('header')?.offsetHeight || 70;
    const navScrollObserver = new IntersectionObserver((entries) => {
        let lastIntersectingSectionId = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lastIntersectingSectionId = entry.target.getAttribute('id');
            }
        });
        
        if (window.pageYOffset < window.innerHeight * 0.2) { // More sensitive check for top of page
             lastIntersectingSectionId = 'home';
        }

        if (lastIntersectingSectionId) {
            navLiAnchors.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${lastIntersectingSectionId}`);
            });
        } else if (window.pageYOffset > window.innerHeight * 0.2) { 
            // If scrolled down but no section is "active" (e.g. in between sections)
            // remove active class from all to avoid a "sticky" active link
            // navLiAnchors.forEach(a => a.classList.remove('active'));
            // Or, try to find the "closest" one above current scroll - more complex
        }


    }, { rootMargin: `-${headerHeight + 40}px 0px -${window.innerHeight - headerHeight - 120}px 0px`}); // Adjusted rootMargin
    sections.forEach(section => navScrollObserver.observe(section));
    // Initial check for home link
    if (window.pageYOffset < window.innerHeight * 0.2) {
        document.querySelector('nav a[href="#home"]')?.classList.add('active');
    }
});