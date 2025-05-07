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

  async setApiURL(domain: string) {
    const apiURL = `https://${domain}.api.link-twist.com`;
    await SecureStoragePlugin.set({ key: 'apiURL', value: apiURL });
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

  async logout() {
    await SecureStoragePlugin.remove({ key: 'auth_token' });
    await SecureStoragePlugin.remove({ key: 'apiURL' });
  }
};
