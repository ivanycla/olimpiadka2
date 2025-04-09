import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import React, { useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 53.900000,
  lng: 27.566670
};

const Map = ({ markers }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: "10px" }}>
              <h3 style={{ margin: "0 0 5px 0" }}>{selectedMarker.title}</h3>
              <p style={{ margin: 0 }}>{selectedMarker.info}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;