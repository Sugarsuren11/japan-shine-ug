// Global variables
let direction = 'jp-to-mn';
let script = 'hiragana';
let mode = 'multiple-choice';
let currentWord = {};
let userAnswer = '';
let answerStatus = null;
let showAnswer = false;
let answerOptions = [];
let dictionary = [];

// DOM elements
const jpToMnBtn = document.getElementById('jp-to-mn-btn');
const mnToJpBtn = document.getElementById('mn-to-jp-btn');
const typingModeBtn = document.getElementById('typing-mode-btn');
const scriptSelection = document.getElementById('script-selection');
const currentWordEl = document.getElementById('current-word');
const wordReadingEl = document.getElementById('word-reading');
const typingSection = document.getElementById('typing-section');
const answerInput = document.getElementById('answer-input');
const feedbackMessage = document.getElementById('feedback-message');
const nextButtonContainer = document.getElementById('next-button-container');
const nextWordBtn = document.getElementById('next-word-btn');
const multipleChoiceContainer = document.getElementById('multiple-choice-container');
const choicesGrid = document.getElementById('choices-grid');
const hiraganaTab = document.getElementById('hiragana-tab');
const katakanaTab = document.getElementById('katakana-tab');
const hiraganaKeyboard = document.getElementById('hiragana-keyboard');
const katakanaKeyboard = document.getElementById('katakana-keyboard');
const backspaceBtn = document.getElementById('backspace-btn');
const checkAnswerBtn = document.getElementById('check-answer-btn');

// Initialize app
initApp();

// Initialize application
async function initApp() {
    try {
        // Load dictionary from JSON file
        await loadDictionary();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load first random word
        loadRandomWord();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Үгийн сан ачааллахад алдаа гарлаа. Хуудсыг дахин ачааллана уу.');
    }
}

// Load dictionary from JSON file
async function loadDictionary() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        dictionary = await response.json();
        console.log('Dictionary loaded successfully:', dictionary.length, 'words');
    } catch (error) {
        console.error('Error loading dictionary:', error);
        // Fallback to hardcoded dictionary if JSON fails to load
        dictionary = getHardcodedDictionary();
        console.log('Fallback dictionary loaded');
    }
}

// Fallback dictionary in case JSON loading fails
function getHardcodedDictionary() {
    return [
        { japanese: 'テレホンカード', reading: 'terehon kaado', mongolian: 'утасны карт' },
        { japanese: 'チョコレート', reading: 'chokoreeto', mongolian: 'шоколад' },
        { japanese: '勉強する', reading: 'benkyou suru', mongolian: 'суралцах' },
        { japanese: '友達', reading: 'tomodachi', mongolian: 'найз' },
        { japanese: 'ありがとう', reading: 'arigatou', mongolian: 'баярлалаа' },
        { japanese: '先生', reading: 'sensei', mongolian: 'багш' },
        { japanese: '学校', reading: 'gakkou', mongolian: 'сургууль' },
        { japanese: '水', reading: 'mizu', mongolian: 'ус' }
    ];
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Load a random word from the dictionary
function loadRandomWord() {
    if (!dictionary || dictionary.length === 0) {
        console.error('Dictionary is empty or not loaded');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * dictionary.length);
    currentWord = dictionary[randomIndex];
    userAnswer = '';
    answerStatus = null;
    showAnswer = false;
    
    // Update UI
    updateWordDisplay();
    
    // Reset the answer input if it exists
    if (answerInput) {
        answerInput.value = '';
        answerInput.classList.remove('correct', 'wrong');
    }
    
    // Hide feedback message
    feedbackMessage.style.display = 'none';
    
    // Hide next button
    nextButtonContainer.style.display = 'none';
    
    // Generate answer options for multiple choice
    generateAnswerOptions();
}

// Update the word display based on current settings
function updateWordDisplay() {
    if (mode === 'typing') {
        currentWordEl.textContent = currentWord.mongolian;
        wordReadingEl.textContent = '';
    } else if (direction === 'jp-to-mn') {
        currentWordEl.textContent = currentWord.japanese;
        wordReadingEl.textContent = currentWord.reading;
    } else { // mn-to-jp
        currentWordEl.textContent = currentWord.mongolian;
        wordReadingEl.textContent = '';
    }
}

// Generate random answer options for multiple choice
function generateAnswerOptions() {
    // Clear the existing options
    choicesGrid.innerHTML = '';
    
    // Get the correct answer
    const correctAnswer = direction === 'jp-to-mn' ? currentWord.mongolian : currentWord.japanese;
    
    // Create options array with the correct answer
    let options = [currentWord];
    
    // Add 3 random different options
    while (options.length < 4) {
        const randIndex = Math.floor(Math.random() * dictionary.length);
        const randOption = dictionary[randIndex];
        
        // Don't add duplicates
        if (!options.some(opt => opt === randOption)) {
            options.push(randOption);
        }
    }
    
    // Shuffle options
    answerOptions = shuffleArray(options);
    
    // Create buttons for each option
    answerOptions.forEach((option, index) => {
        const answer = direction === 'jp-to-mn' ? option.mongolian : option.japanese;
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(answer));
        choicesGrid.appendChild(button);
    });
}

// Check the user's answer
function checkAnswer(answer) {
    const providedAnswer = answer || (answerInput ? answerInput.value : '');
    const expectedAnswer = direction === 'jp-to-mn' ? 
        currentWord.mongolian.trim().toLowerCase() : 
        currentWord.japanese.trim();
    
    const isCorrect = providedAnswer.trim().toLowerCase() === expectedAnswer.toLowerCase();
    answerStatus = isCorrect ? 'correct' : 'wrong';
    userAnswer = providedAnswer;
    
    // Update UI based on answer
    updateUIAfterAnswer(isCorrect, providedAnswer, expectedAnswer);
    
    // Automatically load next word after a delay if correct
    if (isCorrect && mode === 'multiple-choice') {
        setTimeout(() => {
            loadRandomWord();
        }, 1500);
    }
}

// Update UI after answer is given
function updateUIAfterAnswer(isCorrect, providedAnswer, expectedAnswer) {
    // Update feedback message
    feedbackMessage.textContent = isCorrect ? 'Зөв байна!' : 'Буруу байна.';
    feedbackMessage.className = `feedback-message ${isCorrect ? 'correct' : 'wrong'}`;
    feedbackMessage.style.display = 'block';
    
    // Show correct answer if wrong
    if (!isCorrect) {
        showAnswer = true;
        const correctAnswerEl = document.createElement('p');
        correctAnswerEl.className = 'correct-answer';
        correctAnswerEl.textContent = `Зөв хариулт: ${expectedAnswer}`;
        feedbackMessage.appendChild(correctAnswerEl);
        
        // Show next button
        nextButtonContainer.style.display = 'flex';
    }
    
    // Update styling for multiple choice buttons
    if (mode === 'multiple-choice') {
        const choiceButtons = choicesGrid.querySelectorAll('.choice-btn');
        choiceButtons.forEach(button => {
            const buttonAnswer = button.textContent;
            
            if (buttonAnswer.toLowerCase() === expectedAnswer.toLowerCase()) {
                button.classList.add('correct');
            } else if (buttonAnswer === providedAnswer) {
                button.classList.add('wrong');
            }
            
            // Disable all buttons after answer
            button.disabled = true;
        });
    }
    
    // Update typing input if in typing mode
    if (mode === 'typing' && answerInput) {
        answerInput.classList.add(isCorrect ? 'correct' : 'wrong');
        
        // Show next button for typing mode
        nextButtonContainer.style.display = 'flex';
    }
}

// Set direction
function setDirection(newDirection) {
    direction = newDirection;
    
    // Update active button
    jpToMnBtn.classList.toggle('active', direction === 'jp-to-mn');
    mnToJpBtn.classList.toggle('active', direction === 'mn-to-jp');
    typingModeBtn.classList.toggle('active', mode === 'typing');
    
    // Show/hide script selection
    scriptSelection.style.display = direction === 'mn-to-jp' ? 'flex' : 'none';
}

// Set mode
function setMode(newMode) {
    mode = newMode;
    
    // Update active button
    typingModeBtn.classList.toggle('active', mode === 'typing');
    
    // Show/hide typing section and multiple choice
    typingSection.style.display = mode === 'typing' ? 'block' : 'none';
    multipleChoiceContainer.style.display = mode === 'multiple-choice' ? 'block' : 'none';
}

// Set script
function setScript(newScript) {
    script = newScript;
}

// Set keyboard tab
function setKeyboardTab(tab) {
    hiraganaTab.classList.toggle('active', tab === 'hiragana');
    katakanaTab.classList.toggle('active', tab === 'katakana');
    
    hiraganaKeyboard.style.display = tab === 'hiragana' ? 'block' : 'none';
    katakanaKeyboard.style.display = tab === 'katakana' ? 'block' : 'none';
}

// Set up event listeners
function setupEventListeners() {
    // Direction buttons
    jpToMnBtn.addEventListener('click', () => {
        setDirection('jp-to-mn');
        setMode('multiple-choice');
        loadRandomWord();
    });
    
    mnToJpBtn.addEventListener('click', () => {
        setDirection('mn-to-jp');
        setMode('multiple-choice');
        loadRandomWord();
    });
    
    typingModeBtn.addEventListener('click', () => {
        setMode('typing');
        setDirection('mn-to-jp');
        loadRandomWord();
    });
    
    // Script selection
    const scriptRadios = document.querySelectorAll('input[name="script"]');
    scriptRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            setScript(e.target.value);
            loadRandomWord();
        });
    });
    
    // Keyboard tabs
    hiraganaTab.addEventListener('click', () => {
        setKeyboardTab('hiragana');
    });
    
    katakanaTab.addEventListener('click', () => {
        setKeyboardTab('katakana');
    });
    
    // Character buttons
    const charButtons = document.querySelectorAll('.char-btn');
    charButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (answerInput) {
                answerInput.value += button.textContent;
            }
        });
    });
    
    // Backspace button
    backspaceBtn.addEventListener('click', () => {
        if (answerInput) {
            answerInput.value = answerInput.value.slice(0, -1);
        }
    });
    
    // Check answer button
    checkAnswerBtn.addEventListener('click', () => {
        checkAnswer();
    });
    
    // Next word button
    nextWordBtn.addEventListener('click', () => {
        loadRandomWord();
    });
    
    // Answer input enter key
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
}

// Function to add new words to dictionary
function addNewWord(japanese, reading, mongolian) {
    const newWord = { 
        japanese: japanese, 
        reading: reading, 
        mongolian: mongolian 
    };
    
    // Add to dictionary
    dictionary.push(newWord);
    
    // Optional: Save to localStorage as backup
    saveDictionaryToLocalStorage();
    
    console.log('New word added:', newWord);
    return newWord;
}

// Save dictionary to localStorage
function saveDictionaryToLocalStorage() {
    try {
        localStorage.setItem('jpMnDictionary', JSON.stringify(dictionary));
        console.log('Dictionary saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Export dictionary as JSON file
function exportDictionary() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dictionary, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "japanese_mongolian_dictionary.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Import dictionary from user's JSON file
function importDictionary(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate data structure
            if (Array.isArray(importedData) && 
                importedData.length > 0 && 
                importedData[0].japanese && 
                importedData[0].mongolian) {
                
                dictionary = importedData;
                saveDictionaryToLocalStorage();
                loadRandomWord(); // Refresh with new dictionary
                
                alert(`Амжилттай импортлолоо: ${dictionary.length} үг`);
            } else {
                alert('Буруу формат бүхий файл. JSON файл нь [{japanese, reading, mongolian}] бүтэцтэй байх ёстой.');
            }
        } catch (error) {
            console.error('Error importing dictionary:', error);
            alert('Файл импортлоход алдаа гарлаа. Зөв JSON файл эсэхийг шалгана уу.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}
