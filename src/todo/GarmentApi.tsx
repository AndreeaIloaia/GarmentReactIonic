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


export const updateGarment: (token: string, garment: GarmentProps) => Promise<GarmentProps[]> = (token, garment) => {
    // return Network.getStatus()
    //     .then(status => {
    //         if (status.connected) {
    //             var res = axios.put(`${garmentUrl}/${garment._id}`, garment, authConfig(token));
    //             log("AICIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")
    //             res.then(async function (res) {
    //                 if (garment._id)
    //                     await Storage.set({
    //                         key: garment._id,
    //                         value: JSON.stringify({
    //                             id: garment._id,
    //                             name: garment.name,
    //                             material: garment.material,
    //                             inaltime: garment.inaltime,
    //                             latime: garment.latime,
    //                             descriere: garment.descriere,
    //                         }),
    //                     });
    //             });
    //             return withLogs(res, 'updateGarment');
    //         }
    //         return Storage.set({
    //             key: 'user',
    //             value: JSON.stringify({
    //                 id: garment._id,
    //                 name: garment.name,
    //                 material: garment.material,
    //                 inaltime: garment.inaltime,
    //                 latime: garment.latime,
    //                 descriere: garment.descriere,
    //             }),
    //         });
    //     });
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


interface MessageData {
    event: string;
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
        log('web socket onmessage');
        const data: MessageData = JSON.parse(messageEvent.data);
        const {event, payload: item} = data;
        if (event === 'created' || event === 'updated') {
            //save
            console.log(item._id);
            console.log("Ar trebui salvate local");
        }
        onMessage(data);
    };
    return () => {
        ws.close();
    }
}