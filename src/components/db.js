
/*
  author: Youthink
  datetime: 2018.07.07 05:14
  reference: https://gist.github.com/nacanori/d50e40170d54b8a0f8a3f4fdd466eee4
*/

class db {
  constructor(dbName, dbVersion, stores) {
    this.db = {};
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.stores = stores;
  }

  open(callback = (() => {})) {
    if (!window.indexedDB) {
      callback({ message: 'Unsupported indexedDB'});
    }
    let request = window.indexedDB.open(this.dbName, this.dbVersion);
    request.onsuccess = e => {
      this.db = request.result;
    };
    request.onerror = e => callback(e.target.error);
    request.onupgradeneeded = e => {
      this.db = e.target.result;
      this.db.onabor = e2 => callback(e2.target.error);
      this.db.error = e2 => callback(e2.target.error);
      const upgradeTransaction = e.target.transaction;
      let objectStore;
      this.stores.forEach((o) => {
        if (!this.db.objectStoreNames.contains(o.name)) {
          objectStore = this.db.createObjectStore(o.name, o.option);
        } else {
          objectStore = upgradeTransaction.objectStore(o.name, o.option);
        }
        if(o.index && o.index.length > 0) {
          o.index.map(option => {
            const Obj = {};
            const item = option.item;
            Obj[item] = option.value;
            if (!objectStore.indexNames.contains(option.name)) {
              objectStore.createIndex(option.name, option.name, Obj);
            }
            return window.console.log('索引创建成功');
          });
        }
      });
    };
  }

  add(storeName, data, callback=(()=>{})) {
    if (this.db && data) {
      let transaction = this.db.transaction([storeName], 'readwrite');
      transaction.onabort = te => callback(te.target.error);
      transaction.onerror = te => callback(te.target.error);

      let request = transaction.objectStore(storeName).put(data);
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  get(storeName, key, callback=(()=>{})) {
    if (this.db && key) {
      let request = this.db.transaction([storeName]).objectStore().get(key)
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  indexBy(storeName, indexName, key, callback=(()=>{})) {
    if (this.db && key && indexName) {
      let store = this.db.transaction([storeName], 'readonly').objectStore(storeName);
      const search = store.index(indexName);
      const request = search.get(key);
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  getAll(storeName, callback=(()=>{})) {
    if (this.db) {
      let request = this.db.transaction(storeName).objectStore(storeName).openCursor();
      let results = [];
      request.onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          callback(results);
        }
      };
      request.onerror = e => callback(e.target.error);
    }
  }

  remove(storeName, key, callback=(()=>{})) {
    if (this.db) {
      let request = this.db.transaction([storeName], 'readwrite').objectStore(storeName).delete(key);
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

}

export default db;
