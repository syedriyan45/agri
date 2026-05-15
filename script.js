// Market Price Mock Data
const marketPrices = [
    { crop: 'Wheat (Sharbati)', price: '₹2,450 / qtl', trend: 'up', location: 'Nagpur Mandi' },
    { crop: 'Cotton (Long Staple)', price: '₹7,100 / qtl', trend: 'up', location: 'Amravati Mandi' },
    { crop: 'Soybean', price: '₹4,300 / qtl', trend: 'down', location: 'Akola Mandi' },
    { crop: 'Tur (Arhar)', price: '₹8,200 / qtl', trend: 'up', location: 'Wardha Mandi' }
];

function renderMarketPrices() {
    const priceList = document.getElementById('price-list');
    
    marketPrices.forEach(item => {
        const trendIcon = item.trend === 'up' ? '↑' : '↓';
        const card = document.createElement('div');
        card.className = 'price-card';
        
        card.innerHTML = `
            <div class="crop-info">
                <h4>${item.crop}</h4>
                <p>${item.location}</p>
            </div>
            <div class="price-trend">
                <div class="price">${item.price}</div>
                <div class="trend ${item.trend}">${trendIcon} ${item.trend === 'up' ? '+1.2%' : '-0.5%'}</div>
            </div>
        `;
        
        priceList.appendChild(card);
    });
}

// Voice Assistant Logic
const voiceBtn = document.getElementById('voice-btn');
const voiceTooltip = document.getElementById('voice-tooltip');
const voiceTranscript = document.getElementById('voice-transcript');
const voiceResponse = document.getElementById('voice-response');

let recognition;
let isListening = false;

// Initialize Speech Recognition
function initSpeechRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (window.SpeechRecognition) {
        recognition = new window.SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // English India (for testing, would support Hindi etc. in prod)

        recognition.onstart = () => {
            isListening = true;
            voiceBtn.classList.add('listening');
            voiceTooltip.classList.add('active');
            voiceTranscript.textContent = "Listening...";
            voiceResponse.textContent = "";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            voiceTranscript.textContent = `"${transcript}"`;
            processCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            voiceTranscript.textContent = "Error listening. Please try again.";
            stopListening();
        };

        recognition.onend = () => {
            stopListening();
        };
    } else {
        voiceBtn.style.display = 'none'; // Hide if browser doesn't support
        console.warn("Speech Recognition API not supported in this browser.");
    }
}

function stopListening() {
    isListening = false;
    voiceBtn.classList.remove('listening');
    if(recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }
    
    // Hide tooltip after a few seconds if not speaking
    setTimeout(() => {
        if(!window.speechSynthesis.speaking) {
            voiceTooltip.classList.remove('active');
        }
    }, 5000);
}

function processCommand(text) {
    let responseText = "";
    
    if (text.includes('wheat') || text.includes('price')) {
        responseText = "The highest price for Wheat today is 2,450 rupees per quintal at Nagpur Mandi. The trend is up by 1.2 percent.";
    } else if (text.includes('weather') || text.includes('rain')) {
        responseText = "There is a heavy rain alert for Vidarbha region. Expect 40 millimeters of rainfall in the next 48 hours. It is advised to postpone cotton sowing.";
    } else if (text.includes('scheme') || text.includes('government')) {
        responseText = "Based on your profile, you are eligible for the PM-Kisan Samman Nidhi scheme. Would you like me to help you apply?";
    } else if (text.includes('cotton') || text.includes('disease')) {
        responseText = "Your recent crop photo indicates Cotton Leaf Curl Virus. Please visit the advisory section for recommended treatments.";
    } else {
        responseText = "I am Annadata's voice assistant. You can ask me about market prices, weather updates, or government schemes.";
    }
    
    voiceResponse.textContent = responseText;
    speak(responseText);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 1.0;
        
        utterance.onend = () => {
            setTimeout(() => {
                voiceTooltip.classList.remove('active');
            }, 2000);
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderMarketPrices();
    initSpeechRecognition();
    
    if(voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                stopListening();
                window.speechSynthesis.cancel();
            } else {
                try {
                    window.speechSynthesis.cancel(); // Stop any current speaking
                    recognition.start();
                } catch(e) {
                    console.error("Could not start recognition", e);
                }
            }
        });
    }
});
