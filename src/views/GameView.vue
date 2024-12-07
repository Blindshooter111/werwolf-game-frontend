<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Game</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="game-container">
          <h1>Welcome to the Game!</h1>
          <p>You are in game with ID: {{ gameId }}</p>
          <div v-if="gameMessages.length" class="game-messages">
            <h2>Game Updates</h2>
            <ul>
              <li v-for="(msg, index) in gameMessages" :key="index">{{ msg }}</li>
            </ul>
          </div>
          <div v-if="gameState === 'waiting'">
            <p>Waiting for other players to join...</p>
          </div>
          <div v-if="gameState === 'playing'">
            <p>The game is now in progress!</p>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
  import { onMounted, reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const gameId = ref(""); // Pass this from the previous Lobby view or retrieve from backend.
  const gameState = ref("waiting"); // 'waiting', 'playing', or other game states.
  const gameMessages = reactive([]); // Array to store game updates.
  let socket = null;
  
  // Initialize WebSocket and game logic
  onMounted(() => {
    // Connect to the existing WebSocket server
    socket = new WebSocket("ws://localhost:8080/echo");
  
    socket.onopen = () => {
      console.log("Connected to WebSocket for Game View");
      socket.send("JOIN_GAME " + gameId.value);
    };
  
    socket.onmessage = (event) => {
      const message = event.data;
      console.log("GameView received message:", message);
  
      // Parse game-specific messages
      if (message.startsWith("GAME_STATE")) {
        gameState.value = message.split(" ")[1]; // Example: "GAME_STATE playing"
      } else if (message.startsWith("GAME_MESSAGE")) {
        gameMessages.push(message.substring(13)); // Example: "GAME_MESSAGE Update!"
      }
    };
  
    socket.onclose = () => {
      console.log("WebSocket connection for GameView closed.");
    };
  
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  });

  </script>
  
  <style scoped>
  .game-container {
    text-align: center;
    padding: 20px;
  }
  .game-messages {
    margin-top: 20px;
  }
  .game-messages ul {
    list-style-type: none;
    padding: 0;
  }
  </style>
  