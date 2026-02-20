
// 转义 HTML，防止 XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化消息文本
function formatMessage(text) {
    if (!text) return '';
    
    // 处理标题和换行
    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        // 处理标题（**文本**）
        line = line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        return line;
    });
    
    // 将 ### 替换为换行，并确保每个部分都是一个段落
    let processedText = formattedLines.join('\n');
    let sections = processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            // 移除多余的换行和空格
            let lines = section.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) return '';
            
            // 处理每个部分
            let result = '';
            let currentIndex = 0;
            
            while (currentIndex < lines.length) {
                let line = lines[currentIndex].trim();
                
                // 如果是数字开头（如 "1.")
                if (/^\d+\./.test(line)) {
                    result += `<p class="section-title">${line}</p>`;
                }
                // 如果是小标题（以破折号开头）
                else if (line.startsWith('-')) {
                    result += `<p class="subsection"><span class="bold-text">${line.replace(/^-/, '').trim()}</span></p>`;
                }
                // 如果是正文（包含冒号的行）
                else if (line.includes(':')) {
                    let [subtitle, content] = line.split(':').map(part => part.trim());
                    result += `<p><span class="subtitle">${subtitle}</span>: ${content}</p>`;
                }
                // 普通文本
                else {
                    result += `<p>${line}</p>`;
                }
                currentIndex++;
            }
            return result;
        });
    
    return sections.join('');
}

// 显示消息
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? '/user-avatar.png' : '/bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 用户消息转义后显示，机器人消息格式化（Markdown 等）
    messageContent.innerHTML = role === 'user' ? escapeHtml(message) : formatMessage(message);
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    // 平滑滚动到底部
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

function setInputDisabled(disabled) {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('send-btn');
    if (input) input.disabled = !!disabled;
    if (btn) btn.disabled = !!disabled;
}

function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    if (inputElement && inputElement.disabled) return; // 防止重复发送
    const message = inputElement.value;
    if (!message || !String(message).trim()) return; // 空消息不发送

    displayMessage('user', message);  // 显示用户消息
    inputElement.value = ''; // 清空输入框

    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'block'; // 显示加载动画
    setInputDisabled(true); // 禁用输入框

    // 前后端连接
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(response => {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        return isJson ? response.json() : response.text().then(t => ({ _raw: t }));
    })
    .then(data => {
        if (loadingElement) loadingElement.style.display = 'none';
        setInputDisabled(false);

        if (data.message) {
            displayMessage('bot', data.message);
        } else if (data.detail) {
            let errMsg;
            if (typeof data.detail === 'string') errMsg = data.detail;
            else if (Array.isArray(data.detail) && data.detail[0] && data.detail[0].msg) errMsg = data.detail[0].msg;
            else errMsg = (data.detail && data.detail.msg) || JSON.stringify(data.detail);
            displayMessage('bot', '❌ ' + errMsg);
        } else {
            displayMessage('bot', '❌ 出错了，请稍后再试。');
        }
    })
    .catch(error => {
        if (loadingElement) loadingElement.style.display = 'none';
        setInputDisabled(false);
        displayMessage('bot', '❌ 网络或请求错误，请稍后再试。');
        console.error('Error:', error);
    });
}

// 页面加载时设置回车发送功能
document.addEventListener('DOMContentLoaded', () => {
    // Enter 发送，Shift+Enter 换行
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();  // 防止换行
                sendMessage();  // 调用发送函数
            }
        });
    }
});