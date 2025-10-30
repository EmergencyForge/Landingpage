"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var wikiIndex = [];
var allArticles = [];
var authorsData = [];
document.addEventListener("DOMContentLoaded", function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(loadWikiIndex());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(loadAuthors());

        case 4:
          populateSidebar();
          populatePopularArticles();
          setupSearchFunctionality();
          handleURLParams();

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
});

function loadWikiIndex() {
  var response;
  return regeneratorRuntime.async(function loadWikiIndex$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(fetch("/wiki/index.json"));

        case 3:
          response = _context2.sent;
          _context2.next = 6;
          return regeneratorRuntime.awrap(response.json());

        case 6:
          wikiIndex = _context2.sent;
          allArticles = wikiIndex;
          console.log("Loaded wiki index:", wikiIndex.length, "articles");
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.error("Error loading wiki index:", _context2.t0);
          wikiIndex = [];

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
}

function loadAuthors() {
  var response;
  return regeneratorRuntime.async(function loadAuthors$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(fetch("/wiki/authors.json"));

        case 3:
          response = _context3.sent;
          _context3.next = 6;
          return regeneratorRuntime.awrap(response.json());

        case 6:
          authorsData = _context3.sent;
          console.log("Loaded authors:", authorsData.length, "authors");
          _context3.next = 14;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          console.error("Error loading authors:", _context3.t0);
          authorsData = [];

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
}

function populateSidebar() {
  var categories = {
    "getting-started": document.getElementById("gettingStartedNav"),
    setup: document.getElementById("setupNav"),
    intrarp: document.getElementById("intraRPNav"),
    intratab: document.getElementById("intraTabNav"),
    advanced: document.getElementById("advancedNav")
  };
  Object.values(categories).forEach(function (nav) {
    if (nav) nav.innerHTML = "";
  });
  wikiIndex.forEach(function (article) {
    var navElement = categories[article.category];

    if (navElement) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#".concat(article.slug);
      a.textContent = article.title;
      a.dataset.slug = article.slug;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        loadArticle(article.slug);
      });
      li.appendChild(a);
      navElement.appendChild(li);
    }
  });
}

function populatePopularArticles() {
  var container = document.getElementById("popularArticles");
  if (!container) return;
  var popularArticles = wikiIndex.filter(function (article) {
    return article.popular;
  });

  if (popularArticles.length === 0) {
    container.innerHTML = '<p style="color: #666;">Keine beliebten Artikel vorhanden</p>';
    return;
  }

  container.innerHTML = popularArticles.map(function (article) {
    return "\n    <div class=\"popular-article-card\" onclick=\"loadArticle('".concat(article.slug, "')\">\n      <h4>").concat(article.title, "</h4>\n      <p>").concat(article.description, "</p>\n    </div>\n  ");
  }).join("");
}

function loadArticle(slug) {
  var article, response, markdown, _parseFrontmatter, meta, content, _convertCustomSyntax, processedMarkdown, boxes, htmlContent, boxConfig, contentWithBoxes, finalContent, articleHTML, articleElement;

  return regeneratorRuntime.async(function loadArticle$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          article = wikiIndex.find(function (a) {
            return a.slug === slug;
          });

          if (article) {
            _context4.next = 4;
            break;
          }

          showError("Artikel nicht gefunden");
          return _context4.abrupt("return");

        case 4:
          _context4.prev = 4;
          _context4.next = 7;
          return regeneratorRuntime.awrap(fetch("/wiki/".concat(article.category, "/").concat(article.file)));

        case 7:
          response = _context4.sent;

          if (response.ok) {
            _context4.next = 10;
            break;
          }

          throw new Error("Artikel konnte nicht geladen werden");

        case 10:
          _context4.next = 12;
          return regeneratorRuntime.awrap(response.text());

        case 12:
          markdown = _context4.sent;
          _parseFrontmatter = parseFrontmatter(markdown), meta = _parseFrontmatter.meta, content = _parseFrontmatter.content; // Process custom syntax and extract info boxes

          _convertCustomSyntax = convertCustomSyntax(content), processedMarkdown = _convertCustomSyntax.markdown, boxes = _convertCustomSyntax.boxes; // Parse markdown to HTML

          htmlContent = marked.parse(processedMarkdown); // Restore info boxes with parsed markdown content

          boxConfig = {
            info: {
              icon: "las la-info-circle",
              title: "Hinweis",
              color: "#007bff"
            },
            warning: {
              icon: "las la-exclamation-triangle",
              title: "Achtung",
              color: "#ffc107"
            },
            error: {
              icon: "las la-exclamation-circle",
              title: "Wichtig",
              color: "#ff0000"
            },
            success: {
              icon: "las la-check-circle",
              title: "Erfolg",
              color: "#28a745"
            },
            tip: {
              icon: "las la-bolt",
              title: "Tipp",
              color: "#9b59b6"
            }
          };
          contentWithBoxes = restoreInfoBoxes(htmlContent, boxes, boxConfig); // Process external links

          finalContent = processExternalLinks(contentWithBoxes); // Build article HTML

          articleHTML = buildArticleHTML(article, meta, finalContent);
          articleElement = document.getElementById("wikiArticle");
          articleElement.innerHTML = articleHTML; // Generate and insert table of contents

          generateTableOfContents();
          document.querySelectorAll(".wiki-nav a").forEach(function (link) {
            link.classList.remove("active");

            if (link.dataset.slug === slug) {
              link.classList.add("active");
            }
          });
          window.history.pushState({
            slug: slug
          }, article.title, "#".concat(slug));
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
          setupInternalLinks();

          if (typeof Prism !== "undefined") {
            Prism.highlightAll();
          }

          _context4.next = 34;
          break;

        case 30:
          _context4.prev = 30;
          _context4.t0 = _context4["catch"](4);
          console.error("Error loading article:", _context4.t0);
          showError("Fehler beim Laden des Artikels");

        case 34:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[4, 30]]);
}

function parseFrontmatter(markdown) {
  var frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  var match = markdown.match(frontmatterRegex);

  if (match) {
    var frontmatter = match[1];
    var content = match[2];
    var meta = {};
    frontmatter.split("\n").forEach(function (line) {
      var colonIndex = line.indexOf(":");

      if (colonIndex > 0) {
        var key = line.substring(0, colonIndex).trim();
        var value = line.substring(colonIndex + 1).trim();
        meta[key] = value.replace(/^["']|["']$/g, "");
      }
    });
    return {
      meta: meta,
      content: content.trim()
    };
  }

  return {
    meta: {},
    content: markdown
  };
}

function convertCustomSyntax(markdown) {
  var boxConfig = {
    info: {
      icon: "las la-info-circle",
      title: "Hinweis",
      color: "#007bff"
    },
    warning: {
      icon: "las la-exclamation-triangle",
      title: "Achtung",
      color: "#ffc107"
    },
    error: {
      icon: "las la-exclamation-circle",
      title: "Wichtig",
      color: "#ff0000"
    },
    success: {
      icon: "las la-check-circle",
      title: "Erfolg",
      color: "#28a745"
    },
    tip: {
      icon: "las la-bolt",
      title: "Tipp",
      color: "#9b59b6"
    }
  };
  var boxes = [];
  var boxRegex = /:::[\s]*(info|warning|error|success|tip)\s*\n([\s\S]*?)\n:::/g;
  var converted = markdown.replace(boxRegex, function (match, type, content) {
    var index = boxes.length;
    boxes.push({
      type: type,
      content: content.trim()
    });
    return "<!--INFOBOX_".concat(index, "-->");
  });
  return {
    markdown: converted,
    boxes: boxes
  };
}

function restoreInfoBoxes(html, boxes, boxConfig) {
  boxes.forEach(function (box, index) {
    var config = boxConfig[box.type];
    var placeholder = "<!--INFOBOX_".concat(index, "-->");
    var boxContent = marked.parse(box.content);
    var boxHtml = "<div class=\"info-box ".concat(box.type, "\">\n<div class=\"info-box-header\">\n<i class=\"").concat(config.icon, "\"></i>\n<span class=\"info-box-title\">").concat(config.title, "</span>\n</div>\n<div class=\"info-box-content\"><p>").concat(boxContent, "</p></div>\n</div>");

    if (html.includes(placeholder)) {
      html = html.replace(placeholder, boxHtml);
    } else {
      console.warn("Placeholder ".concat(placeholder, " not found in HTML for box type: ").concat(box.type));
      console.log("Box content:", box.content);
    }
  });
  return html;
}

function getAuthorInfo(authorId) {
  if (!authorId || authorsData.length === 0) return null;
  var author = authorsData.find(function (a) {
    return a.id === authorId || a.name === authorId || a.id === authorId.toLowerCase().replace(/\s+/g, "-");
  });
  return author || null;
}

function buildAuthorBox(author) {
  if (!author) return "";
  var socialLinks = [];

  if (author.links) {
    if (author.links.github) {
      socialLinks.push("<a href=\"".concat(author.links.github, "\" target=\"_blank\" rel=\"noopener noreferrer\" title=\"GitHub\"><i class=\"lab la-github\"></i></a>"));
    }

    if (author.links.discord) {
      socialLinks.push("<a href=\"".concat(author.links.discord, "\" target=\"_blank\" rel=\"noopener noreferrer\" title=\"Discord\"><i class=\"lab la-discord\"></i></a>"));
    }

    if (author.links.twitter) {
      socialLinks.push("<a href=\"".concat(author.links.twitter, "\" target=\"_blank\" rel=\"noopener noreferrer\" title=\"Twitter\"><i class=\"lab la-twitter\"></i></a>"));
    }

    if (author.links.website) {
      socialLinks.push("<a href=\"".concat(author.links.website, "\" target=\"_blank\" rel=\"noopener noreferrer\" title=\"Website\"><i class=\"las la-globe\"></i></a>"));
    }
  }

  var avatarUrl = author.avatar || "/assets/img/authors/default-avatar.webp";
  return "\n    <div class=\"author-box\">\n      <div class=\"author-box-header\">\n        <i class=\"las la-user-circle\"></i>\n        <h3>\xDCber den Autor</h3>\n      </div>\n      <div class=\"author-box-content\">\n        <div class=\"author-avatar\">\n          <img src=\"".concat(avatarUrl, "\" alt=\"").concat(author.name, "\" onerror=\"this.src='/assets/img/authors/default-avatar.webp'\" />\n        </div>\n        <div class=\"author-info\">\n          <h4>").concat(author.name, "</h4>\n          ").concat(author.role ? "<p class=\"author-role\">".concat(author.role, "</p>") : "", "\n          ").concat(author.bio ? "<p class=\"author-bio\">".concat(author.bio, "</p>") : "", "\n          ").concat(socialLinks.length > 0 ? "\n            <div class=\"author-social\">\n              ".concat(socialLinks.join(""), "\n            </div>\n          ") : "", "\n        </div>\n      </div>\n    </div>\n  ");
}

function buildArticleHTML(article, meta, content) {
  var categoryNames = {
    "getting-started": "Erste Schritte",
    setup: "Setup & Konfiguration",
    intrarp: "intraRP",
    intratab: "intraTab",
    advanced: "Weitere Themen"
  };
  var category = categoryNames[article.category] || article.category;
  var date = meta.date || new Date().toLocaleDateString("de-DE");
  var readTime = meta.readTime || calculateReadTime(content);
  var authorId = meta.author || "emergencyforge-team";
  var authorInfo = getAuthorInfo(authorId);
  return "\n    <div class=\"article-category\">".concat(category, "</div>\n    <div class=\"breadcrumbs\">\n      <a href=\"/wiki.html\">Wiki</a>\n      <span>/</span>\n      <a href=\"#\" data-category=\"").concat(article.category, "\">").concat(category, "</a>\n      <span>/</span>\n      <span>").concat(article.title, "</span>\n    </div>\n    <div class=\"article-header\">\n      <h1>").concat(article.title, "</h1>\n      <div class=\"article-meta\">\n        <span><i class=\"las la-calendar\"></i> Zuletzt aktualisiert: ").concat(date, "</span>\n        <span><i class=\"las la-clock\"></i> Lesezeit: ").concat(readTime, " Min.</span>\n        ").concat(authorInfo ? "<span><i class=\"las la-user\"></i> Von ".concat(authorInfo.name, "</span>") : "", "\n      </div>\n    </div>\n    <div class=\"article-content\">\n      ").concat(content, "\n    </div>\n    ").concat(authorInfo ? buildAuthorBox(authorInfo) : "", "\n  ");
}

function processExternalLinks(html) {
  var externalLinkRegex = /<a\s+href="([^"]+)"([^>]*)>([^<]+)<\/a>\s*\{\.external\}/g;
  var processed = html.replace(externalLinkRegex, function (match, url, otherAttrs, text) {
    return "<a href=\"".concat(url, "\"").concat(otherAttrs, " target=\"_blank\" rel=\"nofollow noopener noreferrer\" class=\"external-link\">").concat(text, " <i class=\"las la-external-link-alt\"></i></a>");
  });
  return processed;
}

function calculateReadTime(html) {
  var text = html.replace(/<[^>]*>/g, " ");
  var words = text.trim().split(/\s+/).length;
  var minutes = Math.ceil(words / 200);
  return minutes;
}

function setupInternalLinks() {
  document.querySelectorAll('.article-content a[href^="#"]').forEach(function (link) {
    var href = link.getAttribute("href");

    if (href.startsWith("#wiki:")) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var slug = href.replace("#wiki:", "");
        loadArticle(slug);
      });
    }
  });
}

function generateTableOfContents() {
  var articleContent = document.querySelector(".article-content");
  if (!articleContent) return;
  var headings = articleContent.querySelectorAll("h2, h3");

  if (headings.length < 2) {
    return;
  }

  headings.forEach(function (heading, index) {
    if (!heading.id) {
      var text = heading.textContent.trim();
      var id = text.toLowerCase().replace(/[äöüß]/g, function (_char) {
        var map = {
          ä: "ae",
          ö: "oe",
          ü: "ue",
          ß: "ss"
        };
        return map[_char] || _char;
      }).replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      heading.id = id || "heading-".concat(index);
    }
  }); // Build TOC HTML with toggle button

  var tocHTML = "<nav class=\"table-of-contents\">\n    <div class=\"toc-header\">\n      <i class=\"las la-list\"></i>\n      <h3>Inhaltsverzeichnis</h3>\n      <button class=\"toc-toggle\" title=\"Inhaltsverzeichnis ein-/ausklappen\">\n        <i class=\"las la-angle-left\"></i>\n      </button>\n    </div>\n    <ul class=\"toc-list\">";
  headings.forEach(function (heading) {
    var level = heading.tagName.toLowerCase();
    var text = heading.textContent.trim();
    var id = heading.id;
    var className = level === "h3" ? "toc-item-sub" : "toc-item";
    tocHTML += "<li class=\"".concat(className, "\"><a href=\"#").concat(id, "\">").concat(text, "</a></li>");
  });
  tocHTML += "</ul></nav>"; // Insert TOC as sibling to wiki-article, not inside it

  var wikiMain = document.querySelector(".wiki-main");
  var wikiArticle = document.querySelector(".wiki-article");

  if (wikiMain && wikiArticle) {
    // Insert TOC after the wiki-article element
    wikiArticle.insertAdjacentHTML("afterend", tocHTML); // Add smooth scroll behavior to TOC links

    document.querySelectorAll(".table-of-contents a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var targetId = link.getAttribute("href").substring(1);
        var targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
          }); // Update URL hash

          window.history.replaceState(null, null, "".concat(window.location.pathname).concat(window.location.hash.split("#")[0] || "", "#").concat(targetId));
        }
      });
    }); // Add toggle functionality (desktop only)

    var tocToggle = document.querySelector(".toc-toggle");
    var tocElement = document.querySelector(".table-of-contents");

    if (tocToggle && tocElement && wikiMain) {
      // Check for saved state in localStorage
      var tocCollapsed = localStorage.getItem("toc-collapsed") === "true";

      if (tocCollapsed) {
        tocElement.classList.add("collapsed");
        wikiMain.classList.add("toc-collapsed");
      }

      tocToggle.addEventListener("click", function () {
        tocElement.classList.toggle("collapsed");
        wikiMain.classList.toggle("toc-collapsed"); // Save state to localStorage

        localStorage.setItem("toc-collapsed", tocElement.classList.contains("collapsed"));
      });
    }
  }
}

function handleURLParams() {
  var hash = window.location.hash.substring(1);

  if (hash) {
    loadArticle(hash);
  }
}

window.addEventListener("popstate", function (e) {
  if (e.state && e.state.slug) {
    loadArticle(e.state.slug);
  } else {
    location.reload();
  }
});

function setupSearchFunctionality() {
  var searchInput = document.getElementById("wikiSearch");
  var searchResults = document.getElementById("searchResults");
  var clearBtn = document.getElementById("clearSearch");
  if (!searchInput || !searchResults) return;
  var searchTimeout;
  searchInput.addEventListener("input", function (e) {
    clearTimeout(searchTimeout);
    var query = e.target.value.trim();

    if (query.length === 0) {
      searchResults.style.display = "none";
      clearBtn.style.display = "none";
      return;
    }

    clearBtn.style.display = "block";
    searchTimeout = setTimeout(function () {
      performSearch(query);
    }, 300);
  });
  clearBtn.addEventListener("click", function () {
    searchInput.value = "";
    searchResults.style.display = "none";
    clearBtn.style.display = "none";
    searchInput.focus();
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-container")) {
      searchResults.style.display = "none";
    }
  });
}

function performSearch(query) {
  var searchResults, lowerQuery, indexResults, contentResults, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, article, response, markdown, _parseFrontmatter2, content, lowerContent, index, start, end, context, allResults, categoryNames;

  return regeneratorRuntime.async(function performSearch$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          searchResults = document.getElementById("searchResults");
          lowerQuery = query.toLowerCase();
          indexResults = wikiIndex.filter(function (article) {
            return article.title.toLowerCase().includes(lowerQuery) || article.description.toLowerCase().includes(lowerQuery) || article.tags && article.tags.some(function (tag) {
              return tag.toLowerCase().includes(lowerQuery);
            });
          });
          contentResults = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context5.prev = 7;
          _iterator = wikiIndex.slice(0, 20)[Symbol.iterator]();

        case 9:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context5.next = 28;
            break;
          }

          article = _step.value;
          _context5.prev = 11;
          _context5.next = 14;
          return regeneratorRuntime.awrap(fetch("/wiki/".concat(article.category, "/").concat(article.file)));

        case 14:
          response = _context5.sent;
          _context5.next = 17;
          return regeneratorRuntime.awrap(response.text());

        case 17:
          markdown = _context5.sent;
          _parseFrontmatter2 = parseFrontmatter(markdown), content = _parseFrontmatter2.content;

          if (content.toLowerCase().includes(lowerQuery)) {
            lowerContent = content.toLowerCase();
            index = lowerContent.indexOf(lowerQuery);
            start = Math.max(0, index - 100);
            end = Math.min(content.length, index + 100);
            context = content.substring(start, end).replace(/<[^>]*>/g, "");
            contentResults.push(_objectSpread({}, article, {
              context: context
            }));
          }

          _context5.next = 25;
          break;

        case 22:
          _context5.prev = 22;
          _context5.t0 = _context5["catch"](11);
          return _context5.abrupt("continue", 25);

        case 25:
          _iteratorNormalCompletion = true;
          _context5.next = 9;
          break;

        case 28:
          _context5.next = 34;
          break;

        case 30:
          _context5.prev = 30;
          _context5.t1 = _context5["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context5.t1;

        case 34:
          _context5.prev = 34;
          _context5.prev = 35;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 37:
          _context5.prev = 37;

          if (!_didIteratorError) {
            _context5.next = 40;
            break;
          }

          throw _iteratorError;

        case 40:
          return _context5.finish(37);

        case 41:
          return _context5.finish(34);

        case 42:
          allResults = _toConsumableArray(indexResults);
          contentResults.forEach(function (cr) {
            if (!allResults.find(function (r) {
              return r.slug === cr.slug;
            })) {
              allResults.push(cr);
            }
          });

          if (!(allResults.length === 0)) {
            _context5.next = 48;
            break;
          }

          searchResults.innerHTML = '<div class="no-results">Keine Ergebnisse gefunden</div>';
          searchResults.style.display = "block";
          return _context5.abrupt("return");

        case 48:
          categoryNames = {
            "getting-started": "Erste Schritte",
            setup: "Setup & Konfiguration",
            intrarp: "intraRP",
            intratab: "intraTab",
            advanced: "Weitere Themen"
          };
          searchResults.innerHTML = allResults.slice(0, 10).map(function (article) {
            return "\n    <div class=\"search-result-item\" onclick=\"loadArticle('".concat(article.slug, "'); document.getElementById('searchResults').style.display='none';\">\n      <h4>").concat(highlightText(article.title, query), "</h4>\n      <p>").concat(highlightText(article.context || article.description, query), "</p>\n      <span class=\"category-badge\">").concat(categoryNames[article.category], "</span>\n    </div>\n  ");
          }).join("");
          searchResults.style.display = "block";

        case 51:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[7, 30, 34, 42], [11, 22], [35,, 37, 41]]);
}

function highlightText(text, query) {
  if (!text) return "";
  var regex = new RegExp("(".concat(escapeRegex(query), ")"), "gi");
  return text.replace(regex, '<strong style="color: var(--primary-color);">$1</strong>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function showError(message) {
  var articleElement = document.getElementById("wikiArticle");
  articleElement.innerHTML = "\n    <div style=\"text-align: center; padding: 4rem 2rem;\">\n      <i class=\"las la-exclamation-circle\" style=\"font-size: 4rem; color: var(--primary-color); opacity: 0.5;\"></i>\n      <h2>".concat(message, "</h2>\n      <p style=\"color: #666;\">Bitte versuche es erneut oder w\xE4hle einen anderen Artikel.</p>\n      <button onclick=\"location.reload()\" style=\"margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;\">\n        Seite neu laden\n      </button>\n    </div>\n  ");
}

if (typeof marked !== "undefined") {
  // Helper function to escape HTML entities
  var escapeHtml = function escapeHtml(text) {
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }; // Custom renderer for code blocks


  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
  });
  var renderer = {
    code: function code(token) {
      var lang = token.lang || "plaintext";
      var code = escapeHtml(token.text);
      return "<pre><code class=\"language-".concat(lang, "\">").concat(code, "</code></pre>");
    }
  };
  marked.use({
    renderer: renderer
  });
}