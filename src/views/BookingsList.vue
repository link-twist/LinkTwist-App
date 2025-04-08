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
              <ion-button color="dark">List by Product</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-card>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="(booking, index) in getBookingItems()" :key="index">
                <ion-label>
                  <ion-row>
                    <ion-col>
                      <ion-chip class="time-chip">{{ booking.time }}</ion-chip>
                    </ion-col>
                    <ion-col size="auto">
                      <ion-chip class="time-chip" color="danger">NOT PAID</ion-chip>
                    </ion-col>
                  </ion-row>
                  <h2 class="gray-font-1">{{ booking.code }}</h2>
                  <h2><strong>{{ booking.product }}</strong></h2>
                  <h2><strong>{{ booking.option }}</strong></h2>
                  <h2 v-for="(count, alias) in booking.participants" :key="alias">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</h2>
                </ion-label>
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
  import { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonAlert, IonChip } from '@ionic/vue';
  import { IonCol, IonGrid, IonRow, IonRefresher, IonRefresherContent } from '@ionic/vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { loaderService } from '@/services/loadingService';
  import { IonDatetime } from '@ionic/vue';
  import { search, addCircleOutline, calendarOutline } from 'ionicons/icons';
  import { defineComponent } from 'vue';
  import { format } from "date-fns";
  import { onIonViewWillEnter } from '@ionic/vue';

  export default defineComponent({
    name: "BookingsList",
    components: { 
      IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, 
      IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, 
      IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, 
      IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonAlert, IonChip, IonRefresher, IonRefresherContent
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
        productStore,
        handleRefresh
      };
    },
    data() {
      return {
        loader: null as any,
        // bookings: [] as any[],
        productMap: {} as Record<number, string>,
        productOptionsMap: {} as Record<string, string>, 
        // selectedDate: format(new Date(), 'yyyy-MM-dd'),
        dateFrom: '',
        dateTo: ''
      };
    },
    async mounted() {
      // await this.getBookings();
      await this.loadProductsAndOptions();
    },
    methods: {
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

        this.loaderService.stopLoading(this.loader);
      },
      async loadProductsAndOptions() {
        if (this.products.length == 0 || this.options.length == 0) {
          this.loader = await this.loaderService.startLoader();
          await this.productStore.loadProducts();
          this.products = this.productStore.products;
          await this.productStore.loadOptions();
          this.options = this.productStore.options;
          this.loaderService.stopLoading(this.loader);
          // console.warn("Products or Options are empty, delaying loading...");
          // return;
        }

        this.productMap = Object.fromEntries(this.products.map(p => [p.id, p.title]));
        this.productOptionsMap = Object.fromEntries(
          this.options.map(o => [`${o.product_id}-${o.id}`, o.title])
        );
      },
      getBookingItems() {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking) => {
          booking.items.forEach((item: { product_id: number; product_option_id: number; activity_date_time: string; participant_type_alias: string; }) => {
            const key = `${booking.code}-${item.product_id}-${item.product_option_id}-${item.activity_date_time}`;

            if (!groups[key]) {
              groups[key] = {
                code: booking.code,
                product: this.productMap[item.product_id] || "Unknown Product",
                option: this.productOptionsMap[`${item.product_id}-${item.product_option_id}`] || "Unknown Option",
                time: this.timeFormatted(item.activity_date_time),
                participants: {},
              };
            }

            if (!groups[key].participants[item.participant_type_alias]) {
              groups[key].participants[item.participant_type_alias] = 0;
            }

            groups[key].participants[item.participant_type_alias]++;
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

ion-chip.time-chip {
  border-radius: 6px;
  margin: 0;
  --background: #00213f;
  --color: #adefd1;
  font-weight: 700;
}

ion-item h2 {
  margin-left: auto;
  margin-right: auto
}

</style>
