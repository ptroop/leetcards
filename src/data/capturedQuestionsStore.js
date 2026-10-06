const DATABASE_NAME = 'leetcards-local';
const DATABASE_VERSION = 1;
const STORE_NAME = 'captured-questions';

const openDatabase = () => new Promise((resolve, reject) => {
  if (!globalThis.indexedDB) {
    reject(new Error('Local browser storage is unavailable'));
    return;
  }

  const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onerror = () => reject(request.error ?? new Error('Could not open local storage'));
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'slug' });
    }
  };
  request.onsuccess = () => resolve(request.result);
});

const withStore = async (mode, run) => {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = run(store);
      let result;
      request.onsuccess = () => {
        result = request.result;
      };
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(
        transaction.error ?? request.error ?? new Error('Local storage request failed'),
      );
      transaction.onabort = () => reject(
        transaction.error ?? new Error('Local storage transaction was cancelled'),
      );
    });
  } finally {
    database.close();
  }
};

export const loadCapturedQuestions = async () => {
  const records = await withStore('readonly', (store) => store.getAll());
  return records.sort((left, right) => {
    const leftTime = typeof left.capturedAt === 'string' ? left.capturedAt : '';
    const rightTime = typeof right.capturedAt === 'string' ? right.capturedAt : '';
    if (leftTime !== rightTime) return rightTime.localeCompare(leftTime);
    return left.title.localeCompare(right.title);
  });
};

export const saveCapturedQuestion = async (record) => {
  await withStore('readwrite', (store) => store.put(record));
  return record;
};

export const saveCapturedQuestions = async (records) => {
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      for (const record of records) store.put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(
        transaction.error ?? new Error('Could not save the profile import'),
      );
      transaction.onabort = () => reject(
        transaction.error ?? new Error('Profile import storage was cancelled'),
      );
    });
  } finally {
    database.close();
  }
  return records;
};
