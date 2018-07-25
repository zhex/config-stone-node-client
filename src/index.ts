import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

export interface IProfileConfig {
	version: number;
	appKey: string;
	profileKey: string;
	config: any;
}

export default class Client extends EventEmitter {
	private api: AxiosInstance;

	constructor(provider: string) {
		super();
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

	public watch(appKey: string, profileKey: string): Client {
		this.getProfile(appKey, profileKey).then(data => {
			this.emit('change', data);
			this.poll(appKey, profileKey, data.version);
		});
		return this;
	}

	private async poll(appKey: string, profileKey: string, version: number) {
		const data = await this.api
			.get<IProfileConfig>(`/${appKey}/${profileKey}?ver=${version}`)
			.then(result => result.data);
		if (data && data.version > version) {
			version = data.version;
			this.emit('change', data);
		}
		await this.poll(appKey, profileKey, version);
	}
}
