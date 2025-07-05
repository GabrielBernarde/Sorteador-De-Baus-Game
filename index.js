const screens = {
    initialLoading: document.getElementById('initial-loading-screen'),
    register: document.getElementById('register-screen'),
    game: document.getElementById('game-screen'),
    loadingResults: document.getElementById('loading-results-screen'),
    results: document.getElementById('results-screen')
};


const myGamesModal = document.getElementById('my-games-modal');
const myGamesModalCloseBtn = myGamesModal.querySelector('.modal-close-btn');
const historicalGamesModalContainer = document.getElementById('historical-games-modal-container');

const usernameInput = document.getElementById('username');
const usernameTooltip = document.getElementById('username-tooltip');
const idInput = document.getElementById('id');
const idTooltip = document.getElementById('id-tooltip');
const generateIdBtn = document.getElementById('generate-id-btn');
const registerBtn = document.getElementById('register-btn');


function showScreen(screenToShow) {
    for (const key in screens) {
        if (screens[key]) {
            screens[key].classList.add('hidden');
            screens[key].classList.remove('active');
        }
    }
    if (screenToShow) {
        screenToShow.classList.remove('hidden');
        screenToShow.classList.add('active');
        screenToShow.scrollTop = 0;
    }

    myGamesModal.classList.add('hidden');
    myGamesModal.classList.remove('active');
}

let currentUser = null;
const TOTAL_BAUS = 9;
let currentGameState = null;

const BAUS_CONTENT_MAP = {
    0: 'Vazio',
    1: 'Ouro',
    2: 'Joias'
};
const BAU_IMAGES = {
    closed: './bau_fechado.png',
    content: [
        './bau_vazio.png',
        './bau_ouro.png',
        './bau_joias.png'
    ]
};

function generateUniqueId() {
    let newId;
    let users = getAllUsers();
    do {
        newId = Math.floor(10000 + Math.random() * 90000).toString();
    } while (users.some(u => u.id === newId));
    return newId;
}

function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveAllUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function processUser(username, providedId) {
    let users = getAllUsers();

    let userFound = users.find(u => u.name.toLowerCase() === username.toLowerCase() && u.id === providedId);

    if (userFound) {
        if (typeof userFound.carteiraTotal === 'undefined') {
            userFound.carteiraTotal = 0;
        }
        if (typeof userFound.historicoDeJogos === 'undefined') {
            userFound.historicoDeJogos = [];
        }
        saveAllUsers(users);
        return { user: userFound, isNewUser: false };
    } else {
        const userExistsByName = users.some(u => u.name.toLowerCase() === username.toLowerCase());

        if (userExistsByName) {
            alert(`O nome '${username}' já está em uso, mas o ID não corresponde. Por favor, verifique seu ID ou escolha outro nome.`);
            return { user: null, isNewUser: false };
        } else {
            const newUser = {
                name: username,
                id: providedId,
                historicoDeJogos: [],
                carteiraTotal: 0
            };
            users.push(newUser);
            saveAllUsers(users);
            return { user: newUser, isNewUser: true };
        }
    }
}

function updateCurrentUserInStorage() {
    let users = getAllUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users[index] = currentUser;
        saveAllUsers(users);
    }
}

function updateRegisterFormState() {
    const usernameVal = usernameInput.value.trim();
    const usernameValid = usernameVal.length >= 4;
    const userFoundByNameOnly = getAllUsers().find(u => u.name.toLowerCase() === usernameVal.toLowerCase());
    const idProvided = idInput.value.trim().length > 0;

    usernameTooltip.classList.toggle('active', !usernameValid && usernameVal.length > 0);
    usernameTooltip.classList.toggle('hidden', usernameValid || usernameVal.length === 0);

    if (userFoundByNameOnly) {
       
        idInput.readOnly = false;
        idInput.placeholder = 'Digite seu ID';
        generateIdBtn.disabled = true;
        generateIdBtn.style.display = 'none';
        registerBtn.disabled = !(usernameValid && idProvided);
    } else {
       
        idInput.readOnly = true; 
        idInput.placeholder = 'Seu ID será gerado aqui';
        generateIdBtn.disabled = !usernameValid;
        generateIdBtn.style.display = 'inline-block';

        
        registerBtn.disabled = !(usernameValid && idProvided);
        if (idInput.readOnly && !idProvided) { 
            registerBtn.disabled = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showScreen(screens.initialLoading);
    setTimeout(() => {
        showScreen(screens.register);
        usernameInput.value = '';
        idInput.value = '';
        updateRegisterFormState(); 

        usernameInput.addEventListener('input', updateRegisterFormState);
        idInput.addEventListener('input', updateRegisterFormState);

        usernameInput.addEventListener('blur', () => {
            usernameTooltip.classList.add('hidden');
            usernameTooltip.classList.remove('active');
        });

        generateIdBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username.length < 4) {
                alert('Por favor, preencha seu nome com no mínimo 4 caracteres antes de gerar o ID.');
                return;
            }

            const newId = generateUniqueId();
            idInput.value = newId;
            idInput.readOnly = true; 
            updateRegisterFormState(); 
            idTooltip.classList.remove('hidden');
            idTooltip.classList.add('active');
            idInput.focus();
        });


    }, 1500);


    myGamesModalCloseBtn.addEventListener('click', () => {
        myGamesModal.classList.add('hidden');
        myGamesModal.classList.remove('active');
    });


    myGamesModal.addEventListener('click', (event) => {
        if (event.target === myGamesModal) {
            myGamesModal.classList.add('hidden');
            myGamesModal.classList.remove('active');
        }
    });

});

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const providedId = idInput.value.trim();

    if (!username || username.length < 4) {
        alert('Por favor, insira um nome de usuário válido (mínimo 4 caracteres)!');
        return;
    }
    
    if (!providedId && !idInput.readOnly) { 
        alert('Por favor, digite seu ID.');
        return;
    }
    if (!providedId && idInput.readOnly) { 
        alert('Por favor, gere um ID antes de prosseguir.');
        return;
    }

    const { user, isNewUser } = processUser(username, providedId);

    if (!user) {
        idInput.value = '';
        updateRegisterFormState();
        return;
    }

    currentUser = user;

    if (isNewUser) {
        const confirmationId = prompt(`Bem-vindo(a) ao Wonder, ${currentUser.name}! Seu ID é: ${currentUser.id}. Por favor, digite seu ID novamente para confirmar que você o anotou:`);
        if (confirmationId !== currentUser.id) {
            alert('Os IDs não coincidem ou a confirmação foi cancelada. Por favor, tente novamente.');
            let users = getAllUsers();
            users = users.filter(u => u.id !== currentUser.id); 
            saveAllUsers(users);
            currentUser = null;
            idInput.value = '';
            idTooltip.classList.add('hidden'); 
            updateRegisterFormState(); 
            return;
        } else {
            alert('ID confirmado. Você pode prosseguir!');
        }
    }

    const lastGame = currentUser.historicoDeJogos[currentUser.historicoDeJogos.length - 1];
    if (lastGame && Object.keys(lastGame.baus).length < TOTAL_BAUS) {
        currentGameState = lastGame;
    } else {
        currentGameState = {
            data: new Date().toLocaleString('pt-BR'),
            baus: {},
            resumo: { 'Vazio': 0, 'Ouro': 0, 'Joias': 0 },
            valorGanho: 0
        };
    }

    setupGameScreen();
    showScreen(screens.game);
});

function getRandomValue(min, max) {
    return (Math.random() * (max - min) + min);
}

function determineBauContent() {
    const rand = Math.random();

    if (rand < 0.60) {
        return { type: 'Vazio', value: 0 };
    } else if (rand < 0.60 + 0.30) {
        return { type: 'Ouro', value: getRandomValue(0.10, 13.28) };
    } else {
        return { type: 'Joias', value: getRandomValue(6.21, 38.40) };
    }
}

function setupGameScreen() {
    const gameContainer = document.querySelector('#game-screen .container');
    gameContainer.innerHTML = '';

    document.getElementById('current-username').textContent = currentUser.name;
    document.getElementById('current-userid').textContent = currentUser.id;

    for (let i = 1; i <= TOTAL_BAUS; i++) {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'box';
        boxDiv.setAttribute('data-bau-id', i);
        boxDiv.innerHTML = `
            <h4>Baú ${i}</h4>
            <img src="${BAU_IMAGES.closed}" alt="Baú ${i} fechado">
            <button>Abrir Baú</button>
        `;
        gameContainer.appendChild(boxDiv);

        const bauImage = boxDiv.querySelector('img');
        const button = boxDiv.querySelector('button');

        if (currentGameState.baus[`Baú ${i}`]) {
            const result = currentGameState.baus[`Baú ${i}`];
            const resultText = result.type;
            const imageIndex = Object.keys(BAUS_CONTENT_MAP).find(key => BAUS_CONTENT_MAP[key] === resultText);
            bauImage.src = BAU_IMAGES.content[imageIndex];
            bauImage.alt = `Baú ${i} - ${resultText}`;
            button.disabled = true;
            button.textContent = 'Aberto';
            boxDiv.classList.add('disabled');
        }

        button.addEventListener('click', () => openBau(i, bauImage, button, boxDiv));
    }

    if (Object.keys(currentGameState.baus).length === TOTAL_BAUS) {
        showResults();
    }
}

function openBau(bauNumber, bauImageElement, buttonElement, boxDivElement) {
    if (buttonElement.disabled) {
        alert(`Você já sorteou o Baú ${bauNumber}!`);
        return;
    }

    buttonElement.disabled = true;
    buttonElement.textContent = 'Abrindo...';
    bauImageElement.style.transform = 'scale(1.1)';
    boxDivElement.classList.add('disabled');

    setTimeout(() => {
        const bauResult = determineBauContent();
        const resultText = bauResult.type;
        const resultValue = bauResult.value;

        const imageIndex = Object.keys(BAUS_CONTENT_MAP).find(key => BAUS_CONTENT_MAP[key] === resultText);
        const randomImageSrc = BAU_IMAGES.content[imageIndex];

        bauImageElement.src = randomImageSrc;
        bauImageElement.alt = `Baú ${bauNumber} - ${resultText}`;
        bauImageElement.style.transform = 'scale(1)';

        buttonElement.textContent = 'Aberto';

        currentGameState.baus[`Baú ${bauNumber}`] = bauResult;
        currentGameState.resumo[resultText]++;
        currentGameState.valorGanho += resultValue;

        currentUser.carteiraTotal += resultValue;
        currentUser.carteiraTotal = parseFloat(currentUser.carteiraTotal.toFixed(2));

        let bausCountInCurrentGame = Object.keys(currentGameState.baus).length;

        if (bausCountInCurrentGame === TOTAL_BAUS) {
            const isGameAlreadyInHistory = currentUser.historicoDeJogos.some(
                game => JSON.stringify(game.baus) === JSON.stringify(currentGameState.baus) && game.data === currentGameState.data
            );

            if (!isGameAlreadyInHistory) {
                currentUser.historicoDeJogos.push(currentGameState);
            }
            updateCurrentUserInStorage();
            showResults();
        }

    }, 800);
}

function showResults() {
    showScreen(screens.loadingResults);

    setTimeout(() => {
        const resultsScreenContent = document.getElementById('results-screen');
        resultsScreenContent.innerHTML = '';

        const resultsWrapper = document.createElement('div');
        resultsWrapper.className = 'results-content-wrapper';
        resultsScreenContent.appendChild(resultsWrapper);

        const lastCompletedGame = currentUser.historicoDeJogos.length > 0 ? currentUser.historicoDeJogos[currentUser.historicoDeJogos.length - 1] : null;

        let resultsHtml = `
            <h2>RESULTADOS DE ${currentUser.name.toUpperCase()}!</h2>
            <div class="results-summary">
                <p>Aqui está o resumo do seu <strong>último jogo</strong> (${lastCompletedGame ? lastCompletedGame.data : 'N/A'}):</p>
                <ul>
                    <li>Você encontrou <strong>${lastCompletedGame ? lastCompletedGame.resumo['Ouro'] : 0}</strong> baú(s) com ouro.</li>
                    <li>Você encontrou <strong>${lastCompletedGame ? lastCompletedGame.resumo['Joias'] : 0}</strong> baú(s) com joias.</li>
                    <li>Você abriu <strong>${lastCompletedGame ? lastCompletedGame.resumo['Vazio'] : 0}</strong> baú(s) vazio(s).</li>
                </ul>
                <p>Valor ganho neste jogo: <strong>R$ ${lastCompletedGame ? lastCompletedGame.valorGanho.toFixed(2).replace('.', ',') : '0,00'}</strong></p>
                <p class="total-wallet">Sua Carteira Total: <strong>R$ ${currentUser ? currentUser.carteiraTotal.toFixed(2).replace('.', ',') : '0,00'}</strong></p>
            </div>

            <div class="action-buttons">
                <button class="reset-button" id="play-again-btn">Novo Jogo</button>
                <button class="show-my-games-button" id="show-my-games-btn">Meus Jogos</button>
                <button class="reset-button" id="change-user-btn">Mudar Usuário</button>
            </div>

            <div class="comparison-section" id="comparison-section">
            </div>
        `;

        resultsWrapper.innerHTML = resultsHtml;

        document.getElementById('play-again-btn').addEventListener('click', () => {
            currentGameState = {
                data: new Date().toLocaleString('pt-BR'),
                baus: {},
                resumo: { 'Vazio': 0, 'Ouro': 0, 'Joias': 0 },
                valorGanho: 0
            };
            setupGameScreen();
            showScreen(screens.game);
        });


        document.getElementById('show-my-games-btn').addEventListener('click', () => {
            displayMyHistoricalGamesInModal();
        });

        document.getElementById('change-user-btn').addEventListener('click', () => {
            currentUser = null;
            currentGameState = null;
            usernameInput.value = '';
            idInput.value = '';
            idTooltip.classList.add('hidden');
            updateRegisterFormState(); 
            showScreen(screens.register);
        });

        showScreen(screens.results);
    }, 2000);
}


function displayMyHistoricalGamesInModal() {
    historicalGamesModalContainer.innerHTML = '';
    const historicalGames = currentUser.historicoDeJogos
        .filter(game => Object.keys(game.baus).length === TOTAL_BAUS)
        .reverse();

    if (historicalGames.length > 0) {
        historicalGames.forEach((game) => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <strong>Jogo Anterior (${game.data})</strong><br>
                <span>Ouro: ${game.resumo['Ouro']}</span><br>
                <span>Joias: ${game.resumo['Joias']}</span><br>
                <span>Vazio: ${game.resumo['Vazio']}</span><br>
                <span>Ganho: R$ ${game.valorGanho.toFixed(2).replace('.', ',')}</span>
            `;
            historicalGamesModalContainer.appendChild(gameCard);
        });
    } else {
        historicalGamesModalContainer.innerHTML = `<p style="text-align: center; color: #edf8fa;">Nenhum jogo anterior registrado.</p>`;
    }

    myGamesModal.classList.add('active');
    myGamesModal.classList.remove('hidden');
}