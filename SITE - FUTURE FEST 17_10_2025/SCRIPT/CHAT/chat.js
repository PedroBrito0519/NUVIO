// ===================== CONFIGURAÇÃO DO CHATBOT NUVY =====================

// Importa a chave de API do arquivo config.js
// (certifique-se de incluir <script src="config.js"></script> antes deste script no HTML)
const MODEL_IMAGE = "https://cdn.jsdelivr.net/gh/google/generative-ai/images/gemini-icon.png"; // imagem do modelo Gemini

// Exibe o chat quando o botão é clicado
document.getElementById('chat-button').addEventListener('click', function () {
  const chatContainer = document.getElementById('chat-container');
  const closeChatButton = document.getElementById('close-chat-button');
  if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
    chatContainer.style.display = 'block';
    closeChatButton.style.display = 'inline-block';
    showInitialOptions();
  } else {
    chatContainer.style.display = 'none';
    closeChatButton.style.display = 'none';
  }
});

// ===================== OPÇÕES INICIAIS =====================
function showInitialOptions() {
  const mensagem = 'Olá! Sou o Nuvy Bot 🤖 Como posso te ajudar hoje? Escolha uma das áreas abaixo:';
  const opcoes = ['🗂️ Armazenamento de Arquivos', '📅 Organização de Rotina', '💎 Planos', '📞 Contato'];

  addMessage(mensagem, 'bot');
  opcoes.forEach(option => addOptionButton(option));
}

// ===================== RESPOSTAS PRINCIPAIS =====================
function handleOptionClick(opcaoTexto) {
  addMessage(opcaoTexto, 'user');

  switch (opcaoTexto) {
    case '🗂️ Armazenamento de Arquivos':
      showArmazenamento();
      break;
    case '📅 Organização de Rotina':
      showOrganizacao();
      break;
    case '💎 Planos':
      showPlanos();
      break;
    case '📞 Contato':
      showContato();
      break;
    case '📧 Email':
      showEmail();
      break;
    case '📞 Telefone':
      showTelefone();
      break;
    case '💠 Plano Grátis':
      showPlanoGratis();
      break;
    case '🥈 Plano Prata':
      showPlanoPrata();
      break;
    case '💎 Plano Diamante':
      showPlanoDiamante();
      break;
    default:
      // Envia mensagem para o Gemini
      handleGeminiResponse(opcaoTexto);
  }
}

// ===================== CONTEÚDOS =====================
function showArmazenamento() {
  const message = '📁 O Nuvio permite que você **armazene arquivos com segurança na nuvem**, podendo organizá-los em pastas personalizadas e acessá-los de qualquer dispositivo. Nossa tecnologia garante **criptografia e backups automáticos**.';
  addMessage(message, 'bot');
}

function showOrganizacao() {
  const message = '🧩 Com a função **Organização de Rotina**, você pode criar tarefas, definir prioridades e acompanhar seu progresso diário. É como ter um **Notion dentro do Nuvio**, tudo integrado com seus arquivos.';
  addMessage(message, 'bot');
}

function showPlanos() {
  const message = '💎 Escolha um dos nossos planos para saber mais:';
  const opcoes = ['💠 Plano Grátis', '🥈 Plano Prata', '💎 Plano Diamante'];
  addMessage(message, 'bot');
  opcoes.forEach(option => addOptionButton(option));
}

function showContato() {
  const message = '📞 Escolha uma forma de contato:';
  const opcoes = ['📧 Email', '📞 Telefone'];
  addMessage(message, 'bot');
  opcoes.forEach(option => addOptionButton(option));
}

// Planos
function showPlanoGratis() {
  const message = '💠 **Plano Grátis:** ideal para iniciantes! Inclui 1GB de armazenamento, notas ilimitadas e sincronização com 1 dispositivo.';
  addMessage(message, 'bot');
}

function showPlanoPrata() {
  const message = '🥈 **Plano Prata:** mais espaço e recursos! 100GB de armazenamento, integração com calendário e colaboração em tempo real.';
  addMessage(message, 'bot');
}

function showPlanoDiamante() {
  const message = '💎 **Plano Diamante:** o pacote completo para equipes e empresas. Armazenamento ilimitado, automações avançadas e suporte prioritário 24/7.';
  addMessage(message, 'bot');
}

// Contato
function showEmail() {
  const message = '📧 Entre em contato pelo e-mail: **contato@nuvio.com.br**';
  addMessage(message, 'bot');
}

function showTelefone() {
  const message = '📞 Nosso número: **(11) 94315-7970**';
  addMessage(message, 'bot');
}

// ===================== CHAT GEMINI =====================
async function handleGeminiResponse(userText) {
  addModelAvatar();

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui entender sua pergunta.";
    addMessage(reply, 'bot');

  } catch (error) {
    addMessage("⚠️ Erro ao conectar à API Gemini.", 'bot');
    console.error(error);
  }
}

// Adiciona a imagem do modelo Gemini
function addModelAvatar() {
  const chatBox = document.getElementById('messages');
  const img = document.createElement('img');
  img.src = MODEL_IMAGE;
  img.alt = "Gemini Model";
  img.style.width = "45px";
  img.style.borderRadius = "50%";
  img.style.marginBottom = "5px";
  chatBox.appendChild(img);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===================== ELEMENTOS DO CHAT =====================
function addMessage(message, sender) {
  const chatBox = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addOptionButton(text) {
  const chatBox = document.getElementById('messages');
  const button = document.createElement('div');
  button.className = 'option-button';
  button.textContent = text;
  button.addEventListener('click', () => handleOptionClick(text));
  chatBox.appendChild(button);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===================== CONTROLES =====================
function resetChat() {
  document.getElementById('messages').innerHTML = '';
  showInitialOptions();
}

function closeChat() {
  document.getElementById('chat-container').style.display = 'none';
  document.getElementById('close-chat-button').style.display = 'none';
}

// Envio de mensagem via Enter
document.getElementById('user-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (text === "") return;
  addMessage(text, 'user');
  input.value = "";
  handleGeminiResponse(text);
}
