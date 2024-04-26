
"use strict";
var key = "cheie";
var blowfishHelper = new Blowfish(key);
var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
var lastEncryptedMessage = null;

document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var messagesListContainer = document.getElementById("messagesList");
    var messageLi = document.createElement("li");
    var userDiv = document.createElement("div");
 

    if (user === document.getElementById("userInput").value) {
        messagesListContainer.style.display = "flex";
        messagesListContainer.style.justifyContent = "flex-end";
        messagesListContainer.style.flexDirection = "column";
        messageLi.style.color = "#000";
        messageLi.style.backgroundColor = "#427D9D";
        messageLi.style.borderRadius = "10px";
        messageLi.style.padding = "10px";
        messageLi.style.display = "flex";
        messageLi.style.justifyContent = "flex-end";
        messageLi.style.alignSelf = "end";
        messageLi.style.overflowWrap = "break-word";

        userDiv.style.textAlign = "right";
        userDiv.textContent = `You say: `;
    } else {
        messageLi.style.color = "#000";
        messageLi.style.backgroundColor = "#9BBEC8";
        messageLi.style.borderRadius = "10px";
        messageLi.style.padding = "10px";
        messageLi.style.marginRight = "auto";
        messageLi.style.overflowWrap = "break-word";

        userDiv.style.textAlign = "left";
        userDiv.textContent = `${user.slice(0,-10)} says: `;
    }

    messagesListContainer.appendChild(userDiv);

    var messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.overflowWrap = "break-word";
    var messageWidth = Math.min(message.length * 10, 300);
    messageDiv.style.maxWidth = messageWidth + "px";
    messageLi.appendChild(messageDiv);

    messagesListContainer.appendChild(messageLi);

    var dateDiv = document.createElement("div");
    dateDiv.style.textAlign = (user === document.getElementById("userInput").value) ? "right" : "left";
    dateDiv.style.fontSize = "12px";
    dateDiv.textContent = new Date().toLocaleString();
    messagesListContainer.appendChild(dateDiv);
});


connection.start()
    .then(function () {
        document.getElementById("sendButton").disabled = false;

        connection.on("RedirectToChat", function () {
            window.location.href = "/Home/Chat";
        });

        document.getElementById("userInput").value = userName;
    })
    .catch(function (err) {
        console.error(err.toString());
    });

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = userName;
    var plainTextMessage = document.getElementById("messageInput").value;
    var encryptedMessage = blowfishHelper.encryptECB(plainTextMessage);
    encryptedMessage = blowfishHelper.base64Encode(encryptedMessage);
    console.log(encryptedMessage);
    document.getElementById("messageInput").value = encryptedMessage;
    connection.invoke("SendMessage", user, encryptedMessage).catch(function (err) {
        return console.error(err.toString());
    });

    document.getElementById("messageInput").value = "";

    event.preventDefault();
});

document.getElementById("decryptButton").addEventListener("click", function (event) {
    var messagesList = document.getElementById("messagesList");

    var lastLi = messagesList.querySelector('li:last-of-type');
    console.log(lastLi);

    if (lastLi) {
        var encryptedMessageDiv = lastLi.querySelector('div');

        if (encryptedMessageDiv) {
            var encryptedMessage = encryptedMessageDiv.textContent.trim();

            var decryptedMessage = blowfishHelper.decryptECB(blowfishHelper.base64Decode(encryptedMessage));

            var li = document.createElement("li");

            var decryptedDiv = document.createElement("div");
            decryptedDiv.textContent = `Decrypted: ${decryptedMessage}`;
            decryptedDiv.style.textAlign = "left";

            li.appendChild(decryptedDiv);

            messagesList.appendChild(li);

            console.log(decryptedMessage);
        } else {
            console.log("No encrypted message found in the last message");
        }
    } else {
        console.log("No messages available");
    }
});




