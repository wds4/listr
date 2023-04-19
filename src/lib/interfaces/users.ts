import { get as getStore } from 'svelte/store';
import ndkStore from '$lib/stores/ndk';
import type { GetUserParams } from '@nostr-dev-kit/ndk';
import { liveQuery, type Observable } from 'dexie';
import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';
import { unixTimeNow } from '$lib/utils/helpers';

const UserInterface = {
    get: (opts: GetUserParams): Observable<App.User> => {
        const ndk = getStore(ndkStore);
        const ndkUser = ndk.getUser(opts);
        let userForDb = {
            ...(ndkUser.profile || {}),
            id: ndkUser.hexpubkey(),
            lastFetched: unixTimeNow(),
            npub: ndkUser.npub,
            hexpubkey: ndkUser.hexpubkey()
        };
        ndkUser.fetchProfile().then(
            async () => {
                userForDb = { ...userForDb, ...ndkUser.profile };
                try {
                    browser ? await db.users.put(userForDb) : userForDb;
                } catch (e) {
                    console.log(e);
                }
            },
            (error) => {
                console.log(error);
            }
        );

        return liveQuery(() =>
            browser ? db.users.where({ id: ndkUser.hexpubkey() }).first() || userForDb : userForDb
        ) as Observable<App.User>;
    }
};

export default UserInterface;
