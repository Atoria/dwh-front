import 'core-js/stable'
import Vue from 'vue'
import Vuex from 'vuex';
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import {iconsSet as icons} from './assets/icons/icons.js'
import VueResource from 'vue-resource'
import 'vue-loaders/dist/vue-loaders.css';
import VueLoaders from 'vue-loaders';
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import store from './store'

library.add(fas)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueLoaders);
Vue.use(VueResource)
Vue.config.performance = true
Vue.use(CoreuiVue)
Vue.prototype.$log = console.log.bind(console)

// http://localhost:8080/#/reports/4
Vue.http.interceptors.push((request, next) => {
    if (localStorage.getItem('user')) {
        let accessToken = JSON.parse(localStorage.getItem('user')).token;
        request.headers.set('Authorization', 'Bearer ' + accessToken)
    }

    next(function (response) {
        if (response.status === 401) {
            console.log(router);
            router.push({name: 'Login'})
            console.log(111);
            // router.push('/login')
        }
    });

})


new Vue({
    el: '#app',
    router,
    store,
    icons,
    template: '<App/>',
    components: {
        App
    }
})
