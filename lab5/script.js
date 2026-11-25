'use strict';

const form = document.getElementById('student-form');
const formStatus = document.getElementById('form-status');
const fields = ['fullName', 'variant', 'group', 'faculty', 'birthDate'];
const labels = { fullName: 'ПІБ', variant: 'Варіант форми', group: 'Група', faculty: 'Факультет', birthDate: 'Дата народження' };

function setFieldError(key, message) {
    const input = form.elements.namedItem(key);
    input.closest('.field').classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    document.getElementById(`${key}-error`).textContent = message || '';
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = Object.fromEntries(fields.map(key => [key, form.elements.namedItem(key).value.trim()]));
    const errors = Lab5.validate(values);
    fields.forEach(key => setFieldError(key, errors[key]));
    if (Object.keys(errors).length) {
        formStatus.textContent = 'Виправте виділені поля. Дані не передано.';
        form.elements.namedItem(Object.keys(errors)[0]).focus();
        return;
    }

    // Вікно відкривається безпосередньо під час submit, без асинхронної затримки.
    const result = window.open('', 'lab5-result', 'width=560,height=520');
    if (!result) {
        formStatus.textContent = 'Дані правильні, але браузер заблокував нове вікно. Дозвольте спливні вікна для цієї сторінки та натисніть «Перевірити» ще раз.';
        return;
    }
    const doc = result.document;
    doc.documentElement.lang = 'uk';
    doc.title = 'ЛР №5 — Результат перевірки';
    doc.head.replaceChildren();
    const title = doc.createElement('title');
    title.textContent = 'ЛР №5 — Результат перевірки';
    const charset = doc.createElement('meta');
    charset.setAttribute('charset', 'UTF-8');
    const style = doc.createElement('style');
    style.textContent = 'body{font:18px/1.5 Arial,sans-serif;margin:28px;color:#17202a}h1{font-size:24px}dt{font-weight:bold;margin-top:12px}dd{margin-left:0;overflow-wrap:anywhere}';
    doc.head.append(charset, title, style);
    doc.body.replaceChildren();
    const heading = doc.createElement('h1');
    heading.textContent = 'Дані успішно перевірено';
    const list = doc.createElement('dl');
    for (const key of fields) {
        const term = doc.createElement('dt');
        const description = doc.createElement('dd');
        term.textContent = labels[key];
        description.textContent = values[key]; // Введений текст не інтерпретується як HTML.
        list.append(term, description);
    }
    doc.body.append(heading, list);
    result.focus();
    formStatus.textContent = 'Помилок немає. Результат відкрито в окремому вікні.';
});

fields.forEach(key => {
    form.elements.namedItem(key).addEventListener('input', () => {
        setFieldError(key, '');
        formStatus.textContent = '';
    });
});

form.addEventListener('reset', () => {
    fields.forEach(key => setFieldError(key, ''));
    formStatus.textContent = '';
});

const grid = document.getElementById('color-grid');
const palette = document.getElementById('palette');
const tableStatus = document.getElementById('table-status');
const activeNumber = Lab5.variantFor(36); // 21
const activeCell = document.getElementById(`cell-${activeNumber}`);

function paint(number, color) {
    const cell = document.getElementById(`cell-${number}`);
    cell.style.backgroundColor = color;
    cell.style.color = Lab5.textColor(color);
    cell.dataset.color = color;
}

activeCell.addEventListener('mouseenter', () => {
    let number = Math.floor(Math.random() * 0x1000000);
    let color = `#${number.toString(16).padStart(6, '0')}`;
    if (color === activeCell.dataset.color) {
        number = (number + 1) % 0x1000000;
        color = `#${number.toString(16).padStart(6, '0')}`;
    }
    paint(activeNumber, color);
    tableStatus.textContent = `Клітинка ${activeNumber}: випадковий колір ${color}.`;
});

function paintSelected() {
    paint(activeNumber, palette.value);
    tableStatus.textContent = `Клітинка ${activeNumber}: колір із палітри ${palette.value}.`;
}

function paintColumn() {
    const numbers = Lab5.alternatingColumnCells(activeNumber);
    numbers.forEach(number => paint(number, palette.value));
    tableStatus.textContent = `Зафарбовано клітинки ${numbers.join(' і ')} кольором ${palette.value}.`;
}

activeCell.addEventListener('click', paintSelected);
activeCell.addEventListener('dblclick', paintColumn);
activeCell.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (event.shiftKey) paintColumn();
        else paintSelected();
    }
});

document.getElementById('reset-colors').addEventListener('click', () => {
    grid.querySelectorAll('td').forEach(cell => {
        cell.style.backgroundColor = '';
        cell.style.color = '';
        delete cell.dataset.color;
    });
    tableStatus.textContent = 'Кольори таблиці скинуто.';
});
