// ===== Hamburger Menu =====
const hamburger = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  const icon = hamburger.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    const icon = hamburger.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-times');
  });
});

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
  document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Scroll Spy (Active Nav Links) =====
const sections = document.querySelectorAll('section, footer#contact');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}
window.addEventListener('scroll', updateActiveLink);
updateActiveLink();

// ===== Scroll Reveal Animation =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Hero Typing Animation =====
const typingEl = document.getElementById('typingText');
const phrases = ['Full Stack Developer', 'React & Node.js', 'MERN Stack', 'Open to Work'];
let phraseIdx = 0, charIdx = 0, isDeleting = false;

function typeEffect() {
  const current = phrases[phraseIdx];
  typingEl.textContent = isDeleting ? current.substring(0, charIdx--) : current.substring(0, charIdx++);

  if (!isDeleting && charIdx > current.length) {
    setTimeout(() => { isDeleting = true; typeEffect(); }, 1800);
    return;
  }
  if (isDeleting && charIdx < 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
  setTimeout(typeEffect, isDeleting ? 40 : 80);
}
typeEffect();

// ===== Chatbot (Groq API - llama-3.3-70b) =====
const API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const apiStatus = document.querySelector('.api-status');

let isProcessing = false;
let currentResponse = '';

const portfolioData = {
  name: "Vijaya Kumar (VK)",
  role: "Full Stack Developer",
  experience: "Internship at Cognifyz Technologies in full stack development. B.E. in Computer Science & Engineering.",
  skills: {
    frontend: ["React", "JavaScript", "Tailwind CSS", "Vue.js", "HTML5/CSS3"],
    backend: ["Node.js", "Python", "Postman", "Docker", "MongoDB"],
    tools: ["Git", "Figma", "CLI", "Jira", "GitHub"]
  },
  projects: [
    { name: "GrowthNest", description: "Rural healthcare PWA with offline-first and child growth tracking", tech: ["React", "Node.js", "Prisma", "IndexedDB"] },
    { name: "Passport Automation System", description: "Passport processing with role-based dashboards and real-time updates", tech: ["React", "MongoDB", "Socket.io", "Express"] },
    { name: "Men's Zone E-Commerce", description: "MERN stack e-commerce with auth, cart, admin dashboard", tech: ["React", "Node.js", "MongoDB", "JWT"] },
    { name: "Freelancing Platform", description: "MERN freelancing marketplace with bidding, payments, real-time chat", tech: ["React", "Node.js", "MongoDB", "Express"] }
  ],
  certifications: [
    { name: "NPTEL - Introduction to IoT", description: "IoT fundamentals, architectures, and applications." },
    { name: "Coursera - Professional & Technical IT Fundamentals", description: "Networking, security, troubleshooting, and technical support." }
  ],
  contact: { email: "vkv556528@gmail.com", linkedin: "Vijaya Kumar C", github: "VijayaKumar-064" }
};

chatbotToggle.addEventListener('click', () => chatbotContainer.classList.toggle('active'));
closeChat.addEventListener('click', () => chatbotContainer.classList.remove('active'));

function useSuggestion(text) { userInput.value = text; sendMessage(); }

async function sendMessage() {
  if (isProcessing) return;
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'bot-message');
  chatMessages.appendChild(messageDiv);

  const typingIndicator = addTypingIndicator();
  isProcessing = true;
  sendButton.disabled = true;
  currentResponse = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are a helpful portfolio assistant for Vijaya Kumar (VK), a Full Stack Developer. Here is his information: ${JSON.stringify(portfolioData)}. Answer questions professionally and concisely. If asked something outside scope, politely redirect.` },
          { role: 'user', content: message }
        ],
        temperature: 1, max_tokens: 1024, top_p: 1, stream: true
      })
    });

    if (typingIndicator) typingIndicator.remove();
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices[0]?.delta?.content || '';
            if (content) {
              currentResponse += content;
              messageDiv.textContent = currentResponse;
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          } catch (e) {}
        }
      }
    }
    apiStatus.textContent = '(llama-3.3-70b)';
    apiStatus.style.color = '#2EC4B6';
  } catch (error) {
    if (typingIndicator) typingIndicator.remove();
    messageDiv.textContent = "I'm having trouble connecting. Please try again later.";
    apiStatus.textContent = '(offline)';
    apiStatus.style.color = '#ff6b6b';
  } finally {
    isProcessing = false;
    sendButton.disabled = false;
  }
}

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('message', `${sender}-message`);
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.classList.add('typing-indicator');
  indicator.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return indicator;
}

window.sendMessage = sendMessage;
window.useSuggestion = useSuggestion;
