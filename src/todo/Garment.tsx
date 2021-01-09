import React from 'react';
import {IonIcon, IonImg, IonItem, IonLabel} from "@ionic/react";
import {GarmentProps} from "./GarmentProps";
import {usePhotoGallery} from "../core/UsePhotoGallery";
import {camera, gridSharp} from "ionicons/icons";

interface GarmentPropsExt extends GarmentProps {
    onEdit: (_id?: string) => void;
}

const Garment: React.FC<GarmentPropsExt> = ({_id, name, material, inaltime, latime, descriere, status, versiune, longitudine, latitudine, onEdit}) => {
    let idGarment = _id;
    if (!idGarment) {
        idGarment = "";
    }

    const {photo} = usePhotoGallery(idGarment);
    let colorStatus = 'primary';
    if (status === 'Conflict')
        colorStatus = 'danger';


    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel color={colorStatus} slot="end">
                {status !== "empty" && (<small>{status}</small>)}
            </IonLabel>
            {photo?.webviewPath &&
                <IonImg slot="end" class='imgs' src={photo?.webviewPath}/>
            }
            {!photo?.webviewPath &&
            <IonIcon slot="end" icon={camera}/>}
        </IonItem>
    );
};

export default Garment;
