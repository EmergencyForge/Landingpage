"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VersionDisplay =
/*#__PURE__*/
function () {
  function VersionDisplay(config) {
    _classCallCheck(this, VersionDisplay);

    this.apiUrl = config.apiUrl || "./version.json";
    this.cacheTime = config.cacheTime || 5 * 60 * 1000; // 5 Minuten Client-Cache

    this.cache = null;
    this.lastFetch = 0;
  } // Version von Server-JSON laden


  _createClass(VersionDisplay, [{
    key: "fetchVersion",
    value: function fetchVersion() {
      var url, response, data;
      return regeneratorRuntime.async(function fetchVersion$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(this.cache && Date.now() - this.lastFetch < this.cacheTime)) {
                _context.next = 3;
                break;
              }

              console.log("⚡ Using client cache");
              return _context.abrupt("return", this.cache);

            case 3:
              _context.prev = 3;
              console.log("📄 Fetching version.json from server..."); // Cache-busting für frische Daten

              url = "".concat(this.apiUrl, "?t=").concat(Date.now());
              _context.next = 8;
              return regeneratorRuntime.awrap(fetch(url));

            case 8:
              response = _context.sent;

              if (response.ok) {
                _context.next = 11;
                break;
              }

              throw new Error("HTTP ".concat(response.status));

            case 11:
              _context.next = 13;
              return regeneratorRuntime.awrap(response.json());

            case 13:
              data = _context.sent;
              // Client-Cache aktualisieren
              this.cache = data;
              this.lastFetch = Date.now();
              console.log("\u2705 Version loaded: ".concat(data.version));
              return _context.abrupt("return", data);

            case 20:
              _context.prev = 20;
              _context.t0 = _context["catch"](3);
              console.error("❌ Failed to load version:", _context.t0.message); // Fallback zu Cache wenn vorhanden

              if (!this.cache) {
                _context.next = 26;
                break;
              }

              console.log("🔄 Using cached version due to error");
              return _context.abrupt("return", this.cache);

            case 26:
              throw _context.t0;

            case 27:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[3, 20]]);
    } // UI aktualisieren

  }, {
    key: "updateDisplay",
    value: function updateDisplay(elementId) {
      var element, versionData, releaseDate;
      return regeneratorRuntime.async(function updateDisplay$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              element = document.getElementById(elementId);

              if (element) {
                _context2.next = 4;
                break;
              }

              console.error("Element \"".concat(elementId, "\" not found"));
              return _context2.abrupt("return");

            case 4:
              _context2.prev = 4;
              _context2.next = 7;
              return regeneratorRuntime.awrap(this.fetchVersion());

            case 7:
              versionData = _context2.sent;
              // Version anzeigen
              element.textContent = versionData.version;
              element.href = versionData.downloadUrl; // Tooltip mit mehr Infos

              releaseDate = new Date(versionData.publishedAt).toLocaleDateString("de-DE");
              element.title = "".concat(versionData.name || versionData.version, " (").concat(releaseDate, ")"); // Prerelease Badge

              if (versionData.prerelease) {
                element.textContent += " BETA";
              }

              console.log("✅ Display updated successfully");
              _context2.next = 22;
              break;

            case 16:
              _context2.prev = 16;
              _context2.t0 = _context2["catch"](4);
              element.textContent = "Error";
              element.href = "#";
              element.title = "Error loading version: ".concat(_context2.t0.message);
              console.error("❌ Display update failed:", _context2.t0.message);

            case 22:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[4, 16]]);
    } // Auto-refresh einrichten

  }, {
    key: "setupAutoRefresh",
    value: function setupAutoRefresh(elementId) {
      var _this = this;

      var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30000;
      // 30 Sekunden
      setInterval(function () {
        _this.updateDisplay(elementId);
      }, interval);
    } // Manueller Refresh (für Refresh-Button)

  }, {
    key: "forceRefresh",
    value: function forceRefresh(elementId) {
      return regeneratorRuntime.async(function forceRefresh$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              this.cache = null; // Cache löschen

              this.lastFetch = 0;
              _context3.next = 4;
              return regeneratorRuntime.awrap(this.updateDisplay(elementId));

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);

  return VersionDisplay;
}(); // 🚀 USAGE


var versionDisplay = new VersionDisplay({
  apiUrl: "./version.json" // Pfad zu deiner JSON-Datei

}); // Beim Seitenladen

document.addEventListener("DOMContentLoaded", function () {
  versionDisplay.updateDisplay("versionDisplay"); // Optional: Auto-refresh alle 30 Sekunden

  versionDisplay.setupAutoRefresh("versionDisplay", 30000);
}); // Optional: Manual refresh function

function refreshVersion() {
  versionDisplay.forceRefresh("versionDisplay");
}