import Cache from './cache';
import * as http from './http';

export default class Updater {
  constructor(repo) {
    this.repo = repo;
    this.fm = FileManager.iCloud();
    this.cache = new Cache("edcWidgetUpdaterCache", 15);
  }

  async checkForUpdate(name, version) {
    const latestVersion = await this.getLatestVersion(name);

    if (latestVersion > version) {
      console.log(`Version ${latestVersion} is greater than ${version}. Updating...`);
      await this.updateScript(name, latestVersion);

      return true;
    }

    console.log(`Version ${version} is not newer than ${latestVersion}. Skipping update.`);

    return false;
  }

  async getLatestVersion(name) {
    const url = `https://api.github.com/repos/${this.repo}/releases`;
    const data = await http.fetchJson({
      url,
      cache: this.cache,
      cacheKey: name
    });

    if (!data || data.length === 0) {
      return null;
    }

    const matches = data
      .filter(x => x.tag_name.startsWith(`${name}-`) && !x.draft && !x.prerelease)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    if (!matches|| matches.length === 0) {
      return null;
    }

    const release = matches[0];
    const version = release.tag_name.split('-').slice(-1)[0];

    return parseInt(version, 10);
  }

  async updateScript(name, version) {
    const url = `https://raw.githubusercontent.com/${this.repo}/${name}-${version}/dist/${name}.js`;
    const req = new Request(url);
    const content = await req.loadString();

    const path = this.fm.joinPath(this.fm.documentsDirectory(), name + '.js');

    this.fm.writeString(path, content);
  }
}