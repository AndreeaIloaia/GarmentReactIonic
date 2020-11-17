import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {AuthProvider, Login, PrivateRoute} from "./auth";
import {GarmentProvider} from "./todo/GarmentProvider";
import {GarmentEdit, GarmentList} from "./todo";
import {shirt} from "ionicons/icons";

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <AuthProvider>
                        <Route path="/login" component={Login} exact={true}/>
                        <GarmentProvider>
                            <PrivateRoute component={GarmentList} path="/garments" exact={true}/>
                            <PrivateRoute component={GarmentEdit} path="/garment" exact={true}/>
                            <PrivateRoute component={GarmentEdit} path="/garment/:id" exact={true}/>
                        </GarmentProvider>
                        <Route exact path="/" render={() => <Redirect to="/garments"/>}/>
                    </AuthProvider>
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                    <IonTabButton tab="tab1" href="/tab1">
                        <IonIcon icon={shirt} />
                        <IonLabel>Pics</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </IonReactRouter>
    </IonApp>
);

export default App;
