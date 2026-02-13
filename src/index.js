/*
@jnode/server-ws

Official WebSocket support for JNS.

by JustApple
*/

// dependencies
const { WSConnection, calculateWSKey } = require('./../../websocket');

// is ws router
class IsWSRouter {
    constructor(isWS, isNotWS) {
        this.isWS = isWS;
        this.isNotWS = isNotWS;
    }

    route(env, ctx) {
        if (
            ctx.method === 'GET' &&
            ctx.headers['upgrade']?.toLowerCase() === 'websocket' &&
            ctx.headers['connection']?.toLowerCase().includes('upgrade') &&
            ctx.headers['sec-websocket-key'] &&
            ctx.headers['sec-websocket-version'] === '13'
        ) return this.isWS;
        else return this.isNotWS;
    }
}

// ws handler
class WSHandler {
    constructor(cb, options) {
        this.cb = cb;
        this.options = options;
    }

    handle(ctx, env) {
        // double check
        if (!(
            ctx.method === 'GET' &&
            ctx.headers['upgrade']?.toLowerCase() === 'websocket' &&
            ctx.headers['connection']?.toLowerCase().includes('upgrade') &&
            ctx.headers['sec-websocket-key'] &&
            ctx.headers['sec-websocket-version'] === '13'
        )) throw 426;

        // handshake
        ctx.res.writeHead(101, {
            'Upgrade': 'websocket',
            'Connection': 'upgrade',
            'Sec-WebSocket-Accept': calculateWSKey(ctx.headers['sec-websocket-key'])
        });
        ctx.res.flushHeaders();

        // log
        if (typeof ctx.finalizeLog === 'function') ctx.finalizeLog();

        this.cb(new WSConnection(ctx.req.socket, ctx.res.socket, this.options));
    }
}

// export
module.exports = {
    IsWSRouter, WSHandler,
    routerConstructors: {
        IsWS: (isWS, isNotWS) => new IsWSRouter(isWS, isNotWS)
    },
    handlerConstructors: {
        WS: (cb, options) => new WSHandler(cb, options)
    }
};