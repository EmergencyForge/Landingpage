"use strict";

// ===== Navbar Scroll & Mobile Menu Functionality =====
document.addEventListener("DOMContentLoaded", function () {
  var nav = document.querySelector("nav");
  var mobileMenuToggle = createMobileMenuToggle();
  var navLinks = document.querySelector(".nav-links");
  var mobileOverlay = createMobileOverlay(); // Add mobile menu toggle button to nav

  var layoutBoundary = nav.querySelector(".layoutboundary");

  if (layoutBoundary && !document.querySelector(".mobile-menu-toggle")) {
    layoutBoundary.appendChild(mobileMenuToggle);
  } // Add overlay to body


  if (!document.querySelector(".mobile-menu-overlay")) {
    document.body.appendChild(mobileOverlay);
  } // ===== Scroll Detection for Desktop =====


  var lastScroll = 0;
  var scrollThreshold = 100;
  window.addEventListener("scroll", function () {
    var currentScroll = window.pageYOffset;

    if (currentScroll > scrollThreshold) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }

    lastScroll = currentScroll;
  }); // ===== Mobile Menu Toggle =====

  mobileMenuToggle.addEventListener("click", function () {
    toggleMobileMenu();
  }); // Close menu when clicking overlay

  mobileOverlay.addEventListener("click", function () {
    closeMobileMenu();
  }); // Close menu when clicking a link

  if (navLinks) {
    var navLinkItems = navLinks.querySelectorAll("a");
    navLinkItems.forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileMenu();
      });
    });
  } // Close menu on escape key


  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenuToggle.classList.contains("active")) {
      closeMobileMenu();
    }
  }); // Prevent body scroll when menu is open

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
    mobileOverlay.classList.toggle("active");
    toggleBodyScroll(mobileMenuToggle.classList.contains("active"));
  }

  function closeMobileMenu() {
    mobileMenuToggle.classList.remove("active");
    navLinks.classList.remove("active");
    mobileOverlay.classList.remove("active");
    toggleBodyScroll(false);
  } // ===== Active Link Highlighting =====


  setActiveNavLink();

  function setActiveNavLink() {
    var currentPath = window.location.pathname;
    var navLinkItems = document.querySelectorAll(".nav-links a");
    navLinkItems.forEach(function (link) {
      var linkPath = new URL(link.href).pathname;

      if (linkPath === currentPath || currentPath === "/" && linkPath === "/" || currentPath.includes(linkPath) && linkPath !== "/") {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}); // ===== Helper Functions =====

function createMobileMenuToggle() {
  var button = document.createElement("button");
  button.className = "mobile-menu-toggle";
  button.setAttribute("aria-label", "Mobile Menu Toggle");
  button.setAttribute("aria-expanded", "false");

  for (var i = 0; i < 3; i++) {
    var span = document.createElement("span");
    button.appendChild(span);
  }

  return button;
}

function createMobileOverlay() {
  var overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";
  return overlay;
} // ===== Smooth Scroll for Anchor Links =====


document.addEventListener("DOMContentLoaded", function () {
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = this.getAttribute("href"); // Skip if it's just "#" or starts with "#wiki:"

      if (href === "#" || href.startsWith("#wiki:")) {
        return;
      }

      var target = document.querySelector(href);

      if (target) {
        e.preventDefault(); // Get navbar height for offset

        var nav = document.querySelector("nav");
        var navHeight = nav ? nav.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        }); // Update URL without triggering scroll

        history.pushState(null, null, href);
      }
    });
  });
});