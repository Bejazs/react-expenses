export const Paths = {
  document: { uri: 'file://document-directory/' },
  cache: { uri: 'file://cache-directory/' },
};

export class File {
  constructor(path, name) {
    this.uri = path.uri + name;
    this.exists = false;
  }
  async text() { return '[]'; }
  write(content) {}
}

export default {
  Paths,
  File
};
