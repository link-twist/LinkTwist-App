import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: 'api',
  timeout: 10000,
  headers: {
    'accept': 'application/json',
    'API-Key': API_KEY,
    // 'Access-Control-Allow-Origin': '*'
  },
});

// Function to handle API errors
const handleError = (error: any) => {
  console.error('API Error:', error);
  throw error;
};

export const apiService = {
  async getBookings(dateFrom: string, dateTo: string) {
    try {
      const response = await api.get<any>(`/bookings?activity_date_time_from=${dateFrom}&activity_date_time_to=${dateTo}`);
      return response.data || [];
    } catch (error) {
      handleError(error);
    }
  },
  async getProducts() {
    try {
      const response = await api.get<any>('/products');
      return response.data || [];
    } catch (error) {
      handleError(error);
    }
  },
  async getProduct(product_id: number) {
    try {
      const response = await api.get<any>(`/products/${product_id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  async getProductOptions(product_id: number) {
    try {
      const response = await api.get<any>(`/products/${product_id}/options`);
      return response.data || [];
    } catch (error) {
      handleError(error);
    }
  },
  async getProductOptionAvailability(product_id: number, product_option_id: number, dateFrom: string, dateTo: string) {
    try {
      const response = await api.get<any>(`/products/${product_id}/options/${product_option_id}/availability?from=${dateFrom}&to=${dateTo}&pricing=true`);
      return response.data || [];
    } catch (error) {
      handleError(error);
    }
  },
  async getOption(product_id: number, product_option_id: number) {
    try {
      const response = await api.get<any>(`/products/${product_id}/options/${product_option_id}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  async getOptionExtras(product_id: number, product_option_id: number) {
    try {
      const response = await api.get<any>(`/products/${product_id}/options/${product_option_id}/extras`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  async startNewBooking(request: any) {
    try {
      const response = await api.post<any>('/bookings/start', request);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  async addItems(request: any) {
    try {
      const response = await api.post<any>('/bookings/items', request);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data || [];
    } catch (error) {
      handleError(error);
    }
  },
};
