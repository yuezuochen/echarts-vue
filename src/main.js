import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/css/global.less'
import './assets/font/iconfont.css'
// 对服务端进行websocket连接
import SocketService from '@/utils/socket_service'
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance

// 请求基本路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
Vue.prototype.$http = axios

// 将全局的echarts对象挂载到Vue的原型上
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
