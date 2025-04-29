// src/api/api.js

// --- Базовые URL ваших сервисов ---
const BASE_URL_AUTH = 'http://localhost:8083/api/auth';   // Порт 8083 для auth-service
const BASE_URL_EVENTS_API = 'http://localhost:8082/api/events'; // Порт 8082, путь /api/events для событий
const BASE_URL_PROFILES_IN_EVENTS = 'http://localhost:8082/api/profiles'; // Порт 8082, путь /api/profiles для друзей/приватности

// --- Вспомогательная функция для извлечения токена ---
const getToken = () => localStorage.getItem('accessToken');

// --- УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ЗАПРОСОВ ---
const request = async (baseUrl, endpoint, options = {}, isFormData = false) => {
    const url = `${baseUrl}${endpoint}`;
    const token = getToken();
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Определяем заголовки по умолчанию, не перезаписывая Accept/Content-Type если они явно заданы или это FormData
    const defaultAcceptHeader = isFormData || (options.headers && options.headers['Accept']) ? {} : { 'Accept': 'application/json' };
    const defaultContentTypeHeader = isFormData || (options.headers && options.headers['Content-Type']) ? {} : { 'Content-Type': 'application/json' };

    const config = {
        ...options,
        headers: {
            ...defaultAcceptHeader,
            ...defaultContentTypeHeader,
            ...authHeader,
            ...options.headers,
        },
    };

    // Кодируем тело в JSON, только если это объект и не FormData
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        // console.debug(`Sending ${config.method || 'GET'} request to ${url}`); // Раскомментируйте для отладки запросов
        const response = await fetch(url, config);
        const responseBodyText = await response.text(); // Читаем тело как текст в любом случае

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            // Пытаемся распарсить JSON, если Content-Type подходящий и тело не пустое
            if (contentType?.includes('application/json') && responseBodyText) {
                try {
                    return JSON.parse(responseBodyText);
                } catch (parseError) {
                    console.warn(`Successful response for ${url} but failed to parse JSON:`, responseBodyText);
                    return responseBodyText; // Возвращаем текст как fallback
                }
            } else {
                // Для успешных ответов без JSON (204 No Content) или с другим Content-Type
                return responseBodyText || null; // Возвращаем текст или null если тело пустое
            }
        } else { // Обработка HTTP ошибок (4xx, 5xx)
            let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
            let errorData = null;
            if (responseBodyText) { // Пытаемся получить детали ошибки из тела
                 try {
                    const errorJson = JSON.parse(responseBodyText);
                    // Ищем стандартные поля ошибок Spring Boot или кастомное 'message'/'error'
                    errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
                    errorData = errorJson;
                 } catch (e) {
                     // Если тело не JSON, используем его как текст ошибки
                     errorMessage = responseBodyText.substring(0, 200) || errorMessage; // Обрезаем длинные HTML ошибки
                 }
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData; // Прикрепляем данные ошибки, если они были в JSON
            console.error(`API Error ${error.status} from ${url}: ${error.message}`, error.data || '');
            throw error; // Выбрасываем ошибку для обработки в вызывающем коде (.catch())
        }
    } catch (thrownError) { // Обработка ошибок сети (сервер недоступен) или ошибок в логике выше
        console.error(`Network or processing error for ${url}:`, thrownError);
        // Перебрасываем ошибку, если она уже обработана (имеет статус)
        if (thrownError instanceof Error && thrownError.status) {
             throw thrownError;
        }
        // Создаем новую ошибку для сетевых проблем
        throw new Error(thrownError.message || `Ошибка сети при обращении к ${url}. Проверьте доступность сервера.`);
    }
};


// --- Функции для Auth Service (Порт 8083, путь /api/auth) ---

/** Аутентифицирует пользователя */
export const loginUser = async (username, password) => {
    console.log("API: Вызов loginUser");
    return request(BASE_URL_AUTH, '/login', { method: 'POST', body: { username, password } });
};

/** Регистрирует обычного пользователя */
export const registerUser = async (username, password) => {
    console.log("API: Вызов registerUser");
     return request(BASE_URL_AUTH, '/register', { method: 'POST', body: { username, password } });
 };

/** Регистрирует организатора с документом */
export const registerOrganizer = async (email, password, organizationName, documentFile) => {
    console.log("API: Вызов registerOrganizer");
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    formData.append('organizationName', organizationName);
    formData.append('document', documentFile);
    // Используем isFormData = true
    return request(BASE_URL_AUTH, '/register/organizer', { method: 'POST', body: formData }, true);
};

/** Получает список ожидающих организаций (для админа) */
export const getPendingOrganizations = async () => {
    console.log("API: Вызов getPendingOrganizations");
    // Ожидаем массив OrganizationPendingDto
    return request(BASE_URL_AUTH, '/admin/organizations/pending', { method: 'GET' });
 };

/** Скачивает документ организации (для админа) */
export const downloadOrgDocument = async (orgId) => {
    console.log(`API: Вызов downloadOrgDocument для orgId=${orgId}`);
    const url = `${BASE_URL_AUTH}/admin/organizations/${orgId}/document`;
    const token = getToken();
   try {
        const response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` }});
        if (!response.ok) {
             const errorText = await response.text().catch(() => `HTTP ${response.status}`);
             throw new Error(`Ошибка ${response.status}: ${errorText}`);
        }
       return response.blob(); // Возвращаем Blob для скачивания файла
   } catch (error) { console.error(`Error downloading document for org ${orgId}:`, error); throw new Error(error.message || `Ошибка скачивания документа.`); }
};

/** Одобряет организацию (для админа) */
export const approveOrganization = async (orgId) => {
    console.log(`API: Вызов approveOrganization для orgId=${orgId}`);
    // Ожидаем текстовый ответ или пустой успешный
    return request(BASE_URL_AUTH, `/admin/organizations/${orgId}/approve`, { method: 'POST' });
 };

/** Отклоняет организацию (для админа) */
export const rejectOrganization = async (orgId, reason) => {
     console.log(`API: Вызов rejectOrganization для orgId=${orgId}`);
     // Отправляем причину как JSON { comment: "..." }
     const options = { method: 'POST', body: reason ? { comment: reason } : null };
     return request(BASE_URL_AUTH, `/admin/organizations/${orgId}/reject`, options);
 };

// --- Функции для Профиля Организатора (Auth Service) ---
/** Получает профиль ТЕКУЩЕГО организатора */
export const getMyOrganizerProfile = async () => {
    console.log("API: Вызов getMyOrganizerProfile");
    return request(BASE_URL_AUTH, '/profile/organizer/me', { method: 'GET' });
};

/** Обновляет профиль ТЕКУЩЕГО организатора (только имя) */
export const updateMyOrganizerProfile = async (profileData) => {
     console.log("API: Вызов updateMyOrganizerProfile с данными:", profileData);
     // Отправляем ТОЛЬКО organizationName, как ожидает DTO бэкенда
     const bodyToSend = {
         organizationName: profileData.name // Берем name из объекта, переданного из формы
     };
     return request(BASE_URL_AUTH, '/profile/organizer/me', { method: 'PUT', body: bodyToSend });
};

// --- Функции для Профиля ОБЫЧНОГО пользователя (Auth Service) ---
/** Получает профиль ТЕКУЩЕГО пользователя */
export const getMyUserProfile = async () => {
    console.log("API: Вызов getMyUserProfile");
    return request(BASE_URL_AUTH, '/profile/user/me', { method: 'GET' });
};

/** Обновляет профиль ТЕКУЩЕГО пользователя */
export const updateMyUserProfile = async (profileData) => {
    console.log("API: Вызов updateMyUserProfile с данными:", profileData);
    return request(BASE_URL_AUTH, '/profile/user/me', { method: 'PUT', body: profileData });
};

/** Получает ПУБЛИЧНЫЕ данные профиля ДРУГОГО пользователя по ID */
export const getUserProfileById = async (userId) => {
    console.log(`API: Вызов getUserProfileById для ID: ${userId}`);
    if (isNaN(parseInt(userId, 10))) {
        console.error(`Некорректный userId для запроса профиля: ${userId}`);
        return Promise.reject(new Error("Некорректный ID пользователя"));
    }
    return request(BASE_URL_AUTH, `/users/${userId}/profile`, { method: 'GET' });
};

/** Ищет пользователей по имени/нику */
export const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) { return []; }
    const params = new URLSearchParams({ q: query.trim() }).toString();
    console.log(`API: Вызов searchUsers с query=${query.trim()}`);
    try {
        const results = await request(BASE_URL_AUTH, `/users/search?${params}`, { method: 'GET' });
        return Array.isArray(results) ? results : []; // Возвращаем массив или пустой массив
    } catch (error) { console.error("Ошибка поиска пользователей:", error); return []; }
};


// --- Функции для Event Service (Друзья, Приватность - Порт 8082, путь /api/profiles) ---

/** Добавляет пользователя в друзья */
export const addFriend = async (friendId) => {
    console.log(`API: Вызов addFriend для ID=${friendId}`);
    return request(BASE_URL_PROFILES_IN_EVENTS, `/me/friends/${friendId}`, { method: 'POST' });
};

/** Удаляет пользователя из друзей */
export const removeFriend = async (friendId) => {
    console.log(`API: Вызов removeFriend для ID=${friendId}`);
    return request(BASE_URL_PROFILES_IN_EVENTS, `/me/friends/${friendId}`, { method: 'DELETE' });
};

/** Получает список ID друзей текущего пользователя */
export const getMyFriendIds = async () => {
    console.log("API: Вызов getMyFriendIds");
    try {
        // Ожидаем от бэкенда объект { friendIds: [10, 12, ...] }
        const responseDto = await request(BASE_URL_PROFILES_IN_EVENTS, '/me/friends', { method: 'GET' });
        console.log("API Layer: getMyFriendIds получил ответ:", responseDto);
        // Проверяем, что ответ - это объект и у него есть свойство friendIds, которое является массивом
        if (responseDto && Array.isArray(responseDto.friendIds)) {
            return responseDto.friendIds; // Возвращаем МАССИВ ID
        } else {
            console.warn("Ответ getMyFriendIds не содержит массив 'friendIds':", responseDto);
            return []; // Возвращаем пустой массив при некорректном формате
        }
    } catch (error) {
        console.error("Ошибка в API getMyFriendIds:", error);
        // Возвращаем пустой массив при ошибке, чтобы вызывающий код мог это обработать
        return [];
    }
};

/** Обновляет настройку приватности текущего пользователя */
export const updateMyPrivacySetting = async (privacySetting) => {
    console.log(`API: Вызов updateMyPrivacySetting с setting=${privacySetting}`);
    return request(BASE_URL_PROFILES_IN_EVENTS, '/me/privacy', {
        method: 'PUT',
        body: { setting: privacySetting } // Отправляем JSON { "setting": "VALUE" }
    });
};

/** Получает настройку приватности текущего пользователя */
export const getMyPrivacySetting = async () => {
    console.log("API: Вызов getMyPrivacySetting");
    // Ожидаем JSON { setting: 'VALUE' }
    return request(BASE_URL_PROFILES_IN_EVENTS, '/me/privacy', { method: 'GET' });
};


// --- Функции для Event Service (События - Порт 8082, путь /api/events) ---

/** Получает страницу опубликованных событий */
export const getEvents = async (pageable = { page: 0, size: 20 }) => {
     const params = new URLSearchParams({ page: pageable.page, size: pageable.size }).toString();
     return request(BASE_URL_EVENTS_API, `?${params}`, { method: 'GET' });
 };

/** Получает детали конкретного события */
export const getEventById = async (eventId) => {
     return request(BASE_URL_EVENTS_API, `/${eventId}`, { method: 'GET' });
 };

/** Создает новое событие */
export const createEvent = async (eventData) => {
    return request(BASE_URL_EVENTS_API, '', { method: 'POST', body: eventData });
};

/** Получает события, созданные ТЕКУЩИМ организатором */
export const getMyEventsAsOrganizer = async (pageable = { page: 0, size: 10 }) => {
     const params = new URLSearchParams({ page: pageable.page, size: pageable.size }).toString();
    return request(BASE_URL_EVENTS_API, `/my?${params}`, { method: 'GET' });
};

/** Получает события, ожидающие модерации (для админа/модератора) */
export const getPendingEvents = async (pageable = { page: 0, size: 20 }) => {
    const params = new URLSearchParams({ page: pageable.page, size: pageable.size, sort: 'createdAt,asc' }).toString();
    return request(BASE_URL_EVENTS_API, `/pending?${params}`, { method: 'GET' });
};

/** Одобряет событие (для админа/модератора) */
export const approveEvent = async (eventId) => {
    return request(BASE_URL_EVENTS_API, `/${eventId}/approve`, { method: 'POST' });
};

/** Отклоняет событие (для админа/модератора) */
export const rejectEvent = async (eventId, reason) => {
    const requestBody = reason ? { comment: reason } : null;
    return request(BASE_URL_EVENTS_API, `/${eventId}/reject`, { method: 'POST', body: requestBody });
};

/** Получает события, в которых участвует ТЕКУЩИЙ пользователь */
export const getMyParticipatingEvents = async (pageable = { page: 0, size: 10 }) => {
     const params = new URLSearchParams({ page: pageable.page, size: pageable.size }).toString();
     return request(BASE_URL_EVENTS_API, `/participating?${params}`, { method: 'GET' });
};

/** Получает избранные события ТЕКУЩЕГО пользователя */
export const getMyFavoriteEvents = async (pageable = { page: 0, size: 10 }) => {
      const params = new URLSearchParams({ page: pageable.page, size: pageable.size }).toString();
      return request(BASE_URL_EVENTS_API, `/favorites?${params}`, { method: 'GET' });
 };

/** Регистрирует ТЕКУЩЕГО пользователя на событие */
export const registerForEvent = async (eventId) => {
     return request(BASE_URL_EVENTS_API, `/${eventId}/register`, { method: 'POST' });
};

/** Снимает регистрацию ТЕКУЩЕГО пользователя с события */
export const unregisterFromEvent = async (eventId) => {
    return request(BASE_URL_EVENTS_API, `/${eventId}/unregister`, { method: 'DELETE' });
};

/** Добавляет событие в избранное ТЕКУЩЕГО пользователя */
export const addEventToFavorites = async (eventId) => {
    return request(BASE_URL_EVENTS_API, `/${eventId}/favorite`, { method: 'POST' });
};

/** Удаляет событие из избранного ТЕКУЩЕГО пользователя */
export const removeEventFromFavorites = async (eventId) => {
    return request(BASE_URL_EVENTS_API, `/${eventId}/favorites`, { method: 'DELETE' });
};

/** Получает события, в которых участвует ДРУГОЙ пользователь */
export const getUserParticipatingEvents = async (userId, pageable = { page: 0, size: 10 }) => {
    const params = new URLSearchParams({ page: pageable.page, size: pageable.size }).toString();
    return request(BASE_URL_EVENTS_API, `/user/${userId}/participating?${params}`, { method: 'GET' });
};

/** Получает избранные события ДРУГОГО пользователя */
export const getUserFavoriteEvents = async (userId, pageable = { page: 0, size: 10 }) => {
     const params = new URLSearchParams({ page: pageable.page, size: pageable.size }).toString();
     return request(BASE_URL_EVENTS_API, `/user/${userId}/favorites?${params}`, { method: 'GET' });
};

/** Отправляет приглашение другу на мероприятие */
export const inviteFriendToEvent = async (eventId, friendId) => {
    console.log(`API: Попытка пригласить друга ${friendId} на событие ${eventId}`);
    return request(BASE_URL_EVENTS_API, `/${eventId}/invite/${friendId}`, { method: 'POST' });
};

/** Регистрирует друга на мероприятие (от имени текущего пользователя) */
export const registerFriendForEvent = async (eventId, friendId) => {
    console.log(`API: Попытка зарегистрировать друга ${friendId} на событие ${eventId}`);
    return request(BASE_URL_EVENTS_API, `/${eventId}/register-friend/${friendId}`, { method: 'POST' });
};