const toggleBtn = document.getElementById('chatbot-toggle');
const container = document.getElementById('chatbot-container');
const closeBtn = document.getElementById('close-chatbot');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('chatbot-messages');

let quickRepliesRemoved = false;

toggleBtn.addEventListener('click', () => {
    container.classList.remove('hidden');
    toggleBtn.style.transform = 'scale(0)';
    setTimeout(() => chatInput.focus(), 300);
});

closeBtn.addEventListener('click', () => {
    container.classList.add('hidden');
    toggleBtn.style.transform = 'scale(1)';
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(chatInput.value);
    }
});

sendBtn.addEventListener('click', () => {
    sendMessage(chatInput.value);
});

async function sendMessage(text) {
    if (!text.trim()) return;

    if (!quickRepliesRemoved) {
        const qr = document.querySelector('.quick-replies');
        if (qr) qr.remove();
        quickRepliesRemoved = true;
    }

    appendMessage('user', text);
    chatInput.value = '';

    const typingId = showTypingIndicator();
    scrollToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        removeTypingIndicator(typingId);

        if (data.type === 'products') {
            appendProductMessage(data.text, data.products);
        } else {
            appendMessage('bot', data.text);
        }
    } catch (error) {
        removeTypingIndicator(typingId);
        appendMessage('bot', 'Sorry, I am having trouble connecting right now.');
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function appendProductMessage(text, products) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';

    let html = `<div class="message-content">${text}`;

    products.forEach(p => {
        let platformClass = 'platform-generic';
        if (p.platform) {
            if (p.platform.toLowerCase().includes('amazon')) platformClass = 'platform-amazon';
            if (p.platform.toLowerCase().includes('flipkart')) platformClass = 'platform-flipkart';
            if (p.platform.toLowerCase().includes('myntra')) platformClass = 'platform-myntra';
            if (p.platform.toLowerCase().includes('croma')) platformClass = 'platform-croma';
        }
        
        html += `
        <div class="product-card">
            <span class="product-platform ${platformClass}" style="font-size: 0.7rem; font-weight: bold; margin-bottom: 4px; display: inline-block; padding: 2px 6px; border-radius: 4px;">${p.platform || 'Store'}</span>
            <div class="product-title">${p.name}</div>
            <div class="product-desc" style="margin-bottom: 8px;">${p.desc}</div>
            <a href="${p.link}" target="_blank" class="quick-reply" style="display:inline-block; text-align:center; text-decoration:none;">
                <i class="fa-solid fa-cart-shopping"></i> View on ${p.platform || 'Store'}
            </a>
        </div>`;
    });

    html += `</div>`;
    msgDiv.innerHTML = html;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing';
    typingDiv.id = id;
    typingDiv.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    messagesContainer.appendChild(typingDiv);
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
