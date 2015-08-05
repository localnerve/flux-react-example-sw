# flux-react-example-sw

> A WIP learning playground for service worker

This repository is downstream from [flux-react-example](https://github.com/localnerve/flux-react-example) and adds a service worker to test progressive app offline and push capabilities based on that architecture.

------------------------------
Flux-React-Example is an example contact web application. Serves as a reference app to inspire isomorphic application development solutions.

* Features a **data-driven** isomorphic React application that follows the flux flow using [Fluxible](https://github.com/yahoo/fluxible).
* Uses a Node, Express, Fluxible, React stack employing Grunt, Webpack, and Mocha/Chai.
* Employs Yahoo Fetchr for uniform client/server access to app services.
* Features a Flexbox layout with some very light usage of Foundation For Apps (The Sass mixins only, no JS, all possible CSS output disabled).
* Performance Features
  * Majority of visual completeness in < 14k initial download.
  * 60fps rendering.

## Docs
Additional documentation can be found in this project's [wiki](https://github.com/localnerve/flux-react-example/wiki). This is still in progress.

## Integrations
This example demonstrates a full CI/CD integration on the master branch. Pushes to the master branch run the following workflow:
  1. Run unit tests w/coverage on Travis-ci.
  2. Build and deploy to the Heroku stage.
  3. Run cross-browser/platform functional tests on SauceLabs against the stage.
  4. Run performance budget tests on webpagetest.org against the stage.

## Developer Instructions

### Build Environment Prerequisites
1. Globally installed grunt-cli `npm install -g grunt-cli`
2. Globally installed Compass >= 1.0.1 `gem install compass`

### Setup
1. Clone this repo
2. Install the dependencies

```bash
$ npm install
```

### Run the app\*

```bash
$ npm run build
$ npm start
```

Open http://localhost:3000

\*Assumes you *don't* have NODE_ENV set in your environment. If you do have it set, it must be set to "production" to run the production build of the app this way. If you use NODE_ENV in your environment for something else and still want to just run the production app, use [this](#debug-production-build) method.

### Run in dev mode

```bash
$ npm run dev
```

This will use `nodemon` and `webpack` to watch for changes and restart and
rebuild as needed.

Open http://localhost:3000


### Debug production build
```bash
$ npm run prod
```

This will use `nodemon` and `webpack` to watch for changes and restart and
rebuild as needed.

Open http://localhost:3000


### Debug the server-side parts of the app
1. Start node-inspector on the port of your choice in the background
```bash
$ node-inspector --web-port=<port-of-choice> &
```
2. Run the debug build (a very slightly modified dev build)
```bash
$ npm run debug
```
3. Use Chrome to open `http://127.0.0.1:8090/?ws=127.0.0.1:<port-of-choice>&port=5858`
4. Set breakpoints and/or hit F8 to start the server-side of the app.

This will use `nodemon` and `webpack` to watch for changes and restart and
rebuild as needed. The nodemon process will start with `--debug-brk` option to let you break on anything from the ground up.

## License

Unless otherwise specified, this software is free to use under the LocalNerve BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: /LICENSE.md
