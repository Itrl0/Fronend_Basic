'use strict';

// Чисті функції: використовуються сторінкою та автоматичними тестами.
const Lab5 = (() => {
    const studentNumber = 129;
    const variantFor = (total) => (studentNumber - 1) % total + 1;
    const patterns = {
        fullName: /^[А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ’'ʼ-]* [А-ЯІЇЄҐ]\.[А-ЯІЇЄҐ]\.$/u,
        variant: /^\d{2}$/,
        group: /^[А-ЯІЇЄҐ]{2}-\d{2}$/u,
        faculty: /^[А-ЯІЇЄҐ]{4}$/u,
        birthDate: /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/
    };
    const messages = {
        fullName: 'Введіть прізвище та два ініціали: Рябокінь Д.О.',
        variant: 'Введіть рівно дві цифри, наприклад 09.',
        group: 'Формат: дві великі українські літери, дефіс і дві цифри — ІС-41.',
        faculty: 'Введіть чотири великі українські літери, наприклад ФІОТ.',
        birthDate: 'Введіть дійсну календарну дату у форматі ДД.ММ.РРРР.'
    };

    function isCalendarDate(value) {
        if (!patterns.birthDate.test(value)) return false;
        const [day, month, year] = value.split('.').map(Number);
        if (year === 0) return false;
        const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
        const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return day <= days[month - 1];
    }

    function validate(values) {
        const errors = {};
        for (const key of Object.keys(patterns)) {
            const value = String(values[key] ?? '').trim();
            if (!patterns[key].test(value) || (key === 'birthDate' && !isCalendarDate(value))) {
                errors[key] = messages[key];
            }
        }
        return errors;
    }

    function alternatingColumnCells(start, size = 6) {
        const cells = [];
        for (let number = start; number <= size * size; number += 2 * size) cells.push(number);
        return cells;
    }

    function textColor(hex) {
        const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
            .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff';
    }

    return { studentNumber, variantFor, validate, isCalendarDate, alternatingColumnCells, textColor };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Lab5;
