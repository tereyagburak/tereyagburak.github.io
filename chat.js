import { ref, set, onValue, push, onDisconnect, serverTimestamp, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// DOM elementleri
const loginSection = document.getElementById('loginSection');
const chatSection = document.getElementById('chatSection');
const nameInput = document.getElementById('nameInput');
const loginBtn = document.getElementById('loginBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messageList = document.getElementById('messageList');
const userList = document.getElementById('userList');
const userNameDisplay = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;
const database = window.db;

// Giriş işlemi
loginBtn.addEventListener('click', () => {
    const username = nameInput.value.trim();
    if (username) {
        currentUser = {
            id: Date.now().toString(),
            name: username,
            lastActive: serverTimestamp()
        };

        // Kullanıcıyı çevrimiçi kullanıcılar listesine ekle
        const userRef = ref(database, 'users/' + currentUser.id);
        set(userRef, currentUser);
        
        // Kullanıcı çıkış yaptığında veya bağlantı koptuğunda
        onDisconnect(userRef).remove();

        // Arayüzü güncelle
        loginSection.style.display = 'none';
        chatSection.style.display = 'flex';
        userNameDisplay.textContent = username;
        logoutBtn.style.display = 'block';
        
        // Son mesajları yükle
        loadMessages();
    }
});

// Çıkış işlemi
logoutBtn.addEventListener('click', () => {
    if (currentUser) {
        const userRef = ref(database, 'users/' + currentUser.id);
        set(userRef, null);
        currentUser = null;
        loginSection.style.display = 'block';
        chatSection.style.display = 'none';
        userNameDisplay.textContent = '';
        logoutBtn.style.display = 'none';
        messageList.innerHTML = '';
        nameInput.value = '';
    }
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
    if (message && currentUser) {
        const newMessage = {
            userId: currentUser.id,
            userName: currentUser.name,
            text: message,
            timestamp: serverTimestamp()
        };

        const messagesRef = ref(database, 'messages');
        push(messagesRef, newMessage);
        messageInput.value = '';
    }
}

// Mesajları yükleme ve dinleme
function loadMessages() {
    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));
    
    onValue(messagesQuery, (snapshot) => {
        messageList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            displayMessage(message);
        });
    });
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.userId === currentUser?.id ? 'own' : ''}`;
    
    const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    messageElement.innerHTML = `
        <div class="message-content">
            ${message.userId !== currentUser?.id ? `<strong>${message.userName}</strong><br>` : ''}
            ${message.text}
        </div>
        <div class="message-info">${time}</div>
    `;

    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
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
