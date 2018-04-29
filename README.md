# dreadlocks
Dread-free locks that drive consistency.

### Summary

* Create and use keys to identify objects:
  * `let key1 = hash(anything)`
* Create key sets for keys involved in each task:
  * `const keySet = [key1, key2, key3]`
* Lock these key sets
  * `Dread.lock(keySet).then(task)`
* Release these key sets once you're done.
  * `Dread.release(keySet)`

### Perks

* Respects `FIFO` (first-in-first-out) flow:
  * Iterates on queue item 0 to n then back to 0.
  * Reverts index to 0 on each performed lock.
  * Reverts index to 0 on each performed release.
* Uses `Map` so you can use anything as a key.
  * Although of course, use of `strings` are the most encouraged.
* Uses `setInterval` for periodic checks and processing of queue.
  * `new Dreadlock(interval)` accepts custom `interval` in ms, `4` by default; 1000/4 = `250 checks/s`

### Use Cases:

* Database consistency & transactions.
* Ensuring order in execution of tasks that wish to modify possibly similar objects or entities.

---

### class `Dreadlock`
* constructor (`interval`)
  * `interval` optional Integer, in ms
* lock (`items`)
  * `items` array of keys to lock
  * RETURNS Promise, resolves on lock success
* release (`items`)
  * `items` array of keys to release
  * RETURNS Promise, resolves on release success
* size
  * RETURNS current size of instance `Map`
---

### Usage:

* Install:
```
npm install dreadlocks --save
yarn add dreadlocks
```
```
const Dreadlock = require('dreadlocks');
```

* Create instance:
```
const Dread = new Dreadlock();
```

* Lock your keys anywhere in your code:
```
const keySet1 = ['key1', 'key2', 'key3'];
Dread.lock(keySet1)
  .then(() => {
    console.log('Working with keySet1.');
    // Use your keySet1 keys here
    console.log('Done with keySet1.');
    return Dread.release(keySet1);
  })
  .then(() => {
    console.log('keySet1 released.');
  });
```
```
const keySet2 = ['key1', 'key4', 'key5'];
Dread.lock(keySet2)
  .then(() => {
    console.log('Working with keySet2.');
    // Use your keySet2 keys here
    console.log('Done with keySet2.');
    return Dread.release(keySet2);
  })
  .then(() => {
    console.log('keySet2 released.');
  });
```
* See the magic:
```
Working with keySet1.
Done with keySet1.
keySet1 released.
Working with keySet2.
Done with keySet2.
keySet2 released.
```

---

### LICENSE

![C](https://upload.wikimedia.org/wikipedia/commons/8/84/Public_Domain_Mark_button.svg) ![0](https://upload.wikimedia.org/wikipedia/commons/6/69/CC0_button.svg)
