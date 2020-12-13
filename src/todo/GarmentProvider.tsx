import {getLogger} from "../core";
import {GarmentProps} from "./GarmentProps";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from 'prop-types';
import {createGarments, getGarments, newWebSocket, updateGarment} from "./GarmentApi";
import {AuthContext} from "../auth";
import {Plugins} from "@capacitor/core";
// import {useNetwork} from "../core/UseNetState";

const {Storage} = Plugins

const FETCH_GARMENTS_STARTED = 'FETCH_GARMENTS_STARTED';
const FETCH_GARMENTS_SUCCEEDED = 'FETCH_GARMENTS_SUCCEEDED';
const FETCH_GARMENTS_FAILED = 'FETCH_GARMENTS_FAILED';
const SAVE_GARMENTS_STARTED = 'SAVE_GARMENTS_STARTED';
const SAVE_GARMENTS_SUCCEEDED = 'SAVE_GARMENTS_SUCCEEDED';
const DELETE_GARMENT_SUCCEEDED = 'DELETE_GARMENT_SUCCEEDED';
// const SAVE_GARMENTS_OFF_SUCCEEDED = 'SAVE_GARMENTS_OFF_SUCCEEDED';
const SAVE_GARMENTS_FAILED = 'SAVE_GARMENTS_FAILED';

const log = getLogger('GarmentProvider');

type SaveGarmentFn = (garment: GarmentProps, connected: boolean) => Promise<any>;
type RefreshFn = () => Promise<any>;

// type SetOfflineBehaviourFn = (garment: GarmentProps) => Promise<any>;

export interface GarmentState {
    garments?: GarmentProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveGarment?: SaveGarmentFn,
    deleting: boolean,
    refresh?: RefreshFn,
    conflict?: GarmentProps[],
    setConflict?: Function,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: GarmentState = {
    fetching: false,
    saving: false,
    deleting: false,
}

const reducer: (state: GarmentState, action: ActionProps) => GarmentState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_GARMENTS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_GARMENTS_SUCCEEDED:
                return {...state, garments: payload.garments, fetching: false};
            case FETCH_GARMENTS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_GARMENTS_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_GARMENTS_SUCCEEDED:
                const garments = [...(state.garments || [])];
                log(garments);
                const garment = payload.garment;

                const index = garments.findIndex((i => i._id === garment._id));
                if (index === -1)
                    garments.splice(0, 0, garment);
                else
                    garments[index] = garment;
                log("GARM in SAVE: " + garment.value);
                return {...state, garments, saving: false};
            case SAVE_GARMENTS_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case DELETE_GARMENT_SUCCEEDED:
                const garments2 = [...(state.garments || [])];
                const garmentId = payload.garmentID;
                log("GARMID in DELETE: " + garmentId);
                const index2 = garments2.findIndex((i => i._id === garmentId));
                log("INDEX2: " + index2);
                garments2.splice(index2, 1);
                return {...state, garments: garments2, deleting: false};
            // case DELETE_ITEM_SUCCEEDED: {
            //     const items = [...(state.garments || [])];
            //     const item = payload.item;
            //     const index = items.findIndex((it) => it._id === item._id);
            //     items.splice(index, 1);
            //     return { ...state, items, deleting: false };
            // }
            default:
                return state;
        }
    };

export const GarmentContext = React.createContext<GarmentState>(initialState);

interface GarmentProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const GarmentProvider: React.FC<GarmentProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {garments, fetching, fetchingError, saving, savingError, deleting} = state;

    //const {networkStatus} = useNetwork();

    useEffect(getGarmentsEffect, [token]);
    useEffect(wsEffect, [token]);

    //const connectionNetwork = networkStatus.connected;
    const saveGarment = useCallback<SaveGarmentFn>(saveGarmentCallback, [token]);
    const refresh = useCallback<RefreshFn>(refreshCallback, [token]);

    const value = {
        garments,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveGarment,
        deleting,
        refresh,
    };

    let msg = '';

    log('returns');
    return (
        <GarmentContext.Provider value={value}>
            {children}
        </GarmentContext.Provider>
    );

    async function refreshCallback() {
        log("REFRESH");
        const myKeys = Storage.keys();
        let localGarments = await myKeys.then(function (myKeys) {
            const arr = [];

            for (let i = 0; i < myKeys.keys.length; i++) {
                if (myKeys.keys[i].valueOf().includes('garment')) {
                    const item = Storage.get({key: myKeys.keys[i]});

                    arr.push(item);
                }
            }
            log("Keys: " + arr);

            return arr;
        });
        for (let i = 0; i < localGarments.length; i++) {
            const prm = localGarments[i];
            const garment = await prm.then(function (res) {
                return JSON.parse(res.value!);
            });
            if (garment !== null) {
                if (garment.status !== 'empty') {
                    log(garment._id);
                    dispatch({type: DELETE_GARMENT_SUCCEEDED, payload: {garmentID: garment._id}});

                    log('Refresh list with local data');
                    await Storage.remove({key: `garment${garment._id}`});

                    const old = garment;
                    old.status = 'empty';
                    delete old._id;
                    const newOne = await createGarments(token, old);

                    dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: newOne}});

                    await Storage.set({
                        key: `garment${newOne._id}`,
                        value: JSON.stringify(newOne)
                    })
                    log("GARMENT: " + newOne.name + " " + newOne.status);
                } else {
                    //TODO - pt update
                }
            }
        }
    }


    function getGarmentsEffect() {
        let canceled = false;
        fetchGarments();
        return () => {
            canceled = true;
        }


        async function fetchGarments() {
            if (!token?.trim())
                return;
            try {
                log('fetchGarments started');
                dispatch({type: FETCH_GARMENTS_STARTED});
                const garments = await getGarments(token);
                log('fetchingGarments succeede');
                if (!canceled) {
                    //addGarmentsToLocalStorage(garments);
                    dispatch({type: FETCH_GARMENTS_SUCCEEDED, payload: {garments}});
                }
            } catch (error) {
                //daca ajunge aici inseamna ca nu a putut sa ia elementele de pe server
                const myKeys = Storage.keys();

                let localGarments = await myKeys.then(function (myKeys) {
                    const arr = [];

                    for (let i = 0; i < myKeys.keys.length; i++) {
                        if (myKeys.keys[i].valueOf().includes('garment')) {
                            const item = Storage.get({key: myKeys.keys[i]});
                            arr.push(item);
                            // Storage.remove({key: myKeys.keys[i]});
                        }
                    }
                    return arr;
                });

                log('fetchGarments failed - localStorage succeeded');
                // dispatch({type: FETCH_GARMENTS_FAILED, payload: {error}});
                dispatch({type: FETCH_GARMENTS_SUCCEEDED, payload: {localGarments}});
            }
        }
    }

    async function saveGarmentCallback(garment: GarmentProps, connection: boolean) {
        try {
            if (!connection)
                throw new Error();

            log('saveGarments started');
            dispatch({type: SAVE_GARMENTS_STARTED});
            log("ID:" + garment._id);
            const savedGarment = await (garment._id ? updateGarment(token, garment) : createGarments(token, garment));
            log('saveGarments succeeded');
            dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: savedGarment}});
        } catch (error) {
            log('saveGarment failed - use localStorage');
            // dispatch({type: SAVE_GARMENTS_FAILED, payload: {error}});
            if (garment._id) {
                //msg = "Garment updated locally"
                garment.status = msg;
                // await Storage.set({
                //     key: `garment${garment._id}`,
                //     value: JSON.stringify(garment)
                // });
            } else {
                msg = "Garment added locally";
                garment.status = msg;

                //generate an id
                var id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                garment._id = id;
                await Storage.set({
                    key: `garment${id}`,
                    value: JSON.stringify(garment)
                });
            }

            garment.status = msg;
            dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: garment}});
        }
    }

    function wsEffect() {

        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled)
                    return;
                const {event, payload: garment} = message;
                log(`ws msg, garment ${event}`);
                if (event === 'created' || event === 'updated') {
                    dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }

    // function networkEffect() {
    //     let canceled = false;
    //     Network.addListener('networkStatusChange', async (status) => {
    //         if (canceled) {
    //             return;
    //         }
    //         const connected: boolean = status.connected;
    //         if (connected) {
    //             // const conflicts = await syncData(token);
    //             // setConflictGuitars(conflicts);
    //         }
    //         //setConnectionNetwork(connected);
    //         console.log("Network status changed", status);
    //     });
    //     return () => {
    //         canceled = true;
    //     };
    // }
};