import {getLogger} from "../core";
import {GarmentProps} from "./GarmentProps";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from 'prop-types';
import {createGarments, getGarments, newWebSocket, setIfModifiedSinceHeader, updateGarment} from "./GarmentApi";
import {AuthContext} from "../auth";
import {Plugins} from "@capacitor/core";
import {useNetwork} from "../core/UseNetState";
import {usePhotoGallery} from "../core/UsePhotoGallery";
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
type UpdateServerFn = (garment: GarmentProps) => Promise<any>;
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
    updateServer?: UpdateServerFn,
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
                let index = -1;
                for (let i = 0; i < garments.length; i++) {
                    if(garments[i]._id === garment._id) {
                        index = i;
                    }
                }
                // const index = garments.findIndex((i => i._id === garment._id));
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
    const {networkStatus} = useNetwork();

    useEffect(getGarmentsEffect, [token]);
    useEffect(wsEffect, [token]);

    const saveGarment = useCallback<SaveGarmentFn>(saveGarmentCallback, [token]);
    const updateServer = useCallback<UpdateServerFn>(updateServerCallback, [token]);
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
        const localGarments = await getGarmentsLocally();
        for (let i = 0; i < localGarments.length; i++) {
            const prm = localGarments[i];
            const garment = await prm.then(function (res) {
                return JSON.parse(res.value!);
            });
            if (garment !== null) {
                if (garment.status !== 'empty' && garment.status.indexOf('added') >= 0) {
                    await addGarmentLocally(garment);
                }
                if (garment.status !== 'empty' && garment.status.indexOf('updated') >= 0) {
                    await updateGarmentLocally(garment);
                }
            }
        }
    }

    async function getGarmentsLocally() {
        const myKeys = Storage.keys();
        return await myKeys.then(function (myKeys) {
            const arr = [];

            for (let i = 0; i < myKeys.keys.length; i++) {
                if (myKeys.keys[i].valueOf().includes('garment')) {
                    const item = Storage.get({key: myKeys.keys[i]});

                    arr.push(item);
                }
            }
            return arr;
        });
    }

    async function addGarmentLocally(garment: GarmentProps) {
        dispatch({type: DELETE_GARMENT_SUCCEEDED, payload: {garmentID: garment._id}});
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
    }

    async function updateGarmentLocally(garment: GarmentProps) {
        dispatch({type: DELETE_GARMENT_SUCCEEDED, payload: {garmentID: garment._id}});
        await Storage.remove({key: `garment${garment._id}`});

        const old = garment;
        old.status = 'empty';
        try {
            const newOne = await updateGarment(token, old);
            dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: newOne}});
            await Storage.set({
                key: `garment${newOne._id}`,
                value: JSON.stringify(newOne)
            })
        } catch (error) {
            if (error.message.indexOf('409')) {
                const newOne = await getGarments(token).then((data) => {
                    for (var el of data) {
                        if (el._id === old._id)
                            return el
                    }
                });
                if (newOne) {
                    newOne.status = 'Conflict';
                    old.status = 'Conflict';
                    dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: old}});
                    await updateGarment(token, newOne);
                    await Storage.set({
                        key: `garment${old._id}`,
                        value: JSON.stringify(old)
                    })
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

                const localGarments = await getGarmentsLocally();
                //setIfModifiedSinceHeader(localGarments, authConfig(token));

                const garments = await getGarments(token);
                log('fetchingGarments succeede');
                if (!canceled) {
                    //addGarmentsToLocalStorage(garments);
                    dispatch({type: FETCH_GARMENTS_SUCCEEDED, payload: {garments}});
                }
            } catch (error) {
                log(error.message);
                //daca ajunge aici inseamna ca nu a putut sa ia elementele de pe server
                const localGarments = await getGarmentsLocally();

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
                console.log("PROVIDER");
                msg = "Garment updated locally"
                garment.status = msg;
                await Storage.set({
                    key: `garment${garment._id}`,
                    value: JSON.stringify(garment)
                });
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

    async function updateServerCallback(garment: GarmentProps) {
        try {
            log('updateServer started');
            dispatch({type: SAVE_GARMENTS_STARTED});
            dispatch({type: DELETE_GARMENT_SUCCEEDED, payload: {garmentID: garment._id}});

            const savedGarment = await getGarments(token).then((data) => {
                for (var el of data) {
                    if (el._id === garment._id)
                        return el;
                }
            });
            log('update succeeded');
            dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: savedGarment}});
        } catch (error) {
            log('updateServer failed');
            // dispatch({type: SAVE_GARMENTS_FAILED, payload: {error}});
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
                const {type, payload: garment} = message;
                log(`ws msg, garment ${type}`);
                if (type === 'created' || type === 'updated') {
                    if(networkStatus.connected) {
                        log("GARMENT IN WS: " + garment.name);
                        log("GARMENT IN WS: " + garment._id);
                        // dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: garment}});
                    }
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
