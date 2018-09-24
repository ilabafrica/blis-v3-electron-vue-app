
import Vue from 'vue'

import store from './store'
import router from './router'
import './plugins/vuetify'
import App from './components/index.vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import {ability} from './store'
import { abilitiesPlugin } from '@casl/vue'
import VueRouter from 'vue-router'
export const EventBus = new Vue()


window.Vue = require('vue');
Vue.config.productionTip = false

Vue.use(abilitiesPlugin, ability)
Vue.use(VueRouter);
Vue.component('index', require('./components/index.vue'))

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')




