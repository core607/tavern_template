import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './app.vue';
import 世界 from './页面/世界.vue';
import 正文 from './页面/正文.vue';
import 清单 from './页面/清单.vue';
import 状态 from './页面/状态.vue';
import 角色 from './页面/角色.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/正文', component: 正文 },
    { path: '/状态', component: 状态 },
    { path: '/世界', component: 世界 },
    { path: '/角色', component: 角色 },
    { path: '/清单', component: 清单 },
  ],
});
router.replace('/正文');

$(() => {
  createApp(App).use(router).mount('#app');
});
