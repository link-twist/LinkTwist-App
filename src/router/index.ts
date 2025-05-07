import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { AuthService } from '@/services/authService';
import LoginPage from '@/views/LoginPage.vue';
import BookingsPerProduct from '@/views/BookingsPerProduct.vue';
import BookingsList from '@/views/BookingsList.vue';
import NewBooking from '@/views/NewBooking.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/BookingsList'
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/logout',
    component: LoginPage,
    beforeEnter: async (to, from, next) => {
      await AuthService.logout();
      next('/login');
    }
  },
  {
    path: '/BookingsList',
    component: BookingsList,
    beforeEnter: async (to, from, next) => {
      const isLoggedIn = await AuthService.isLoggedIn();
      if (!isLoggedIn) {
        next('/login');
      } else {
        next();
      }
    }
  },
  {
    path: '/NewBooking',
    name: "NewBooking",
    component: NewBooking
  },
  {
    path: '/NewBookingSidebar',
    name: "NewBookingSidebar",
    component: NewBooking
  },
  {
    path: '/BookingsPerProduct',
    component: BookingsPerProduct
  },
]

const BASE_URL = await AuthService.getApiURL() as string;
const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes
});

export default router
