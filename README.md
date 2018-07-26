# config-stone-node-client

get a profile from the config server

```js
const Client = require('./dist/index').default;

const client = new Client('http://localhost:3000');
client.getProfile('crypto-sentinel', 'default').then(console.log);
```

watch the config change

```js
const Client = require('./dist/index').default;

const client = new Client('http://localhost:3000');
const watcher = client.watch('crypto-sentinel', 'default');

watcher.on('start', data => {
	console.log(data);
});

watcher.on('change', data => {
	console.log(data);
});

watcher.on('close', () => {
	console.log('watch closed');
});
```

### TODO

- [] profile on 'delete' handle