console.log("Hello World!");

let accountsCount = null;
let accountsPerPage = 3;
let accountsAmount = null;
let currentPageNumber = 0;

const RACE_ARRAY = [ 'HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const PROFESSION_ARRAY = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const BANNED_ARRAY = ['true', 'false'];

initCreatePlayerForm()
createAccountsPerPageDown()
fillTable(currentPageNumber, accountsPerPage)
updatePlayersCount()




function fillTable(pageNumber, pageSize) {
    $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';
        players.forEach((player) => {
            htmlRows +=
                `<tr class="row" data-account-id="${player.id}">
                    <td class="cell cell-smaall">${player.id}</td>
                    <td class="cell" data-account-name>${player.name}</td>
                    <td class="cell" data-account-title>${player.title}</td>
                    <td class="cell" data-account-race>${player.race}</td>
                    <td class="cell" data-account-profession>${player.profession}</td>
                    <td class="cell" data-account-level>${player.level}</td>
                    <td class="cell" data-account-birthday>${new Date(player.birthday).toLocaleDateString('uk')}</td>
                    <td class="cell" data-account-banned>${player.banned}</td>
                    <td class="cell">
                        <button class="edit-button" value="${player.id}">
                        <img class="edit-img" src="../img/edit.png" alt="edit">
                        </button>
                    </td>
                    <td class="cell">
                        <button class="delete-button" value="${player.id}">
                        <img class="delete-img" src="../img/delete.png" alt="delete">
                        </button>
                    </td>
                </tr>`
        })
        Array.from($playersTableBody.children).forEach(row => row.remove());

        $playersTableBody.insertAdjacentHTML('beforeend', htmlRows);

        const deleteButton = document.querySelectorAll('.delete-button')
        deleteButton.forEach(button  => button.addEventListener('click', removeAccountHandler))

        const editButton = document.querySelectorAll('.edit-button')
        editButton.forEach(button  => button.addEventListener('click', editAccountHandler))
    })
}

function updatePlayersCount() {
    $.get('http://localhost:8080/rest/players/count', (count) => {
        accountsCount = count;
        updatePaginationButtons()
    })
}


function updatePaginationButtons() {
    accountsAmount = accountsCount ? Math.ceil(accountsCount / accountsPerPage) : 0;
    const $buttonsContainer = document.querySelector('.pagination-button');
    const childButtonCount = $buttonsContainer.children.length;

    let paginationButtonsHtml = '';

    if (childButtonCount !== 0) {
        Array.from($buttonsContainer.children).forEach(node => node.remove());
    }
    for (let i = 1; i <= accountsAmount; i++) {
        paginationButtonsHtml += `<button value="${i - 1}">${i}</button>`;

    }
    $buttonsContainer.insertAdjacentHTML('beforeend', paginationButtonsHtml);

    Array.from($buttonsContainer.children).forEach(button => button.addEventListener('click', onPageChange));
    setActiveButton(currentPageNumber)
}


function createAccountsPerPageDown() {
    const $dropdown = document.querySelector('.accounts-per-page');
    const options = createSelectOption([3, 5, 10, 20], 3)
    $dropdown.addEventListener('change', onAccountsPerPageChangeHandler)
    $dropdown.insertAdjacentHTML('afterbegin', options);
}

function onAccountsPerPageChangeHandler(e) {
    accountsPerPage = e.currentTarget.value;
    fillTable(currentPageNumber, accountsPerPage);
    updatePaginationButtons()
}

function onPageChange(e) {
    const targetPageNumber = e.currentTarget.value;
    setActiveButton(targetPageNumber);

    currentPageNumber = targetPageNumber;
    fillTable(currentPageNumber, accountsPerPage,);
    setActiveButton(currentPageNumber);


}

function setActiveButton(activePageNumber = 0) {
    const $buttonsContainer = document.querySelector('.pagination-button');
    const $targetButton = Array.from($buttonsContainer.children)[activePageNumber];
    const $currentActiveButton = Array.from($buttonsContainer.children)[currentPageNumber];

    if ($currentActiveButton) {
        $currentActiveButton.classList.remove('active-pagination-button');
    }

    $targetButton.classList.add('active-pagination-button');
}


function removeAccountHandler(e){
    const accountId = e.currentTarget.value;
    $.ajax({
        url: `http://localhost:8080/rest/players/${accountId}`,
        method: 'DELETE',
        success: function () {
            updatePlayersCount()
            fillTable(currentPageNumber, accountsPerPage);
        }
    })

console.log("delete");
}



function initCreatePlayerForm() {
    const $raceSelect = document.querySelector('[data-create-race]');
    const $professionSelect = document.querySelector('[data-create-profession]');

    $raceSelect.insertAdjacentHTML('afterbegin', createSelectOption(RACE_ARRAY, RACE_ARRAY[0]));
    $professionSelect.insertAdjacentHTML('afterbegin', createSelectOption(PROFESSION_ARRAY, PROFESSION_ARRAY[0]));
}


function editAccountHandler(e) {
    const $accountId = e.currentTarget.value;

    const $currentRow = document.querySelector(`.row[data-account-id='${$accountId}']`);
    const $currentImage = $currentRow.querySelector('.edit-button img');
    const $currentRemoveButton = $currentRow.querySelector('.delete-button');

    const $currentName = $currentRow.querySelector('[data-account-name]');
    const $currentTitle = $currentRow.querySelector('[data-account-title]');
    const $currentRace = $currentRow.querySelector('[data-account-race]');
    const $currentProfession = $currentRow.querySelector('[data-account-profession]');
    const $currentBanned = $currentRow.querySelector('[data-account-banned]');

    $currentImage.src = '../img/save.png'

    $currentImage.addEventListener('click', () => {
        const params = {
            accountId: $accountId,
            data: {
                name: $currentName.childNodes[0].getAttribute('data-value'),
                title: $currentTitle.childNodes[0].getAttribute('data-value'),
                race: $currentRace.childNodes[0].getAttribute('data-value'),
                profession: $currentProfession.childNodes[0].getAttribute('data-value'),
                banned: $currentBanned.childNodes[0].getAttribute('data-value')
            }
        }
        updateAccount(params)
    })
    $currentRemoveButton.classList.add('hidden');

    $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML))
    $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML))
    $currentRace.childNodes[0].replaceWith(createSelect(RACE_ARRAY ,$currentRace.innerHTML))
    $currentProfession.childNodes[0].replaceWith(createSelect(PROFESSION_ARRAY ,$currentProfession.innerHTML))
    $currentBanned.childNodes[0].replaceWith(createSelect(BANNED_ARRAY ,$currentBanned.innerHTML))
}

function updateAccount({accountId, data}) {
    $.ajax({
        url: `rest/players/${accountId}`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            updatePlayersCount()
            fillTable(currentPageNumber, accountsPerPage);
        }
    });

}

function createInput(vale) {
    const $inputsHtml = document.createElement('input');
    $inputsHtml.setAttribute('type', 'text');
    $inputsHtml.setAttribute('value', vale);
    $inputsHtml.setAttribute('data-value', vale);

    $inputsHtml.addEventListener('input', e => {
        $inputsHtml.setAttribute('data-value', `${e.currentTarget.value}` )
    });
    return $inputsHtml;
}

function createSelect(optionsArray, defaultValue){
    const $options = createSelectOption(optionsArray, defaultValue);
    const $selectElement = document.createElement('select');

    $selectElement.insertAdjacentHTML('afterbegin', $options);
    $selectElement.setAttribute('data-value', defaultValue);

    $selectElement.addEventListener('change', e =>  {
        $selectElement.setAttribute('data-value', e.currentTarget.value)
    })

    return $selectElement
}

function createSelectOption(optionsArray, defaultValue) {
    let optionHtml = '';

    optionsArray.forEach(option => optionHtml += `
        <option ${defaultValue === option && 'selected'} value="${option}">
            ${option}
        </option>`);
    return optionHtml;
}

function createFormFields(){
    const name = document.getElementById('crete-name');
    const title = document.getElementById('create-title');
    const race = document.getElementById('create-race');
    const profession = document.getElementById('create-profession');
    const birthday = document.getElementById('create-birthday');
    const banned = document.getElementById('create-banned');

    return {name, title, race, profession, birthday, banned};

}