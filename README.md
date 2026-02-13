
# `@jnode/server-ws`

Official WebSocket support for `@jnode/server`.

## Installation

```
npm i @jnode/server-ws
```

## Quick start

### Import

```js
const { createServer, routerConstructors: r, handlerConstructors: h } = require('@jnode/server');
const { routerConstructors: wsr, handlerConstructors: wsh } = require('@jnode/server-ws');
```

### Start an echo WebSocket server

```js
const server = createServer(
  r.Path(null, {
    // Check if the request is a WebSocket upgrade request
    '/chat': wsr.IsWS(
      // If it is, handle with WS handler
      wsh.WS((conn) => {
        console.log('New connection!');

        conn.on('message', (data) => {
          conn.send(`Echo: ${data}`);
        });
      }),
      // If not, respond with a plain text error
      h.Text('WebSocket upgrade required.', { statusCode: 426 })
    )
  })
);

server.listen(8080);
```

## How it works?

`@jnode/server-ws` provides a seamless way to integrate WebSockets into your JNS application using the standard **router-handler** pattern.

1. Use `IsWSRouter` to detect WebSocket upgrade requests based on HTTP headers (`Upgrade`, `Connection`, `Sec-WebSocket-Key`, etc.).
2. Use `WSHandler` to perform the handshake (HTTP 101) and upgrade the connection.
3. Once upgraded, you receive a [\<WSConnection\>](https://github.com/japple-jnode/websocket#class-wsconnection) object to manage the full-duplex communication.

---

# Reference

## Routers

### Router: `IsWSRouter(isWS, isNotWS)`

- `isWS` [router](https://github.com/japple-jnode/server#class-serverrouter) | [handler-extended](https://github.com/japple-jnode/server#handler-extended) The router or handler to use if the request is a valid WebSocket upgrade request.
- `isNotWS` [router](https://github.com/japple-jnode/server#class-serverrouter) | [handler-extended](https://github.com/japple-jnode/server#handler-extended) The router or handler to use if the request is NOT a WebSocket upgrade request.

Detects if the incoming request is a WebSocket handshake. It checks if the method is `GET`, the `Upgrade` header is `websocket`, and the `Sec-WebSocket-Version` is `13`.

## Handlers

### Handler: `WSHandler(cb[, options])`

- `cb` [\<Function\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function with signature `(conn) => void`. The `conn` argument is a [\<WSConnection\>](https://github.com/japple-jnode/websocket#class-wsconnection) instance.
- `options` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Options passed to the internal [\<WSConnection\>](https://github.com/japple-jnode/websocket#class-wsconnection).

Handles the WebSocket handshake. If the request headers are invalid, it throws a `426 Upgrade Required` error. Otherwise, it sends the `101 Switching Protocols` response, flushes the headers, and invokes the callback with a [\<WSConnection\>](https://github.com/japple-jnode/websocket#class-wsconnection) instance.

## Integration with `@jnode/server`

When using these routers and handlers, the standard `env` and `ctx` objects are passed through the routing process as usual.

- `env` [\<Object\>](https://github.com/japple-jnode/server#routerrouteenv-ctx)
- `ctx` [\<Object\>](https://github.com/japple-jnode/server#routerrouteenv-ctx)

If `ctx.finalizeLog` is a function (commonly used by logging middleware), `WSHandler` will call it immediately after the handshake headers are flushed to ensure the upgrade request is logged before the connection switches protocols.
