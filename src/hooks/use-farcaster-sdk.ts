import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export const useFarcasterSDK = () => {
  useEffect(() => {
    const initializeSdk = async () => {
      try {
        await sdk.actions.ready();
        console.log('Farcaster SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      }
    };

    initializeSdk();
  }, []);
};
