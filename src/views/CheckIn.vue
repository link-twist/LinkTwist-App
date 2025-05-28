<template>
	<ion-page mode="ios">
		<ion-header :translucent="true">
      <ion-toolbar mode="ios">
        <ion-buttons :router-link="'/NewBookingCheckIn'" slot="start">
          <ion-icon class="addButton" :icon="addCircleOutline"></ion-icon>
        </ion-buttons>
        <ion-title><h2>Check In</h2></ion-title>
        <ion-buttons slot="end">
          <ion-menu-button color="dark"></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Check In</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div id="container">
        <ion-card class="ion-text-center" v-if="initialized">
          <ion-card-content>
            <ion-card-content>{{ productTitle }}</ion-card-content>
          </ion-card-content>
        </ion-card>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button color="dark" mode="md" fill="outline" @click="dateIsOpen = true;">
                <ion-icon class="icon-text" :icon="calendarOutline"></ion-icon>{{ selectedDateFormatted() }}
              </ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button color="dark" mode="md" fill="outline" @click="productSelectIsOpen = true">Change Product</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
        <div class="bookings-grid">
          <div class="horizontal-scroll-snap">
            <div class="snap-col">
              <ion-card-header class="date-header" ref="date">
                <p>{{ dateFormated() }}</p>
              </ion-card-header>
              <div v-for="(time, index) in timesSlotsMap" :key="index">
                <ion-list>
                  <ion-item class="time-header" lines="none">
                    <ion-label>{{ time !== '00:00' ? time : 'All day' }}</ion-label>
                    <ion-note v-if="checkinStatistics[time]" slot="end">{{ checkinStatistics[time].checkedIn }}/{{ checkinStatistics[time].total }}</ion-note>
                  </ion-item>
                </ion-list>
                <ion-list>
                  <ion-item v-for="(item, index) in itemsPerProductMap[time]" :key="index">
                    <ion-toggle :checked="checkinStates[item.id]" aria-label="Warning toggle" color="warning" @ionChange="checkIn(item, $event.detail.checked)">
                      <ion-label v-if="(item.name && item.name !== '') || (item.surname && item.surname !=='') ">{{ item.name }} {{ item.surname }}</ion-label>
                      <ion-label v-else-if="item.email && item.email !== ''">{{ item.email }}</ion-label>
                      <ion-label v-else>{{ item.alias }}</ion-label>
                    </ion-toggle>
                  </ion-item>
                </ion-list>
              </div>

              <ion-list v-if="noTimeSlots && initialized" class="ion-text-center">
                <h2>No bookings</h2>
              </ion-list>
              <ion-list v-if="noTimeSlots && product.length == 0 && option.length == 0" class="ion-text-center">
                <h2>Select Product</h2>
              </ion-list>
            </div>
          </div>
        </div>

			</div>
      <ion-modal :is-open="productSelectIsOpen" id="date-modal" ref="modal" show-backdrop="false" @didDismiss="productSelectIsOpen = false">
        <div class="wrapper">
          <ion-list-header mode="ios" style="margin-bottom: 8px">Select product</ion-list-header>
          <ion-item v-for="(product, index) in products" :key="index" @click="handleProductSelect(product.id)">
            <ion-label>{{ product.title }}</ion-label>
          </ion-item>
        </div>
      </ion-modal>
      <ion-modal :is-open="optionSelectIsOpen" id="date-modal" ref="modal" show-backdrop="false" @didDismiss="optionSelectIsOpen = false">
        <div class="wrapper">
          <ion-list-header mode="ios" style="margin-bottom: 8px">Select option</ion-list-header>
          <ion-item v-for="(option, index) in productOptions" :key="index" @click="handleOptionSelect(option.id)">
            <ion-label>{{ option.title }}</ion-label>
          </ion-item>
        </div>
      </ion-modal>
      <ion-modal :is-open="dateIsOpen" id="date-modal" ref="modal" @didDismiss="dateIsOpen = false">
        <div class="wrapper">
          <ion-datetime v-model="selectedDate" @ionChange="getBookings()" presentation="date" mode="ios"></ion-datetime>
        </div>
      </ion-modal>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
  import { ref } from 'vue';
  import { IonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonLabel, IonItem, IonNote, IonList, IonButton, IonButtons, IonContent, IonHeader, IonListHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonModal, IonIcon, IonBackButton, IonAlert, toastController, IonDatetime, IonCol, IonGrid, IonRow, IonToggle, IonRefresher, IonRefresherContent } from '@ionic/vue';
  import { calendarOutline, addCircleOutline } from 'ionicons/icons';
  import { defineComponent } from 'vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
	import { AuthService } from '@/services/authService';
  import { loaderService } from '@/services/loadingService';
  import { format, parseISO } from "date-fns";

	export default defineComponent({
		name: 'CheckIn',
		components: { 
      IonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonLabel, IonItem, IonNote, IonList, IonButton, IonButtons, IonContent, IonHeader, IonListHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonModal, IonDatetime, IonIcon, IonBackButton, IonAlert, toastController, IonCol, IonGrid, IonRow, IonToggle, IonRefresher, IonRefresherContent
    },
		setup() {
      const loader = ref<HTMLIonLoadingElement>();
      const initialized = ref<Boolean>(false);
	  	const productStore = useProductStore();
      const products = productStore.products;
      const options = productStore.options;
      const selectedProductOption = productStore.selectedProductOption;

			return {
        loader,
        loaderService,
        apiService,
        AuthService,
        initialized,
        products,
        options,
        selectedProductOption,
        calendarOutline,
        addCircleOutline
      };
		},
    data() {
      return {
        productSelectIsOpen: false,
        optionSelectIsOpen: false,
        productTitle: null as any,
        dateIsOpen: false,
        productOptions: [] as any,
        productTemp: [] as any,
        product: [] as any,
        option: [] as any,
        bookings: [] as any,
        timesSlotsMap: [] as any,
        itemsPerProductMap: [] as any,
        checkinStates: {} as Record<number, boolean>,
        checkinStatistics: {} as Record<string, { total: number; checkedIn: number }>,
        defaultLoader: true,
        selectedDate: format(new Date(), 'yyyy-MM-dd')
      }
    },
    mounted() {
      this.productSelectIsOpen = true;
    },
    computed: {
      noTimeSlots() {
        // Ensure setTimeSlots is only called when needed, not on every render
        if (!this.timesSlotsMap || this.timesSlotsMap.length === 0) {
          return true;
        }
        return false;
      }
    },
    methods: {
      async handleRefresh(event: CustomEvent|any) {
        setTimeout(async () => {
          this.defaultLoader = false;
          await this.getBookings();
          event.target.complete();
          this.defaultLoader = true;
        }, 500);
      },
      checkIn(item: any, ckecked: boolean) {
        this.checkinStates[item.id] = ckecked;
        const request = {
          booking_code: item.booking_code,
          checked_in: ckecked,
          items: [item.id],
        }
        this.apiService.checkIn(request)
          .then((response: any) => {
            if (response.status === 200 && ckecked) {
              this.presentToast('Check In successful', 'success');
            } else if (response.status === 200 && !ckecked) {
              this.presentToast('Check In Cancelled', 'medium');
            } else if (response.status === 404) {
              this.presentToast('Check In failed', 'danger');
            } else if (response.status === 401) {
              this.handleExpiredToken(item, ckecked);
            } else {
              this.presentToast('Check In failed', 'danger');
            }
            this.setCheckinStatistics();
          })
          .catch((error: any) => {
            console.error('Check In error:', error);
              this.presentToast('Check In failed', 'danger');
          });
      },
      async handleExpiredToken(item: any, ckecked: boolean) {
        const user = await this.AuthService.getCredentials();
        const response = await this.apiService.login(user);

        if (response && response.data.token) {
          await this.AuthService.setToken(response.data.token);
          this.checkIn(item, ckecked);
        } else {
            console.error('Check In error:', response);
            this.presentToast('Check In failed', 'danger');
        }
        console.log('User:', user);
      },
      handleProductSelect(id: number) {
        this.productTemp = this.products.find((product: any) => product.id === id);
        this.productOptions = this.options.filter((option: any) => option.product_id === this.productTemp.id);

        this.productSelectIsOpen = false;
        if (this.productOptions.length === 1) {
          this.product = this.productTemp;
          this.option = this.productOptions[0];
          this.productIndicator();
          this.getBookings();
        } else {
          this.optionSelectIsOpen = true;
        }
      },
      handleOptionSelect(id: any) {
        this.product = this.productTemp;
        this.option = this.productOptions.find((option: any) => option.id === id);
        this.productIndicator();
        this.getBookings();

        this.optionSelectIsOpen = false;
      },
      productIndicator() {
        this.productTitle = this.product.title + ' - ' + (this.option ? this.option.title : '');
        this.initialized = true;
      },
      async getBookings() {
        console.log('defaultLoader:', this.defaultLoader);
        if (!this.productSelectIsOpen && this.defaultLoader) {
          this.loader = await this.loaderService.startLoader();
        }
        this.dateIsOpen = false;
        const dateFrom = format(parseISO(this.selectedDate), 'yyyy-MM-dd' + ' 00:00:00');
        const dateTo = format(parseISO(this.selectedDate), 'yyyy-MM-dd' + ' 23:59:59');

        this.bookings = await this.apiService.getBookings(dateFrom, dateTo) || [];
        this.bookings = this.bookings.filter((booking: any) => 
          ['completed'].includes(booking.booking_status)
        );

        this.checkinStates = {};

        this.setTimeSlots();
        this.loaderService.stopLoading(this.loader);
      },
      groupItemsPerProduct() {
        // Reset the map before populating
        this.itemsPerProductMap = {};

        this.timesSlotsMap.forEach((time: string) => {
          const participants: {
            id: number;
            alias: string;
            name?: string;
            surname?: string;
            email?: string;
            booking_code: string;
            checked_in: boolean;
          }[] = [];

          this.bookings.forEach((booking: any) => {
            booking.items.forEach((item: { id: number, product_id: number; product_option_id: number; activity_date_time: string; participant_type_alias: string; contact_data: any, checked_in: boolean }) => {
              const itemActivityDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd');
              const itemActivityTime = format(parseISO(item.activity_date_time), 'HH:mm');

              if (
                item.product_id === this.product.id &&
                item.product_option_id === this.option.id &&
                itemActivityDate == this.selectedDate &&
                itemActivityTime == time
              ) {
                participants.push({
                  id: item.id,
                  alias: item.participant_type_alias,
                  name: item.contact_data.name,
                  surname: item.contact_data.surname,
                  email: item.contact_data.email,
                  booking_code: booking.code,
                  checked_in: item.checked_in,
                });
              }

              if (!(item.id in this.checkinStates)) {
                this.checkinStates[item.id] = item.checked_in;
              }
            });
          });

          this.itemsPerProductMap[time] = participants;
          this.setCheckinStatistics();
        });
      },
      setCheckinStatistics() {
        this.checkinStatistics = {};

        this.timesSlotsMap.forEach((time: string) => {
          this.checkinStatistics[time] = { total: 0, checkedIn: 0 };

          this.bookings.forEach((booking: any) => {
            booking.items.forEach((item: any) => {
              const itemActivityDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd');
              const itemActivityTime = format(parseISO(item.activity_date_time), 'HH:mm');

              if (
                item.product_id === this.product.id &&
                item.product_option_id === this.option.id &&
                itemActivityDate == this.selectedDate &&
                itemActivityTime == time
              ) {
                if(this.checkinStates[item.id]) {
                  this.checkinStatistics[time].checkedIn++;
                }
                this.checkinStatistics[time].total++;
              }
            });
          });
        });
      },
      
      setTimeSlots() {
        const timesSet = new Set<string>();

        this.bookings.forEach((booking: any) => {
          booking.items.forEach((item: any) => {
            const itemDate = format(parseISO(item.activity_date_time), 'yyyy-MM-dd');

            if (item.product_id === this.product.id && item.product_option_id === this.option.id && itemDate == this.selectedDate) {
              const time = format(parseISO(item.activity_date_time), 'HH:mm');
              timesSet.add(time);
            }
          }) 
        });
        if (timesSet.size === 0) {
          this.timesSlotsMap = [];
          return [];
        }
        // Sort times and assign to timesSlotsMap
        this.timesSlotsMap = Array.from(timesSet).sort();
        this.groupItemsPerProduct();
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
      dateFormated() {
        const dateStr = parseISO(this.selectedDate);
        return format(dateStr, 'EEEE d MMM')
      },
      selectedDateFormatted() {
        if (!this.selectedDate) return '';

        return format(this.selectedDate, 'd MMM');
      },
    }
	});

</script>

<style scoped>
  ion-card ion-card-content {
    -webkit-padding-start: 5px;
    padding-inline-start: 5px;
    -webkit-padding-end: 5px;
    padding-inline-end: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .time-header {
    background-color: var(--ion-color-light);
    padding-top: 0;
    padding-bottom: 0;
  }
  ion-item.time-header::part(native) {
    background-color: var(--ion-color-light);
  }
</style>
