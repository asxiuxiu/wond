export class FontCacheManager {
  dbName = 'FontCache';
  dbVersion = 1;
  storeName = 'fonts';
  db = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        
      };

      request.onsuccess = (event) => {};
    });
  }
}
