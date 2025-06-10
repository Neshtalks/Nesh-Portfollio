document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scrolling & Active Nav Link
    document.querySelectorAll('nav a[href^="#"], .footer-navigation a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerOffset = document.querySelector('header')?.offsetHeight || 70;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
                document.querySelectorAll('nav a, .footer-navigation a').forEach(link => link.classList.remove('active'));
                this.classList.add('active'); // Active class for nav, might need specific handling for footer if desired
                
                const navLinks = document.getElementById('navLinks');
                if (navLinks && navLinks.classList.contains('active')) { // Close mobile menu on item click
                    navLinks.classList.remove('active');
                }
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
            const name = this.elements.name.value;
            const email = this.elements.email.value;
            const message = this.elements.message.value;
            if (!name || !email || !message) {
                alert("Please fill in all fields.");
                return;
            }
            console.log("Form Submitted:", { name, email, message });
            // Replace with actual form submission logic (e.g., Formspree, Netlify Forms, or a backend)
            alert("Thank you! Your message has been sent. (This is a demo and does not actually send emails).");
            this.reset();
        });
    }

    // Canvas Floating Symbols Animation - REFINED FOR SLOW FADE & 5-SEC LIFESPAN
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        console.log("Canvas element 'bg-canvas' found."); // DEBUG
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("Failed to get 2D context for canvas."); // DEBUG
            return; // Stop if no context
        }
        console.log("Canvas 2D context obtained."); // DEBUG

        let animationFrameId;
        function resizeCanvas() { 
            canvas.width = window.innerWidth; 
            canvas.height = window.innerHeight; 
            console.log("Canvas resized to: " + canvas.width + "x" + canvas.height); // DEBUG
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial resize

        let symbols = [];
        const accentColorsRGB = [
            '0, 127, 255',   // Electric Blue (Primary Accent for ambient)
            '255, 0, 255',    // Magenta
            '50, 205, 50',    // Lime Green
            '255, 165, 0',    // Bright Orange
            '0, 255, 255'     // Bright Cyan
        ];
        const mathSymbols = ['∫','∬','∭','∮','∑','∏','∂','∇','Δ','∈','∉','∀','∃','∴','∵','≅','≈','≠','≤','≥','⊂','⊃','⊆','⊇','∩','∪','∅','ℝ','ℚ','ℤ','ℕ','ℂ','ħ','ℏ','γ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω','Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω','X̄','σ²','μₓ','P(A)','P(A|B)','E[X]','Var(X)','Cov(X,Y)','H','∇²','∇J(θ)','argmin','argmax','log','ln','exp','sin','cos','tan','lim','→','↦','⇔','⇒','d/dx','ƒ(x)','||v||','det(A)','Tr(M)','diag(v)','ReLU','σ(x)','tanh(x)','softmax','0','1','e','i','∞','⊕','⊗','⊙','⊥','∥','∠','∧','∨','¬','∃!','□','◊'];

        function getRandomChar() { return mathSymbols[Math.floor(Math.random() * mathSymbols.length)]; }
        function getRandomFunColorRgb() { return accentColorsRGB[Math.floor(Math.random() * (accentColorsRGB.length - 1)) + 1]; }
        function getPrimaryColorRgb() { return accentColorsRGB[0]; }

        const PARTICLE_LIFESPAN_FRAMES_MIN = 280; // Approx 4.6 seconds at 60fps
        const PARTICLE_LIFESPAN_FRAMES_VAR = 40;  // Variation

        function createSymbol(isBurst = false, clickX, clickY) {
            const life = PARTICLE_LIFESPAN_FRAMES_MIN + Math.random() * PARTICLE_LIFESPAN_FRAMES_VAR;
            let initialOpacity, colorRgb, size, speedX, speedY, rotation;

            if (isBurst) {
                initialOpacity = 0.55 + Math.random() * 0.2;
                colorRgb = getRandomFunColorRgb();
                size = (Math.random() < 0.6 ? Math.random() * 4 + 6 : Math.random() * 5 + 10);
                speedX = (Math.random() - 0.5) * 0.8;
                speedY = (Math.random() - 0.5) * 0.8;
                rotation = (Math.random() - 0.5) * 0.005; 
            } else { // Ambient particle
                initialOpacity = 0.06 + Math.random() * 0.08;
                colorRgb = getPrimaryColorRgb();
                size = (Math.random() < 0.9 ? Math.random() * 1.5 + 2 : Math.random() * 2.5 + 4);
                speedX = (Math.random() - 0.5) * 0.06;
                speedY = (Math.random() * -0.05) - 0.005;
                rotation = (Math.random() - 0.5) * 0.002;
            }

            symbols.push({
                x: isBurst ? clickX : Math.random() * canvas.width,
                y: isBurst ? clickY : Math.random() * canvas.height,
                char: getRandomChar(),
                size: size,
                speedX: speedX,
                speedY: speedY,
                initialOpacity: initialOpacity,
                opacity: initialOpacity,
                colorRgb: colorRgb,
                rotation: rotation,
                angle: Math.random() * Math.PI * 2,
                life: life,
                fadeSpeed: initialOpacity / life
            });
        }

        const targetParticleDensity = 0.000035;
        let targetAmbientParticles = Math.max(12, Math.min(40, Math.floor(canvas.width * canvas.height * targetParticleDensity)));

        function maintainAmbientParticles() {
            symbols = symbols.filter(s => s.life > 0 && s.opacity > 0);
            while (symbols.length < targetAmbientParticles) {
                createSymbol(false); 
            }
        }
        
        // Initial population
        console.log("Populating initial ambient particles. Target: " + targetAmbientParticles); // DEBUG
        for(let i = 0; i < targetAmbientParticles; i++) {
            createSymbol(false);
        }
        console.log("Initial symbols count: " + symbols.length); // DEBUG


        window.addEventListener('resize', () => {
            // resizeCanvas() is already called by its own listener
            targetAmbientParticles = Math.max(12, Math.min(40, Math.floor(canvas.width * canvas.height * targetParticleDensity)));
            // maintainAmbientParticles(); // Let the animation loop handle maintenance
        });

        document.body.addEventListener('click', (event) => {
            if (event.target.closest('a, button, input, textarea, .menu-toggle, label')) {
                return;
            }
            const burstCount = 4 + Math.floor(Math.random() * 3);
            console.log("Click burst. Count: " + burstCount); //DEBUG
            for (let i = 0; i < burstCount; i++) {
                createSymbol(true, event.clientX, event.clientY); 
            }
        });

        let lastParticleMaintenanceTime = 0;
        const particleMaintenanceInterval = 100; 

        function animateParticles(currentTime) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (currentTime - lastParticleMaintenanceTime > particleMaintenanceInterval) {
                maintainAmbientParticles();
                lastParticleMaintenanceTime = currentTime;
            }

            if (symbols.length === 0 && targetAmbientParticles > 0) { // DEBUG check if symbols array is unexpectedly empty
                // console.warn("Symbols array is empty during animation, but target is > 0. Attempting to repopulate.");
                // maintainAmbientParticles(); // Try to repopulate if it got emptied somehow
            }


            for (let i = 0; i < symbols.length; i++) {
                const s = symbols[i];

                s.opacity -= s.fadeSpeed;
                if (s.opacity < 0) s.opacity = 0;

                ctx.save();
                ctx.translate(s.x, s.y);
                s.angle += s.rotation;
                ctx.rotate(s.angle);
                ctx.font = `bold ${s.size}px var(--font-mono, 'Courier New', monospace)`;

                ctx.fillStyle = `rgba(${s.colorRgb}, ${s.opacity})`;
                ctx.shadowColor = `rgba(${s.colorRgb}, ${s.opacity * 0.25})`;
                ctx.shadowBlur = s.size / 4;
                ctx.fillText(s.char, -ctx.measureText(s.char).width / 2, s.size / 3);
                ctx.restore();

                s.x += s.speedX;
                s.y += s.speedY;
                s.life--;

                if (s.life <= 0 || s.opacity <= 0) { // Simplified removal condition
                    symbols.splice(i, 1);
                    i--;
                }
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        }
        
        console.log("Starting particle animation."); // DEBUG
        animationFrameId = requestAnimationFrame(animateParticles);

    } else {
        console.error("Canvas element with ID 'bg-canvas' NOT FOUND at the time of script execution."); // DEBUG
    }

    // Scroll Animations (IntersectionObserver)
    const scrollElements = document.querySelectorAll(".scroll-animate");
    const scrollChildren = document.querySelectorAll(".scroll-animate-child");
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.05 }); 
    scrollElements.forEach(el => intersectionObserver.observe(el));
    scrollChildren.forEach(el => intersectionObserver.observe(el));

    // Active Nav Link on Scroll (IntersectionObserver)
    const sections = document.querySelectorAll("main section");
    const navLiAnchors = document.querySelectorAll("nav ul li a"); 
    const headerHeight = document.querySelector('header')?.offsetHeight || 70;

    const navScrollObserver = new IntersectionObserver((entries) => {
        let currentActiveSectionId = null;
        
        if (window.pageYOffset < window.innerHeight * 0.3) { 
            currentActiveSectionId = 'home';
        } else {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentActiveSectionId = entry.target.getAttribute('id');
                }
            });
        }

        navLiAnchors.forEach(a => {
            if (currentActiveSectionId && a.getAttribute('href') === `#${currentActiveSectionId}`) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    }, { 
        rootMargin: `-${headerHeight + 20}px 0px -${window.innerHeight - headerHeight - 150}px 0px`,
        threshold: 0 
    });

    sections.forEach(section => navScrollObserver.observe(section));
    if (window.pageYOffset < window.innerHeight * 0.3) { 
        const homeLink = document.querySelector('nav a[href="#home"]');
        if (homeLink) {
            navLiAnchors.forEach(a => a.classList.remove('active')); 
            homeLink.classList.add('active');
        }
    }
});