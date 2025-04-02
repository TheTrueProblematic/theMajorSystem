document.getElementById("footer-year").innerText = new Date().getFullYear();

// --- Major System Logic (Unchanged from previous version) ---
const majorSystemMap = {
    '0': ['s', 'z'], '1': ['t', 'd', 'th'], '2': ['n'], '3': ['m'], '4': ['r'],
    '5': ['l'], '6': ['j', 'sh', 'ch', 'soft g', 'dg'], '7': ['k', 'q', 'c', 'ck', 'g'],
    '8': ['v', 'f', 'ph'], '9': ['p', 'b'],
};
const digraphs = ['ch', 'sh', 'th', 'ph', 'ck', 'dg'];
const vowelsAndIgnored = ['a', 'e', 'i', 'o', 'u', 'w', 'h', 'y'];

function mapLetterToDigit(sound) {
    for (let digit in majorSystemMap) {
        if (majorSystemMap[digit].includes(sound)) {
            return digit;
        }
    }
    if (sound === 'c') return '7';
    if (sound === 'g') return '7';
    return '';
}

function getMajorSystemCode(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    let code = '';
    let i = 0;
    let lastAddedDigit = null;
    while (i < word.length) {
        let letter = word[i];
        let nextLetter = word[i + 1] || '';
        let nextNextLetter = word[i + 2] || '';
        let currentSound = '';
        let mappedDigit = '';
        let consumed = 1;
        if (vowelsAndIgnored.includes(letter)) {
            i++;
            lastAddedDigit = null;
            continue;
        }
        let threeLetters = letter + nextLetter + nextNextLetter;
        let twoLetters = letter + nextLetter;
        if (threeLetters === 'dge') {
            currentSound = 'j';
            mappedDigit = '6';
            consumed = 3;
        } else if (digraphs.includes(twoLetters)) {
            currentSound = twoLetters;
            if (currentSound === 'dg') mappedDigit = '6';
            else mappedDigit = mapLetterToDigit(currentSound);
            consumed = 2;
        } else {
            consumed = 1;
            if (letter === 'c' && ['e', 'i', 'y'].includes(nextLetter)) {
                currentSound = 's';
                mappedDigit = '0';
            } else if (letter === 'g' && ['e', 'i', 'y'].includes(nextLetter)) {
                currentSound = 'j';
                mappedDigit = '6';
            } else if (letter === 'x') {
                let k_digit = '7';
                if (k_digit !== lastAddedDigit) {
                    code += k_digit;
                    lastAddedDigit = k_digit;
                }
                let s_digit = '0';
                if (s_digit !== lastAddedDigit) {
                    code += s_digit;
                    lastAddedDigit = s_digit;
                }
                mappedDigit = null;
            } else {
                currentSound = letter;
                mappedDigit = mapLetterToDigit(currentSound);
            }
        }
        if (mappedDigit && mappedDigit !== lastAddedDigit) {
            code += mappedDigit;
            lastAddedDigit = mappedDigit;
        } else if (mappedDigit && code.length === 0) {
            code += mappedDigit;
            lastAddedDigit = mappedDigit;
        }
        i += consumed;
    }
    return code;
}

// --- End of Major System Logic ---

// --- UI Elements ---
const darkModeIcon = document.getElementById('dark-mode-icon');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const numberDisplay = document.getElementById('number-display');
const wordInput = document.getElementById('word-input');
const messageDiv = document.getElementById('message');
const digitSlider = document.getElementById('digit-slider');
const sliderValue = document.getElementById('slider-value');
let currentNumber = '';
let isDarkMode = false; // Dark mode state tracking

// --- UI Functions ---
function generateRandomNumber(digits) {
    let number = '';
    for (let i = 0; i < digits; i++) {
        number += Math.floor(Math.random() * 10).toString();
    }
    return number;
}

function updateNumber() {
    const digits = parseInt(digitSlider.value);
    currentNumber = generateRandomNumber(digits);
    numberDisplay.textContent = currentNumber;
    wordInput.value = '';
    messageDiv.textContent = '';
}

function checkWord() {
    const word = wordInput.value.trim();
    if (word === '') return;
    const generatedCode = getMajorSystemCode(word);
    if (generatedCode === currentNumber) {
        messageDiv.textContent = 'Correct!';
        messageDiv.style.color = '#4CAF50';
        setTimeout(() => {
            wordInput.value = '';
            updateNumber();
        }, 1000);
    } else {
        messageDiv.textContent = `Incorrect! "${word}" = ${generatedCode || 'nothing'}`;
        messageDiv.style.color = '#F44336';
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 2500);
    }
}

// --- Event Listeners ---
wordInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        checkWord();
    }
});

digitSlider.addEventListener('input', function () {
    const currentDigits = digitSlider.value;
    sliderValue.textContent = currentDigits;
    localStorage.setItem('majorSystemDigitCount', currentDigits);
    updateNumber();
});

darkModeToggle.addEventListener('click', function () {
    isDarkMode = !isDarkMode;
    body.classList.toggle('dark-mode');
    if (isDarkMode) {
        darkModeIcon.src = '../resources/lightMode.png';
        localStorage.setItem('majorSystemDarkMode', 'enabled');
    } else {
        darkModeIcon.src = '../resources/darkMode.png';
        localStorage.setItem('majorSystemDarkMode', 'disabled');
    }
});

// Modal functionality
const howToLink = document.getElementById('howToLink');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

howToLink.addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.display = 'block';
});

modalClose.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Close modal if clicking outside the modal-content
modal.addEventListener('click', function (e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// --- Initialization ---
function initialize() {
    const darkModePref = localStorage.getItem('majorSystemDarkMode');
    if (darkModePref === 'enabled') {
        isDarkMode = true;
        body.classList.add('dark-mode');
        darkModeIcon.src = '../resources/lightMode.png';
    } else {
        isDarkMode = false;
        body.classList.remove('dark-mode');
        darkModeIcon.src = '../resources/darkMode.png';
    }

    const storedDigits = localStorage.getItem('majorSystemDigitCount');
    const defaultDigits = 3;
    let initialDigits = defaultDigits;

    if (storedDigits) {
        const parsedValue = parseInt(storedDigits);
        const minVal = parseInt(digitSlider.min);
        const maxVal = parseInt(digitSlider.max);
        if (!isNaN(parsedValue) && parsedValue >= minVal && parsedValue <= maxVal) {
            initialDigits = parsedValue;
        }
    }

    digitSlider.value = initialDigits;
    sliderValue.textContent = initialDigits;
    updateNumber();
}

initialize();
