<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar mode="ios">
        <ion-buttons :router-link="'/NewBooking'" slot="start">
          <ion-icon class="addButton" :icon="addCircleOutline"></ion-icon>
        </ion-buttons>
        <ion-title><h2>Bookings</h2></ion-title>
        <ion-buttons slot="end">
          <ion-menu-button color="dark"></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Bookings</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div id="container"> 
        <ion-grid>
          <ion-row>
            <ion-col> 
              <!-- <ion-item class="input-with-icon">
                <ion-icon item-left :icon="search"></ion-icon>
                <ion-input
                  aria-label="Booking code"
                  placeholder="Booking code"
                  class="custom"
                  :icon="search"
                ></ion-input>
              </ion-item> -->
              <ion-button id="open-date-modal" color="dark">
                <ion-icon class="icon-text" :icon="calendarOutline"></ion-icon>{{ selectedDateFormatted(selectedDate) }}
              </ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button v-if="listMode === 'byBooking'" color="dark" @click="switchViewMode()">List by Product</ion-button>
              <ion-button v-else color="dark" @click="switchViewMode()">List by Booking</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-card>
          <ion-card-content>
            <ion-list v-if="listMode === 'byBooking'">
              <ion-item v-for="(booking, index) in getBookingItems()" :key="index">
                <ion-label>
                  <ion-chip class="time-chip" v-if="booking.time !== ''">{{ booking.time }}</ion-chip>
                  
                  <h2 class="gray-font-1">{{ booking.code }}</h2>
                  <h2 v-if="booking.booking_status !== 'Completed'" :style="{ color: booking.booking_status === 'Cancelled' ? '#FF0000' : '#FDDA0D' }"><strong>{{ booking.booking_status }}</strong></h2>
                  <h2><strong>{{ booking.product }}</strong></h2>
                  <h2><strong>{{ booking.option }}</strong></h2>
                  <h2 class="gray-font-1" v-for="(count, alias) in booking.participants" :key="alias">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</h2>
                  <h2 v-for="(count, alias) in booking.extras" :key="alias">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</h2>
                </ion-label>

                <ion-chip class="time-chip" color="danger">NOT PAID</ion-chip>
              </ion-item>
              <ion-item v-if="bookings.length === 0">
                <ion-text class="text-center">
                  <h2>There are no bookings for this day!</h2>
                </ion-text>
              </ion-item>
            </ion-list>
            <ion-list v-if="listMode === 'byProduct'">
              <ion-item v-for="(product, index) in getProductOptionSumByTime()" :key="index" @click="showBookingsPerProduct(product)">
                <ion-label>
                  <ion-chip class="time-chip" v-if="product.time !== ''">{{ product.time }}</ion-chip>
                  <h2><strong>{{ product.product }}</strong></h2>
                  <h2><strong>{{ product.option }}</strong></h2>
                  <h2 v-for="(count, alias) in product.participants" :key="alias" class="gray-font-1">
                    {{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}
                  </h2>
                </ion-label>

                <ion-button fill="clear" size="large" slot="end" @click.stop="newBookingByProduct(product)">
                  <ion-icon :icon="addCircleOutline"></ion-icon>
                </ion-button>
              </ion-item>

              <ion-item v-if="bookings.length === 0">
                <ion-text class="text-center">
                  <h2>There are no bookings for this day!</h2>
                </ion-text>
              </ion-item>
            </ion-list>

          </ion-card-content>
        </ion-card>
      </div>
      <ion-modal id="date-modal" ref="modal" trigger="open-date-modal">
        <div class="wrapper">
          <ion-datetime v-model="selectedDate" @ionChange="getBookings()" presentation="date" mode="ios"></ion-datetime>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { ref } from 'vue';
  import { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonAlert, IonChip, IonDatetime } from '@ionic/vue';
  import { IonCol, IonGrid, IonRow, IonRefresher, IonRefresherContent } from '@ionic/vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { loaderService } from '@/services/loadingService';
  import { search, addCircleOutline, calendarOutline, chevronForwardCircleOutline } from 'ionicons/icons';
  import { defineComponent } from 'vue';
  import { format } from "date-fns";
  import { onIonViewWillEnter } from '@ionic/vue';

  export default defineComponent({
    name: "BookingsList",
    components: { 
      IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, 
      IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, 
      IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, 
      IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonAlert, IonChip, IonRefresher, IonRefresherContent, 
    },
    setup() {
      const loader = ref(null);
      const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'));
      const dateFrom = ref('');
      const dateTo = ref('');
      const bookings = ref([]);

      const defaultLoader = ref(true);

      const handleRefresh = async (event: CustomEvent) => {
        setTimeout(async () => {
          defaultLoader.value = false;
          await getBookings();
          event.target.complete();
          defaultLoader.value = true;
        }, 500);
      };

      const getBookings = async () => {
        if (defaultLoader.value == true) {
          loader.value = await loaderService.startLoader();
        }

        const dateStr = selectedDate.value.split('T')[0];
        dateFrom.value = `${dateStr} 00:00:00`;
        dateTo.value = `${dateStr} 23:59:59`;

        let result = await apiService.getBookings(dateFrom.value, dateTo.value);
        bookings.value = (result || []).filter(
          booking => !['pending', 'deprecated'].includes(booking.booking_status)
        );

        console.log('Filtered bookings:', bookings.value);

        loaderService.stopLoading(loader.value);
      };

      onIonViewWillEnter(() => {
        getBookings();
      });

      const productStore = useProductStore();

      return { 
        products: productStore.products as any[],
        options: productStore.options as any[],
        bookings,
        selectedDate,
        apiService,
        loaderService,
        search,
        addCircleOutline,
        calendarOutline,
        chevronForwardCircleOutline,
        productStore,
        handleRefresh
      };
    },
    data() {
      return {
        loader: null as any,
        listMode: 'byBooking',
        productMap: {} as Record<number, string>,
        productOptionsMap: {} as Record<string, string>,
        extras: [] as any[],
        dateFrom: '',
        dateTo: '',
        isOpenDetailsModal: false,
        selectedProductOption: []
      };
    },
    async mounted() {
      await this.loadProductsAndOptions();
      await this.getExtras();
    },
    methods: {
      switchViewMode() {
        if (this.listMode === 'byBooking') {
          this.listMode = 'byProduct'
        } else {
          this.listMode = 'byBooking'
        }
      },
      async getBookings() {
        this.loader = await this.loaderService.startLoader();
        this.dateFrom = `${this.selectedDate.split('T')[0]} 00:00:00`;
        this.dateTo = `${this.selectedDate.split('T')[0]} 23:59:59`;

        const modal = this.$refs.modal as InstanceType<typeof IonModal>;
        modal.$el.dismiss();

        this.bookings = await this.apiService.getBookings(this.dateFrom, this.dateTo) || [];

        this.bookings = this.bookings.filter((booking) => 
          !['pending', 'deprecated'].includes(booking.booking_status)
        );

        console.log('Filtered bookings:', this.bookings);

        await this.getExtras();

        this.loaderService.stopLoading(this.loader);
      },
      async getExtras() {
        this.extras = [] as any[];
        const date = this.dateFrom === '' ? format(this.selectedDate, 'yyyy-MM-dd') : this.dateFrom;

        for (let i = 0; i < this.options.length; i++) {
          let extra = await this.apiService.getOptionExtras(this.options[i].product_id, this.options[i].id, date);

          if (extra.length > 0) {
            this.extras.push(...extra); 
          }
        }
      },
      async loadProductsAndOptions() {
        if (this.products.length == 0 || this.options.length == 0) {
          this.loader = await this.loaderService.startLoader();
          await this.productStore.loadProducts();
          this.products = this.productStore.products;
          await this.productStore.loadOptions();
          this.options = this.productStore.options;
          this.loaderService.stopLoading(this.loader);
        }

        this.productMap = Object.fromEntries(this.products.map(p => [p.id, p.title]));
        this.productOptionsMap = Object.fromEntries(
          this.options.map(o => [`${o.product_id}-${o.id}`, o.title])
        );
      },
      getBookingItems() {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking) => {
          booking.items.forEach((item: {
            product_id: number;
            product_option_id: number;
            activity_date_time: string;
            participant_type_alias: string;
          }) => {
            const key = `${booking.code}-${item.product_option_id}-${item.activity_date_time}`;

            if (!groups[key]) {
              groups[key] = {
                code: booking.code,
                booking_status: booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1),
                product: this.productMap[item.product_id] || "Unknown Product",
                option: this.productOptionsMap[`${item.product_id}-${item.product_option_id}`] || "Unknown Option",
                time: item.activity_date_time.length > 10 ? format(item.activity_date_time, 'HH:mm') : '',
                participants: {},
                extras: {}
              };
            }

            if (!groups[key].participants[item.participant_type_alias]) {
              groups[key].participants[item.participant_type_alias] = 0;
            }

            groups[key].participants[item.participant_type_alias]++;
          });

          booking.extras.forEach((extra: {
            product_option_id: number;
            activity_date_time: string;
            extra_alias: string;
          }) => {
            const key = `${booking.code}-${extra.product_option_id}-${extra.activity_date_time}`;

            let title = this.extras.find((p => p.alias == extra.extra_alias));
            let extraTitle = title ? title.title : extra.extra_alias;

            if (groups[key]) {
              if (!groups[key].extras[extraTitle]) {
                groups[key].extras[extraTitle] = 0;
              }
              groups[key].extras[extraTitle]++;
            }
          });
        });

        // Sort by time in the day
        return Object.values(groups).sort((a, b) => {
          const [hA, mA] = a.time.split(':').map(Number);
          const [hB, mB] = b.time.split(':').map(Number);
          return (hA * 60 + mA) - (hB * 60 + mB);
        });
      },

      getProductOptionSumByTime() {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking) => {
          booking.items.forEach((item: {
            product_id: number;
            product_option_id: number;
            participant_type_alias: string;
            activity_date_time: string;
          }) => {
            const key = `${item.product_id}-${item.product_option_id}-${item.activity_date_time}`;

            if (!groups[key]) {
              groups[key] = {
                product: this.productMap[item.product_id] || "Unknown Product",
                product_id: item.product_id,
                option: this.productOptionsMap[`${item.product_id}-${item.product_option_id}`] || "Unknown Option",
                product_option_id: item.product_option_id,
                time: item.activity_date_time.length > 10 ? format(item.activity_date_time, 'HH:mm') : '',
                activity_date_time: item.activity_date_time,
                participants: {},
              };
            }

            if (!groups[key].participants[item.participant_type_alias]) {
              groups[key].participants[item.participant_type_alias] = 0;
            }

            groups[key].participants[item.participant_type_alias]++;
          });
        });

        // Sort by time (optional)
        return Object.values(groups).sort((a, b) => {
          const [hA, mA] = a.time.split(':').map(Number);
          const [hB, mB] = b.time.split(':').map(Number);
          return (hA * 60 + mA) - (hB * 60 + mB);
        });
      },
      newBookingByProduct(product: any) {
        const groups = this.groupBookingsPerProduct(product);

        this.productStore.saveBookingsByProduct(groups, product);

        this.$router.push('/NewBooking');
      },
      showBookingsPerProduct(product: any) {
        const groups = this.groupBookingsPerProduct(product);

        this.productStore.saveBookingsByProduct(groups, product);

        this.$router.push('/BookingsPerProduct');
      },
      groupBookingsPerProduct(product: any) {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking: any) => {
          booking.items.forEach((item: { product_id: number; product_option_id: number; activity_date_time: string; participant_type_alias: string; contact_data: any }) => {
            if (item.product_id === product.product_id && item.product_option_id === product.product_option_id) {
              const key = `${booking.code}-${item.product_id}-${item.product_option_id}-${item.activity_date_time}`;
  
              if (!groups[key]) {
                groups[key] = {
                  code: booking.code,
                  booking_status: booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1),
                  product: this.productMap[item.product_id] || "Unknown Product",
                  option: this.productOptionsMap[`${item.product_id}-${item.product_option_id}`] || "Unknown Option",
                  time: item.activity_date_time.length > 10 ? format(item.activity_date_time, 'HH:mm') : '',
                  participants: {},
                  contact_data: item.contact_data
                };
              }

              if (!groups[key].participants[item.participant_type_alias]) {
                groups[key].participants[item.participant_type_alias] = 0;
              }
              groups[key].participants[item.participant_type_alias]++;
            }
          });
        });

        return Object.values(groups);
      },
      selectedDateFormatted(date: string) {
        if (!date) return "";
        
        const options = { day: "2-digit", month: "short" };
        return new Date(date).toLocaleDateString("en-GB", options);
      },
      timeFormatted(datetime: string) {
        if (!datetime) return "";
        
        const date = new Date(datetime);
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      }
    }
  });
</script>

<style scoped>
#container ion-grid {
  margin-top: 10px;
}

#container {
  margin-bottom: 40px;
}

ion-buttons ion-icon.addButton {
  padding-inline-start: 10px;
  padding-inline-end: 10px;
  font-size: 2em;
}

ion-modal#date-modal {
  --width: fit-content;
  --min-width: 250px;
  --height: fit-content;
  --border-radius: 6px;
  --background-color: #fff;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
  z-index: 9999;
}

ion-modal#date-modal .wrapper {
  background-color: #fff;
}

ion-label h2 {
  padding-inline-start: 5px;
  padding-inline-end: 5px;
}

ion-item h2 {
  margin-left: auto;
  margin-right: auto
}

</style>
