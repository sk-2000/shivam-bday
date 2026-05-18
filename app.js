// Make sure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initGSAPAnimations();
    initMusicToggle();
    initConfettiExplosion();
    initTiltEffect();
    initMenu();
    initCardStack();
});

// --- 1. Three.js Background Particles ---
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    camera.position.y = 10;
    camera.rotation.x = -0.2;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Starry Sky Background (Layer 1)
    const starsCount = 4000;
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
        starsPositions[i] = (Math.random() - 0.5) * 400; // Wide spread
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Galaxy Nebula (Layer 2)
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color('#00FFFF'), // Cyan
        new THREE.Color('#FFD700'), // Gold
        new THREE.Color('#FFB6C1'), // Pink
        new THREE.Color('#B026FF')  // Purple
    ];

    // Galaxy shape parameters
    const branches = 4;
    const radius = 60;
    const spin = 1.2;
    const randomness = 0.6;
    const randomnessPower = 3;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const r = Math.random() * radius;
        const spinAngle = r * spin;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2;
        
        const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
        const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.5;
        const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * r + randomX;
        positions[i3 + 1] = randomY; 
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        sizes[i] = Math.random() * 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float pulse = sin(time * 2.0 + position.x) * 0.5 + 0.5;
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + pulse * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                float alpha = (0.5 - r) * 2.0;
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const galaxy = new THREE.Points(geometry, material);
    scene.add(galaxy);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.005;
        mouseY = (event.clientY - windowHalfY) * 0.005;
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.time.value = elapsedTime;

        targetX = mouseX;
        targetY = mouseY;

        // Camera gentle parallax
        camera.position.x += (targetX * 10 - camera.position.x) * 0.05;
        camera.position.y += (-targetY * 10 + 10 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        galaxy.rotation.y = elapsedTime * 0.05;
        starField.rotation.y = elapsedTime * 0.02;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 2. GSAP Animations ---
function initGSAPAnimations() {
    // Hero Section Intro
    const tl = gsap.timeline();
    
    tl.to('.intro-anim', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    });

    // Scroll Animations for Journey Timeline
    const revealElements = document.querySelectorAll('.gs-reveal');
    revealElements.forEach((elem, index) => {
        const direction = index % 2 === 0 ? -50 : 50; // Alternate sliding direction on desktop
        
        gsap.fromTo(elem, 
            { x: window.innerWidth > 768 ? direction : 0, y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                x: 0,
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out'
            }
        );
    });
}

// --- 3. Music Player Toggle ---
function initMusicToggle() {
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    const audioWaves = document.getElementById('audio-waves');
    
    let isPlaying = false;

    // Set volume higher so they can hear it clearly
    audio.volume = 1.0;

    musicBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent triggering the global confetti
        
        if (isPlaying) {
            audio.pause();
            musicIcon.style.opacity = '1';
            audioWaves.style.opacity = '0';
            isPlaying = false;
        } else {
            try {
                // Attempt to play the audio
                await audio.play();
                
                // If successful, update UI
                isPlaying = true;
                musicIcon.style.opacity = '0';
                audioWaves.style.opacity = '1';
            } catch (error) {
                console.warn("Audio playback failed gracefully. Error:", error.message);
                // Revert UI to paused state without throwing an alert
                isPlaying = false;
                musicIcon.style.opacity = '1';
                audioWaves.style.opacity = '0';
            }
        }
    });
}

// --- 4. Confetti Explosion ---
function initConfettiExplosion() {
    // Create a celebratory chime sound for every click
    const clickSound = new Audio('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg');
    clickSound.volume = 1.0;

    document.addEventListener('click', (e) => {
        // Prevent confetti when clicking the music button
        if(e.target.closest('#music-toggle') || e.target.closest('#menu-btn') || e.target.closest('#side-menu')) return;

        // Play the click sound immediately
        clickSound.currentTime = 0;
        clickSound.play().catch(err => console.log("Click sound blocked:", err));

        // --- Spawn Floating Text ---
        const textElem = document.createElement('div');
        textElem.textContent = "Happy Birthday Shivam Nagpal";
        // Colorful neon text classes
        textElem.className = "fixed pointer-events-none z-[100] text-transparent bg-clip-text bg-gradient-to-r from-neon-gold via-neon-cyan to-neon-pink font-bold text-xl md:text-2xl whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]";
        textElem.style.left = `${e.clientX}px`;
        textElem.style.top = `${e.clientY}px`;
        textElem.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(textElem);

        gsap.to(textElem, {
            y: -150,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => {
                textElem.remove();
            }
        });

        // --- Spawn Confetti ---
        // Calculate click coordinates relative to screen (0 to 1)
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const count = 200;
        const defaults = {
            origin: { x, y },
            colors: ['#00FFFF', '#FFD700', '#FFB6C1', '#B026FF'],
            zIndex: 100
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    });
}

// --- 5. 3D Tilt Effect on Quote Card ---
function initTiltEffect() {
    const card = document.getElementById('quote-card');
    
    if(!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
    
    // Add same tilt effect to hero content
    const heroContent = document.querySelector('.hero-content');
    if(heroContent) {
        document.querySelector('section').addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            heroContent.style.transform = `translateY(0) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        document.querySelector('section').addEventListener('mouseleave', () => {
            heroContent.style.transform = `translateY(0) rotateY(0deg) rotateX(0deg)`;
        });
    }
}

// --- 6. Hamburger Menu ---
function initMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');

    function openMenu() {
        sideMenu.classList.remove('-translate-x-[150%]', 'opacity-0', 'pointer-events-none');
        menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
    }

    function closeMenu() {
        sideMenu.classList.add('-translate-x-[150%]', 'opacity-0', 'pointer-events-none');
        menuOverlay.classList.add('opacity-0', 'pointer-events-none');
    }

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMenu();
    });

    closeBtn.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            closeMenu();
            // Optional: Smooth scroll handled by CSS, but can add JS if needed.
        });
    });
}

// --- 7. Gratitude Card Stack ---
function initCardStack() {
    const stackCards = document.querySelectorAll('.stack-card');
    if (!stackCards.length) return;

    let currentCardIndex = 0;

    // Initial positioning
    function updateStack() {
        stackCards.forEach((card, index) => {
            let relativeIndex = (index - currentCardIndex + stackCards.length) % stackCards.length;
            
            gsap.to(card, {
                zIndex: stackCards.length - relativeIndex,
                y: relativeIndex * 15,
                scale: 1 - (relativeIndex * 0.05),
                opacity: 1 - (relativeIndex * 0.2),
                rotateZ: relativeIndex % 2 === 0 ? relativeIndex * 2 : -relativeIndex * 2,
                duration: 0.5,
                ease: 'power3.out'
            });
        });
    }

    updateStack();

    stackCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent trigger multiple times if nested, but confetti can still fire
            
            // Only the top card can be clicked to swipe away
            if(index === currentCardIndex) {
                // Animate card flying off to the right
                gsap.to(card, {
                    x: window.innerWidth > 768 ? 300 : 150,
                    y: -50,
                    rotateZ: 15,
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                    onComplete: () => {
                        // Reset card position behind the stack
                        gsap.set(card, { x: 0, y: 0, rotateZ: 0 });
                        
                        // Move to next card
                        currentCardIndex = (currentCardIndex + 1) % stackCards.length;
                        updateStack();
                    }
                });
            }
        });
    });
}
