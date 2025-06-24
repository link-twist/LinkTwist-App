
import { AuthService } from '@/services/authService';
import ProductsAvailability from '@/views/ProductsAvailability.vue';
import { CapacitorHttp } from '@capacitor/core';

const headers = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
  'API-Key': 'D7484184-B71B-4478-A99F-E7B560C4E968'
  // 'API-Key': import.meta.env.VITE_API_KEY
}

const headersWithAuth = {
  ...headers,
  'Authorization': 'Bearer ' + await AuthService.getToken(),
};

export const apiService = {
  async login(request: any) {
    const url = `https://${request.domain}.api.link-twist.com`;
    try {
      const response = await CapacitorHttp.request({
        url: `${url}/login`,
        method: 'POST',
        headers: headersWithAuth,
        data: request
      });
      return response || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async checkIn(request: any) {
    const headersWithAuth = {
      ...headers,
      'Authorization': 'Bearer ' + await AuthService.getToken(),
    };
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/offline/bookings/items/checkin`,
        method: 'PATCH',
        headers: headersWithAuth,
        data: request
      });

      if (response && response.status === 401) {
        // Token expired, handle re-login
        return await this.handleExpiredToken(request, 'checkin');
      }
      return response || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async handleExpiredToken(request: any, fn: string): Promise<any> {
    const user = await AuthService.getCredentials();
    const response = await this.login(user);
    console.log('handleExpiredToken response:', response);

    if (response && response.data.token) {
      await AuthService.setToken(response.data.token);
      if (fn === 'checkin') {
        return await this.checkIn(request); // Await and return the retry
      } else if (fn === 'availability') {
        return await this.getParticipantTypeAvailability(request); // Await and return the retry
      }
      console.log('Token refreshed successfully, retrying function:', fn);
    }
    return;
  },
  async getBooking(booking_code: string) {
    console.log('getBooking', booking_code);
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings/${booking_code}`,
        method: 'GET',
        headers: headers,
      })
      return response.status == 200 ? response.data : [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getBookings(dateFrom: string, dateTo: string) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings?activity_date_time_from=${dateFrom}&activity_date_time_to=${dateTo}`,
        method: 'GET',
        headers: headers,
      })
      if (response.status == 200) {
        return response.data;
      } else {
        alert('Failed to fetch bookings');
        return [];
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getProducts() {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getProduct(product_id: number) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/${product_id}`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getProductOptions(product_id: number) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/${product_id}/options`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getProductOptionAvailability(product_id: number, product_option_id: number, dateFrom: string, dateTo: string, pricing: boolean) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/${product_id}/options/${product_option_id}/availability?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}&pricing=${pricing}`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getParticipantTypeAvailability(request: any) {
    const headersWithAuth = {
      ...headers,
      'Authorization': 'Bearer ' + await AuthService.getToken(),
    };
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/offline/products/${request.product_id}/options/${request.product_option_id}/availability?from=${encodeURIComponent(request.from)}&to=${encodeURIComponent(request.to)}`,
        method: 'GET',
        headers: headersWithAuth,
      })
      if (response && response.status === 401) {
        // Token expired, handle re-login
        return await this.handleExpiredToken(request, 'availability');
      }
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async stopStartSales(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/availability`,
        method: 'PATCH',
        headers: headers,
        data: request,
      })
      return response || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getOption(product_id: number, product_option_id: number) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/${product_id}/options/${product_option_id}`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getOptionExtras(product_id: number, product_option_id: number, date_time: string) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/${product_id}/options/${product_option_id}/extras?datetime=${date_time}`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getExtra(product_id: number, product_option_id: number, extra_alias: string, date_time: string) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/products/${product_id}/options/${product_option_id}/extras/${extra_alias}?datetime=${date_time}`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async startNewBooking(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings/start`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async addItems(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings/items`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async addExtras(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings/extras`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async completeBooking(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings/complete`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async cancelBooking(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/bookings/cancel`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getCategories() {
    try {
      const response = await CapacitorHttp.request({
        url: `${await AuthService.getApiURL()}/categories`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
};
