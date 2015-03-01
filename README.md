# [Flux-React-Example](https://github.com/localnerve/flux-react-example)

[![Build Status](https://secure.travis-ci.org/localnerve/flux-react-example.png?branch=master)](http://travis-ci.org/localnerve/flux-react-example)
[![Coverage Status](https://coveralls.io/repos/localnerve/flux-react-example/badge.svg?branch=master)](https://coveralls.io/r/localnerve/flux-react-example?branch=master)
[![Dependency Status](https://david-dm.org/localnerve/flux-react-example.svg)](https://david-dm.org/localnerve/flux-react-example)
[![devDependency Status](https://david-dm.org/localnerve/flux-react-example/dev-status.svg)](https://david-dm.org/localnerve/flux-react-example#info=devDependencies)
[![Codacy Badge](https://www.codacy.com/project/badge/60366103040442ad9fbf5f8e33373f18)](https://www.codacy.com/public/alex/flux-react-example)
  
[![Sauce Test Status](https://saucelabs.com/browser-matrix/localnerve.svg)](https://saucelabs.com/u/localnerve)

> A *Work In Progress* example of using Fluxible with dynamic routes.

An isomorphic flux-react example application using [fluxible](http://fluxible.io).

## Build Environment Prerequisites
1. Globally installed grunt-cli `npm install -g grunt-cli`
2. Globally installed Compass >= 1.0.1 `gem install compass`

## Setup

```bash
$ npm install
```


## Run the app\*

```bash
$ npm run build
$ npm start
```

Open http://localhost:3000

\*Assumes you *don't* have NODE_ENV set in your environment. If you do have it set, it must be set to "production" to run the production build of the app this way. If you use NODE_ENV in your environment for something else and still want to just run the production app, use [this](#debug-production-build) method.

## Run in dev mode

```bash
$ npm run dev
```

This will use `nodemon` and `webpack` to watch for changes and restart and
rebuild as needed.

Open http://localhost:3000


## Debug production build
```bash
$ npm run prod
```

This will use `nodemon` and `webpack` to watch for changes and restart and
rebuild as needed.

Open http://localhost:3000


## License

Unless otherwise specified, this software is free to use under the LocalNerve BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: /LICENSE.md
