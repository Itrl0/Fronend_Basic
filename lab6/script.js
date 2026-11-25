'use strict';

const loadButton = document.getElementById('load-users');
const usersContainer = document.getElementById('users');
const status = document.getElementById('status');

function createCard(user, index) {
    const card = document.createElement('article');
    card.className = 'card';
    const heading = document.createElement('h3');
    heading.textContent = `Користувач ${index + 1}`;
    card.append(heading);

    const photoError = document.createElement('p');
    photoError.className = 'photo-error';
    photoError.textContent = 'Фото недоступне';
    photoError.hidden = Boolean(user.picture);
    if (user.picture) {
        const picture = document.createElement('img');
        picture.alt = `Фото: ${user.name}`;
        picture.width = 128;
        picture.height = 128;
        picture.addEventListener('error', () => {
            picture.remove();
            photoError.hidden = false;
        }, { once: true });
        picture.src = user.picture;
        card.append(picture);
    }
    card.append(photoError);

    // Поля відображено в порядку 1, 4, 6, 3, 2 з таблиці варіантів.
    const list = document.createElement('dl');
    for (const [label, value] of [['Місто', user.city], ['Поштовий індекс', user.postcode], ['Мобільний телефон', user.cell], ['Ім’я', user.name]]) {
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = value;
        list.append(term, description);
    }
    card.append(list);
    return card;
}

loadButton.addEventListener('click', () => {
    if (loadButton.disabled) return;
    loadButton.disabled = true;
    usersContainer.setAttribute('aria-busy', 'true');
    status.classList.remove('error');
    status.textContent = 'Завантаження даних…';

    Lab6.loadUsers()
        .then(users => {
            const cards = users.map(createCard);
            usersContainer.replaceChildren(...cards);
            status.textContent = `Успішно завантажено користувачів: ${users.length}.`;
        })
        .catch(error => {
            status.classList.add('error');
            status.textContent = error.message + (usersContainer.children.length ? ' Попередні картки збережено.' : '');
        })
        .finally(() => {
            loadButton.disabled = false;
            loadButton.textContent = 'Завантажити нових користувачів';
            usersContainer.setAttribute('aria-busy', 'false');
        });
});
