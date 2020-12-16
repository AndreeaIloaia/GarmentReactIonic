import React, {useContext, useEffect, useState} from "react";
import {getLogger} from '../core';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonButtons, IonCol,
    IonContent, IonFab, IonFabButton, IonGrid,
    IonHeader, IonIcon, IonImg,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage, IonRow,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import {GarmentContext} from "./GarmentProvider";
import {GarmentProps} from "./GarmentProps";
import {camera} from "ionicons/icons";
import {usePhotoGallery} from "../core/UsePhotoGallery";
import {useMyLocation} from "../core/UseMyLocation";
import {MyMap} from "../components/MyMap";

const log = getLogger('GarmentEdit');

interface GarmentEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const GarmentEdit: React.FC<GarmentEditProps> = ({history, match}) => {
    const {garments, saving, savingError, saveGarment} = useContext(GarmentContext);
    const [name, setText] = useState('');
    const [material, setMaterial] = useState('');
    const [inaltime, setInaltime] = useState('');
    const [latime, setLatime] = useState('');
    const [descriere, setDescriere] = useState('');
    const [photo, setPhoto] = useState('');

    // const myLocation = useMyLocation();
    // const {latitude: latitudine, longitude: longitudine} = myLocation.position?.coords || {}

    const [longitudine, setLng] = useState(23.613781929016113);
    const [latitudine, setLat] = useState(46.77860956692572);

    const [garment, setGarment] = useState<GarmentProps>();
    const routeId = match.params.id || '';

    const {photos, takePhoto} = usePhotoGallery();


    useEffect(() => {
        log('useEffect');
        //const routeId = match.params.id || '';
        const garment = garments?.find(i => i._id === routeId);
        setGarment(garment);
        if (garment) {
            setText(garment.name);
            setMaterial(garment.material);
            setInaltime(garment.inaltime);
            setLatime(garment.latime);
            setDescriere(garment.descriere);
            setPhoto(garment.photo);
            setLng(garment.longitudine);
            setLat(garment.latitudine);
        }
    }, [match.params.id, garments]);

    const handleSave = () => {
        const editedGer = garment ? {
            ...garment,
            name,
            material,
            inaltime,
            latime,
            descriere,
            longitudine,
            latitudine,
            photo
        } : {
            name,
            material,
            inaltime,
            latime,
            descriere,
            longitudine,
            latitudine,
            photo
        };
        saveGarment && saveGarment(editedGer).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>SAVE MEEE</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}> SAVE ME BABEEE </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem className="ion-text-wrap">
                    <IonLabel className="labels">Nume item vestimentar</IonLabel>
                    <IonInput class="inputs" placeholder="Nume" value={name}
                              onIonChange={e => setText(e.detail.value || '')}/>
                </IonItem>
                <IonItem className="ion-text-wrap">
                    <IonLabel className="labels">Material</IonLabel>
                    <IonInput class="inputs" placeholder="Material" value={material}
                              onIonChange={e => setMaterial(e.detail.value || '')}/>
                </IonItem>
                <IonItem className="ion-text-wrap">
                    <IonLabel className="labels">Inaltime</IonLabel>
                    <IonInput class="inputs" placeholder="Inaltime" value={inaltime}
                              onIonChange={e => setInaltime(e.detail.value || '')}/>
                </IonItem>
                <IonItem className="ion-text-wrap">
                    <IonLabel className="labels">Latime</IonLabel>
                    <IonInput class="inputs" placeholder="Latime" value={latime}
                              onIonChange={e => setLatime(e.detail.value || '')}/>
                </IonItem>
                <IonItem className="ion-text-wrap">
                    <IonLabel className="labels">Descriere</IonLabel>
                    <IonInput class="inputs" placeholder="Descriere" value={descriere}
                              onIonChange={e => setDescriere(e.detail.value || '')}/>
                </IonItem>
                {photo && <IonItem>
                    <IonImg src={photo}/>
                </IonItem>}

                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save this garment...'}</div>
                )}
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
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => {
                        const newPhoto = takePhoto(routeId);
                        console.log(newPhoto);
                        newPhoto.then((i) => {
                            setPhoto(i.webviewPath!);
                            console.log(i.webviewPath);
                            console.log(photo);
                        });
                    }}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};
export default GarmentEdit;