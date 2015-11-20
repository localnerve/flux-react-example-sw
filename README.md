# flux-react-example-sw

[![Build Status](https://secure.travis-ci.org/localnerve/flux-react-example-sw.svg?branch=master)](http://travis-ci.org/localnerve/flux-react-example-sw)
[![Coverage Status](https://coveralls.io/repos/localnerve/flux-react-example-sw/badge.svg?branch=master)](https://coveralls.io/r/localnerve/flux-react-example-sw?branch=master)
[![Dependency Status](https://david-dm.org/localnerve/flux-react-example-sw.svg)](https://david-dm.org/localnerve/flux-react-example-sw)
[![devDependency Status](https://david-dm.org/localnerve/flux-react-example-sw/dev-status.svg)](https://david-dm.org/localnerve/flux-react-example-sw#info=devDependencies)

> A WIP learning playground for service worker

This repository expands on [flux-react-example](https://github.com/localnerve/flux-react-example) and adds a **service worker** to test progressive app offline and push capabilities based on that architecture.

## Service Worker Info
The worker and registration source is located at [assets/scripts/sw](/assets/scripts/sw) and [assets/scripts/service-worker-registration.js](/assets/scripts/service-worker-registration.js)

### Offline and Performance Enhancements
* This implementation leverages Google projects `sw-precache` and `sw-toolbox` for precaching static and dynamic assets, and the general ease of setting up fetch handling on routes/origins.
* The application's Flux Stores are sent to the service worker using the [init](/assets/scripts/sw/init/README.md) command and referenced from IndexedDB.

### Push Notifications
* This implementation relies on GCM to deliver push notifications.
* Chrome only (so far).
* Currently, push notifications are subscribed and demonstrated using the settings control panel (cog in upper right).

### Demonstration
There is currently no hosted app. So, the best way to demo capabilities and have a look around at things is `git clone` and `npm install`.

#### Build Environment Prerequisites
1. Globally (nvm ok) installed Node. Node >= 4.1.2 required.
  * Globally installed grunt-cli `npm install -g grunt-cli`
2. Globally (rvm/chruby ok) installed Compass >= 1.0.1 `gem install compass`

#### How to Run a Demo
1. Clone this repo and run `npm install`.
2. Satisfy the Build Environment Prerequisites.
3. Run the server using the 'perf' build by running `npm run perf`. This is just like the 'prod' build, but provides source maps and doesn't Uglify so the source is browsable in module form. The 'perf' build will build and start the server at `localhost:3000`.
4. If you are only interested in offline/perf capabilities, use a 'New Chrome Incognito Window' with devtools open and navigate to `localhost:3000` to play with and inspect source, network, and resources.
5. To demo push notifications, you cannot run Incognito. Also, you need to [setup a GCM project](https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web#make-a-project-on-the-google-developer-console) and set the API key in the server environment variable `PUSH_API_KEY`.

------------------------------
## Flux-React-Example Info
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
