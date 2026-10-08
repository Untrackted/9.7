// ИГРА В ПАРЫ/MEMORY GAME В БРАУЗЕРЕ
const GAME_TIME = 60; // секунд на партию
const TIMER_INTERVAL = 1000; // мс между тиками
const FLIP_BACK_DELAY = 800; // мс: задержка перед закрытием несовпавших карточек
const CARD_SIZE = 210; // px: размер одной карточки
const DEFAULT_SIZE = 4; // размер поля по умолчанию
const MIN_SIZE = 2; // минимальный размер поля
const MAX_SIZE = 10;  // максимальный размер поля
const INITIAL_MOVES= 0; // начальное число ходов

// КОМПОНЕНТ 1 — генератор массива парных чисел. Он делает одну задачу: создаёт данные.
// Функция, генерирующая массив парных чисел
function createDuplicatedNumbersArr(count){
// Объявляем функцию с именем createDuplicatedNumbersArr,
// она принимает один параметр count — это количество чисел,
// которые нужно сгенерировать (от 1 до count).
const result = [];
// Создаём пустой массив result, сюда будем складывать итоговые значения.

for(let i = 1; i <= count; i++){
    // Запускаем цикл for.
    // i — счётчик цикла, начинается с 1.
    // Условие i <= count означает:
    // пока i меньше или равно значению count, цикл продолжается.
    // На каждом шаге i увеличивается на 1 (i++).
    result.push(i, i);
    // На каждом шаге цикла добавляем в массив result
    // два одинаковых значения: i и i.
    // Например, при i = 1 → добавляем [1, 1],
    // при i = 2 → добавляем [2, 2], и так далее.
    // В итоге каждое число от 1 до count будет в массиве два раза подряд.
}
return result;   // Возвращаем готовый массив result из функции.
}

//КОМПОНЕНТ 2 — перемешивание массива. Он делает одну задачу: перемешивает данные.
//Функция перемешивания массива с  помощью алгоритма Фишера — Йетса (Fisher — Yates)
function shuffleArr(array){
for(let i = array.length - 1; i > 0; i--){
    // Запускаем цикл от последнего индекса массива к первому.
    // Почему array.length - 1?
    // Потому что последний индекс массива — это длина минус 1.
    // Например, длина 8 → последний индекс 7. (элементов больше чем индексов, элементов 8, а индексов 7, так начинаем с 0 до 7)

    // Почему i > 0?
    // Когда i станет 0, менять местами уже нечего — последний элемент
    // уже перемешан, и 0-й элемент автоматически окажется на случайном месте.
    // Когда i становится 0, цикл останавливается. i > 0

    // Почему i--, а не i++?
    // Алгоритм Фишера–Йетса работает ТОЛЬКО при движении назад:
    // - мы берём текущий элемент array[i]
    // - выбираем случайный индекс j от 0 до i
    // - меняем местами array[i] и array[j]
    // Если идти вперёд (i++), то диапазон случайных индексов был бы неправильным,
    // и перемешивание стало бы НЕравномерным (bias). bias = смещение вероятностей, неравномерность случайности.
    // В shuffle это означает, что массив перемешан не честно, и некоторые варианты появляются чаще других.

    // мы должны идти от конца к началу
    // на каждом шаге диапазон случайных индексов должен быть [0..i]
    // если идти вперёд, диапазон бы рос, а не уменьшался
let j = Math.floor(Math.random() * (i + 1));
    // Генерируем случайный индекс j от 0 до i включительно.
    // Math.random() → число от 0 до 1.
    // Умножаем на (i + 1), чтобы получить диапазон [0..i].
    // Math.floor округляет вниз до целого.

      //  [arr[i], arr[j]] = [arr[j], arr[i]]; // современный swap через деструктуризацию без временной переменной temp
      // Левая часть — куда записываем
      // Правая часть — что записываем
      // JS делает примерно следующее:
      // 1. Создаёт временный массив справа: [array[j], array[i]]
      // 2. Раскладывает его по левым переменным: array[i], array[j]
      // 3. Меняет значения местами
      // То есть временная переменная всё равно существует — просто ты её не пишешь вручную.
      
let temp = array[i]; // JS автоматически создаёт временный буфер внутри операции
    // Сохраняем значение array[i] во временную переменную temp,
    // чтобы не потерять его при обмене.
array[i] = array[j];
    // Перезаписываем array[i] значением array[j].
    // Первый шаг обмена.
array[j] = temp;
    // Записываем в array[j] старое значение array[i] из temp.
    // Второй шаг обмена — swap(обмен значениями) завершён.
    // Это и есть swap — обмен местами.
}

return array; // Возвращаем перемешанный массив

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
function createGame(pairs, size, gameContainer){ // хранит состояние игры. 
    // Объявляем createGame, принимает: pairs — число пар, size — размер поля, gameContainer — DOM-контейнер.
    gameContainer.innerHTML = ''; //  очищаем контейнер
    const titleApp = createTitle(); // создаём заголовок через фабрику.
    const list = createList();
    const button = createButton();
    button.style.display = 'none';
    const movesEl = document.createElement('p'); // moves element. Создаём <p> для счётчика ходов.
    const timerEl = document.createElement('p'); // создаём <p> для таймера
    timerEl.textContent = `Время: ${GAME_TIME}`;
    const statusEl = document.createElement('p'); //  создаём <p> для статуса.
    

    list.style.display = 'grid'; // включаем CSS Grid для списка
    list.style.gridTemplateColumns = `repeat(${size}, ${CARD_SIZE}px)`; // задаём size колонок по CARD_SIZE пикселей. Квадратное поле size × size.

    statusEl.classList.add('status');
    movesEl.textContent = `Ходы: ${INITIAL_MOVES}`; //  задаём начальный текст счётчика.

    button.addEventListener('click', () =>{
    startGame(size); // вызываем startGame(size) - начать новую партию с тем же размером.
    });

    gameContainer.append(titleApp);
    gameContainer.append(list);
    gameContainer.append(button);
    gameContainer.append(movesEl);
    gameContainer.append(timerEl);
    gameContainer.append(statusEl);

    // Это и есть корректная связка двух функций: 
    // const duplicatedNumbersArr = createDuplicatedNumbersArr(pairs);
    // const shuffled = shuffleArr(duplicatedNumbersArr);

    const duplicatedNumbersArr = createDuplicatedNumbersArr(pairs); // создаём массив парных чисел (pairs пар). Например, pairs = 8 → [1,1,2,2,...,8,8].
    const shuffled = shuffleArr(duplicatedNumbersArr); // функция shuffleArr(array) получает массив парных чисел в момент вызова, 
    // и дальше работает только с тем массивом, который ей передали. Внутри функции shuffleArr(array) параметр array
    // Это делает код чистым, предсказуемым и безопасным. Это и есть правильная, чистая архитектура.
    // становится ссылкой на тот массив, который ей передали. Т. е. функция работает не с глобальными переменными, а с тем, что ей передали. 
    // параметры функции — это локальные переменные, которые получают значения из аргументов вызова.
    // duplicatedNumbersArr → аргумент
    // array → параметр
    // параметр получает значение аргумента
    // Это базовый механизм передачи данных в функции.

    //логика игры. Состояние игры (JS‑слой)
    let firstCard = null; // переменная для первой открытой карточки. Хранит {cardElement, number}.
    let secondCard = null;
    let lock = false; // lock — это флаг, который временно запрещает клики, чтобы игра не ломалась, флаг блокировки
    let matchedPairs = 0; // счётчик найденных пар.
    let moves = INITIAL_MOVES; //Счётчик ходов показывает сколько попыток понадобилось, чтобы пройти игру.
    let timeLeft = GAME_TIME; //сколько осталось - меняется каждый тик
    let timerId = null; //id интервала - чтобы потом остановить через clearInterval
    let isFinished = false; // флаг завершения - чтобы не запускать дважды

    const updateTimerDisplay = () => { // отобразить текущее время
        timerEl.textContent = `Время: ${timeLeft}`;
    };

    const startTimer = () => { // стрелочная функция для запуска таймера
        updateTimerDisplay(); // показать стартовое значение.  Это делается до запуска интервала,
        // чтобы пользователь сразу увидел стартовое значение, а не ждал первую секунду.
        timerId = setInterval(() => { // это встроенная функция браузера. Она нужна, чтобы выполнять какую-то функцию регулярно, через равные промежутки времени.
            timeLeft -= 1; // уменьшить
            updateTimerDisplay(); // обновить экран
            if(timeLeft <= 0) { // время вышло?  Если время истекло (стало равно нулю или меньше — на случай, если из-за задержек перескочило через ноль),
                // то пора завершать игру.
                finishGame(false); // завершить игру (проигрыш).
            }
        }, TIMER_INTERVAL);
    }

    // Эта функция идемпотентна: сколько бы раз ты её ни вызвал — результат один и тот же.
    const stopTimer = () => {
        if(timerId !== null) {
        // Проверка: не равен ли timerId значению null. Это защита от «двойной остановки». 
        // Смысл: если таймер сейчас не запущен (timerId === null), то и останавливать нечего — просто ничего не делаем. 
        // Если же timerId содержит число (id активного интервала) — значит, таймер работает, и его нужно остановить.
            clearInterval(timerId); // ← останавливаем по тому же id
        // Останавливаем активный интервал. clearInterval — встроенная функция, которая прекращает вызовы колбэка, 
        // ранее зарегистрированного через setInterval. Мы передаём ей сохранённый timerId — тот самый номер, 
        // который вернул setInterval в startTimer. После этой строки колбэк (timeLeft -= 1; updateTimerDisplay(); ...) больше никогда не вызовется.
            timerId = null; // ← сбрасываем, чтобы не остановить дважды
        // Сбрасываем timerId в null. Это важно по двум причинам:
        // Сигнал «таймер не работает». Теперь условие if(timerId !== null) при следующем вызове stopTimer не пройдёт — 
        // и мы не будем пытаться останавливать уже остановленный интервал.
        // Защита от ошибок. Если бы мы оставили старое число в timerId, то при повторном clearInterval(timerId) браузер ничего страшного не сделал бы 
        // (это безопасно), но логика кода стала бы запутанной — непонятно, работает таймер или нет. 
        }
    }

    function finishGame(isWin){
        if(isFinished) return; // Проверка «не завершена ли игра уже?». isFinished — это флаг состояния игры
        // Если игра уже была завершена ранее — выходим из функции немедленно через return (ничего не делаем). Зачем? Это защита от повторного завершения
        // Функция finishGame может быть вызвана из нескольких мест: из startTimer при timeLeft <= 0, из обработчика клика (если игрок нашёл все пары), 
        // из кнопки «сдаться» и т.д. Без этой проверки игра могла бы «завершиться» несколько раз — статус перезаписался бы, классы навесились повторно, 
        // сообщение поменялось. Это тот же идемпотентный принцип, что и в stopTimer: повторный вызов не должен ничего ломать.
        isFinished = true;
        // Устанавливаем флаг isFinished в true — «игра завершена». С этого момента все последующие вызовы finishGame будут сразу выходить на строке 2. 
        // То есть мы «защёлкиваем» состояние: игра может завершиться только один раз за партию.
        lock = true; 
        //  Ставим флаг lock в true. Это блокировка пользовательского ввода. 
        // Смысл: после окончания игры игрок больше не может переворачивать карточки. Это логично — игра кончилась, зачем что-то кликать? 
        // Без этого флага можно было бы продолжать открывать карточки уже после проигрыша, что выглядело бы странно и могло бы сломать логику.
        stopTimer();
        // Вызываем stopTimer() — останавливаем интервал, который тикал в startTimer. Вот здесь-то и происходит связь с предыдущей функцией:
        // В startTimer был создан интервал через setInterval, и его id сохранён в timerId.
        // Теперь stopTimer() находит этот id, вызывает clearInterval(timerId) и сбрасывает timerId = null.
        // Тики прекращаются. timeLeft больше не уменьшается. updateTimerDisplay больше не вызывается.

        if(isWin){ // Проверяем, победил ли игрок. Ветвление:
            // true → показываем сообщение о победе;
            statusEl.textContent = `Победа! Время: ${GAME_TIME - timeLeft} с.`;
            // сколько времени потратил игрок. Если GAME_TIME = 60, а timeLeft = 37, значит, игрок управился за 23 секунды.
            // Это классический приём: таймер идёт вниз (от GAME_TIME к 0), а мы вычисляем прошедшее время как разность. 
            // Так проще — не нужно заводить отдельный счётчик, который растёт.
            statusEl.classList.add('status--win');
        } else{ // false → показываем сообщение о проигрыше.
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

      if(!firstCard){ // Проверка: “первая карточка ещё не выбрана?”
        firstCard = {cardElement, number}; // Если первая карточка ещё не выбрана — сохранить текущую как первую и остановить обработку клика.
        return;
      } 

       secondCard = {cardElement, number};
       lock = true; // Иначе игрок может кликнуть третью карточку ДО сравнения, чтобы lock включался не  только в setTimeout.
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
        // Она откладывает выполнение переданной функции на указанное время. Здесь в неё передан колбэк — стрелочная функция, 
        // которая выполнится один раз через FLIP_BACK_DELAY миллисекунд.
        // Сравнение с setInterval из startTimer:
        // setInterval — вызывает функцию много раз каждые N мс (пока не остановят);
        // setTimeout — вызывает функцию один раз через N мс.
      if(!firstCard || !secondCard){ // защита от быстрых кликов. Если пара НЕ совпала — код идёт дальше в setTimeout. НО! 
      // Если где-то в логике произошёл сбой (например, быстрый клик), то: firstCard или secondCard может быть null. 
      // setTimeout пытается выполнить: firstCard.cardElement.classList.remove('open'); и падает.
        lock = false; // азблокируем ввод. Флаг lock снимается, игрок снова может кликать по карточкам.
        return; // выходим из колбэка, не выполняя разворот карточек (потому что и разворачивать нечего — одна из них null).
      }
      firstCard.cardElement.classList.remove('open');
      secondCard.cardElement.classList.remove('open');

      firstCard.cardElement.textContent = ''; // Когда карточка открывается, мы показываем число. НО Когда карточка закрывается, нужно ''
      secondCard.cardElement.textContent = '';

      firstCard = null; // Сбрасываем состояние, начать новый цикл кликов, убрать старые карточки из памяти, синхронизировать визуал и логику
      secondCard = null;
      lock = false; // Снимаем блокировку кликов
    }, FLIP_BACK_DELAY); //Выполни этот код через N миллисекунд, но не сейчас
} 
     
    for(let number of shuffled){
    const card = createCard(number);
    list.append(card);
    card.addEventListener('click', () => handleCardClick(card, number));
} 
    startTimer();
}

function validateSize(value){ // утилита независима, переиспользуема, не привязана к DOM
    if(!Number.isInteger(value)) return DEFAULT_SIZE; //Number.isInteger - это метод объекта Number. Он проверяет, является ли значение целым числом.
    if(value < MIN_SIZE || value > MAX_SIZE) return DEFAULT_SIZE;
    if(value % 2 !== 0) return DEFAULT_SIZE; 
    return value; // иначе вернуть value
}

function initApp(){ // initApp очищает контейнер перед показом формы
   const gameContainer = document.getElementById('game');
   gameContainer.innerHTML = '';

   const {form} = createSettingsForm(startGame); // { form } — это деструктуризация объекта. Функция createSettingsForm() 
   // возвращает объект: form, inputCols, inputRows, button. То есть она возвращает не один элемент, а целый набор. 
   // НО! «Возьми объект, который вернула функция, и достань из него только свойство form». Так мы сразу получаем нужное свойство — без промежуточных переменных.
   gameContainer.append(form);
}

function startGame(size){ // startGame очищает контейнер перед показом игры
   const gameContainer = document.getElementById('game');
   gameContainer.innerHTML = '';
   
   const totalCards = size * size; // пользователь вводит размеры поля, а не количество карточек.
   const pairs = totalCards / 2; // игра «Найди пару» работает с парами, а не с одиночными карточками.

   createGame(pairs, size, gameContainer);
}

function createSettingsForm(startGameCallback){ // startGameCallback — имя переменной, под которой эта функция попадает внутрь формы. callback — функция, которую форма должна вызвать при submit
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
    input.step = 2; // это HTML-атрибут поля ввода <input type="number">, который задаёт шаг изменения значения при клике на стрелки вверх/вниз 
    // или при нажатии клавиш ↑/↓, т. е. «значение поля может изменяться только на 2».
    input.value = DEFAULT_SIZE;
    input.required = true; // это HTML-атрибут, который делает поле обязательным для заполнения, т. е. нельзя отправить пустым.  
    // Если игрок оставит поле пустым и нажмёт «Начать игру» — браузер не отправит форму и покажет подсказку «Заполните это поле».
    // required проверяет только то, что поле не пустое. 

    label.append(input);
    buttonWrapper.append(button);
    form.append(label);
    form.append(buttonWrapper);

    form.addEventListener('submit', (event) =>{
    event.preventDefault();

    const size = validateSize(Number(input.value)); // Number() — это явное приведение типа. Валидируем значение из input, Number() приводит строку к числу.
    input.value = size; // ← синхронизировать. Синхронизируем поле с валидным значением, если игрок ввёл 5 → в поле станет 4.
    startGameCallback(size);
    });

    return{ // 
        form,
        label,
        input,
        button,
    }
}

initApp();

