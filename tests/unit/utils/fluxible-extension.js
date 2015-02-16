/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';
var expect = require('chai').expect;
var FluxibleApp = require('fluxible');
var routrPlugin = require('fluxible-plugin-routr');
var extend = require('../../../utils/fluxible-extension');

describe('fluxible-extension', function () {

  var app;
  var state = {
    routes: {}
  };

  beforeEach(function() {
    app = new FluxibleApp();
    extend(app, routrPlugin);
  });

  it('adds updateRoutes method to the app', function() {    
    expect(app.updateRoutes).to.be.a('function');
  });

  describe('updateRoutes', function() {

    it('adds routrPlugin to app', function(done) {
      app.updateRoutes(state, function(err) {
        if (err) {
          done(err);
        }
        expect(app.getPlugin('RoutrPlugin')).to.be.an('object');
        expect(app._plugins.length).to.equal(1);
        done();
      });
      
    });

    it('always maintains one RoutrPlugin', function(done) {
      app.updateRoutes(state, function(err) {
        if (err) {
          done(err);
        }
        
        app.updateRoutes(state, function(err) {
          if (err) {
            done(err);
          }
        });
        
        expect(app.getPlugin('RoutrPlugin')).to.be.an('object');
        expect(app._plugins.length).to.equal(1);
        
        done();
      });
    });    
  });

});