/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, before, beforeEach, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');

describe('sw/utils/debug', function () {
  var toolbox,
      consoleLog, consoleLogArgs, consoleLogCalled,
      debugFn, debugName, debug,
      testMessage = 'test message';

  function mockConsoleLog () {
    consoleLogCalled = false;
    consoleLogArgs = [];
    consoleLog = global.console.log;

    global.console.log = function () {
      consoleLogArgs = arguments;
      consoleLogCalled = true;
    };
  }

  function unmockConsoleLog () {
    global.console.log = consoleLog;
  }

  before('setup toolbox and console.log', function () {
    mocks.swToolbox.begin();
    toolbox = require('sw-toolbox');
    toolbox.mockSetup();
    /*
    console.log('@@@');
    console.log(require('util').inspect(toolbox, {depth: null}));
    console.log('@@@');
    */
    debugFn = require('../../../../assets/scripts/sw/utils/debug');
  });

  after(function () {
    toolbox.mockTeardown();
    mocks.swToolbox.end();
  });

  beforeEach(function () {
    var debugLog = debugFn(debugName);
    debug = function () {
      mockConsoleLog();
      debugLog.apply(debugLog, arguments);
      unmockConsoleLog();
    };
  });

  describe('global toolbox debug option', function () {
    it('should not output anything if toolbox debug false', function () {
      toolbox.options.debug = false;

      debug(testMessage);

      expect(consoleLogCalled).to.be.false;
    });

    it('should output something if toolbox debug true', function () {
      toolbox.options.debug = true;

      debug(testMessage);

      expect(consoleLogCalled).to.be.true;
      expect(consoleLogArgs.length).to.equal(2);
      expect(consoleLogArgs[0]).to.contain(debugName);
      expect(consoleLogArgs[1]).to.equal(testMessage);
    });

    it('should output multiple args', function () {
      var anotherArg = {
        testProp: 0
      };

      toolbox.options.debug = true;

      debug(testMessage, anotherArg);

      expect(consoleLogCalled).to.be.true;
      expect(consoleLogArgs.length).to.equal(3);
      expect(consoleLogArgs[0]).to.contain(debugName);
      expect(consoleLogArgs[1]).to.equal(testMessage);
      expect(consoleLogArgs[2]).to.equal(anotherArg);
    });
  });

  describe('local toolbox debug option', function () {
    it('should not output anything if debug option false', function () {
      toolbox.options.debug = false;

      debug({
        debug: false
      }, testMessage);

      expect(consoleLogCalled).to.be.false;
    });

    it('should output something if debug option true', function () {
      toolbox.options.debug = false;

      debug({
        debug: true
      }, testMessage);

      expect(consoleLogCalled).to.be.true;
      expect(consoleLogArgs.length).to.equal(2);
      expect(consoleLogArgs[0]).to.contain(debugName);
      expect(consoleLogArgs[1]).to.equal(testMessage);
    });
  });
});
