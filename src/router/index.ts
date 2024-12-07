import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import LobbyJoin from '@/views/LobbyJoin.vue';
import GameView from '@/views/GameView.vue';
import Lobby from '@/views/Lobby.vue';
import LobbyManagement from '@/views/LobbyManagement.vue';
import TitleScreen from '@/views/TitleScreen.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/titleScreen',
    name: 'titleScreen',
    component: TitleScreen
  },
  {
    path: '/lobbymanagement',
    name: 'LobbyManagement',
    component: LobbyManagement
  },
  {
    path: '/lobbyjoin',
    name: 'lobbyjoin',
    component: LobbyJoin
  },
  {
    path: '/game/:gameId',
    name: 'GameView',
    component: GameView  
  },
  {
    path: '/lobby/:lobbyId',
    name: 'LobbyView',
    component: Lobby,
    props: route => ({
      lobbyId: route.params.lobbyId,
      clientId: route.query.clientId, // Query-Parameter statt im Pfad
    }),
  },
  {
    path: '/',
    redirect: '/titleScreen'
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
