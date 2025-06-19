require("dotenv").config();
const GitHubVersionUpdater = require("./version-updater");

class SimpleVersionApp {
  constructor() {
    this.config = {
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
      outputPath: process.env.OUTPUT_PATH || "./httpdocs/version.json",
      updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 10 * 60 * 1000,
    };

    this.updater = new GitHubVersionUpdater(this.config);
    this.updateTimer = null;

    this.log("🚀 Simple Version App starting...");
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async performUpdate() {
    try {
      this.log("🔄 Performing scheduled update check...");
      const result = await this.updater.updateVersion();

      if (result.updated) {
        this.log(`🎉 NEW VERSION: ${result.version}`);
      } else if (result.error) {
        this.log(`❌ Update failed: ${result.error}`);
      } else {
        this.log(`✅ No update needed`);
      }

      return result;
    } catch (error) {
      this.log(`❌ Update check failed: ${error.message}`);
      return { updated: false, error: error.message };
    }
  }

  startUpdateTimer() {
    this.log(
      `⏰ Starting update timer (every ${this.config.updateInterval / 1000}s)`
    );

    // Run immediately
    this.performUpdate();

    // Then repeat
    this.updateTimer = setInterval(() => {
      this.performUpdate();
    }, this.config.updateInterval);
  }

  start() {
    this.log("🚀 Starting Simple Version App...");

    if (!this.config.repo) {
      throw new Error("GITHUB_REPO required");
    }

    this.startUpdateTimer();
    this.log("✅ Application started - no HTTP server needed!");

    // Keep alive
    setInterval(() => {
      this.log(`💓 Still running - uptime: ${Math.floor(process.uptime())}s`);
    }, 5 * 60 * 1000);
  }
}

// Start the app
const app = new SimpleVersionApp();

process.on("SIGINT", () => {
  console.log("\n⏹️ Shutting down...");
  process.exit(0);
});

try {
  app.start();
} catch (error) {
  console.error("💥 Startup failed:", error.message);
  process.exit(1);
}
