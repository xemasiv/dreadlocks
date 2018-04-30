class Dreadlock{
  constructor (interval) {
    this._lock = new Map();
    this._queue = [];
    this._processing = false;
    this._interval = (
      Boolean(interval) === true &&
      typeof interval === 'number' &&
      parseInt(interval) > 0
    ) ? interval : 4;
  }
  lock (items) {
    let dread = this;
    let p = new Promise((resolve) => {
      if (items.every((item) => dread._lock.has(item) === false) === true) {
        items.map((item) => dread._lock.set(item));
		resolve();
	  } else {
        dread._queue.push({
          items,
          resolve
        });
	  }
    });
    // console.log('PUSH', items);
    if (Boolean(dread.timeout) === false) {
      // console.log('timeout not found, creating');
      dread.index = 0;
      dread.timeout = setInterval(() => {
        // console.log('timeout called');
        // console.log(dread.index, dread._queue.length, dread.index >= dread._queue.length);
        if (dread.index >= dread._queue.length) {
          // console.log('invalid dread.index, back to zero');
          dread.index = 0;
        }
        // console.log('checking', dread.index);
        let selected = dread._queue[dread.index];
        let { items } = selected;
        // console.log('current items', items);
        if (items.every((item) => dread._lock.has(item) === false) === true) {
          let { resolve } = selected;
          // console.log('current resolve', resolve);
          // console.log('locking', items);
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
            // console.log('queue now empty, clearing timeout');
            clearInterval(dread.timeout);
            delete dread.timeout;
          }
        } else {
          // console.log('conflict found, cant lock', items, 'see', Array.from(dread._lock.keys()));
          if (dread._queue.length > 0) {
            // console.log('from', dread.index);
            dread.index = dread.index + 1;
            // console.log('moving to next item', dread.index);
          }
        }

      }, dread._interval);
    }
    return p;
  }
  release (items) {
    let dread = this;
    // console.log('releasing items', items);
    let p = new Promise((resolve) => {
      items.map((item) => dread._lock.delete(item));
      // console.log('reverting index to zero upon release');
      dread.index = 0;
      resolve();
    });
    return p;
  }
  get size () {
    return this._lock.size;
  }
}
module.exports = Dreadlock;
