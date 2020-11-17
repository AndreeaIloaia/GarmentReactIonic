import {getLogger} from "../core";
import {GarmentProps} from "./GarmentProps";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from 'prop-types';
import {createGarments, getGarments, newWebSocket, updateGarment} from "./GarmentApi";
import {AuthContext} from "../auth";

const FETCH_GARMENTS_STARTED = 'FETCH_GARMENTS_STARTED';
const FETCH_GARMENTS_SUCCEEDED = 'FETCH_GARMENTS_SUCCEEDED';
const FETCH_GARMENTS_FAILED = 'FETCH_GARMENTS_FAILED';
const SAVE_GARMENTS_STARTED = 'SAVE_GARMENTS_STARTED';
const SAVE_GARMENTS_SUCCEEDED = 'SAVE_GARMENTS_SUCCEEDED';
const SAVE_GARMENTS_FAILED = 'SAVE_GARMENTS_FAILED';

const log = getLogger('GarmentProvider');

type SaveGarmentFn = (garment: GarmentProps) => Promise<any>;

export interface GarmentState {
    garments?: GarmentProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveGarment?: SaveGarmentFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: GarmentState = {
    fetching: false,
    saving: false,
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
                const garment = payload.garment;
                const index = garments.findIndex((i => i._id === garment._id));
                if (index === -1)
                    garments.splice(0, 0, garment);
                else
                    garments[index] = garment;

                return {...state, garments, saving: false};
            case SAVE_GARMENTS_FAILED:
                return {...state, savingError: payload.error, saving: false};
            default:
                return state;
        }
    };

export const GarmentContext = React.createContext<GarmentState>(initialState);

interface GarmentProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const GarmentProvider: React.FC<GarmentProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {garments, fetching, fetchingError, saving, savingError} = state;
    useEffect(getGarmentsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveGarment = useCallback<SaveGarmentFn>(saveGarmentCallback, [token]);
    const value = {garments, fetching, fetchingError, saving, savingError, saveGarment};
    log('returns');
    return (
        <GarmentContext.Provider value={value}>
            {children}
        </GarmentContext.Provider>
    );

    function getGarmentsEffect() {
        let canceled = false;
        fetchGarments();
        return () => {
            canceled = true;
        }


        async function fetchGarments() {
            if(!token?.trim())
                return;
            try {
                log('fetchGarments started');
                dispatch({type: FETCH_GARMENTS_STARTED});
                const garments = await getGarments(token);
                log('fetchingGarments succeede');
                if (!canceled)
                    dispatch({type: FETCH_GARMENTS_SUCCEEDED, payload: {garments}});
            } catch (error) {
                log('fetchGarments failed');
                dispatch({type: FETCH_GARMENTS_FAILED, payload: {error}});
            }
        }
    }

    async function saveGarmentCallback(garment: GarmentProps) {
        try {
        log('saveGarments started');
        dispatch({type: SAVE_GARMENTS_STARTED});
        const savedGarment = await (garment._id ? updateGarment(token, garment) : createGarments(token, garment));
        log('saveGarments succeeded');
        dispatch({type: SAVE_GARMENTS_SUCCEEDED, payload: {garment: savedGarment}});
        } catch (error) {
            log('saveGarment failed');
            dispatch({type: SAVE_GARMENTS_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if(token?.trim()) {
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
};