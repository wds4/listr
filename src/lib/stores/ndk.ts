import { writable } from 'svelte/store';
import NDK from '@nostr-dev-kit/ndk';

const ndk = new NDK({
    explicitRelayUrls: ['ws://localhost:8080', 'wss://nos.lol']
});

// Create a singleton instance that is the default export
const ndkStore = writable(ndk);

export default ndkStore;
