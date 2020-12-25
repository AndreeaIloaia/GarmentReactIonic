import React, {useContext, useEffect, useState} from "react";
import {getLogger} from '../core';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonLabel,
    IonLoading, IonModal,
    IonPage,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import {GarmentContext} from "./GarmentProvider";
import {GarmentProps} from "./GarmentProps";
import {useNetwork} from "../core/UseNetState";

const log = getLogger('GarmentEdit');

interface GarmentEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const GarmentEdit: React.FC<GarmentEditProps> = ({history, match}) => {
    const {
        garments, saving, savingError, saveGarment, updateServer
        // deleteGarment, getGarmentSrv, firstGarment
    } = useContext(GarmentContext);
    const [name, setText] = useState('');
    const [material, setMaterial] = useState('');
    const [inaltime, setInaltime] = useState('');
    const [latime, setLatime] = useState('');
    const [descriere, setDescriere] = useState('');
    const [status, setStatus] = useState('empty');
    const [versiune, setVersiune] = useState(0);
    const [lastModified, setLastModified] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [otherDevice, setDevice] = useState(false);
    // const [status, setStatus] = useState('');
    const [garment, setGarment] = useState<GarmentProps>();
    // const [garmentNew, setGarmentNew] = useState<GarmentProps>();

    const {networkStatus} = useNetwork();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const garment = garments?.find(i => i._id === routeId);
        setGarment(garment);
        if (garment) {
            setText(garment.name);
            setMaterial(garment.material);
            setInaltime(garment.inaltime);
            setLatime(garment.latime);
            setDescriere(garment.descriere);
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
        const editedGer = garment ? {
            ...garment,
            name,
            material,
            inaltime,
            latime,
            descriere,
            status: "empty",
            versiune: versiune + 1,
            lastModified
        } : {name, material, inaltime, latime, descriere, status: "empty", versiune: versiune + 1, lastModified};
        saveGarment && saveGarment(editedGer, networkStatus.connected).then(() => history.goBack());
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
            lastModified
        } : {name, material, inaltime, latime, descriere, status: "empty", versiune: versiune + 1, lastModified};
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
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save this garment...'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};
export default GarmentEdit;