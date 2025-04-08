<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div id="container">
				<div class="backgound">
					<img class="left-img" src="../assets/fingerprint.png" alt="">
					<img class="right-img" src="../assets/fingerprint.png" alt="">
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
							value=" "
						></ion-input>
						<ion-input class="login-input" label="Password" label-placement="floating" fill="outline" mode="md">
							<ion-input-password-toggle slot="end"></ion-input-password-toggle>
						</ion-input>
						<!-- <ion-input class="login-input" type="password" label="Password" label-placement="floating" value="" fill="outline" mode="ios">
							<ion-input-password-toggle slot="end"></ion-input-password-toggle>
						</ion-input> -->
						<ion-button expand="block" @click="login" mode="ios" color=dark>Login</ion-button>
					</div>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
  
<script lang="ts">
	import { ref, onMounted } from 'vue';
	import router from '@/router';
	import { IonItem, IonLabel, IonText, IonInput, IonCard, IonCardContent, IonCardTitle, IonButton, IonButtons, IonContent, IonPage, IonIcon, IonAlert, IonInputPasswordToggle } from '@ionic/vue';
	import { apiService } from '@/services/apiService';
	import {
		search, addCircleOutline
	} from 'ionicons/icons';
	import { defineComponent } from 'vue';

	export default defineComponent({
		name: "LoginPage",
		components: { IonItem, IonLabel, IonText, IonInput, IonCard, IonCardContent, IonCardTitle, IonButton, IonButtons, IonContent, IonPage, IonIcon, IonAlert, IonInputPasswordToggle },
		setup() {
			// let bookings = apiService.getBookings();
			return { apiService };
		},
		data(){
			return{
			}
		},
		methods: {
			async login() {
				// console.log('test');
				router.push({ path: '/BookingsList' })
				// let response = await this.apiService.testCall();
				// console.log(response);
				
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
		padding-bottom: 80px;
	}

	.login {
		position: fixed;
		top: 55%;
		left: 50%;
		width: 300px;
		transform: translate(-50%, -50%);
	}

	ion-content img.left-img {
		margin-top: 10%;
    	max-width: 50%;
	}

	ion-content img.right-img {
		position: fixed;
		right: 0;
		transform: scaleX(-1);
		top: 50%;
		max-width: 57%;
	}

	ion-input.login-input {
		--background: #ffffff;
		--border-radius: 10px;
		margin-bottom: 20px;
	}
</style>
  