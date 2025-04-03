<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
					<ion-buttons slot="start">
						<ion-back-button text="Cancel"></ion-back-button>
					</ion-buttons>
          <ion-title>New Booking</ion-title>
          <ion-buttons slot="end">
            <ion-menu-button color="dark"></ion-menu-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">New Booking</ion-title>
          </ion-toolbar>
        </ion-header>
  
        <div id="container">
          <ion-card>
            <ion-card-content>
              <ion-select class="mt-input" aria-label="fruit" placeholder="Select Product" label="Product" label-placement="floating" interface="action-sheet" v-model="item.product_id">
                <ion-select-option v-for="product in products" :value="product.id" :key="product.id">
                  {{ product.title }}
                </ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-select class="mt-input" aria-label="fruit" placeholder="Select Option"  label="Option" label-placement="floating" interface="action-sheet" v-model="item.product_option_id" @ionChange="getAvailability(false), getExtras()">
                <ion-select-option v-for="option in availableOptions" :value="option.id" :key="option.id">{{ option.title }}</ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content class="datetime-container">
              <ion-datetime-button datetime="datetime"></ion-datetime-button>
              <ion-select v-if="availableHours.length > 0" v-model="selectedHour" toggle-icon="" aria-label="selectedHour" interface="popover" placeholder="Select fruit" class="hour-select" @ionChange="selectHour()">
                <ion-select-option v-for="hour in availableHours" :value="hour" :key="hour">{{ hour }}</ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content class="participants-card">
              <ion-text>Participants</ion-text>
              <ion-grid>
                <ion-row v-for="(participant, index) in item.participants" :key="participant.alias">
                  <ion-col class="participants-label">{{ capitalize(participant.alias) }}</ion-col>
                  <ion-col size="auto" class="participants-controls">
                    <ion-button @click="updateQuantity(index, -1)" :disabled="participant.quantity <= 0" fill="outline">
                      <ion-icon slot="icon-only" :icon="removeOutline"></ion-icon>
                    </ion-button>
                    <ion-text class="quantity-text">{{ participant.quantity }}</ion-text>
                    <ion-button @click="updateQuantity(index, 1)" fill="outline">
                      <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-select class="mt-input" aria-label="fruit" label="Extras" label-placement="floating" placeholder="Add extras" interface="action-sheet">
                <ion-select-option v-for="extra in extras" :value="extra.id" :key="extra.id">{{ extra.title }}</ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-input v-model="item.discount_code" class="mt-input" label="Special code" label-placement="floating" placeholder="Add special code"></ion-input>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-input
                v-model="item.contact_data[0].email"
                class="mt-input"
                ref="input"
                type="email"
                fill="solid"
                label="Client's email"
                label-placement="floating"
                helper-text="Provide email if you want client to receive tour booking details"
                error-text="Invalid email"
                @ionInput="validate"
                @ionBlur="markTouched"
              ></ion-input>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-radio-group helper-text="Payments" value="custom-checked">
                <ion-radio label-placement="end" value="credit" aria-label="Custom checkbox">Credit card</ion-radio><br />
                <ion-radio label-placement="end" value="cash" aria-label="Custom checkbox that is checked">Cash</ion-radio>
              </ion-radio-group>
            </ion-card-content>
          </ion-card>
          <ion-footer>
            <ion-toolbar>
              <p>{{ dateTimeValue }}</p>
              <ion-title color="primary" @click="submitForm()">Complete</ion-title>
            </ion-toolbar>
          </ion-footer>
        </div>
      </ion-content>
      <ion-modal :keep-contents-mounted="true" ref="dateModal">
        <ion-datetime
          id="datetime"
          v-model="dateTimeValue"
          presentation="date"
          @ionChange="getAvailability(false)"
        ></ion-datetime>
      </ion-modal>
    </ion-page>
  </template>
  
<script lang="ts">
  import { defineComponent, ref, inject } from 'vue';
  import { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonFooter, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonAlert, IonBackButton, IonRadio, IonRadioGroup } from '@ionic/vue';
  import { IonCol, IonGrid, IonRow } from '@ionic/vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { IonDatetime, IonDatetimeButton } from '@ionic/vue';
  import { search, addCircleOutline, addOutline, removeOutline } from 'ionicons/icons';

  export default defineComponent({
    name: "NewBooking",
    components: { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonFooter, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonDatetimeButton, IonAlert, IonBackButton, IonRadio, IonRadioGroup },
    setup() {
      const backButtonText = ref('Go Back');
      const productStore = useProductStore();
      const cryoptojs = inject('cryptojs')

      return { products: productStore.products as any[], options: productStore.options as any[], apiService, cryoptojs, search, addCircleOutline, addOutline, removeOutline, backButtonText};
    },
    data(){
      return{
        // availableOptions: [] as { id: number; product_id: number; title: string; }[],
        booking: {
          channel_booking_code: null,
          tour_language: null,
          comments: ""
        },
        item: {
          booking_code: "",
          digest: "",
          product_id: 0,
          product_option_id: 0,
          activity_date_time: "",
          participants: [
            { alias: "adult", quantity: 1 },
            { alias: "child", quantity: 0 }
          ],
          contact_data: [
            { email: ""}
          ]
        },
        extras: [],
        removeOutline,
        addOutline,
        dateTimeValue: new Date().toISOString(),
        availableHours: [],
        selectedHour: null,
      }
    },
    computed: {
      formattedDate() {
        if (!this.dateTimeValue) return "";

        const date = new Date(this.dateTimeValue);
        const timezoneOffset = -date.getTimezoneOffset(); // Get offset in minutes
        const offsetHours = Math.floor(timezoneOffset / 60);
        const offsetMinutes = Math.abs(timezoneOffset % 60);
        const offsetSign = timezoneOffset >= 0 ? "+" : "-";

        return `${date.toISOString().slice(0, -1)}${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;
      },
      availableOptions(): typeof Option[] {
        return this.options.filter((option) => option.product_id === this.item.product_id);
      },
    },
    methods: {
      async getAvailability(checkNextDay: boolean) {
        // let dateFrom = '';
        // let dateTo = '';
        if (checkNextDay == true) {
          console.log('dateTimeValue', this.dateTimeValue);
          this.dateTimeValue = this.getNextDay(this.dateTimeValue);
        }

        this.$refs.dateModal.$el.dismiss();
        const dateFrom = `${this.formattedDate.split('T')[0]}T00:00:00%2B03:00`;
        const dateTo = `${this.formattedDate.split('T')[0]}T23:59:59%2B03:00`;
      
        let availability = await this.apiService.getProductOptionAvailability(this.item.product_id, this.item.product_option_id, dateFrom, dateTo);
        // let availability = [
        //     {
        //         "date_time": "2025-04-02 10:00:00+03:00",
        //         "vacancies": 0,
        //         "group_size": null,
        //         "displayable_price": null,
        //         "displayable_price_discounted": null,
        //         "pricing": []
        //     },
        //     {
        //         "date_time": "2025-04-02 14:30:00+03:00",
        //         "vacancies": 0,
        //         "group_size": null,
        //         "displayable_price": null,
        //         "displayable_price_discounted": null,
        //         "pricing": []
        //     }
        // ]

        this.formatHours(availability);
      },
      formatHours(availability: any) {
        this.availableHours = [];
        let availabiltyInDay = true;
        for (let i = 0; i < availability.length; i++) {
          if (availability[i].vacancies > 0) {
            this.availableHours.push(availability[i].date_time.split(' ')[1].split(':')[0] + ':' + availability[i].date_time.split(' ')[1].split(':')[1]);
            availabiltyInDay = true;
          } else {
            availabiltyInDay = false;
          }
        }

        if (availabiltyInDay == true) {
          this.selectedHour = this.availableHours[0];
          this.item.activity_date_time = `${this.formattedDate.split('T')[0]}T${this.selectedHour}:00+03:00`;
        } else {
          // Check next day's availability
          this.getAvailability(true);
        }

        console.log('formattedDate', `${this.formattedDate.split('T')[0]}T${this.selectedHour}:00+03:00`);
        console.log('this.item.activity_date_time', this.item.activity_date_time);
      },
      selectHour() {
        console.log(`${this.formattedDate.split('T')[0]}T${this.selectedHour}:00%2B03:00`);
        this.item.activity_date_time = `${this.formattedDate.split('T')[0]}T${this.selectedHour}:00+03:00`;
      },
      getNextDay(dateTimeValue) {
        let date = new Date(dateTimeValue);
        date.setDate(date.getDate() + 1); // Add one day

        // Format it back to "YYYY-MM-DDTHH:MM:SS"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      },
      async submitForm() {
        const newBookingRequest = {
          "channel_booking_code": null,
          "tour_language": null,
          "comments": ""
        };
        // let newBookingResponse = await this.apiService.startNewBooking(newBookingRequest);
        // const booking_code = newBookingResponse.code as string;
        // const secret_code = newBookingResponse.secret_code;
        const booking_code = "8E35.MB4PCRTO6K";
        const secret_code = "baf8bc67d25fad690efd9644e41de648";
        const digest = this.$CryptoJS.SHA1(booking_code + '_' + secret_code).toString(this.$CryptoJS.enc.Base64);

        console.log('booking_code', booking_code);
        console.log('digest', digest);
        const addItemsRequest = {
          "booking_code": booking_code,
          "digest": digest,
          "product_id": this.item.product_id,
          "product_option_id": this.item.product_option_id,
          "activity_date_time": this.item.activity_date_time,
          "participants": [
            {
              "alias": "adult",
              "quantity": 1
            }
          ],
          "contact_data": [
            {
              "name": "nametest4",
              "surname": "surnametest4",
              "email": "test@mail.com"
            }]
        }
        // this.item.participants.forEach((participant) => {
        //   if(participant.quantity > 0) {
        //     return addItemsRequest['participants'].push({
        //       "alias": participant.alias,
        //       "quantity": participant.quantity
        //     });
        //   } else { return };
        // });
        // this.item.contact_data.forEach((contact) => {
        //     return addItemsRequest['contact_data'].push({
        //       "email": contact.email
        //     });
        // });
        console.log('addItemsRequest', addItemsRequest);

        // let addItems = await this.apiService.addItems(addItemsRequest);
        // console.log('addItems', addItems);
      },
      getExtras() {
        console.log('get extras');
        // this.extras = this.apiService.getOptionExtras(this.item.product_id, this.item.product_option_id);
      },
      updateQuantity(index: number, change: number) {
        const newQuantity = this.item.participants[index].quantity + change;
        if (newQuantity >= 0) {
          this.item.participants[index].quantity = newQuantity;
        }
      },
      capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      },
      validateEmail(email: string) {
        return email.match(
          /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        );
      },
      validate(event: { target: { value: any; }; }) {
        const value = event.target.value;

        this.$refs.input.$el.classList.remove('ion-valid');
        this.$refs.input.$el.classList.remove('ion-invalid');

        if (value === '') return;

        this.validateEmail(value)
          ? this.$refs.input.$el.classList.add('ion-valid')
          : this.$refs.input.$el.classList.add('ion-invalid');
      },
      markTouched() {
        this.$refs.input.$el.classList.add('ion-touched');
      },
    }
  });
</script>
  
<style scoped>
  .participants-label {
    font-weight: bold;
  }

  .participants-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quantity-text {
    font-size: 18px;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
  }

  .participants-card {
    padding-bottom: 0;
  }

  .participants-card ion-col {
    padding-top: 0;
    padding-bottom: 10px;
  }

  .submit-button {
    margin-bottom: 80px;
  }

  ion-card-content.datetime-container {
    display: flex;
    justify-content: center;
  }

  ion-datetime-button {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  ion-datetime-button::part(native) {
    text-wrap: nowrap;
  }

  ion-select.hour-select {
    width: 100px;
  }

  ion-select.mt-input {
    margin-top: -10px;
  }

  ion-select.mt-input::part(container) {
    font-weight: 700;
    font-size: 18px;
  }

  ion-select.hour-select::part(container) {
    background-color: var(--ion-background-color-step-50);
    color: #000;
    font-size: 16px;
    padding-inline-start: 15px;
    padding-inline-end: 15px;
    padding-top: 8px;
    padding-bottom: 8px;
    margin-top: 6px;
    border-radius: 8px;
  }

  ion-radio::part(container) {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 2px solid #ddd;
  }

  ion-radio::part(mark) {
    background: none;
    transition: none;
    transform: none;
    border-radius: 0;
  }

  ion-radio.radio-checked::part(container) {
    background: #6815ec;
    border-color: transparent;
  }

  ion-radio.radio-checked::part(mark) {
    width: 6px;
    height: 10px;
    border-width: 0px 2px 2px 0px;
    border-style: solid;
    border-color: #fff;
    transform: rotate(45deg);
  }
</style>
  