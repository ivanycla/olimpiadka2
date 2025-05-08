// src/comp/UI/Map/Map.jsx
import React, { useEffect, useCallback, memo, useRef } from 'react';
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';

const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '8px',
    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
    overflow: 'hidden'
};

const initialCenter = [53.902284, 27.561831];

const MapComponent = memo(({ markers = [] }) => {
    const mapRef = useRef(null);
    const apiKey = process.env.REACT_APP_YANDEX_MAPS_API_KEY;

    const getMarkerIcon = (color = 'ff0000') => 
        `data:image/svg+xml,%3Csvg width='48' height='60' viewBox='0 0 48 60' 
          xmlns='http://www.w3.org/2000/svg'%3E
          %3Cpath d='M24 0C12.954 0 4 8.954 4 20c0 15 20 40 20 40s20-25 20-40C44 8.954 35.046 0 24 0zm0 30
          c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z' 
          fill='%23${color}'/%3E
          %3Ccircle cx='24' cy='20' r='5' fill='%23fff'/%3E
          %3C/svg%3E`;

    const handleApiLoad = useCallback((ymaps) => {
        console.log('Yandex Maps API loaded');
        tryAutoSetBounds(ymaps);
    }, []);

    const tryAutoSetBounds = useCallback((ymaps) => {
        if (!mapRef.current || !markers.length) return;

        const validMarkers = markers.filter(m => 
            typeof m?.lat === 'number' && 
            typeof m?.lng === 'number'
        );

        if (validMarkers.length === 0) return;

        const points = validMarkers.map(m => [m.lat, m.lng]);

        try {
            const bounds = ymaps.util.bounds.fromPoints(points);
            
            if (validMarkers.length === 1) {
                mapRef.current.setCenter(points[0], 15);
            } else {
                mapRef.current.setBounds(bounds, {
                    checkZoomRange: true,
                    zoomMargin: 50
                });
            }
        } catch (error) {
            console.error('Bounds calculation error:', error);
            mapRef.current.setCenter(initialCenter, 10);
        }
    }, [markers]);

    useEffect(() => {
        if (window.ymaps) {
            tryAutoSetBounds(window.ymaps);
        }
    }, [tryAutoSetBounds, markers]);

    if (!apiKey) {
        return (
            <div style={{ 
                color: 'red', 
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#ffe6e6',
                borderRadius: '8px',
                margin: '20px'
            }}>
                Ошибка: Добавьте Яндекс.Карты API ключ в .env файл как REACT_APP_YANDEX_MAPS_API_KEY
            </div>
        );
    }

    return (
        <YMaps query={{ apikey: apiKey }}>
            <Map
                defaultState={{ center: initialCenter, zoom: 10 }}
                style={mapContainerStyle}
                instanceRef={mapRef}
                onLoad={handleApiLoad}
                options={{
                    autoFitToViewport: 'always',
                    suppressMapOpenBlock: true,
                    yandexMapDisablePoiInteractivity: true
                }}
            >
                <ZoomControl options={{ 
                    float: 'right',
                    position: { right: 20, top: 150 }
                }} />
                
                <GeolocationControl options={{ 
                    float: 'left',
                    position: { left: 20, top: 150 }
                }} />

                {markers.map((marker) => {
                      const hasSpeakers = marker.speaker?.length > 0;
                      const markerColor = hasSpeakers ? '4a76a8' : 'ff0000';
                      return(
                    <Placemark
    key={marker.id}
    geometry={[marker.lat, marker.lng]}
    properties={{
        balloonContentBody: 
        
        `
        <div style="
            height: 100vh;
            width: 400px;
            background: rgb(57, 57, 57);
            color: #d5d5d5;
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;
            box-shadow: -2px 0 15px rgba(0,0,0,0.3);
        ">
            <div style="
                padding: 20px;
                overflow-y: auto;
                flex-grow: 1;
            ">
                ${marker.mediaContentUrl ? 
                    `<div style="
                        width: 100%;
                        height: 250px;
                        overflow: hidden;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    ">
                        <img src="${marker.mediaContentUrl}" 
                            style="
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            " 
                            alt="${marker.title || 'Медиа'}">
                    </div>` 
                    : 
                    `<div style="
                        width: 100%;
                        height: 250px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #444;
                        color: #aaa;
                        font-style: italic;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    ">
                        Нет изображения
                    </div>`
                }
                
                <h3 style="
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 15px 0;
                ">
                    ${marker.title || 'Без названия'}
                </h3>

                ${marker.organizerUsername && `
                    <div style="margin-bottom: 15px;">
                        <p style="
                            font-size: 0.9rem;
                            color: #aaa;
                            margin: 0;
                        ">
                            Организатор: ${marker.organizerUsername}
                        </p>
                    </div>`
                }

                <div style="
                    background: #444;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                ">
                    ${marker.description 
                    || 'Описание отсутствует'}
                </div>

                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        background: #444;
                        padding: 15px;
                        border-radius: 8px;
                    ">
                        <div style="font-size: 0.9rem; color: #b5b5b5;">Формат,Адрес</div>
                        <div>
                        ${marker.format ? `Формат: ${marker.format}` : ''}
                        ${marker.info.address ? `Адрес: ${marker.info.address}` : ''}
                        ${!marker.format && !marker.info.address ? 'не указан' : ''}
                        </div>
                    </div>

                    <div style="
                        background: #444;
                        padding: 15px;
                        border-radius: 8px;
                    ">
                        <div style="font-size: 0.9rem; color: #b5b5b5;">Длительность</div>
                        <div>${marker.duration ? `${marker.duration} мин` : 'не указана'}</div>
                    </div>
                    ${marker.speaker?.length > 0 ?
                        `
                        <div style="
                            background: #444;
                            padding: 15px;
                            border-radius: 8px;
                        ">
                            <div style="font-size: 0.9rem; color: #b5b5b5;">Спикеры</div>
                            <div>
                                ${marker.speaker.map(speaker => `
                                    <div>${speaker}</div>
                                `).join('')}
                            </div>
                        </div>
                        `
                    : ''}
                    <div style="
                        background: #444;
                        padding: 15px;
                        border-radius: 8px;
                    ">
                        <div style="font-size: 0.9rem; color: #b5b5b5;">Начало</div>
                        <div>${marker.info.date }</div>
                    </div>

                   
                </div>

                <a href="https://yandex.ru/maps/?rtext=~${marker.lat},${marker.lng}" 
                   target="_blank"
                   rel="noopener noreferrer"
                   style="
                        display: block;
                        text-align: center;
                        background: #4a76a8;
                        color: white;
                        padding: 15px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 500;
                        transition: background 0.3s;
                   ">
                    Проложить маршрут
                </a>
            </div>
        </div>`
    }}
    options={{
        iconLayout: 'default#image',
        iconImageHref: getMarkerIcon(markerColor),
        iconImageSize: [48, 60],
        iconImageOffset: [-24, -60],
        hideIconOnBalloonOpen: false,
        balloonOffset: [0, -60],
        balloonPanelMaxMapArea: Infinity
    }}
    modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
/>)})}
            </Map>
        </YMaps>
    );
});

export default MapComponent;