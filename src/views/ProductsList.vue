<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Manage Products</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Manage Products</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container"> 
        <ion-card>
          <!-- <ion-card-header>
            <ion-card-title>Card Title</ion-card-title>
            <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
          </ion-card-header> -->
          <ion-card-content>
            <ion-select aria-label="Favorite Fruit" value="apple">
              <ion-select-option value="apple">All Product Categories</ion-select-option>
              <ion-select-option value="banana">Banana</ion-select-option>
              <ion-select-option value="orange">Orange</ion-select-option>
            </ion-select>
            <ion-select aria-label="Favorite Fruit" value="apple">
              <ion-select-option value="apple">All Products</ion-select-option>
              <ion-select-option value="banana">Active Only</ion-select-option>
              <ion-select-option value="orange">Inactive Only</ion-select-option>
            </ion-select>
            <ion-input label="Search" label-placement="floating" fill="outline" placeholder="Title"></ion-input>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonItem, IonList, IonSelect, IonSelectOption, IonText, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { apiService } from '@/services/apiService';

const categories = ref<any[]>([]);

const getCategories = async () => {
  try {
    categories.value = await apiService.getCategories();
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
