<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons :router-link="'/NewBooking'" slot="start">
          <ion-icon class="addButton" :icon="addCircleOutline"></ion-icon>
        </ion-buttons>
        <ion-title>Bookings</ion-title>
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
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
      <ion-modal id="date-modal" ref="modal" trigger="open-date-modal">
        <div class="wrapper">
          <ion-datetime v-model="selectedDate" @ionChange="selectDate()" presentation="date"></ion-datetime>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonAlert, IonChip } from '@ionic/vue';
  import { IonCol, IonGrid, IonRow } from '@ionic/vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { loaderService } from '@/services/loadingService';
  import { IonDatetime } from '@ionic/vue';
  import { search, addCircleOutline, calendarOutline } from 'ionicons/icons';
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: "BookingsList",
    components: { 
      IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, 
      IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, 
      IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, 
      IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonAlert, IonChip
    },
    setup() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const today = `${year}-${month}-${day}`;

      const productStore = useProductStore();

      return { products: productStore.products as any[], options: productStore.options as any[], apiService, loaderService, today, search, addCircleOutline, calendarOutline };
    },
    data() {
      return {
        loader: null as any,
        bookings: [] as any[],
        productMap: {} as Record<number, string>,
        productOptionsMap: {} as Record<string, string>, 
        selectedDate: '',
        dateFrom: '',
        dateTo: ''
      };
    },
    async mounted() {
      this.selectedDate = this.today;
      // this.selectedDate = '2025-03-28';
      await this.selectDate();
      await this.loadProductsAndOptions();
    },
    methods: {
      async selectDate() {
        this.dateFrom = `${this.selectedDate.split('T')[0]} 00:00:00`;
        this.dateTo = `${this.selectedDate.split('T')[0]} 23:59:59`;
        this.$refs.modal.$el.dismiss();
        await this.getBookings(this.dateFrom, this.dateTo);
      },
      async loadProductsAndOptions() {
        if (!this.products.length || !this.options.length) {
          console.warn("Products or Options are empty, delaying loading...");
          return;
        }

        this.productMap = Object.fromEntries(this.products.map(p => [p.id, p.title]));
        this.productOptionsMap = Object.fromEntries(
          this.options.map(o => [`${o.product_id}-${o.id}`, o.title])
        );
      },
      async getBookings(dateFrom: string, dateTo: string) {
        this.loader = await this.loaderService.startLoader();

        this.bookings = await this.apiService.getBookings(dateFrom, dateTo) || [];
        this.loaderService.stopLoading(this.loader);
      },
      getBookingItems() {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking) => {
          booking.items.forEach((item) => {
            const key = `${item.product_id}-${item.product_option_id}-${item.activity_date_time}`;

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
  padding-inline-start: var(--padding-start);
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
</style>

function loadProductsAndOptions() {
  throw new Error('Function not implemented.');
}
