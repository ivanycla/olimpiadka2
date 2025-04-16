// src/api/auth.js

// --- КОНФИГУРАЦИЯ ---
// Замени на URL твоего API
const API_BASE_URL = "http://localhost:8081";
const LOGIN_ENDPOINT = "/api/auth/login";
const REGISTER_ENDPOINT = "/api/auth/register";
const REFRESH_ENDPOINT = "/api/auth/refresh"; // На всякий случай, если понадобится
// --- КОНЕЦ КОНФИГУРАЦИИ ---

/*
 * Обработчик ответа от fetch API.
 * Проверяет статус ответа и парсит JSON.
 * В случае ошибки парсит тело ошибки (если возможно) и выбрасывает исключение.
 * @param {Response} response - Ответ от fetch
 * @returns {Promise<any>} - Promise с распарсенными данными JSON
 * @throws {Error} - Выбрасывает ошибку с сообщением от сервера или статус текстом
 */
const handleResponse = async (response) => {
    // Попытка получить JSON в любом случае (даже при ошибке, там может быть message)
    let responseData;
    try {
        responseData = await response.json();
    } catch (jsonError) {
        // Если тело не JSON или пустое
        responseData = null;
        console.warn("Ответ сервера не является JSON:", await response.clone().text()); // Клонируем, чтобы прочитать текст без блокировки json()
    }

    if (!response.ok) {
        // Пытаемся извлечь сообщение об ошибке из JSON или используем статус
        const errorMessage = responseData?.message || responseData?.error || `Ошибка ${response.status}: ${response.statusText}`;
        // Создаем объект ошибки, чтобы передать и статус
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = responseData; // Прикрепляем все данные ответа на всякий случай
        console.error("API Error:", error);
        throw error; // Выбрасываем ошибку, чтобы ее поймал .catch() в компоненте
    }

    // Если ответ успешный (2xx) и есть данные
    if (responseData === null && response.status >= 200 && response.status < 300) {
         // Иногда успешный ответ может быть пустым (например, 204 No Content)
         // В нашем случае login/register всегда возвращают тело, но обработаем на всякий случай
         console.warn(`Успешный ответ (${response.status}) без JSON тела.`);
         return {}; // Возвращаем пустой объект или можно null/undefined
    }

    return responseData; // Возвращаем распарсенные данные
};

/*
 * Отправляет запрос на вход пользователя.
 * @param {string} username - Имя пользователя (в твоем случае email)
 * @param {string} password - Пароль
 * @returns {Promise<import('../dto/LoginResponse').LoginResponse>} - Promise с данными ответа (токены)
 * @throws {Error} - Выбрасывает ошибку в случае неудачного запроса или ответа сервера
 */
export const loginUser = async (username, password) => {
    console.log(`Attempting login for: ${username}`); // Исправлено: добавлены обратные кавычки
    const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, { // Исправлено: добавлены обратные кавычки
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
};

/*
 * Отправляет запрос на регистрацию пользователя.
 * Бэкенд всегда регистрирует как 'USER'.
 * @param {string} username - Имя пользователя (в твоем случае email)
 * @param {string} password - Пароль
 * @returns {Promise<import('../dto/LoginResponse').LoginResponse>} - Promise с данными ответа (токены, т.к. бэк сразу логинит)
 * @throws {Error} - Выбрасывает ошибку в случае неудачного запроса или ответа сервера
 */
export const registerUser = async (username, password) => {
    console.log(`Attempting registration for: ${username}`);
    const response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    // Бэкенд возвращает 201 Created и тело LoginResponse
    return handleResponse(response);
};

/*
 * Отправляет запрос на обновление токена.
 * @param {string} refreshToken - Refresh токен
 * @returns {Promise<import('../dto/LoginResponse').LoginResponse>} - Promise с новыми токенами
 * @throws {Error} - Выбрасывает ошибку в случае неудачного запроса или ответа сервера
 */
export const refreshToken = async (refreshToken) => {
    console.log("Attempting token refresh");
    const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, { // Исправлено: добавлены обратные кавычки
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(response);
};

