import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { AuthService } from '@/services/authService';
import LoginPage from '@/views/LoginPage.vue';
import BookingsPerProduct from '@/views/BookingsPerProduct.vue';
import BookingsList from '@/views/BookingsList.vue';
import NewBooking from '@/views/NewBooking.vue';
import BookingDetails from '@/views/BookingDetails.vue'
import CheckIn from '@/views/CheckIn.vue';
import ProductsAvailability from '@/views/ProductsAvailability.vue';

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
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        await AuthService.logout();
        next('/login');
      } else {
        next(false); // cancel navigation
      }
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
    path: '/NewBookingCheckIn',
    name: "NewBookingCheckIn",
    component: NewBooking
  },
  {
    path: '/BookingsPerProduct',
    name: "BookingsPerProduct",
    component: BookingsPerProduct
  },
  {
    path: '/BookingDetails',
    name: "BookingDetails",
    component: BookingDetails
  },
  {
    path: '/CheckIn',
    name: "CheckIn",
    component: CheckIn
  },
  {
    path: '/ProductsAvailability',
    name: "ProductsAvailability",
    component: ProductsAvailability
  },
]

const BASE_URL = await AuthService.getApiURL() as string;
const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes
});

export default router
