import axios from 'axios'
import {getLogger, baseUrl, withLogs, authConfig} from "../core";
import {GarmentProps} from "./GarmentProps";
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;
// const {Network} = Plugins;

const garmentUrl = `http://${baseUrl}/api/garments`;


export const getGarments: (token: string) => Promise<GarmentProps[]> = (token) => {
    var res = axios.get(garmentUrl, authConfig(token));
    res.then(function (res) {
        res.data.forEach(
            (async (garment: GarmentProps) => {
                await Storage.set({
                    key: `garment${garment._id}`,
                    value: JSON.stringify(garment)
                });
            }))
    })
    return withLogs(res, 'getGarments');
}

export const createGarments: (token: string, garment: GarmentProps) => Promise<GarmentProps> = (token, garment) => {
    var res = axios.post(garmentUrl, garment, authConfig(token));
    res.then(async function (res) {
        await Storage.set({
            key: `garment${res.data._id}`,
            value: JSON.stringify(res.data)
        });
    })
    return withLogs(res, 'createGarments');
}


export const updateGarment: (token: string, garment: GarmentProps) => Promise<GarmentProps> = (token, garment) => {
    var res = axios.put(`${garmentUrl}/${garment._id}`, garment, authConfig(token));
    res
        .then(async function (res) {
            await Storage.set({
                key: `garment${res.data._id}`,
                value: JSON.stringify(res.data),
            });
        })
        .catch((error) => {
            console.log(error);
        });
    return withLogs(res, "updateGarment");
}

export const setIfModifiedSinceHeader = (garments: GarmentProps[], config: any) => {
    if (garments.length === 0)
        return;

    let ifModifiedSince = new Date(garments[0].lastModified);
    for (var garment of garments) {
        const dateMod = new Date(garment.lastModified);
        if (dateMod > ifModifiedSince) {
            ifModifiedSince = dateMod;
        }
    }
    const seconds = ifModifiedSince.getSeconds();
    ifModifiedSince.setSeconds(seconds + 1);
    config.headers['if-modified-since'] = ifModifiedSince.toUTCString();
}


interface MessageData {
    type: string;
    payload: GarmentProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
    }
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage' + messageEvent.data);
        onMessage(JSON.parse(messageEvent.data));
        // const data: MessageData = JSON.parse(messageEvent.data);
        // const type = messageEvent.data;
        // const payload = messageEvent.data.payload;
        //
        // console.log("TYPE: " + type);
        // console.log("Payload: " + payload);
        // if (type === 'created' || type === 'updated') {
            //save
            // console.log(item._id);
            // console.log("Ar trebui salvate local");
        // }
        // onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}