<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div id="container">
				<div>
					<img class="left-img" src="../assets/fingerprint.png" alt="">
					<img class="right-img" src="../assets/fingerprint.png" alt="">
					<img class="linktwist-img" src="../assets/logoSmallYellowBlack.png" alt="LinkTwist" />
				</div>
				<div style="position: relative;">
					<div class="login">
						<div class="welcome-text">
							<h1>Welcome</h1>
							<p>Sign in to continue</p>
						</div>
						<ion-input
							type="text"
							class="login-input"
							label="Domain"
							label-placement="stacked"
							fill="outline"
							mode="md"
							v-model="credentials.domain"
						></ion-input>
						<ion-input
							type="text"
							class="login-input"
							label="Username"
							label-placement="stacked"
							fill="outline"
							mode="md"
							v-model="credentials.username"
						></ion-input>
						<ion-input type="password" class="login-input" label="Password" label-placement="stacked" fill="outline" mode="md" v-model="credentials.password">
							<ion-input-password-toggle slot="end"></ion-input-password-toggle>
						</ion-input>
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
	import { AuthService } from '@/services/authService';
	import { IonItem, IonLabel, IonText, IonInput, IonCard, IonCardContent, IonCardTitle, IonButton, IonButtons, IonContent, IonPage, IonIcon, IonAlert, IonInputPasswordToggle } from '@ionic/vue';
	import { apiService } from '@/services/apiService';
	import { useProductStore } from '@/stores/useProductStore';
	import { defineComponent } from 'vue';
  import { onIonViewWillEnter } from '@ionic/vue';
  import { loaderService } from '@/services/loadingService';

	export default defineComponent({
		name: "LoginPage",
		components: { IonItem, IonLabel, IonText, IonInput, IonCard, IonCardContent, IonCardTitle, IonButton, IonButtons, IonContent, IonPage, IonIcon, IonAlert, IonInputPasswordToggle },
		setup() {
      const credentials = ref([]) as any;

			onIonViewWillEnter(() => {
				credentials.value = {
					username: "",
					domain: "",
					password: ""
				}
      });
			return { apiService, AuthService, credentials, loaderService };
		},
		methods: {
			async login() {
				let loader = await this.loaderService.startLoader();
				try {
					const credentials = {
						username: this.credentials.username.trim(),
						domain: this.credentials.domain,
						password: this.credentials.password
					};

					if (!credentials.username || !credentials.password || !credentials.domain) {
						alert('Please enter username, domain and password.');
						this.loaderService.stopLoading(loader);
						return;
					}

					const credentialsFixedProxy = JSON.parse(JSON.stringify(credentials));
					const response = await this.apiService.login(credentialsFixedProxy);

					if (response && response.data.token) {
						await this.AuthService.setApiURL(credentials.domain.trim());
						await this.AuthService.setToken(response.data.token);
						await this.AuthService.setCredentials(credentialsFixedProxy); // Store the credentials to be able to refresh the token
						const user = await this.AuthService.getUser();

						const productStore = useProductStore();
						productStore.setUserFromToken(user);
						await productStore.loadProducts();
						await productStore.loadOptions();

						router.push({ path: '/BookingsList' });
					} else if (response && response.status === 404) {
						alert('Login failed. Invalid domain.');
					}
					else {
						alert('Login failed. Invalid credentials.');
					}
				} catch (error) {
					console.error('Login error:', error);
					alert('An error occurred during login. Please try again.');
				}

        this.loaderService.stopLoading(loader);
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

	div.welcome-text {
		text-align: center;
		padding-bottom: 100px;
	}
	div.welcome-text h1 {
		font-weight: 900;
	}
	div.welcome-text p {
		color: var(--ion-text-color-step-300);
	}

	img.linktwist-img {
		position: fixed;
		bottom: 2%;
		left: 50%;
		transform: translate(-50%);
		width: 170px;
		/* padding-bottom: 5px; */
		z-index: 0;
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
  