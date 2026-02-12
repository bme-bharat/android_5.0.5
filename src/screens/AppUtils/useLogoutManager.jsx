import { useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import apiClient from '../ApiClient';

export const useLogoutManager = () => {
    const sessionIntervalRef = useRef(null);
    const logoutInProgressRef = useRef(false);

    // 🔴 STOP EVERYTHING
    const stopWatcher = () => {
        if (sessionIntervalRef.current) {
            clearInterval(sessionIntervalRef.current);
            sessionIntervalRef.current = null;
        }
    };

    // 🚪 FINAL LOGOUT (NO UI)
    const logoutNow = useCallback(async () => {
        if (logoutInProgressRef.current) return;
        logoutInProgressRef.current = true;

        stopWatcher();

        try {
            const sessionData = await AsyncStorage.getItem('userSession');
            const sessionId = sessionData
                ? JSON.parse(sessionData)?.sessionId
                : null;

            await AsyncStorage.multiRemove([
                'userSession',
                'normalUserData',
                'CompanyUserData',
                'AdminUserData',
                'PendingSubscriptionUser',
            ]);

            if (sessionId) {
                apiClient
                    .post('/logoutUserSession', {
                        command: 'logoutUserSession',
                        session_id: sessionId,
                    })
                    .catch(() => { });
            }
        } finally {
            setTimeout(() => RNRestart.restart(), 400);
        }
    }, []);

    // 👀 SESSION CHECK (AUTO LOGOUT)

    const startSessionWatcher = (onAutoLogout) => {
        if (sessionIntervalRef.current) return;

        sessionIntervalRef.current = setInterval(async () => {
            try {
                if (logoutInProgressRef.current) return;

                const sessionData = await AsyncStorage.getItem('userSession');
                if (!sessionData) return;

                const { sessionId } = JSON.parse(sessionData);
                if (!sessionId) return;

                const response = await apiClient.post('/checkUserSession', {
                    command: 'checkUserSession',
                    session_id: sessionId,
                });

                if (
                    response?.data?.statusCode === 200 &&
                    response.data.data?.isActive === false
                ) {
                    stopWatcher();

                    console.log('🔴 SESSION EXPIRED — showing message');

                    onAutoLogout?.(); // UI only

                    setTimeout(() => {
                        console.log('🚪 AUTO LOGOUT EXECUTING');
                        logoutNow();
                    }, 2000);
                }
            } catch (e) {
                console.log('❌ session check error', e);
            }
        }, 5000);
    };


    return {
        logoutNow,          // call on OK
        startSessionWatcher // App-only
    };
};
