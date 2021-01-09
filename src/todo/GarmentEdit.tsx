import React, {useContext, useEffect, useState} from "react";
import {getLogger} from '../core';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonButtons,
    IonContent, IonFab, IonFabButton, IonGrid,
    IonHeader, IonIcon, IonImg,
    IonInput, IonItem, IonLabel,
    IonLoading, IonModal,
    IonPage,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import {GarmentContext} from "./GarmentProvider";
import {GarmentProps} from "./GarmentProps";
import {camera} from "ionicons/icons";
import {usePhotoGallery} from "../core/UsePhotoGallery";
import {MyMap} from "../components/MyMap";
import {useNetwork} from "../core/UseNetState";
import {createAnimation} from '@ionic/react';


const log = getLogger('GarmentEdit');

interface GarmentEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const GarmentEdit: React.FC<GarmentEditProps> = ({history, match}) => {

        const {
            garments, saving, savingError, saveGarment, updateServer
        } = useContext(GarmentContext);
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

        const routeId = match.params.id || '';

        const {takePhoto} = usePhotoGallery();

        const [status, setStatus] = useState('empty');
        const [versiune, setVersiune] = useState(0);
        const [lastModified, setLastModified] = useState(new Date());
        const [showModal, setShowModal] = useState(false);
        // const [status, setStatus] = useState('');
        const [garment, setGarment] = useState<GarmentProps>();
        const [chainedAnimationBoolean, setChainedAnimation] = useState(false);
        const {networkStatus} = useNetwork();

        useEffect(groupAnimation, []);

        useEffect(() => {
            log('useEffect');
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
                setVersiune(garment.versiune);
                setStatus(garment.status);
                setLastModified(garment.lastModified);
                if (status === 'Conflict')
                    setShowModal(true);
                log("STATUS: " + status);
            }
        }, [match.params.id, garments, status]);
        // }, [match.params.id, garments, getGarmentSrv]);

        // useEffect(() => {
        //     setGarmentNew(firstGarment);
        // }, [firstGarment]);


        const handleSave = () => {
            if (name === '' || material === '' || inaltime === '' || latime === '' || descriere === '') {
                chainedAnimation();
            } else {
                const editedGer = garment ? {
                    ...garment,
                    name,
                    material,
                    inaltime,
                    latime,
                    descriere,
                    status: 'empty',
                    versiune: versiune + 1,
                    lastModified,
                    longitudine,
                    latitudine,
                    photo
                } : {
                    name,
                    material,
                    inaltime,
                    latime,
                    descriere,
                    status: 'empty',
                    versiune: versiune + 1,
                    lastModified,
                    longitudine,
                    latitudine,
                    photo
                };
                saveGarment && saveGarment(editedGer, networkStatus.connected).then(() => history.goBack());
            }
        };

        const myVersion = async () => {
            setShowModal(false)
            setStatus('empty');
            const editedGer = garment ? {
                ...garment,
                name,
                material,
                inaltime,
                latime,
                descriere,
                status: "empty",
                versiune: versiune + 1,
                lastModified,
                longitudine,
                latitudine,
                photo
            } : {
                name,
                material,
                inaltime,
                latime,
                descriere,
                status: "empty",
                versiune: versiune + 1,
                lastModified,
                longitudine,
                latitudine,
                photo
            };
            saveGarment && saveGarment(editedGer, true).then(() => {
                history.push('/garments');
                history.go(0);
            })
        }

        const serverVersion = async () => {
            log("SERVER VERSION");
            setShowModal(false)
            setStatus('empty');
            const editedGer = garment;
            if (editedGer) {
                editedGer.status = 'empty';
                log("ST: " + garment?.status);

                updateServer && updateServer(editedGer).then(() => {
                    history.push('/garments');
                    history.go(0);
                })
            }
            history.push('/garments');
            history.go(0);
        }

        const shake = [
            {offset: 0, transform: 'scale(0.8) rotate(0)'},
            {offset: 0.05, transform: 'scale(0.8) rotate(5deg)'},
            {offset: 0.10, transform: 'scale(0.8) rotate(10deg)'},
            // {offset: 0.15, transform: 'scale(1) rotate(15deg)'},
            // {offset: 0.20, transform: 'scale(1) rotate(10deg)'},
            {offset: 0.15, transform: 'scale(0.8) rotate(5deg)'},
            {offset: 0.20, transform: 'scale(0.8) rotate(0)'},
            {offset: 0.25, transform: 'scale(0.8) rotate(-5deg)'},
            {offset: 0.30, transform: 'scale(0.8) rotate(-10deg)'},
            {offset: 0.35, transform: 'scale(0.8) rotate(-15deg)'},
            {offset: 0.40, transform: 'scale(0.8) rotate(-10deg)'},
            {offset: 0.45, transform: 'scale(0.8) rotate(-5deg)'},

            {offset: 0.5, transform: 'scale(0.8) rotate(0deg)'},

            {offset: 0.55, transform: 'scale(0.8) rotate(5deg)'},
            {offset: 0.60, transform: 'scale(0.8) rotate(10deg)'},
            {offset: 0.65, transform: 'scale(0.8) rotate(15deg)'},
            {offset: 0.70, transform: 'scale(0.8) rotate(10deg)'},
            {offset: 0.75, transform: 'scale(0.8) rotate(5deg)'},
            {offset: 0.80, transform: 'scale(0.8) rotate(0)'},
            {offset: 0.85, transform: 'scale(0.8) rotate(-5deg)'},
            {offset: 0.90, transform: 'scale(0.8) rotate(-10deg)'},
            // {offset: 0.75, transform: 'scale(1) rotate(-15deg)'},
            // {offset: 0.80, transform: 'scale(1) rotate(-10deg)'},
            {offset: 0.95, transform: 'scale(0.8) rotate(-5deg)'},
            {offset: 1, transform: 'scale(0.8) rotate(0)'}
        ]

        function groupAnimation() {
            const label1 = document.querySelector('.labels-1');
            const label2 = document.querySelector('.labels-2');
            const label3 = document.querySelector('.labels-3');
            const label4 = document.querySelector('.labels-4');
            const label5 = document.querySelector('.labels-5');
            if (label1 && label2 && label3 && label4 && label5) {
                const animation1 = createAnimation()
                    .addElement(label1)
                    .keyframes(shake);
                const animation2 = createAnimation()
                    .addElement(label2)
                    .keyframes(shake);
                const animation3 = createAnimation()
                    .addElement(label3)
                    .keyframes(shake);
                const animation4 = createAnimation()
                    .addElement(label4)
                    .keyframes(shake);
                const animation5 = createAnimation()
                    .addElement(label5)
                    .keyframes(shake);
                const parentAnimation = createAnimation()
                    .duration(700)
                    .addAnimation([animation1, animation2, animation3, animation4, animation5]);
                parentAnimation.play();
            }
        }

        function chainedAnimation() {
            const input1 = document.querySelector('.inputs-1');
            const input2 = document.querySelector('.inputs-2');
            const input3 = document.querySelector('.inputs-3');
            const input4 = document.querySelector('.inputs-4');
            const input5 = document.querySelector('.inputs-5');

            if (input1 && input2 && input3 && input4 && input5) {
                const animation1 = createAnimation()
                    .addElement(input1)
                    .duration(500)
                    .beforeStyles({
                        opacity: 0.3,
                        color: 'red'
                    })
                    .afterClearStyles(['opacity'])
                    .keyframes([
                        {offset: 0, transform: 'scale(1)'},
                        {offset: 0.5, transform: 'scale(1.1)'},
                        {offset: 1, transform: 'scale(1)'}
                    ]);
                const animation2 = createAnimation()
                    .addElement(input2)
                    .duration(500)
                    .beforeStyles({
                        opacity: 0.3,
                        color: 'red'
                    })
                    .afterClearStyles(['opacity'])
                    .keyframes([
                        {offset: 0, transform: 'scale(1)'},
                        {offset: 0.5, transform: 'scale(1.1)'},
                        {offset: 1, transform: 'scale(1)'}
                    ]);
                const animation3 = createAnimation()
                    .addElement(input3)
                    .duration(500)
                    .beforeStyles({
                        opacity: 0.3,
                        color: 'red'
                    })
                    .afterClearStyles(['opacity'])
                    .keyframes([
                        {offset: 0, transform: 'scale(1)'},
                        {offset: 0.5, transform: 'scale(1.1)'},
                        {offset: 1, transform: 'scale(1)'}
                    ]);
                const animation4 = createAnimation()
                    .addElement(input4)
                    .duration(500)
                    .beforeStyles({
                        opacity: 0.3,
                        color: 'red'
                    })
                    .afterClearStyles(['opacity'])
                    .keyframes([
                        {offset: 0, transform: 'scale(1)'},
                        {offset: 0.5, transform: 'scale(1.1)'},
                        {offset: 1, transform: 'scale(1)'}
                    ]);
                const animation5 = createAnimation()
                    .addElement(input5)
                    .duration(500)
                    .beforeStyles({
                        opacity: 0.3,
                        color: 'red'
                    })
                    .afterClearStyles(['opacity'])
                    .keyframes([
                        {offset: 0, transform: 'scale(1)'},
                        {offset: 0.5, transform: 'scale(1.1)'},
                        {offset: 1, transform: 'scale(1)'}
                    ]);
                (async () => {
                    if(name === '')
                        await animation1.play();
                    if(material === '')
                        await animation2.play();
                    if(inaltime === '')
                        await animation3.play();
                    if(latime === '')
                        await animation4.play();
                    if(descriere === '')
                        await animation5.play();
                })();
            }
        }

        log('render');
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>SAVE MEEE</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={handleSave} onChange={e => setChainedAnimation(true)}> SAVE ME
                                BABEEE </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {status && status === 'Conflict' &&
                    <IonModal isOpen={showModal} cssClass='my-custom-class'>
                        <p color='red'>There is a conflict!</p>
                        <p>You can keep your version or update with the last one from server</p>
                        <IonButton onClick={myVersion}>My Version</IonButton>
                        <IonButton onClick={serverVersion}>Last version</IonButton>
                        <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
                    </IonModal>
                    }
                    <IonItem className="ion-text-wrap">
                        <IonLabel className="labels labels-1">Nume</IonLabel>
                        <IonInput class="inputs inputs-1" placeholder="Nume" value={name}
                                  onIonChange={e => setText(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem className="ion-text-wrap">
                        <IonLabel className="labels labels-2">Material</IonLabel>
                        <IonInput class="inputs inputs-2" placeholder="Material" value={material}
                                  onIonChange={e => setMaterial(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem className="ion-text-wrap">
                        <IonLabel className="labels labels-3">Inaltime</IonLabel>
                        <IonInput class="inputs inputs-3" placeholder="Inaltime" value={inaltime}
                                  onIonChange={e => setInaltime(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem className="ion-text-wrap">
                        <IonLabel className="labels labels-4">Latime</IonLabel>
                        <IonInput class="inputs inputs-4" placeholder="Latime" value={latime}
                                  onIonChange={e => setLatime(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem className="ion-text-wrap">
                        <IonLabel className="labels labels-5">Descriere</IonLabel>
                        <IonInput class="inputs inputs-5" placeholder="Descriere" value={descriere}
                                  onIonChange={e => setDescriere(e.detail.value || '')}/>
                    </IonItem>
                    {photo && <IonItem>
                        <IonImg src={photo}/>
                    </IonItem>}

                    <IonLoading isOpen={saving}/>
                    {savingError && (
                        <div>{savingError.message || 'Failed to save this garment...'}</div>
                    )}
                    {networkStatus.connected && <MyMap
                        lat={latitudine}
                        lng={longitudine}
                        onMapClick={(location: any) => {
                            setLng(parseFloat(location.latLng.lng()));
                            setLat(parseFloat(location.latLng.lat()));
                            console.log("COORDONATE: " + location.latLng.lng() + " SI " + location.latLng.lat());
                        }}
                        onMarkerClick={log('onMarker')}
                    />}
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
    }
;
export default GarmentEdit;