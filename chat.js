import { ref, set, onValue, push, serverTimestamp, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// DOM elementleri
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messageList = document.getElementById('messageList');
const userList = document.getElementById('userList');

const database = window.db;

// Rastgele kullanıcı adı oluştur
const randomId = Math.random().toString(36).substring(7);
const userName = `Misafir${randomId}`;

// Kullanıcıyı çevrimiçi kullanıcılar listesine ekle
const userRef = ref(database, 'users/' + randomId);
set(userRef, {
    id: randomId,
    name: userName,
    lastActive: serverTimestamp()
});

// Kullanıcı sayfadan ayrıldığında
window.addEventListener('beforeunload', () => {
    set(userRef, null);
});

// Mesaj gönderme
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        const newMessage = {
            userId: randomId,
            userName: userName,
            text: message,
            timestamp: serverTimestamp()
        };

        const messagesRef = ref(database, 'messages');
        push(messagesRef, newMessage);
        messageInput.value = '';
    }
}

// Mesajları yükleme ve dinleme
const messagesRef = ref(database, 'messages');
const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));

onValue(messagesQuery, (snapshot) => {
    messageList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        displayMessage(message);
    });
    messageList.scrollTop = messageList.scrollHeight;
});

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.userId === randomId ? 'own' : ''}`;
    
    const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    messageElement.innerHTML = `
        <div class="message-content">
            ${message.userId !== randomId ? `<strong>${message.userName}</strong><br>` : ''}
            ${message.text}
        </div>
        <div class="message-info">${time}</div>
    `;

    messageList.appendChild(messageElement);
}

// Çevrimiçi kullanıcıları dinleme
const usersRef = ref(database, 'users');
onValue(usersRef, (snapshot) => {
    userList.innerHTML = '';
    
    snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        const userElement = document.createElement('li');
        userElement.textContent = user.name;
        userList.appendChild(userElement);
    });
});
