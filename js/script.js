const gridSize = 20; // Tamaño de la cuadrícula
const sopaLetras = document.getElementById('sopa-letras');
const wordListElement = document.getElementById('words');
const timeBtn = document.getElementById('time-btn');
const clicksBtn = document.getElementById('clicks-btn');
const wordsCounterBtn = document.getElementById('words-counter-btn');

// Lista de palabras a ocultar (actualizada con 7 palabras adicionales)
const words = [
    'ISTAK', 'TLILTIK', 'XOCHITL', 'KOYOTIK', 'CHICHILTIK',
    'MAITL', 'AMATL', 'METZINTLE', 'TONALTSIN', 'CHAPULIN',
    'COATL', 'KIMICHI', 'MAZATL', 'KUAUTLI', 'TOCHTLE',
    'CHICHI', 'NANAKATL', 'EJEKATL', 'TLETL', 'MIKO'
];

let startTime;
let elapsedTime = 0;
let timerInterval;
let clicks = 0;
let wordsFound = 0;

// Crear la cuadrícula vacía
const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));

// Función para generar una letra aleatoria
function getRandomLetter() {
    const letters = 'ACEHIJKLMNOPSTUXY';
    return letters[Math.floor(Math.random() * letters.length)];
}

// Función para colocar una palabra en la cuadrícula
function placeWord(word) {
    const wordArr = word.split('');
    let placed = false;
    while (!placed) {
        const direction = Math.floor(Math.random() * 2); // 0 = horizontal, 1 = vertical
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        
        let canPlace = true;
        for (let i = 0; i < wordArr.length; i++) {
            const r = direction === 0 ? row : row + i;
            const c = direction === 0 ? col + i : col;
            if (r >= gridSize || c >= gridSize || (grid[r][c] && grid[r][c] !== wordArr[i])) {
                canPlace = false;
                break;
            }
        }
        
        if (canPlace) {
            for (let i = 0; i < wordArr.length; i++) {
                const r = direction === 0 ? row : row + i;
                const c = direction === 0 ? col + i : col;
                grid[r][c] = wordArr[i];
            }
            placed = true;
        }
    }
}

// Colocar todas las palabras en la cuadrícula
words.forEach(word => placeWord(word));

// Rellenar la cuadrícula con letras aleatorias
for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
        if (!grid[r][c]) {
            grid[r][c] = getRandomLetter();
        }
    }
}

// Crear la cuadrícula en el HTML
function createGrid() {
    grid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.addEventListener('click', () => {
                if (!cell.classList.contains('correct')) {  // Impedir deselección si es parte de una palabra correcta
                    cell.classList.toggle('selected');
                    checkWords();
                    startTimer();  // Iniciar el temporizador al hacer clic en la primera letra
                    updateClickCounter(); // Actualizar contador de clics
                }
            });
            sopaLetras.appendChild(cell);
        });
    });
}

// Verificar si alguna palabra está formada
function checkWords() {
    const cells = document.querySelectorAll('.cell');
    
    words.forEach(word => {
        const positions = findWord(word);
        if (positions.length > 0) {
            let allSelected = true;
            positions.forEach(([r, c]) => {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (!cell.classList.contains('selected')) {
                    allSelected = false;
                }
            });
            
            if (allSelected) {
                // Marcar las celdas de la palabra encontrada como correctas
                positions.forEach(([r, c]) => {
                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cell) {
                        cell.classList.add('correct');
                        cell.classList.remove('selected');  // Bloquear la celda
                    }
                });
                // Actualizar la lista de palabras
                updateWordList(word);
                wordsFound += 1;
                updateWordsCounter();
                checkAllWordsFound();
            }
        }
    });
}

// Encontrar las posiciones de una palabra en la cuadrícula
function findWord(word) {
    const wordArr = word.split('');
    const positions = [];
    
    // Horizontal
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c <= gridSize - wordArr.length; c++) {
            if (wordArr.every((letter, index) => grid[r][c + index] === letter)) {
                wordArr.forEach((_, index) => positions.push([r, c + index]));
                return positions;
            }
        }
    }
    
    // Vertical
    for (let c = 0; c < gridSize; c++) {
        for (let r = 0; r <= gridSize - wordArr.length; r++) {
            if (wordArr.every((letter, index) => grid[r + index][c] === letter)) {
                wordArr.forEach((_, index) => positions.push([r + index, c]));
                return positions;
            }
        }
    }
    
    return positions;
}

// Actualizar la lista de palabras con un check al lado de las encontradas
function updateWordList(word) {
    const listItems = document.querySelectorAll('#words li');
    listItems.forEach(item => {
        if (item.textContent.startsWith(word)) {
            item.innerHTML = `${word} <span class="check">&#10003;</span>`; // Check mark
        }
    });
}

// Actualizar el contador de palabras encontradas
function updateWordsCounter() {
    wordsCounterBtn.textContent = `Palabras: ${wordsFound}/${words.length}`;
}

// Verificar si se han encontrado todas las palabras
function checkAllWordsFound() {
    if (wordsFound === words.length) {
        stopTimer(); // Detener el temporizador cuando se encuentren todas las palabras
        alert('¡Felicidades! Has encontrado todas las palabras.');
    }
}

// Iniciar el temporizador
function startTimer() {
    if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
            const seconds = String(elapsedTime % 60).padStart(2, '0');
            timeBtn.textContent = `Tiempo: ${minutes}:${seconds}`;
        }, 1000);
    }
}

// Detener el temporizador
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Actualizar el contador de clics
function updateClickCounter() {
    clicks += 1;
    clicksBtn.textContent = `Clics: ${clicks}`;
}

// Inicializar la cuadrícula y la lista de palabras al cargar la página
createGrid();

// Mostrar la lista de palabras en el HTML
words.forEach(word => {
    const listItem = document.createElement('li');
    listItem.textContent = word;
    wordListElement.appendChild(listItem);
});
