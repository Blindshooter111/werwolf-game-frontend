<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lobby</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="lobby">
        <h1>Lobby</h1>
        <p>Lobby ID: {{ lobbyId }}</p>
      </div>

      <div class="player-logos">
        <h2>Choose Your Logo</h2>
        <div>
          <input v-model="playerName" placeholder="Enter your name" />
          <ion-button @click="generateLogo">Generate Logo</ion-button>
        </div>
        <div v-if="playerLogo" class="logo-preview">
          <p>Your Logo:</p>
          <div class="logo">{{ playerLogo }}</div>
        </div>
      </div>

      <div class="lobby-players">
        <h2>Players in Lobby</h2>
        <div v-for="(player, id) in players" :key="id" class="player">
          <div class="player-logo">{{ player.logo }}</div>
          <div class="player-name">{{ player.name }}</div>
        </div>
      </div>

      <div class="chat">
        <h2>Chat</h2>
        <div class="chat-messages">
          <p v-for="(msg, index) in chatMessages" :key="index">{{ msg }}</p>
        </div>
        <input v-model="chatMessage" placeholder="Enter message" @keydown.enter="sendMessage" />
      </div>

      <div class="start-game">
        <ion-button @click="startGame">Start Game</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/vue';
</script>

<script>
export default {
  props: ["lobbyId", "clientId"],
  data() {
    return {
      socket: null,
      chatMessage: "",
      chatMessages: [],
      playerName: "",
      playerLogo: "", // Das eigene generierte Logo
      players: {} // Alle Spieler in der Lobby mit Name und Logo
    };
  },
  mounted() {
    this.socket = new WebSocket("ws://localhost:8080/echo");

    this.socket.onopen = () => {
      console.log(
        "Connected to WebSocket in lobby: " + this.lobbyId + " with clientId: " + this.clientId
      );
    };

    this.socket.onmessage = (event) => {
      const message = event.data;

      // Handle UUID assignment
      if (message.startsWith("UUID")) {
        this.clientId = message.substring(5);
        console.log("Client received UUID: " + this.clientId);
      }

      // Handle player updates
      if (message.startsWith("PLAYER_UPDATE")) {
        const updatedPlayers = JSON.parse(message.substring(13));
        this.players = updatedPlayers;
      }

      // Handle chat messages
      if (message.startsWith("CHAT")) {
        this.chatMessages.push(message.substring(5));
      }

      // Handle game start event
      if (message.startsWith("START_GAME")) {
        console.log("Game starting...");
        this.$router.push({ name: "GameView", params: { lobbyId: this.lobbyId } });
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  },
  methods: {
    generateLogo() {
      if (this.playerName) {
        this.playerLogo = this.playerName[0].toUpperCase();
        console.log("Generated Logo: " + this.playerLogo);

        // Sende den Namen und das Logo an den Server
        const playerData = { id: this.clientId, name: this.playerName, logo: this.playerLogo };
        this.socket.send(`PLAYER_UPDATE ${JSON.stringify(playerData)}`);
      } else {
        alert("Please enter a name to generate a logo!");
      }
    },
    sendMessage() {
      if (this.chatMessage) {
        this.socket.send("CHAT " + this.lobbyId + " " + this.clientId + " " + this.chatMessage);
        this.chatMessage = "";
      }
    },
    startGame() {
      this.socket.send(`START_GAME ${this.lobbyId}`);
      console.log("Starting game with lobby ID: " + this.lobbyId);
      this.$router.push({ name: 'GameView', params: { gameId: this.lobbyId } });
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  }
};
</script>

<style scoped>
.logo {
  font-size: 2rem;
  font-weight: bold;
  background-color: #f0f0f0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-top: 10px;
  border: 1px solid #ccc;
}

.logo-preview {
  margin-top: 10px;
}

.player {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.player-logo {
  font-size: 1.5rem;
  font-weight: bold;
  background-color: #e0e0e0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 10px;
}

.player-name {
  font-size: 1rem;
}
</style>
