document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector("nav");
  const mobileMenuToggle = createMobileMenuToggle();
  const navLinks = document.querySelector(".nav-links");
  const navButtons = document.querySelector(".nav-buttons");
  const mobileOverlay = createMobileOverlay();
  const layoutBoundary = nav.querySelector(".layoutboundary");
  if (layoutBoundary && !document.querySelector(".mobile-menu-toggle")) {
    layoutBoundary.appendChild(mobileMenuToggle);
  }
  if (!document.querySelector(".mobile-menu-overlay")) {
    document.body.appendChild(mobileOverlay);
  }
  let lastScroll = 0;
  const scrollThreshold = 100;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > scrollThreshold) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
    lastScroll = currentScroll;
  });
  mobileMenuToggle.addEventListener("click", () => {
    toggleMobileMenu();
  });
  mobileOverlay.addEventListener("click", () => {
    closeMobileMenu();
  });
  if (navLinks) {
    const navLinkItems = navLinks.querySelectorAll("a");
    navLinkItems.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });
  }
  if (window.innerWidth <= 1000 && navButtons && navLinks) {
    moveButtonsToMobileMenu();
  }
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 1000 && navButtons && navLinks) {
      moveButtonsToMobileMenu();
    }
  });
  function moveButtonsToMobileMenu() {
    if (!navLinks.querySelector(".nav-buttons") && navButtons) {
      navLinks.appendChild(navButtons);
    }
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenuToggle.classList.contains("active")) {
      closeMobileMenu();
    }
  });
  function toggleBodyScroll(disable) {
    if (disable) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
  function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
    if (navButtons) {
      navButtons.classList.toggle("active");
    }
    mobileOverlay.classList.toggle("active");
    toggleBodyScroll(mobileMenuToggle.classList.contains("active"));
  }
  function closeMobileMenu() {
    mobileMenuToggle.classList.remove("active");
    navLinks.classList.remove("active");
    if (navButtons) {
      navButtons.classList.remove("active");
    }
    mobileOverlay.classList.remove("active");
    toggleBodyScroll(false);
  }
  const isOnePage = checkIfOnePage();
  if (isOnePage) {
    handleOnePageNavigation();
  } else {
    setActiveNavLink();
  }
  function checkIfOnePage() {
    const navLinkItems = document.querySelectorAll(".nav-links a");
    let anchorLinkCount = 0;
    navLinkItems.forEach((link) => {
      if (link.getAttribute("href")?.startsWith("/#")) {
        anchorLinkCount++;
      }
    });
    return anchorLinkCount > 2;
  }
  function handleOnePageNavigation() {
    const sections = document.querySelectorAll("section[id]");
    const navLinkItems = document.querySelectorAll(".nav-links a");
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "-100px 0px -60% 0px",
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("id");
          navLinkItems.forEach((link) => {
            link.classList.remove("active");
          });
          const activeLink = document.querySelector(
            `.nav-links a[href="/#${sectionId}"], .nav-links a[href="#${sectionId}"]`
          );
          if (activeLink) {
            activeLink.classList.add("active");
          }
        }
      });
    }, observerOptions);
    sections.forEach((section) => {
      observer.observe(section);
    });
    navLinkItems.forEach((link) => {
      if (link.getAttribute("href")?.includes("#")) {
        link.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          const targetId = href.includes("/#")
            ? href.split("/#")[1]
            : href.split("#")[1];
          const target = document.getElementById(targetId);
          if (target) {
            e.preventDefault();
            const nav = document.querySelector("nav");
            const navHeight = nav ? nav.offsetHeight : 0;
            const targetPosition =
              target.getBoundingClientRect().top +
              window.pageYOffset -
              navHeight -
              20;
            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });
            history.pushState(null, null, href);
            closeMobileMenu();
          }
        });
      }
    });
  }
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinkItems = document.querySelectorAll(".nav-links a");
    navLinkItems.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      if (
        linkPath === currentPath ||
        (currentPath === "/" && linkPath === "/") ||
        (currentPath.includes(linkPath) && linkPath !== "/")
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
});
function createMobileMenuToggle() {
  const button = document.createElement("button");
  button.className = "mobile-menu-toggle";
  button.setAttribute("aria-label", "Mobile Menu Toggle");
  button.setAttribute("aria-expanded", "false");
  for (let i = 0; i < 3; i++) {
    const span = document.createElement("span");
    button.appendChild(span);
  }
  return button;
}
function createMobileOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";
  return overlay;
}
