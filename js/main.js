document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Progress Bar
    const progressBar = document.getElementById('scrollProgressBar');
    if (progressBar) {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = scrolled + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Run once on load
    }

    // 2. Sticky Header & Mobile Menu
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Toggle mobile menu
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');

            // Transform icon between bars and xmark
            const icon = menuToggle.querySelector('i');
            if (menuToggle.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            });
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            header.style.padding = '5px 0';
        } else {
            header.style.boxShadow = 'none';
            header.style.padding = '10px 0';
        }
    });

    // 2. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Trigger once on load
    revealOnScroll();

    // 3. Hero Slider
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.slider-next');
    const prevBtn = document.querySelector('.slider-prev');
    let currentSlide = 0;

    if (slides.length > 0) {
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        };

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });

        // Optional: Auto play
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 8000);
    }

    // 4. Client Logos Slider
    const logosTrack = document.querySelector('.logos-carousel-track');
    if (logosTrack) {
        const leftArrow = document.querySelector('.prev-arrow');
        const rightArrow = document.querySelector('.next-arrow');
        const logos = logosTrack.querySelectorAll('.client-logo-img');

        if (leftArrow && rightArrow && logos.length > 0) {
            let currentTranslate = 0;
            const logoWidth = 280; // approx width (230) + gap (50)

            const updateArrows = (maxTranslate) => {
                leftArrow.style.opacity = currentTranslate === 0 ? '0.3' : '1';
                leftArrow.style.pointerEvents = currentTranslate === 0 ? 'none' : 'auto';

                rightArrow.style.opacity = currentTranslate >= maxTranslate ? '0.3' : '1';
                rightArrow.style.pointerEvents = currentTranslate >= maxTranslate ? 'none' : 'auto';
            };

            const getMaxTranslate = () => {
                // Total width of all logos minus the visible window width
                const max = logosTrack.scrollWidth - logosTrack.parentElement.clientWidth;
                return max > 0 ? max : 0;
            };

            // Initialize arrows state
            updateArrows(getMaxTranslate());

            // Re-evaluate after all images are loaded (fixes bug on first load when images have 0 width)
            window.addEventListener('load', () => {
                updateArrows(getMaxTranslate());
            });

            rightArrow.addEventListener('click', () => {
                const maxTranslate = getMaxTranslate();
                currentTranslate += logoWidth;

                // Cap at the maximum possible translation so we never see empty space
                if (currentTranslate > maxTranslate) {
                    currentTranslate = maxTranslate;
                }

                logosTrack.style.transform = `translateX(-${currentTranslate}px)`;
                updateArrows(maxTranslate);
            });

            leftArrow.addEventListener('click', () => {
                const maxTranslate = getMaxTranslate();
                currentTranslate -= logoWidth;

                // Cap at 0 so we never scroll past the beginning
                if (currentTranslate < 0) {
                    currentTranslate = 0;
                }

                logosTrack.style.transform = `translateX(-${currentTranslate}px)`;
                updateArrows(maxTranslate);
            });

            // Re-evaluate bounds on window resize
            window.addEventListener('resize', () => {
                const maxTranslate = getMaxTranslate();
                if (currentTranslate > maxTranslate) {
                    currentTranslate = maxTranslate;
                    logosTrack.style.transform = `translateX(-${currentTranslate}px)`;
                }
                updateArrows(maxTranslate);
            });
        }
    }

    // 5. Active Nav Link Indicator
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 6. Animated Counters
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length > 0) {
        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-counter'), 10);
            const duration = 1800;
            const start = performance.now();

            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = '+' + current;
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = '+' + target;
            };
            requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    // 7. Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 8. Staggered Entrance Animations
    // Selectors: parent containers whose direct children should animate in one by one
    const staggerSelectors = [
        '.soluciones-grid',          // index: service cards
        '.mision-cards',             // nosotros + servicios: mission/service cards
        '.valores-rectangles',       // nosotros: values cards
        '.timeline-path',            // nosotros: timeline steps
        '.contacto-cards-grid',      // contacto: contact option cards
        '.casos-cards-container',    // casos-exito: case cards
    ];

    staggerSelectors.forEach(selector => {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
            const children = Array.from(container.children);

            // Apply initial hidden state + staggered delay to each child
            children.forEach((child, index) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(28px)';
                child.style.transition = `opacity 0.55s ease ${index * 110}ms, transform 0.55s ease ${index * 110}ms`;
            });

            // Observe the container: when it enters view, reveal all children
            const staggerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Array.from(entry.target.children).forEach(child => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        });
                        staggerObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            staggerObserver.observe(container);
        });
    });

    const formContacto = document.getElementById("formcontacto");
    if (formContacto) {
        const inputNombre = formContacto.querySelector('input[name="nombre"]');
        const inputTelefono = formContacto.querySelector('input[name="telefono"]');
        if (inputNombre) {
            inputNombre.addEventListener("input", function (e) {
                e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            });
        }

        if (inputTelefono) {
            inputTelefono.addEventListener("input", function (e) {
                e.target.value = e.target.value.replace(/[^0-9+]/g, '');
            });
        }

        formContacto.addEventListener("submit", function (e) {
            e.preventDefault();

            const btnSubmit = document.getElementById("button-submit-contacto");
            const textoOriginal = btnSubmit.textContent;


            const formData = new FormData(formContacto);
            const turnstileResponse = formData.get("cf-turnstile-response");

            if (!turnstileResponse) {
                Swal.fire({
                    title: "Atención",
                    text: "Por favor, espera a que se complete la verificación de seguridad.",
                    icon: "warning",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#f97316"
                });

                return;
            }
            
            btnSubmit.textContent = "Enviando...";
            btnSubmit.disabled = true;
            fetch("contacto.php", {
                method: "POST",
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error en la red al intentar enviar el formulario");
                    }
                    return response.json();
                })
                .then(data => {
                    Swal.fire({
                        title: "¡Mensaje enviado!",
                        text: data.mensaje,
                        icon: "success",
                        confirmButtonText: "Entendido",
                        confirmButtonColor: "#f97316" // Un tono naranja similar al de tu marca
                    });
                    if (data.status === 200) {
                        formContacto.reset();
                        if (typeof turnstile !== 'undefined') {
                            turnstile.reset();
                        }
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    Swal.fire({
                        title: "Ocurrió un problema",
                        text: "No pudimos enviar tu mensaje en este momento. Por favor, intenta más tarde.",
                        icon: "error",
                        confirmButtonText: "Cerrar",
                        confirmButtonColor: "#f97316"
                    });
                })
                .finally(() => {
                    btnSubmit.textContent = textoOriginal;
                    btnSubmit.disabled = false;
                });
        });
    }
});
