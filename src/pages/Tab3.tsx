import {
    IonContent, IonFab, IonFabButton,
    IonHeader, IonIcon,
    IonList,
    IonPage, IonSearchbar,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import React, {useContext, useEffect, useState} from 'react';
import {GarmentContext} from "../todo/GarmentProvider";
import {GarmentProps} from "../todo/GarmentProps";
import {RouteComponentProps} from "react-router";
import Garment from "../todo/Garment";
import {arrowBack} from "ionicons/icons";
import {MyMap} from "../components/MyMap";
import {log} from "util";


const Tab3: React.FC<RouteComponentProps> = ({history}) => {
    const {garments, fetchingError} = useContext(GarmentContext);
    const [displayed, setDisplayed] = useState<GarmentProps[]>([]);
    const [searchName, setSearchName] = useState<string>('');
    const [longitudine, setLng] = useState(23.613781929016113);
    const [latitudine, setLat] = useState(46.77860956692572);

    useEffect(() => {
        if (garments?.length) {
            setDisplayed(garments.filter(obj => obj.name.indexOf(searchName) == 0));
            const item = displayed[0];
            if(item) {
                console.log(item.name);
                setLat(item.latitudine);
                setLng(item.longitudine);
            }
        }
    }, [searchName]);


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Tailor App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonSearchbar
                    enterkeyhint='enter'
                    value={searchName}
                    debounce={300}
                    onIonChange={e => setSearchName(e.detail.value!)
                    }>
                </IonSearchbar>

                <MyMap
                    lat={latitudine}
                    lng={longitudine}
                    onMapClick={(location: any) => {
                        setLng(parseFloat(location.latLng.lng()));
                        setLat(parseFloat(location.latLng.lat()));
                        console.log("COORDONATE: " + location.latLng.lng() + " SI " + location.latLng.lat());
                    }}
                    onMarkerClick={log('onMarker')}
                />

                {fetchingError && (<div>{fetchingError.message || 'Failed to fetch garments'}</div>)}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/garments')}>
                        <IonIcon icon={arrowBack}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
}

export default Tab3;
