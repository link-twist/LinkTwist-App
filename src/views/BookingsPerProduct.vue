<template>
	<ion-page mode="ios">
		<ion-header :translucent="true">
      <ion-toolbar mode="ios">
				<ion-buttons slot="start">
					<ion-back-button text="Back" color="dark"></ion-back-button>
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

      <div id="container">
				<h3 class="title">{{ selectedProductOption.product }} - {{ selectedProductOption.option }}</h3>
				<p class="subtitle">{{ formatedDate }} &bull; {{ bookingsCount }} Bookings</p>

        <ion-card v-for="(booking, index) in bookings" :key="index">
          <ion-card-content>
						<p style="margin-bottom: 15px;"><b>{{ booking.code }}</b></p>
						<p>Booking status: <ion-text :color="bookingStatusColor(booking.booking_status)"><b>{{ booking.booking_status }}</b></ion-text></p>
						<p style="margin-bottom: 15px;">Payment status: <ion-text :color="paymentColor(booking.payment_status)"><b>{{ booking.payment_status }}</b></ion-text></p>
						<p>
							{{ booking.contact_data.name }} {{ booking.contact_data.surname }}
							<span v-if="(booking.contact_data.name !== '' || booking.contact_data.surname !== '') && booking.contact_data.email !== ''">&bull;</span>
							{{ booking.contact_data.email }}
						</p>
						<p v-for="(count, alias) in booking.participants" :key="alias" class="gray-font-1">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</p>
					</ion-card-content>
				</ion-card>
			</div>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
  import { ref } from 'vue';
  import { IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, IonBadge, IonAlert, IonChip, IonDatetime } from '@ionic/vue';
  import { IonCol, IonGrid, IonRow, IonRefresher, IonRefresherContent, IonBackButton } from '@ionic/vue';
  import { useProductStore } from "@/stores/useProductStore";
  import { defineComponent } from 'vue';
  import { format, parseISO } from "date-fns";

	export default defineComponent({
		name: "BookingsPerProduct",
		components: { 
      IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, 
      IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, 
      IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonModal, 
      IonBadge, IonCol, IonGrid, IonRow, IonDatetime, IonAlert, IonChip, IonRefresher, IonRefresherContent, IonBackButton
    },
		setup() {
			const productStore = useProductStore();
			let formatedDate = '';
			let date;

			if (
				productStore.selectedProductOption &&
				productStore.selectedProductOption.activity_date_time
			) {
				date = parseISO(productStore.selectedProductOption.activity_date_time);
				if (productStore.selectedProductOption.activity_date_time.length > 10) {
					formatedDate = format(date, "HH:mm, dd MMMM yyyy");
				} else {
					formatedDate = format(date, "dd MMMM yyyy");
				}
			}
			const bookings = productStore.bookings || [];
			const bookingsCount = bookings.length;

			return {
				bookings,
				bookingsCount,
				selectedProductOption: productStore.selectedProductOption || {},
				formatedDate,
				productStore
			}
		},
		methods: {
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
      },
			bookingStatusColor(booking_status: any) {
				switch (booking_status) {
					case 'Completed':
						return 'success'; // green
					case 'Pending':
						return 'warning';
					case 'Unconfirmed':
						return 'warning'; // yellow
					case 'Deprecated':
						return 'warning'; // yellow
					case 'Cancelled':
						return 'danger'; // red
					default:
						return 'medium'; // gray
				}
			}
		},
		mounted() {
      this.productStore.resetSelectedProductOption();
		}
	})
</script>

<style scoped>
	p {
		font-size: 18px !important;
		line-height: 24px !important;
	}

	ion-card {
		background-color: var(--ion-color-light, #d9d9d9);
		border-color: var(--ion-background-color-step-400, #808080);
	}

	.title {
		margin-left: 16px;
		font-weight: 700;
		margin-top: 0;
		margin-bottom: 5px;
		font-size: 20px !important;
	}

	p.subtitle {
		margin-top: 0 !important;
		margin-left: 16px !important;
		color: var(--ion-text-color-step-500);
	}
</style>
