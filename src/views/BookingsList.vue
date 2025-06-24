<template>
  <ion-page mode="ios">
    <ion-header :translucent="true" ref="mainHeaderRef">
      <ion-toolbar>
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
              <ion-button id="open-date-modal" color="dark" mode="md" fill="outline">
                <ion-icon class="icon-text" :icon="calendarOutline"></ion-icon>{{ selectedDateFormatted() }}
              </ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button v-if="listMode === 'byBooking'" color="dark" @click="switchViewMode()" mode="md" fill="outline">List by Product</ion-button>
              <ion-button v-else color="dark" @click="switchViewMode()" mode="md" fill="outline">List by Booking</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
        <div class="bookings-grid">
          <div class="horizontal-scroll-snap">
            <div class="snap-col" v-for="(date, index) in setDatesRange()" :key="index">
              <ion-card-header class="date-header" ref="date">
                <p>{{ dateFormated(date) }}</p>
              </ion-card-header>
              <div v-for="(time, index) in setTimeSlots(date)" :key="index">
                <p v-if="time !== '00:00'" class="time-header" ref="time">{{ time }}</p>
                <p v-else class="time-header" ref="time">All day</p>
                <ion-list v-if="listMode === 'byBooking'">
                  <ion-item v-for="(booking, index) in getBookingItems(date, time)" :key="index" @click="showBookingDetails(booking)">
                    <ion-label>
                      
                      <h2 class="gray-font-1">{{ booking.code }}</h2>
                      <h2 v-if="booking.booking_status !== 'Completed'" :style="{ color: booking.booking_status === 'Cancelled' ? '#FF0000' : '#FDDA0D' }"><strong>{{ booking.booking_status }}</strong></h2>
                      <h2><strong>{{ booking.product }}</strong></h2>
                      <h2><strong>{{ booking.option }}</strong></h2>
                      <p class="gray-font-1" v-for="(count, alias) in booking.participants" :key="alias">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</p>
                      <p v-for="(count, alias) in booking.extras" :key="alias">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</p>
                    </ion-label>
    
                    <ion-chip class="time-chip top-right" :color="paymentColor(booking.payment_status)">{{ booking.payment_status }}</ion-chip>
                  </ion-item>
                </ion-list>

                <ion-list v-if="listMode === 'byProduct'">
                  <ion-item v-for="(product, index) in getProductOptionSumByTime(date, time)" :key="index" @click="showBookingsPerProduct(product, date, time)">
                    <ion-label>
                      <h2><strong>{{ product.product }}</strong></h2>
                      <h2><strong>{{ product.option }}</strong></h2>
                      <p v-for="(count, alias) in product.participants" :key="alias" class="gray-font-1">
                        {{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}
                      </p>
                    </ion-label>

                    <ion-button ref="test" fill="clear" size="large" slot="end" @click.stop="newBookingByProduct(product)">
                      <ion-icon :icon="addCircleOutline"></ion-icon>
                    </ion-button>
                  </ion-item>
                </ion-list>
              </div>
              <div v-if="setTimeSlots(date).length < 1 && initialized" class="ion-text-center">
                <p class="time-header" ref="time">All day</p>
                <h2>No bookings</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ion-modal id="date-modal" ref="modal" trigger="open-date-modal">
        <div class="wrapper">
          <CustomDateRange
            id="datetime-filter"
            min="2020-01-01T00:00:00"
            :start="startDatePicker"
            :end="endDatePicker"
            @update:start="(d) => (startDatePicker = d)"
            @update:end="(d) => (endDatePicker = d)"
          />
          <ion-toolbar>
            <ion-buttons>
              <ion-button fill="clear" @click="getBookings()">OK</ion-button>
            </ion-buttons>
          </ion-toolbar>
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
  import { format, parseISO, isEqual, eachDayOfInterval } from "date-fns";
  import { onIonViewWillEnter } from '@ionic/vue';
  import CustomDateRange from '@/components/CustomDateRange.vue';

  export default defineComponent({
    name: "BookingsList",
    components: {
      CustomDateRange, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, 
      IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, 
      IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, 
      IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonAlert, IonChip, IonRefresher, IonRefresherContent, 
    },
    setup() {
      const loader = ref<HTMLIonLoadingElement>();
      const initialized = ref<Boolean>(false);
      const startDatePicker = ref<string>(format(new Date(), 'yyyy-MM-dd'));
      const endDatePicker = ref<string>(format(new Date(), 'yyyy-MM-dd'));
      const bookings = ref<any[]>([]);

      const defaultLoader = ref(true);

      const handleRefresh = async (event: CustomEvent|any) => {
        setTimeout(async () => {
          defaultLoader.value = false;
          await getBookings();
          event.target.complete();
          defaultLoader.value = true;
        }, 500);
      };

      const datesRange = eachDayOfInterval({
        start: startDatePicker.value,
        end: endDatePicker.value
      }).map(date => format(date, 'yyyy-MM-dd'))

      const getBookings = async () => {
        if (defaultLoader.value == true) {
          loader.value = await loaderService.startLoader();
        }

        const dateFrom = `${startDatePicker.value} 00:00:00`;
        const dateTo = `${endDatePicker.value} 23:59:59`;

        let result = await apiService.getBookings(dateFrom, dateTo);
        bookings.value = (result || []).filter(
          booking => !['pending', 'deprecated'].includes(booking.booking_status)
        );

        console.log('Filtered bookings:', bookings.value);

        loaderService.stopLoading(loader.value);
        initialized.value = true;
      };

      onIonViewWillEnter(() => {
        getBookings();
      });

      const productStore = useProductStore();

      return { 
        products: productStore.products as any[],
        options: productStore.options as any[],
        bookings,
        startDatePicker,
        endDatePicker,
        datesRange,
        apiService,
        loaderService,
        initialized,
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
        timeSlots: [] as any[],
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

      // this.stickyTableHeader();
    },
    methods: {
      stickyTableHeader() {
        const headerComponent = this.$refs.mainHeaderRef;
        const headerEl = (headerComponent as any)?.$el || headerComponent;
        console.log(headerEl);
 
        if (headerEl instanceof HTMLElement) {
          const height = headerEl.offsetHeight;
          document.documentElement.style.setProperty('--date-header-top', `${height}px`);
          console.log(height);
        }
      },
      setTimeSlots(date: string) {
        const timesSet = new Set<string>();

        if (!this.bookings || this.bookings.length == 0) {
          return [];
        }
        this.bookings.forEach((booking: any) => {
          booking.items.forEach((item: any) => {
            const itemDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd')
            if (itemDate == date) {
              if (this.listMode == 'byProduct' && booking.booking_status !== 'completed') { 
                return; // Skip non-completed bookings in product view
              }
              const time = format(parseISO(item.activity_date_time), 'HH:mm');
              timesSet.add(time);
            }
          }) 
        });

        return Array.from(timesSet).sort();
      },
      setDatesRange() {
        this.datesRange = eachDayOfInterval({
          start: this.startDatePicker,
          end: this.endDatePicker
        }).map(date => format(date, 'yyyy-MM-dd'))

        return this.datesRange;
      },
      switchViewMode() {
        if (this.listMode === 'byBooking') {
          this.listMode = 'byProduct'
        } else {
          this.listMode = 'byBooking'
        }
      },
      async getBookings() {
        this.loader = await this.loaderService.startLoader();
        this.dateFrom = `${this.startDatePicker} 00:00:00`;
        this.dateTo = `${this.endDatePicker} 23:59:59`;

        const modal = this.$refs.modal as InstanceType<typeof IonModal>;
        modal.$el.dismiss();

        this.bookings = await this.apiService.getBookings(this.dateFrom, this.dateTo) || [];

        this.bookings = this.bookings.filter((booking) => 
          !['pending', 'deprecated'].includes(booking.booking_status)
        );

        console.log('Filtered bookings:', this.bookings);

        this.loaderService.stopLoading(this.loader);
        
        await this.getExtras();
      },
      async getExtras() {
        this.extras = [] as any[];
        const date = this.dateFrom === '' ? this.startDatePicker : this.dateFrom;

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
      getBookingItems(date: string, time: string) {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking: any) => {
          booking.items.forEach((item: {
            product_id: number;
            product_option_id: number;
            activity_date_time: string;
            participant_type_alias: string;
          }) => {
            const itemActivityDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd');
            const itemActivityTime = format(parseISO(item.activity_date_time), 'HH:mm');
            if (itemActivityDate == date && itemActivityTime == time) {
              const key = `${booking.code}-${item.product_option_id}-${item.activity_date_time}`;
  
              if (!groups[key]) {
                groups[key] = {
                  code: booking.code,
                  booking_status: booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1),
                  product: this.productMap[item.product_id] || "Unknown Product",
                  option: this.productOptionsMap[`${item.product_id}-${item.product_option_id}`] || "Unknown Option",
                  date: format(item.activity_date_time, 'dd MMMM yyyy'),
                  time: item.activity_date_time.length > 10 ? format(item.activity_date_time, 'HH:mm') : '',
                  activity_date_time: item.activity_date_time,
                  participants: {},
                  extras: {},
                  payment_status: booking.payment_status,
                };
              }
  
              if (!groups[key].participants[item.participant_type_alias]) {
                groups[key].participants[item.participant_type_alias] = 0;
              }
  
              groups[key].participants[item.participant_type_alias]++;
            }
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

      getProductOptionSumByTime(date: string, time: string) {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking: any) => {
          booking.items.forEach((item: {
            product_id: number;
            product_option_id: number;
            participant_type_alias: string;
            activity_date_time: string;
          }) => {
            const itemActivityDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd');
            const itemActivityTime = format(parseISO(item.activity_date_time), 'HH:mm');
            if (itemActivityDate == date && itemActivityTime == time && booking.booking_status == 'completed') {
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
            }
          });
        });

        // Sort by time (optional)
        return Object.values(groups).sort((a, b) => {
          const [hA, mA] = a.time.split(':').map(Number);
          const [hB, mB] = b.time.split(':').map(Number);
          return (hA * 60 + mA) - (hB * 60 + mB);
        });
      },
      showBookingDetails(booking: any) {
        this.productStore.storeBooking(
          booking,
          this.bookings.find((p: any) => p.code === booking.code).items
        );

        this.$router.push('/BookingDetails');
      },
      newBookingByProduct(product: any, date: string, time: string) {
        const groups = this.groupBookingsPerProduct(product, date, time);
        this.productStore.storeBookingsByProduct(groups, product);

        this.$router.push('/NewBooking');
      },
      showBookingsPerProduct(product: any, date: string, time: string) {
        const groups = this.groupBookingsPerProduct(product, date, time);
        this.productStore.storeBookingsByProduct(groups, product);

        this.$router.push('/BookingsPerProduct');
      },
      groupBookingsPerProduct(product: any, date: string, time: string) {
        const groups: Record<string, any> = {};

        this.bookings.forEach((booking: any) => {
          booking.items.forEach((item: { product_id: number; product_option_id: number; activity_date_time: string; participant_type_alias: string; contact_data: any }) => {
            const itemActivityDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd');
            const itemActivityTime = format(parseISO(item.activity_date_time), 'HH:mm');
            if (item.product_id === product.product_id && item.product_option_id === product.product_option_id && itemActivityDate == date && itemActivityTime == time) {
              const key = `${booking.code}-${item.product_id}-${item.product_option_id}-${item.activity_date_time}`;
  
              if (!groups[key]) {
                groups[key] = {
                  code: booking.code,
                  booking_status: booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1),
                  payment_status: booking.payment_status,
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
      dateFormated(date: string) {
        const dateStr = parseISO(date);
        return format(dateStr, 'EEEE d MMM')
      },
      selectedDateFormatted() {
        if (!this.startDatePicker || !this.endDatePicker) return '';
  
        const startDate = parseISO(this.startDatePicker);
        const endDate = parseISO(this.endDatePicker);

        if (isEqual(startDate, endDate)) {
          return format(startDate, 'd MMM');
        } else if (format(startDate, 'MM yyyy') === format(endDate, 'MM yyyy')) {
          return `${format(startDate, 'd')}-${format(endDate, 'd MMM')}`;
        }

        return `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM')}`;
      },
      paymentColor(payment_status: any) {
        switch (payment_status) {
          case 'Paid':
            return 'success'; // green
          case 'Paid to Third Party':
            return 'success';
          case 'Free of Charge':
            return 'success';
          case 'Partially Paid':
            return 'warning'; // yellow
          case 'Amount withheld':
            return 'warning'; // yellow
          case 'Not Paid':
            return 'danger'; // red
          default:
            return 'medium'; // gray
        }
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

ion-modal#date-modal ion-button {
  margin-left: auto;
  margin-right: auto;
  font-weight: 800;
}

ion-label h2 ,ion-label p {
  padding-inline-start: 5px;
  padding-inline-end: 5px;
}

ion-item {
    --inner-padding-end:0;
}

ion-item h2 {
  margin-left: auto;
  margin-right: auto
}

</style>
