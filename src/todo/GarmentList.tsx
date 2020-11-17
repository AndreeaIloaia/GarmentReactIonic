import React, {useContext, useEffect, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem,
    IonList, IonLoading,
    IonPage, IonSearchbar,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {GarmentContext} from "./GarmentProvider";
import Garment from './Garment'
import {AuthContext} from "../auth";
import {GarmentProps} from "./GarmentProps";

const log = getLogger('GarmentList');

const GarmentList: React.FC<RouteComponentProps> = ({history}) => {
    const {garments, fetching, fetchingError} = useContext(GarmentContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [displayed, setDisplayed] = useState<GarmentProps[]>([]);
    const [position, setPosition] = useState(6);
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        if(garments?.length)
            setDisplayed(garments?.slice(0, 6));
    }, [garments]);

    log('render');

    async function searchNext($event: CustomEvent<void>) {
        if(garments && position < garments.length) {
            setDisplayed([...displayed, ...garments.slice(position, position + 1)]);
            setPosition(position + 1);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{ pathname: "/login" }} />;
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Tailor App</IonTitle>
                    <IonButton className="logout-button" onClick={handleLogout} slot="end" expand="block" fill="solid" color="primary">
                        Logout
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message={"Fetching garments"}/>
                <IonList>
                    {displayed && displayed.map(({_id, name, material, inaltime, latime, descriere}) =>{
                        return (
                            <Garment key={_id} _id={_id} name={name} material={material} inaltime={inaltime}
                                     latime={latime} descriere={descriere}
                                     onEdit={id => history.push(`/garment/${id}`)}/>
                        );
                    })}
                </IonList>
                <IonInfiniteScroll
                    threshold="5px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading more gament iteams..."/>
                </IonInfiniteScroll>
                {fetchingError && (<div>{fetchingError.message || 'Failed to fetch garments'}</div>)}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/garment')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>

            </IonContent>
        </IonPage>
    );
};

export default GarmentList;