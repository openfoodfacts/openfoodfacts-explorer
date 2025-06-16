import { writable } from 'svelte/store';

// Holds whether the user is logged in
export const userLoginState = writable(false);
