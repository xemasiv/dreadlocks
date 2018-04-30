const trace = require('debug')('Dreadlocks:trace');
const warn = require('debug')('Dreadlocks:warning');

warn.enabled = true;

class Deadlock {
  constructor({ defaultLockTimeout = Infinity } = {}) {
    this.defaultLockTimeout = defaultLockTimeout;
    this._queue = [];
    this._locks = new Map();
  }
  get size() {
    return this._locks.size;
  }
  release(keys) {
    trace('release keys', keys);
    const changedKeys = keys.reduce((accum, key) => {
      if (!this._locks.has(key)) {
        warn(`${key} was not locked`);
        return accum;
      }
      const currentCount = this._locks.get(key) - 1;
      trace(`${key} released. lock count: ${currentCount}`);
      if (currentCount === 0) {
        trace(`deleted ${key} lock count was 0`);
        this._locks.delete(key);
      } else {
        this._locks.set(key, currentCount);
      }
      accum.set(key, true);
      return accum;
    }, new Map());

    const readyItems = this._queue.filter((queueItem) => {
      const isReady = queueItem.keys.every((key) => {
        const isLocked  = this._locks.has(key)
        const wasReleased = changedKeys.has(key);
        return !isLocked || wasReleased;
      });
      return isReady;
    });

    if (readyItems.length) {
      const readyItem = readyItems.shift();
      trace('queueItem is ready', readyItem.keys);
      this._queue.splice(this._queue.indexOf(readyItem), 1);
      readyItem.ready();
    } else {
      trace('could not process a queueItem from this lock release');
    }
  }
  lock(keys, { lockTimeout = this.defaultLockTimeout } = {}) {
    trace(`lock ${keys}`);
    return new Promise((resolve, reject) => {
      const ready = () => {
        if (lockTimeout !== Infinity) {
          clearTimeout(timeoutId);
        }
        resolve();
      };

      let timeoutId;

      if (lockTimeout !== Infinity) {
        timeoutId = setTimeout(() => {
          trace('Timeout waiting for', keys)
          this._queue = this._queue.filter(queueItem => queueItem.ready !== ready);
          keys.forEach((key) => {
            if (!this._locks.has(key)) {
              return;
            }
            const count = this._locks.get(key) - 1;
            if (count === 0) {
              this._locks.delete(key);
            } else {
              this._locks.set(key, count);
            }
          });
          trace('Decremented lock counts for keys', keys);
          reject(new Error('timeout waiting for lock'));
        }, lockTimeout);
      }

      const isReady = keys.every((key) => {
        const currentCount = this._locks.has(key) ? this._locks.get(key) : 0;
        trace(`Set lock count for ${key} to ${currentCount + 1}`);
        this._locks.set(key, currentCount + 1);
        return currentCount === 0;
      });

      if (isReady) {
        trace('was ready straight away');
        ready();
      } else {
        trace('not ready, queued');
        this._queue.push({ ready, keys });
      }
    });
  }
}

module.exports = Deadlock;
