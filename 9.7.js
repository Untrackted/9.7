// ИГРА В ПАРЫ/MEMORY GAME В БРАУЗЕРЕ
const GAME_TIME = 60; // секунд на партию
const TIMER_INTERVAL = 1000; // мс между тиками
const FLIP_BACK_DELAY = 800; // мс: задержка перед закрытием несовпавших карточек
const CARD_SIZE = 210; // px: размер одной карточки
const DEFAULT_SIZE = 4; // размер поля по умолчанию
const MIN_SIZE = 2; // минимальный размер поля
const MAX_SIZE = 10;  // максимальный размер поля
const INITIAL_MOVES= 0; // начальное число ходов


function createDuplicatedNumbersArr(count){
const result = [];

for(let i = 1; i <= count; i++){
    result.push(i, i);
}
return result;
}

function shuffleArr(array){
for(let i = array.length - 1; i > 0; i--){
let j = Math.floor(Math.random() * (i + 1));
      
let temp = array[i]; 
array[i] = array[j];
array[j] = temp;
}

return array; 

}

//DOM-ФАБРИКИ (DOM‑фабрики → создают элементы.)
function createTitle(){
    const title = document.createElement('h1');
    title.classList.add('game-title');
    title.textContent = 'Найди пару';
    return title;
}

function createList(){
    const list = document.createElement('ol');
    list.classList.add('list');
    return list;
}

function createCard(number){
    const item = document.createElement('li');
    item.classList.add('card');
    item.dataset.number = number; // для DevTools, querySelector, отладки
    return item;
}

function createButton(){
    const button = document.createElement('button');
    button.classList.add('btn');
    button.textContent = 'Сыграть еще раз';
    button.type = 'button';
    return button;
}


 // ЛОГИКА ДАННЫХ. Компонент данных
function createGame(pairs, size, gameContainer){ 
    gameContainer.innerHTML = '';
    const titleApp = createTitle();
    const list = createList();
    const button = createButton();
    button.style.display = 'none';
    const movesEl = document.createElement('p'); 
    const timerEl = document.createElement('p');
    timerEl.textContent = `Время: ${GAME_TIME}`;
    const statusEl = document.createElement('p');
    

    list.style.display = 'grid';
    list.style.gridTemplateColumns = `repeat(${size}, ${CARD_SIZE}px)`;

    movesEl.classList.add();
    statusEl.classList.add('status');
    movesEl.textContent = `Ходы: ${INITIAL_MOVES}`;

    button.addEventListener('click', () =>{
    startGame(size);
    });

    gameContainer.append(titleApp);
    gameContainer.append(list);
    gameContainer.append(button);
    gameContainer.append(movesEl);
    gameContainer.append(timerEl);
    gameContainer.append(statusEl);

    const duplicatedNumbersArr = createDuplicatedNumbersArr(pairs);
    const shuffled = shuffleArr(duplicatedNumbersArr); 

    //логика игры. Состояние игры (JS‑слой)
    let firstCard = null;
    let secondCard = null;
    let lock = false; 
    let matchedPairs = 0;
    let moves = INITIAL_MOVES; 
    let timeLeft = GAME_TIME; 
    let timerId = null; 
    let isFinished = false; 

    const updateTimerDisplay = () => { // отобразить текущее время
        timerEl.textContent = `Время: ${timeLeft}`;
    };

    const startTimer = () => {
        updateTimerDisplay(); 
        timerId = setInterval(() => {
            timeLeft -= 1; // уменьшить
            updateTimerDisplay(); // обновить экран
            if(timeLeft <= 0) { // время вышло?
                finishGame(false); // завершить игру (проигрыш)
            }
        }, TIMER_INTERVAL);
    }

    const stopTimer = () => {
        if(timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function finishGame(isWin){
        if(isFinished) return;
        isFinished = true;
        lock = true;
        stopTimer();

        if(isWin){
            statusEl.textContent = `Победа! Время: ${GAME_TIME - timeLeft} с.`;
            statusEl.classList.add('status--win');
        } else{
            statusEl.textContent = 'Время вышло!';
            statusEl.classList.add('status--lose');
        }
        button.style.display = '';
    }
       
    function handleCardClick(cardElement, number){ // контроллер кликов
    if(lock) return; // игра заблокирована — клики игнорируются
    if(cardElement.classList.contains('success')) return; // защита от клика по success‑карточке
    if(cardElement.classList.contains('open')) return;
    if(firstCard && firstCard.cardElement === cardElement) return;

    cardElement.classList.add('open');
    cardElement.textContent = number;

      if(!firstCard){ 
        firstCard = {cardElement, number}; 
        return;
      } 

       secondCard = {cardElement, number};
       lock = true; 
       moves++;
       movesEl.textContent= `Ходы: ${moves}`;
  
        if(firstCard.number === secondCard.number){
        firstCard.cardElement.classList.add('success');
        secondCard.cardElement.classList.add('success');
        matchedPairs++;

        firstCard = null;
        secondCard = null;

        if(matchedPairs === pairs){
            finishGame(true);
        } else {
            lock = false;
        }
        return;
    }

    setTimeout(() => { //планировщик задач
      if(!firstCard || !secondCard){ 

        lock = false;
        return;
      }
      firstCard.cardElement.classList.remove('open');
      secondCard.cardElement.classList.remove('open');

      firstCard.cardElement.textContent = ''; 
      secondCard.cardElement.textContent = '';

      firstCard = null; 
      secondCard = null;
      lock = false; 
    }, FLIP_BACK_DELAY); 
} 
     
    for(let number of shuffled){
    const card = createCard(number);
    list.append(card);
    card.addEventListener('click', () => handleCardClick(card, number));
} 
    startTimer();
}

function validateSize(value){ // утилита независима, переиспользуема, не привязана к DOM
    if(!Number.isInteger(value)) return DEFAULT_SIZE; 
    if(value < MIN_SIZE || value > MAX_SIZE) return DEFAULT_SIZE;
    if(value % 2 !== 0) return DEFAULT_SIZE; 
    return value; // иначе вернуть value
}

function initApp(){ // initApp очищает контейнер перед показом формы
   const gameContainer = document.getElementById('game');
   gameContainer.innerHTML = '';

   const {form} = createSettingsForm(startGame); 
   gameContainer.append(form);
}

function startGame(size){ 
   const gameContainer = document.getElementById('game');
   gameContainer.innerHTML = '';
   
   const totalCards = size * size; 
   const pairs = totalCards / 2; 

   createGame(pairs, size, gameContainer);
}

function createSettingsForm(startGameCallback){ 
    const form = document.createElement('form');
    const input = document.createElement('input');
    const label = document.createElement('label');
    const buttonWrapper = document.createElement('div');
    const button = document.createElement('button');

    //классы
     form.classList.add('settings-form');
     input.classList.add('input-field');
     label.classList.add('label');
     buttonWrapper.classList.add('button-wrapper');
     button.classList.add('start-button');
    
    //атрибуты
    label.textContent = 'Количество карточек по горизонтали/вертикали';
    button.textContent = 'Начать игру';
    button.type = 'submit';

    //атрибуты input
    input.type = 'number'; // тип: числовое поле
    input.min = MIN_SIZE;
    input.max = MAX_SIZE;
    input.step = 2; 
  
    input.value = DEFAULT_SIZE;
    input.required = true; 

    label.append(input);
    buttonWrapper.append(button);
    form.append(label);
    form.append(buttonWrapper);

    form.addEventListener('submit', (event) =>{
    event.preventDefault();

    const size = validateSize(Number(input.value));
    input.value = size; 
    startGameCallback(size);
    });

    return{
        form,
        label,
        input,
        button,
    }
}

initApp();

