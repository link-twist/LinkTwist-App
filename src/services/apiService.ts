
import { CapacitorHttp } from '@capacitor/core';

const BASE_URL = import.meta.env.VITE_API_URL;
const headers = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
  'API-Key': import.meta.env.VITE_API_KEY
}

export const apiService = {
  async getBookings(dateFrom: string, dateTo: string) {
    try {
      const response = await CapacitorHttp.request({
        url: `${BASE_URL}/bookings?activity_date_time_from=${dateFrom}&activity_date_time_to=${dateTo}`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getProducts() {
    try {
      const response = await CapacitorHttp.request({
        url: `${BASE_URL}/products`,
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
        url: `${BASE_URL}/products/${product_id}`,
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
        url: `${BASE_URL}/products/${product_id}/options`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getProductOptionAvailability(product_id: number, product_option_id: number, dateFrom: string, dateTo: string) {
    try {
      const response = await CapacitorHttp.request({
        url: `${BASE_URL}/products/${product_id}/options/${product_option_id}/availability?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}&pricing=true`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async getOption(product_id: number, product_option_id: number) {
    try {
      const response = await CapacitorHttp.request({
        url: `${BASE_URL}/products/${product_id}/options/${product_option_id}`,
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
        url: `${BASE_URL}/products/${product_id}/options/${product_option_id}/extras`,
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
        url: `${BASE_URL}/bookings/start`,
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
        url: `${BASE_URL}/bookings/items`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async addExtras(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${BASE_URL}/bookings/extras`,
        method: 'POST',
        headers: headers,
        data: request
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
  async completeBooking(request: any) {
    try {
      const response = await CapacitorHttp.request({
        url: `${BASE_URL}/bookings/complete`,
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
        url: `${BASE_URL}/categories`,
        method: 'GET',
        headers: headers,
      })
      return response.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
    }
  },
};
