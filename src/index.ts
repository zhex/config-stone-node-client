import axios, { AxiosInstance } from 'axios';

export interface ProfileConfig {

}

export default class Client {
    private api: AxiosInstance;

    constructor(provider: string) {
        this.api = axios.create({
            baseURL: provider + '/api',
        });
    }

    public getProfile(appKey: string, profileKey: string): Promise<any> {
        return this.api.get(`/${appKey}/${profileKey}`).then(result => result.data);
    }
}