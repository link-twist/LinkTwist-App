import { defineStore } from 'pinia';
import { sqliteService } from '@/services/sqliteService';
import { apiService } from '@/services/apiService';
import { format } from "date-fns";

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [] as any[],
    options: [] as any[],
    bookings: [] as any[],
  }),

  actions: {
    async loadProducts() {
      try {
        // let products = await sqliteService.getProducts();
        // this.products = products || [];
        this.products = [];
        if (!this.products.length) {
          const apiProducts = await apiService.getProducts();
          // await sqliteService.saveProducts(apiProducts);
          this.products = apiProducts;
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    },

    async loadOptions() {
      try {
        this.options = [];
        const optionRequests = this.products.map(product => apiService.getProductOptions(product.id));
        const apiOptions = (await Promise.all(optionRequests)).flat();
        this.options = apiOptions;
        console.log('options', this.options);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    },

    async loadBookings(dateFrom: string, dateTo: string) {
      try {
        this.bookings = [];
        const apibookings = await apiService.getBookings(dateFrom + ' 00:00:00', dateTo + ' 23:59:59');
        this.bookings = apibookings;
        console.log('store bookings 1', this.bookings);
        this.bookings = this.bookings.filter((booking) => 
          !['pending', 'deprecated'].includes(booking.booking_status)
        );
        console.log('store bookings 2', this.bookings);
        return this.bookings;
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    }
    
  },
});
