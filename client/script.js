if (location.host.includes("localhost")) {
  // Load livereload script if we are on localhost
  document.write(
    '<script src="http://' +
      (location.host || "localhost").split(":")[0] +
      ':35729/livereload.js?snipver=1"></' +
      "script>"
  );
}
const backendUrl = window.location.origin
  .replace(/^http/, "ws")
  .replace(/^https/, "wss");
const socket = new WebSocket(backendUrl);

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!! DON'T TOUCH ANYTHING ABOVE THIS LINE !!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

socket.addEventListener("open", async (event) => {
  console.log("WebSocket connected!");
  const user = document.getElementById("username").value = user.name.first;
  const message = {
    type: "user",
    user: {
      //id: userId,
      name: document.getElementById("username").value,
    },
  };
  // TODO: create message object to transmit the user to the backend   !!CHECK!!
  socket.send(JSON.stringify(message));
});

socket.addEventListener("message", (event) => {
  const messageObject = JSON.parse(event.data);
  console.log("Received message from server: " + messageObject.type);
  switch (messageObject.type) {
    case "ping":
      socket.send(JSON.stringify({ type: "pong", data: "FROM CLIENT" }));
    case "users":
      showUsers(messageObject.users); //CHECK
      break;
    case "message":
      showMessage(messageObject.message); //Check
      break;
    default:
      console.error("Unknown message type: " + messageObject.type);
  }
});

function showUsers(users) {
  // TODO: Show the current users as DOM elements !!CHECK!!
  const usersElement = document.getElementById("users");
  usersElement.innerHTML = "";
  users.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.innerHTML = "🟢 " + user.name;
    usersElement.appendChild(userElement);
  });
}

function showMessage(message) {
  // TODO: Show new message as DOM element append to chat history
}

socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

function changeUsername() {
  const newUsername = document.getElementById("username").value;
  if (newUsername === "") return;
  const message = {
    type: "user",
    user: {
      //id: userId,
      name: document.getElementById("username").value,
    },
  };
  console.log(message);
  socket.send(JSON.stringify(message));
}

function sendMessage() {
  const messageText = document.getElementById("message").value;
  if (messageText === "") return;
  const message = {
    type: "message",
    message: {
      user: {
        //id: userId,
        name: document.getElementById("username").value,
      },
      message: messageText,
      time: new Date().toLocaleTimeString(),
    },
  };
  console.log(message);
  socket.send(JSON.stringify(message));
  document.getElementById("message").value = "";
};