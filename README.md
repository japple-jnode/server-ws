# `@jnode/server-log`

Official logger for `@jnode/server`.

## Installation

```
npm i @jnode/server-log
```

## Quick start

### Import

```js
const { createServer, routerConstructors: r, handlerConstructors: h } = require('@jnode/server');
const { routerConstructors: lr } = require('@jnode/server-log');
```

### Start a server with logging

```js
const server = createServer(
  // wrap your root router with lr.Log
  lr.Log(
    r.Path(h.Text('Hello, world!'), {
      '/api': h.JSON({ ok: true })
    }),
    {
      // Optional: Log to files in the './logs' directory
      folder: './logs'
    }
  )
);

server.listen(8080);
```

## How it works?

`LogRouter` is a specialized **router** that sits in front of your application logic. When a request arrives, it records the start time and injects a `finalizeLog` function into the `ctx`. It then passes the request to the `next` router or handler.

Once the response is finished (or a timeout is reached), it gathers information about the request (such as status code, method, and response time) and outputs it to the console and/or a log file.

---

# Reference

## Routers

### Router: `Log(next[, options])`

- `next` [router](https://github.com/japple-jnode/server#class-serverrouter) | [handler-extended](https://github.com/japple-jnode/server#handler-extended) The next step in the routing chain.
- `options` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `folder` [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) The directory to save log files. If set, files will be named by date (e.g., `2023-12-31.log`).
  - `consoleItems` [\<string[]\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) Array of item keys to display in the console. **Default:** `['localTime', 'statusCode', 'method', 'url', 'ip', 'responseTime']`.
  - `fileItems` [\<string[]\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) Array of item keys to write to the log file. **Default:** `['iso', 'statusCode', 'method', 'url', 'ip', 'ua', 'responseTime']`.
  - `itemRegistery` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Custom log item functions.
  - `disableConsoleLog` [\<boolean\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) Disable logging to the console. **Default:** `false`.
  - `plainConsoleLog` [\<boolean\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type) Disable ANSI colors in console output. **Default:** `false`.
  - `sep` [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type) The separator between log items. **Default:** `' '` (space).
  - `forceLog` [\<number\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type) Timeout in milliseconds to force log if the response hasn't finished. **Default:** `10000`.

Records request metadata and logs it upon completion. It also adds a `ctx.finalizeLog` function, allowing handlers (like WebSocket upgrades) to trigger logging manually before the connection context changes.

## Log Items

### Built-in Log Items

These keys can be used in `consoleItems` or `fileItems`:

| Item Key | Description | Example Output |
| :--- | :--- | :--- |
| `local` | Local date and time | `[12/31/2023, 14:30:05]` |
| `localTime` | Local time string | `[14:30:05]` |
| `localDate` | Local date string | `[12/31/2023]` |
| `iso` | UTC ISO 8601 string | `[2023-12-31T14:30:05.000Z]` |
| `isoTime` | UTC ISO time part | `[14:30:05.000Z]` |
| `isoDate` | UTC ISO date part | `[2023-12-31]` |
| `timestamp` | Unix timestamp (ms) | `[1704024000000]` |
| `responseTime`| Request duration | `5ms` (Green/Yellow/Red) |
| `method` | HTTP method | `GET`, `POST` (Blue) |
| `statusCode` | HTTP status code | `200`, `404`, `500` (Colored) |
| `path` | URL pathname | `/api/data` |
| `url` | Host + URL | `example.com/api/data` |
| `host` | Hostname | `example.com` |
| `ip` | Client IP address | `127.0.0.1` |
| `ua` | User-Agent header | `"Mozilla/5.0..."` |
| `referer` | Referer header | `https://google.com/` |
| `depth` | Routing step count | `@2` (Cyan) |

### Custom Log Items

You can define custom log items via the `itemRegistery` option or by passing a function directly into the items array.

The function signature is: `(time, env, ctx, plain, styled) => void`

- `time` [\<Date\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) The start time of the request.
- `env` [\<Object\>](https://github.com/japple-jnode/server#routerrouteenv-ctx) JNS environment object.
- `ctx` [\<Object\>](https://github.com/japple-jnode/server#routerrouteenv-ctx) JNS context object.
- `plain` [\<string[]\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) Push text here for file logs and plain console logs.
- `styled` [\<string[]\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) Push text with ANSI escape codes here for styled console logs.

**Example:**

```js
lr.Log(next, {
  itemRegistery: {
    hello: (time, env, ctx, plain, styled) => {
      plain.push('HELLO');
      styled.push('\x1b[32mHELLO\x1b[0m'); // Green HELLO
    }
  },
  consoleItems: ['localTime', 'hello', 'path']
});
```
