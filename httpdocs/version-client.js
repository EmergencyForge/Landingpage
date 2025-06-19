class VersionDisplay {
  constructor(config) {
    this.apiUrl = config.apiUrl || "./version.json";
    this.cacheTime = config.cacheTime || 5 * 60 * 1000; // 5 Minuten Client-Cache
    this.cache = null;
    this.lastFetch = 0;
  }

  // Version von Server-JSON laden
  async fetchVersion() {
    // Kurzer Client-Cache um Server zu entlasten
    if (this.cache && Date.now() - this.lastFetch < this.cacheTime) {
      console.log("⚡ Using client cache");
      return this.cache;
    }

    try {
      console.log("📄 Fetching version.json from server...");

      // Cache-busting für frische Daten
      const url = `${this.apiUrl}?t=${Date.now()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Client-Cache aktualisieren
      this.cache = data;
      this.lastFetch = Date.now();

      console.log(`✅ Version loaded: ${data.version}`);
      return data;
    } catch (error) {
      console.error("❌ Failed to load version:", error.message);

      // Fallback zu Cache wenn vorhanden
      if (this.cache) {
        console.log("🔄 Using cached version due to error");
        return this.cache;
      }

      throw error;
    }
  }

  // UI aktualisieren
  async updateDisplay(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element "${elementId}" not found`);
      return;
    }

    try {
      const versionData = await this.fetchVersion();

      // Version anzeigen
      element.textContent = versionData.version;
      element.href = versionData.downloadUrl;

      // Tooltip mit mehr Infos
      const releaseDate = new Date(versionData.publishedAt).toLocaleDateString(
        "de-DE"
      );
      element.title = `${
        versionData.name || versionData.version
      } (${releaseDate})`;

      // Prerelease Badge
      if (versionData.prerelease) {
        element.textContent += " BETA";
      }

      console.log("✅ Display updated successfully");
    } catch (error) {
      element.textContent = "Error";
      element.href = "#";
      element.title = `Error loading version: ${error.message}`;
      console.error("❌ Display update failed:", error.message);
    }
  }

  // Auto-refresh einrichten
  setupAutoRefresh(elementId, interval = 30000) {
    // 30 Sekunden
    setInterval(() => {
      this.updateDisplay(elementId);
    }, interval);
  }

  // Manueller Refresh (für Refresh-Button)
  async forceRefresh(elementId) {
    this.cache = null; // Cache löschen
    this.lastFetch = 0;
    await this.updateDisplay(elementId);
  }
}

// 🚀 USAGE
const versionDisplay = new VersionDisplay({
  apiUrl: "./version.json", // Pfad zu deiner JSON-Datei
});

// Beim Seitenladen
document.addEventListener("DOMContentLoaded", () => {
  versionDisplay.updateDisplay("versionDisplay");

  // Optional: Auto-refresh alle 30 Sekunden
  versionDisplay.setupAutoRefresh("versionDisplay", 30000);
});

// Optional: Manual refresh function
function refreshVersion() {
  versionDisplay.forceRefresh("versionDisplay");
}
