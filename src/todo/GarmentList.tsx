import React, {useContext, useEffect, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonList, IonLoading,
    IonPage, IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add, shirt} from 'ionicons/icons';
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
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [position, setPosition] = useState(6);
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        if(garments?.length)
            setDisplayed(garments?.slice(0, 8));
    }, [garments]);

    useEffect(() => {
        if(garments && filter) {
            console.log(filter);
            if(filter !== "undefined")
                setDisplayed(garments.filter(obj => obj.material === filter));
            else
                // setDisplayed(garments);
                setDisplayed(garments?.slice(0, 6));
        }
    // }, [filter, displayed]);
    }, [filter]);
    log('render');

    async function searchNext($event: CustomEvent<void>) {
        if(garments && position < garments.length) {
            if(filter)
                console.log(filter);
            setDisplayed([...displayed, ...garments.slice(position, position + 3)]);
            setPosition(position + 3);
            console.log(position);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    // async function filterGarment($event: CustomEvent<void>) {
    //     if(garments) {
    //         if(filter && filter.valueOf() !== "")
    //             setDisplayed([...garments.filter(obj => obj.material === filter)]);
    //         // else if(filter !== "no")
    //         //     setDisplayed([...garments]);
    //         else
    //             setDisplayed([]);
    //
    //     }
    //     ($event.target as HTMLIonInfiniteScrollElement).complete();
    // }

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
                <IonSelect value={filter} placeholder="Select Material" onIonChange={e => {
                        setFilter(e.detail.value);
                    //filterGarment(e.detail.value);
                }}>
                    {/*{materials.map(material => <IonSelectOption key={material} value={material}>{material}</IonSelectOption>)}*/}
                    <IonSelectOption value="matase" >matase</IonSelectOption>
                    <IonSelectOption value="triplu voal" >triplu voal</IonSelectOption>
                    <IonSelectOption value="undefined" >no filter</IonSelectOption>
                </IonSelect>
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
                    threshold="15px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => {
                        searchNext(e);
                    }}>
                    <IonInfiniteScrollContent loadingText="Loading more gament iteams..."/>
                </IonInfiniteScroll>
                {fetchingError && (<div>{fetchingError.message || 'Failed to fetch garments'}</div>)}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/garment')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                    <IonFabButton onClick={() => history.push('/tab2')}>
                        <IonIcon icon={shirt}/>
                    </IonFabButton>
                </IonFab>

            </IonContent>
        </IonPage>
    );
};

export default GarmentList;