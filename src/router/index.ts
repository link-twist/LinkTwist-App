import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import LoginPage from '@/views/LoginPage.vue';
import ProductsList from '@/views/ProductsList.vue';
import BookingsList from '@/views/BookingsList.vue';
import NewBooking from '@/views/NewBooking.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/LoginPage'
  },
  {
    path: '/LoginPage',
    component: LoginPage
  },
  {
    path: '/BookingsList',
    component: BookingsList
  },
  {
    path: '/NewBooking',
    component: NewBooking
  },
  {
    path: '/ProductsList',
    component: ProductsList
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
