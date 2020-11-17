import React from 'react';
import {IonItem, IonLabel} from "@ionic/react";
import {GarmentProps} from "./GarmentProps";

interface GarmentPropsExt extends GarmentProps {
    onEdit: (_id?: string) => void;
}

const Garment: React.FC<GarmentPropsExt> = ({_id, name, material, inaltime, latime, descriere, onEdit}) => {
  return (
      <IonItem onClick={() => onEdit(_id)}>
          <IonLabel>{name}</IonLabel>
      </IonItem>
  );
};

export default Garment;