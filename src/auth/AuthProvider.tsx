import PropTypes from 'prop-types';
import {getLogger} from '../core';
import React, {useCallback, useEffect, useState} from "react";
import {login as loginApi} from './AuthApi';
import { Storage } from "@capacitor/core";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    logout?: LogoutFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

//TODO - partile de logout
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState<AuthState>(initialState);
    const {isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token} = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, [])

    useEffect(authenticationEffect, [pendingAuthentication]);
    const value = {isAuthenticated, login, logout, isAuthenticating, authenticationError, token};
    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(username?: string, password?: string): void {
        log('login');
        setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
        });
    }

    function logoutCallback(): void {
        log('login');
        setState({
            ...state,
            token: '',
            isAuthenticated: false,
        });

        (async () => {
            // await Storage.remove({ key: 'token' });
            await Storage.clear();
        })();
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }


        async function authenticate() {
            var token = await Storage.get({ key: 'token' });
            if(token.value){
                setState({
                    ...state,
                    token: token.value,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            }
            if (!pendingAuthentication) {
                log('authenticate, !pendingAuth, return');
                return;
            }
            try {
                log('auth...');
                setState({
                    ...state,
                    isAuthenticating: true,
                });
                const {username, password} = state;
                const {token} = await loginApi(username, password);
                if (canceled) {
                    return;
                }
                log('auth succeeded');

                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (err) {
                if (canceled) {
                    return;
                }
                log('auth failed');
                setState({
                    ...state,
                    authenticationError: err,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }
        }
    }

    // function logout() {
    //     log('logout...');
    //
    //     setState({
    //         ...state,
    //         pendingAuthentication: false,
    //         isAuthenticated: false,
    //         isAuthenticating: false,
    //     });
    // }

    // function saveTokenLocal() {
    //     if (isAuthenticated)
    //         (async () => {
    //             const {Storage} = Plugins;
    //             await Storage.set({
    //                 key: 'token',
    //                 value: token
    //             });
    //             console.log("token saved in local storage");
    //         })();
    // }
};