<template>
	<ion-page>
		<ion-header :translucent="true">
      <ion-toolbar mode="ios">
				<ion-buttons slot="start">
					<ion-back-button text="Cancel"></ion-back-button>
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
          <ion-title size="large">Bookings for</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
				<h1 class="title">{{ selectedProductOption.product }}</h1>
				<h2 class="title">{{ selectedProductOption.option }}</h2>
				<h2 class="subtitle">{{ formatedDate }}</h2>

        <ion-card>
          <ion-card-content>
						<ion-list>
							<ion-item v-for="(booking, index) in bookings" :key="index">
								<ion-label>
									<h2><strong>{{ booking.code }}</strong></h2>
									<h2 :style="{ color: booking.booking_status === 'Cancelled' ? '#FF0000' : '#FDDA0D' }"><strong>{{ booking.booking_status }} - Payment status</strong></h2>
									<h2 v-if="booking.contact_data.name || booking.contact_data.surname">{{ booking.contact_data.name }} {{ booking.contact_data.surname }}</h2>
									<h2 v-else>{{ booking.contact_data.email }}</h2>
									<h2 v-for="(count, alias) in booking.participants" :key="alias" class="gray-font-1">{{ alias.toString()[0].toUpperCase() + alias.toString().slice(1) }} x {{ count }}</h2>
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
			const date = parseISO(productStore.selectedProductOption.activity_date_time);
			let formatedDate = '';
			if (productStore.selectedProductOption.activity_date_time.length > 10) {
				formatedDate = format(date, "HH:mm, dd MMMM yyyy");
			} else {
				formatedDate = format(date, "dd MMMM yyyy");
			}

			return {
				bookings: productStore.bookings as any[],
				selectedProductOption: productStore.selectedProductOption as any[],
				formatedDate,
				productStore
			}
		},
		mounted() {
      this.productStore.resetSelectedProductOption();
		}
	})
</script>

<style scoped>
h1.title, h2.title {
	margin-left: 16px;
	font-weight: 700;
}

h2.title {
	margin-top: 0;
	font-size: 24px !important;
}

h2.subtitle {
	margin-top: 0;
	margin-left: 16px;
	color: var(--ion-text-color-step-500);
}
</style>
