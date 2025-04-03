// src/stores/useProductStore.js
import { defineStore } from 'pinia';
import { sqliteService } from '@/services/sqliteService';
import { apiService } from '@/services/apiService'; // Assuming you already have apiService

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [] as any[],
    options: [] as any[],
  }),

  actions: {
    async loadProducts() {
      try {
        let products = await sqliteService.getProducts();
        this.products = products || []; // Immediately update UI with local data
    
        if (!products.length) {
          const apiProducts = await apiService.getProducts();
          await sqliteService.saveProducts(apiProducts);
          this.products = apiProducts; // Update UI again if API has data
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    },

    async loadOptions() {
      try {
        let options = await sqliteService.getOptions();
        this.options = options || [];
    
        if (!options.length) {
          const optionRequests = this.products.map(product => apiService.getProductOptions(product.id));
          const apiOptions = (await Promise.all(optionRequests)).flat(); // Merge results
          await sqliteService.saveOptions(apiOptions);
          this.options = apiOptions;
        }
      } catch (error) {
        console.error("Error loading options:", error);
      }
    }
    
  },
});
