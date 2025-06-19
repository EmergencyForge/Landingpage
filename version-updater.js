const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");

class GitHubVersionUpdater {
  constructor(config) {
    this.repo = config.repo;
    this.token = config.token;
    this.outputPath = config.outputPath || "./httpdocs/version.json";
    this.apiUrl = `https://api.github.com/repos/${this.repo}/releases/latest`;
    this.isUpdating = false;

    console.log(`🚀 Version updater initialized for ${this.repo}`);
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async getCurrentVersion() {
    try {
      const data = await fs.readFile(this.outputPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      this.log("📄 No existing version file found");
      return null;
    }
  }

  async fetchGitHubVersion() {
    this.log("🌐 Checking GitHub for new version...");

    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "intraRP-PersistentUpdater/1.0",
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(this.apiUrl, {
        headers,
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      // Rate Limit Info
      const remaining = response.headers.get("x-ratelimit-remaining");
      const limit = response.headers.get("x-ratelimit-limit");
      this.log(`📊 Rate limit: ${remaining}/${limit} remaining`);

      return data;
    } catch (error) {
      this.log(`❌ GitHub API error: ${error.message}`);
      throw error;
    }
  }

  async saveVersionFile(releaseData) {
    const versionData = {
      version: releaseData.tag_name,
      name: releaseData.name || releaseData.tag_name,
      publishedAt: releaseData.published_at,
      downloadUrl: releaseData.html_url,
      zipballUrl: releaseData.zipball_url,
      tarballUrl: releaseData.tarball_url,
      body: releaseData.body || "",
      prerelease: releaseData.prerelease,
      lastUpdated: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    try {
      // Verzeichnis erstellen falls nicht vorhanden
      const dir = path.dirname(this.outputPath);
      await fs.mkdir(dir, { recursive: true });

      // JSON-Datei schreiben
      await fs.writeFile(this.outputPath, JSON.stringify(versionData, null, 2));

      this.log(`💾 Version file updated: ${versionData.version}`);
      return versionData;
    } catch (error) {
      this.log(`❌ Failed to save version file: ${error.message}`);
      throw error;
    }
  }

  async updateVersion() {
    if (this.isUpdating) {
      this.log("⏳ Update already in progress, skipping...");
      return { updated: false, reason: "already_updating" };
    }

    this.isUpdating = true;

    try {
      const currentVersion = await this.getCurrentVersion();
      const githubRelease = await this.fetchGitHubVersion();

      // Versionsvergleich
      if (currentVersion && currentVersion.version === githubRelease.tag_name) {
        this.log(`✅ Version unchanged: ${currentVersion.version}`);

        // Nur nextCheck aktualisieren
        currentVersion.nextCheck = new Date(
          Date.now() + 10 * 60 * 1000
        ).toISOString();
        currentVersion.lastChecked = new Date().toISOString();

        await fs.writeFile(
          this.outputPath,
          JSON.stringify(currentVersion, null, 2)
        );

        return { updated: false, version: currentVersion.version };
      }

      // Neue Version gefunden!
      this.log(`🎉 New version found: ${githubRelease.tag_name}`);
      const savedData = await this.saveVersionFile(githubRelease);

      return { updated: true, version: savedData.version, data: savedData };
    } catch (error) {
      this.log(`❌ Update failed: ${error.message}`);
      return { updated: false, error: error.message };
    } finally {
      this.isUpdating = false;
    }
  }

  // Heartbeat für Monitoring
  getStatus() {
    return {
      repo: this.repo,
      isUpdating: this.isUpdating,
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    };
  }
}

module.exports = GitHubVersionUpdater;
