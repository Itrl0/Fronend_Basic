'use strict';

// Варіант 129: (129 % 10) + 1 = 10.
// Рахуємо всі HTML-елементи всередині body у порядку документа.
const firstTarget = document.getElementById('color-by-id');
const secondTarget = document.querySelector('.color-by-selector');

function enableColorChange(element) {
    let firstColor = false;

    function changeColors() {
        firstColor = !firstColor;
        element.classList.toggle('color-state-a', firstColor);
        element.classList.toggle('color-state-b', !firstColor);
    }

    element.addEventListener('click', changeColors);
    element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            changeColors();
        }
    });
}

enableColorChange(firstTarget);
enableColorChange(secondTarget);

const imageLink = document.getElementById('city-link');
const originalImage = document.getElementById('city-image').cloneNode(true);
const addButton = document.getElementById('add-image');
const increaseButton = document.getElementById('increase-image');
const decreaseButton = document.getElementById('decrease-image');
const removeButton = document.getElementById('remove-image');
const status = document.getElementById('image-status');

const initialWidth = 800;
const minWidth = 200;
const maxWidth = 1000;
const step = 100;

function getImage() {
    return imageLink.querySelector('img');
}

function updateControls() {
    const image = getImage();
    const width = image ? Number(image.getAttribute('width')) : 0;
    addButton.disabled = Boolean(image);
    increaseButton.disabled = !image || width >= maxWidth;
    decreaseButton.disabled = !image || width <= minWidth;
    removeButton.disabled = !image;
    status.textContent = image
        ? `Задана ширина: ${image.getAttribute('width')} px. На вузькому екрані фото обмежується шириною сторінки.`
        : 'Зображення видалено. Натисніть «Додати», щоб відновити його.';
}

addButton.addEventListener('click', () => {
    if (getImage()) return;
    const image = originalImage.cloneNode(true);
    image.width = initialWidth;
    imageLink.append(image);
    updateControls();
});

function resizeImage(delta) {
    const image = getImage();
    if (!image) return;
    const width = Number(image.getAttribute('width'));
    image.width = Math.max(minWidth, Math.min(maxWidth, width + delta));
    updateControls();
}

increaseButton.addEventListener('click', () => resizeImage(step));
decreaseButton.addEventListener('click', () => resizeImage(-step));
removeButton.addEventListener('click', () => {
    const image = getImage();
    if (image) image.remove();
    updateControls();
});

updateControls();
