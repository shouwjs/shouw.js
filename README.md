# Shouw.js

**Shouw.js** is a simple, string-based package that makes interacting with the [Discord API](https://discord.com/developers) easily, and fun.
Inspired by [Aoi.js](https://aoi.js.org), it allows developers to build Discord bots with minimal setup using a clean string-based command syntax, extensibility.

---

* **[NPM](https://npmjs.org/shouw.js)**
* **[SUPPORT](https://shouwjs.my.id/invite)**
* **[DOCUMENTATION](https://shouwjs.my.id)**
* **[GITHUB](https://github.com/shouwjs/shouw.js)**
  
---

## Installation

```bash
npm install shouw.js
````

Or use the CLI directly to initialize a new project:

```bash
npx shouw.js init
```

---

## Getting Started

```js
const { ShouwClient } = require('shouw.js');

const client = new ShouwClient({
    token: 'YOUR_BOT_TOKEN',
    prefix: '!',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate'],
});

// Add a simple command
client.command({
    name: 'ping',
    code: `Pong! $pingms`,
});

// Load commands from a directory
client.loadCommands('./commands', true); // `true` enables debug logging
```

---

## Project Structure Example

```
project/
├── index.js
├── commands/
│   ├── ping.shouw
│   ├── greet.sho
│   ├── meow.shw
│   └── fun.js
```

---

## CLI Usage

Shouw.js comes with a CLI to help you bootstrap projects easily.

```bash
npx shouw init
```

**This will:**
* Create a new folder structure
* Generate a template bot file
* Install dependencies
* Provide instructions to get started

---

## Extensions

Shouw.js also supports extensions!

```js
const client = new ShouwClient({
    extensions: [
        new MyExtension({ /* options */ })
    ],
    ...
});
```
### Available extensions:
* **[Music](https://github.com/shouwjs/music)** - Allows you to play music in Discord voice channels.
* **[Database](https://github.com/shouwjs/database)** - Allows you to store and access a database for your bot.


If you want to create your own extension, you can see the [extension templates](https://github.com/shouwjs/template) for more info.

---

## Custom Command Files

Shouw.js also supports `.shouw`, `.sho`, and `.shw` file extensions for commands with decorator-like syntax!

```ts
// commands/example.shouw

@Command({
  name: 'hello',
});

Hello there!
This is a command code 1

@Command({
  name: 'bye',
})
  
Goodbye!
This is a command block 2
```

These decorators are parsed by Shouw.js internally, no compilation needed.