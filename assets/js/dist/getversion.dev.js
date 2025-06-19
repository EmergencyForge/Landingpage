"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GitHubVersionManager =
/*#__PURE__*/
function () {
  function GitHubVersionManager(repo) {
    var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, GitHubVersionManager);

    this.repo = repo;
    this.token = token;
    this.apiUrl = "https://api.github.com/repos/".concat(repo, "/releases/latest");
    this.cacheKey = "github_version_".concat(repo.replace("/", "_"));
    this.cacheDuration = 30 * 60 * 1000; // 30 Minuten
  }

  _createClass(GitHubVersionManager, [{
    key: "getCachedData",
    value: function getCachedData() {
      try {
        var cached = localStorage.getItem(this.cacheKey);
        if (!cached) return null;

        var _JSON$parse = JSON.parse(cached),
            data = _JSON$parse.data,
            timestamp = _JSON$parse.timestamp; // Cache noch gültig?


        if (Date.now() - timestamp < this.cacheDuration) {
          console.log("Using localStorage cache");
          return data;
        } // Cache abgelaufen


        localStorage.removeItem(this.cacheKey);
        return null;
      } catch (error) {
        console.warn("localStorage error:", error);
        return null;
      }
    }
  }, {
    key: "setCachedData",
    value: function setCachedData(data) {
      try {
        localStorage.setItem(this.cacheKey, JSON.stringify({
          data: data,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn("localStorage write error:", error);
      }
    }
  }, {
    key: "fetchLatestRelease",
    value: function fetchLatestRelease() {
      var cached, headers, response, data;
      return regeneratorRuntime.async(function fetchLatestRelease$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              cached = this.getCachedData();

              if (!cached) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", cached);

            case 3:
              console.log("Making GitHub API request...");
              _context.prev = 4;
              headers = {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "intraRP-Website/1.0"
              };

              if (this.token) {
                headers["Authorization"] = "Bearer ".concat(this.token);
              }

              _context.next = 9;
              return regeneratorRuntime.awrap(fetch(this.apiUrl, {
                headers: headers
              }));

            case 9:
              response = _context.sent;

              if (response.ok) {
                _context.next = 12;
                break;
              }

              throw new Error("GitHub API error: ".concat(response.status));

            case 12:
              _context.next = 14;
              return regeneratorRuntime.awrap(response.json());

            case 14:
              data = _context.sent;
              this.setCachedData(data);
              return _context.abrupt("return", data);

            case 19:
              _context.prev = 19;
              _context.t0 = _context["catch"](4);
              console.error("GitHub API Error:", _context.t0);
              throw _context.t0;

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[4, 19]]);
    }
  }, {
    key: "updateVersionDisplay",
    value: function updateVersionDisplay(elementId) {
      var element, release, releaseDate;
      return regeneratorRuntime.async(function updateVersionDisplay$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              element = document.getElementById(elementId);

              if (element) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return");

            case 3:
              element.classList.add("loading");
              element.innerHTML = " Lade...";
              _context2.prev = 5;
              _context2.next = 8;
              return regeneratorRuntime.awrap(this.fetchLatestRelease());

            case 8:
              release = _context2.sent;

              if (!release) {
                _context2.next = 17;
                break;
              }

              element.classList.remove("loading", "error");
              element.innerHTML = " ".concat(release.tag_name);
              element.href = release.html_url;
              element.title = "Ver\xF6ffentlicht: ".concat(new Date(release.published_at).toLocaleDateString("de-DE"));
              releaseDate = new Date(release.published_at);
              _context2.next = 18;
              break;

            case 17:
              throw new Error("No release data available");

            case 18:
              _context2.next = 26;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t0 = _context2["catch"](5);
              element.classList.remove("loading");
              element.classList.add("error");
              element.innerHTML = " Error";
              element.href = "https://github.com/".concat(this.repo, "/releases");

            case 26:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[5, 20]]);
    }
  }]);

  return GitHubVersionManager;
}(); // Usage


var versionManager = new GitHubVersionManager("intraRP/intraRP", "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");
document.addEventListener("DOMContentLoaded", function () {
  versionManager.updateVersionDisplay("versionDisplay");
});
setInterval(function () {
  versionManager.updateVersionDisplay("versionDisplay");
}, 30 * 60 * 1000);