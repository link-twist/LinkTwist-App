<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay" v-if="showMenu">
        <ion-content>
          <ion-list id="inbox-list">
            <ion-list-header>{{ productStore.name }}</ion-list-header>
            <!-- <ion-note>hi@ionicframework.com</ion-note> -->

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item @click="urlTest()" router-direction="root" :router-link="p.url" lines="none" :detail="false" class="hydrated">
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import {
  IonApp,
  IonContent,
  IonLoading,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/vue';
import { ref } from 'vue';
import {
  addCircleOutline,
  calendarOutline,
  logOutOutline
} from 'ionicons/icons';
import { useProductStore } from '@/stores/useProductStore';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthService } from '@/services/authService';
import { useBackButton } from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { App as CapacitorApp } from '@capacitor/app';

const appPages = [
  {
    title: 'Bookings List',
    url: '/BookingsList',
    iosIcon: calendarOutline,
    mdIcon: calendarOutline,
  },
  {
    title: 'New Booking',
    url: '/NewBookingSidebar',
    iosIcon: addCircleOutline,
    mdIcon: addCircleOutline,
  },
  {
    title: 'Logout',
    url: '/logout',
    iosIcon: logOutOutline,
    mdIcon: logOutOutline,
  },
];

const isLoggedIn = ref(false);
const productStore = useProductStore();
const route = useRoute();
const router = useRouter();

const showMenu = computed(() => {
  if (productStore.name === '') {
    return false;
  } else {
    return true;
  }
});

const urlTest = () => {
  console.log(route.path)
}

onMounted(async () => {
  await StatusBar.setStyle({ style: Style.Light });

  isLoggedIn.value = await AuthService.isLoggedIn();

  if (isLoggedIn.value && productStore.name === '') {
    const user = await AuthService.getUser();
    productStore.setUserFromToken(user);
  }

  if (isLoggedIn.value) {
    try {
      await productStore.loadProducts();
      await productStore.loadOptions();
    } catch (error) {
      console.error("Error initializing the app:", error);
    }
  }

  useBackButton(10, () => {
    router.go(-1); // Correct: go back in history
  });
  
  useBackButton(-1, () => {
    const currentPath = route.path;

    console.log(currentPath);
    if (currentPath === '/login' || currentPath === '/BookingsList') {
      CapacitorApp.exitApp();
    }
  });
});
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu ion-list-header {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 50px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
