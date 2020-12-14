import React from 'react';
import {IonImg, IonItem, IonLabel} from "@ionic/react";
import {GarmentProps} from "./GarmentProps";

interface GarmentPropsExt extends GarmentProps {
    onEdit: (_id?: string) => void;
}

const Garment: React.FC<GarmentPropsExt> = ({_id, name, material, inaltime, latime, descriere, longitudine, latitudine,photo, onEdit}) => {
  return (
      <IonItem onClick={() => onEdit(_id)}>
          <IonLabel>{name}</IonLabel>
          <IonImg class='imgs' src={photo}/>
      </IonItem>
  );
};

export default Garment;