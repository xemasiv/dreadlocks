const Dreadlock = require('./index');

const Dread = new Dreadlock();

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
