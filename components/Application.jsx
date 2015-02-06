/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, ga */
'use strict';
var React = require('react');
//var Home = require('./Home.jsx');
//var Docs = require('./Docs.jsx');
var ApplicationStore = require('../stores/ApplicationStore');
//var DocStore = require('../stores/DocStore');
var RouterMixin = require('flux-router-component').RouterMixin;
//var NavLink = require('flux-router-component').NavLink;
var FluxibleMixin = require('fluxible').Mixin;
//var TopNav = require('./TopNav');

var Application = React.createClass({
  mixins: [ RouterMixin, FluxibleMixin ],
  statics: {
    storeListeners: [ ApplicationStore ]
  },

  getInitialState: function () {
    return this.getState();
  },
  getState: function () {
    var appStore = this.getStore(ApplicationStore);
    // var docStore = this.getStore(DocStore);
    return {
      // currentDoc: docStore.getCurrent() || {},
      currentPageName: appStore.getCurrentPageName(),
      pageTitle: appStore.getPageTitle(),
      route: appStore.getCurrentRoute()
    };
  },
  onChange: function () {
    this.setState(this.getState());
  },
  render: function () {
    return (
      <div>
        <h1>Hello World</h1>
      </div>
    );
/*        
    var page;
    var hideLogo = false;
    var logo = (
        <NavLink className="pure-menu-heading" routeName="home">
            Fluxible
        </NavLink>
    );

    if ('home' === this.state.currentPageName) {
        page = <Home content={this.state.currentDoc.content} />;
        hideLogo = true;
    }
    else if ('docs' === this.state.currentPageName) {
        var docsConfig = require('./../configs/docs');
        page = <Docs menu={docsConfig} doc={this.state.currentDoc} />;
    }
    else if ('apis' === this.state.currentPageName) {
        var apisConfig = require('./../configs/apis');
        page = <Docs menu={apisConfig} doc={this.state.currentDoc} />;
    }

    return (
        <div>
            <div className="header">
                <div className="home-menu pure-menu pure-menu-open pure-menu-horizontal">
                    <div className="content">
                        <TopNav selected={this.state.currentPageName} />
                        {hideLogo ? '' : logo}
                    </div>
                </div>
            </div>
            {page}
        </div>
    );
*/    
  },

  componentDidUpdate: function (prevProps, prevState) {
    var newState = this.state;

    if (newState.pageTitle === prevState.pageTitle) {
      return;
    }

    document.title = newState.pageTitle;

    // log pageview
    if (ga) {
      ga('set', {
        page: newState.route.url,
        title: newState.pageTitle
      });
      ga('send', 'pageview');
    }
  }
});

module.exports = Application;