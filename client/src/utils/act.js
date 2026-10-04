import {ui} from './ui';
/** Wrap an async handler: toast on success/error, then run a callback (e.g. reload). */
export const act=(fn,ok,after)=>async(...a)=>{try{await fn(...a);ok&&ui.say(ok);after&&after()}catch(e){ui.say(e.message,1)}};
