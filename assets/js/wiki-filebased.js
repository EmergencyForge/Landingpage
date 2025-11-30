let wikiIndex = [];
let allArticles = [];
let authorsData = [];
document.addEventListener("DOMContentLoaded", async () => {
  await loadWikiIndex();
  await loadAuthors();
  populateSidebar();
  populatePopularArticles();
  setupSearchFunctionality();
  handleURLParams();
});
async function loadWikiIndex() {
  try {
    const response = await fetch("/wiki/index.json");
    wikiIndex = await response.json();
    allArticles = wikiIndex;
    console.log("Loaded wiki index:", wikiIndex.length, "articles");
  } catch (error) {
    console.error("Error loading wiki index:", error);
    wikiIndex = [];
  }
}
async function loadAuthors() {
  try {
    const response = await fetch("/wiki/authors.json");
    authorsData = await response.json();
    console.log("Loaded authors:", authorsData.length, "authors");
  } catch (error) {
    console.error("Error loading authors:", error);
    authorsData = [];
  }
}
function populateSidebar() {
  const categories = {
    "getting-started": document.getElementById("gettingStartedNav"),
    setup: document.getElementById("setupNav"),
    intrarp: document.getElementById("intraRPNav"),
    intratab: document.getElementById("intraTabNav"),
    advanced: document.getElementById("advancedNav"),
  };
  Object.values(categories).forEach((nav) => {
    if (nav) nav.innerHTML = "";
  });
  wikiIndex.forEach((article) => {
    const navElement = categories[article.category];
    if (navElement) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${article.slug}`;
      a.textContent = article.title;
      a.dataset.slug = article.slug;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        loadArticle(article.slug);
      });
      li.appendChild(a);
      navElement.appendChild(li);
    }
  });
}
function populatePopularArticles() {
  const container = document.getElementById("popularArticles");
  if (!container) return;
  const popularArticles = wikiIndex.filter((article) => article.popular);
  if (popularArticles.length === 0) {
    container.innerHTML =
      '<p style="color: #666;">Keine beliebten Artikel vorhanden</p>';
    return;
  }
  container.innerHTML = popularArticles
    .map(
      (article) => `
    <div class="popular-article-card" onclick="loadArticle('${article.slug}')">
      <h4>${article.title}</h4>
      <p>${article.description}</p>
    </div>
  `
    )
    .join("");
}
async function loadArticle(slug) {
  const article = wikiIndex.find((a) => a.slug === slug);
  if (!article) {
    showError("Artikel nicht gefunden");
    return;
  }
  try {
    const response = await fetch(`/wiki/${article.category}/${article.file}`);
    if (!response.ok) throw new Error("Artikel konnte nicht geladen werden");
    const markdown = await response.text();
    const { meta, content } = parseFrontmatter(markdown);

    // Process custom syntax and extract info boxes
    const { markdown: processedMarkdown, boxes } = convertCustomSyntax(content);

    // Parse markdown to HTML
    const htmlContent = marked.parse(processedMarkdown);

    // Restore info boxes with parsed markdown content
    const boxConfig = {
      info: { icon: "las la-info-circle", title: "Hinweis", color: "#007bff" },
      warning: {
        icon: "las la-exclamation-triangle",
        title: "Achtung",
        color: "#ffc107",
      },
      error: {
        icon: "las la-exclamation-circle",
        title: "Wichtig",
        color: "#ff0000",
      },
      success: {
        icon: "las la-check-circle",
        title: "Erfolg",
        color: "#28a745",
      },
      tip: { icon: "las la-bolt", title: "Tipp", color: "#9b59b6" },
    };
    const contentWithBoxes = restoreInfoBoxes(htmlContent, boxes, boxConfig);

    // Process external links
    const finalContent = processExternalLinks(contentWithBoxes);

    // Build article HTML
    const articleHTML = buildArticleHTML(article, meta, finalContent);
    const articleElement = document.getElementById("wikiArticle");
    articleElement.innerHTML = articleHTML;

    // Generate and insert table of contents
    generateTableOfContents();

    document.querySelectorAll(".wiki-nav a").forEach((link) => {
      link.classList.remove("active");
      if (link.dataset.slug === slug) {
        link.classList.add("active");
      }
    });
    window.history.pushState({ slug }, article.title, `#${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setupInternalLinks();
    if (typeof Prism !== "undefined") {
      Prism.highlightAll();
    }
  } catch (error) {
    console.error("Error loading article:", error);
    showError("Fehler beim Laden des Artikels");
  }
}
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);
  if (match) {
    const frontmatter = match[1];
    const content = match[2];
    const meta = {};
    frontmatter.split("\n").forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        meta[key] = value.replace(/^["']|["']$/g, "");
      }
    });
    return { meta, content: content.trim() };
  }
  return { meta: {}, content: markdown };
}
function convertCustomSyntax(markdown) {
  const boxConfig = {
    info: {
      icon: "las la-info-circle",
      title: "Hinweis",
      color: "#007bff",
    },
    warning: {
      icon: "las la-exclamation-triangle",
      title: "Achtung",
      color: "#ffc107",
    },
    error: {
      icon: "las la-exclamation-circle",
      title: "Wichtig",
      color: "#ff0000",
    },
    success: {
      icon: "las la-check-circle",
      title: "Erfolg",
      color: "#28a745",
    },
    tip: {
      icon: "las la-bolt",
      title: "Tipp",
      color: "#9b59b6",
    },
  };

  const boxes = [];
  const boxRegex =
    /:::[\s]*(info|warning|error|success|tip)\s*\n([\s\S]*?)\n:::/g;

  let converted = markdown.replace(boxRegex, (match, type, content) => {
    const index = boxes.length;
    boxes.push({ type, content: content.trim() });
    return `<!--INFOBOX_${index}-->`;
  });

  return { markdown: converted, boxes };
}

function restoreInfoBoxes(html, boxes, boxConfig) {
  boxes.forEach((box, index) => {
    const config = boxConfig[box.type];
    const placeholder = `<!--INFOBOX_${index}-->`;

    const boxContent = marked.parse(box.content);

    const boxHtml = `<div class="info-box ${box.type}">
<div class="info-box-header">
<i class="${config.icon}"></i>
<span class="info-box-title">${config.title}</span>
</div>
<div class="info-box-content"><p>${boxContent}</p></div>
</div>`;

    if (html.includes(placeholder)) {
      html = html.replace(placeholder, boxHtml);
    } else {
      console.warn(
        `Placeholder ${placeholder} not found in HTML for box type: ${box.type}`
      );
      console.log("Box content:", box.content);
    }
  });

  return html;
}
function getAuthorInfo(authorId) {
  if (!authorId || authorsData.length === 0) return null;
  const author = authorsData.find(
    (a) =>
      a.id === authorId ||
      a.name === authorId ||
      a.id === authorId.toLowerCase().replace(/\s+/g, "-")
  );
  return author || null;
}
function buildAuthorBox(author) {
  if (!author) return "";
  const socialLinks = [];
  if (author.links) {
    if (author.links.github) {
      socialLinks.push(
        `<a href="${author.links.github}" target="_blank" rel="noopener noreferrer" title="GitHub"><i class="lab la-github"></i></a>`
      );
    }
    if (author.links.discord) {
      socialLinks.push(
        `<a href="${author.links.discord}" target="_blank" rel="noopener noreferrer" title="Discord"><i class="lab la-discord"></i></a>`
      );
    }
    if (author.links.twitter) {
      socialLinks.push(
        `<a href="${author.links.twitter}" target="_blank" rel="noopener noreferrer" title="Twitter"><i class="lab la-twitter"></i></a>`
      );
    }
    if (author.links.website) {
      socialLinks.push(
        `<a href="${author.links.website}" target="_blank" rel="noopener noreferrer" title="Website"><i class="las la-globe"></i></a>`
      );
    }
  }
  const avatarUrl = author.avatar || "/assets/img/authors/default-avatar.webp";
  return `
    <div class="author-box">
      <div class="author-box-header">
        <i class="las la-user-circle"></i>
        <h3>Über den Autor</h3>
      </div>
      <div class="author-box-content">
        <div class="author-avatar">
          <img src="${avatarUrl}" alt="${
    author.name
  }" onerror="this.src='/assets/img/authors/default-avatar.webp'" />
        </div>
        <div class="author-info">
          <h4>${author.name}</h4>
          ${author.role ? `<p class="author-role">${author.role}</p>` : ""}
          ${author.bio ? `<p class="author-bio">${author.bio}</p>` : ""}
          ${
            socialLinks.length > 0
              ? `
            <div class="author-social">
              ${socialLinks.join("")}
            </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `;
}
function buildArticleHTML(article, meta, content) {
  const categoryNames = {
    "getting-started": "Erste Schritte",
    setup: "Setup & Konfiguration",
    intrarp: "intraRP",
    intratab: "intraTab",
    advanced: "Weitere Themen",
  };
  const category = categoryNames[article.category] || article.category;
  const date = meta.date || new Date().toLocaleDateString("de-DE");
  const readTime = meta.readTime || calculateReadTime(content);
  const authorId = meta.author || "emergencyforge-team";
  const authorInfo = getAuthorInfo(authorId);
  return `
    <div class="article-category">${category}</div>
    <div class="breadcrumbs">
      <a href="/wiki.html">Wiki</a>
      <span>/</span>
      <a href="#" data-category="${article.category}">${category}</a>
      <span>/</span>
      <span>${article.title}</span>
    </div>
    <div class="article-header">
      <h1>${article.title}</h1>
      <div class="article-meta">
        <span><i class="las la-calendar"></i> Zuletzt aktualisiert: ${date}</span>
        <span><i class="las la-clock"></i> Lesezeit: ${readTime} Min.</span>
        ${
          authorInfo
            ? `<span><i class="las la-user"></i> Von ${authorInfo.name}</span>`
            : ""
        }
      </div>
    </div>
    <div class="article-content">
      ${content}
    </div>
    ${authorInfo ? buildAuthorBox(authorInfo) : ""}
  `;
}
function processExternalLinks(html) {
  const externalLinkRegex =
    /<a\s+href="([^"]+)"([^>]*)>([^<]+)<\/a>\s*\{\.external\}/g;
  let processed = html.replace(
    externalLinkRegex,
    (match, url, otherAttrs, text) => {
      return `<a href="${url}"${otherAttrs} target="_blank" rel="nofollow noopener noreferrer" class="external-link">${text} <i class="las la-external-link-alt"></i></a>`;
    }
  );
  return processed;
}
function calculateReadTime(html) {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
}
function setupInternalLinks() {
  document.querySelectorAll('.article-content a[href^="#"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (href.startsWith("#wiki:")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const slug = href.replace("#wiki:", "");
        loadArticle(slug);
      });
    }
  });
}

function generateTableOfContents() {
  const articleContent = document.querySelector(".article-content");
  if (!articleContent) return;

  const wikiMain = document.querySelector(".wiki-main");

  // Remove existing table of contents if present
  const existingToc = document.querySelector(".table-of-contents");
  if (existingToc) {
    existingToc.remove();
    // Reset the collapsed class when TOC is removed
    if (wikiMain) {
      wikiMain.classList.remove("toc-collapsed");
    }
  }

  const headings = articleContent.querySelectorAll("h2, h3");

  if (headings.length < 2) {
    return;
  }

  headings.forEach((heading, index) => {
    if (!heading.id) {
      const text = heading.textContent.trim();
      const id = text
        .toLowerCase()
        .replace(/[äöüß]/g, (char) => {
          const map = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
          return map[char] || char;
        })
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      heading.id = id || `heading-${index}`;
    }
  });

  // Build TOC HTML with toggle button
  let tocHTML = `<nav class="table-of-contents">
    <div class="toc-header">
      <i class="las la-list"></i>
      <h3>Inhaltsverzeichnis</h3>
      <button class="toc-toggle" title="Inhaltsverzeichnis ein-/ausklappen">
        <i class="las la-angle-left"></i>
      </button>
    </div>
    <ul class="toc-list">`;

  headings.forEach((heading) => {
    const level = heading.tagName.toLowerCase();
    const text = heading.textContent.trim();
    const id = heading.id;
    const className = level === "h3" ? "toc-item-sub" : "toc-item";

    tocHTML += `<li class="${className}"><a href="#${id}">${text}</a></li>`;
  });

  tocHTML += "</ul></nav>";

  // Insert TOC as sibling to wiki-article, not inside it
  const wikiArticle = document.querySelector(".wiki-article");

  if (wikiMain && wikiArticle) {
    // Insert TOC after the wiki-article element
    wikiArticle.insertAdjacentHTML("afterend", tocHTML);

    // Add smooth scroll behavior to TOC links
    document.querySelectorAll(".table-of-contents a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
          // Update URL hash
          window.history.replaceState(
            null,
            null,
            `${window.location.pathname}${
              window.location.hash.split("#")[0] || ""
            }#${targetId}`
          );
        }
      });
    });

    // Add toggle functionality (desktop only)
    const tocToggle = document.querySelector(".toc-toggle");
    const tocElement = document.querySelector(".table-of-contents");

    if (tocToggle && tocElement && wikiMain) {
      // Check for saved state in localStorage
      const tocCollapsed = localStorage.getItem("toc-collapsed") === "true";
      if (tocCollapsed) {
        tocElement.classList.add("collapsed");
        wikiMain.classList.add("toc-collapsed");
      }

      tocToggle.addEventListener("click", () => {
        tocElement.classList.toggle("collapsed");
        wikiMain.classList.toggle("toc-collapsed");

        // Save state to localStorage
        localStorage.setItem(
          "toc-collapsed",
          tocElement.classList.contains("collapsed")
        );
      });
    }
  }
}
function handleURLParams() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    loadArticle(hash);
  }
}
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.slug) {
    loadArticle(e.state.slug);
  } else {
    location.reload();
  }
});
function setupSearchFunctionality() {
  const searchInput = document.getElementById("wikiSearch");
  const searchResults = document.getElementById("searchResults");
  const clearBtn = document.getElementById("clearSearch");
  if (!searchInput || !searchResults) return;
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length === 0) {
      searchResults.style.display = "none";
      clearBtn.style.display = "none";
      return;
    }
    clearBtn.style.display = "block";
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchResults.style.display = "none";
    clearBtn.style.display = "none";
    searchInput.focus();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      searchResults.style.display = "none";
    }
  });
}
async function performSearch(query) {
  const searchResults = document.getElementById("searchResults");
  const lowerQuery = query.toLowerCase();
  const indexResults = wikiIndex.filter((article) => {
    return (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      (article.tags &&
        article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
    );
  });
  const contentResults = [];
  for (const article of wikiIndex.slice(0, 20)) {
    try {
      const response = await fetch(`/wiki/${article.category}/${article.file}`);
      const markdown = await response.text();
      const { content } = parseFrontmatter(markdown);
      if (content.toLowerCase().includes(lowerQuery)) {
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + 100);
        const context = content.substring(start, end).replace(/<[^>]*>/g, "");
        contentResults.push({
          ...article,
          context,
        });
      }
    } catch (error) {
      continue;
    }
  }
  const allResults = [...indexResults];
  contentResults.forEach((cr) => {
    if (!allResults.find((r) => r.slug === cr.slug)) {
      allResults.push(cr);
    }
  });
  if (allResults.length === 0) {
    searchResults.innerHTML =
      '<div class="no-results">Keine Ergebnisse gefunden</div>';
    searchResults.style.display = "block";
    return;
  }
  const categoryNames = {
    "getting-started": "Erste Schritte",
    setup: "Setup & Konfiguration",
    intrarp: "intraRP",
    intratab: "intraTab",
    advanced: "Weitere Themen",
  };
  searchResults.innerHTML = allResults
    .slice(0, 10)
    .map(
      (article) => `
    <div class="search-result-item" onclick="loadArticle('${
      article.slug
    }'); document.getElementById('searchResults').style.display='none';">
      <h4>${highlightText(article.title, query)}</h4>
      <p>${highlightText(article.context || article.description, query)}</p>
      <span class="category-badge">${categoryNames[article.category]}</span>
    </div>
  `
    )
    .join("");
  searchResults.style.display = "block";
}
function highlightText(text, query) {
  if (!text) return "";
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(
    regex,
    '<strong style="color: var(--primary-color);">$1</strong>'
  );
}
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function showError(message) {
  const articleElement = document.getElementById("wikiArticle");
  articleElement.innerHTML = `
    <div style="text-align: center; padding: 4rem 2rem;">
      <i class="las la-exclamation-circle" style="font-size: 4rem; color: var(--primary-color); opacity: 0.5;"></i>
      <h2>${message}</h2>
      <p style="color: #666;">Bitte versuche es erneut oder wähle einen anderen Artikel.</p>
      <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
        Seite neu laden
      </button>
    </div>
  `;
}
if (typeof marked !== "undefined") {
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
  });

  // Helper function to escape HTML entities
  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Custom renderer for code blocks
  const renderer = {
    code(token) {
      const lang = token.lang || "plaintext";
      const code = escapeHtml(token.text);
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    },
  };

  marked.use({ renderer });
}
