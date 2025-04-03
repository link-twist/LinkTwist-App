<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div id="container">
				<div class="backgound">
					<img class="left-img" src="../assets/fingerprint.png" alt="">
				</div>
				<div style="position: relative;">
					<div class="login">
						<div class="icon">
							<img src="../assets/logoSmallYellowBlack.png" alt="">
						</div>
						<ion-input
							type="email"
							class="login-input"
							label="Email"
							label-placement="floating"
							fill="outline"
							mode="md"
							error-text="Invalid email"
							@ionInput="validate"
							@ionBlur="markTouched"
						></ion-input>
						<ion-input class="login-input" label="Password" label-placement="floating" fill="outline" mode="md"></ion-input>
						<ion-button expand="block" @click="login">Login</ion-button>
					</div>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
  
<script lang="ts">
	import { ref, onMounted } from 'vue';
	import router from '@/router';
	import { IonItem, IonLabel, IonText, IonInput, IonCard, IonCardContent, IonCardTitle, IonButton, IonButtons, IonContent, IonPage, IonIcon, IonAlert } from '@ionic/vue';
	import { apiService } from '@/services/apiService';
	import {
		search, addCircleOutline
	} from 'ionicons/icons';
	import { defineComponent } from 'vue';

	export default defineComponent({
		name: "LoginPage",
		components: { IonItem, IonLabel, IonText, IonInput, IonCard, IonCardContent, IonCardTitle, IonButton, IonButtons, IonContent, IonPage, IonIcon, IonAlert },
		setup() {
			// let bookings = apiService.getBookings();
			return { apiService };
		},
		data(){
			return{
			}
		},
		methods: {
			login() {
				router.push({ path: '/BookingsList' })
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
	ion-content {
		--background: rgb(255, 255, 255);
	}

	ion-content .background {
		position: fixed;
		top: 20%;
		left: 0%;
	}

	#container {
		position: absolute;
		top: 0%;
		left: 0%;
	}

	#container .icon {
		padding-bottom: 50px;
	}

	.login {
		position: fixed;
		top: 50%;
		left: 50%;
		width: 300px;
		transform: translate(-50%, -50%);
	}

	ion-input.login-input {
		--border-radius: 10px;
		margin-bottom: 20px;
	}
</style>
  