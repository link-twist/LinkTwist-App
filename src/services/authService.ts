import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { jwtDecode } from "jwt-decode";

export const AuthService = {
	async isLoggedIn() {
		const token = await this.getToken();
    return !!token;
  },

  async setToken(token: string) {
    await SecureStoragePlugin.set({ key: 'auth_token', value: token });
  },

	async setFakeToken() {
		// This is a JWT token with an expired 'exp' claim (exp: 1609459200, Jan 1, 2021)
		const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDk0NTkyMDB9.4Xy7kQwQw8wQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw';
		await SecureStoragePlugin.set({ key: 'auth_token', value: expiredToken });
	},

  async setApiURL(domain: string) {
    const apiURL = `https://${domain}.api.link-twist.com`;
    await SecureStoragePlugin.set({ key: 'apiURL', value: apiURL });
  },

	async setCredentials(credentials: {domain: string, username: string, password: string}) {
		await SecureStoragePlugin.set({ key: 'domain', value: credentials.domain });
		await SecureStoragePlugin.set({ key: 'username', value: credentials.username });
		await SecureStoragePlugin.set({ key: 'password', value: credentials.password });
	},
  
	async getApiURL() {
		try {
			const { value } = await SecureStoragePlugin.get({ key: 'apiURL' });
			return value;
		} catch (err) {
			console.error('Error accessing apiURL:', err);
			return null;
		}
	},
  
	async getToken() {
		try {
			const { value } = await SecureStoragePlugin.get({ key: 'auth_token' });
			return value;
		} catch (err) {
			console.error('Error accessing token:', err);
			return null;
		}
	},

  async getUser() {
    const token = await this.getToken();
    if (!token) return null;
    return jwtDecode(token);
  },

  async getCredentials() {
    try {
			const { value: domain } = await SecureStoragePlugin.get({ key: 'domain' });
			const { value: username } = await SecureStoragePlugin.get({ key: 'username' });
			const { value: password } = await SecureStoragePlugin.get({ key: 'password' });
			const credentials = {
				domain: domain,
				username: username,
				password: password
			}
			return credentials;
		} catch (err) {
			console.error('Error accessing credentials:', err);
			return null;
		}
  },

  async logout() {
    await SecureStoragePlugin.remove({ key: 'auth_token' });
    await SecureStoragePlugin.remove({ key: 'apiURL' });
  }
};
