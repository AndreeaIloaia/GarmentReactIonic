import {useEffect, useState} from 'react';
import {NetworkStatus, Plugins} from '@capacitor/core';

const {Network} = Plugins;

const initState = {
    connected: false,
    connectionType: 'unknown',
}

export const useNetwork = () => {
    const [networkStatus, setNetworkStatus] = useState(initState)
    useEffect(() => {
        const handler = Network.addListener('networkStatusChange', handleNetStatusChange);
        Network.getStatus().then(handleNetStatusChange);
        let canceled = false;
        return () => {
            canceled = true;
            handler.remove();
        }

        function handleNetStatusChange(status: NetworkStatus) {
            console.log('useNetwork - status change', status);
            if (!canceled) {
                setNetworkStatus(status);
            }
        }
    }, [])
    return {networkStatus};
}