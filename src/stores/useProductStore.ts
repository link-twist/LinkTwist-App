import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService';
import { format, parseISO } from "date-fns";

export const useProductStore = defineStore('productStore', {
  state: () => ({
    name: '',
    role: '',
    id: '',
    products: [] as any[],
    options: [] as any[],
    bookings: [] as any[],
    selectedProductOption: [] as any[]
  }),

  actions: {
    setUserFromToken(token: any) {
      if (token !== null) {
        this.name = token['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        this.role = token['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        this.id = token['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      }
    },
    async loadProducts() {
      try {
        this.products = [];
        if (!this.products.length) {
          const apiProducts = await apiService.getProducts();
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
      } catch (error) {
        console.error("Error loading options:", error);
      }
    },

    saveBookingsByProduct(bookings: any, productOption: any) {
      this.bookings = bookings;
      this.selectedProductOption = productOption;
    },

    resetSelectedProductOption() {
      this.selectedProductOption = [];
    }

    // async loadBookings(dateFrom: string, dateTo: string) {
    //   try {
    //     this.bookings = [];
    //     const apibookings = await apiService.getBookings(dateFrom + ' 00:00:00', dateTo + ' 23:59:59');
    //     this.bookings = apibookings;
    //     console.log('store bookings 1', this.bookings);
    //     this.bookings = this.bookings.filter((booking) => 
    //       !['pending', 'deprecated'].includes(booking.booking_status)
    //     );
    //     console.log('store bookings 2', this.bookings);
    //     return this.bookings;
    //   } catch (error) {
    //     console.error('Error loading bookings:', error);
    //   }
    // }
  },
});
