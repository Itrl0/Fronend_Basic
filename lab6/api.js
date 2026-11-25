'use strict';

const Lab6 = (() => {
    const apiUrl = 'https://randomuser.me/api/?results=5&inc=picture,location,cell,name';
    const asText = value => (typeof value === 'string' && value.trim()) ||
        (typeof value === 'number' && Number.isFinite(value) ? String(value) : 'Немає даних');

    function parseUsers(data) {
        if (data?.error) throw new Error('Сервіс Random User повідомив про помилку. Спробуйте пізніше.');
        if (!Array.isArray(data?.results) || data.results.length === 0) {
            throw new Error('API повернув порожню або некоректну відповідь.');
        }
        return data.results.map(user => {
            if (!user || typeof user !== 'object' || Array.isArray(user)) throw new Error('Некоректний запис користувача.');
            const name = [user.name?.first, user.name?.last].filter(v => typeof v === 'string' && v.trim()).join(' ');
            const photo = user.picture?.large;
            return {
                picture: typeof photo === 'string' && /^https:\/\/randomuser\.me\/api\/portraits\//.test(photo) ? photo : '',
                city: asText(user.location?.city),
                postcode: asText(user.location?.postcode),
                cell: asText(user.cell),
                name: asText(name)
            };
        });
    }

    function loadUsers(fetchFn = globalThis.fetch, timeoutMs = 15000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        return Promise.resolve()
            .then(() => fetchFn(apiUrl, { signal: controller.signal, cache: 'no-store' }))
            .then(response => {
                if (!response.ok) throw new Error(`Помилка HTTP ${response.status}. Спробуйте ще раз пізніше.`);
                return response.json();
            })
            .then(parseUsers)
            .catch(error => {
                if (error.name === 'AbortError') throw new Error('Сервер не відповів за відведений час. Повторіть спробу.');
                if (error instanceof SyntaxError) throw new Error('Сервер повернув дані, які не є коректним JSON.');
                if (error instanceof TypeError) throw new Error('Не вдалося з’єднатися з API. Перевірте інтернет і спробуйте ще раз.');
                throw error;
            })
            .finally(() => clearTimeout(timer));
    }
    return { apiUrl, parseUsers, loadUsers };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Lab6;
