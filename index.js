class Dread_lock{
  constructor () {
    this._lock = new Map();
    this._queue = [];
    this._processing = false;
  }
  lock (items) {
    let dread = this;
    let p = new Promise((resolve, reject) => {
      dread._queue.push({
        items,
        resolve,
        reject
      });
    });
    // console.log('PUSH', items);
    if (Boolean(dread.timeout) === false) {
      console.log('timeout not found, creating');
      dread.index = 0;
      dread.timeout = setInterval(() => {
        // console.log('timeout called');
        // console.log(dread.index, dread._queue.length, dread.index >= dread._queue.length);
        if (dread.index >= dread._queue.length) {
          console.log('invalid dread.index, back to zero');
          dread.index = 0;
        }
        // console.log('checking', dread.index);
        let selected = dread._queue[dread.index];
        let { items, resolve, reject } = selected;
        // console.log('current items', items);
        // console.log('current resolve', resolve);
        // console.log('current reject', reject);
        if (items.every((item) => dread._lock.has(item) === false) === true) {
          console.log('locking', items);
          items.map((item) => dread._lock.set(item));
          // console.log('lock is now', dread._lock);
          resolve();
          // console.log('removing from queue', items);
          dread._queue.splice(dread.index, 1);
          // console.log('queue is now', dread._queue);
          // console.log('queue length is now', dread._queue.length);
          if (dread._queue.length > 0) {
            // console.log('queue still not empty, back to zero');
            dread.index = 0;
          } else {
            console.log('queue now empty, clearing timeout');
            clearInterval(dread.timeout)
          }
        } else {
          console.log('conflict found, cant lock', items, 'see', Array.from(dread._lock.keys()));
          if (dread._queue.length > 0) {
            console.log('from', dread.index);
            dread.index = dread.index + 1;
            console.log('moving to next item', dread.index);
          }
        }

      }, 100);
    }
    return p;
  }
  release (items) {
    let dread = this;
    console.log('releasing items', items);
    let p = new Promise((resolve, reject) => {
      items.map((item) => dread._lock.delete(item));
      console.log('reverting index to zero upon release');
      dread.index = 0;
      resolve();
    });
    return p;
  }
}

const Dread = new Dread_lock();
const items3= ['a', 'b', 'c'];
const items4 = ['a', 'b'];
const items5 = ['b'];
const items6 = ['c'];
const items7 = ['d'];
Promise.resolve()
  .then(() => {
    // console.log('locking items', items1);
    setTimeout(() => {
      Dread.release(items3);
    }, 1000);
    setTimeout(() => {
      Dread.release(items4);
    }, 2000);
    return Promise.all([
      Dread.lock(items3),
      Dread.lock(items4),
      Dread.lock(items5),
      Dread.lock(items6),
      Dread.lock(items7)
    ]);
  })
  .then(() => {
    console.log('DONE');
  })
  .catch((e) => {
    console.log(e);
    console.log(Dread);
  });

module.exports = Dread_lock;
