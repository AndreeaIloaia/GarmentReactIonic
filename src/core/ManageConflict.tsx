import {RouteComponentProps} from "react-router";
import {useContext, useEffect, useState} from "react";
import {GarmentContext} from "../todo/GarmentProvider";
import {GarmentProps} from "../todo/GarmentProps";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonLoading,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import React from "react";

const ManageConflict: React.FC<RouteComponentProps> = ({history}) => {
    const { conflict } = useContext(GarmentContext);
    const {saving, savingError, saveGarment} = useContext(GarmentContext);

    const [firstElem, setFirstElem] = useState<GarmentProps>();
    const [secondElem, setSecondElem] = useState<GarmentProps>();

    useEffect(manageConflict, []);

    function  manageConflict() {
        if(!conflict || conflict?.length === 0) {
            history.goBack();
            return;
        }
        setFirstElem(conflict[0]);
        setSecondElem(conflict[1]);
    }

    const handleSave = (garment: GarmentProps) => {
        saveGarment && saveGarment(garment, true).then(() => {
            conflict?.shift();
            conflict?.shift();
            manageConflict();
        });
    };
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Version conflicts</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {firstElem && (<ConflictView garment={firstElem} onAction={handleSave}/>)}
                <div className={'guitar-header'}>VS</div>
                {secondElem && (<ConflictView garment={secondElem} onAction={handleSave}/>)}
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ManageConflict;

export const ConflictView: React.FC<{ garment: GarmentProps, onAction: (garment: GarmentProps) => void }> = ({ garment, onAction }) => {
    return (
        <IonCard>
            <IonCardHeader className={'guitar-header'}>
                <IonCardSubtitle>Nume item</IonCardSubtitle>
                <IonCardTitle>{garment.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonGrid>
                    <IonRow>
                        <IonCol>Nume</IonCol>
                        <IonCol>${garment.name}</IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>Material</IonCol>
                        <IonCol>{garment.material}</IonCol>
                    </IonRow>
                </IonGrid>
                <IonButton onClick={() => onAction(garment)} class={'action-button'}>Accept this version</IonButton>
            </IonCardContent>
        </IonCard>
    );
};