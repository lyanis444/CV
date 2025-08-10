
document.addEventListener('DOMContentLoaded', () => {
    // Fire all initializations
    initInteractiveBackground();
    initScrollReveal();
    initNavIndicator();
    initContactForm();
});

/**
 * Piste 1: Interactive "Radar" Background
 * Creates a spotlight effect that follows the mouse cursor.
 */
function initInteractiveBackground() {
    const body = document.body;
    window.addEventListener('mousemove', (e) => {
        body.style.setProperty('--mouse-x', `${e.clientX}px`);
        body.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
}

/**
 * Handles the initial animation of the first section and
 * sets up the IntersectionObserver for revealing other sections on scroll.
 */
function initScrollReveal() {
    const sections = document.querySelectorAll('.content-card');
    
    // Animate the first section immediately since it's in view
    const firstSection = document.querySelector('#accueil');
    if (firstSection) {
        // A small delay to ensure the style is applied after the initial render
        setTimeout(() => {
            firstSection.classList.add('is-visible');
        }, 100);
    }
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        root: null,
        threshold: 0.1,
    });

    sections.forEach(section => {
        revealObserver.observe(section);
    });
}

/**
 * Piste 3: Sliding Navigation Indicator
 * Manages the scroll spy, click-to-scroll, and updates the visual indicator.
 */
function initNavIndicator() {
    const nav = document.getElementById('sidebar-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const indicator = nav.querySelector('.nav-indicator');
    const sections = document.querySelectorAll('section[id]');

    if (!nav || !indicator || navLinks.length === 0) return;

    const updateIndicator = (activeLink) => {
        if (!activeLink) return;

        const isMobileView = window.matchMedia('(max-width: 1080px)').matches;
        
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');

        if (isMobileView) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            indicator.style.left = `${linkRect.left - navRect.left}px`;
            indicator.style.width = `${linkRect.width}px`;
            indicator.style.top = ''; // Clear desktop styles
            indicator.style.height = '2px';
        } else {
            indicator.style.top = `${activeLink.offsetTop}px`;
            indicator.style.height = `${activeLink.offsetHeight}px`;
            indicator.style.left = '-20px'; // Reset mobile styles
            indicator.style.width = 'calc(100% + 20px)';
        }
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                updateIndicator(activeLink);
            }
        });
    }, {
        root: null,
        rootMargin: '-50% 0px -50% 0px'
    });

    sections.forEach(section => scrollSpyObserver.observe(section));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            updateIndicator(link);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const initialActiveLink = document.querySelector('.nav-link.active') || navLinks[0];
    setTimeout(() => updateIndicator(initialActiveLink), 100);

    window.addEventListener('resize', () => {
        const currentActiveLink = document.querySelector('.nav-link.active');
        updateIndicator(currentActiveLink);
    });
}

/**
 * Handles the contact form submission using AJAX (Fetch) to provide
 * a seamless experience without a page reload.
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (!form || !formStatus) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('.submit-btn');
        const data = new FormData(form);
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
            formStatus.style.display = 'none';

            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.textContent = "Merci ! Votre message a bien été envoyé.";
                formStatus.className = 'success';
                form.reset();
            } else {
                const responseData = await response.json();
                if (Object.hasOwn(responseData, 'errors')) {
                    formStatus.textContent = responseData["errors"].map(error => error["message"]).join(", ");
                } else {
                    formStatus.textContent = "Une erreur s'est produite. Veuillez réessayer.";
                }
                formStatus.className = 'error';
            }
        } catch (error) {
            formStatus.textContent = "Une erreur réseau est survenue. Veuillez vérifier votre connexion.";
            formStatus.className = 'error';
        } finally {
            formStatus.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Envoyer le message';
        }
    });
}
