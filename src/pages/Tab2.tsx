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


const Tab2: React.FC<RouteComponentProps> = ({history}) => {
    const {garments, fetchingError} = useContext(GarmentContext);
    const [displayed, setDisplayed] = useState<GarmentProps[]>([]);
    const [searchName, setSearchName] = useState<string>('');

    useEffect(() => {
        if (garments?.length) {
            setDisplayed(garments.filter(obj => obj.name.indexOf(searchName) >= 0));
        }
        // }, [searchName]);
    }, [searchName, garments]);


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Tailor App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonSearchbar
                    value={searchName}
                    debounce={300}
                    onIonChange={e => setSearchName(e.detail.value!)
                    }>
                </IonSearchbar>
                <IonList>
                    {displayed.map(({_id, name, material, inaltime, latime, descriere, status, versiune, lastModified, longitudine, latitudine, photo}) => {
                        return (
                            <Garment key={_id} _id={_id} name={name} material={material} inaltime={inaltime}
                                     latime={latime} descriere={descriere} status={status} versiune={versiune}
                                     lastModified={lastModified} longitudine={longitudine} latitudine={latitudine}
                                     photo={photo} onEdit={id => {
                            }}/>
                        );
                    })}
                </IonList>

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

export default Tab2;
