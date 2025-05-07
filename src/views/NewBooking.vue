<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar mode="ios">
					<ion-buttons slot="start">
						<ion-back-button text="Cancel"></ion-back-button>
					</ion-buttons>
          <ion-title><h2>New Booking</h2></ion-title>
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
              <ion-select class="mt-input" aria-label="fruit" placeholder="Select Product" label="Product" label-placement="floating" interface="action-sheet" v-model="item.product_id" @ionChange="resetItems()">
                <ion-select-option v-for="product in products" :value="product.id" :key="product.id">
                  {{ product.title }}
                </ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-select class="mt-input" aria-label="fruit" placeholder="Select Option"  label="Option" label-placement="floating" interface="action-sheet" v-model="item.product_option_id" @ionChange="getAvailability(false)">
                <ion-select-option v-for="option in filterAvailableOptions" :value="option.id" :key="option.id">{{ option.title }}</ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content class="datetime-container">
              <ion-datetime-button datetime="datetime"></ion-datetime-button>
              <ion-select v-if="availableHours.length > 0" :value="selectedAvailability.date_time" toggle-icon="" aria-label="selectedHour" interface="popover" placeholder="Select hour" class="hour-select" @ionChange="hourSelect($event.target.value)" mode="ios">
                <ion-select-option v-for="hour in availableHours" :value="hour.date_time" :key="hour.time">{{ hour.time }}</ion-select-option>
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
                    <ion-button @click="updateQuantity(index, -1, false)" :disabled="participant.quantity <= minOrder(participant.alias)" fill="outline">
                      <ion-icon slot="icon-only" :icon="removeOutline"></ion-icon>
                    </ion-button>
                    <ion-text class="quantity-text">{{ participant.quantity }}</ion-text>
                    <ion-button @click="updateQuantity(index, 1, true)" fill="outline">
                      <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-grid>
              <ion-text v-if="selectedAvailability.vacancies > 0">Vacancies: {{ selectedAvailability.vacancies }}</ion-text>
            </ion-card-content>
          </ion-card>
          <ion-card v-if="extras.length > 0">
            <ion-card-content>
              <ion-select class="mt-input" aria-label="fruit" label="Extras" label-placement="floating" placeholder="Add extras" interface="action-sheet" v-model="selectedExtra.extra_alias">
                <ion-select-option v-for="extra in extras" :value="extra.alias" :key="extra.alias">{{ extra.title }}</ion-select-option>
                <ion-select-option value="" v-if="selectedExtra.extra_alias">Without extras</ion-select-option>
              </ion-select>
              <ion-input v-model="selectedExtra.quantity" class="mt-input" type="text" label="Extra quantity" label-placement="floating" placeholder="Fill the quantity of the selected extra" v-if="selectedExtra.extra_alias"></ion-input>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-input class="mt-input" type="text" label="Special code" label-placement="floating" placeholder="Add special code"></ion-input>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-input
                v-model="item.contact_data[0].email"
                class="mt-input"
                ref="input"
                type="email"
                label="Client's email"
                label-placement="floating"
                helper-text="Provide email if you want client to receive tour booking details"
                error-text="Invalid email"
                @ionInput="validate"
                @ionBlur="markTouched"
              ></ion-input>
            </ion-card-content>
          </ion-card>
          <!-- <ion-button @click="isOpenCompleteAlert = true">alert</ion-button> -->
          <ion-card>
            <ion-card-content>
              <ion-radio-group helper-text="Payments" value="custom-checked">
                <ion-radio label-placement="end" value="credit" aria-label="Custom checkbox">Credit card</ion-radio><br />
                <ion-radio label-placement="end" value="cash" aria-label="Custom checkbox that is checked">Cash</ion-radio>
              </ion-radio-group>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-content>
              <ion-text class="participants-label">
                Total {{ totalPrice }} €
              </ion-text>
            </ion-card-content>
          </ion-card>
          <ion-button class="btn-complete" expand="block" color="dark" size="large" mode="ios" :disabled="item.product_option_id == 0" @click="submitForm()">Complete</ion-button>
        </div>
      </ion-content>
      <ion-modal :keep-contents-mounted="true" ref="dateModal">
        <ion-datetime
          id="datetime"
          v-model="dateValue"
          presentation="date"
          @ionChange="getAvailabilityFromDatePicker(false)"
          mode="ios"
        ></ion-datetime>
      </ion-modal>
      <ion-alert
        :is-open="isOpenCompleteAlert"
        header="The reservation completed successfully!"
        :buttons="completeAlertButton"
        backdropDismiss="false"
        mode="ios"
        @didDismiss="goToBookingsList"
      ></ion-alert>
      <ion-alert
        :is-open="isOpenNotAvailableDay"
        message="There is not availability for this date. Next available day selected."
        :buttons="completeAlertButton"
        backdropDismiss="false"
        mode="ios"
      ></ion-alert>
    </ion-page>
  </template>
  
<script lang="ts">
  import { defineComponent, ref, inject, isProxy, toRaw } from 'vue';
  import { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonFooter, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonAlert, IonBackButton, IonRadio, IonRadioGroup } from '@ionic/vue';
  import { IonCol, IonGrid, IonRow } from '@ionic/vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { apiService } from '@/services/apiService';
  import { IonDatetime, IonDatetimeButton } from '@ionic/vue';
  import { search, addCircleOutline, addOutline, removeOutline, calendarOutline, book } from 'ionicons/icons';
  import { format, parseISO } from "date-fns";
  import { loaderService } from '@/services/loadingService';

  export default defineComponent({
    name: "NewBooking",
    components: { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonFooter, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonDatetimeButton, IonAlert, IonBackButton, IonRadio, IonRadioGroup },
    setup() {
      const backButtonText = ref('Go Back');
      const productStore = useProductStore();
      const cryoptojs = inject('cryptojs');

      return { products: productStore.products as any[], options: productStore.options as any[], selectedProductOption: productStore.selectedProductOption as any[], productStore, apiService, cryoptojs, search, addCircleOutline, addOutline, removeOutline, calendarOutline, backButtonText, loaderService };
    },
    data(){
      return{
        availableOptions: [] as any,
        loader: null as any,
        item: {
          booking_code: "",
          digest: "",
          product_id: 0,
          product_option_id: 0,
          activity_date_time: "",
          participants: [
            { alias: "adult", quantity: 1 }
          ],
          contact_data: [
            { email: ""}
          ]
        },
        dummyEmail: 'dummy@participant.gr',
        extras: [] as any,
        selectedExtra: {
          extra_alias: null,
          quantity: 1,
          answer: null
        },
        availabilityMock: [
    {
        "date_time": "2025-04-06 10:00:00+03:00",
        "vacancies": 22,
        "group_size": null,
        "displayable_price": null,
        "displayable_price_discounted": null,
        "pricing": [
            {
                "participant_type_alias": "adult",
                "prices": [
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 50.0000,
                        "pax_from": 1,
                        "pax_to": 3
                    },
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 30.0000,
                        "pax_from": 4,
                        "pax_to": 22
                    }
                ]
            },
            {
                "participant_type_alias": "child",
                "prices": [
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 20.0000,
                        "pax_from": 1,
                        "pax_to": 2
                    },
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 10.0000,
                        "pax_from": 3,
                        "pax_to": 10
                    }
                ]
            },
            {
                "participant_type_alias": "infant",
                "prices": [
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0,
                        "price_per_participant": 0,
                        "pax_from": 1,
                        "pax_to": 5
                    }
                ]
            }
        ]
    },
    {
        "date_time": "2025-04-06 15:00:00+03:00",
        "vacancies": 18,
        "group_size": null,
        "displayable_price": null,
        "displayable_price_discounted": null,
        "pricing": [
            {
                "participant_type_alias": "adult",
                "prices": [
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 40.0000,
                        "pax_from": 1,
                        "pax_to": 3
                    },
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 20.0000,
                        "pax_from": 4,
                        "pax_to": 18
                    }
                ]
            },
            {
                "participant_type_alias": "child",
                "prices": [
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 10.0000,
                        "pax_from": 1,
                        "pax_to": 2
                    },
                    {
                        "pricing_type": "standard",
                        "fixed_price": 0.0000,
                        "price_per_participant": 5.0000,
                        "pax_from": 3,
                        "pax_to": 10
                    }
                ]
            },
        ]
    }
        ],
        selectedAvailability: {
          date_time: "",
          vacancies: 0,
          group_size: null,
          displayable_price: null,
          displayable_price_discounted: null,
          pricing: [
            { participant_type_alias: '' }
          ]
        },
        removeOutline,
        addOutline,
        dateValue: format(new Date(), 'yyyy-MM-dd'),
        availableHours: [] as any[],
        totalAvailability: [{
          id: 0,
          date_time: '',
          vacancies: 0,
          group_size: null,
          displayable_price: null,
          displayable_price_discounted: null,
          pricing: [{
            participant_type_alias: '',
            prices: {
              pricing_type: '', fixed_price: null, price_per_participant: '', pax_from: null, pax_to: null
            }
          }]
        }],
        finalPrice: 0,
        timezoneOffset: '' as string|null,
        nextDayCheckLimit: 0,
        isOpenCompleteAlert: false as boolean,
        isOpenNotAvailableDay: false as boolean,
        completeAlertButton: ['OK']
      }
    },
    computed: {
      filterAvailableOptions() {
        this.availableOptions = this.options.filter((option) => option.product_id === this.item.product_id);
        return this.availableOptions;
      },
      totalPrice() {
        let totalPrice = 0;
        const participants = this.item.participants;
        const pricing = this.selectedAvailability.pricing;
        const extras = this.extras;
        const selectedExtra = this.selectedExtra;

        let fixedPriceAlreadyAdded = false;

        participants.forEach(participant => {
          const participantPricing = pricing.find(p => p.participant_type_alias === participant.alias);
          if (!participantPricing) return;

          let remainingQuantity = participant.quantity;

          // Sort pricing rules by pax_from (just in case)
          const sortedPrices = participantPricing.prices.sort((a, b) => a.pax_from - b.pax_from);

          for (let i = 0; i < sortedPrices.length && remainingQuantity > 0; i++) {
            const priceTier = sortedPrices[i];

            // Handle fixed price (only once)
            if (priceTier.fixed_price && !fixedPriceAlreadyAdded) {
              totalPrice += priceTier.fixed_price;
              fixedPriceAlreadyAdded = true;
              break; // no need to continue with other tiers for this type
            }

            const tierCapacity = priceTier.pax_to - priceTier.pax_from + 1;
            const paxInThisTier = Math.min(remainingQuantity, tierCapacity);

            totalPrice += paxInThisTier * priceTier.price_per_participant;
            remainingQuantity -= paxInThisTier;
          }
        });

        // Extras
        if (extras.length > 0 && selectedExtra.extra_alias && selectedExtra.quantity > 0) {
          const extraPrice = extras.find(p => p.alias === selectedExtra.extra_alias).price;
          totalPrice += extraPrice * selectedExtra.quantity;
        }

        this.finalPrice = totalPrice;
        return totalPrice;
      }
    },
    mounted() {
      if (this.selectedProductOption.length !== 0) {
        this.item = {
          booking_code: "",
          digest: "",
          product_id: this.selectedProductOption.product_id,
          product_option_id: this.selectedProductOption.product_option_id,
          activity_date_time: "",
          participants: [
            { alias: "adult", quantity: 1 }
          ],
          contact_data: [
            { email: ""}
          ]
        };
        this.dateValue = format(this.selectedProductOption.activity_date_time, 'yyyy-MM-dd');
        this.getAvailability(false);
      }

      this.productStore.resetSelectedProductOption();
    },
    methods: {
      resetItems() {
        this.item = {
          booking_code: this.item.booking_code,
          digest: this.item.digest,
          product_id: this.item.product_id,
          product_option_id: 0,
          activity_date_time: "",
          participants: [
            { alias: "adult", quantity: 1 }
          ],
          contact_data: this.item.contact_data
        };
        this.availableHours = [];
        this.extras = [];
        this.selectedExtra = {
          extra_alias: null,
          quantity: 1,
          answer: null
        };
        this.finalPrice = 0;

        this.selectedAvailability = {
          date_time: "",
          vacancies: 0,
          group_size: null,
          displayable_price: null,
          displayable_price_discounted: null,
          pricing: [
            { participant_type_alias: '' }
          ]
        };
      },
      goToBookingsList() {
        this.isOpenCompleteAlert = false;
        this.$router.push('/BookingsList')
      },
      getAvailabilityFromDatePicker(checkNextDay: boolean) {
        if (this.item.product_id !== 0 && this.item.product_option_id !== 0) {
          this.getAvailability(checkNextDay);
        } else {
          const dateModal = this.$refs.dateModal as InstanceType<typeof IonModal>;
          dateModal.$el.dismiss();
        }
      },
      async getAvailability(checkNextDay: boolean) {
        // Initially checking the present date. If there is not availability (vacancies) we check automatically the next day.
        // We put a limit in an amount of days (30)
        this.selectedAvailability.vacancies = 0;

        if (checkNextDay) {
          this.nextDayCheckLimit += 1;
          if (this.nextDayCheckLimit > 30) {
            alert('This product is not available for the next 30 days');
            this.nextDayCheckLimit = 0;
            this.loaderService.stopLoading(this.loader);
            return;
          }

          this.dateValue = this.getNextDay(this.dateValue);
        } else {
          this.loader = await this.loaderService.startLoader();

          const dateModal = this.$refs.dateModal as InstanceType<typeof IonModal>;
          dateModal.$el.dismiss();
        }

        const dateFrom = `${this.dateValue}T00:00:00${format(new Date(), 'XXX')}`;
        const dateTo = `${this.dateValue}T23:59:59${format(new Date(), 'XXX')}`;

        try {
          const availability = await this.apiService.getProductOptionAvailability(
            this.item.product_id,
            this.item.product_option_id,
            dateFrom,
            dateTo
          );

          // We format the hours of the availability to assign them on the 'ion-select'
          await this.formatAvailability(availability);
        } catch (error) {
          console.error('Error fetching availability:', error);
          alert('An error occurred while checking availability.');
          this.loaderService.stopLoading(this.loader);
        }
      },

      async formatAvailability(availability: any[]) {
        this.availableHours = [];
        this.totalAvailability = [];

        let foundFirst = false;

        for (let i = 0; i < availability.length; i++) {
          const item = availability[i];

          if (item.vacancies > 0) {
            this.totalAvailability.push(item);

            // Assign the first available option as selected
            if (!foundFirst) {
              this.selectedAvailability = item;
              foundFirst = true;
            }

            if (item.date_time.length > 10) {
              const parsedDate = parseISO(item.date_time);
              const time = format(parsedDate, 'HH:mm');

              if (time) {
                this.availableHours.push({
                  date_time: item.date_time,
                  time: time,
                  id: this.availableHours.length + 1
                });

                const match = item.date_time.match(/([+-]\d{2}:\d{2})$/);
                this.timezoneOffset = match ? match[1] : null;
              }
            }
          }
        }

        if (this.selectedAvailability && this.selectedAvailability.vacancies > 0) {
          this.item.activity_date_time = this.selectedAvailability.date_time;
          this.item.participants = [];

          for (let u = 0; u < this.selectedAvailability.pricing.length; u++) {
            this.item.participants.push({
              alias: this.selectedAvailability.pricing[u].participant_type_alias,
              quantity: u === 0 ? 1 : 0
            });
          }

          this.getExtras();
        } else {
          this.isOpenNotAvailableDay = true;
          await this.getAvailability(true);
          return;
        }

        this.loaderService.stopLoading(this.loader);
      },

      async getExtras() {
        this.extras = await this.apiService.getOptionExtras(this.item.product_id, this.item.product_option_id, format(this.item.activity_date_time, 'yyyy-MM-dd'));
      },
      hourSelect(date_time: string) {
        for (let i = 0; i < this.totalAvailability.length; i++) {
          if(this.totalAvailability[i].date_time == date_time) {
            let test = [] as any;
            test = this.totalAvailability[i]
            this.selectedAvailability = test;
            break;
          }
        }

        this.item.activity_date_time = date_time;
        this.item.participants = [];
        for (let u = 0; u < this.selectedAvailability.pricing.length; u++) {
          this.item.participants.push({
            alias: this.selectedAvailability.pricing[u].participant_type_alias,
            quantity: this.minOrder(this.selectedAvailability.pricing[u].participant_type_alias)
          })
        }
      },
      getNextDay(dateTimeValue: string) {
        let date = new Date(dateTimeValue);
        date.setDate(date.getDate() + 1); // Add one day

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      },
      async submitForm() {
        this.loader = await this.loaderService.startLoader();
        const newBookingRequest = {
          "channel_booking_code": null,
          "tour_language": null,
          "comments": ""
        };
        // 1. Start new booking
        let newBookingResponse = await this.apiService.startNewBooking(newBookingRequest);
        const booking_code = newBookingResponse.code as string;
        const secret_code = newBookingResponse.secret_code as string;
        // const secret_code = "f0283a3a8b6adf16ea6f1e98df6e638d";
        // const booking_code = "8E35.MA47IQGVWL";

        // 2. Encode digest
        const digest = this.$CryptoJS.SHA1(booking_code + '_' + secret_code).toString(this.$CryptoJS.enc.Base64);
        // const digest = 'W9RH3QFQYohnXYjusAZ0wZUwlQA='

        // 3. Add items
        let participants = this.item.participants.filter(participant => participant.quantity !== 0);
        let contactData = this.item.contact_data[0].email === '' ? [{"email": this.dummyEmail}] : this.item.contact_data;
        // Because vue is creating 'proxy object', api throughs error, so we re-convert in regular array to fix it
        let participantsFixedProxy = JSON.parse(JSON.stringify(participants));
        let contactDataFixedProxy = JSON.parse(JSON.stringify(contactData));

        const addItemsRequest = {
          "booking_code": booking_code,
          "digest": digest,
          "product_id": this.item.product_id,
          "product_option_id": this.item.product_option_id,
          "activity_date_time": this.item.activity_date_time,
          "participants": participantsFixedProxy,
          "contact_data": contactDataFixedProxy
        };
        console.log('addItemsRequest', addItemsRequest);
        const addItems = await this.apiService.addItems(addItemsRequest);
        console.log('addItems', addItems);

        // 4. Add extras
        if (this.selectedExtra.extra_alias && this.selectedExtra.quantity > 0) {
          const addExtrasRequest = {
            "booking_code": booking_code,
            "digest": digest,
            "product_id": this.item.product_id,
            "product_option_id": this.item.product_option_id,
            "activity_date_time": this.item.activity_date_time,
            "extra_alias": this.selectedExtra.extra_alias,
            "quantity": this.selectedExtra.quantity,
            "answer": this.selectedExtra.answer
          }
          console.log('addExtrasRequest', addExtrasRequest);
          const addExtras = await this.apiService.addExtras(addExtrasRequest);
          console.log('addExtras', addExtras);
        }

        // 5. Complete booking
        const completeBookingRequest = {
          "booking_code": booking_code,
          "digest": digest,
          "channel_booking_code": null,
          "channel_final_price": this.finalPrice,
          "channel_extra_info": null,
          "schedule_booking_emails": this.item.contact_data[0].email === this.dummyEmail ? false : true
        }
        console.log('completeBookingRequest', completeBookingRequest);
        const completeBooking = await this.apiService.completeBooking(completeBookingRequest);
        if(completeBooking) {
          this.isOpenCompleteAlert = true;
        }
        console.log('completeBooking', completeBooking);
        this.loaderService.stopLoading(this.loader);
      },
      minOrder(participantAlias: string) {
        const selectedOption = this.options.find(p => p.id === this.item.product_option_id);

        if (!selectedOption || !selectedOption.participant_types) {
          // console.warn('Selected option or participant_types not found:', selectedOption);
          return 0;
        }

        const primaryType = selectedOption.participant_types.find(
          type => type.alias === participantAlias && type.is_primary
        );

        return primaryType ? primaryType.min_order : 0;
      },
      updateQuantity(index: number, change: number, ascending: boolean) {
        let currentQuantity = 0;
        this.item.participants.forEach(participant => {
          currentQuantity += participant.quantity;
        });
        currentQuantity += change;
        let newQuantity = this.item.participants[index].quantity + change;
        if (ascending) {
          if (newQuantity <= this.selectedAvailability.vacancies && currentQuantity <= this.selectedAvailability.vacancies) {
            this.item.participants[index].quantity = newQuantity;
          }
        } else {
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

        const input = this.$refs.input as InstanceType<typeof IonInput>;
        input.$el.classList.remove('ion-valid');
        input.$el.classList.remove('ion-invalid');

        if (value === '') return;

        this.validateEmail(value)
          ? input.$el.classList.add('ion-valid')
          : input.$el.classList.add('ion-invalid');
      },
      markTouched() {
        const input = this.$refs.input as InstanceType<typeof IonInput>;
        input.$el.classList.add('ion-touched');
      },
    }
  });
</script>
  
<style scoped>
  .participants-label {
    margin-top: 6px;
    font-weight: bold;
    font-size: 18px;
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
    padding-top: 6px;
    padding-bottom: 6px;
    margin-top: 3px;
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

  ion-button.btn-complete {
    margin-bottom: 40px;
    margin-inline-start: 10px;
    margin-inline-end: 10px;
  }

  ion-button.btn-complete::part(native) {
    border-radius: 16px;
  }
</style>
  