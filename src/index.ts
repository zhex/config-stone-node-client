import axios, { AxiosInstance } from 'axios';
import { Watcher } from './watcher';

export interface IProfileConfig {
	version: number;
	appKey: string;
	profileKey: string;
	config: any;
}

export default class Client {
	private api: AxiosInstance;
	private watchers = new Map<string, Watcher>();

	constructor(provider: string) {
		this.api = axios.create({
			baseURL: provider + '/api',
		});
	}

	public getProfile(
		appKey: string,
		profileKey: string,
	): Promise<IProfileConfig> {
		return this.api
			.get(`/${appKey}/${profileKey}`)
			.then(result => result.data);
	}

	public watch(appKey: string, profileKey: string): Watcher {
		const watcher = new Watcher(`${appKey}/${profileKey}`);
		this.watchers.set(watcher.name, watcher);
		this.getProfile(appKey, profileKey).then(data => {
			watcher.emit('start', data);
			this.poll(appKey, profileKey, data.version);
		});
		return watcher;
	}

	public destroyWatcher(watcher: Watcher) {
		watcher.destroy();
		this.watchers.delete(watcher.name);
	}

	public close() {
		this.watchers.forEach(watcher => {
			this.destroyWatcher(watcher);
		});
	}

	private async poll(appKey: string, profileKey: string, version: number) {
		const watcher = this.watchers.get(`${appKey}/${profileKey}`);
		if (!watcher || watcher.closed) {
			return;
		}

		const source = axios.CancelToken.source();
		try {
			const data = await this.api
				.get<IProfileConfig>(
					`/${appKey}/${profileKey}?ver=${version}`,
					{
						cancelToken: source.token,
					},
				)
				.then(result => result.data);
			if (data && data.version > version) {
				version = data.version;
				watcher.emit('change', data);
			}
			watcher.once('close', () => source.cancel('watcher closed'));
			await this.poll(appKey, profileKey, version);
		} catch (err) {
			if (!axios.isCancel(err)) {
				throw err;
			}
		}
	}
}
