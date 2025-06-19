class GitHubVersionManager {
  constructor(repo, token = null) {
    this.repo = repo;
    this.token = token;
    this.apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;
    this.cacheKey = `github_version_${repo.replace("/", "_")}`;
    this.cacheDuration = 30 * 60 * 1000; // 30 Minuten
  }

  getCachedData() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      // Cache noch gültig?
      if (Date.now() - timestamp < this.cacheDuration) {
        console.log("Using localStorage cache");
        return data;
      }

      // Cache abgelaufen
      localStorage.removeItem(this.cacheKey);
      return null;
    } catch (error) {
      console.warn("localStorage error:", error);
      return null;
    }
  }

  setCachedData(data) {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          data: data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("localStorage write error:", error);
    }
  }

  async fetchLatestRelease() {
    const cached = this.getCachedData();
    if (cached) {
      return cached;
    }

    console.log("Making GitHub API request...");

    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "intraRP-Website/1.0",
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(this.apiUrl, { headers });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      this.setCachedData(data);

      return data;
    } catch (error) {
      console.error("GitHub API Error:", error);
      throw error;
    }
  }

  async updateVersionDisplay(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.add("loading");
    element.innerHTML = " Lade...";

    try {
      const release = await this.fetchLatestRelease();

      if (release) {
        element.classList.remove("loading", "error");
        element.innerHTML = ` ${release.tag_name}`;
        element.href = release.html_url;
        element.title = `Veröffentlicht: ${new Date(
          release.published_at
        ).toLocaleDateString("de-DE")}`;

        const releaseDate = new Date(release.published_at);
      } else {
        throw new Error("No release data available");
      }
    } catch (error) {
      element.classList.remove("loading");
      element.classList.add("error");
      element.innerHTML = " Error";
      element.href = `https://github.com/${this.repo}/releases`;
    }
  }
}

// Usage
const versionManager = new GitHubVersionManager(
  "intraRP/intraRP",
  "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"
);

document.addEventListener("DOMContentLoaded", () => {
  versionManager.updateVersionDisplay("versionDisplay");
});

setInterval(() => {
  versionManager.updateVersionDisplay("versionDisplay");
}, 30 * 60 * 1000);
