const Dreadlock = require('./index');

const exhaustPromiseQueue = async () => {
  for (let i = 0; i < 1000; i++) {
    await Promise.resolve();
  }
};

it('basic lock should work', async () => {
  jest.useFakeTimers();

  const dread = new Dreadlock();
  const keySet1 = ['key1', 'key2', 'key3'];
  const keySet2 = ['key1', 'key4', 'key5'];

  const spy1 = jest.fn();
  const spy2 = jest.fn();

  dread.lock(keySet1)
    .then(spy1);

  dread.lock(keySet2)
    .then(spy2);

  jest.advanceTimersByTime(10000);
  await exhaustPromiseQueue();

  expect(spy1).toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();

  dread.release(['key2']);

  jest.advanceTimersByTime(10000);
  await exhaustPromiseQueue();

  expect(spy2).not.toHaveBeenCalled();

  dread.release(['key1']);

  jest.advanceTimersByTime(10000);
  await exhaustPromiseQueue();

  expect(spy2).toHaveBeenCalled();
});

it('timeout waiting for lock', async () => {
  jest.useFakeTimers();

  const dread = new Dreadlock({ defaultLockTimeout: 60000 });
  const keySet1 = ['key1', 'key2', 'key3'];
  const keySet2 = ['key1', 'key4', 'key5'];

  const spy1 = jest.fn();
  const spy2 = jest.fn();

  dread.lock(keySet1)
    .then(spy1);

  dread.lock(keySet2)
    .then(spy2, spy2);

  jest.advanceTimersByTime(65000);
  await exhaustPromiseQueue();

  expect(spy1).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalledWith(new Error('timeout waiting for lock'));
});

it('resume after timeout', async () => {
  jest.useFakeTimers();

  const dread = new Dreadlock({ defaultLockTimeout: 60000 });
  const keySet1 = ['key1', 'key2', 'key3'];
  const keySet2 = ['key1', 'key4', 'key5'];
  const keySet3 = ['key1'];

  const spy1 = jest.fn();
  const spy2 = jest.fn();
  const spy3 = jest.fn();

  dread.lock(keySet1)
    .then(spy1);

  dread.lock(keySet2)
    .then(spy2, spy2);

  jest.advanceTimersByTime(65000);
  await exhaustPromiseQueue();

  expect(spy1).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalledWith(new Error('timeout waiting for lock'));
  expect(spy3).not.toHaveBeenCalled();

  dread.lock(keySet3)
    .then(spy3);

  jest.advanceTimersByTime(10000);
  await exhaustPromiseQueue();

  expect(spy3).not.toHaveBeenCalled();

  dread.release(keySet1);
  jest.advanceTimersByTime(65000);
  await exhaustPromiseQueue();

  expect(spy1.mock.calls.length).toBe(1);
  expect(spy3).toHaveBeenCalled();
});
