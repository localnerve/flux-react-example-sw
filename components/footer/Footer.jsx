/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var Footer = React.createClass({
  render: function() {
    return (
      <footer className="app-footer">
        <div className="grid-row-spaced att-line footer-line">
          <span>
            One &bull; Two &bull; Three &bull; Four
          </span>          
        </div>
        <div className="grid-row-spaced business-line footer-line">
          <span>
            All code is licensed under the <a href="https://github.com/localnerve/flux-react-example/blob/master/LICENSE.md">BSD License</a>, unless otherwise stated.
          </span>
        </div>
        <div className="grid-row-spaced dev-line footer-line">
          <span>
            Designed &amp; Developed by <a href="http://localnerve.com" _target="blank">LocalNerve</a> &nbsp;&copy;&nbsp;{(new Date()).getFullYear()}
          </span>
        </div>
      </footer>
    );
  }
});

module.exports = Footer;