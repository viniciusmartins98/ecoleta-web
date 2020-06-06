import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle= {
    width: '100%',
    height: '500px',
    marginBottom: '20px',
    marginTop: 0,
    borderRadius: '10px'
}

interface MapProperties {
    markPosition: {
        lat: number;
        lng: number;
    };

    initialPosition: {
        lat: number;
        lng: number;
    };

    handleClick: ((e: google.maps.MouseEvent) => void);
}

const Map: React.FC<MapProperties> = (props) => {
    const [markLatLng, setMarkLatLng] = useState(props.initialPosition)
    useEffect(() => {
        setMarkLatLng(props.markPosition);
    }, [props]);

    return (
        <LoadScript
            googleMapsApiKey="AIzaSyCaGiSd2GVPw6ICVDIRAaft2SwOBS6P1mk"
        >
            <GoogleMap 
                center={props.initialPosition}
                mapContainerStyle={containerStyle}
                zoom={15}
                onClick={props.handleClick}
            >
                <Marker position={markLatLng}/>
            </GoogleMap>
        </LoadScript>
    );
};

export default React.memo(Map);