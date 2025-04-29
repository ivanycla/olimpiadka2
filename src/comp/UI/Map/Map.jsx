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
    
    const testMarkers = [
        {
            id: 1,
            lat: 53.902284,
            lng: 27.561831,
            title: 'Минск',
            info: 'Столица Беларуси'
        },
        {
            id: 2,
            lat: 53.9,
            lng: 27.56,
            title: 'Точка рядом'
        }
    ];

    const handleApiLoad = useCallback((ymaps) => {
        console.log('Yandex Maps API loaded');
        tryAutoSetBounds(ymaps);
    }, []);

    const tryAutoSetBounds = useCallback((ymaps) => {
        if (!mapRef.current || !testMarkers.length) return;

        const points = testMarkers
            .filter(m => m?.lat && m?.lng)
            .map(m => [m.lat, m.lng]);

        if (points.length > 0) {
            try {
                const bounds = ymaps.util.bounds.fromPoints(points);
                const isBoundsValid = bounds[0][0] !== bounds[1][0] || bounds[0][1] !== bounds[1][1];
                
                if (!isBoundsValid && points.length === 1) {
                    mapRef.current.setCenter(points[0], 15);
                } else if (isBoundsValid) {
                    mapRef.current.setBounds(bounds, {
                        checkZoomRange: true,
                        zoomMargin: 50
                    });
                }
            } catch (error) {
                console.error('Bounds error:', error);
            }
        }
    }, [testMarkers]);

    useEffect(() => {
        if (window.ymaps) {
            tryAutoSetBounds(window.ymaps);
        }
    }, [tryAutoSetBounds]);

    if (!apiKey) {
        return <div style={{ color: 'red', padding: '20px' }}>
            Ошибка: Добавьте Яндекс.Карты API ключ в .env файл как REACT_APP_YANDEX_MAPS_API_KEY
        </div>;
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
                    suppressMapOpenBlock: true
                }}
            >
                <ZoomControl options={{ float: 'right' }} />
                <GeolocationControl options={{ float: 'left' }} />

                {testMarkers.map((marker) => (
                    <Placemark
                        key={marker.id}
                        geometry={[marker.lat, marker.lng]}
                        properties={{
                            balloonContentHeader: marker.title,
                            balloonContentBody: marker.info,
                        }}
                        options={{
                            iconLayout: 'default#image',
                            iconImageHref: process.env.PUBLIC_URL + '/icons/2211f8cc5b35a7cd807586328bc33e35.png',
                            iconImageSize: [48, 48],
                            iconImageOffset: [-24, -48]
                        }}
                    />
                ))}

                <Placemark
                    geometry={[53.942595, 27.598719]}
                    properties={{
                        hintContent: 'Monobyket',
                        balloonContent: 'Г. Минск, Ул. Леонида Беды 46, ТЦ "4 сезона"',
                    }}
                    options={{
                        iconLayout: 'default#image',
                        iconImageHref: process.env.PUBLIC_URL + '/icons/2211f8cc5b35a7cd807586328bc33e35.png',
                        iconImageSize: [48, 48],
                        iconImageOffset: [-24, -48]
                    }}
                />
            </Map>
        </YMaps>
    );
});

export default MapComponent;