<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lobby Management</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="lobby-management">
        <h1>Lobby Management</h1>
        <div class="input-group">
          <input v-model="lobbyId" placeholder="Lobby ID" />
          <div class="buttons">
            <ion-button @click="createLobby">Lobby erstellen</ion-button>
            <ion-button @click="joinLobby">Lobby beitreten</ion-button>
          </div>
        </div>

        <p class="server-message">{{ serverMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import Lobby from './Lobby.vue';
</script>

<script>
export default {
  data() {
    return {
      socket: null,
      isCreator: false,
      lobbyId: "",
      serverMessage: "",
      clientId: "", // Hier wird die UUID gespeichert
    };
  },
  mounted() {
    // Verbindet den Client mit dem WebSocket-Server
    this.socket = new WebSocket("ws://localhost:8080/echo");

    this.socket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    this.socket.onmessage = (event) => {
      const message = event.data;

      // Wenn die Nachricht eine UUID enthält, speichere die UUID
      if (message.startsWith("UUID")) {
        this.clientId = message.substring(5);  // UUID von der Nachricht extrahieren
        console.log("Client received UUID: " + this.clientId);
      }

      if (message.startsWith("LOBBY_CREATED")) {
        // Redirect the client to the /lobby route and pass lobbyId and clientId
        this.isCreator = true; // Der Spieler hat die Lobby erstellt
        this.$router.push({ name: "LobbyView", params: { lobbyId: this.lobbyId}, query: { clientId: this.clientId }  });
      } else if (message.startsWith("LOBBY_JOINED")) {
        // Redirect the client to the /lobby route and pass lobbyId and clientId
        this.$router.push({ name: "LobbyView", params: { lobbyId: this.lobbyId}, query: { clientId: this.clientId }  });
      } else {
        this.serverMessage = message;
      }
    };
  },
  methods: {
    createLobby() {
      this.lobbyId = this.generateRandomId(8);
      if (this.lobbyId) {
        // Sende die CREATE_LOBBY Nachricht an den WebSocket-Server
        this.socket.send("CREATE_LOBBY " + this.lobbyId);
      } else {
        this.serverMessage = "Lobby ID cannot be empty.";
      }
    },
    joinLobby() {
      if (this.lobbyId) {
        // Sende die JOIN_LOBBY Nachricht an den WebSocket-Server
        this.socket.send("JOIN_LOBBY " + this.lobbyId);
      } else {
        this.serverMessage = "Lobby ID cannot be empty.";
      }
    },
    generateRandomId(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
  }

};

</script>



<style scoped>
.lobby-management {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f4f8;
  font-family: Arial, sans-serif;
  color: #333;
}

h1 {
  margin-bottom: 20px;
  font-size: 2em;
  color: #007bff;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

input {
  padding: 10px;
  width: 100%;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 1em;
  color: white;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.server-message {
  margin-top: 20px;
  font-size: 1.2em;
  color: #dc3545;
}

@media (max-width: 600px) {
  .input-group {
    width: 90%;
  }

  button {
    width: 100%;
  }
}
</style>
