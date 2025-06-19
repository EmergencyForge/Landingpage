"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

require("dotenv").config();

var GitHubVersionUpdater = require("./version-updater");

var SimpleVersionApp =
/*#__PURE__*/
function () {
  function SimpleVersionApp() {
    _classCallCheck(this, SimpleVersionApp);

    this.config = {
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
      outputPath: process.env.OUTPUT_PATH || "./httpdocs/version.json",
      updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 10 * 60 * 1000
    };
    this.updater = new GitHubVersionUpdater(this.config);
    this.updateTimer = null;
    this.log("🚀 Simple Version App starting...");
  }

  _createClass(SimpleVersionApp, [{
    key: "log",
    value: function log(message) {
      var timestamp = new Date().toISOString();
      console.log("[".concat(timestamp, "] ").concat(message));
    }
  }, {
    key: "performUpdate",
    value: function performUpdate() {
      var result;
      return regeneratorRuntime.async(function performUpdate$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              this.log("🔄 Performing scheduled update check...");
              _context.next = 4;
              return regeneratorRuntime.awrap(this.updater.updateVersion());

            case 4:
              result = _context.sent;

              if (result.updated) {
                this.log("\uD83C\uDF89 NEW VERSION: ".concat(result.version));
              } else if (result.error) {
                this.log("\u274C Update failed: ".concat(result.error));
              } else {
                this.log("\u2705 No update needed");
              }

              return _context.abrupt("return", result);

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](0);
              this.log("\u274C Update check failed: ".concat(_context.t0.message));
              return _context.abrupt("return", {
                updated: false,
                error: _context.t0.message
              });

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[0, 9]]);
    }
  }, {
    key: "startUpdateTimer",
    value: function startUpdateTimer() {
      var _this = this;

      this.log("\u23F0 Starting update timer (every ".concat(this.config.updateInterval / 1000, "s)")); // Run immediately

      this.performUpdate(); // Then repeat

      this.updateTimer = setInterval(function () {
        _this.performUpdate();
      }, this.config.updateInterval);
    }
  }, {
    key: "start",
    value: function start() {
      var _this2 = this;

      this.log("🚀 Starting Simple Version App...");

      if (!this.config.repo) {
        throw new Error("GITHUB_REPO required");
      }

      this.startUpdateTimer();
      this.log("✅ Application started - no HTTP server needed!"); // Keep alive

      setInterval(function () {
        _this2.log("\uD83D\uDC93 Still running - uptime: ".concat(Math.floor(process.uptime()), "s"));
      }, 5 * 60 * 1000);
    }
  }]);

  return SimpleVersionApp;
}(); // Start the app


var app = new SimpleVersionApp();
process.on("SIGINT", function () {
  console.log("\n⏹️ Shutting down...");
  process.exit(0);
});

try {
  app.start();
} catch (error) {
  console.error("💥 Startup failed:", error.message);
  process.exit(1);
}