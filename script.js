/* =========================================================
   SSNT — SMARTPREP SPECIAL NEEDS THERAPEUTICS
   Main JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       1. HEADER / MOBILE MENU
    ========================== */
    const siteHeader = document.getElementById("siteHeader");
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    const closeMobileMenu = () => {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    window.addEventListener("scroll", () => {
        siteHeader.classList.toggle("scrolled", window.scrollY > 20);
    });

    /* =========================
       2. DARK / LIGHT MODE
    ========================== */
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const savedTheme = localStorage.getItem("ssnt-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    const updateThemeIcon = () => {
        const isDark = document.body.classList.contains("dark-mode");
        themeIcon.textContent = isDark ? "☀" : "☾";
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    };

    updateThemeIcon();

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("ssnt-theme", isDark ? "dark" : "light");

        updateThemeIcon();
    });

    /* =========================
       3. SOLUTIONS EXPAND / COLLAPSE
    ========================== */
    const solutionsToggle = document.getElementById("solutionsToggle");
    const solutionsToggleText = document.getElementById("solutionsToggleText");
    const solutionsGrid = document.getElementById("solutionsGrid");
    const seeLessButton = document.getElementById("seeLessButton");

    const setSolutionsState = (expanded) => {
        solutionsGrid.classList.toggle("expanded", expanded);
        solutionsToggle.setAttribute("aria-expanded", String(expanded));

        if (expanded) {
            solutionsToggleText.textContent = "Hide Extra Solutions";
        } else {
            solutionsToggleText.textContent = "View All Solutions";
        }
    };

    solutionsToggle.addEventListener("click", () => {
        const expanded = !solutionsGrid.classList.contains("expanded");
        setSolutionsState(expanded);

        if (expanded) {
            setTimeout(() => {
                document.getElementById("extraSolutions").scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }, 120);
        }
    });

    seeLessButton.addEventListener("click", () => {
        setSolutionsState(false);

        document.getElementById("solutions").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    /* =========================
       4. SCROLL REVEAL
    ========================== */
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -45px 0px"
        }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    /* =========================
       5. ANIMATED IMPACT COUNTERS
    ========================== */
    const counters = document.querySelectorAll(".counter");

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.target);
        const duration = 1600;
        const startTime = performance.now();

        const update = (currentTime) => {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(target * easedProgress);

            counter.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.45 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));

    /* =========================
       6. ACTIVE NAVIGATION LINK
    ========================== */
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".desktop-nav .nav-link");

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                navLinks.forEach((link) => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === `#${entry.target.id}`
                    );
                });
            });
        },
        {
            rootMargin: "-35% 0px -55% 0px"
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    /* =========================
       7. REGISTRATION FORM
       (handled by auth.js, which
       saves to Supabase — see
       that file for the submit
       handler)
    ========================== */

    /* =========================
       8. CURRENT YEAR
    ========================== */
    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

    /* =========================
       9. PREVENT PLACEHOLDER LINKS
       FROM JUMPING TO THE TOP
    ========================== */
    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener("click", (event) => event.preventDefault());
    });
});
/* =========================
   GET IT NOW MODAL
========================= */

const solutionButtons = document.querySelectorAll(".solution-btn");

const solutionModal = document.getElementById("solutionModal");
const solutionModalOverlay = document.getElementById("solutionModalOverlay");
const solutionModalClose = document.getElementById("solutionModalClose");

const modalSolutionTitle = document.getElementById("modalSolutionTitle");
const modalSolutionDescription = document.getElementById("modalSolutionDescription");
const modalSolutionPrice = document.getElementById("modalSolutionPrice");

const modalContinueBtn = document.getElementById("modalContinueBtn");

let selectedSolution = "";

solutionButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const card = button.closest(".solution-card");

        const title = card.querySelector("h3").textContent;
        const description = card.querySelector("p").textContent;
        const price = card.querySelector(".solution-footer strong").textContent;

        selectedSolution = title;

        modalSolutionTitle.textContent = title;
        modalSolutionDescription.textContent = description;
        modalSolutionPrice.textContent = price;

        solutionModal.classList.add("active");
        document.body.classList.add("modal-open");
    });

});


function closeSolutionModal() {
    solutionModal.classList.remove("active");
    document.body.classList.remove("modal-open");
}


solutionModalClose.addEventListener("click", closeSolutionModal);

solutionModalOverlay.addEventListener("click", closeSolutionModal);


document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeSolutionModal();
    }

});


modalContinueBtn.addEventListener("click", () => {

    closeSolutionModal();

    const registerSection = document.getElementById("register");
    const solutionSelect = document.getElementById("regSolution");

    if (solutionSelect) {

        const options = Array.from(solutionSelect.options);

        const matchedOption = options.find((option) =>
            option.textContent.trim() === selectedSolution.trim()
        );

        if (matchedOption) {
            solutionSelect.value = matchedOption.value;

            solutionSelect.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );
        }
    }

    if (registerSection) {

        registerSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

});