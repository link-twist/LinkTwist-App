<template>
	<ion-page mode="ios">
		<ion-header :translucent="true">
      <ion-toolbar mode="ios">
        <ion-buttons :router-link="'/NewBookingCheckIn'" slot="start">
          <ion-icon class="addButton" :icon="addCircleOutline"></ion-icon>
        </ion-buttons>
        <ion-title><h2>Products</h2></ion-title>
        <ion-buttons slot="end">
          <ion-menu-button color="dark"></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Products</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button color="dark" mode="md" fill="outline" @click="dateIsOpen = true;">
                <ion-icon class="icon-text" :icon="calendarOutline"></ion-icon>{{ selectedDateFormatted() }}
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
        <div class="bookings-grid">
          <div class="horizontal-scroll-snap">
            <div class="snap-col">
              <ion-card-header class="date-header" ref="date">
                <p>{{ dateFormated() }}</p>
              </ion-card-header>
              <ion-accordion-group :value="expandedAccordion">
                <ion-accordion v-for="(product, index) in products" :key="index" :value="product.id">
                  <ion-item slot="header" color="light" @click.stop.prevent="accordionGroupChange(product)">
                    <ion-label class="product-header">{{ product.title }}</ion-label>
                  </ion-item>
                  <div slot="content">
                    <ion-list>
                      <ion-item v-for="(option, idx) in productOptionsMap[product.id]" :key="idx">
                        <ion-label>
                          <ion-toggle
                            v-if="(timeSlotsMap[`${product.id}-${option.id}`] || []).length > 1"
                            aria-label="Warning toggle"
                            color="warning"
                            @ionChange="stopStartSales(product, option, $event.detail.checked)"
                            v-model="option.salesActive"
                          >
                            <ion-label style="font-weight: 700;">{{ option.title }}</ion-label>
                          </ion-toggle>
                          <ion-label v-else style="margin-bottom: 6px; font-weight: 700;">{{ option.title }}</ion-label>

                          <ion-toggle
                            v-for="(timeSlot, tIdx) in timeSlotsMap[`${product.id}-${option.id}`] || []"
                            :key="tIdx"
                            aria-label="Warning toggle"
                            color="warning"
                            @ionChange="stopStartSales(product, option, $event.detail.checked, timeSlot.time)"
                            v-model="timeSlot.salesActive"
                          >
                            <ion-label>
                              <span style="font-weight: 500;">{{ timeSlot.time }} </span>
                              <span class="gray-font-1"> Avail. {{ timeSlot.remaining }}</span>
                              <span v-if="timeSlot.has_stopsales" class="gray-font-1"> &bull; Sales stopped</span>
                            </ion-label>
                          </ion-toggle>
                        </ion-label>
                      </ion-item>
                    </ion-list>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
            </div>
          </div>
        </div>
			</div>

      <ion-modal :is-open="dateIsOpen" id="date-modal" ref="modal" @didDismiss="dateIsOpen = false">
        <div class="wrapper">
          <ion-datetime v-model="selectedDate" presentation="date" mode="ios" @ionChange="mapTimeSlots(selectedDate, selectedProduct)"></ion-datetime>
        </div>
      </ion-modal>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
	import { defineComponent, onMounted } from 'vue';
	import { IonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonLabel, IonItem, IonList, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonModal, IonIcon, IonBackButton, IonAlert, toastController, IonDatetime, IonCol, IonGrid, IonRow, IonToggle, IonAccordion, IonAccordionGroup } from '@ionic/vue';
	import { calendarOutline, addCircleOutline, time } from 'ionicons/icons';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { loaderService } from '@/services/loadingService';
  import { format, parseISO, set } from "date-fns";
  import { AuthService } from '@/services/authService';

	export default defineComponent({
		name: 'ProductsAvailability',
		components: { IonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonLabel, IonItem, IonList, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonModal, IonDatetime, IonIcon, IonBackButton, IonAlert, toastController, IonCol, IonGrid, IonRow, IonToggle, IonAccordion, IonAccordionGroup },
		
		setup() {
      const productStore = useProductStore();
			return {
				products: productStore.products as any[],
				options: productStore.options as any[],
        apiService,
        loaderService,
				calendarOutline,
				addCircleOutline
			};
		},
    data() {
      return {
        loader: null as any,
        isLoading: false,
        dateIsOpen: false,
        selectedDate: format(new Date(), 'yyyy-MM-dd'),
        selectedProduct: 0 as number,
        expandedAccordion: null as number | null,
        productOptionsMap: {} as { [key: number]: any[] },
        timeSlotsMap: {} as { [key: string]: any[] },
        showToast: false,
        showErrorToast: false
      }
    },
    mounted() {
      this.mapProductOption();
    },
		methods: {
      async accordionGroupChange(product: any) {
        if (product.id === this.expandedAccordion) {
          // If the accordion is already expanded, collapse it
          this.expandedAccordion = null;
          return;
        }
        this.selectedProduct = product;
        this.isLoading = true;
        await this.mapTimeSlots(this.selectedDate, product);
        this.expandedAccordion = product.id; // Open the accordion after loading
        this.isLoading = false;
      },
      async stopStartSales(product: any, productOption: any, checked: boolean, timeSlot?: string) {
        this.loader = await this.loaderService.startLoader();

        const participantTypes = [] as any[];

        (productOption.participant_types || []).forEach((type: any) => {
          participantTypes.push({
            alias: type.alias,
            stop_sales: !checked
          });
        });

        let request: { items: any[] } = { items: [] };

        if (!timeSlot) {
          // No specific timeSlot: apply to all time slots for this product/option
          const slots = this.timeSlotsMap[`${product.id}-${productOption.id}`] || [];
          if (slots.length === 0) {
            // If no time slots, still send one item for the whole day
            request.items.push({
              product_id: product.id,
              product_option_id: productOption.id,
              from: `${this.selectedDate}T00:00:00${format(new Date(), 'xxx')}`,
              to: `${this.selectedDate}T23:59:59${format(new Date(), 'xxx')}`,
              times: [],
              participant_type_availabilities: participantTypes
            });
          } else {
            // For each slot, add an item
            slots.forEach((slot: any) => {
              request.items.push({
              product_id: product.id,
              product_option_id: productOption.id,
              from: `${this.selectedDate}T${slot.time}:00${format(new Date(), 'xxx')}`,
              to: `${this.selectedDate}T${slot.time}:00${format(new Date(), 'xxx')}`,
              times: [],
              participant_type_availabilities: participantTypes
              });
            });
          }
        } else {
          // Only for the selected timeSlot
          request.items.push({
            product_id: product.id,
            product_option_id: productOption.id,
            from: `${this.selectedDate}T${timeSlot}:00${format(new Date(), 'xxx')}`,
            to: `${this.selectedDate}T${timeSlot}:00${format(new Date(), 'xxx')}`,
            times: [],
            participant_type_availabilities: participantTypes
          });
        }

        const response = await this.apiService.stopStartSales(request)

        if (response && response.status === 204) {
          this.presentToast('Sales updated successfully', 'success');
        } else {
          this.presentToast('Failed to update sales', 'danger');
        }

        this.loaderService.stopLoading(this.loader);
        this.mapTimeSlots(this.selectedDate, product); // Refresh time slots after update
      },
      async mapTimeSlots(date: string, product: any) {
        if (this.dateIsOpen) {
          this.dateIsOpen = false;
        }
        if (!product) { return; }

        this.loader = await this.loaderService.startLoader();
        this.isLoading = true;

        const tempMap: { [key: string]: any[] } = {};

        const productOptions = this.productOptionsMap[product.id];
        for (const option of productOptions) {
          const key = `${product.id}-${option.id}`;
          tempMap[key] = [];
          const timeSlots = await this.fetchTimeSlots(product.id, option.id, date);
          tempMap[key] = timeSlots;
        }

        this.timeSlotsMap = tempMap;
        this.isLoading = false;
        this.loaderService.stopLoading(this.loader);
        this.mapProductOption();
      },
      async fetchTimeSlots(productId: number, productOptionId: number, selectedDate: string) {
        const timeSlots = [];
        const request = {
          product_id: productId,
          product_option_id: productOptionId,
          from: selectedDate + 'T00:00:00',
          to: selectedDate + 'T23:59:59'
        };

        const availability = await this.apiService.getParticipantTypeAvailability(request);
        console.log(availability);
        if (availability) {
          for (let i = 0; i < availability.length; i++) {
            timeSlots.push({
              time: format(parseISO(availability[i].activity_date_time), 'HH:mm'),
              has_stopsales: availability[i].has_stopsales,
              amount: availability[i].amount,
              remaining: availability[i].remaining,
              salesActive: !availability[i].has_stopsales
            });
          }
        }
        timeSlots.sort((a, b) => a.time.localeCompare(b.time));

        return timeSlots;
      },
      mapProductOption() {
        const map: { [key: number]: any[] } = {};
        this.products.forEach(product => {
          const productOptions = this.options.filter(option => option.product_id === product.id);
          map[product.id] = productOptions.map(option => {
            const key = `${product.id}-${option.id}`;
            const slots = this.timeSlotsMap[key] || [];
            const salesActive = slots.some(slot => slot.salesActive);
            return {
              ...option,
              salesActive
            };
          });
        });

        this.productOptionsMap = map;
      },
      dateFormated() {
        const dateStr = parseISO(this.selectedDate);
        return format(dateStr, 'EEEE d MMM')
      },
      selectedDateFormatted() {
        if (!this.selectedDate) return '';

        return format(this.selectedDate, 'd MMM');
      },
      async presentToast(message: string, color: string) {
        const toast = await toastController.create({
          message: message,
          duration: 3000,
          position: 'bottom',
          color: color
        });
        toast.swipeGesture = "vertical";
        await toast.present();
      },
		}
	});
</script>

<style scoped>
  .snap-col {
    overflow: hidden;
    padding: 0;
  }
  .product-header {
    text-align: left;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 6px;
    padding-right: 12px;
    font-weight: 700;
  }

  ion-toggle::part(track) {
    background-color: var(--ion-color-danger);
  }
  ion-toggle.toggle-checked::part(track) {
    background-color: var(--ion-color-success);
  }
</style>
