<template>
	<ion-page mode="ios">
		<ion-header :translucent="true">
      <ion-toolbar mode="ios">
				<ion-buttons slot="start">
					<ion-back-button text="Back" color="dark"></ion-back-button>
				</ion-buttons>
        <ion-title><h2>Booking Details</h2></ion-title>
        <ion-buttons slot="end">
          <ion-menu-button color="dark"></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Booking Details</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-card>
					<ion-card-header class="code-header">
						<h5>{{ booking.code }}</h5>
					</ion-card-header>
				</ion-card>
        <ion-card>
          <ion-card-content>
						<p>Activity date: <b>{{ booking.date }}</b></p>
						<p style="margin-bottom: 15px;">Activity time: <b>{{ booking.time ? booking.time : 'All day' }}</b></p>
						<p>Number of participants:</p>
						<p v-for="(count, alias) in booking.participants" :key="alias"><b>{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</b></p>
					</ion-card-content>
				</ion-card>
        <ion-card>
          <ion-card-content>
						<p><b>{{ booking.product }}</b></p>
						<p style="margin-bottom: 15px;"><b>{{ booking.option }}</b></p>
						<p>Booking Status: <ion-text :color="bookingStatusColor(booking.booking_status)"><b>{{ booking.booking_status }}</b></ion-text></p>
						<p>Payment Status: <ion-text :color="paymentColor(booking.payment_status)"><b>{{ booking.payment_status }}</b></ion-text></p>
					</ion-card-content>
				</ion-card>
        <ion-card>
          <ion-card-content>
						<p>Contact Data</p>
						<div v-for="(contact, index) in groupedContactData()" :key="index" class="contact-data">
							<p><b>{{ contact.name }} {{ contact.surname }}</b> ({{ contact.alias.toString()[0].toUpperCase() + contact.alias.toString().slice(1) }})</p>
							<p>{{ contact.email }}</p>
							<p>{{ contact.phone }}</p>
							<!-- <a href="tel:+306978014893"><p>+306978014893{{ contact.phone }}</p></a> -->
						</div>
					</ion-card-content>
				</ion-card>
				<ion-button v-show="booking.booking_status !== 'Cancelled'" id="cancel-alert" color="danger" fill="outline" expand="block" mode="md" class="cancel-button">Cancel Booking</ion-button>
				<ion-alert
					trigger="cancel-alert"
					:buttons="alertButtons"
					mode="ios"
					header="Cancel Booking"
					subHeader="Are you sure you want to cancel this booking?"
					message="This action cannot be undone."
				></ion-alert>
				<ion-toast
					:is-open="toastIsOpen"
					:message="toastMessage"
					:duration="5000"
					:icon="toastIcon"
					mode="ios"
					@didDismiss="setOpenToast(false)"
				></ion-toast>
			</div>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
  import { ref } from 'vue';
  import { IonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonBackButton, IonAlert, IonToast } from '@ionic/vue';
  import { checkmarkOutline, warningOutline } from 'ionicons/icons';
  import { useProductStore } from "@/stores/useProductStore";
  import { defineComponent } from 'vue';
  import { apiService } from '@/services/apiService';

	export default defineComponent({
		name: "BookingDetails",
		components: { 
      IonText, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, 
      IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonBackButton, IonAlert, IonToast
    },
		setup() {
	  	const productStore = useProductStore();
			const booking = ref(productStore.booking) as any;
			const items = ref(productStore.items) as any;

			return {
				apiService,
				booking,
				items,
				checkmarkOutline,
				warningOutline
			}
		},
		data() {
			return {
				toastIsOpen: false,
				toastMessage: '',
				toastIcon: checkmarkOutline,
				alertButtons: [
					{
						text: 'Cancel',
						role: 'cancel',
						handler: () => {
							console.log('Alert canceled');
						},
					},
					{
						text: 'OK',
						role: 'confirm',
						handler: () => {
							this.cancelBooking();
						},
					},
				],
			}
		},
		methods: {
			setOpenToast(state: boolean) {
				this.toastIsOpen = state;
			},
			cancelBooking() {
				const cancelBookingRequest = {
          "booking_code": this.booking.code,
        }

				this.apiService.cancelBooking(cancelBookingRequest)
					.then((response: any) => {
						if (response.booking_status) {
							this.booking.booking_status = response.booking_status;
							this.toastMessage = 'Booking canceled successfully';
							this.toastIcon = checkmarkOutline;
							this.toastIsOpen = true;
						} else {
							this.toastMessage = response;
							this.toastIcon = warningOutline;
							this.toastIsOpen = true;
						}
						this.booking.booking_status = response.booking_status ? response.booking_status : this.booking.booking_status;
						console.log('Booking canceled successfully', response);
					})
					.catch((error: any) => {
						console.error('Error canceling booking', error);
					});
			},
			groupedContactData() {
				const participants = this.items;
				const grouped = {} as any;

				participants.forEach((item: any) => {
					if (item.activity_date_time === this.booking.activity_date_time) {
						const key = `${item.participant_type_alias}-${item.contact_data.name}-${item.contact_data.surname}-${item.contact_data.email}`;

						if (!grouped[key]) {
							grouped[key] = {
								alias: item.participant_type_alias,
								name: item.contact_data.name,
								surname: item.contact_data.surname,
								email: item.contact_data.email,
								phone: item.contact_data.phone
							};
						}
					}
				});
				return grouped;
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
	ion-card-header.code-header {
		background-color: var(--ion-color-dark, #222428) !important;
		overflow: hidden;
		margin-left: -1px;
		margin-top: -1px;
		margin-right: -1px;
	}

	ion-card-header.code-header h5 {
		margin: 0;
		color: #fff;
		font-weight: 700;
	}

	.contact-data {
		margin-top: 15px;
	}
	.contact-data p {
		margin: 0;
	}

	.cancel-button {
		margin-left: 10px;
		margin-right: 10px;
	}
</style>
