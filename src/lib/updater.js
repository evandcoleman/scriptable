export default class Updater {
  constructor({ repo }) {
    this.repo = repo;
    this.fm = FileManager.iCloud();
  }

  async checkForUpdate(name, currentVersion) {
    const latestVersion = await this.getLatestVersion(name);

    if (latestVersion !== currentVersion) {

    }
  }

  async getLatestVersion(name) {
    const url = `https://api.github.com/repos/${sourceRepo}/commits?per_page=1&path=scripts/${name}`;
    const data = await fetchJson(`${name.split('.')[0]}_updater`, url, null, 10);

    if (!data || data.length === 0) {
      return null;
    }

    return data[0].sha;
  }

  async updateScript(name) {
    const url = `https://api.github.com/repos/${sourceRepo}/contents/scripts/${name}`;
    const req = new Request(url);
    const { content } = await req.loadJSON();

    const path = this.fm.joinPath(this.fm.documentsDirectory(), 'MLB_test.js');

    this.fm.writeString(path, atob(content));
  }
}