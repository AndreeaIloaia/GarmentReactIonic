import axios from 'axios'
import {getLogger, baseUrl, withLogs, authConfig} from "../core";
import {GarmentProps} from "./GarmentProps";
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;
const {Network} = Plugins;

const garmentUrl = `http://${baseUrl}/api/garments`;


export const getGarments: (token: string, connectionNetwork: boolean | undefined) => Promise<GarmentProps[]> = (token, connectionNetwork) => {
//    return connectionNetwork ? axios.get(garmentUrl, authConfig(token)) : Storage.get({key: 'garments'});
//     return Network.getStatus()
//     .then(status => {
//         if (status.connected) {
//             log("CONNECTION: " + connectionNetwork);
//         });
//     if(connectionNetwork) {
//         var res = axios.get(garmentUrl, authConfig(token));
//         res.then(function (res) {
//             (async () => {
//                 await Storage.set({
//                     key: 'garments',
//                     value: JSON.stringify(res.data)
//                 });
//             })()
//         });
//         return withLogs(res, 'getGraments');
//     }
//     else {
//         return Storage.get({key: 'garments'});
//     }

        return Network.getStatus()
        .then(status => {
            if (status.connected) {
                var res = axios.get(garmentUrl, authConfig(token));
                log("CONNECTION4: " + status.connected);
                res.then(function (res) {
                    (async () => {
                        await Storage.set({
                            key: 'garments',
                            value: JSON.stringify(res.data)
                        });
                    })()
                })
                return withLogs(res, 'getGarments');
            }
            log("getGarments from local Storage");
            return Storage.get({key: 'garments'});

        })
}

export const createGarments: (token: string, garment: GarmentProps, connectionNetwork: boolean | undefined) => Promise<GarmentProps[]> = (token, garment, connectionNetwork) => {
    return Network.getStatus()
        .then(status => {
            if (status.connected) {
                var res = axios.post(garmentUrl, garment, authConfig(token));
                res.then(async function (res) {
                    await Storage.set({
                        key: `new${garment._id}`,
                        value: JSON.stringify({
                            id: garment._id,
                            name: garment.name,
                            material: garment.material,
                            inaltime: garment.inaltime,
                            latime: garment.latime,
                            descriere: garment.descriere,
                        }),
                    });
                });
                return withLogs(res, 'createGarments');
            }
            return Storage.set({
                key: 'new',
                value: JSON.stringify({
                    id: garment._id,
                    name: garment.name,
                    material: garment.material,
                    inaltime: garment.inaltime,
                    latime: garment.latime,
                    descriere: garment.descriere,
                }),
            });
        })
}

export const updateGarment: (token: string, garment: GarmentProps, connectionNetwork: boolean | undefined) => Promise<GarmentProps[]> = (token, garment, connectionNetwork) => {
    return Network.getStatus()
        .then(status => {
            if (status.connected) {
                var res = axios.put(`${garmentUrl}/${garment._id}`, garment, authConfig(token));
                log("AICIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")
                res.then(async function (res) {
                    if (garment._id)
                        await Storage.set({
                            key: garment._id,
                            value: JSON.stringify({
                                id: garment._id,
                                name: garment.name,
                                material: garment.material,
                                inaltime: garment.inaltime,
                                latime: garment.latime,
                                descriere: garment.descriere,
                            }),
                        });
                });
                return withLogs(res, 'updateGarment');
            }
            return Storage.set({
                key: 'user',
                value: JSON.stringify({
                    id: garment._id,
                    name: garment.name,
                    material: garment.material,
                    inaltime: garment.inaltime,
                    latime: garment.latime,
                    descriere: garment.descriere,
                }),
            });
        });
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