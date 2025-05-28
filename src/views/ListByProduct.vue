<template>
  <ion-page mode="ios">
    <ion-header :translucent="true">
      <ion-toolbar mode="ios">
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
        <ion-card>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="(product, index) in getProductOptionSumByTime()" :key="index">
                <ion-label>
                  <ion-chip class="time-chip">{{ product.time }}</ion-chip>
                  <h2><strong>{{ product.product }}</strong></h2>
                  <h2><strong>{{ product.option }}</strong></h2>
                  <h2 v-for="(count, alias) in product.participants" :key="alias" class="gray-font-1">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</h2>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { IonItem, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonChip, IonLabel } from '@ionic/vue';
import { defineComponent } from 'vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { loaderService } from '@/services/loadingService';
  import { format } from "date-fns";
  import { onIonViewWillEnter } from '@ionic/vue';
  import { search, addCircleOutline, calendarOutline } from 'ionicons/icons';

export default defineComponent({
  name: "ListByProduct",
  components: {IonItem, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonChip, IonLabel},
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
      // bookings.value = (result || []).filter(
      //   booking => !['pending', 'deprecated'].includes(booking.booking_status)
      // );
      bookings.value = result;

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
      productMap: {} as Record<number, string>,
      productOptionsMap: {} as Record<string, string>, 
      dateFrom: '',
      dateTo: ''
    };
  },
  async mounted() {
    await this.loadProductsAndOptions();
  },
  methods: {
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

      // Sort by time (optional)
      return Object.values(groups).sort((a, b) => {
        const [hA, mA] = a.time.split(':').map(Number);
        const [hB, mB] = b.time.split(':').map(Number);
        return (hA * 60 + mA) - (hB * 60 + mB);
      });
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
ion-chip.time-chip {
  margin-bottom: 10px;
}
</style>
