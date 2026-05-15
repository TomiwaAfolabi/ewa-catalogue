import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import './styles.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
void useAuthStore().fetchMe()
app.use(router)
app.mount('#app')
