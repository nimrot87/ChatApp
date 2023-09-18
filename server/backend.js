const WebSocket = require("ws");
const redis = require("redis");
let redisClient;

let clients = [];
let messageHistory = [];

// Intiiate the websocket server
const initializeWebsocketServer = async (server) => {
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || "6379",
    },
  });
  await redisClient.connect();

  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);
  websocketServer.on("error", console.error);
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws) => {
  console.log("New websocket connection");
  ws.on("close", () => onClose(ws));
  ws.on("message", (message) => onClientMessage(ws, message));
  // TODO: Send all connected users and current message history to the new client !!CHECK!!
  const users = clients.map((client) => client.user);
  ws.send(JSON.stringify({ type: "user", message: users }));
  const history = getMessageHistory();
  if (history) {
    ws.send(JSON.stringify({ type: "message", message: history }));
  }
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = async (ws, message) => {
  const messageObject = JSON.parse(message);
  console.log("Received message from client: " + messageObject.type);
  switch (messageObject.type) {
    case "pong":
      console.log("Received from client: " + messageObject.data);
      break;
    case "user":
      // Add user to the list of clients
      const newUser = messageObject.user;
      clients.push({ ws, user: newUser });
      // Publish all connected users to all connected clients
      const users = clients.map((client) => client.user);
      clients.forEach((client) => {
        client.ws.send(JSON.stringify({ type: "user", message: users }));
      });
      break;
    case "message":
      // Publish new message to all connected clients and save in redis
      const newMessage = messageObject.message;
      messageHistory.push(newMessage);
      setMessageHistory(messageHistory);
      clients.forEach((client) => {
        client.ws.send(JSON.stringify({ type: "message", message: newMessage }));
      });
      break;
    default:
      console.error("Unknown message type: " + messageObject.type);
  }
};

// If a connection is closed, the onClose function is called
const onClose = async (ws) => {
  console.log("Websocket connection closed");
  // TODO: Remove related user from connected users and propagate new list
};

const getMessageHistory = async () => {
  return await redisClient.get("messageHistory");
};

const setMessageHistory = async (messageHistory) => {
  await redisClient.set("messageHistory", messageHistory);
};

module.exports = { initializeWebsocketServer };
