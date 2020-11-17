import React, {useContext} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {GarmentContext} from "./GarmentProvider";
import Garment from './Garment'
import {AuthContext} from "../auth";

const log = getLogger('GarmentList');

const GarmentList: React.FC<RouteComponentProps> = ({history}) => {
    const {garments, fetching, fetchingError} = useContext(GarmentContext);
    log('render');
    const { logout } = useContext(AuthContext);
    const handleLogout = () => {
        logout?.();
        return <Redirect to={{ pathname: "/login" }} />;
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Tailor App</IonTitle>
                    <IonButton className="login-button" onClick={handleLogout} slot="end" expand="block" fill="solid" color="primary">
                        Logout
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message={"Fetching garments"}/>
                {garments && (
                    <IonList>
                        {garments.map(({_id, name, material, inaltime, latime, descriere}) =>
                            <Garment key={_id} _id={_id} name={name} material={material} inaltime={inaltime}
                                     latime={latime} descriere={descriere}
                                     onEdit={id => history.push(`/garment/${id}`)}/>
                        )}
                    </IonList>
                )}
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