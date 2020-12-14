import React from 'react';
import {IonItem, IonLabel} from "@ionic/react";
import {GarmentProps} from "./GarmentProps";

interface GarmentPropsExt extends GarmentProps {
    onEdit: (_id?: string) => void;
}

const Garment: React.FC<GarmentPropsExt> = ({_id, name, material, inaltime, latime, descriere, status, versiune, onEdit}) => {
    let colorStatus = 'primary';
    if(status === 'Conflict')
        colorStatus = 'danger';
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel color={colorStatus} slot="end">
                {status !== "empty" && (<small>{status}</small>)}
            </IonLabel>
        </IonItem>
    );
};

export default Garment;