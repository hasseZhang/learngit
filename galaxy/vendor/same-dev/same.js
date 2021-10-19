function _test(msg) {
  if (typeof msg == 'object') {
    msg = JSON.stringify(msg, function (key, val) {
      if (typeof val === 'function') {
        return val + '';
      }
      return val;
    })
  }
  var test_log = document.getElementById('testDiv');
  if (test_log) {
    var testText = test_log.innerHTML
      , testContents = testText.split('<br>');
    if (testContents.length < 15) {
      testContents.push(msg);
    } else {
      testContents.shift();
      testContents.push(msg);
    }
    var testResult = testContents.join('<br>');
    test_log.innerHTML = testResult;
  } else {
    test_log = document.createElement('div');
    test_log.setAttribute('id', 'testDiv');
    test_log.style.width = '1200px';
    test_log.style.color = 'yellow';
    test_log.style.wordWrap = 'break-word';
    test_log.style.wordBreak = 'break-all';
    test_log.style.fontSize = '22px';
    test_log.style.position = 'absolute';
    test_log.style.top = '10px';
    test_log.style.left = '10px';
    test_log.style.padding = '3px';
    test_log.style.border = 'solid 1px #ff0';
    test_log.style.zIndex = '999';
    test_log.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    document.body.appendChild(test_log);
    test_log.innerHTML = msg;
  }
};
(function (f) { if (typeof exports === "object" && typeof module !== "undefined") { module.exports = f() } else if (typeof define === "function" && define.amd) { define([], f) } else { var g; if (typeof window !== "undefined") { g = window } else if (typeof global !== "undefined") { g = global } else if (typeof self !== "undefined") { g = self } else { g = this } g.io = f() } })(function () {
  var define, module, exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)s(r[o]); return s })({
    1: [function (_dereq_, module, exports) {

      module.exports = _dereq_('./lib/');

    }, { "./lib/": 2 }], 2: [function (_dereq_, module, exports) {

      module.exports = _dereq_('./socket');

      /**
       * Exports parser
       *
       * @api public
       *
       */
      module.exports.parser = _dereq_('engine.io-parser');

    }, { "./socket": 3, "engine.io-parser": 19 }], 3: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * Module dependencies.
         */

        var transports = _dereq_('./transports');
        var Emitter = _dereq_('component-emitter');
        var debug = _dereq_('debug')('engine.io-client:socket');
        var index = _dereq_('indexof');
        var parser = _dereq_('engine.io-parser');
        var parseuri = _dereq_('parseuri');
        var parsejson = _dereq_('parsejson');
        var parseqs = _dereq_('parseqs');

        /**
         * Module exports.
         */

        module.exports = Socket;

        /**
         * Noop function.
         *
         * @api private
         */

        function noop() { }

        /**
         * Socket constructor.
         *
         * @param {String|Object} uri or options
         * @param {Object} options
         * @api public
         */

        function Socket(uri, opts) {
          if (!(this instanceof Socket)) return new Socket(uri, opts);

          opts = opts || {};

          if (uri && 'object' == typeof uri) {
            opts = uri;
            uri = null;
          }

          if (uri) {
            uri = parseuri(uri);
            opts.hostname = uri.host;
            opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
            opts.port = uri.port;
            if (uri.query) opts.query = uri.query;
          } else if (opts.host) {
            opts.hostname = parseuri(opts.host).host;
          }

          this.secure = null != opts.secure ? opts.secure :
            (global.location && 'https:' == location.protocol);

          if (opts.hostname && !opts.port) {
            // if no port is specified manually, use the protocol default
            opts.port = this.secure ? '443' : '80';
          }

          this.agent = opts.agent || false;
          this.hostname = opts.hostname ||
            (global.location ? location.hostname : 'localhost');
          this.port = opts.port || (global.location && location.port ?
            location.port :
            (this.secure ? 443 : 80));
          this.query = opts.query || {};
          if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
          this.upgrade = false !== opts.upgrade;
          this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
          this.forceJSONP = !!opts.forceJSONP;
          this.jsonp = false !== opts.jsonp;
          this.forceBase64 = !!opts.forceBase64;
          this.enablesXDR = !!opts.enablesXDR;
          this.timestampParam = opts.timestampParam || 't';
          this.timestampRequests = opts.timestampRequests;
          this.transports = opts.transports || ['polling', 'websocket'];
          this.readyState = '';
          this.writeBuffer = [];
          this.policyPort = opts.policyPort || 843;
          this.rememberUpgrade = opts.rememberUpgrade || false;
          this.binaryType = null;
          this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
          this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

          if (true === this.perMessageDeflate) this.perMessageDeflate = {};
          if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
            this.perMessageDeflate.threshold = 1024;
          }

          // SSL options for Node.js client
          this.pfx = opts.pfx || null;
          this.key = opts.key || null;
          this.passphrase = opts.passphrase || null;
          this.cert = opts.cert || null;
          this.ca = opts.ca || null;
          this.ciphers = opts.ciphers || null;
          this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;

          // other options for Node.js client
          var freeGlobal = typeof global == 'object' && global;
          if (freeGlobal.global === freeGlobal) {
            if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
              this.extraHeaders = opts.extraHeaders;
            }
          }

          this.open();
        }

        Socket.priorWebsocketSuccess = false;

        /**
         * Mix in `Emitter`.
         */

        Emitter(Socket.prototype);

        /**
         * Protocol version.
         *
         * @api public
         */

        Socket.protocol = parser.protocol; // this is an int

        /**
         * Expose deps for legacy compatibility
         * and standalone browser access.
         */

        Socket.Socket = Socket;
        Socket.Transport = _dereq_('./transport');
        Socket.transports = _dereq_('./transports');
        Socket.parser = _dereq_('engine.io-parser');

        /**
         * Creates transport of the given type.
         *
         * @param {String} transport name
         * @return {Transport}
         * @api private
         */

        Socket.prototype.createTransport = function (name) {
          debug('creating transport "%s"', name);
          var query = clone(this.query);

          // append engine.io protocol identifier
          query.EIO = parser.protocol;

          // transport name
          query.transport = name;

          // session id if we already have one
          if (this.id) query.sid = this.id;

          var transport = new transports[name]({
            agent: this.agent,
            hostname: this.hostname,
            port: this.port,
            secure: this.secure,
            path: this.path,
            query: query,
            forceJSONP: this.forceJSONP,
            jsonp: this.jsonp,
            forceBase64: this.forceBase64,
            enablesXDR: this.enablesXDR,
            timestampRequests: this.timestampRequests,
            timestampParam: this.timestampParam,
            policyPort: this.policyPort,
            socket: this,
            pfx: this.pfx,
            key: this.key,
            passphrase: this.passphrase,
            cert: this.cert,
            ca: this.ca,
            ciphers: this.ciphers,
            rejectUnauthorized: this.rejectUnauthorized,
            perMessageDeflate: this.perMessageDeflate,
            extraHeaders: this.extraHeaders
          });

          return transport;
        };

        function clone(obj) {
          var o = {};
          for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
              o[i] = obj[i];
            }
          }
          return o;
        }

        /**
         * Initializes transport to use and starts probe.
         *
         * @api private
         */
        Socket.prototype.open = function () {
          var transport;
          if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
            transport = 'websocket';
          } else if (0 === this.transports.length) {
            // Emit error on next tick so it can be listened to
            var self = this;
            setTimeout(function () {
              self.emit('error', 'No transports available');
            }, 0);
            return;
          } else {
            transport = this.transports[0];
          }
          this.readyState = 'opening';

          // Retry with the next transport if the transport is disabled (jsonp: false)
          try {
            transport = this.createTransport(transport);
          } catch (e) {
            this.transports.shift();
            this.open();
            return;
          }

          transport.open();
          this.setTransport(transport);
        };

        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @api private
         */

         Socket.prototype.setTransport = function (transport) {
          debug('setting transport %s', transport.name);
          var self = this;

          if (this.transport) {
            debug('clearing existing transport %s', this.transport.name);
            this.transport.removeAllListeners();
          }

          // set up transport
          this.transport = transport;

          // set up transport listeners
          transport
            .on('drain', function () {
              self.onDrain();
            })
            .on('packet', function (packet) {
              self.onPacket(packet);
            })
            .on('error', function (e) {
              self.onError(e);
            })
            .on('close', function () {
              self.onClose('transport close');
            });
        };

        /**
         * Probes a transport.
         *
         * @param {String} transport name
         * @api private
         */

        Socket.prototype.probe = function (name) {
          debug('probing transport "%s"', name);
          var transport = this.createTransport(name, { probe: 1 })
            , failed = false
            , self = this;

          Socket.priorWebsocketSuccess = false;

          function onTransportOpen() {
            if (self.onlyBinaryUpgrades) {
              var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
              failed = failed || upgradeLosesBinary;
            }
            if (failed) return;

            debug('probe transport "%s" opened', name);
            transport.send([{ type: 'ping', data: 'probe' }]);
            transport.once('packet', function (msg) {
              if (failed) return;
              if ('pong' == msg.type && 'probe' == msg.data) {
                debug('probe transport "%s" pong', name);
                self.upgrading = true;
                self.emit('upgrading', transport);
                if (!transport) return;
                Socket.priorWebsocketSuccess = 'websocket' == transport.name;

                debug('pausing current transport "%s"', self.transport.name);
                self.transport.pause(function () {
                  if (failed) return;
                  if ('closed' == self.readyState) return;
                  debug('changing transport and sending upgrade packet');

                  cleanup();

                  self.setTransport(transport);
                  transport.send([{ type: 'upgrade' }]);
                  self.emit('upgrade', transport);
                  transport = null;
                  self.upgrading = false;
                  self.flush();
                });
              } else {
                debug('probe transport "%s" failed', name);
                var err = new Error('probe error');
                err.transport = transport.name;
                self.emit('upgradeError', err);
              }
            });
          }

          function freezeTransport() {
            if (failed) return;

            // Any callback called by transport should be ignored since now
            failed = true;

            cleanup();

            transport.close();
            transport = null;
          }

          //Handle any error that happens while probing
          function onerror(err) {
            var error = new Error('probe error: ' + err);
            error.transport = transport.name;

            freezeTransport();

            debug('probe transport "%s" failed because of error: %s', name, err);

            self.emit('upgradeError', error);
          }

          function onTransportClose() {
            onerror("transport closed");
          }

          //When the socket is closed while we're probing
          function onclose() {
            onerror("socket closed");
          }

          //When the socket is upgraded while we're probing
          function onupgrade(to) {
            if (transport && to.name != transport.name) {
              debug('"%s" works - aborting "%s"', to.name, transport.name);
              freezeTransport();
            }
          }

          //Remove all listeners on the transport and on self
          function cleanup() {
            transport.removeListener('open', onTransportOpen);
            transport.removeListener('error', onerror);
            transport.removeListener('close', onTransportClose);
            self.removeListener('close', onclose);
            self.removeListener('upgrading', onupgrade);
          }

          transport.once('open', onTransportOpen);
          transport.once('error', onerror);
          transport.once('close', onTransportClose);

          this.once('close', onclose);
          this.once('upgrading', onupgrade);

          transport.open();

        };

        /**
         * Called when connection is deemed open.
         *
         * @api public
         */

        Socket.prototype.onOpen = function () {
          debug('socket open');
          this.readyState = 'open';
          Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
          this.emit('open');
          this.flush();

          // we check for `readyState` in case an `open`
          // listener already closed the socket
          if ('open' == this.readyState && this.upgrade && this.transport.pause) {
            debug('starting upgrade probes');
            for (var i = 0, l = this.upgrades.length; i < l; i++) {
              this.probe(this.upgrades[i]);
            }
          }
        };

        /**
         * Handles a packet.
         *
         * @api private
         */

        Socket.prototype.onPacket = function (packet) {
          if ('opening' == this.readyState || 'open' == this.readyState) {
            debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

            this.emit('packet', packet);

            // Socket is live - any packet counts
            this.emit('heartbeat');

            switch (packet.type) {
              case 'open':
                this.onHandshake(parsejson(packet.data));
                break;

              case 'pong':
                this.setPing();
                this.emit('pong');
                break;

              case 'error':
                var err = new Error('server error');
                err.code = packet.data;
                this.onError(err);
                break;

              case 'message':
                this.emit('data', packet.data);
                this.emit('message', packet.data);
                break;
            }
          } else {
            debug('packet received with socket readyState "%s"', this.readyState);
          }
        };

        /**
         * Called upon handshake completion.
         *
         * @param {Object} handshake obj
         * @api private
         */

        Socket.prototype.onHandshake = function (data) {
          this.emit('handshake', data);
          this.id = data.sid;
          this.transport.query.sid = data.sid;
          this.upgrades = this.filterUpgrades(data.upgrades);
          this.pingInterval = data.pingInterval;
          this.pingTimeout = data.pingTimeout;
          this.onOpen();
          // In case open handler closes socket
          if ('closed' == this.readyState) return;
          this.setPing();

          // Prolong liveness of socket on heartbeat
          this.removeListener('heartbeat', this.onHeartbeat);
          this.on('heartbeat', this.onHeartbeat);
        };

        /**
         * Resets ping timeout.
         *
         * @api private
         */

        Socket.prototype.onHeartbeat = function (timeout) {
          clearTimeout(this.pingTimeoutTimer);
          var self = this;
          self.pingTimeoutTimer = setTimeout(function () {
            if ('closed' == self.readyState) return;
            self.onClose('ping timeout');
          }, timeout || (self.pingInterval + self.pingTimeout));
        };

        /**
         * Pings server every `this.pingInterval` and expects response
         * within `this.pingTimeout` or closes connection.
         *
         * @api private
         */

        Socket.prototype.setPing = function () {
          var self = this;
          clearTimeout(self.pingIntervalTimer);
          self.pingIntervalTimer = setTimeout(function () {
            debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
            self.ping();
            self.onHeartbeat(self.pingTimeout);
          }, self.pingInterval);
        };

        /**
        * Sends a ping packet.
        *
        * @api private
        */

        Socket.prototype.ping = function () {
          var self = this;
          this.sendPacket('ping', function () {
            self.emit('ping');
          });
        };

        /**
         * Called on `drain` event
         *
         * @api private
         */

        Socket.prototype.onDrain = function () {
          this.writeBuffer.splice(0, this.prevBufferLen);

          // setting prevBufferLen = 0 is very important
          // for example, when upgrading, upgrade packet is sent over,
          // and a nonzero prevBufferLen could cause problems on `drain`
          this.prevBufferLen = 0;

          if (0 === this.writeBuffer.length) {
            this.emit('drain');
          } else {
            this.flush();
          }
        };

        /**
         * Flush write buffers.
         *
         * @api private
         */

        Socket.prototype.flush = function () {
          if ('closed' != this.readyState && this.transport.writable &&
            !this.upgrading && this.writeBuffer.length) {
            debug('flushing %d packets in socket', this.writeBuffer.length);
            this.transport.send(this.writeBuffer);
            // keep track of current length of writeBuffer
            // splice writeBuffer and callbackBuffer on `drain`
            this.prevBufferLen = this.writeBuffer.length;
            this.emit('flush');
          }
        };

        /**
         * Sends a message.
         *
         * @param {String} message.
         * @param {Function} callback function.
         * @param {Object} options.
         * @return {Socket} for chaining.
         * @api public
         */

        Socket.prototype.write =
          Socket.prototype.send = function (msg, options, fn) {
            this.sendPacket('message', msg, options, fn);
            return this;
          };

        /**
         * Sends a packet.
         *
         * @param {String} packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} callback function.
         * @api private
         */

        Socket.prototype.sendPacket = function (type, data, options, fn) {
          if ('function' == typeof data) {
            fn = data;
            data = undefined;
          }

          if ('function' == typeof options) {
            fn = options;
            options = null;
          }

          if ('closing' == this.readyState || 'closed' == this.readyState) {
            return;
          }

          options = options || {};
          options.compress = false !== options.compress;

          var packet = {
            type: type,
            data: data,
            options: options
          };
          this.emit('packetCreate', packet);
          this.writeBuffer.push(packet);
          if (fn) this.once('flush', fn);
          this.flush();
        };

        /**
         * Closes the connection.
         *
         * @api private
         */

        Socket.prototype.close = function () {
          if ('opening' == this.readyState || 'open' == this.readyState) {
            this.readyState = 'closing';

            var self = this;

            if (this.writeBuffer.length) {
              this.once('drain', function () {
                if (this.upgrading) {
                  waitForUpgrade();
                } else {
                  close();
                }
              });
            } else if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          }

          function close() {
            self.onClose('forced close');
            debug('socket closing - telling transport to close');
            self.transport.close();
          }

          function cleanupAndClose() {
            self.removeListener('upgrade', cleanupAndClose);
            self.removeListener('upgradeError', cleanupAndClose);
            close();
          }

          function waitForUpgrade() {
            // wait for upgrade to finish since we can't send packets while pausing a transport
            self.once('upgrade', cleanupAndClose);
            self.once('upgradeError', cleanupAndClose);
          }

          return this;
        };

        /**
         * Called upon transport error
         *
         * @api private
         */

        Socket.prototype.onError = function (err) {
          debug('socket error %j', err);
          Socket.priorWebsocketSuccess = false;
          this.emit('error', err);
          this.onClose('transport error', err);
        };

        /**
         * Called upon transport close.
         *
         * @api private
         */

        Socket.prototype.onClose = function (reason, desc) {
          if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
            debug('socket close with reason: "%s"', reason);
            var self = this;

            // clear timers
            clearTimeout(this.pingIntervalTimer);
            clearTimeout(this.pingTimeoutTimer);

            // stop event from firing again for transport
            this.transport.removeAllListeners('close');

            // ensure transport won't stay open
            this.transport.close();

            // ignore further transport communication
            this.transport.removeAllListeners();

            // set ready state
            this.readyState = 'closed';

            // clear session id
            this.id = null;

            // emit close event
            this.emit('close', reason, desc);

            // clean buffers after, so users can still
            // grab the buffers on `close` event
            self.writeBuffer = [];
            self.prevBufferLen = 0;
          }
        };

        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} server upgrades
         * @api private
         *
         */

        Socket.prototype.filterUpgrades = function (upgrades) {
          var filteredUpgrades = [];
          for (var i = 0, j = upgrades.length; i < j; i++) {
            if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
          }
          return filteredUpgrades;
        };

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "./transport": 4, "./transports": 5, "component-emitter": 15, "debug": 17, "engine.io-parser": 19, "indexof": 23, "parsejson": 26, "parseqs": 27, "parseuri": 28 }], 4: [function (_dereq_, module, exports) {
      /**
       * Module dependencies.
       */

      var parser = _dereq_('engine.io-parser');
      var Emitter = _dereq_('component-emitter');

      /**
       * Module exports.
       */

      module.exports = Transport;

      /**
       * Transport abstract constructor.
       *
       * @param {Object} options.
       * @api private
       */

      function Transport(opts) {
        this.path = opts.path;
        this.hostname = opts.hostname;
        this.port = opts.port;
        this.secure = opts.secure;
        this.query = opts.query;
        this.timestampParam = opts.timestampParam;
        this.timestampRequests = opts.timestampRequests;
        this.readyState = '';
        this.agent = opts.agent || false;
        this.socket = opts.socket;
        this.enablesXDR = opts.enablesXDR;

        // SSL options for Node.js client
        this.pfx = opts.pfx;
        this.key = opts.key;
        this.passphrase = opts.passphrase;
        this.cert = opts.cert;
        this.ca = opts.ca;
        this.ciphers = opts.ciphers;
        this.rejectUnauthorized = opts.rejectUnauthorized;

        // other options for Node.js client
        this.extraHeaders = opts.extraHeaders;
      }

      /**
       * Mix in `Emitter`.
       */

      Emitter(Transport.prototype);

      /**
       * Emits an error.
       *
       * @param {String} str
       * @return {Transport} for chaining
       * @api public
       */

      Transport.prototype.onError = function (msg, desc) {
        var err = new Error(msg);
        err.type = 'TransportError';
        err.description = desc;
        this.emit('error', err);
        return this;
      };

      /**
       * Opens the transport.
       *
       * @api public
       */

      Transport.prototype.open = function () {
        if ('closed' == this.readyState || '' == this.readyState) {
          this.readyState = 'opening';
          this.doOpen();
        }

        return this;
      };

      /**
       * Closes the transport.
       *
       * @api private
       */

      Transport.prototype.close = function () {
        if ('opening' == this.readyState || 'open' == this.readyState) {
          this.doClose();
          this.onClose();
        }

        return this;
      };

      /**
       * Sends multiple packets.
       *
       * @param {Array} packets
       * @api private
       */

      Transport.prototype.send = function (packets) {
        if ('open' == this.readyState) {
          this.write(packets);
        } else {
          throw new Error('Transport not open');
        }
      };

      /**
       * Called upon open
       *
       * @api private
       */

      Transport.prototype.onOpen = function () {
        this.readyState = 'open';
        this.writable = true;
        this.emit('open');
      };

      /**
       * Called with data.
       *
       * @param {String} data
       * @api private
       */

      Transport.prototype.onData = function (data) {
        var packet = parser.decodePacket(data, this.socket.binaryType);
        this.onPacket(packet);
      };

      /**
       * Called with a decoded packet.
       */

      Transport.prototype.onPacket = function (packet) {
        this.emit('packet', packet);
      };

      /**
       * Called upon close.
       *
       * @api private
       */

      Transport.prototype.onClose = function () {
        this.readyState = 'closed';
        this.emit('close');
      };

    }, { "component-emitter": 15, "engine.io-parser": 19 }], 5: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * Module dependencies
         */

        var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
        var XHR = _dereq_('./polling-xhr');
        var JSONP = _dereq_('./polling-jsonp');
        var websocket = _dereq_('./websocket');

        /**
         * Export transports.
         */

        exports.polling = polling;
        exports.websocket = websocket;

        /**
         * Polling transport polymorphic constructor.
         * Decides on xhr vs jsonp based on feature detection.
         *
         * @api private
         */

        function polling(opts) {
          var xhr;
          var xd = false;
          var xs = false;
          var jsonp = false !== opts.jsonp;

          if (global.location) {
            var isSSL = 'https:' == location.protocol;
            var port = location.port;

            // some user agents have empty `location.port`
            if (!port) {
              port = isSSL ? 443 : 80;
            }

            xd = opts.hostname != location.hostname || port != opts.port;
            xs = opts.secure != isSSL;
          }

          opts.xdomain = xd;
          opts.xscheme = xs;
          xhr = new XMLHttpRequest(opts);

          if ('open' in xhr && !opts.forceJSONP) {
            return new XHR(opts);
          } else {
            if (!jsonp) throw new Error('JSONP disabled');
            return new JSONP(opts);
          }
        }

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "./polling-jsonp": 6, "./polling-xhr": 7, "./websocket": 9, "xmlhttprequest-ssl": 10 }], 6: [function (_dereq_, module, exports) {
      (function (global) {

        /**
         * Module requirements.
         */

        var Polling = _dereq_('./polling');
        var inherit = _dereq_('component-inherit');

        /**
         * Module exports.
         */

        module.exports = JSONPPolling;

        /**
         * Cached regular expressions.
         */

        var rNewline = /\n/g;
        var rEscapedNewline = /\\n/g;

        /**
         * Global JSONP callbacks.
         */

        var callbacks;

        /**
         * Callbacks count.
         */

        var index = 0;

        /**
         * Noop.
         */

        function empty() { }

        /**
         * JSONP Polling constructor.
         *
         * @param {Object} opts.
         * @api public
         */

        function JSONPPolling(opts) {
          Polling.call(this, opts);

          this.query = this.query || {};

          // define global callbacks array if not present
          // we do this here (lazily) to avoid unneeded global pollution
          if (!callbacks) {
            // we need to consider multiple engines in the same page
            if (!global.___eio) global.___eio = [];
            callbacks = global.___eio;
          }

          // callback identifier
          this.index = callbacks.length;

          // add callback to jsonp global
          var self = this;
          callbacks.push(function (msg) {
            self.onData(msg);
          });

          // append to query string
          this.query.j = this.index;

          // prevent spurious errors from being emitted when the window is unloaded
          if (global.document && global.addEventListener) {
            global.addEventListener('beforeunload', function () {
              if (self.script) self.script.onerror = empty;
            }, false);
          }
        }

        /**
         * Inherits from Polling.
         */

        inherit(JSONPPolling, Polling);

        /*
         * JSONP only supports binary as base64 encoded strings
         */

        JSONPPolling.prototype.supportsBinary = false;

        /**
         * Closes the socket.
         *
         * @api private
         */

        JSONPPolling.prototype.doClose = function () {
          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null;
          }

          if (this.form) {
            this.form.parentNode.removeChild(this.form);
            this.form = null;
            this.iframe = null;
          }

          Polling.prototype.doClose.call(this);
        };

        /**
         * Starts a poll cycle.
         *
         * @api private
         */

        JSONPPolling.prototype.doPoll = function () {
          var self = this;
          var script = document.createElement('script');

          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null;
          }

          script.async = true;
          script.src = this.uri();
          script.onerror = function (e) {
            self.onError('jsonp poll error', e);
          };

          var insertAt = document.getElementsByTagName('script')[0];
          if (insertAt) {
            insertAt.parentNode.insertBefore(script, insertAt);
          }
          else {
            (document.head || document.body).appendChild(script);
          }
          this.script = script;

          var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);

          if (isUAgecko) {
            setTimeout(function () {
              var iframe = document.createElement('iframe');
              document.body.appendChild(iframe);
              document.body.removeChild(iframe);
            }, 100);
          }
        };

        /**
         * Writes with a hidden iframe.
         *
         * @param {String} data to send
         * @param {Function} called upon flush.
         * @api private
         */

        JSONPPolling.prototype.doWrite = function (data, fn) {
          var self = this;

          if (!this.form) {
            var form = document.createElement('form');
            var area = document.createElement('textarea');
            var id = this.iframeId = 'eio_iframe_' + this.index;
            var iframe;

            form.className = 'socketio';
            form.style.position = 'absolute';
            form.style.top = '-1000px';
            form.style.left = '-1000px';
            form.target = id;
            form.method = 'POST';
            form.setAttribute('accept-charset', 'utf-8');
            area.name = 'd';
            form.appendChild(area);
            document.body.appendChild(form);

            this.form = form;
            this.area = area;
          }

          this.form.action = this.uri();

          function complete() {
            initIframe();
            fn();
          }

          function initIframe() {
            if (self.iframe) {
              try {
                self.form.removeChild(self.iframe);
              } catch (e) {
                self.onError('jsonp polling iframe removal error', e);
              }
            }

            try {
              // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
              var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
              iframe = document.createElement(html);
            } catch (e) {
              iframe = document.createElement('iframe');
              iframe.name = self.iframeId;
              iframe.src = 'javascript:0';
            }

            iframe.id = self.iframeId;

            self.form.appendChild(iframe);
            self.iframe = iframe;
          }

          initIframe();

          // escape \n to prevent it from being converted into \r\n by some UAs
          // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
          data = data.replace(rEscapedNewline, '\\\n');
          this.area.value = data.replace(rNewline, '\\n');

          try {
            this.form.submit();
          } catch (e) { }

          if (this.iframe.attachEvent) {
            this.iframe.onreadystatechange = function () {
              if (self.iframe.readyState == 'complete') {
                complete();
              }
            };
          } else {
            this.iframe.onload = complete;
          }
        };

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "./polling": 8, "component-inherit": 16 }], 7: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * Module requirements.
         */

        var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
        var Polling = _dereq_('./polling');
        var Emitter = _dereq_('component-emitter');
        var inherit = _dereq_('component-inherit');
        var debug = _dereq_('debug')('engine.io-client:polling-xhr');

        /**
         * Module exports.
         */

        module.exports = XHR;
        module.exports.Request = Request;

        /**
         * Empty function
         */

        function empty() { }

        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @api public
         */

        function XHR(opts) {
          Polling.call(this, opts);

          if (global.location) {
            var isSSL = 'https:' == location.protocol;
            var port = location.port;

            // some user agents have empty `location.port`
            if (!port) {
              port = isSSL ? 443 : 80;
            }

            this.xd = opts.hostname != global.location.hostname ||
              port != opts.port;
            this.xs = opts.secure != isSSL;
          } else {
            this.extraHeaders = opts.extraHeaders;
          }
        }

        /**
         * Inherits from Polling.
         */

        inherit(XHR, Polling);

        /**
         * XHR supports binary
         */

        XHR.prototype.supportsBinary = true;

        /**
         * Creates a request.
         *
         * @param {String} method
         * @api private
         */

        XHR.prototype.request = function (opts) {
          opts = opts || {};
          opts.uri = this.uri();
          opts.xd = this.xd;
          opts.xs = this.xs;
          opts.agent = this.agent || false;
          opts.supportsBinary = this.supportsBinary;
          opts.enablesXDR = this.enablesXDR;

          // SSL options for Node.js client
          opts.pfx = this.pfx;
          opts.key = this.key;
          opts.passphrase = this.passphrase;
          opts.cert = this.cert;
          opts.ca = this.ca;
          opts.ciphers = this.ciphers;
          opts.rejectUnauthorized = this.rejectUnauthorized;

          // other options for Node.js client
          opts.extraHeaders = this.extraHeaders;

          return new Request(opts);
        };

        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @api private
         */

        XHR.prototype.doWrite = function (data, fn) {
          var isBinary = typeof data !== 'string' && data !== undefined;
          var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
          var self = this;
          req.on('success', fn);
          req.on('error', function (err) {
            self.onError('xhr post error', err);
          });
          this.sendXhr = req;
        };

        /**
         * Starts a poll cycle.
         *
         * @api private
         */

        XHR.prototype.doPoll = function () {
          debug('xhr poll');
          var req = this.request();
          var self = this;
          req.on('data', function (data) {
            self.onData(data);
          });
          req.on('error', function (err) {
            self.onError('xhr poll error', err);
          });
          this.pollXhr = req;
        };

        /**
         * Request constructor
         *
         * @param {Object} options
         * @api public
         */

        function Request(opts) {
          this.method = opts.method || 'GET';
          this.uri = opts.uri;
          this.xd = !!opts.xd;
          this.xs = !!opts.xs;
          this.async = false !== opts.async;
          this.data = undefined != opts.data ? opts.data : null;
          this.agent = opts.agent;
          this.isBinary = opts.isBinary;
          this.supportsBinary = opts.supportsBinary;
          this.enablesXDR = opts.enablesXDR;

          // SSL options for Node.js client
          this.pfx = opts.pfx;
          this.key = opts.key;
          this.passphrase = opts.passphrase;
          this.cert = opts.cert;
          this.ca = opts.ca;
          this.ciphers = opts.ciphers;
          this.rejectUnauthorized = opts.rejectUnauthorized;

          // other options for Node.js client
          this.extraHeaders = opts.extraHeaders;

          this.create();
        }

        /**
         * Mix in `Emitter`.
         */

        Emitter(Request.prototype);

        /**
         * Creates the XHR object and sends the request.
         *
         * @api private
         */

        Request.prototype.create = function () {
          var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

          // SSL options for Node.js client
          opts.pfx = this.pfx;
          opts.key = this.key;
          opts.passphrase = this.passphrase;
          opts.cert = this.cert;
          opts.ca = this.ca;
          opts.ciphers = this.ciphers;
          opts.rejectUnauthorized = this.rejectUnauthorized;

          var xhr = this.xhr = new XMLHttpRequest(opts);
          var self = this;

          try {
            debug('xhr open %s: %s', this.method, this.uri);
            xhr.open(this.method, this.uri, this.async);
            try {
              if (this.extraHeaders) {
                xhr.setDisableHeaderCheck(true);
                for (var i in this.extraHeaders) {
                  if (this.extraHeaders.hasOwnProperty(i)) {
                    xhr.setRequestHeader(i, this.extraHeaders[i]);
                  }
                }
              }
            } catch (e) { }
            if (this.supportsBinary) {
              // This has to be done after open because Firefox is stupid
              // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
              xhr.responseType = 'arraybuffer';
            }

            if ('POST' == this.method) {
              try {
                if (this.isBinary) {
                  xhr.setRequestHeader('Content-type', 'application/octet-stream');
                } else {
                  xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
                }
              } catch (e) { }
            }

            // ie6 check
            if ('withCredentials' in xhr) {
              xhr.withCredentials = true;
            }

            if (this.hasXDR()) {
              xhr.onload = function () {
                self.onLoad();
              };
              xhr.onerror = function () {
                self.onError(xhr.responseText);
              };
            } else {
              xhr.onreadystatechange = function () {
                if (4 != xhr.readyState) return;
                if (200 == xhr.status || 1223 == xhr.status) {
                  self.onLoad();
                } else {
                  // make sure the `error` event handler that's user-set
                  // does not throw in the same tick and gets caught here
                  setTimeout(function () {
                    self.onError(xhr.status);
                  }, 0);
                }
              };
            }

            debug('xhr data %s', this.data);
            xhr.send(this.data);
          } catch (e) {
            // Need to defer since .create() is called directly fhrom the constructor
            // and thus the 'error' event can only be only bound *after* this exception
            // occurs.  Therefore, also, we cannot throw here at all.
            setTimeout(function () {
              self.onError(e);
            }, 0);
            return;
          }

          if (global.document) {
            this.index = Request.requestsCount++;
            Request.requests[this.index] = this;
          }
        };

        /**
         * Called upon successful response.
         *
         * @api private
         */

        Request.prototype.onSuccess = function () {
          this.emit('success');
          this.cleanup();
        };

        /**
         * Called if we have data.
         *
         * @api private
         */

        Request.prototype.onData = function (data) {
          this.emit('data', data);
          this.onSuccess();
        };

        /**
         * Called upon error.
         *
         * @api private
         */

        Request.prototype.onError = function (err) {
          this.emit('error', err);
          this.cleanup(true);
        };

        /**
         * Cleans up house.
         *
         * @api private
         */

        Request.prototype.cleanup = function (fromError) {
          if ('undefined' == typeof this.xhr || null === this.xhr) {
            return;
          }
          // xmlhttprequest
          if (this.hasXDR()) {
            this.xhr.onload = this.xhr.onerror = empty;
          } else {
            this.xhr.onreadystatechange = empty;
          }

          if (fromError) {
            try {
              this.xhr.abort();
            } catch (e) { }
          }

          if (global.document) {
            delete Request.requests[this.index];
          }

          this.xhr = null;
        };

        /**
         * Called upon load.
         *
         * @api private
         */

        Request.prototype.onLoad = function () {
          var data;
          try {
            var contentType;
            try {
              contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
            } catch (e) { }
            if (contentType === 'application/octet-stream') {
              data = this.xhr.response;
            } else {
              if (!this.supportsBinary) {
                data = this.xhr.responseText;
              } else {
                try {
                  data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
                } catch (e) {
                  var ui8Arr = new Uint8Array(this.xhr.response);
                  var dataArray = [];
                  for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
                    dataArray.push(ui8Arr[idx]);
                  }

                  data = String.fromCharCode.apply(null, dataArray);
                }
              }
            }
          } catch (e) {
            this.onError(e);
          }
          if (null != data) {
            this.onData(data);
          }
        };

        /**
         * Check if it has XDomainRequest.
         *
         * @api private
         */

        Request.prototype.hasXDR = function () {
          return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
        };

        /**
         * Aborts the request.
         *
         * @api public
         */

        Request.prototype.abort = function () {
          this.cleanup();
        };

        /**
         * Aborts pending requests when unloading the window. This is needed to prevent
         * memory leaks (e.g. when using IE) and to ensure that no spurious error is
         * emitted.
         */

        if (global.document) {
          Request.requestsCount = 0;
          Request.requests = {};
          if (global.attachEvent) {
            global.attachEvent('onunload', unloadHandler);
          } else if (global.addEventListener) {
            global.addEventListener('beforeunload', unloadHandler, false);
          }
        }

        function unloadHandler() {
          for (var i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
              Request.requests[i].abort();
            }
          }
        }

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "./polling": 8, "component-emitter": 15, "component-inherit": 16, "debug": 17, "xmlhttprequest-ssl": 10 }], 8: [function (_dereq_, module, exports) {
      /**
       * Module dependencies.
       */

      var Transport = _dereq_('../transport');
      var parseqs = _dereq_('parseqs');
      var parser = _dereq_('engine.io-parser');
      var inherit = _dereq_('component-inherit');
      var yeast = _dereq_('yeast');
      var debug = _dereq_('debug')('engine.io-client:polling');

      /**
       * Module exports.
       */

      module.exports = Polling;

      /**
       * Is XHR2 supported?
       */

      var hasXHR2 = (function () {
        var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
        var xhr = new XMLHttpRequest({ xdomain: false });
        return null != xhr.responseType;
      })();

      /**
       * Polling interface.
       *
       * @param {Object} opts
       * @api private
       */

      function Polling(opts) {
        var forceBase64 = (opts && opts.forceBase64);
        if (!hasXHR2 || forceBase64) {
          this.supportsBinary = false;
        }
        Transport.call(this, opts);
      }

      /**
       * Inherits from Transport.
       */

      inherit(Polling, Transport);

      /**
       * Transport name.
       */

      Polling.prototype.name = 'polling';

      /**
       * Opens the socket (triggers polling). We write a PING message to determine
       * when the transport is open.
       *
       * @api private
       */

      Polling.prototype.doOpen = function () {
        this.poll();
      };

      /**
       * Pauses polling.
       *
       * @param {Function} callback upon buffers are flushed and transport is paused
       * @api private
       */

      Polling.prototype.pause = function (onPause) {
        var pending = 0;
        var self = this;

        this.readyState = 'pausing';

        function pause() {
          debug('paused');
          self.readyState = 'paused';
          onPause();
        }

        if (this.polling || !this.writable) {
          var total = 0;

          if (this.polling) {
            debug('we are currently polling - waiting to pause');
            total++;
            this.once('pollComplete', function () {
              debug('pre-pause polling complete');
              --total || pause();
            });
          }

          if (!this.writable) {
            debug('we are currently writing - waiting to pause');
            total++;
            this.once('drain', function () {
              debug('pre-pause writing complete');
              --total || pause();
            });
          }
        } else {
          pause();
        }
      };

      /**
       * Starts polling cycle.
       *
       * @api public
       */

      Polling.prototype.poll = function () {
        debug('polling');
        this.polling = true;
        this.doPoll();
        this.emit('poll');
      };

      /**
       * Overloads onData to detect payloads.
       *
       * @api private
       */

      Polling.prototype.onData = function (data) {
        var self = this;
        debug('polling got data %s', data);
        var callback = function (packet, index, total) {
          // if its the first message we consider the transport open
          if ('opening' == self.readyState) {
            self.onOpen();
          }

          // if its a close packet, we close the ongoing requests
          if ('close' == packet.type) {
            self.onClose();
            return false;
          }

          // otherwise bypass onData and handle the message
          self.onPacket(packet);
        };

        // decode payload
        parser.decodePayload(data, this.socket.binaryType, callback);

        // if an event did not trigger closing
        if ('closed' != this.readyState) {
          // if we got data we're not polling
          this.polling = false;
          this.emit('pollComplete');

          if ('open' == this.readyState) {
            this.poll();
          } else {
            debug('ignoring poll - transport state "%s"', this.readyState);
          }
        }
      };

      /**
       * For polling, send a close packet.
       *
       * @api private
       */

      Polling.prototype.doClose = function () {
        var self = this;

        function close() {
          debug('writing close packet');
          self.write([{ type: 'close' }]);
        }

        if ('open' == this.readyState) {
          debug('transport open - closing');
          close();
        } else {
          // in case we're trying to close while
          // handshaking is in progress (GH-164)
          debug('transport not open - deferring close');
          this.once('open', close);
        }
      };

      /**
       * Writes a packets payload.
       *
       * @param {Array} data packets
       * @param {Function} drain callback
       * @api private
       */

      Polling.prototype.write = function (packets) {
        var self = this;
        this.writable = false;
        var callbackfn = function () {
          self.writable = true;
          self.emit('drain');
        };

        var self = this;
        parser.encodePayload(packets, this.supportsBinary, function (data) {
          self.doWrite(data, callbackfn);
        });
      };

      /**
       * Generates uri for connection.
       *
       * @api private
       */

      Polling.prototype.uri = function () {
        var query = this.query || {};
        var schema = this.secure ? 'https' : 'http';
        var port = '';

        // cache busting is forced
        if (false !== this.timestampRequests) {
          query[this.timestampParam] = yeast();
        }

        if (!this.supportsBinary && !query.sid) {
          query.b64 = 1;
        }

        query = parseqs.encode(query);

        // avoid port if default for schema
        if (this.port && (('https' == schema && this.port != 443) ||
          ('http' == schema && this.port != 80))) {
          port = ':' + this.port;
        }

        // prepend ? to query
        if (query.length) {
          query = '?' + query;
        }

        var ipv6 = this.hostname.indexOf(':') !== -1;
        return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
      };

    }, { "../transport": 4, "component-inherit": 16, "debug": 17, "engine.io-parser": 19, "parseqs": 27, "xmlhttprequest-ssl": 10, "yeast": 30 }], 9: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * Module dependencies.
         */

        var Transport = _dereq_('../transport');
        var parser = _dereq_('engine.io-parser');
        var parseqs = _dereq_('parseqs');
        var inherit = _dereq_('component-inherit');
        var yeast = _dereq_('yeast');
        var debug = _dereq_('debug')('engine.io-client:websocket');
        var BrowserWebSocket = global.WebSocket || global.MozWebSocket;

        /**
         * Get either the `WebSocket` or `MozWebSocket` globals
         * in the browser or try to resolve WebSocket-compatible
         * interface exposed by `ws` for Node-like environment.
         */

        var WebSocket = BrowserWebSocket;
        if (!WebSocket && typeof window === 'undefined') {
          try {
            WebSocket = _dereq_('ws');
          } catch (e) { }
        }

        /**
         * Module exports.
         */

        module.exports = WS;

        /**
         * WebSocket transport constructor.
         *
         * @api {Object} connection options
         * @api public
         */

        function WS(opts) {
          var forceBase64 = (opts && opts.forceBase64);
          if (forceBase64) {
            this.supportsBinary = false;
          }
          this.perMessageDeflate = opts.perMessageDeflate;
          Transport.call(this, opts);
        }

        /**
         * Inherits from Transport.
         */

        inherit(WS, Transport);

        /**
         * Transport name.
         *
         * @api public
         */

        WS.prototype.name = 'websocket';

        /*
         * WebSockets support binary
         */

        WS.prototype.supportsBinary = true;

        /**
         * Opens socket.
         *
         * @api private
         */

        WS.prototype.doOpen = function () {
          if (!this.check()) {
            // let probe timeout
            return;
          }

          var self = this;
          var uri = this.uri();
          var protocols = void (0);
          var opts = {
            agent: this.agent,
            perMessageDeflate: this.perMessageDeflate
          };

          // SSL options for Node.js client
          opts.pfx = this.pfx;
          opts.key = this.key;
          opts.passphrase = this.passphrase;
          opts.cert = this.cert;
          opts.ca = this.ca;
          opts.ciphers = this.ciphers;
          opts.rejectUnauthorized = this.rejectUnauthorized;
          if (this.extraHeaders) {
            opts.headers = this.extraHeaders;
          }

          this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);

          if (this.ws.binaryType === undefined) {
            this.supportsBinary = false;
          }

          if (this.ws.supports && this.ws.supports.binary) {
            this.supportsBinary = true;
            this.ws.binaryType = 'buffer';
          } else {
            this.ws.binaryType = 'arraybuffer';
          }

          this.addEventListeners();
        };

        /**
         * Adds event listeners to the socket
         *
         * @api private
         */

        WS.prototype.addEventListeners = function () {
          var self = this;

          this.ws.onopen = function () {
            self.onOpen();
          };
          this.ws.onclose = function () {
            self.onClose();
          };
          this.ws.onmessage = function (ev) {
            self.onData(ev.data);
          };
          this.ws.onerror = function (e) {
            self.onError('websocket error', e);
          };
        };

        /**
         * Override `onData` to use a timer on iOS.
         * See: https://gist.github.com/mloughran/2052006
         *
         * @api private
         */

        if ('undefined' != typeof navigator
          && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
          WS.prototype.onData = function (data) {
            var self = this;
            setTimeout(function () {
              Transport.prototype.onData.call(self, data);
            }, 0);
          };
        }

        /**
         * Writes data to socket.
         *
         * @param {Array} array of packets.
         * @api private
         */

        WS.prototype.write = function (packets) {
          var self = this;
          this.writable = false;

          // encodePacket efficient as it uses WS framing
          // no need for encodePayload
          var total = packets.length;
          for (var i = 0, l = total; i < l; i++) {
            (function (packet) {
              parser.encodePacket(packet, self.supportsBinary, function (data) {
                if (!BrowserWebSocket) {
                  // always create a new object (GH-437)
                  var opts = {};
                  if (packet.options) {
                    opts.compress = packet.options.compress;
                  }

                  if (self.perMessageDeflate) {
                    var len = 'string' == typeof data ? global.Buffer.byteLength(data) : data.length;
                    if (len < self.perMessageDeflate.threshold) {
                      opts.compress = false;
                    }
                  }
                }

                //Sometimes the websocket has already been closed but the browser didn't
                //have a chance of informing us about it yet, in that case send will
                //throw an error
                try {
                  if (BrowserWebSocket) {
                    // TypeError is thrown when passing the second argument on Safari
                    self.ws.send(data);
                  } else {
                    self.ws.send(data, opts);
                  }
                } catch (e) {
                  debug('websocket closed before onclose event');
                }

                --total || done();
              });
            })(packets[i]);
          }

          function done() {
            self.emit('flush');

            // fake drain
            // defer to next tick to allow Socket to clear writeBuffer
            setTimeout(function () {
              self.writable = true;
              self.emit('drain');
            }, 0);
          }
        };

        /**
         * Called upon close
         *
         * @api private
         */

        WS.prototype.onClose = function () {
          Transport.prototype.onClose.call(this);
        };

        /**
         * Closes socket.
         *
         * @api private
         */

        WS.prototype.doClose = function () {
          if (typeof this.ws !== 'undefined') {
            this.ws.close();
          }
        };

        /**
         * Generates uri for connection.
         *
         * @api private
         */

        WS.prototype.uri = function () {
          var query = this.query || {};
          var schema = this.secure ? 'wss' : 'ws';
          var port = '';

          // avoid port if default for schema
          if (this.port && (('wss' == schema && this.port != 443)
            || ('ws' == schema && this.port != 80))) {
            port = ':' + this.port;
          }

          // append timestamp to URI
          if (this.timestampRequests) {
            query[this.timestampParam] = yeast();
          }

          // communicate binary support capabilities
          if (!this.supportsBinary) {
            query.b64 = 1;
          }

          query = parseqs.encode(query);

          // prepend ? to query
          if (query.length) {
            query = '?' + query;
          }

          var ipv6 = this.hostname.indexOf(':') !== -1;
          return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
        };

        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @api public
         */

        WS.prototype.check = function () {
          return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
        };

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "../transport": 4, "component-inherit": 16, "debug": 17, "engine.io-parser": 19, "parseqs": 27, "ws": undefined, "yeast": 30 }], 10: [function (_dereq_, module, exports) {
      // browser shim for xmlhttprequest module
      var hasCORS = _dereq_('has-cors');

      module.exports = function (opts) {
        var xdomain = opts.xdomain;

        // scheme must be same when usign XDomainRequest
        // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
        var xscheme = opts.xscheme;

        // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
        // https://github.com/Automattic/engine.io-client/pull/217
        var enablesXDR = opts.enablesXDR;

        // XMLHttpRequest can be disabled on IE
        try {
          if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
            return new XMLHttpRequest();
          }
        } catch (e) { }

        // Use XDomainRequest for IE8 if enablesXDR is true
        // because loading bar keeps flashing when using jsonp-polling
        // https://github.com/yujiosaka/socke.io-ie8-loading-example
        try {
          if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
            return new XDomainRequest();
          }
        } catch (e) { }

        if (!xdomain) {
          try {
            return new ActiveXObject('Microsoft.XMLHTTP');
          } catch (e) { }
        }
      }

    }, { "has-cors": 22 }], 11: [function (_dereq_, module, exports) {
      module.exports = after

      function after(count, callback, err_cb) {
        var bail = false
        err_cb = err_cb || noop
        proxy.count = count

        return (count === 0) ? callback() : proxy

        function proxy(err, result) {
          if (proxy.count <= 0) {
            throw new Error('after called too many times')
          }
          --proxy.count

          // after first error, rest are passed to err_cb
          if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
          } else if (proxy.count === 0 && !bail) {
            callback(null, result)
          }
        }
      }

      function noop() { }

    }, {}], 12: [function (_dereq_, module, exports) {
      /**
       * An abstraction for slicing an arraybuffer even when
       * ArrayBuffer.prototype.slice is not supported
       *
       * @api public
       */

      module.exports = function (arraybuffer, start, end) {
        var bytes = arraybuffer.byteLength;
        start = start || 0;
        end = end || bytes;

        if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

        if (start < 0) { start += bytes; }
        if (end < 0) { end += bytes; }
        if (end > bytes) { end = bytes; }

        if (start >= bytes || start >= end || bytes === 0) {
          return new ArrayBuffer(0);
        }

        var abv = new Uint8Array(arraybuffer);
        var result = new Uint8Array(end - start);
        for (var i = start, ii = 0; i < end; i++ , ii++) {
          result[ii] = abv[i];
        }
        return result.buffer;
      };

    }, {}], 13: [function (_dereq_, module, exports) {
      /*
       * base64-arraybuffer
       * https://github.com/niklasvh/base64-arraybuffer
       *
       * Copyright (c) 2012 Niklas von Hertzen
       * Licensed under the MIT license.
       */
      (function (chars) {
        "use strict";

        exports.encode = function (arraybuffer) {
          var bytes = new Uint8Array(arraybuffer),
            i, len = bytes.length, base64 = "";

          for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
          }

          if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
          } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
          }

          return base64;
        };

        exports.decode = function (base64) {
          var bufferLength = base64.length * 0.75,
            len = base64.length, i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

          if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
              bufferLength--;
            }
          }

          var arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

          for (i = 0; i < len; i += 4) {
            encoded1 = chars.indexOf(base64[i]);
            encoded2 = chars.indexOf(base64[i + 1]);
            encoded3 = chars.indexOf(base64[i + 2]);
            encoded4 = chars.indexOf(base64[i + 3]);

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
          }

          return arraybuffer;
        };
      })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

    }, {}], 14: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * Create a blob builder even when vendor prefixes exist
         */

        var BlobBuilder = global.BlobBuilder
          || global.WebKitBlobBuilder
          || global.MSBlobBuilder
          || global.MozBlobBuilder;

        /**
         * Check if Blob constructor is supported
         */

        var blobSupported = (function () {
          try {
            var a = new Blob(['hi']);
            return a.size === 2;
          } catch (e) {
            return false;
          }
        })();

        /**
         * Check if Blob constructor supports ArrayBufferViews
         * Fails in Safari 6, so we need to map to ArrayBuffers there.
         */

        var blobSupportsArrayBufferView = blobSupported && (function () {
          try {
            var b = new Blob([new Uint8Array([1, 2])]);
            return b.size === 2;
          } catch (e) {
            return false;
          }
        })();

        /**
         * Check if BlobBuilder is supported
         */

        var blobBuilderSupported = BlobBuilder
          && BlobBuilder.prototype.append
          && BlobBuilder.prototype.getBlob;

        /**
         * Helper function that maps ArrayBufferViews to ArrayBuffers
         * Used by BlobBuilder constructor and old browsers that didn't
         * support it in the Blob constructor.
         */

        function mapArrayBufferViews(ary) {
          for (var i = 0; i < ary.length; i++) {
            var chunk = ary[i];
            if (chunk.buffer instanceof ArrayBuffer) {
              var buf = chunk.buffer;

              // if this is a subarray, make a copy so we only
              // include the subarray region from the underlying buffer
              if (chunk.byteLength !== buf.byteLength) {
                var copy = new Uint8Array(chunk.byteLength);
                copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
                buf = copy.buffer;
              }

              ary[i] = buf;
            }
          }
        }

        function BlobBuilderConstructor(ary, options) {
          options = options || {};

          var bb = new BlobBuilder();
          mapArrayBufferViews(ary);

          for (var i = 0; i < ary.length; i++) {
            bb.append(ary[i]);
          }

          return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
        };

        function BlobConstructor(ary, options) {
          mapArrayBufferViews(ary);
          return new Blob(ary, options || {});
        };

        module.exports = (function () {
          if (blobSupported) {
            return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
          } else if (blobBuilderSupported) {
            return BlobBuilderConstructor;
          } else {
            return undefined;
          }
        })();

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, {}], 15: [function (_dereq_, module, exports) {

      /**
       * Expose `Emitter`.
       */

      module.exports = Emitter;

      /**
       * Initialize a new `Emitter`.
       *
       * @api public
       */

      function Emitter(obj) {
        if (obj) return mixin(obj);
      };

      /**
       * Mixin the emitter properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }

      /**
       * Listen on the given `event` with `fn`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.on =
        Emitter.prototype.addEventListener = function (event, fn) {
          this._callbacks = this._callbacks || {};
          (this._callbacks[event] = this._callbacks[event] || [])
            .push(fn);
          return this;
        };

      /**
       * Adds an `event` listener that will be invoked a single
       * time then automatically removed.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.once = function (event, fn) {
        var self = this;
        this._callbacks = this._callbacks || {};

        function on() {
          self.off(event, on);
          fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
      };

      /**
       * Remove the given callback for `event` or all
       * registered callbacks.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.off =
        Emitter.prototype.removeListener =
        Emitter.prototype.removeAllListeners =
        Emitter.prototype.removeEventListener = function (event, fn) {
          this._callbacks = this._callbacks || {};

          // all
          if (0 == arguments.length) {
            this._callbacks = {};
            return this;
          }

          // specific event
          var callbacks = this._callbacks[event];
          if (!callbacks) return this;

          // remove all handlers
          if (1 == arguments.length) {
            delete this._callbacks[event];
            return this;
          }

          // remove specific handler
          var cb;
          for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
              callbacks.splice(i, 1);
              break;
            }
          }
          return this;
        };

      /**
       * Emit `event` with the given args.
       *
       * @param {String} event
       * @param {Mixed} ...
       * @return {Emitter}
       */

      Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1)
          , callbacks = this._callbacks[event];

        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }

        return this;
      };

      /**
       * Return array of callbacks for `event`.
       *
       * @param {String} event
       * @return {Array}
       * @api public
       */

      Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks[event] || [];
      };

      /**
       * Check if this emitter has `event` handlers.
       *
       * @param {String} event
       * @return {Boolean}
       * @api public
       */

      Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
      };

    }, {}], 16: [function (_dereq_, module, exports) {

      module.exports = function (a, b) {
        var fn = function () { };
        fn.prototype = b.prototype;
        a.prototype = new fn;
        a.prototype.constructor = a;
      };
    }, {}], 17: [function (_dereq_, module, exports) {

      /**
       * This is the web browser implementation of `debug()`.
       *
       * Expose `debug()` as the module.
       */

      exports = module.exports = _dereq_('./debug');
      exports.log = log;
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.storage = 'undefined' != typeof chrome
        && 'undefined' != typeof chrome.storage
        ? chrome.storage.local
        : localstorage();

      /**
       * Colors.
       */

      exports.colors = [
        'lightseagreen',
        'forestgreen',
        'goldenrod',
        'dodgerblue',
        'darkorchid',
        'crimson'
      ];

      /**
       * Currently only WebKit-based Web Inspectors, Firefox >= v31,
       * and the Firebug extension (any Firefox version) are known
       * to support "%c" CSS customizations.
       *
       * TODO: add a `localStorage` variable to explicitly enable/disable colors
       */

      function useColors() {
        // is webkit? http://stackoverflow.com/a/16459606/376773
        return ('WebkitAppearance' in document.documentElement.style) ||
          // is firebug? http://stackoverflow.com/a/398120/376773
          (window.console && (console.firebug || (console.exception && console.table))) ||
          // is firefox >= v31?
          // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
          (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
      }

      /**
       * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
       */

      exports.formatters.j = function (v) {
        return JSON.stringify(v);
      };


      /**
       * Colorize log arguments if enabled.
       *
       * @api public
       */

      function formatArgs() {
        var args = arguments;
        var useColors = this.useColors;

        args[0] = (useColors ? '%c' : '')
          + this.namespace
          + (useColors ? ' %c' : ' ')
          + args[0]
          + (useColors ? '%c ' : ' ')
          + '+' + exports.humanize(this.diff);

        if (!useColors) return args;

        var c = 'color: ' + this.color;
        args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

        // the final "%c" is somewhat tricky, because there could be other
        // arguments passed either before or after the %c, so we need to
        // figure out the correct index to insert the CSS into
        var index = 0;
        var lastC = 0;
        args[0].replace(/%[a-z%]/g, function (match) {
          if ('%%' === match) return;
          index++;
          if ('%c' === match) {
            // we only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
          }
        });

        args.splice(lastC, 0, c);
        return args;
      }

      /**
       * Invokes `console.log()` when available.
       * No-op when `console.log` is not a "function".
       *
       * @api public
       */

      function log() {
        // this hackery is required for IE8/9, where
        // the `console.log` function doesn't have 'apply'
        return 'object' === typeof console
          && console.log
          && Function.prototype.apply.call(console.log, console, arguments);
      }

      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */

      function save(namespaces) {
        try {
          if (null == namespaces) {
            exports.storage.removeItem('debug');
          } else {
            exports.storage.debug = namespaces;
          }
        } catch (e) { }
      }

      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */

      function load() {
        var r;
        try {
          r = exports.storage.debug;
        } catch (e) { }
        return r;
      }

      /**
       * Enable namespaces listed in `localStorage.debug` initially.
       */

      exports.enable(load());

      /**
       * Localstorage attempts to return the localstorage.
       *
       * This is necessary because safari throws
       * when a user disables cookies/localstorage
       * and you attempt to access it.
       *
       * @return {LocalStorage}
       * @api private
       */

      function localstorage() {
        try {
          return window.localStorage;
        } catch (e) { }
      }

    }, { "./debug": 18 }], 18: [function (_dereq_, module, exports) {

      /**
       * This is the common logic for both the Node.js and web browser
       * implementations of `debug()`.
       *
       * Expose `debug()` as the module.
       */

      exports = module.exports = debug;
      exports.coerce = coerce;
      exports.disable = disable;
      exports.enable = enable;
      exports.enabled = enabled;
      exports.humanize = _dereq_('ms');

      /**
       * The currently active debug mode names, and names to skip.
       */

      exports.names = [];
      exports.skips = [];

      /**
       * Map of special "%n" handling functions, for the debug "format" argument.
       *
       * Valid key names are a single, lowercased letter, i.e. "n".
       */

      exports.formatters = {};

      /**
       * Previously assigned color.
       */

      var prevColor = 0;

      /**
       * Previous log timestamp.
       */

      var prevTime;

      /**
       * Select a color.
       *
       * @return {Number}
       * @api private
       */

      function selectColor() {
        return exports.colors[prevColor++ % exports.colors.length];
      }

      /**
       * Create a debugger with the given `namespace`.
       *
       * @param {String} namespace
       * @return {Function}
       * @api public
       */

      function debug(namespace) {

        // define the `disabled` version
        function disabled() {
        }
        disabled.enabled = false;

        // define the `enabled` version
        function enabled() {

          var self = enabled;

          // set `diff` timestamp
          var curr = +new Date();
          var ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;

          // add the `color` if not set
          if (null == self.useColors) self.useColors = exports.useColors();
          if (null == self.color && self.useColors) self.color = selectColor();

          var args = Array.prototype.slice.call(arguments);

          args[0] = exports.coerce(args[0]);

          if ('string' !== typeof args[0]) {
            // anything else let's inspect with %o
            args = ['%o'].concat(args);
          }

          // apply any `formatters` transformations
          var index = 0;
          args[0] = args[0].replace(/%([a-z%])/g, function (match, format) {
            // if we encounter an escaped % then don't increase the array index
            if (match === '%%') return match;
            index++;
            var formatter = exports.formatters[format];
            if ('function' === typeof formatter) {
              var val = args[index];
              match = formatter.call(self, val);

              // now we need to remove `args[index]` since it's inlined in the `format`
              args.splice(index, 1);
              index--;
            }
            return match;
          });

          if ('function' === typeof exports.formatArgs) {
            args = exports.formatArgs.apply(self, args);
          }
          var logFn = enabled.log || exports.log || console.log.bind(console);
          logFn.apply(self, args);
        }
        enabled.enabled = true;

        var fn = exports.enabled(namespace) ? enabled : disabled;

        fn.namespace = namespace;

        return fn;
      }

      /**
       * Enables a debug mode by namespaces. This can include modes
       * separated by a colon and wildcards.
       *
       * @param {String} namespaces
       * @api public
       */

      function enable(namespaces) {
        exports.save(namespaces);

        var split = (namespaces || '').split(/[\s,]+/);
        var len = split.length;

        for (var i = 0; i < len; i++) {
          if (!split[i]) continue; // ignore empty strings
          namespaces = split[i].replace(/\*/g, '.*?');
          if (namespaces[0] === '-') {
            exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
          } else {
            exports.names.push(new RegExp('^' + namespaces + '$'));
          }
        }
      }

      /**
       * Disable debug output.
       *
       * @api public
       */

      function disable() {
        exports.enable('');
      }

      /**
       * Returns true if the given mode name is enabled, false otherwise.
       *
       * @param {String} name
       * @return {Boolean}
       * @api public
       */

      function enabled(name) {
        var i, len;
        for (i = 0, len = exports.skips.length; i < len; i++) {
          if (exports.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = exports.names.length; i < len; i++) {
          if (exports.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }

      /**
       * Coerce `val`.
       *
       * @param {Mixed} val
       * @return {Mixed}
       * @api private
       */

      function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
      }

    }, { "ms": 25 }], 19: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * Module dependencies.
         */

        var keys = _dereq_('./keys');
        var hasBinary = _dereq_('has-binary');
        var sliceBuffer = _dereq_('arraybuffer.slice');
        var base64encoder = _dereq_('base64-arraybuffer');
        var after = _dereq_('after');
        var utf8 = _dereq_('utf8');

        /**
         * Check if we are running an android browser. That requires us to use
         * ArrayBuffer with polling transports...
         *
         * http://ghinda.net/jpeg-blob-ajax-android/
         */

        var isAndroid = navigator.userAgent.match(/Android/i);

        /**
         * Check if we are running in PhantomJS.
         * Uploading a Blob with PhantomJS does not work correctly, as reported here:
         * https://github.com/ariya/phantomjs/issues/11395
         * @type boolean
         */
        var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

        /**
         * When true, avoids using Blobs to encode payloads.
         * @type boolean
         */
        var dontSendBlobs = isAndroid || isPhantomJS;

        /**
         * Current protocol version.
         */

        exports.protocol = 3;

        /**
         * Packet types.
         */

        var packets = exports.packets = {
          open: 0    // non-ws
          , close: 1    // non-ws
          , ping: 2
          , pong: 3
          , message: 4
          , upgrade: 5
          , noop: 6
        };

        var packetslist = keys(packets);

        /**
         * Premade error packet.
         */

        var err = { type: 'error', data: 'parser error' };

        /**
         * Create a blob api even for blob builder when vendor prefixes exist
         */

        var Blob = _dereq_('blob');

        /**
         * Encodes a packet.
         *
         *     <packet type id> [ <data> ]
         *
         * Example:
         *
         *     5hello world
         *     3
         *     4
         *
         * Binary is encoded in an identical principle
         *
         * @api private
         */

        exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
          if ('function' == typeof supportsBinary) {
            callback = supportsBinary;
            supportsBinary = false;
          }

          if ('function' == typeof utf8encode) {
            callback = utf8encode;
            utf8encode = null;
          }

          var data = (packet.data === undefined)
            ? undefined
            : packet.data.buffer || packet.data;

          if (global.ArrayBuffer && data instanceof ArrayBuffer) {
            return encodeArrayBuffer(packet, supportsBinary, callback);
          } else if (Blob && data instanceof global.Blob) {
            return encodeBlob(packet, supportsBinary, callback);
          }

          // might be an object with { base64: true, data: dataAsBase64String }
          if (data && data.base64) {
            return encodeBase64Object(packet, callback);
          }

          // Sending data as a utf-8 string
          var encoded = packets[packet.type];

          // data fragment is optional
          if (undefined !== packet.data) {
            encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
          }

          return callback('' + encoded);

        };

        function encodeBase64Object(packet, callback) {
          // packet data is an object { base64: true, data: dataAsBase64String }
          var message = 'b' + exports.packets[packet.type] + packet.data.data;
          return callback(message);
        }

        /**
         * Encode packet helpers for binary types
         */

        function encodeArrayBuffer(packet, supportsBinary, callback) {
          if (!supportsBinary) {
            return exports.encodeBase64Packet(packet, callback);
          }

          var data = packet.data;
          var contentArray = new Uint8Array(data);
          var resultBuffer = new Uint8Array(1 + data.byteLength);

          resultBuffer[0] = packets[packet.type];
          for (var i = 0; i < contentArray.length; i++) {
            resultBuffer[i + 1] = contentArray[i];
          }

          return callback(resultBuffer.buffer);
        }

        function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
          if (!supportsBinary) {
            return exports.encodeBase64Packet(packet, callback);
          }

          var fr = new FileReader();
          fr.onload = function () {
            packet.data = fr.result;
            exports.encodePacket(packet, supportsBinary, true, callback);
          };
          return fr.readAsArrayBuffer(packet.data);
        }

        function encodeBlob(packet, supportsBinary, callback) {
          if (!supportsBinary) {
            return exports.encodeBase64Packet(packet, callback);
          }

          if (dontSendBlobs) {
            return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
          }

          var length = new Uint8Array(1);
          length[0] = packets[packet.type];
          var blob = new Blob([length.buffer, packet.data]);

          return callback(blob);
        }

        /**
         * Encodes a packet with binary data in a base64 string
         *
         * @param {Object} packet, has `type` and `data`
         * @return {String} base64 encoded message
         */

        exports.encodeBase64Packet = function (packet, callback) {
          var message = 'b' + exports.packets[packet.type];
          if (Blob && packet.data instanceof global.Blob) {
            var fr = new FileReader();
            fr.onload = function () {
              var b64 = fr.result.split(',')[1];
              callback(message + b64);
            };
            return fr.readAsDataURL(packet.data);
          }

          var b64data;
          try {
            b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
          } catch (e) {
            // iPhone Safari doesn't let you apply with typed arrays
            var typed = new Uint8Array(packet.data);
            var basic = new Array(typed.length);
            for (var i = 0; i < typed.length; i++) {
              basic[i] = typed[i];
            }
            b64data = String.fromCharCode.apply(null, basic);
          }
          message += global.btoa(b64data);
          return callback(message);
        };

        /**
         * Decodes a packet. Changes format to Blob if requested.
         *
         * @return {Object} with `type` and `data` (if any)
         * @api private
         */

        exports.decodePacket = function (data, binaryType, utf8decode) {
          // String data
          if (typeof data == 'string' || data === undefined) {
            if (data.charAt(0) == 'b') {
              return exports.decodeBase64Packet(data.substr(1), binaryType);
            }

            if (utf8decode) {
              try {
                data = utf8.decode(data);
              } catch (e) {
                return err;
              }
            }
            var type = data.charAt(0);

            if (Number(type) != type || !packetslist[type]) {
              return err;
            }

            if (data.length > 1) {
              return { type: packetslist[type], data: data.substring(1) };
            } else {
              return { type: packetslist[type] };
            }
          }

          var asArray = new Uint8Array(data);
          var type = asArray[0];
          var rest = sliceBuffer(data, 1);
          if (Blob && binaryType === 'blob') {
            rest = new Blob([rest]);
          }
          return { type: packetslist[type], data: rest };
        };

        /**
         * Decodes a packet encoded in a base64 string
         *
         * @param {String} base64 encoded message
         * @return {Object} with `type` and `data` (if any)
         */

        exports.decodeBase64Packet = function (msg, binaryType) {
          var type = packetslist[msg.charAt(0)];
          if (!global.ArrayBuffer) {
            return { type: type, data: { base64: true, data: msg.substr(1) } };
          }

          var data = base64encoder.decode(msg.substr(1));

          if (binaryType === 'blob' && Blob) {
            data = new Blob([data]);
          }

          return { type: type, data: data };
        };

        /**
         * Encodes multiple messages (payload).
         *
         *     <length>:data
         *
         * Example:
         *
         *     11:hello world2:hi
         *
         * If any contents are binary, they will be encoded as base64 strings. Base64
         * encoded strings are marked with a b before the length specifier
         *
         * @param {Array} packets
         * @api private
         */

        exports.encodePayload = function (packets, supportsBinary, callback) {
          if (typeof supportsBinary == 'function') {
            callback = supportsBinary;
            supportsBinary = null;
          }

          var isBinary = hasBinary(packets);

          if (supportsBinary && isBinary) {
            if (Blob && !dontSendBlobs) {
              return exports.encodePayloadAsBlob(packets, callback);
            }

            return exports.encodePayloadAsArrayBuffer(packets, callback);
          }

          if (!packets.length) {
            return callback('0:');
          }

          function setLengthHeader(message) {
            return message.length + ':' + message;
          }

          function encodeOne(packet, doneCallback) {
            exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function (message) {
              doneCallback(null, setLengthHeader(message));
            });
          }

          map(packets, encodeOne, function (err, results) {
            return callback(results.join(''));
          });
        };

        /**
         * Async array map using after
         */

        function map(ary, each, done) {
          var result = new Array(ary.length);
          var next = after(ary.length, done);

          var eachWithIndex = function (i, el, cb) {
            each(el, function (error, msg) {
              result[i] = msg;
              cb(error, result);
            });
          };

          for (var i = 0; i < ary.length; i++) {
            eachWithIndex(i, ary[i], next);
          }
        }

        /*
         * Decodes data when a payload is maybe expected. Possible binary contents are
         * decoded from their base64 representation
         *
         * @param {String} data, callback method
         * @api public
         */

        exports.decodePayload = function (data, binaryType, callback) {
          if (typeof data != 'string') {
            return exports.decodePayloadAsBinary(data, binaryType, callback);
          }

          if (typeof binaryType === 'function') {
            callback = binaryType;
            binaryType = null;
          }

          var packet;
          if (data == '') {
            // parser error - ignoring payload
            return callback(err, 0, 1);
          }

          var length = ''
            , n, msg;

          for (var i = 0, l = data.length; i < l; i++) {
            var chr = data.charAt(i);

            if (':' != chr) {
              length += chr;
            } else {
              if ('' == length || (length != (n = Number(length)))) {
                // parser error - ignoring payload
                return callback(err, 0, 1);
              }

              msg = data.substr(i + 1, n);

              if (length != msg.length) {
                // parser error - ignoring payload
                return callback(err, 0, 1);
              }

              if (msg.length) {
                packet = exports.decodePacket(msg, binaryType, true);

                if (err.type == packet.type && err.data == packet.data) {
                  // parser error in individual packet - ignoring payload
                  return callback(err, 0, 1);
                }

                var ret = callback(packet, i + n, l);
                if (false === ret) return;
              }

              // advance cursor
              i += n;
              length = '';
            }
          }

          if (length != '') {
            // parser error - ignoring payload
            return callback(err, 0, 1);
          }

        };

        /**
         * Encodes multiple messages (payload) as binary.
         *
         * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
         * 255><data>
         *
         * Example:
         * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
         *
         * @param {Array} packets
         * @return {ArrayBuffer} encoded payload
         * @api private
         */

        exports.encodePayloadAsArrayBuffer = function (packets, callback) {
          if (!packets.length) {
            return callback(new ArrayBuffer(0));
          }

          function encodeOne(packet, doneCallback) {
            exports.encodePacket(packet, true, true, function (data) {
              return doneCallback(null, data);
            });
          }

          map(packets, encodeOne, function (err, encodedPackets) {
            var totalLength = encodedPackets.reduce(function (acc, p) {
              var len;
              if (typeof p === 'string') {
                len = p.length;
              } else {
                len = p.byteLength;
              }
              return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
            }, 0);

            var resultArray = new Uint8Array(totalLength);

            var bufferIndex = 0;
            encodedPackets.forEach(function (p) {
              var isString = typeof p === 'string';
              var ab = p;
              if (isString) {
                var view = new Uint8Array(p.length);
                for (var i = 0; i < p.length; i++) {
                  view[i] = p.charCodeAt(i);
                }
                ab = view.buffer;
              }

              if (isString) { // not true binary
                resultArray[bufferIndex++] = 0;
              } else { // true binary
                resultArray[bufferIndex++] = 1;
              }

              var lenStr = ab.byteLength.toString();
              for (var i = 0; i < lenStr.length; i++) {
                resultArray[bufferIndex++] = parseInt(lenStr[i]);
              }
              resultArray[bufferIndex++] = 255;

              var view = new Uint8Array(ab);
              for (var i = 0; i < view.length; i++) {
                resultArray[bufferIndex++] = view[i];
              }
            });

            return callback(resultArray.buffer);
          });
        };

        /**
         * Encode as Blob
         */

        exports.encodePayloadAsBlob = function (packets, callback) {
          function encodeOne(packet, doneCallback) {
            exports.encodePacket(packet, true, true, function (encoded) {
              var binaryIdentifier = new Uint8Array(1);
              binaryIdentifier[0] = 1;
              if (typeof encoded === 'string') {
                var view = new Uint8Array(encoded.length);
                for (var i = 0; i < encoded.length; i++) {
                  view[i] = encoded.charCodeAt(i);
                }
                encoded = view.buffer;
                binaryIdentifier[0] = 0;
              }

              var len = (encoded instanceof ArrayBuffer)
                ? encoded.byteLength
                : encoded.size;

              var lenStr = len.toString();
              var lengthAry = new Uint8Array(lenStr.length + 1);
              for (var i = 0; i < lenStr.length; i++) {
                lengthAry[i] = parseInt(lenStr[i]);
              }
              lengthAry[lenStr.length] = 255;

              if (Blob) {
                var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
                doneCallback(null, blob);
              }
            });
          }

          map(packets, encodeOne, function (err, results) {
            return callback(new Blob(results));
          });
        };

        /*
         * Decodes data when a payload is maybe expected. Strings are decoded by
         * interpreting each byte as a key code for entries marked to start with 0. See
         * description of encodePayloadAsBinary
         *
         * @param {ArrayBuffer} data, callback method
         * @api public
         */

        exports.decodePayloadAsBinary = function (data, binaryType, callback) {
          if (typeof binaryType === 'function') {
            callback = binaryType;
            binaryType = null;
          }

          var bufferTail = data;
          var buffers = [];

          var numberTooLong = false;
          while (bufferTail.byteLength > 0) {
            var tailArray = new Uint8Array(bufferTail);
            var isString = tailArray[0] === 0;
            var msgLength = '';

            for (var i = 1; ; i++) {
              if (tailArray[i] == 255) break;

              if (msgLength.length > 310) {
                numberTooLong = true;
                break;
              }

              msgLength += tailArray[i];
            }

            if (numberTooLong) return callback(err, 0, 1);

            bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
            msgLength = parseInt(msgLength);

            var msg = sliceBuffer(bufferTail, 0, msgLength);
            if (isString) {
              try {
                msg = String.fromCharCode.apply(null, new Uint8Array(msg));
              } catch (e) {
                // iPhone Safari doesn't let you apply to typed arrays
                var typed = new Uint8Array(msg);
                msg = '';
                for (var i = 0; i < typed.length; i++) {
                  msg += String.fromCharCode(typed[i]);
                }
              }
            }

            buffers.push(msg);
            bufferTail = sliceBuffer(bufferTail, msgLength);
          }

          var total = buffers.length;
          buffers.forEach(function (buffer, i) {
            callback(exports.decodePacket(buffer, binaryType, true), i, total);
          });
        };

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "./keys": 20, "after": 11, "arraybuffer.slice": 12, "base64-arraybuffer": 13, "blob": 14, "has-binary": 21, "utf8": 29 }], 20: [function (_dereq_, module, exports) {

      /**
       * Gets the keys for an object.
       *
       * @return {Array} keys
       * @api private
       */

      module.exports = Object.keys || function keys(obj) {
        var arr = [];
        var has = Object.prototype.hasOwnProperty;

        for (var i in obj) {
          if (has.call(obj, i)) {
            arr.push(i);
          }
        }
        return arr;
      };

    }, {}], 21: [function (_dereq_, module, exports) {
      (function (global) {

        /*
         * Module requirements.
         */

        var isArray = _dereq_('isarray');

        /**
         * Module exports.
         */

        module.exports = hasBinary;

        /**
         * Checks for binary data.
         *
         * Right now only Buffer and ArrayBuffer are supported..
         *
         * @param {Object} anything
         * @api public
         */

        function hasBinary(data) {

          function _hasBinary(obj) {
            if (!obj) return false;

            if ((global.Buffer && global.Buffer.isBuffer(obj)) ||
              (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
              (global.Blob && obj instanceof Blob) ||
              (global.File && obj instanceof File)
            ) {
              return true;
            }

            if (isArray(obj)) {
              for (var i = 0; i < obj.length; i++) {
                if (_hasBinary(obj[i])) {
                  return true;
                }
              }
            } else if (obj && 'object' == typeof obj) {
              if (obj.toJSON) {
                obj = obj.toJSON();
              }

              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
                  return true;
                }
              }
            }

            return false;
          }

          return _hasBinary(data);
        }

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "isarray": 24 }], 22: [function (_dereq_, module, exports) {

      /**
       * Module exports.
       *
       * Logic borrowed from Modernizr:
       *
       *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
       */

      try {
        module.exports = typeof XMLHttpRequest !== 'undefined' &&
          'withCredentials' in new XMLHttpRequest();
      } catch (err) {
        // if XMLHttp support is disabled in IE then it will throw
        // when trying to create
        module.exports = false;
      }

    }, {}], 23: [function (_dereq_, module, exports) {

      var indexOf = [].indexOf;

      module.exports = function (arr, obj) {
        if (indexOf) return arr.indexOf(obj);
        for (var i = 0; i < arr.length; ++i) {
          if (arr[i] === obj) return i;
        }
        return -1;
      };
    }, {}], 24: [function (_dereq_, module, exports) {
      module.exports = Array.isArray || function (arr) {
        return Object.prototype.toString.call(arr) == '[object Array]';
      };

    }, {}], 25: [function (_dereq_, module, exports) {
      /**
       * Helpers.
       */

      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var y = d * 365.25;

      /**
       * Parse or format the given `val`.
       *
       * Options:
       *
       *  - `long` verbose formatting [false]
       *
       * @param {String|Number} val
       * @param {Object} options
       * @return {String|Number}
       * @api public
       */

      module.exports = function (val, options) {
        options = options || {};
        if ('string' == typeof val) return parse(val);
        return options.long
          ? long(val)
          : short(val);
      };

      /**
       * Parse the given `str` and return milliseconds.
       *
       * @param {String} str
       * @return {Number}
       * @api private
       */

      function parse(str) {
        str = '' + str;
        if (str.length > 10000) return;
        var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
        if (!match) return;
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'yrs':
          case 'yr':
          case 'y':
            return n * y;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'hrs':
          case 'hr':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'mins':
          case 'min':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 'secs':
          case 'sec':
          case 's':
            return n * s;
          case 'milliseconds':
          case 'millisecond':
          case 'msecs':
          case 'msec':
          case 'ms':
            return n;
        }
      }

      /**
       * Short format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function short(ms) {
        if (ms >= d) return Math.round(ms / d) + 'd';
        if (ms >= h) return Math.round(ms / h) + 'h';
        if (ms >= m) return Math.round(ms / m) + 'm';
        if (ms >= s) return Math.round(ms / s) + 's';
        return ms + 'ms';
      }

      /**
       * Long format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function long(ms) {
        return plural(ms, d, 'day')
          || plural(ms, h, 'hour')
          || plural(ms, m, 'minute')
          || plural(ms, s, 'second')
          || ms + ' ms';
      }

      /**
       * Pluralization helper.
       */

      function plural(ms, n, name) {
        if (ms < n) return;
        if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
        return Math.ceil(ms / n) + ' ' + name + 's';
      }

    }, {}], 26: [function (_dereq_, module, exports) {
      (function (global) {
        /**
         * JSON parse.
         *
         * @see Based on jQuery#parseJSON (MIT) and JSON2
         * @api private
         */

        var rvalidchars = /^[\],:{}\s]*$/;
        var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
        var rtrimLeft = /^\s+/;
        var rtrimRight = /\s+$/;

        module.exports = function parsejson(data) {
          if ('string' != typeof data || !data) {
            return null;
          }

          data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

          // Attempt to parse using the native JSON parser first
          if (global.JSON && JSON.parse) {
            return JSON.parse(data);
          }

          if (rvalidchars.test(data.replace(rvalidescape, '@')
            .replace(rvalidtokens, ']')
            .replace(rvalidbraces, ''))) {
            return (new Function('return ' + data))();
          }
        };
      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, {}], 27: [function (_dereq_, module, exports) {
      /**
       * Compiles a querystring
       * Returns string representation of the object
       *
       * @param {Object}
       * @api private
       */

      exports.encode = function (obj) {
        var str = '';

        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            if (str.length) str += '&';
            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
          }
        }

        return str;
      };

      /**
       * Parses a simple querystring into an object
       *
       * @param {String} qs
       * @api private
       */

      exports.decode = function (qs) {
        var qry = {};
        var pairs = qs.split('&');
        for (var i = 0, l = pairs.length; i < l; i++) {
          var pair = pairs[i].split('=');
          qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
      };

    }, {}], 28: [function (_dereq_, module, exports) {
      /**
       * Parses an URI
       *
       * @author Steven Levithan <stevenlevithan.com> (MIT license)
       * @api private
       */

      var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

      var parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
      ];

      module.exports = function parseuri(str) {
        var src = str,
          b = str.indexOf('['),
          e = str.indexOf(']');

        if (b != -1 && e != -1) {
          str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }

        var m = re.exec(str || ''),
          uri = {},
          i = 14;

        while (i--) {
          uri[parts[i]] = m[i] || '';
        }

        if (b != -1 && e != -1) {
          uri.source = src;
          uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
          uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
          uri.ipv6uri = true;
        }

        return uri;
      };

    }, {}], 29: [function (_dereq_, module, exports) {
      (function (global) {
        /*! https://mths.be/utf8js v2.0.0 by @mathias */
        ; (function (root) {

          // Detect free variables `exports`
          var freeExports = typeof exports == 'object' && exports;

          // Detect free variable `module`
          var freeModule = typeof module == 'object' && module &&
            module.exports == freeExports && module;

          // Detect free variable `global`, from Node.js or Browserified code,
          // and use it as `root`
          var freeGlobal = typeof global == 'object' && global;
          if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
            root = freeGlobal;
          }

          /*--------------------------------------------------------------------------*/

          var stringFromCharCode = String.fromCharCode;

          // Taken from https://mths.be/punycode
          function ucs2decode(string) {
            var output = [];
            var counter = 0;
            var length = string.length;
            var value;
            var extra;
            while (counter < length) {
              value = string.charCodeAt(counter++);
              if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                  output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                  // unmatched surrogate; only append this code unit, in case the next
                  // code unit is the high surrogate of a surrogate pair
                  output.push(value);
                  counter--;
                }
              } else {
                output.push(value);
              }
            }
            return output;
          }

          // Taken from https://mths.be/punycode
          function ucs2encode(array) {
            var length = array.length;
            var index = -1;
            var value;
            var output = '';
            while (++index < length) {
              value = array[index];
              if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
              }
              output += stringFromCharCode(value);
            }
            return output;
          }

          function checkScalarValue(codePoint) {
            if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
              throw Error(
                'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
                ' is not a scalar value'
              );
            }
          }
          /*--------------------------------------------------------------------------*/

          function createByte(codePoint, shift) {
            return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
          }

          function encodeCodePoint(codePoint) {
            if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
              return stringFromCharCode(codePoint);
            }
            var symbol = '';
            if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
              symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
            }
            else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
              checkScalarValue(codePoint);
              symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
              symbol += createByte(codePoint, 6);
            }
            else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
              symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
              symbol += createByte(codePoint, 12);
              symbol += createByte(codePoint, 6);
            }
            symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
            return symbol;
          }

          function utf8encode(string) {
            var codePoints = ucs2decode(string);
            var length = codePoints.length;
            var index = -1;
            var codePoint;
            var byteString = '';
            while (++index < length) {
              codePoint = codePoints[index];
              byteString += encodeCodePoint(codePoint);
            }
            return byteString;
          }

          /*--------------------------------------------------------------------------*/

          function readContinuationByte() {
            if (byteIndex >= byteCount) {
              throw Error('Invalid byte index');
            }

            var continuationByte = byteArray[byteIndex] & 0xFF;
            byteIndex++;

            if ((continuationByte & 0xC0) == 0x80) {
              return continuationByte & 0x3F;
            }

            // If we end up here, it’s not a continuation byte
            throw Error('Invalid continuation byte');
          }

          function decodeSymbol() {
            var byte1;
            var byte2;
            var byte3;
            var byte4;
            var codePoint;

            if (byteIndex > byteCount) {
              throw Error('Invalid byte index');
            }

            if (byteIndex == byteCount) {
              return false;
            }

            // Read first byte
            byte1 = byteArray[byteIndex] & 0xFF;
            byteIndex++;

            // 1-byte sequence (no continuation bytes)
            if ((byte1 & 0x80) == 0) {
              return byte1;
            }

            // 2-byte sequence
            if ((byte1 & 0xE0) == 0xC0) {
              var byte2 = readContinuationByte();
              codePoint = ((byte1 & 0x1F) << 6) | byte2;
              if (codePoint >= 0x80) {
                return codePoint;
              } else {
                throw Error('Invalid continuation byte');
              }
            }

            // 3-byte sequence (may include unpaired surrogates)
            if ((byte1 & 0xF0) == 0xE0) {
              byte2 = readContinuationByte();
              byte3 = readContinuationByte();
              codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
              if (codePoint >= 0x0800) {
                checkScalarValue(codePoint);
                return codePoint;
              } else {
                throw Error('Invalid continuation byte');
              }
            }

            // 4-byte sequence
            if ((byte1 & 0xF8) == 0xF0) {
              byte2 = readContinuationByte();
              byte3 = readContinuationByte();
              byte4 = readContinuationByte();
              codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
                (byte3 << 0x06) | byte4;
              if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
                return codePoint;
              }
            }

            throw Error('Invalid UTF-8 detected');
          }

          var byteArray;
          var byteCount;
          var byteIndex;
          function utf8decode(byteString) {
            byteArray = ucs2decode(byteString);
            byteCount = byteArray.length;
            byteIndex = 0;
            var codePoints = [];
            var tmp;
            while ((tmp = decodeSymbol()) !== false) {
              codePoints.push(tmp);
            }
            return ucs2encode(codePoints);
          }

          /*--------------------------------------------------------------------------*/

          var utf8 = {
            'version': '2.0.0',
            'encode': utf8encode,
            'decode': utf8decode
          };

          // Some AMD build optimizers, like r.js, check for specific condition patterns
          // like the following:
          if (
            typeof define == 'function' &&
            typeof define.amd == 'object' &&
            define.amd
          ) {
            define(function () {
              return utf8;
            });
          } else if (freeExports && !freeExports.nodeType) {
            if (freeModule) { // in Node.js or RingoJS v0.8.0+
              freeModule.exports = utf8;
            } else { // in Narwhal or RingoJS v0.7.0-
              var object = {};
              var hasOwnProperty = object.hasOwnProperty;
              for (var key in utf8) {
                hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
              }
            }
          } else { // in Rhino or a web browser
            root.utf8 = utf8;
          }

        }(this));

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, {}], 30: [function (_dereq_, module, exports) {
      'use strict';

      var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
        , length = 64
        , map = {}
        , seed = 0
        , i = 0
        , prev;

      /**
       * Return a string representing the specified number.
       *
       * @param {Number} num The number to convert.
       * @returns {String} The string representation of the number.
       * @api public
       */
      function encode(num) {
        var encoded = '';

        do {
          encoded = alphabet[num % length] + encoded;
          num = Math.floor(num / length);
        } while (num > 0);

        return encoded;
      }

      /**
       * Return the integer value specified by the given string.
       *
       * @param {String} str The string to convert.
       * @returns {Number} The integer value represented by the string.
       * @api public
       */
      function decode(str) {
        var decoded = 0;

        for (i = 0; i < str.length; i++) {
          decoded = decoded * length + map[str.charAt(i)];
        }

        return decoded;
      }

      /**
       * Yeast: A tiny growing id generator.
       *
       * @returns {String} A unique id.
       * @api public
       */
      function yeast() {
        var now = encode(+new Date());

        if (now !== prev) return seed = 0, prev = now;
        return now + '.' + encode(seed++);
      }

      //
      // Map each character to its index.
      //
      for (; i < length; i++) map[alphabet[i]] = i;

      //
      // Expose the `yeast`, `encode` and `decode` functions.
      //
      yeast.encode = encode;
      yeast.decode = decode;
      module.exports = yeast;

    }, {}], 31: [function (_dereq_, module, exports) {

      /**
       * Module dependencies.
       */

      var url = _dereq_('./url');
      var parser = _dereq_('socket.io-parser');
      var Manager = _dereq_('./manager');
      var debug = _dereq_('debug')('socket.io-client');

      /**
       * Module exports.
       */

      module.exports = exports = lookup;

      /**
       * Managers cache.
       */

      var cache = exports.managers = {};

      /**
       * Looks up an existing `Manager` for multiplexing.
       * If the user summons:
       *
       *   `io('http://localhost/a');`
       *   `io('http://localhost/b');`
       *
       * We reuse the existing instance based on same scheme/port/host,
       * and we initialize sockets for each namespace.
       *
       * @api public
       */

      function lookup(uri, opts) {
        if (typeof uri == 'object') {
          opts = uri;
          uri = undefined;
        }

        opts = opts || {};

        var parsed = url(uri);
        var source = parsed.source;
        var id = parsed.id;
        var path = parsed.path;
        var sameNamespace = cache[id] && path in cache[id].nsps;
        var newConnection = opts.forceNew || opts['force new connection'] ||
          false === opts.multiplex || sameNamespace;

        var io;

        if (newConnection) {
          debug('ignoring socket cache for %s', source);
          io = Manager(source, opts);
        } else {
          if (!cache[id]) {
            debug('new io instance for %s', source);
            cache[id] = Manager(source, opts);
          }
          io = cache[id];
        }

        return io.socket(parsed.path);
      }

      /**
       * Protocol version.
       *
       * @api public
       */

      exports.protocol = parser.protocol;

      /**
       * `connect`.
       *
       * @param {String} uri
       * @api public
       */

      exports.connect = lookup;

      /**
       * Expose constructors for standalone build.
       *
       * @api public
       */

      exports.Manager = _dereq_('./manager');
      exports.Socket = _dereq_('./socket');

    }, { "./manager": 32, "./socket": 34, "./url": 35, "debug": 39, "socket.io-parser": 47 }], 32: [function (_dereq_, module, exports) {

      /**
       * Module dependencies.
       */

      var eio = _dereq_('engine.io-client');
      var Socket = _dereq_('./socket');
      var Emitter = _dereq_('component-emitter');
      var parser = _dereq_('socket.io-parser');
      var on = _dereq_('./on');
      var bind = _dereq_('component-bind');
      var debug = _dereq_('debug')('socket.io-client:manager');
      var indexOf = _dereq_('indexof');
      var Backoff = _dereq_('backo2');

      /**
       * IE6+ hasOwnProperty
       */

      var has = Object.prototype.hasOwnProperty;

      /**
       * Module exports
       */

      module.exports = Manager;

      /**
       * `Manager` constructor.
       *
       * @param {String} engine instance or engine uri/opts
       * @param {Object} options
       * @api public
       */

      function Manager(uri, opts) {
        if (!(this instanceof Manager)) return new Manager(uri, opts);
        if (uri && ('object' == typeof uri)) {
          opts = uri;
          uri = undefined;
        }
        opts = opts || {};

        opts.path = opts.path || '/socket.io';
        this.nsps = {};
        this.subs = [];
        this.opts = opts;
        this.reconnection(opts.reconnection !== false);
        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
        this.reconnectionDelay(opts.reconnectionDelay || 1000);
        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
        this.randomizationFactor(opts.randomizationFactor || 0.5);
        this.backoff = new Backoff({
          min: this.reconnectionDelay(),
          max: this.reconnectionDelayMax(),
          jitter: this.randomizationFactor()
        });
        this.timeout(null == opts.timeout ? 20000 : opts.timeout);
        this.readyState = 'closed';
        this.uri = uri;
        this.connecting = [];
        this.lastPing = null;
        this.encoding = false;
        this.packetBuffer = [];
        this.encoder = new parser.Encoder();
        this.decoder = new parser.Decoder();
        this.autoConnect = opts.autoConnect !== false;
        if (this.autoConnect) this.open();
      }

      /**
       * Propagate given event to sockets and emit on `this`
       *
       * @api private
       */

      Manager.prototype.emitAll = function () {
        this.emit.apply(this, arguments);
        for (var nsp in this.nsps) {
          if (has.call(this.nsps, nsp)) {
            this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
          }
        }
      };

      /**
       * Update `socket.id` of all sockets
       *
       * @api private
       */

      Manager.prototype.updateSocketIds = function () {
        for (var nsp in this.nsps) {
          if (has.call(this.nsps, nsp)) {
            this.nsps[nsp].id = this.engine.id;
          }
        }
      };

      /**
       * Mix in `Emitter`.
       */

      Emitter(Manager.prototype);

      /**
       * Sets the `reconnection` config.
       *
       * @param {Boolean} true/false if it should automatically reconnect
       * @return {Manager} self or value
       * @api public
       */

      Manager.prototype.reconnection = function (v) {
        if (!arguments.length) return this._reconnection;
        this._reconnection = !!v;
        return this;
      };

      /**
       * Sets the reconnection attempts config.
       *
       * @param {Number} max reconnection attempts before giving up
       * @return {Manager} self or value
       * @api public
       */

      Manager.prototype.reconnectionAttempts = function (v) {
        if (!arguments.length) return this._reconnectionAttempts;
        this._reconnectionAttempts = v;
        return this;
      };

      /**
       * Sets the delay between reconnections.
       *
       * @param {Number} delay
       * @return {Manager} self or value
       * @api public
       */

      Manager.prototype.reconnectionDelay = function (v) {
        if (!arguments.length) return this._reconnectionDelay;
        this._reconnectionDelay = v;
        this.backoff && this.backoff.setMin(v);
        return this;
      };

      Manager.prototype.randomizationFactor = function (v) {
        if (!arguments.length) return this._randomizationFactor;
        this._randomizationFactor = v;
        this.backoff && this.backoff.setJitter(v);
        return this;
      };

      /**
       * Sets the maximum delay between reconnections.
       *
       * @param {Number} delay
       * @return {Manager} self or value
       * @api public
       */

      Manager.prototype.reconnectionDelayMax = function (v) {
        if (!arguments.length) return this._reconnectionDelayMax;
        this._reconnectionDelayMax = v;
        this.backoff && this.backoff.setMax(v);
        return this;
      };

      /**
       * Sets the connection timeout. `false` to disable
       *
       * @return {Manager} self or value
       * @api public
       */

      Manager.prototype.timeout = function (v) {
        if (!arguments.length) return this._timeout;
        this._timeout = v;
        return this;
      };

      /**
       * Starts trying to reconnect if reconnection is enabled and we have not
       * started reconnecting yet
       *
       * @api private
       */

      Manager.prototype.maybeReconnectOnOpen = function () {
        // Only try to reconnect if it's the first time we're connecting
        if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
          // keeps reconnection from firing twice for the same reconnection loop
          this.reconnect();
        }
      };


      /**
       * Sets the current transport `socket`.
       *
       * @param {Function} optional, callback
       * @return {Manager} self
       * @api public
       */

      Manager.prototype.open =
        Manager.prototype.connect = function (fn) {
          debug('readyState %s', this.readyState);
          if (~this.readyState.indexOf('open')) return this;

          debug('opening %s', this.uri);
          this.engine = eio(this.uri, this.opts);
          var socket = this.engine;
          var self = this;
          this.readyState = 'opening';
          this.skipReconnect = false;

          // emit `open`
          var openSub = on(socket, 'open', function () {
            self.onopen();
            fn && fn();
          });

          // emit `connect_error`
          var errorSub = on(socket, 'error', function (data) {
            debug('connect_error');
            self.cleanup();
            self.readyState = 'closed';
            self.emitAll('connect_error', data);
            if (fn) {
              var err = new Error('Connection error');
              err.data = data;
              fn(err);
            } else {
              // Only do this if there is no fn to handle the error
              self.maybeReconnectOnOpen();
            }
          });

          // emit `connect_timeout`
          if (false !== this._timeout) {
            var timeout = this._timeout;
            debug('connect attempt will timeout after %d', timeout);

            // set timer
            var timer = setTimeout(function () {
              debug('connect attempt timed out after %d', timeout);
              openSub.destroy();
              socket.close();
              socket.emit('error', 'timeout');
              self.emitAll('connect_timeout', timeout);
            }, timeout);

            this.subs.push({
              destroy: function () {
                clearTimeout(timer);
              }
            });
          }

          this.subs.push(openSub);
          this.subs.push(errorSub);

          return this;
        };

      /**
       * Called upon transport open.
       *
       * @api private
       */

      Manager.prototype.onopen = function () {
        debug('open');

        // clear old subs
        this.cleanup();

        // mark as open
        this.readyState = 'open';
        this.emit('open');

        // add new subs
        var socket = this.engine;
        this.subs.push(on(socket, 'data', bind(this, 'ondata')));
        this.subs.push(on(socket, 'ping', bind(this, 'onping')));
        this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
        this.subs.push(on(socket, 'error', bind(this, 'onerror')));
        this.subs.push(on(socket, 'close', bind(this, 'onclose')));
        this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
      };

      /**
       * Called upon a ping.
       *
       * @api private
       */

      Manager.prototype.onping = function () {
        this.lastPing = new Date;
        this.emitAll('ping');
      };

      /**
       * Called upon a packet.
       *
       * @api private
       */

      Manager.prototype.onpong = function () {
        this.emitAll('pong', new Date - this.lastPing);
      };

      /**
       * Called with data.
       *
       * @api private
       */

      Manager.prototype.ondata = function (data) {
        this.decoder.add(data);
      };

      /**
       * Called when parser fully decodes a packet.
       *
       * @api private
       */

      Manager.prototype.ondecoded = function (packet) {
        this.emit('packet', packet);
      };

      /**
       * Called upon socket error.
       *
       * @api private
       */

      Manager.prototype.onerror = function (err) {
        debug('error', err);
        this.emitAll('error', err);
      };

      /**
       * Creates a new socket for the given `nsp`.
       *
       * @return {Socket}
       * @api public
       */

      Manager.prototype.socket = function (nsp) {
        var socket = this.nsps[nsp];
        if (!socket) {
          socket = new Socket(this, nsp);
          this.nsps[nsp] = socket;
          var self = this;
          socket.on('connecting', onConnecting);
          socket.on('connect', function () {
            socket.id = self.engine.id;
          });

          if (this.autoConnect) {
            // manually call here since connecting evnet is fired before listening
            onConnecting();
          }
        }

        function onConnecting() {
          if (!~indexOf(self.connecting, socket)) {
            self.connecting.push(socket);
          }
        }

        return socket;
      };

      /**
       * Called upon a socket close.
       *
       * @param {Socket} socket
       */

      Manager.prototype.destroy = function (socket) {
        var index = indexOf(this.connecting, socket);
        if (~index) this.connecting.splice(index, 1);
        if (this.connecting.length) return;

        this.close();
      };

      /**
       * Writes a packet.
       *
       * @param {Object} packet
       * @api private
       */

      Manager.prototype.packet = function (packet) {
        debug('writing packet %j', packet);
        var self = this;

        if (!self.encoding) {
          // encode, then write to engine with result
          self.encoding = true;
          this.encoder.encode(packet, function (encodedPackets) {
            for (var i = 0; i < encodedPackets.length; i++) {
              self.engine.write(encodedPackets[i], packet.options);
            }
            self.encoding = false;
            self.processPacketQueue();
          });
        } else { // add packet to the queue
          self.packetBuffer.push(packet);
        }
      };

      /**
       * If packet buffer is non-empty, begins encoding the
       * next packet in line.
       *
       * @api private
       */

      Manager.prototype.processPacketQueue = function () {
        if (this.packetBuffer.length > 0 && !this.encoding) {
          var pack = this.packetBuffer.shift();
          this.packet(pack);
        }
      };

      /**
       * Clean up transport subscriptions and packet buffer.
       *
       * @api private
       */

      Manager.prototype.cleanup = function () {
        debug('cleanup');

        var sub;
        while (sub = this.subs.shift()) sub.destroy();

        this.packetBuffer = [];
        this.encoding = false;
        this.lastPing = null;

        this.decoder.destroy();
      };

      /**
       * Close the current socket.
       *
       * @api private
       */

      Manager.prototype.close =
        Manager.prototype.disconnect = function () {
          debug('disconnect');
          this.skipReconnect = true;
          this.reconnecting = false;
          if ('opening' == this.readyState) {
            // `onclose` will not fire because
            // an open event never happened
            this.cleanup();
          }
          this.backoff.reset();
          this.readyState = 'closed';
          if (this.engine) this.engine.close();
        };

      /**
       * Called upon engine close.
       *
       * @api private
       */

      Manager.prototype.onclose = function (reason) {
        debug('onclose');

        this.cleanup();
        this.backoff.reset();
        this.readyState = 'closed';
        this.emit('close', reason);

        if (this._reconnection && !this.skipReconnect) {
          this.reconnect();
        }
      };

      /**
       * Attempt a reconnection.
       *
       * @api private
       */

      Manager.prototype.reconnect = function () {
        if (this.reconnecting || this.skipReconnect) return this;

        var self = this;

        if (this.backoff.attempts >= this._reconnectionAttempts) {
          debug('reconnect failed');
          this.backoff.reset();
          this.emitAll('reconnect_failed');
          this.reconnecting = false;
        } else {
          var delay = this.backoff.duration();
          debug('will wait %dms before reconnect attempt', delay);

          this.reconnecting = true;
          var timer = setTimeout(function () {
            if (self.skipReconnect) return;

            debug('attempting reconnect');
            self.emitAll('reconnect_attempt', self.backoff.attempts);
            self.emitAll('reconnecting', self.backoff.attempts);

            // check again for the case socket closed in above events
            if (self.skipReconnect) return;

            self.open(function (err) {
              if (err) {
                debug('reconnect attempt error');
                self.reconnecting = false;
                self.reconnect();
                self.emitAll('reconnect_error', err.data);
              } else {
                debug('reconnect success');
                self.onreconnect();
              }
            });
          }, delay);

          this.subs.push({
            destroy: function () {
              clearTimeout(timer);
            }
          });
        }
      };

      /**
       * Called upon successful reconnect.
       *
       * @api private
       */

      Manager.prototype.onreconnect = function () {
        var attempt = this.backoff.attempts;
        this.reconnecting = false;
        this.backoff.reset();
        this.updateSocketIds();
        this.emitAll('reconnect', attempt);
      };

    }, { "./on": 33, "./socket": 34, "backo2": 36, "component-bind": 37, "component-emitter": 38, "debug": 39, "engine.io-client": 1, "indexof": 42, "socket.io-parser": 47 }], 33: [function (_dereq_, module, exports) {

      /**
       * Module exports.
       */

      module.exports = on;

      /**
       * Helper for subscriptions.
       *
       * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
       * @param {String} event name
       * @param {Function} callback
       * @api public
       */

      function on(obj, ev, fn) {
        obj.on(ev, fn);
        return {
          destroy: function () {
            obj.removeListener(ev, fn);
          }
        };
      }

    }, {}], 34: [function (_dereq_, module, exports) {

      /**
       * Module dependencies.
       */

      var parser = _dereq_('socket.io-parser');
      var Emitter = _dereq_('component-emitter');
      var toArray = _dereq_('to-array');
      var on = _dereq_('./on');
      var bind = _dereq_('component-bind');
      var debug = _dereq_('debug')('socket.io-client:socket');
      var hasBin = _dereq_('has-binary');

      /**
       * Module exports.
       */

      module.exports = exports = Socket;

      /**
       * Internal events (blacklisted).
       * These events can't be emitted by the user.
       *
       * @api private
       */

      var events = {
        connect: 1,
        connect_error: 1,
        connect_timeout: 1,
        connecting: 1,
        disconnect: 1,
        error: 1,
        reconnect: 1,
        reconnect_attempt: 1,
        reconnect_failed: 1,
        reconnect_error: 1,
        reconnecting: 1,
        ping: 1,
        pong: 1
      };

      /**
       * Shortcut to `Emitter#emit`.
       */

      var emit = Emitter.prototype.emit;

      /**
       * `Socket` constructor.
       *
       * @api public
       */

      function Socket(io, nsp) {
        this.io = io;
        this.nsp = nsp;
        this.json = this; // compat
        this.ids = 0;
        this.acks = {};
        this.receiveBuffer = [];
        this.sendBuffer = [];
        this.connected = false;
        this.disconnected = true;
        if (this.io.autoConnect) this.open();
      }

      /**
       * Mix in `Emitter`.
       */

      Emitter(Socket.prototype);

      /**
       * Subscribe to open, close and packet events
       *
       * @api private
       */

      Socket.prototype.subEvents = function () {
        if (this.subs) return;

        var io = this.io;
        this.subs = [
          on(io, 'open', bind(this, 'onopen')),
          on(io, 'packet', bind(this, 'onpacket')),
          on(io, 'close', bind(this, 'onclose'))
        ];
      };

      /**
       * "Opens" the socket.
       *
       * @api public
       */

      Socket.prototype.open =
        Socket.prototype.connect = function () {
          if (this.connected) return this;

          this.subEvents();
          this.io.open(); // ensure open
          if ('open' == this.io.readyState) this.onopen();
          this.emit('connecting');
          return this;
        };

      /**
       * Sends a `message` event.
       *
       * @return {Socket} self
       * @api public
       */

      Socket.prototype.send = function () {
        var args = toArray(arguments);
        args.unshift('message');
        this.emit.apply(this, args);
        return this;
      };

      /**
       * Override `emit`.
       * If the event is in `events`, it's emitted normally.
       *
       * @param {String} event name
       * @return {Socket} self
       * @api public
       */

      Socket.prototype.emit = function (ev) {
        if (events.hasOwnProperty(ev)) {
          emit.apply(this, arguments);
          return this;
        }

        var args = toArray(arguments);
        var parserType = parser.EVENT; // default
        if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
        var packet = { type: parserType, data: args };

        packet.options = {};
        packet.options.compress = !this.flags || false !== this.flags.compress;

        // event ack callback
        if ('function' == typeof args[args.length - 1]) {
          debug('emitting packet with ack id %d', this.ids);
          this.acks[this.ids] = args.pop();
          packet.id = this.ids++;
        }

        if (this.connected) {
          this.packet(packet);
        } else {
          this.sendBuffer.push(packet);
        }

        delete this.flags;

        return this;
      };

      /**
       * Sends a packet.
       *
       * @param {Object} packet
       * @api private
       */

      Socket.prototype.packet = function (packet) {
        packet.nsp = this.nsp;
        this.io.packet(packet);
      };

      /**
       * Called upon engine `open`.
       *
       * @api private
       */

      Socket.prototype.onopen = function () {
        debug('transport is open - connecting');

        // write connect packet if necessary
        if ('/' != this.nsp) {
          this.packet({ type: parser.CONNECT });
        }
      };

      /**
       * Called upon engine `close`.
       *
       * @param {String} reason
       * @api private
       */

      Socket.prototype.onclose = function (reason) {
        debug('close (%s)', reason);
        this.connected = false;
        this.disconnected = true;
        delete this.id;
        this.emit('disconnect', reason);
      };

      /**
       * Called with socket packet.
       *
       * @param {Object} packet
       * @api private
       */

      Socket.prototype.onpacket = function (packet) {
        if (packet.nsp != this.nsp) return;

        switch (packet.type) {
          case parser.CONNECT:
            this.onconnect();
            break;

          case parser.EVENT:
            this.onevent(packet);
            break;

          case parser.BINARY_EVENT:
            this.onevent(packet);
            break;

          case parser.ACK:
            this.onack(packet);
            break;

          case parser.BINARY_ACK:
            this.onack(packet);
            break;

          case parser.DISCONNECT:
            this.ondisconnect();
            break;

          case parser.ERROR:
            this.emit('error', packet.data);
            break;
        }
      };

      /**
       * Called upon a server event.
       *
       * @param {Object} packet
       * @api private
       */

      Socket.prototype.onevent = function (packet) {
        var args = packet.data || [];
        debug('emitting event %j', args);

        if (null != packet.id) {
          debug('attaching ack callback to event');
          args.push(this.ack(packet.id));
        }

        if (this.connected) {
          emit.apply(this, args);
        } else {
          this.receiveBuffer.push(args);
        }
      };

      /**
       * Produces an ack callback to emit with an event.
       *
       * @api private
       */

      Socket.prototype.ack = function (id) {
        var self = this;
        var sent = false;
        return function () {
          // prevent double callbacks
          if (sent) return;
          sent = true;
          var args = toArray(arguments);
          debug('sending ack %j', args);

          var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
          self.packet({
            type: type,
            id: id,
            data: args
          });
        };
      };

      /**
       * Called upon a server acknowlegement.
       *
       * @param {Object} packet
       * @api private
       */

      Socket.prototype.onack = function (packet) {
        var ack = this.acks[packet.id];
        if ('function' == typeof ack) {
          debug('calling ack %s with %j', packet.id, packet.data);
          ack.apply(this, packet.data);
          delete this.acks[packet.id];
        } else {
          debug('bad ack %s', packet.id);
        }
      };

      /**
       * Called upon server connect.
       *
       * @api private
       */

      Socket.prototype.onconnect = function () {
        this.connected = true;
        this.disconnected = false;
        this.emit('connect');
        this.emitBuffered();
      };

      /**
       * Emit buffered events (received and emitted).
       *
       * @api private
       */

      Socket.prototype.emitBuffered = function () {
        var i;
        for (i = 0; i < this.receiveBuffer.length; i++) {
          emit.apply(this, this.receiveBuffer[i]);
        }
        this.receiveBuffer = [];

        for (i = 0; i < this.sendBuffer.length; i++) {
          this.packet(this.sendBuffer[i]);
        }
        this.sendBuffer = [];
      };

      /**
       * Called upon server disconnect.
       *
       * @api private
       */

      Socket.prototype.ondisconnect = function () {
        debug('server disconnect (%s)', this.nsp);
        this.destroy();
        this.onclose('io server disconnect');
      };

      /**
       * Called upon forced client/server side disconnections,
       * this method ensures the manager stops tracking us and
       * that reconnections don't get triggered for this.
       *
       * @api private.
       */

      Socket.prototype.destroy = function () {
        if (this.subs) {
          // clean subscriptions to avoid reconnections
          for (var i = 0; i < this.subs.length; i++) {
            this.subs[i].destroy();
          }
          this.subs = null;
        }

        this.io.destroy(this);
      };

      /**
       * Disconnects the socket manually.
       *
       * @return {Socket} self
       * @api public
       */

      Socket.prototype.close =
        Socket.prototype.disconnect = function () {
          if (this.connected) {
            debug('performing disconnect (%s)', this.nsp);
            this.packet({ type: parser.DISCONNECT });
          }

          // remove socket from pool
          this.destroy();

          if (this.connected) {
            // fire events
            this.onclose('io client disconnect');
          }
          return this;
        };

      /**
       * Sets the compress flag.
       *
       * @param {Boolean} if `true`, compresses the sending data
       * @return {Socket} self
       * @api public
       */

      Socket.prototype.compress = function (compress) {
        this.flags = this.flags || {};
        this.flags.compress = compress;
        return this;
      };

    }, { "./on": 33, "component-bind": 37, "component-emitter": 38, "debug": 39, "has-binary": 41, "socket.io-parser": 47, "to-array": 51 }], 35: [function (_dereq_, module, exports) {
      (function (global) {

        /**
         * Module dependencies.
         */

        var parseuri = _dereq_('parseuri');
        var debug = _dereq_('debug')('socket.io-client:url');

        /**
         * Module exports.
         */

        module.exports = url;

        /**
         * URL parser.
         *
         * @param {String} url
         * @param {Object} An object meant to mimic window.location.
         *                 Defaults to window.location.
         * @api public
         */

        function url(uri, loc) {
          var obj = uri;

          // default to window.location
          var loc = loc || global.location;
          if (null == uri) uri = loc.protocol + '//' + loc.host;

          // relative path support
          if ('string' == typeof uri) {
            if ('/' == uri.charAt(0)) {
              if ('/' == uri.charAt(1)) {
                uri = loc.protocol + uri;
              } else {
                uri = loc.host + uri;
              }
            }

            if (!/^(https?|wss?):\/\//.test(uri)) {
              debug('protocol-less url %s', uri);
              if ('undefined' != typeof loc) {
                uri = loc.protocol + '//' + uri;
              } else {
                uri = 'https://' + uri;
              }
            }

            // parse
            debug('parse %s', uri);
            obj = parseuri(uri);
          }

          // make sure we treat `localhost:80` and `localhost` equally
          if (!obj.port) {
            if (/^(http|ws)$/.test(obj.protocol)) {
              obj.port = '80';
            }
            else if (/^(http|ws)s$/.test(obj.protocol)) {
              obj.port = '443';
            }
          }

          obj.path = obj.path || '/';

          var ipv6 = obj.host.indexOf(':') !== -1;
          var host = ipv6 ? '[' + obj.host + ']' : obj.host;

          // define unique id
          obj.id = obj.protocol + '://' + host + ':' + obj.port;
          // define href
          obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

          return obj;
        }

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "debug": 39, "parseuri": 45 }], 36: [function (_dereq_, module, exports) {

      /**
       * Expose `Backoff`.
       */

      module.exports = Backoff;

      /**
       * Initialize backoff timer with `opts`.
       *
       * - `min` initial timeout in milliseconds [100]
       * - `max` max timeout [10000]
       * - `jitter` [0]
       * - `factor` [2]
       *
       * @param {Object} opts
       * @api public
       */

      function Backoff(opts) {
        opts = opts || {};
        this.ms = opts.min || 100;
        this.max = opts.max || 10000;
        this.factor = opts.factor || 2;
        this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
        this.attempts = 0;
      }

      /**
       * Return the backoff duration.
       *
       * @return {Number}
       * @api public
       */

      Backoff.prototype.duration = function () {
        var ms = this.ms * Math.pow(this.factor, this.attempts++);
        if (this.jitter) {
          var rand = Math.random();
          var deviation = Math.floor(rand * this.jitter * ms);
          ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.max) | 0;
      };

      /**
       * Reset the number of attempts.
       *
       * @api public
       */

      Backoff.prototype.reset = function () {
        this.attempts = 0;
      };

      /**
       * Set the minimum duration
       *
       * @api public
       */

      Backoff.prototype.setMin = function (min) {
        this.ms = min;
      };

      /**
       * Set the maximum duration
       *
       * @api public
       */

      Backoff.prototype.setMax = function (max) {
        this.max = max;
      };

      /**
       * Set the jitter
       *
       * @api public
       */

      Backoff.prototype.setJitter = function (jitter) {
        this.jitter = jitter;
      };


    }, {}], 37: [function (_dereq_, module, exports) {
      /**
       * Slice reference.
       */

      var slice = [].slice;

      /**
       * Bind `obj` to `fn`.
       *
       * @param {Object} obj
       * @param {Function|String} fn or string
       * @return {Function}
       * @api public
       */

      module.exports = function (obj, fn) {
        if ('string' == typeof fn) fn = obj[fn];
        if ('function' != typeof fn) throw new Error('bind() requires a function');
        var args = slice.call(arguments, 2);
        return function () {
          return fn.apply(obj, args.concat(slice.call(arguments)));
        }
      };

    }, {}], 38: [function (_dereq_, module, exports) {

      /**
       * Expose `Emitter`.
       */

      module.exports = Emitter;

      /**
       * Initialize a new `Emitter`.
       *
       * @api public
       */

      function Emitter(obj) {
        if (obj) return mixin(obj);
      };

      /**
       * Mixin the emitter properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }

      /**
       * Listen on the given `event` with `fn`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.on =
        Emitter.prototype.addEventListener = function (event, fn) {
          this._callbacks = this._callbacks || {};
          (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
            .push(fn);
          return this;
        };

      /**
       * Adds an `event` listener that will be invoked a single
       * time then automatically removed.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.once = function (event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
      };

      /**
       * Remove the given callback for `event` or all
       * registered callbacks.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.off =
        Emitter.prototype.removeListener =
        Emitter.prototype.removeAllListeners =
        Emitter.prototype.removeEventListener = function (event, fn) {
          this._callbacks = this._callbacks || {};

          // all
          if (0 == arguments.length) {
            this._callbacks = {};
            return this;
          }

          // specific event
          var callbacks = this._callbacks['$' + event];
          if (!callbacks) return this;

          // remove all handlers
          if (1 == arguments.length) {
            delete this._callbacks['$' + event];
            return this;
          }

          // remove specific handler
          var cb;
          for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
              callbacks.splice(i, 1);
              break;
            }
          }
          return this;
        };

      /**
       * Emit `event` with the given args.
       *
       * @param {String} event
       * @param {Mixed} ...
       * @return {Emitter}
       */

      Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1)
          , callbacks = this._callbacks['$' + event];

        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }

        return this;
      };

      /**
       * Return array of callbacks for `event`.
       *
       * @param {String} event
       * @return {Array}
       * @api public
       */

      Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
      };

      /**
       * Check if this emitter has `event` handlers.
       *
       * @param {String} event
       * @return {Boolean}
       * @api public
       */

      Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
      };

    }, {}], 39: [function (_dereq_, module, exports) {
      arguments[4][17][0].apply(exports, arguments)
    }, { "./debug": 40, "dup": 17 }], 40: [function (_dereq_, module, exports) {
      arguments[4][18][0].apply(exports, arguments)
    }, { "dup": 18, "ms": 44 }], 41: [function (_dereq_, module, exports) {
      (function (global) {

        /*
         * Module requirements.
         */

        var isArray = _dereq_('isarray');

        /**
         * Module exports.
         */

        module.exports = hasBinary;

        /**
         * Checks for binary data.
         *
         * Right now only Buffer and ArrayBuffer are supported..
         *
         * @param {Object} anything
         * @api public
         */

        function hasBinary(data) {

          function _hasBinary(obj) {
            if (!obj) return false;

            if ((global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
              (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
              (global.Blob && obj instanceof Blob) ||
              (global.File && obj instanceof File)
            ) {
              return true;
            }

            if (isArray(obj)) {
              for (var i = 0; i < obj.length; i++) {
                if (_hasBinary(obj[i])) {
                  return true;
                }
              }
            } else if (obj && 'object' == typeof obj) {
              // see: https://github.com/Automattic/has-binary/pull/4
              if (obj.toJSON && 'function' == typeof obj.toJSON) {
                obj = obj.toJSON();
              }

              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
                  return true;
                }
              }
            }

            return false;
          }

          return _hasBinary(data);
        }

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "isarray": 43 }], 42: [function (_dereq_, module, exports) {
      arguments[4][23][0].apply(exports, arguments)
    }, { "dup": 23 }], 43: [function (_dereq_, module, exports) {
      arguments[4][24][0].apply(exports, arguments)
    }, { "dup": 24 }], 44: [function (_dereq_, module, exports) {
      arguments[4][25][0].apply(exports, arguments)
    }, { "dup": 25 }], 45: [function (_dereq_, module, exports) {
      arguments[4][28][0].apply(exports, arguments)
    }, { "dup": 28 }], 46: [function (_dereq_, module, exports) {
      (function (global) {
        /*global Blob,File*/

        /**
         * Module requirements
         */

        var isArray = _dereq_('isarray');
        var isBuf = _dereq_('./is-buffer');

        /**
         * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
         * Anything with blobs or files should be fed through removeBlobs before coming
         * here.
         *
         * @param {Object} packet - socket.io event packet
         * @return {Object} with deconstructed packet and list of buffers
         * @api public
         */

        exports.deconstructPacket = function (packet) {
          var buffers = [];
          var packetData = packet.data;

          function _deconstructPacket(data) {
            if (!data) return data;

            if (isBuf(data)) {
              var placeholder = { _placeholder: true, num: buffers.length };
              buffers.push(data);
              return placeholder;
            } else if (isArray(data)) {
              var newData = new Array(data.length);
              for (var i = 0; i < data.length; i++) {
                newData[i] = _deconstructPacket(data[i]);
              }
              return newData;
            } else if ('object' == typeof data && !(data instanceof Date)) {
              var newData = {};
              for (var key in data) {
                newData[key] = _deconstructPacket(data[key]);
              }
              return newData;
            }
            return data;
          }

          var pack = packet;
          pack.data = _deconstructPacket(packetData);
          pack.attachments = buffers.length; // number of binary 'attachments'
          return { packet: pack, buffers: buffers };
        };

        /**
         * Reconstructs a binary packet from its placeholder packet and buffers
         *
         * @param {Object} packet - event packet with placeholders
         * @param {Array} buffers - binary buffers to put in placeholder positions
         * @return {Object} reconstructed packet
         * @api public
         */

        exports.reconstructPacket = function (packet, buffers) {
          var curPlaceHolder = 0;

          function _reconstructPacket(data) {
            if (data && data._placeholder) {
              var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
              return buf;
            } else if (isArray(data)) {
              for (var i = 0; i < data.length; i++) {
                data[i] = _reconstructPacket(data[i]);
              }
              return data;
            } else if (data && 'object' == typeof data) {
              for (var key in data) {
                data[key] = _reconstructPacket(data[key]);
              }
              return data;
            }
            return data;
          }

          packet.data = _reconstructPacket(packet.data);
          packet.attachments = undefined; // no longer useful
          return packet;
        };

        /**
         * Asynchronously removes Blobs or Files from data via
         * FileReader's readAsArrayBuffer method. Used before encoding
         * data as msgpack. Calls callback with the blobless data.
         *
         * @param {Object} data
         * @param {Function} callback
         * @api private
         */

        exports.removeBlobs = function (data, callback) {
          function _removeBlobs(obj, curKey, containingObject) {
            if (!obj) return obj;

            // convert any blob
            if ((global.Blob && obj instanceof Blob) ||
              (global.File && obj instanceof File)) {
              pendingBlobs++;

              // async filereader
              var fileReader = new FileReader();
              fileReader.onload = function () { // this.result == arraybuffer
                if (containingObject) {
                  containingObject[curKey] = this.result;
                }
                else {
                  bloblessData = this.result;
                }

                // if nothing pending its callback time
                if (! --pendingBlobs) {
                  callback(bloblessData);
                }
              };

              fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
            } else if (isArray(obj)) { // handle array
              for (var i = 0; i < obj.length; i++) {
                _removeBlobs(obj[i], i, obj);
              }
            } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
              for (var key in obj) {
                _removeBlobs(obj[key], key, obj);
              }
            }
          }

          var pendingBlobs = 0;
          var bloblessData = data;
          _removeBlobs(bloblessData);
          if (!pendingBlobs) {
            callback(bloblessData);
          }
        };

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, { "./is-buffer": 48, "isarray": 43 }], 47: [function (_dereq_, module, exports) {

      /**
       * Module dependencies.
       */

      var debug = _dereq_('debug')('socket.io-parser');
      var json = _dereq_('json3');
      var isArray = _dereq_('isarray');
      var Emitter = _dereq_('component-emitter');
      var binary = _dereq_('./binary');
      var isBuf = _dereq_('./is-buffer');

      /**
       * Protocol version.
       *
       * @api public
       */

      exports.protocol = 4;

      /**
       * Packet types.
       *
       * @api public
       */

      exports.types = [
        'CONNECT',
        'DISCONNECT',
        'EVENT',
        'BINARY_EVENT',
        'ACK',
        'BINARY_ACK',
        'ERROR'
      ];

      /**
       * Packet type `connect`.
       *
       * @api public
       */

      exports.CONNECT = 0;

      /**
       * Packet type `disconnect`.
       *
       * @api public
       */

      exports.DISCONNECT = 1;

      /**
       * Packet type `event`.
       *
       * @api public
       */

      exports.EVENT = 2;

      /**
       * Packet type `ack`.
       *
       * @api public
       */

      exports.ACK = 3;

      /**
       * Packet type `error`.
       *
       * @api public
       */

      exports.ERROR = 4;

      /**
       * Packet type 'binary event'
       *
       * @api public
       */

      exports.BINARY_EVENT = 5;

      /**
       * Packet type `binary ack`. For acks with binary arguments.
       *
       * @api public
       */

      exports.BINARY_ACK = 6;

      /**
       * Encoder constructor.
       *
       * @api public
       */

      exports.Encoder = Encoder;

      /**
       * Decoder constructor.
       *
       * @api public
       */

      exports.Decoder = Decoder;

      /**
       * A socket.io Encoder instance
       *
       * @api public
       */

      function Encoder() { }

      /**
       * Encode a packet as a single string if non-binary, or as a
       * buffer sequence, depending on packet type.
       *
       * @param {Object} obj - packet object
       * @param {Function} callback - function to handle encodings (likely engine.write)
       * @return Calls callback with Array of encodings
       * @api public
       */

      Encoder.prototype.encode = function (obj, callback) {
        debug('encoding packet %j', obj);

        if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
          encodeAsBinary(obj, callback);
        }
        else {
          var encoding = encodeAsString(obj);
          callback([encoding]);
        }
      };

      /**
       * Encode packet as string.
       *
       * @param {Object} packet
       * @return {String} encoded
       * @api private
       */

      function encodeAsString(obj) {
        var str = '';
        var nsp = false;

        // first is type
        str += obj.type;

        // attachments if we have them
        if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
          str += obj.attachments;
          str += '-';
        }

        // if we have a namespace other than `/`
        // we append it followed by a comma `,`
        if (obj.nsp && '/' != obj.nsp) {
          nsp = true;
          str += obj.nsp;
        }

        // immediately followed by the id
        if (null != obj.id) {
          if (nsp) {
            str += ',';
            nsp = false;
          }
          str += obj.id;
        }

        // json data
        if (null != obj.data) {
          if (nsp) str += ',';
          str += json.stringify(obj.data);
        }

        debug('encoded %j as %s', obj, str);
        return str;
      }

      /**
       * Encode packet as 'buffer sequence' by removing blobs, and
       * deconstructing packet into object with placeholders and
       * a list of buffers.
       *
       * @param {Object} packet
       * @return {Buffer} encoded
       * @api private
       */

      function encodeAsBinary(obj, callback) {

        function writeEncoding(bloblessData) {
          var deconstruction = binary.deconstructPacket(bloblessData);
          var pack = encodeAsString(deconstruction.packet);
          var buffers = deconstruction.buffers;

          buffers.unshift(pack); // add packet info to beginning of data list
          callback(buffers); // write all the buffers
        }

        binary.removeBlobs(obj, writeEncoding);
      }

      /**
       * A socket.io Decoder instance
       *
       * @return {Object} decoder
       * @api public
       */

      function Decoder() {
        this.reconstructor = null;
      }

      /**
       * Mix in `Emitter` with Decoder.
       */

      Emitter(Decoder.prototype);

      /**
       * Decodes an ecoded packet string into packet JSON.
       *
       * @param {String} obj - encoded packet
       * @return {Object} packet
       * @api public
       */

      Decoder.prototype.add = function (obj) {
        var packet;
        if ('string' == typeof obj) {
          packet = decodeString(obj);
          if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
            this.reconstructor = new BinaryReconstructor(packet);

            // no attachments, labeled binary but no binary data to follow
            if (this.reconstructor.reconPack.attachments === 0) {
              this.emit('decoded', packet);
            }
          } else { // non-binary full packet
            this.emit('decoded', packet);
          }
        }
        else if (isBuf(obj) || obj.base64) { // raw binary data
          if (!this.reconstructor) {
            throw new Error('got binary data when not reconstructing a packet');
          } else {
            packet = this.reconstructor.takeBinaryData(obj);
            if (packet) { // received final buffer
              this.reconstructor = null;
              this.emit('decoded', packet);
            }
          }
        }
        else {
          throw new Error('Unknown type: ' + obj);
        }
      };

      /**
       * Decode a packet String (JSON data)
       *
       * @param {String} str
       * @return {Object} packet
       * @api private
       */

      function decodeString(str) {
        var p = {};
        var i = 0;

        // look up type
        p.type = Number(str.charAt(0));
        if (null == exports.types[p.type]) return error();

        // look up attachments if type binary
        if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
          var buf = '';
          while (str.charAt(++i) != '-') {
            buf += str.charAt(i);
            if (i == str.length) break;
          }
          if (buf != Number(buf) || str.charAt(i) != '-') {
            throw new Error('Illegal attachments');
          }
          p.attachments = Number(buf);
        }

        // look up namespace (if any)
        if ('/' == str.charAt(i + 1)) {
          p.nsp = '';
          while (++i) {
            var c = str.charAt(i);
            if (',' == c) break;
            p.nsp += c;
            if (i == str.length) break;
          }
        } else {
          p.nsp = '/';
        }

        // look up id
        var next = str.charAt(i + 1);
        if ('' !== next && Number(next) == next) {
          p.id = '';
          while (++i) {
            var c = str.charAt(i);
            if (null == c || Number(c) != c) {
              --i;
              break;
            }
            p.id += str.charAt(i);
            if (i == str.length) break;
          }
          p.id = Number(p.id);
        }

        // look up json data
        if (str.charAt(++i)) {
          try {
            p.data = json.parse(str.substr(i));
          } catch (e) {
            return error();
          }
        }

        debug('decoded %s as %j', str, p);
        return p;
      }

      /**
       * Deallocates a parser's resources
       *
       * @api public
       */

      Decoder.prototype.destroy = function () {
        if (this.reconstructor) {
          this.reconstructor.finishedReconstruction();
        }
      };

      /**
       * A manager of a binary event's 'buffer sequence'. Should
       * be constructed whenever a packet of type BINARY_EVENT is
       * decoded.
       *
       * @param {Object} packet
       * @return {BinaryReconstructor} initialized reconstructor
       * @api private
       */

      function BinaryReconstructor(packet) {
        this.reconPack = packet;
        this.buffers = [];
      }

      /**
       * Method to be called when binary data received from connection
       * after a BINARY_EVENT packet.
       *
       * @param {Buffer | ArrayBuffer} binData - the raw binary data received
       * @return {null | Object} returns null if more binary data is expected or
       *   a reconstructed packet object if all buffers have been received.
       * @api private
       */

      BinaryReconstructor.prototype.takeBinaryData = function (binData) {
        this.buffers.push(binData);
        if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
          var packet = binary.reconstructPacket(this.reconPack, this.buffers);
          this.finishedReconstruction();
          return packet;
        }
        return null;
      };

      /**
       * Cleans up binary packet reconstruction variables.
       *
       * @api private
       */

      BinaryReconstructor.prototype.finishedReconstruction = function () {
        this.reconPack = null;
        this.buffers = [];
      };

      function error(data) {
        return {
          type: exports.ERROR,
          data: 'parser error'
        };
      }

    }, { "./binary": 46, "./is-buffer": 48, "component-emitter": 49, "debug": 39, "isarray": 43, "json3": 50 }], 48: [function (_dereq_, module, exports) {
      (function (global) {

        module.exports = isBuf;

        /**
         * Returns true if obj is a buffer or an arraybuffer.
         *
         * @api private
         */

        function isBuf(obj) {
          return (global.Buffer && global.Buffer.isBuffer(obj)) ||
            (global.ArrayBuffer && obj instanceof ArrayBuffer);
        }

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, {}], 49: [function (_dereq_, module, exports) {
      arguments[4][15][0].apply(exports, arguments)
    }, { "dup": 15 }], 50: [function (_dereq_, module, exports) {
      (function (global) {
        /*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
        ; (function () {
          // Detect the `define` function exposed by asynchronous module loaders. The
          // strict `define` check is necessary for compatibility with `r.js`.
          var isLoader = typeof define === "function" && define.amd;

          // A set of types used to distinguish objects from primitives.
          var objectTypes = {
            "function": true,
            "object": true
          };

          // Detect the `exports` object exposed by CommonJS implementations.
          var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

          // Use the `global` object exposed by Node (including Browserify via
          // `insert-module-globals`), Narwhal, and Ringo as the default context,
          // and the `window` object in browsers. Rhino exports a `global` function
          // instead.
          var root = objectTypes[typeof window] && window || this,
            freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

          if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
            root = freeGlobal;
          }

          // Public: Initializes JSON 3 using the given `context` object, attaching the
          // `stringify` and `parse` functions to the specified `exports` object.
          function runInContext(context, exports) {
            context || (context = root["Object"]());
            exports || (exports = root["Object"]());

            // Native constructor aliases.
            var Number = context["Number"] || root["Number"],
              String = context["String"] || root["String"],
              Object = context["Object"] || root["Object"],
              Date = context["Date"] || root["Date"],
              SyntaxError = context["SyntaxError"] || root["SyntaxError"],
              TypeError = context["TypeError"] || root["TypeError"],
              Math = context["Math"] || root["Math"],
              nativeJSON = context["JSON"] || root["JSON"];

            // Delegate to the native `stringify` and `parse` implementations.
            if (typeof nativeJSON == "object" && nativeJSON) {
              exports.stringify = nativeJSON.stringify;
              exports.parse = nativeJSON.parse;
            }

            // Convenience aliases.
            var objectProto = Object.prototype,
              getClass = objectProto.toString,
              isProperty, forEach, undef;

            // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
            var isExtended = new Date(-3509827334573292);
            try {
              // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
              // results for certain dates in Opera >= 10.53.
              isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
                // Safari < 2.0.2 stores the internal millisecond time value correctly,
                // but clips the values returned by the date methods to the range of
                // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
                isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
            } catch (exception) { }

            // Internal: Determines whether the native `JSON.stringify` and `parse`
            // implementations are spec-compliant. Based on work by Ken Snyder.
            function has(name) {
              if (has[name] !== undef) {
                // Return cached feature test result.
                return has[name];
              }
              var isSupported;
              if (name == "bug-string-char-index") {
                // IE <= 7 doesn't support accessing string characters using square
                // bracket notation. IE 8 only supports this for primitives.
                isSupported = "a"[0] != "a";
              } else if (name == "json") {
                // Indicates whether both `JSON.stringify` and `JSON.parse` are
                // supported.
                isSupported = has("json-stringify") && has("json-parse");
              } else {
                var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                // Test `JSON.stringify`.
                if (name == "json-stringify") {
                  var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
                  if (stringifySupported) {
                    // A test function object with a custom `toJSON` method.
                    (value = function () {
                      return 1;
                    }).toJSON = value;
                    try {
                      stringifySupported =
                        // Firefox 3.1b1 and b2 serialize string, number, and boolean
                        // primitives as object literals.
                        stringify(0) === "0" &&
                        // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                        // literals.
                        stringify(new Number()) === "0" &&
                        stringify(new String()) == '""' &&
                        // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                        // does not define a canonical JSON representation (this applies to
                        // objects with `toJSON` properties as well, *unless* they are nested
                        // within an object or array).
                        stringify(getClass) === undef &&
                        // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                        // FF 3.1b3 pass this test.
                        stringify(undef) === undef &&
                        // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                        // respectively, if the value is omitted entirely.
                        stringify() === undef &&
                        // FF 3.1b1, 2 throw an error if the given value is not a number,
                        // string, array, object, Boolean, or `null` literal. This applies to
                        // objects with custom `toJSON` methods as well, unless they are nested
                        // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                        // methods entirely.
                        stringify(value) === "1" &&
                        stringify([value]) == "[1]" &&
                        // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                        // `"[null]"`.
                        stringify([undef]) == "[null]" &&
                        // YUI 3.0.0b1 fails to serialize `null` literals.
                        stringify(null) == "null" &&
                        // FF 3.1b1, 2 halts serialization if an array contains a function:
                        // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                        // elides non-JSON values from objects and arrays, unless they
                        // define custom `toJSON` methods.
                        stringify([undef, getClass, null]) == "[null,null,null]" &&
                        // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                        // where character escape codes are expected (e.g., `\b` => `\u0008`).
                        stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                        // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                        stringify(null, value) === "1" &&
                        stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                        // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                        // serialize extended years.
                        stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                        // The milliseconds are optional in ES 5, but required in 5.1.
                        stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                        // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                        // four-digit years instead of six-digit years. Credits: @Yaffle.
                        stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                        // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                        // values less than 1000. Credits: @Yaffle.
                        stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
                    } catch (exception) {
                      stringifySupported = false;
                    }
                  }
                  isSupported = stringifySupported;
                }
                // Test `JSON.parse`.
                if (name == "json-parse") {
                  var parse = exports.parse;
                  if (typeof parse == "function") {
                    try {
                      // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
                      // Conforming implementations should also coerce the initial argument to
                      // a string prior to parsing.
                      if (parse("0") === 0 && !parse(false)) {
                        // Simple parsing test.
                        value = parse(serialized);
                        var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                        if (parseSupported) {
                          try {
                            // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                            parseSupported = !parse('"\t"');
                          } catch (exception) { }
                          if (parseSupported) {
                            try {
                              // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                              // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                              // certain octal literals.
                              parseSupported = parse("01") !== 1;
                            } catch (exception) { }
                          }
                          if (parseSupported) {
                            try {
                              // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                              // points. These environments, along with FF 3.1b1 and 2,
                              // also allow trailing commas in JSON objects and arrays.
                              parseSupported = parse("1.") !== 1;
                            } catch (exception) { }
                          }
                        }
                      }
                    } catch (exception) {
                      parseSupported = false;
                    }
                  }
                  isSupported = parseSupported;
                }
              }
              return has[name] = !!isSupported;
            }

            if (!has("json")) {
              // Common `[[Class]]` name aliases.
              var functionClass = "[object Function]",
                dateClass = "[object Date]",
                numberClass = "[object Number]",
                stringClass = "[object String]",
                arrayClass = "[object Array]",
                booleanClass = "[object Boolean]";

              // Detect incomplete support for accessing string characters by index.
              var charIndexBuggy = has("bug-string-char-index");

              // Define additional utility methods if the `Date` methods are buggy.
              if (!isExtended) {
                var floor = Math.floor;
                // A mapping between the months of the year and the number of days between
                // January 1st and the first of the respective month.
                var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
                // Internal: Calculates the number of days between the Unix epoch and the
                // first day of the given month.
                var getDay = function (year, month) {
                  return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
                };
              }

              // Internal: Determines if a property is a direct property of the given
              // object. Delegates to the native `Object#hasOwnProperty` method.
              if (!(isProperty = objectProto.hasOwnProperty)) {
                isProperty = function (property) {
                  var members = {}, constructor;
                  if ((members.__proto__ = null, members.__proto__ = {
                    // The *proto* property cannot be set multiple times in recent
                    // versions of Firefox and SeaMonkey.
                    "toString": 1
                  }, members).toString != getClass) {
                    // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
                    // supports the mutable *proto* property.
                    isProperty = function (property) {
                      // Capture and break the object's prototype chain (see section 8.6.2
                      // of the ES 5.1 spec). The parenthesized expression prevents an
                      // unsafe transformation by the Closure Compiler.
                      var original = this.__proto__, result = property in (this.__proto__ = null, this);
                      // Restore the original prototype chain.
                      this.__proto__ = original;
                      return result;
                    };
                  } else {
                    // Capture a reference to the top-level `Object` constructor.
                    constructor = members.constructor;
                    // Use the `constructor` property to simulate `Object#hasOwnProperty` in
                    // other environments.
                    isProperty = function (property) {
                      var parent = (this.constructor || constructor).prototype;
                      return property in this && !(property in parent && this[property] === parent[property]);
                    };
                  }
                  members = null;
                  return isProperty.call(this, property);
                };
              }

              // Internal: Normalizes the `for...in` iteration algorithm across
              // environments. Each enumerated key is yielded to a `callback` function.
              forEach = function (object, callback) {
                var size = 0, Properties, members, property;

                // Tests for bugs in the current environment's `for...in` algorithm. The
                // `valueOf` property inherits the non-enumerable flag from
                // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
                (Properties = function () {
                  this.valueOf = 0;
                }).prototype.valueOf = 0;

                // Iterate over a new instance of the `Properties` class.
                members = new Properties();
                for (property in members) {
                  // Ignore all properties inherited from `Object.prototype`.
                  if (isProperty.call(members, property)) {
                    size++;
                  }
                }
                Properties = members = null;

                // Normalize the iteration algorithm.
                if (!size) {
                  // A list of non-enumerable properties inherited from `Object.prototype`.
                  members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
                  // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
                  // properties.
                  forEach = function (object, callback) {
                    var isFunction = getClass.call(object) == functionClass, property, length;
                    var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
                    for (property in object) {
                      // Gecko <= 1.0 enumerates the `prototype` property of functions under
                      // certain conditions; IE does not.
                      if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                        callback(property);
                      }
                    }
                    // Manually invoke the callback for each non-enumerable property.
                    for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
                  };
                } else if (size == 2) {
                  // Safari <= 2.0.4 enumerates shadowed properties twice.
                  forEach = function (object, callback) {
                    // Create a set of iterated properties.
                    var members = {}, isFunction = getClass.call(object) == functionClass, property;
                    for (property in object) {
                      // Store each property name to prevent double enumeration. The
                      // `prototype` property of functions is not enumerated due to cross-
                      // environment inconsistencies.
                      if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                        callback(property);
                      }
                    }
                  };
                } else {
                  // No bugs detected; use the standard `for...in` algorithm.
                  forEach = function (object, callback) {
                    var isFunction = getClass.call(object) == functionClass, property, isConstructor;
                    for (property in object) {
                      if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                        callback(property);
                      }
                    }
                    // Manually invoke the callback for the `constructor` property due to
                    // cross-environment inconsistencies.
                    if (isConstructor || isProperty.call(object, (property = "constructor"))) {
                      callback(property);
                    }
                  };
                }
                return forEach(object, callback);
              };

              // Public: Serializes a JavaScript `value` as a JSON string. The optional
              // `filter` argument may specify either a function that alters how object and
              // array members are serialized, or an array of strings and numbers that
              // indicates which properties should be serialized. The optional `width`
              // argument may be either a string or number that specifies the indentation
              // level of the output.
              if (!has("json-stringify")) {
                // Internal: A map of control characters and their escaped equivalents.
                var Escapes = {
                  92: "\\\\",
                  34: '\\"',
                  8: "\\b",
                  12: "\\f",
                  10: "\\n",
                  13: "\\r",
                  9: "\\t"
                };

                // Internal: Converts `value` into a zero-padded string such that its
                // length is at least equal to `width`. The `width` must be <= 6.
                var leadingZeroes = "000000";
                var toPaddedString = function (width, value) {
                  // The `|| 0` expression is necessary to work around a bug in
                  // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
                  return (leadingZeroes + (value || 0)).slice(-width);
                };

                // Internal: Double-quotes a string `value`, replacing all ASCII control
                // characters (characters with code unit values between 0 and 31) with
                // their escaped equivalents. This is an implementation of the
                // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
                var unicodePrefix = "\\u00";
                var quote = function (value) {
                  var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
                  var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
                  for (; index < length; index++) {
                    var charCode = value.charCodeAt(index);
                    // If the character is a control character, append its Unicode or
                    // shorthand escape sequence; otherwise, append the character as-is.
                    switch (charCode) {
                      case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                        result += Escapes[charCode];
                        break;
                      default:
                        if (charCode < 32) {
                          result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                          break;
                        }
                        result += useCharIndex ? symbols[index] : value.charAt(index);
                    }
                  }
                  return result + '"';
                };

                // Internal: Recursively serializes an object. Implements the
                // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
                var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
                  var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
                  try {
                    // Necessary for host object support.
                    value = object[property];
                  } catch (exception) { }
                  if (typeof value == "object" && value) {
                    className = getClass.call(value);
                    if (className == dateClass && !isProperty.call(value, "toJSON")) {
                      if (value > -1 / 0 && value < 1 / 0) {
                        // Dates are serialized according to the `Date#toJSON` method
                        // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                        // for the ISO 8601 date time string format.
                        if (getDay) {
                          // Manually compute the year, month, date, hours, minutes,
                          // seconds, and milliseconds if the `getUTC*` methods are
                          // buggy. Adapted from @Yaffle's `date-shim` project.
                          date = floor(value / 864e5);
                          for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                          for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                          date = 1 + date - getDay(year, month);
                          // The `time` value specifies the time within the day (see ES
                          // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                          // to compute `A modulo B`, as the `%` operator does not
                          // correspond to the `modulo` operation for negative numbers.
                          time = (value % 864e5 + 864e5) % 864e5;
                          // The hours, minutes, seconds, and milliseconds are obtained by
                          // decomposing the time within the day. See section 15.9.1.10.
                          hours = floor(time / 36e5) % 24;
                          minutes = floor(time / 6e4) % 60;
                          seconds = floor(time / 1e3) % 60;
                          milliseconds = time % 1e3;
                        } else {
                          year = value.getUTCFullYear();
                          month = value.getUTCMonth();
                          date = value.getUTCDate();
                          hours = value.getUTCHours();
                          minutes = value.getUTCMinutes();
                          seconds = value.getUTCSeconds();
                          milliseconds = value.getUTCMilliseconds();
                        }
                        // Serialize extended years correctly.
                        value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                          "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                          // Months, dates, hours, minutes, and seconds should have two
                          // digits; milliseconds should have three.
                          "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                          // Milliseconds are optional in ES 5.0, but required in 5.1.
                          "." + toPaddedString(3, milliseconds) + "Z";
                      } else {
                        value = null;
                      }
                    } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
                      // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
                      // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
                      // ignores all `toJSON` methods on these objects unless they are
                      // defined directly on an instance.
                      value = value.toJSON(property);
                    }
                  }
                  if (callback) {
                    // If a replacement function was provided, call it to obtain the value
                    // for serialization.
                    value = callback.call(object, property, value);
                  }
                  if (value === null) {
                    return "null";
                  }
                  className = getClass.call(value);
                  if (className == booleanClass) {
                    // Booleans are represented literally.
                    return "" + value;
                  } else if (className == numberClass) {
                    // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                    // `"null"`.
                    return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
                  } else if (className == stringClass) {
                    // Strings are double-quoted and escaped.
                    return quote("" + value);
                  }
                  // Recursively serialize objects and arrays.
                  if (typeof value == "object") {
                    // Check for cyclic structures. This is a linear search; performance
                    // is inversely proportional to the number of unique nested objects.
                    for (length = stack.length; length--;) {
                      if (stack[length] === value) {
                        // Cyclic structures cannot be serialized by `JSON.stringify`.
                        throw TypeError();
                      }
                    }
                    // Add the object to the stack of traversed objects.
                    stack.push(value);
                    results = [];
                    // Save the current indentation level and indent one additional level.
                    prefix = indentation;
                    indentation += whitespace;
                    if (className == arrayClass) {
                      // Recursively serialize array elements.
                      for (index = 0, length = value.length; index < length; index++) {
                        element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                        results.push(element === undef ? "null" : element);
                      }
                      result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
                    } else {
                      // Recursively serialize object members. Members are selected from
                      // either a user-specified list of property names, or the object
                      // itself.
                      forEach(properties || value, function (property) {
                        var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                        if (element !== undef) {
                          // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                          // is not the empty string, let `member` {quote(property) + ":"}
                          // be the concatenation of `member` and the `space` character."
                          // The "`space` character" refers to the literal space
                          // character, not the `space` {width} argument provided to
                          // `JSON.stringify`.
                          results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                        }
                      });
                      result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
                    }
                    // Remove the object from the traversed object stack.
                    stack.pop();
                    return result;
                  }
                };

                // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
                exports.stringify = function (source, filter, width) {
                  var whitespace, callback, properties, className;
                  if (objectTypes[typeof filter] && filter) {
                    if ((className = getClass.call(filter)) == functionClass) {
                      callback = filter;
                    } else if (className == arrayClass) {
                      // Convert the property names array into a makeshift set.
                      properties = {};
                      for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
                    }
                  }
                  if (width) {
                    if ((className = getClass.call(width)) == numberClass) {
                      // Convert the `width` to an integer and create a string containing
                      // `width` number of space characters.
                      if ((width -= width % 1) > 0) {
                        for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
                      }
                    } else if (className == stringClass) {
                      whitespace = width.length <= 10 ? width : width.slice(0, 10);
                    }
                  }
                  // Opera <= 7.54u2 discards the values associated with empty string keys
                  // (`""`) only if they are used directly within an object member list
                  // (e.g., `!("" in { "": 1})`).
                  return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
                };
              }

              // Public: Parses a JSON source string.
              if (!has("json-parse")) {
                var fromCharCode = String.fromCharCode;

                // Internal: A map of escaped control characters and their unescaped
                // equivalents.
                var Unescapes = {
                  92: "\\",
                  34: '"',
                  47: "/",
                  98: "\b",
                  116: "\t",
                  110: "\n",
                  102: "\f",
                  114: "\r"
                };

                // Internal: Stores the parser state.
                var Index, Source;

                // Internal: Resets the parser state and throws a `SyntaxError`.
                var abort = function () {
                  Index = Source = null;
                  throw SyntaxError();
                };

                // Internal: Returns the next token, or `"$"` if the parser has reached
                // the end of the source string. A token may be a string, number, `null`
                // literal, or Boolean literal.
                var lex = function () {
                  var source = Source, length = source.length, value, begin, position, isSigned, charCode;
                  while (Index < length) {
                    charCode = source.charCodeAt(Index);
                    switch (charCode) {
                      case 9: case 10: case 13: case 32:
                        // Skip whitespace tokens, including tabs, carriage returns, line
                        // feeds, and space characters.
                        Index++;
                        break;
                      case 123: case 125: case 91: case 93: case 58: case 44:
                        // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                        // the current position.
                        value = charIndexBuggy ? source.charAt(Index) : source[Index];
                        Index++;
                        return value;
                      case 34:
                        // `"` delimits a JSON string; advance to the next character and
                        // begin parsing the string. String tokens are prefixed with the
                        // sentinel `@` character to distinguish them from punctuators and
                        // end-of-string tokens.
                        for (value = "@", Index++; Index < length;) {
                          charCode = source.charCodeAt(Index);
                          if (charCode < 32) {
                            // Unescaped ASCII control characters (those with a code unit
                            // less than the space character) are not permitted.
                            abort();
                          } else if (charCode == 92) {
                            // A reverse solidus (`\`) marks the beginning of an escaped
                            // control character (including `"`, `\`, and `/`) or Unicode
                            // escape sequence.
                            charCode = source.charCodeAt(++Index);
                            switch (charCode) {
                              case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                                // Revive escaped control characters.
                                value += Unescapes[charCode];
                                Index++;
                                break;
                              case 117:
                                // `\u` marks the beginning of a Unicode escape sequence.
                                // Advance to the first character and validate the
                                // four-digit code point.
                                begin = ++Index;
                                for (position = Index + 4; Index < position; Index++) {
                                  charCode = source.charCodeAt(Index);
                                  // A valid sequence comprises four hexdigits (case-
                                  // insensitive) that form a single hexadecimal value.
                                  if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                                    // Invalid Unicode escape sequence.
                                    abort();
                                  }
                                }
                                // Revive the escaped character.
                                value += fromCharCode("0x" + source.slice(begin, Index));
                                break;
                              default:
                                // Invalid escape sequence.
                                abort();
                            }
                          } else {
                            if (charCode == 34) {
                              // An unescaped double-quote character marks the end of the
                              // string.
                              break;
                            }
                            charCode = source.charCodeAt(Index);
                            begin = Index;
                            // Optimize for the common case where a string is valid.
                            while (charCode >= 32 && charCode != 92 && charCode != 34) {
                              charCode = source.charCodeAt(++Index);
                            }
                            // Append the string as-is.
                            value += source.slice(begin, Index);
                          }
                        }
                        if (source.charCodeAt(Index) == 34) {
                          // Advance to the next character and return the revived string.
                          Index++;
                          return value;
                        }
                        // Unterminated string.
                        abort();
                      default:
                        // Parse numbers and literals.
                        begin = Index;
                        // Advance past the negative sign, if one is specified.
                        if (charCode == 45) {
                          isSigned = true;
                          charCode = source.charCodeAt(++Index);
                        }
                        // Parse an integer or floating-point value.
                        if (charCode >= 48 && charCode <= 57) {
                          // Leading zeroes are interpreted as octal literals.
                          if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                            // Illegal octal literal.
                            abort();
                          }
                          isSigned = false;
                          // Parse the integer component.
                          for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                          // Floats cannot contain a leading decimal point; however, this
                          // case is already accounted for by the parser.
                          if (source.charCodeAt(Index) == 46) {
                            position = ++Index;
                            // Parse the decimal component.
                            for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                            if (position == Index) {
                              // Illegal trailing decimal.
                              abort();
                            }
                            Index = position;
                          }
                          // Parse exponents. The `e` denoting the exponent is
                          // case-insensitive.
                          charCode = source.charCodeAt(Index);
                          if (charCode == 101 || charCode == 69) {
                            charCode = source.charCodeAt(++Index);
                            // Skip past the sign following the exponent, if one is
                            // specified.
                            if (charCode == 43 || charCode == 45) {
                              Index++;
                            }
                            // Parse the exponential component.
                            for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                            if (position == Index) {
                              // Illegal empty exponent.
                              abort();
                            }
                            Index = position;
                          }
                          // Coerce the parsed value to a JavaScript number.
                          return +source.slice(begin, Index);
                        }
                        // A negative sign may only precede numbers.
                        if (isSigned) {
                          abort();
                        }
                        // `true`, `false`, and `null` literals.
                        if (source.slice(Index, Index + 4) == "true") {
                          Index += 4;
                          return true;
                        } else if (source.slice(Index, Index + 5) == "false") {
                          Index += 5;
                          return false;
                        } else if (source.slice(Index, Index + 4) == "null") {
                          Index += 4;
                          return null;
                        }
                        // Unrecognized token.
                        abort();
                    }
                  }
                  // Return the sentinel `$` character if the parser has reached the end
                  // of the source string.
                  return "$";
                };

                // Internal: Parses a JSON `value` token.
                var get = function (value) {
                  var results, hasMembers;
                  if (value == "$") {
                    // Unexpected end of input.
                    abort();
                  }
                  if (typeof value == "string") {
                    if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
                      // Remove the sentinel `@` character.
                      return value.slice(1);
                    }
                    // Parse object and array literals.
                    if (value == "[") {
                      // Parses a JSON array, returning a new JavaScript array.
                      results = [];
                      for (; ; hasMembers || (hasMembers = true)) {
                        value = lex();
                        // A closing square bracket marks the end of the array literal.
                        if (value == "]") {
                          break;
                        }
                        // If the array literal contains elements, the current token
                        // should be a comma separating the previous element from the
                        // next.
                        if (hasMembers) {
                          if (value == ",") {
                            value = lex();
                            if (value == "]") {
                              // Unexpected trailing `,` in array literal.
                              abort();
                            }
                          } else {
                            // A `,` must separate each array element.
                            abort();
                          }
                        }
                        // Elisions and leading commas are not permitted.
                        if (value == ",") {
                          abort();
                        }
                        results.push(get(value));
                      }
                      return results;
                    } else if (value == "{") {
                      // Parses a JSON object, returning a new JavaScript object.
                      results = {};
                      for (; ; hasMembers || (hasMembers = true)) {
                        value = lex();
                        // A closing curly brace marks the end of the object literal.
                        if (value == "}") {
                          break;
                        }
                        // If the object literal contains members, the current token
                        // should be a comma separator.
                        if (hasMembers) {
                          if (value == ",") {
                            value = lex();
                            if (value == "}") {
                              // Unexpected trailing `,` in object literal.
                              abort();
                            }
                          } else {
                            // A `,` must separate each object member.
                            abort();
                          }
                        }
                        // Leading commas are not permitted, object property names must be
                        // double-quoted strings, and a `:` must separate each property
                        // name and value.
                        if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                          abort();
                        }
                        results[value.slice(1)] = get(lex());
                      }
                      return results;
                    }
                    // Unexpected token encountered.
                    abort();
                  }
                  return value;
                };

                // Internal: Updates a traversed object member.
                var update = function (source, property, callback) {
                  var element = walk(source, property, callback);
                  if (element === undef) {
                    delete source[property];
                  } else {
                    source[property] = element;
                  }
                };

                // Internal: Recursively traverses a parsed JSON object, invoking the
                // `callback` function for each value. This is an implementation of the
                // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
                var walk = function (source, property, callback) {
                  var value = source[property], length;
                  if (typeof value == "object" && value) {
                    // `forEach` can't be used to traverse an array in Opera <= 8.54
                    // because its `Object#hasOwnProperty` implementation returns `false`
                    // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
                    if (getClass.call(value) == arrayClass) {
                      for (length = value.length; length--;) {
                        update(value, length, callback);
                      }
                    } else {
                      forEach(value, function (property) {
                        update(value, property, callback);
                      });
                    }
                  }
                  return callback.call(source, property, value);
                };

                // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
                exports.parse = function (source, callback) {
                  var result, value;
                  Index = 0;
                  Source = "" + source;
                  result = get(lex());
                  // If a JSON string contains multiple tokens, it is invalid.
                  if (lex() != "$") {
                    abort();
                  }
                  // Reset the parser state.
                  Index = Source = null;
                  return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
                };
              }
            }

            exports["runInContext"] = runInContext;
            return exports;
          }

          if (freeExports && !isLoader) {
            // Export for CommonJS environments.
            runInContext(root, freeExports);
          } else {
            // Export for web browsers and JavaScript engines.
            var nativeJSON = root.JSON,
              previousJSON = root["JSON3"],
              isRestored = false;

            var JSON3 = runInContext(root, (root["JSON3"] = {
              // Public: Restores the original value of the global `JSON` object and
              // returns a reference to the `JSON3` object.
              "noConflict": function () {
                if (!isRestored) {
                  isRestored = true;
                  root.JSON = nativeJSON;
                  root["JSON3"] = previousJSON;
                  nativeJSON = previousJSON = null;
                }
                return JSON3;
              }
            }));

            root.JSON = {
              "parse": JSON3.parse,
              "stringify": JSON3.stringify
            };
          }

          // Export for asynchronous module loaders.
          if (isLoader) {
            define(function () {
              return JSON3;
            });
          }
        }).call(this);

      }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
    }, {}], 51: [function (_dereq_, module, exports) {
      module.exports = toArray

      function toArray(list, index) {
        var array = []

        index = index || 0

        for (var i = index || 0; i < list.length; i++) {
          array[i - index] = list[i]
        }

        return array
      }

    }, {}]
  }, {}, [31])(31)
});
// CryptoJS JSEncrypt md5
/*!
 * js-logger - http://github.com/jonnyreeves/js-logger
 * Jonny Reeves, http://jonnyreeves.co.uk/
 * js-logger may be freely distributed under the MIT license.
 */
(function (global) {
  "use strict";

  // Top level module for the global, static logger instance.
  var Logger = {};

  // For those that are at home that are keeping score.
  Logger.VERSION = "1.6.0";

  // Function which handles all incoming log messages.
  var logHandler;

  // Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
  var contextualLoggersByNameMap = {};

  // Polyfill for ES5's Function.bind.
  var bind = function (scope, func) {
    return function () {
      return func.apply(scope, arguments);
    };
  };

  // Super exciting object merger-matron 9000 adding another 100 bytes to your download.
  var merge = function () {
    var args = arguments, target = args[0], key, i;
    for (i = 1; i < args.length; i++) {
      for (key in args[i]) {
        if (!(key in target) && args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }
    return target;
  };

  // Helper to define a logging level object; helps with optimisation.
  var defineLogLevel = function (value, name) {
    return { value: value, name: name };
  };

  // Predefined logging levels.
  Logger.TRACE = defineLogLevel(1, 'TRACE');
  Logger.DEBUG = defineLogLevel(2, 'DEBUG');
  Logger.INFO = defineLogLevel(3, 'INFO');
  Logger.TIME = defineLogLevel(4, 'TIME');
  Logger.WARN = defineLogLevel(5, 'WARN');
  Logger.ERROR = defineLogLevel(8, 'ERROR');
  Logger.OFF = defineLogLevel(99, 'OFF');

  // Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
  // of each other.
  var ContextualLogger = function (defaultContext) {
    this.context = defaultContext;
    this.setLevel(defaultContext.filterLevel);
    this.log = this.info;  // Convenience alias.
  };

  ContextualLogger.prototype = {
    // Changes the current logging level for the logging instance.
    setLevel: function (newLevel) {
      // Ensure the supplied Level object looks valid.
      if (newLevel && "value" in newLevel) {
        this.context.filterLevel = newLevel;
      }
    },

    // Gets the current logging level for the logging instance
    getLevel: function () {
      return this.context.filterLevel;
    },

    // Is the logger configured to output messages at the supplied level?
    enabledFor: function (lvl) {
      var filterLevel = this.context.filterLevel;
      return lvl.value >= filterLevel.value;
    },

    trace: function () {
      this.invoke(Logger.TRACE, arguments);
    },

    debug: function () {
      this.invoke(Logger.DEBUG, arguments);
    },

    info: function () {
      this.invoke(Logger.INFO, arguments);
    },

    warn: function () {
      this.invoke(Logger.WARN, arguments);
    },

    error: function () {
      this.invoke(Logger.ERROR, arguments);
    },

    time: function (label) {
      if (typeof label === 'string' && label.length > 0) {
        this.invoke(Logger.TIME, [label, 'start']);
      }
    },

    timeEnd: function (label) {
      if (typeof label === 'string' && label.length > 0) {
        this.invoke(Logger.TIME, [label, 'end']);
      }
    },

    // Invokes the logger callback if it's not being filtered.
    invoke: function (level, msgArgs) {
      if (logHandler && this.enabledFor(level)) {
        logHandler(msgArgs, merge({ level: level }, this.context));
      }
    }
  };

  // Protected instance which all calls to the to level `Logger` module will be routed through.
  var globalLogger = new ContextualLogger({ filterLevel: Logger.OFF });

  // Configure the global Logger instance.
  (function () {
    // Shortcut for optimisers.
    var L = Logger;

    L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
    L.trace = bind(globalLogger, globalLogger.trace);
    L.debug = bind(globalLogger, globalLogger.debug);
    L.time = bind(globalLogger, globalLogger.time);
    L.timeEnd = bind(globalLogger, globalLogger.timeEnd);
    L.info = bind(globalLogger, globalLogger.info);
    L.warn = bind(globalLogger, globalLogger.warn);
    L.error = bind(globalLogger, globalLogger.error);

    // Don't forget the convenience alias!
    L.log = L.info;
  }());

  // Set the global logging handler.  The supplied function should expect two arguments, the first being an arguments
  // object with the supplied log messages and the second being a context object which contains a hash of stateful
  // parameters which the logging function can consume.
  Logger.setHandler = function (func) {
    logHandler = func;
  };

  // Sets the global logging filter level which applies to *all* previously registered, and future Logger instances.
  // (note that named loggers (retrieved via `Logger.get`) can be configured independently if required).
  Logger.setLevel = function (level) {
    // Set the globalLogger's level.
    globalLogger.setLevel(level);

    // Apply this level to all registered contextual loggers.
    for (var key in contextualLoggersByNameMap) {
      if (contextualLoggersByNameMap.hasOwnProperty(key)) {
        contextualLoggersByNameMap[key].setLevel(level);
      }
    }
  };

  // Gets the global logging filter level
  Logger.getLevel = function () {
    return globalLogger.getLevel();
  };

  // Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
  // default context and log handler.
  Logger.get = function (name) {
    // All logger instances are cached so they can be configured ahead of use.
    return contextualLoggersByNameMap[name] ||
      (contextualLoggersByNameMap[name] = new ContextualLogger(merge({ name: name }, globalLogger.context)));
  };

  // CreateDefaultHandler returns a handler function which can be passed to `Logger.setHandler()` which will
  // write to the window's console object (if present); the optional options object can be used to customise the
  // formatter used to format each log message.
  Logger.createDefaultHandler = function (options) {
    options = options || {};

    options.formatter = options.formatter || function defaultMessageFormatter(messages, context) {
      // Prepend the logger's name to the log message for easy identification.
      if (context.name) {
        messages.unshift("[" + context.name + "]");
      }
    };

    // Map of timestamps by timer labels used to track `#time` and `#timeEnd()` invocations in environments
    // that don't offer a native console method.
    var timerStartTimeByLabelMap = {};

    // Support for IE8+ (and other, slightly more sane environments)
    var invokeConsoleMethod = function (hdlr, messages) {
      Function.prototype.apply.call(hdlr, console, messages);
    };

    // Check for the presence of a logger.
    if (typeof console === "undefined") {
      return function () { /* no console */ };
    }

    return function (messages, context) {
      // Convert arguments object to Array.
      messages = Array.prototype.slice.call(messages);

      var hdlr = console.log;
      var timerLabel;

      if (context.level === Logger.TIME) {
        timerLabel = (context.name ? '[' + context.name + '] ' : '') + messages[0];

        if (messages[1] === 'start') {
          if (console.time) {
            console.time(timerLabel);
          }
          else {
            timerStartTimeByLabelMap[timerLabel] = new Date().getTime();
          }
        }
        else {
          if (console.timeEnd) {
            console.timeEnd(timerLabel);
          }
          else {
            invokeConsoleMethod(hdlr, [timerLabel + ': ' +
              (new Date().getTime() - timerStartTimeByLabelMap[timerLabel]) + 'ms']);
          }
        }
      }
      else {
        // Delegate through to custom warn/error loggers if present on the console.
        if (context.level === Logger.WARN && console.warn) {
          hdlr = console.warn;
        } else if (context.level === Logger.ERROR && console.error) {
          hdlr = console.error;
        } else if (context.level === Logger.INFO && console.info) {
          hdlr = console.info;
        } else if (context.level === Logger.DEBUG && console.debug) {
          hdlr = console.debug;
        } else if (context.level === Logger.TRACE && console.trace) {
          hdlr = console.trace;
        }

        options.formatter(messages, context);
        invokeConsoleMethod(hdlr, messages);
      }
    };
  };

  // Configure and example a Default implementation which writes to the `window.console` (if present).  The
  // `options` hash can be used to configure the default logLevel and provide a custom message formatter.
  Logger.useDefaults = function (options) {
    Logger.setLevel(options && options.defaultLevel || Logger.DEBUG);
    Logger.setHandler(Logger.createDefaultHandler(options));
  };

  // Export to popular environments boilerplate.
  if (typeof define === 'function' && define.amd) {
    define(Logger);
  }
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
  }
  else {
    Logger._prevLogger = global.Logger;

    Logger.noConflict = function () {
      global.Logger = Logger._prevLogger;
      return Logger;
    };

    global.Logger = Logger;
  }
}(this));
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
  /**
   * CryptoJS namespace.
   */
  var C = {};

  /**
   * Library namespace.
   */
  var C_lib = C.lib = {};

  /**
   * Base object for prototypal inheritance.
   */
  var Base = C_lib.Base = (function () {
    function F() { }

    return {
      /**
       * Creates a new object that inherits from this object.
       *
       * @param {Object} overrides Properties to copy into the new object.
       *
       * @return {Object} The new object.
       *
       * @static
       *
       * @example
       *
       *     var MyType = CryptoJS.lib.Base.extend({
       *         field: 'value',
       *
       *         method: function () {
       *         }
       *     });
       */
      extend: function (overrides) {
        // Spawn
        F.prototype = this;
        var subtype = new F();

        // Augment
        if (overrides) {
          subtype.mixIn(overrides);
        }

        // Create default initializer
        if (!subtype.hasOwnProperty('init')) {
          subtype.init = function () {
            subtype.$super.init.apply(this, arguments);
          };
        }

        // Initializer's prototype is the subtype object
        subtype.init.prototype = subtype;

        // Reference supertype
        subtype.$super = this;

        return subtype;
      },

      /**
       * Extends this object and runs the init method.
       * Arguments to create() will be passed to init().
       *
       * @return {Object} The new object.
       *
       * @static
       *
       * @example
       *
       *     var instance = MyType.create();
       */
      create: function () {
        var instance = this.extend();
        instance.init.apply(instance, arguments);

        return instance;
      },

      /**
       * Initializes a newly created object.
       * Override this method to add some logic when your objects are created.
       *
       * @example
       *
       *     var MyType = CryptoJS.lib.Base.extend({
       *         init: function () {
       *             // ...
       *         }
       *     });
       */
      init: function () {
      },

      /**
       * Copies properties into this object.
       *
       * @param {Object} properties The properties to mix in.
       *
       * @example
       *
       *     MyType.mixIn({
       *         field: 'value'
       *     });
       */
      mixIn: function (properties) {
        for (var propertyName in properties) {
          if (properties.hasOwnProperty(propertyName)) {
            this[propertyName] = properties[propertyName];
          }
        }

        // IE won't copy toString using the loop above
        if (properties.hasOwnProperty('toString')) {
          this.toString = properties.toString;
        }
      },

      /**
       * Creates a copy of this object.
       *
       * @return {Object} The clone.
       *
       * @example
       *
       *     var clone = instance.clone();
       */
      clone: function () {
        return this.init.prototype.extend(this);
      }
    };
  }());

  /**
   * An array of 32-bit words.
   *
   * @property {Array} words The array of 32-bit words.
   * @property {number} sigBytes The number of significant bytes in this word array.
   */
  var WordArray = C_lib.WordArray = Base.extend({
    /**
     * Initializes a newly created word array.
     *
     * @param {Array} words (Optional) An array of 32-bit words.
     * @param {number} sigBytes (Optional) The number of significant bytes in the words.
     *
     * @example
     *
     *     var wordArray = CryptoJS.lib.WordArray.create();
     *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
     *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
     */
    init: function (words, sigBytes) {
      words = this.words = words || [];

      if (sigBytes != undefined) {
        this.sigBytes = sigBytes;
      } else {
        this.sigBytes = words.length * 4;
      }
    },

    /**
     * Converts this word array to a string.
     *
     * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
     *
     * @return {string} The stringified word array.
     *
     * @example
     *
     *     var string = wordArray + '';
     *     var string = wordArray.toString();
     *     var string = wordArray.toString(CryptoJS.enc.Utf8);
     */
    toString: function (encoder) {
      return (encoder || Hex).stringify(this);
    },

    /**
     * Concatenates a word array to this word array.
     *
     * @param {WordArray} wordArray The word array to append.
     *
     * @return {WordArray} This word array.
     *
     * @example
     *
     *     wordArray1.concat(wordArray2);
     */
    concat: function (wordArray) {
      // Shortcuts
      var thisWords = this.words;
      var thatWords = wordArray.words;
      var thisSigBytes = this.sigBytes;
      var thatSigBytes = wordArray.sigBytes;

      // Clamp excess bits
      this.clamp();

      // Concat
      if (thisSigBytes % 4) {
        // Copy one byte at a time
        for (var i = 0; i < thatSigBytes; i++) {
          var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
          thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
        }
      } else if (thatWords.length > 0xffff) {
        // Copy one word at a time
        for (var i = 0; i < thatSigBytes; i += 4) {
          thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
        }
      } else {
        // Copy all words at once
        thisWords.push.apply(thisWords, thatWords);
      }
      this.sigBytes += thatSigBytes;

      // Chainable
      return this;
    },

    /**
     * Removes insignificant bits.
     *
     * @example
     *
     *     wordArray.clamp();
     */
    clamp: function () {
      // Shortcuts
      var words = this.words;
      var sigBytes = this.sigBytes;

      // Clamp
      words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
      words.length = Math.ceil(sigBytes / 4);
    },

    /**
     * Creates a copy of this word array.
     *
     * @return {WordArray} The clone.
     *
     * @example
     *
     *     var clone = wordArray.clone();
     */
    clone: function () {
      var clone = Base.clone.call(this);
      clone.words = this.words.slice(0);

      return clone;
    },

    /**
     * Creates a word array filled with random bytes.
     *
     * @param {number} nBytes The number of random bytes to generate.
     *
     * @return {WordArray} The random word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.lib.WordArray.random(16);
     */
    random: function (nBytes) {
      var words = [];
      for (var i = 0; i < nBytes; i += 4) {
        words.push((Math.random() * 0x100000000) | 0);
      }

      return new WordArray.init(words, nBytes);
    }
  });

  /**
   * Encoder namespace.
   */
  var C_enc = C.enc = {};

  /**
   * Hex encoding strategy.
   */
  var Hex = C_enc.Hex = {
    /**
     * Converts a word array to a hex string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The hex string.
     *
     * @static
     *
     * @example
     *
     *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
     */
    stringify: function (wordArray) {
      // Shortcuts
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;

      // Convert
      var hexChars = [];
      for (var i = 0; i < sigBytes; i++) {
        var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        hexChars.push((bite >>> 4).toString(16));
        hexChars.push((bite & 0x0f).toString(16));
      }

      return hexChars.join('');
    },

    /**
     * Converts a hex string to a word array.
     *
     * @param {string} hexStr The hex string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
     */
    parse: function (hexStr) {
      // Shortcut
      var hexStrLength = hexStr.length;

      // Convert
      var words = [];
      for (var i = 0; i < hexStrLength; i += 2) {
        words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
      }

      return new WordArray.init(words, hexStrLength / 2);
    }
  };

  /**
   * Latin1 encoding strategy.
   */
  var Latin1 = C_enc.Latin1 = {
    /**
     * Converts a word array to a Latin1 string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The Latin1 string.
     *
     * @static
     *
     * @example
     *
     *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
     */
    stringify: function (wordArray) {
      // Shortcuts
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;

      // Convert
      var latin1Chars = [];
      for (var i = 0; i < sigBytes; i++) {
        var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        latin1Chars.push(String.fromCharCode(bite));
      }

      return latin1Chars.join('');
    },

    /**
     * Converts a Latin1 string to a word array.
     *
     * @param {string} latin1Str The Latin1 string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
     */
    parse: function (latin1Str) {
      // Shortcut
      var latin1StrLength = latin1Str.length;

      // Convert
      var words = [];
      for (var i = 0; i < latin1StrLength; i++) {
        words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
      }

      return new WordArray.init(words, latin1StrLength);
    }
  };

  /**
   * UTF-8 encoding strategy.
   */
  var Utf8 = C_enc.Utf8 = {
    /**
     * Converts a word array to a UTF-8 string.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {string} The UTF-8 string.
     *
     * @static
     *
     * @example
     *
     *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
     */
    stringify: function (wordArray) {
      try {
        return decodeURIComponent(escape(Latin1.stringify(wordArray)));
      } catch (e) {
        throw new Error('Malformed UTF-8 data');
      }
    },

    /**
     * Converts a UTF-8 string to a word array.
     *
     * @param {string} utf8Str The UTF-8 string.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
     */
    parse: function (utf8Str) {
      return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    }
  };

  /**
   * Abstract buffered block algorithm template.
   *
   * The property blockSize must be implemented in a concrete subtype.
   *
   * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
   */
  var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    /**
     * Resets this block algorithm's data buffer to its initial state.
     *
     * @example
     *
     *     bufferedBlockAlgorithm.reset();
     */
    reset: function () {
      // Initial values
      this._data = new WordArray.init();
      this._nDataBytes = 0;
    },

    /**
     * Adds new data to this block algorithm's buffer.
     *
     * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
     *
     * @example
     *
     *     bufferedBlockAlgorithm._append('data');
     *     bufferedBlockAlgorithm._append(wordArray);
     */
    _append: function (data) {
      // Convert string to WordArray, else assume WordArray already
      if (typeof data == 'string') {
        data = Utf8.parse(data);
      }

      // Append
      this._data.concat(data);
      this._nDataBytes += data.sigBytes;
    },

    /**
     * Processes available data blocks.
     *
     * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
     *
     * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
     *
     * @return {WordArray} The processed data.
     *
     * @example
     *
     *     var processedData = bufferedBlockAlgorithm._process();
     *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
     */
    _process: function (doFlush) {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;
      var dataSigBytes = data.sigBytes;
      var blockSize = this.blockSize;
      var blockSizeBytes = blockSize * 4;

      // Count blocks ready
      var nBlocksReady = dataSigBytes / blockSizeBytes;
      if (doFlush) {
        // Round up to include partial blocks
        nBlocksReady = Math.ceil(nBlocksReady);
      } else {
        // Round down to include only full blocks,
        // less the number of blocks that must remain in the buffer
        nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
      }

      // Count words ready
      var nWordsReady = nBlocksReady * blockSize;

      // Count bytes ready
      var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

      // Process blocks
      if (nWordsReady) {
        for (var offset = 0; offset < nWordsReady; offset += blockSize) {
          // Perform concrete-algorithm logic
          this._doProcessBlock(dataWords, offset);
        }

        // Remove processed words
        var processedWords = dataWords.splice(0, nWordsReady);
        data.sigBytes -= nBytesReady;
      }

      // Return processed words
      return new WordArray.init(processedWords, nBytesReady);
    },

    /**
     * Creates a copy of this object.
     *
     * @return {Object} The clone.
     *
     * @example
     *
     *     var clone = bufferedBlockAlgorithm.clone();
     */
    clone: function () {
      var clone = Base.clone.call(this);
      clone._data = this._data.clone();

      return clone;
    },

    _minBufferSize: 0
  });

  /**
   * Abstract hasher template.
   *
   * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
   */
  var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
    /**
     * Configuration options.
     */
    cfg: Base.extend(),

    /**
     * Initializes a newly created hasher.
     *
     * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
     *
     * @example
     *
     *     var hasher = CryptoJS.algo.SHA256.create();
     */
    init: function (cfg) {
      // Apply config defaults
      this.cfg = this.cfg.extend(cfg);

      // Set initial values
      this.reset();
    },

    /**
     * Resets this hasher to its initial state.
     *
     * @example
     *
     *     hasher.reset();
     */
    reset: function () {
      // Reset data buffer
      BufferedBlockAlgorithm.reset.call(this);

      // Perform concrete-hasher logic
      this._doReset();
    },

    /**
     * Updates this hasher with a message.
     *
     * @param {WordArray|string} messageUpdate The message to append.
     *
     * @return {Hasher} This hasher.
     *
     * @example
     *
     *     hasher.update('message');
     *     hasher.update(wordArray);
     */
    update: function (messageUpdate) {
      // Append
      this._append(messageUpdate);

      // Update the hash
      this._process();

      // Chainable
      return this;
    },

    /**
     * Finalizes the hash computation.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} messageUpdate (Optional) A final message update.
     *
     * @return {WordArray} The hash.
     *
     * @example
     *
     *     var hash = hasher.finalize();
     *     var hash = hasher.finalize('message');
     *     var hash = hasher.finalize(wordArray);
     */
    finalize: function (messageUpdate) {
      // Final message update
      if (messageUpdate) {
        this._append(messageUpdate);
      }

      // Perform concrete-hasher logic
      var hash = this._doFinalize();

      return hash;
    },

    blockSize: 512 / 32,

    /**
     * Creates a shortcut function to a hasher's object interface.
     *
     * @param {Hasher} hasher The hasher to create a helper for.
     *
     * @return {Function} The shortcut function.
     *
     * @static
     *
     * @example
     *
     *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
     */
    _createHelper: function (hasher) {
      return function (message, cfg) {
        return new hasher.init(cfg).finalize(message);
      };
    },

    /**
     * Creates a shortcut function to the HMAC's object interface.
     *
     * @param {Hasher} hasher The hasher to use in this HMAC helper.
     *
     * @return {Function} The shortcut function.
     *
     * @static
     *
     * @example
     *
     *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
     */
    _createHmacHelper: function (hasher) {
      return function (message, key) {
        return new C_algo.HMAC.init(hasher, key).finalize(message);
      };
    }
  });

  /**
   * Algorithm namespace.
   */
  var C_algo = C.algo = {};

  return C;
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function (Math) {
  // Shortcuts
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var Hasher = C_lib.Hasher;
  var C_algo = C.algo;

  // Constants table
  var T = [];

  // Compute constants
  (function () {
    for (var i = 0; i < 64; i++) {
      T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    }
  }());

  /**
   * MD5 hash algorithm.
   */
  var MD5 = C_algo.MD5 = Hasher.extend({
    _doReset: function () {
      this._hash = new WordArray.init([
        0x67452301, 0xefcdab89,
        0x98badcfe, 0x10325476
      ]);
    },

    _doProcessBlock: function (M, offset) {
      // Swap endian
      for (var i = 0; i < 16; i++) {
        // Shortcuts
        var offset_i = offset + i;
        var M_offset_i = M[offset_i];

        M[offset_i] = (
          (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
          (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
        );
      }

      // Shortcuts
      var H = this._hash.words;

      var M_offset_0 = M[offset + 0];
      var M_offset_1 = M[offset + 1];
      var M_offset_2 = M[offset + 2];
      var M_offset_3 = M[offset + 3];
      var M_offset_4 = M[offset + 4];
      var M_offset_5 = M[offset + 5];
      var M_offset_6 = M[offset + 6];
      var M_offset_7 = M[offset + 7];
      var M_offset_8 = M[offset + 8];
      var M_offset_9 = M[offset + 9];
      var M_offset_10 = M[offset + 10];
      var M_offset_11 = M[offset + 11];
      var M_offset_12 = M[offset + 12];
      var M_offset_13 = M[offset + 13];
      var M_offset_14 = M[offset + 14];
      var M_offset_15 = M[offset + 15];

      // Working varialbes
      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];

      // Computation
      a = FF(a, b, c, d, M_offset_0, 7, T[0]);
      d = FF(d, a, b, c, M_offset_1, 12, T[1]);
      c = FF(c, d, a, b, M_offset_2, 17, T[2]);
      b = FF(b, c, d, a, M_offset_3, 22, T[3]);
      a = FF(a, b, c, d, M_offset_4, 7, T[4]);
      d = FF(d, a, b, c, M_offset_5, 12, T[5]);
      c = FF(c, d, a, b, M_offset_6, 17, T[6]);
      b = FF(b, c, d, a, M_offset_7, 22, T[7]);
      a = FF(a, b, c, d, M_offset_8, 7, T[8]);
      d = FF(d, a, b, c, M_offset_9, 12, T[9]);
      c = FF(c, d, a, b, M_offset_10, 17, T[10]);
      b = FF(b, c, d, a, M_offset_11, 22, T[11]);
      a = FF(a, b, c, d, M_offset_12, 7, T[12]);
      d = FF(d, a, b, c, M_offset_13, 12, T[13]);
      c = FF(c, d, a, b, M_offset_14, 17, T[14]);
      b = FF(b, c, d, a, M_offset_15, 22, T[15]);

      a = GG(a, b, c, d, M_offset_1, 5, T[16]);
      d = GG(d, a, b, c, M_offset_6, 9, T[17]);
      c = GG(c, d, a, b, M_offset_11, 14, T[18]);
      b = GG(b, c, d, a, M_offset_0, 20, T[19]);
      a = GG(a, b, c, d, M_offset_5, 5, T[20]);
      d = GG(d, a, b, c, M_offset_10, 9, T[21]);
      c = GG(c, d, a, b, M_offset_15, 14, T[22]);
      b = GG(b, c, d, a, M_offset_4, 20, T[23]);
      a = GG(a, b, c, d, M_offset_9, 5, T[24]);
      d = GG(d, a, b, c, M_offset_14, 9, T[25]);
      c = GG(c, d, a, b, M_offset_3, 14, T[26]);
      b = GG(b, c, d, a, M_offset_8, 20, T[27]);
      a = GG(a, b, c, d, M_offset_13, 5, T[28]);
      d = GG(d, a, b, c, M_offset_2, 9, T[29]);
      c = GG(c, d, a, b, M_offset_7, 14, T[30]);
      b = GG(b, c, d, a, M_offset_12, 20, T[31]);

      a = HH(a, b, c, d, M_offset_5, 4, T[32]);
      d = HH(d, a, b, c, M_offset_8, 11, T[33]);
      c = HH(c, d, a, b, M_offset_11, 16, T[34]);
      b = HH(b, c, d, a, M_offset_14, 23, T[35]);
      a = HH(a, b, c, d, M_offset_1, 4, T[36]);
      d = HH(d, a, b, c, M_offset_4, 11, T[37]);
      c = HH(c, d, a, b, M_offset_7, 16, T[38]);
      b = HH(b, c, d, a, M_offset_10, 23, T[39]);
      a = HH(a, b, c, d, M_offset_13, 4, T[40]);
      d = HH(d, a, b, c, M_offset_0, 11, T[41]);
      c = HH(c, d, a, b, M_offset_3, 16, T[42]);
      b = HH(b, c, d, a, M_offset_6, 23, T[43]);
      a = HH(a, b, c, d, M_offset_9, 4, T[44]);
      d = HH(d, a, b, c, M_offset_12, 11, T[45]);
      c = HH(c, d, a, b, M_offset_15, 16, T[46]);
      b = HH(b, c, d, a, M_offset_2, 23, T[47]);

      a = II(a, b, c, d, M_offset_0, 6, T[48]);
      d = II(d, a, b, c, M_offset_7, 10, T[49]);
      c = II(c, d, a, b, M_offset_14, 15, T[50]);
      b = II(b, c, d, a, M_offset_5, 21, T[51]);
      a = II(a, b, c, d, M_offset_12, 6, T[52]);
      d = II(d, a, b, c, M_offset_3, 10, T[53]);
      c = II(c, d, a, b, M_offset_10, 15, T[54]);
      b = II(b, c, d, a, M_offset_1, 21, T[55]);
      a = II(a, b, c, d, M_offset_8, 6, T[56]);
      d = II(d, a, b, c, M_offset_15, 10, T[57]);
      c = II(c, d, a, b, M_offset_6, 15, T[58]);
      b = II(b, c, d, a, M_offset_13, 21, T[59]);
      a = II(a, b, c, d, M_offset_4, 6, T[60]);
      d = II(d, a, b, c, M_offset_11, 10, T[61]);
      c = II(c, d, a, b, M_offset_2, 15, T[62]);
      b = II(b, c, d, a, M_offset_9, 21, T[63]);

      // Intermediate hash value
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
    },

    _doFinalize: function () {
      // Shortcuts
      var data = this._data;
      var dataWords = data.words;

      var nBitsTotal = this._nDataBytes * 8;
      var nBitsLeft = data.sigBytes * 8;

      // Add padding
      dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

      var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
      var nBitsTotalL = nBitsTotal;
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
        (((nBitsTotalH << 8) | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
        (((nBitsTotalH << 24) | (nBitsTotalH >>> 8)) & 0xff00ff00)
      );
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
        (((nBitsTotalL << 8) | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
        (((nBitsTotalL << 24) | (nBitsTotalL >>> 8)) & 0xff00ff00)
      );

      data.sigBytes = (dataWords.length + 1) * 4;

      // Hash final blocks
      this._process();

      // Shortcuts
      var hash = this._hash;
      var H = hash.words;

      // Swap endian
      for (var i = 0; i < 4; i++) {
        // Shortcut
        var H_i = H[i];

        H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
          (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
      }

      // Return final computed hash
      return hash;
    },

    clone: function () {
      var clone = Hasher.clone.call(this);
      clone._hash = this._hash.clone();

      return clone;
    }
  });

  function FF(a, b, c, d, x, s, t) {
    var n = a + ((b & c) | (~b & d)) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  function GG(a, b, c, d, x, s, t) {
    var n = a + ((b & d) | (c & ~d)) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  function HH(a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  function II(a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + x + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  }

  /**
   * Shortcut function to the hasher's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   *
   * @return {WordArray} The hash.
   *
   * @static
   *
   * @example
   *
   *     var hash = CryptoJS.MD5('message');
   *     var hash = CryptoJS.MD5(wordArray);
   */
  C.MD5 = Hasher._createHelper(MD5);

  /**
   * Shortcut function to the HMAC's object interface.
   *
   * @param {WordArray|string} message The message to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The HMAC.
   *
   * @static
   *
   * @example
   *
   *     var hmac = CryptoJS.HmacMD5(message, key);
   */
  C.HmacMD5 = Hasher._createHmacHelper(MD5);
}(Math));
/*! JSEncrypt v2.3.1 | https://npmcdn.com/jsencrypt@2.3.1/LICENSE.txt */
(function (root, factory) {
  factory(root);
})(this, function (exports) {
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // See "LICENSE" for details.

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary & 0xffffff) == 0xefcafe);

  // (public) Constructor
  function BigInteger(a, b, c) {
    if (a != null)
      if ("number" == typeof a) this.fromNumber(a, b, c);
      else if (b == null && "string" != typeof a) this.fromString(a, 256);
      else this.fromString(a, b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i, x, w, j, c, n) {
    var xl = x & 0x3fff, xh = x >> 14;
    while (--n >= 0) {
      var l = this[i] & 0x3fff;
      var h = this[i++] >> 14;
      var m = xh * l + h * xl;
      l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
      c = (l >> 28) + (m >> 14) + xh * h;
      w[j++] = l & 0xfffffff;
    }
    return c;
  }
  BigInteger.prototype.am = am3;
  dbits = 28;

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1 << dbits) - 1);
  BigInteger.prototype.DV = (1 << dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2, BI_FP);
  BigInteger.prototype.F1 = BI_FP - dbits;
  BigInteger.prototype.F2 = 2 * dbits - BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr, vv;
  rr = "0".charCodeAt(0);
  for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s, i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c == null) ? -1 : c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x < 0) ? -1 : 0;
    if (x > 0) this[0] = x;
    else if (x < -1) this[0] = x + this.DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s, b) {
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 256) k = 8; // byte array
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else { this.fromRadix(s, b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while (--i >= 0) {
      var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if (sh == 0)
        this[this.t++] = x;
      else if (sh + k > this.DB) {
        this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
        this[this.t++] = (x >> (this.DB - sh));
      }
      else
        this[this.t - 1] |= x << sh;
      sh += k;
      if (sh >= this.DB) sh -= this.DB;
    }
    if (k == 8 && (s[0] & 0x80) != 0) {
      this.s = -1;
      if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
    }
    this.clamp();
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == c)--this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if (this.s < 0) return "-" + this.negate().toString(b);
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
    var p = this.DB - (i * this.DB) % k;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
      while (i >= 0) {
        if (p < k) {
          d = (this[i] & ((1 << p) - 1)) << (k - p);
          d |= this[--i] >> (p += this.DB - k);
        }
        else {
          d = (this[i] >> (p -= k)) & km;
          if (p <= 0) { p += this.DB; --i; }
        }
        if (d > 0) m = true;
        if (m) r += int2char(d);
      }
    }
    return m ? r : "0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this, r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s < 0) ? this.negate() : this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s - a.s;
    if (r != 0) return r;
    var i = this.t;
    r = i - a.t;
    if (r != 0) return (this.s < 0) ? -r : r;
    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if ((t = x >>> 16) != 0) { x = t; r += 16; }
    if ((t = x >> 8) != 0) { x = t; r += 8; }
    if ((t = x >> 4) != 0) { x = t; r += 4; }
    if ((t = x >> 2) != 0) { x = t; r += 2; }
    if ((t = x >> 1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if (this.t <= 0) return 0;
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n, r) {
    var i;
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
    for (i = n - 1; i >= 0; --i) r[i] = 0;
    r.t = this.t + n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n, r) {
    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
    r.t = Math.max(this.t - n, 0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n, r) {
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << cbs) - 1;
    var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
    for (i = this.t - 1; i >= 0; --i) {
      r[i + ds + 1] = (this[i] >> cbs) | c;
      c = (this[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t + ds + 1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n, r) {
    r.s = this.s;
    var ds = Math.floor(n / this.DB);
    if (ds >= this.t) { r.t = 0; return; }
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << bs) - 1;
    r[0] = this[ds] >> bs;
    for (var i = ds + 1; i < this.t; ++i) {
      r[i - ds - 1] |= (this[i] & bm) << cbs;
      r[i - ds] = this[i] >> bs;
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
    r.t = this.t - ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a, r) {
    var i = 0, c = 0, m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] - a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c -= a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while (i < a.t) {
        c -= a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c < -1) r[i++] = this.DV + c;
    else if (c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a, r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i + y.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
    r.s = 0;
    r.clamp();
    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2 * x.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
      var c = x.am(i, x[i], r, 2 * i, 0, 1);
      if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
        r[i + x.t] -= x.DV;
        r[i + x.t + 1] = 1;
      }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m, q, r) {
    var pm = m.abs();
    if (pm.t <= 0) return;
    var pt = this.abs();
    if (pt.t < pm.t) {
      if (q != null) q.fromInt(0);
      if (r != null) this.copyTo(r);
      return;
    }
    if (r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB - nbits(pm[pm.t - 1]);	// normalize modulus
    if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys - 1];
    if (y0 == 0) return;
    var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
    var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
    var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
    y.dlShiftTo(j, t);
    if (r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t, r);
    }
    BigInteger.ONE.dlShiftTo(ys, t);
    t.subTo(y, y);	// "negative" y so we can replace sub with am later
    while (y.t < ys) y[y.t++] = 0;
    while (--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
      if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {	// Try it out
        y.dlShiftTo(j, t);
        r.subTo(t, r);
        while (r[i] < --qd) r.subTo(t, r);
      }
    }
    if (q != null) {
      r.drShiftTo(ys, q);
      if (ts != ms) BigInteger.ZERO.subTo(q, q);
    }
    r.t = ys;
    r.clamp();
    if (nsh > 0) r.rShiftTo(nsh, r);	// Denormalize remainder
    if (ts < 0) BigInteger.ZERO.subTo(r, r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a, null, r);
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m, null, x); }
  function cMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
  function cSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if (this.t < 1) return 0;
    var x = this[0];
    if ((x & 1) == 0) return 0;
    var y = x & 3;		// y == 1/x mod 2^2
    y = (y * (2 - (x & 0xf) * y)) & 0xf;	// y == 1/x mod 2^4
    y = (y * (2 - (x & 0xff) * y)) & 0xff;	// y == 1/x mod 2^8
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y * (2 - x * y % this.DV)) % this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y > 0) ? this.DV - y : -y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp & 0x7fff;
    this.mph = this.mp >> 15;
    this.um = (1 << (m.DB - 15)) - 1;
    this.mt2 = 2 * m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t, r);
    r.divRemTo(this.m, null, r);
    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while (x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for (var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i] & 0x7fff;
      var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i + this.m.t;
      x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
      // propagate carry
      while (x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t, x);
    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t > 0) ? (this[0] & 1) : this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e, z) {
    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
    g.copyTo(r);
    while (--i >= 0) {
      z.sqrTo(r, r2);
      if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e, m) {
    var z;
    if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e, z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // Copyright (c) 2005-2009  Tom Wu
  // All Rights Reserved.
  // See "LICENSE" for details.

  // Extended JavaScript BN functions, required for RSA private ops.

  // Version 1.1: new BigInteger("0", 10) returns "proper" zero
  // Version 1.2: square() API, isProbablePrime fix

  // (public)
  function bnClone() { var r = nbi(); this.copyTo(r); return r; }

  // (public) return value as integer
  function bnIntValue() {
    if (this.s < 0) {
      if (this.t == 1) return this[0] - this.DV;
      else if (this.t == 0) return -1;
    }
    else if (this.t == 1) return this[0];
    else if (this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
  }

  // (public) return value as byte
  function bnByteValue() { return (this.t == 0) ? this.s : (this[0] << 24) >> 24; }

  // (public) return value as short (assumes DB>=16)
  function bnShortValue() { return (this.t == 0) ? this.s : (this[0] << 16) >> 16; }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2 * this.DB / Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if (this.s < 0) return -1;
    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if (b == null) b = 10;
    if (this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b, cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d, y, z);
    while (y.signum() > 0) {
      r = (a + z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d, y, z);
    }
    return z.intValue().toString(b) + r;
  }

  // (protected) convert from radix string
  function bnpFromRadix(s, b) {
    this.fromInt(0);
    if (b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
    for (var i = 0; i < s.length; ++i) {
      var x = intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b * w + x;
      if (++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w, 0);
        j = 0;
        w = 0;
      }
    }
    if (j > 0) {
      this.dMultiply(Math.pow(b, j));
      this.dAddOffset(w, 0);
    }
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) alternate constructor
  function bnpFromNumber(a, b, c) {
    if ("number" == typeof b) {
      // new BigInteger(int,int,RNG)
      if (a < 2) this.fromInt(1);
      else {
        this.fromNumber(a, c);
        if (!this.testBit(a - 1))	// force MSB set
          this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
        if (this.isEven()) this.dAddOffset(1, 0); // force odd
        while (!this.isProbablePrime(b)) {
          this.dAddOffset(2, 0);
          if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
        }
      }
    }
    else {
      // new BigInteger(int,RNG)
      var x = new Array(), t = a & 7;
      x.length = (a >> 3) + 1;
      b.nextBytes(x);
      if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0;
      this.fromString(x, 256);
    }
  }

  // (public) convert to bigendian byte array
  function bnToByteArray() {
    var i = this.t, r = new Array();
    r[0] = this.s;
    var p = this.DB - (i * this.DB) % 8, d, k = 0;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
        r[k++] = d | (this.s << (this.DB - p));
      while (i >= 0) {
        if (p < 8) {
          d = (this[i] & ((1 << p) - 1)) << (8 - p);
          d |= this[--i] >> (p += this.DB - 8);
        }
        else {
          d = (this[i] >> (p -= 8)) & 0xff;
          if (p <= 0) { p += this.DB; --i; }
        }
        if ((d & 0x80) != 0) d |= -256;
        if (k == 0 && (this.s & 0x80) != (d & 0x80))++k;
        if (k > 0 || d != this.s) r[k++] = d;
      }
    }
    return r;
  }

  function bnEquals(a) { return (this.compareTo(a) == 0); }
  function bnMin(a) { return (this.compareTo(a) < 0) ? this : a; }
  function bnMax(a) { return (this.compareTo(a) > 0) ? this : a; }

  // (protected) r = this op a (bitwise)
  function bnpBitwiseTo(a, op, r) {
    var i, f, m = Math.min(a.t, this.t);
    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
    if (a.t < this.t) {
      f = a.s & this.DM;
      for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
      r.t = this.t;
    }
    else {
      f = this.s & this.DM;
      for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
      r.t = a.t;
    }
    r.s = op(this.s, a.s);
    r.clamp();
  }

  // (public) this & a
  function op_and(x, y) { return x & y; }
  function bnAnd(a) { var r = nbi(); this.bitwiseTo(a, op_and, r); return r; }

  // (public) this | a
  function op_or(x, y) { return x | y; }
  function bnOr(a) { var r = nbi(); this.bitwiseTo(a, op_or, r); return r; }

  // (public) this ^ a
  function op_xor(x, y) { return x ^ y; }
  function bnXor(a) { var r = nbi(); this.bitwiseTo(a, op_xor, r); return r; }

  // (public) this & ~a
  function op_andnot(x, y) { return x & ~y; }
  function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a, op_andnot, r); return r; }

  // (public) ~this
  function bnNot() {
    var r = nbi();
    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
    r.t = this.t;
    r.s = ~this.s;
    return r;
  }

  // (public) this << n
  function bnShiftLeft(n) {
    var r = nbi();
    if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
    return r;
  }

  // (public) this >> n
  function bnShiftRight(n) {
    var r = nbi();
    if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
    return r;
  }

  // return index of lowest 1-bit in x, x < 2^31
  function lbit(x) {
    if (x == 0) return -1;
    var r = 0;
    if ((x & 0xffff) == 0) { x >>= 16; r += 16; }
    if ((x & 0xff) == 0) { x >>= 8; r += 8; }
    if ((x & 0xf) == 0) { x >>= 4; r += 4; }
    if ((x & 3) == 0) { x >>= 2; r += 2; }
    if ((x & 1) == 0)++r;
    return r;
  }

  // (public) returns index of lowest 1-bit (or -1 if none)
  function bnGetLowestSetBit() {
    for (var i = 0; i < this.t; ++i)
      if (this[i] != 0) return i * this.DB + lbit(this[i]);
    if (this.s < 0) return this.t * this.DB;
    return -1;
  }

  // return number of 1 bits in x
  function cbit(x) {
    var r = 0;
    while (x != 0) { x &= x - 1; ++r; }
    return r;
  }

  // (public) return number of set bits
  function bnBitCount() {
    var r = 0, x = this.s & this.DM;
    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
    return r;
  }

  // (public) true iff nth bit is set
  function bnTestBit(n) {
    var j = Math.floor(n / this.DB);
    if (j >= this.t) return (this.s != 0);
    return ((this[j] & (1 << (n % this.DB))) != 0);
  }

  // (protected) this op (1<<n)
  function bnpChangeBit(n, op) {
    var r = BigInteger.ONE.shiftLeft(n);
    this.bitwiseTo(r, op, r);
    return r;
  }

  // (public) this | (1<<n)
  function bnSetBit(n) { return this.changeBit(n, op_or); }

  // (public) this & ~(1<<n)
  function bnClearBit(n) { return this.changeBit(n, op_andnot); }

  // (public) this ^ (1<<n)
  function bnFlipBit(n) { return this.changeBit(n, op_xor); }

  // (protected) r = this + a
  function bnpAddTo(a, r) {
    var i = 0, c = 0, m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] + a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c += a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while (i < a.t) {
        c += a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c > 0) r[i++] = c;
    else if (c < -1) r[i++] = this.DV + c;
    r.t = i;
    r.clamp();
  }

  // (public) this + a
  function bnAdd(a) { var r = nbi(); this.addTo(a, r); return r; }

  // (public) this - a
  function bnSubtract(a) { var r = nbi(); this.subTo(a, r); return r; }

  // (public) this * a
  function bnMultiply(a) { var r = nbi(); this.multiplyTo(a, r); return r; }

  // (public) this^2
  function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

  // (public) this / a
  function bnDivide(a) { var r = nbi(); this.divRemTo(a, r, null); return r; }

  // (public) this % a
  function bnRemainder(a) { var r = nbi(); this.divRemTo(a, null, r); return r; }

  // (public) [this/a,this%a]
  function bnDivideAndRemainder(a) {
    var q = nbi(), r = nbi();
    this.divRemTo(a, q, r);
    return new Array(q, r);
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n, w) {
    if (n == 0) return;
    while (this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while (this[w] >= this.DV) {
      this[w] -= this.DV;
      if (++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // A "null" reducer
  function NullExp() { }
  function nNop(x) { return x; }
  function nMulTo(x, y, r) { x.multiplyTo(y, r); }
  function nSqrTo(x, r) { x.squareTo(r); }

  NullExp.prototype.convert = nNop;
  NullExp.prototype.revert = nNop;
  NullExp.prototype.mulTo = nMulTo;
  NullExp.prototype.sqrTo = nSqrTo;

  // (public) this^e
  function bnPow(e) { return this.exp(e, new NullExp()); }

  // (protected) r = lower n words of "this * a", a.t <= n
  // "this" should be the larger one if appropriate.
  function bnpMultiplyLowerTo(a, n, r) {
    var i = Math.min(this.t + a.t, n);
    r.s = 0; // assumes a,this >= 0
    r.t = i;
    while (i > 0) r[--i] = 0;
    var j;
    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
    r.clamp();
  }

  // (protected) r = "this * a" without lower n words, n > 0
  // "this" should be the larger one if appropriate.
  function bnpMultiplyUpperTo(a, n, r) {
    --n;
    var i = r.t = this.t + a.t - n;
    r.s = 0; // assumes a,this >= 0
    while (--i >= 0) r[i] = 0;
    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
      r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
    r.clamp();
    r.drShiftTo(1, r);
  }

  // Barrett modular reduction
  function Barrett(m) {
    // setup Barrett
    this.r2 = nbi();
    this.q3 = nbi();
    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
    this.mu = this.r2.divide(m);
    this.m = m;
  }

  function barrettConvert(x) {
    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
    else if (x.compareTo(this.m) < 0) return x;
    else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
  }

  function barrettRevert(x) { return x; }

  // x = x mod m (HAC 14.42)
  function barrettReduce(x) {
    x.drShiftTo(this.m.t - 1, this.r2);
    if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp(); }
    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
    this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
    x.subTo(this.r2, x);
    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  }

  // r = x^2 mod m; x != r
  function barrettSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  // r = x*y mod m; x,y != r
  function barrettMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }

  Barrett.prototype.convert = barrettConvert;
  Barrett.prototype.revert = barrettRevert;
  Barrett.prototype.reduce = barrettReduce;
  Barrett.prototype.mulTo = barrettMulTo;
  Barrett.prototype.sqrTo = barrettSqrTo;

  // (public) this^e % m (HAC 14.85)
  function bnModPow(e, m) {
    var i = e.bitLength(), k, r = nbv(1), z;
    if (i <= 0) return r;
    else if (i < 18) k = 1;
    else if (i < 48) k = 3;
    else if (i < 144) k = 4;
    else if (i < 768) k = 5;
    else k = 6;
    if (i < 8)
      z = new Classic(m);
    else if (m.isEven())
      z = new Barrett(m);
    else
      z = new Montgomery(m);

    // precomputation
    var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
    g[1] = z.convert(this);
    if (k > 1) {
      var g2 = nbi();
      z.sqrTo(g[1], g2);
      while (n <= km) {
        g[n] = nbi();
        z.mulTo(g2, g[n - 2], g[n]);
        n += 2;
      }
    }

    var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
    i = nbits(e[j]) - 1;
    while (j >= 0) {
      if (i >= k1) w = (e[j] >> (i - k1)) & km;
      else {
        w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
        if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
      }

      n = k;
      while ((w & 1) == 0) { w >>= 1; --n; }
      if ((i -= n) < 0) { i += this.DB; --j; }
      if (is1) {	// ret == 1, don't bother squaring or multiplying it
        g[w].copyTo(r);
        is1 = false;
      }
      else {
        while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2; }
        if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t; }
        z.mulTo(r2, g[w], r);
      }

      while (j >= 0 && (e[j] & (1 << i)) == 0) {
        z.sqrTo(r, r2); t = r; r = r2; r2 = t;
        if (--i < 0) { i = this.DB - 1; --j; }
      }
    }
    return z.revert(r);
  }

  // (public) gcd(this,a) (HAC 14.54)
  function bnGCD(a) {
    var x = (this.s < 0) ? this.negate() : this.clone();
    var y = (a.s < 0) ? a.negate() : a.clone();
    if (x.compareTo(y) < 0) { var t = x; x = y; y = t; }
    var i = x.getLowestSetBit(), g = y.getLowestSetBit();
    if (g < 0) return x;
    if (i < g) g = i;
    if (g > 0) {
      x.rShiftTo(g, x);
      y.rShiftTo(g, y);
    }
    while (x.signum() > 0) {
      if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
      if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
      if (x.compareTo(y) >= 0) {
        x.subTo(y, x);
        x.rShiftTo(1, x);
      }
      else {
        y.subTo(x, y);
        y.rShiftTo(1, y);
      }
    }
    if (g > 0) y.lShiftTo(g, y);
    return y;
  }

  // (protected) this % n, n < 2^26
  function bnpModInt(n) {
    if (n <= 0) return 0;
    var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
    if (this.t > 0)
      if (d == 0) r = this[0] % n;
      else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
    return r;
  }

  // (public) 1/this % m (HAC 14.61)
  function bnModInverse(m) {
    var ac = m.isEven();
    if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
    var u = m.clone(), v = this.clone();
    var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
    while (u.signum() != 0) {
      while (u.isEven()) {
        u.rShiftTo(1, u);
        if (ac) {
          if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b); }
          a.rShiftTo(1, a);
        }
        else if (!b.isEven()) b.subTo(m, b);
        b.rShiftTo(1, b);
      }
      while (v.isEven()) {
        v.rShiftTo(1, v);
        if (ac) {
          if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d); }
          c.rShiftTo(1, c);
        }
        else if (!d.isEven()) d.subTo(m, d);
        d.rShiftTo(1, d);
      }
      if (u.compareTo(v) >= 0) {
        u.subTo(v, u);
        if (ac) a.subTo(c, a);
        b.subTo(d, b);
      }
      else {
        v.subTo(u, v);
        if (ac) c.subTo(a, c);
        d.subTo(b, d);
      }
    }
    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
    if (d.compareTo(m) >= 0) return d.subtract(m);
    if (d.signum() < 0) d.addTo(m, d); else return d;
    if (d.signum() < 0) return d.add(m); else return d;
  }

  var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
  var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

  // (public) test primality with certainty >= 1-.5^t
  function bnIsProbablePrime(t) {
    var i, x = this.abs();
    if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
      for (i = 0; i < lowprimes.length; ++i)
        if (x[0] == lowprimes[i]) return true;
      return false;
    }
    if (x.isEven()) return false;
    i = 1;
    while (i < lowprimes.length) {
      var m = lowprimes[i], j = i + 1;
      while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
      m = x.modInt(m);
      while (i < j) if (m % lowprimes[i++] == 0) return false;
    }
    return x.millerRabin(t);
  }

  // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
  function bnpMillerRabin(t) {
    var n1 = this.subtract(BigInteger.ONE);
    var k = n1.getLowestSetBit();
    if (k <= 0) return false;
    var r = n1.shiftRight(k);
    t = (t + 1) >> 1;
    if (t > lowprimes.length) t = lowprimes.length;
    var a = nbi();
    for (var i = 0; i < t; ++i) {
      //Pick bases at random, instead of starting at 2
      a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
      var y = a.modPow(r, this);
      if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
        var j = 1;
        while (j++ < k && y.compareTo(n1) != 0) {
          y = y.modPowInt(2, this);
          if (y.compareTo(BigInteger.ONE) == 0) return false;
        }
        if (y.compareTo(n1) != 0) return false;
      }
    }
    return true;
  }

  // protected
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.fromNumber = bnpFromNumber;
  BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
  BigInteger.prototype.changeBit = bnpChangeBit;
  BigInteger.prototype.addTo = bnpAddTo;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
  BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
  BigInteger.prototype.modInt = bnpModInt;
  BigInteger.prototype.millerRabin = bnpMillerRabin;

  // public
  BigInteger.prototype.clone = bnClone;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.byteValue = bnByteValue;
  BigInteger.prototype.shortValue = bnShortValue;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.toByteArray = bnToByteArray;
  BigInteger.prototype.equals = bnEquals;
  BigInteger.prototype.min = bnMin;
  BigInteger.prototype.max = bnMax;
  BigInteger.prototype.and = bnAnd;
  BigInteger.prototype.or = bnOr;
  BigInteger.prototype.xor = bnXor;
  BigInteger.prototype.andNot = bnAndNot;
  BigInteger.prototype.not = bnNot;
  BigInteger.prototype.shiftLeft = bnShiftLeft;
  BigInteger.prototype.shiftRight = bnShiftRight;
  BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
  BigInteger.prototype.bitCount = bnBitCount;
  BigInteger.prototype.testBit = bnTestBit;
  BigInteger.prototype.setBit = bnSetBit;
  BigInteger.prototype.clearBit = bnClearBit;
  BigInteger.prototype.flipBit = bnFlipBit;
  BigInteger.prototype.add = bnAdd;
  BigInteger.prototype.subtract = bnSubtract;
  BigInteger.prototype.multiply = bnMultiply;
  BigInteger.prototype.divide = bnDivide;
  BigInteger.prototype.remainder = bnRemainder;
  BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
  BigInteger.prototype.modPow = bnModPow;
  BigInteger.prototype.modInverse = bnModInverse;
  BigInteger.prototype.pow = bnPow;
  BigInteger.prototype.gcd = bnGCD;
  BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

  // JSBN-specific extension
  BigInteger.prototype.square = bnSquare;

  // BigInteger interfaces not implemented in jsbn:

  // BigInteger(int signum, byte[] magnitude)
  // double doubleValue()
  // float floatValue()
  // int hashCode()
  // long longValue()
  // static BigInteger valueOf(long val)

  // prng4.js - uses Arcfour as a PRNG

  function Arcfour() {
    this.i = 0;
    this.j = 0;
    this.S = new Array();
  }

  // Initialize arcfour context from key, an array of ints, each from [0..255]
  function ARC4init(key) {
    var i, j, t;
    for (i = 0; i < 256; ++i)
      this.S[i] = i;
    j = 0;
    for (i = 0; i < 256; ++i) {
      j = (j + this.S[i] + key[i % key.length]) & 255;
      t = this.S[i];
      this.S[i] = this.S[j];
      this.S[j] = t;
    }
    this.i = 0;
    this.j = 0;
  }

  function ARC4next() {
    var t;
    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;
    t = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;
    return this.S[(t + this.S[this.i]) & 255];
  }

  Arcfour.prototype.init = ARC4init;
  Arcfour.prototype.next = ARC4next;

  // Plug in your RNG constructor here
  function prng_newstate() {
    return new Arcfour();
  }

  // Pool size must be a multiple of 4 and greater than 32.
  // An array of bytes the size of the pool will be passed to init()
  var rng_psize = 256;

  // Random number generator - requires a PRNG backend, e.g. prng4.js
  var rng_state;
  var rng_pool;
  var rng_pptr;

  // Initialize the pool with junk if needed.
  if (rng_pool == null) {
    rng_pool = new Array();
    rng_pptr = 0;
    var t;
    if (window.crypto && window.crypto.getRandomValues) {
      // Extract entropy (2048 bits) from RNG if available
      var z = new Uint32Array(256);
      window.crypto.getRandomValues(z);
      for (t = 0; t < z.length; ++t)
        rng_pool[rng_pptr++] = z[t] & 255;
    }
  }

  function rng_get_byte() {
    if (rng_state == null) {
      rng_state = prng_newstate();
      // At this point, we may not have collected enough entropy.  If not, fall back to Math.random
      while (rng_pptr < rng_psize) {
        var random = Math.floor(65536 * Math.random());
        rng_pool[rng_pptr++] = random & 255;
      }
      rng_state.init(rng_pool);
      for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
        rng_pool[rng_pptr] = 0;
      rng_pptr = 0;
    }
    // TODO: allow reseeding after first request
    return rng_state.next();
  }

  function rng_get_bytes(ba) {
    var i;
    for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
  }

  function SecureRandom() { }

  SecureRandom.prototype.nextBytes = rng_get_bytes;

  // Depends on jsbn.js and rng.js

  // Version 1.1: support utf-8 encoding in pkcs1pad2

  // convert a (hex) string to a bignum object
  function parseBigInt(str, r) {
    return new BigInteger(str, r);
  }


  function byte2Hex(b) {
    if (b < 0x10)
      return "0" + b.toString(16);
    else
      return b.toString(16);
  }

  // PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
  function pkcs1pad2(s, n) {
    if (n < s.length + 11) { // TODO: fix for utf-8
      console.error("Message too long for RSA");
      return null;
    }
    var ba = new Array();
    var i = s.length - 1;
    while (i >= 0 && n > 0) {
      var c = s.charCodeAt(i--);
      if (c < 128) { // encode using utf-8
        ba[--n] = c;
      }
      else if ((c > 127) && (c < 2048)) {
        ba[--n] = (c & 63) | 128;
        ba[--n] = (c >> 6) | 192;
      }
      else {
        ba[--n] = (c & 63) | 128;
        ba[--n] = ((c >> 6) & 63) | 128;
        ba[--n] = (c >> 12) | 224;
      }
    }
    ba[--n] = 0;
    var rng = new SecureRandom();
    var x = new Array();
    while (n > 2) { // random non-zero pad
      x[0] = 0;
      while (x[0] == 0) rng.nextBytes(x);
      ba[--n] = x[0];
    }
    ba[--n] = 2;
    ba[--n] = 0;
    return new BigInteger(ba);
  }

  // "empty" RSA key constructor
  function RSAKey() {
    this.n = null;
    this.e = 0;
    this.d = null;
    this.p = null;
    this.q = null;
    this.dmp1 = null;
    this.dmq1 = null;
    this.coeff = null;
  }

  // Set the public key fields N and e from hex strings
  function RSASetPublic(N, E) {
    if (N != null && E != null && N.length > 0 && E.length > 0) {
      this.n = parseBigInt(N, 16);
      this.e = parseInt(E, 16);
    }
    else
      console.error("Invalid RSA public key");
  }

  // Perform raw public operation on "x": return x^e (mod n)
  function RSADoPublic(x) {
    return x.modPowInt(this.e, this.n);
  }

  // Return the PKCS#1 RSA encryption of "text" as an even-length hex string
  function RSAEncrypt(text) {
    var m = pkcs1pad2(text, (this.n.bitLength() + 7) >> 3);
    if (m == null) return null;
    var c = this.doPublic(m);
    if (c == null) return null;
    var h = c.toString(16);
    if ((h.length & 1) == 0) return h; else return "0" + h;
  }

  // Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
  //function RSAEncryptB64(text) {
  //  var h = this.encrypt(text);
  //  if(h) return hex2b64(h); else return null;
  //}

  // protected
  RSAKey.prototype.doPublic = RSADoPublic;

  // public
  RSAKey.prototype.setPublic = RSASetPublic;
  RSAKey.prototype.encrypt = RSAEncrypt;
  //RSAKey.prototype.encrypt_b64 = RSAEncryptB64;


  // Copyright (c) 2011  Kevin M Burns Jr.
  // All Rights Reserved.
  // See "LICENSE" for details.
  //
  // Extension to jsbn which adds facilities for asynchronous RSA key generation
  // Primarily created to avoid execution timeout on mobile devices
  //
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  //
  // ---

  (function () {

    // Generate a new random private key B bits long, using public expt E
    var RSAGenerateAsync = function (B, E, callback) {
      //var rng = new SeededRandom();
      var rng = new SecureRandom();
      var qs = B >> 1;
      this.e = parseInt(E, 16);
      var ee = new BigInteger(E, 16);
      var rsa = this;
      // These functions have non-descript names because they were originally for(;;) loops.
      // I don't know about cryptography to give them better names than loop1-4.
      var loop1 = function () {
        var loop4 = function () {
          if (rsa.p.compareTo(rsa.q) <= 0) {
            var t = rsa.p;
            rsa.p = rsa.q;
            rsa.q = t;
          }
          var p1 = rsa.p.subtract(BigInteger.ONE);
          var q1 = rsa.q.subtract(BigInteger.ONE);
          var phi = p1.multiply(q1);
          if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
            rsa.n = rsa.p.multiply(rsa.q);
            rsa.d = ee.modInverse(phi);
            rsa.dmp1 = rsa.d.mod(p1);
            rsa.dmq1 = rsa.d.mod(q1);
            rsa.coeff = rsa.q.modInverse(rsa.p);
            setTimeout(function () { callback() }, 0); // escape
          } else {
            setTimeout(loop1, 0);
          }
        };
        var loop3 = function () {
          rsa.q = nbi();
          rsa.q.fromNumberAsync(qs, 1, rng, function () {
            rsa.q.subtract(BigInteger.ONE).gcda(ee, function (r) {
              if (r.compareTo(BigInteger.ONE) == 0 && rsa.q.isProbablePrime(10)) {
                setTimeout(loop4, 0);
              } else {
                setTimeout(loop3, 0);
              }
            });
          });
        };
        var loop2 = function () {
          rsa.p = nbi();
          rsa.p.fromNumberAsync(B - qs, 1, rng, function () {
            rsa.p.subtract(BigInteger.ONE).gcda(ee, function (r) {
              if (r.compareTo(BigInteger.ONE) == 0 && rsa.p.isProbablePrime(10)) {
                setTimeout(loop3, 0);
              } else {
                setTimeout(loop2, 0);
              }
            });
          });
        };
        setTimeout(loop2, 0);
      };
      setTimeout(loop1, 0);
    };
    RSAKey.prototype.generateAsync = RSAGenerateAsync;

    // Public API method
    var bnGCDAsync = function (a, callback) {
      var x = (this.s < 0) ? this.negate() : this.clone();
      var y = (a.s < 0) ? a.negate() : a.clone();
      if (x.compareTo(y) < 0) {
        var t = x;
        x = y;
        y = t;
      }
      var i = x.getLowestSetBit(),
        g = y.getLowestSetBit();
      if (g < 0) {
        callback(x);
        return;
      }
      if (i < g) g = i;
      if (g > 0) {
        x.rShiftTo(g, x);
        y.rShiftTo(g, y);
      }
      // Workhorse of the algorithm, gets called 200 - 800 times per 512 bit keygen.
      var gcda1 = function () {
        if ((i = x.getLowestSetBit()) > 0) { x.rShiftTo(i, x); }
        if ((i = y.getLowestSetBit()) > 0) { y.rShiftTo(i, y); }
        if (x.compareTo(y) >= 0) {
          x.subTo(y, x);
          x.rShiftTo(1, x);
        } else {
          y.subTo(x, y);
          y.rShiftTo(1, y);
        }
        if (!(x.signum() > 0)) {
          if (g > 0) y.lShiftTo(g, y);
          setTimeout(function () { callback(y) }, 0); // escape
        } else {
          setTimeout(gcda1, 0);
        }
      };
      setTimeout(gcda1, 10);
    };
    BigInteger.prototype.gcda = bnGCDAsync;

    // (protected) alternate constructor
    var bnpFromNumberAsync = function (a, b, c, callback) {
      if ("number" == typeof b) {
        if (a < 2) {
          this.fromInt(1);
        } else {
          this.fromNumber(a, c);
          if (!this.testBit(a - 1)) {
            this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
          }
          if (this.isEven()) {
            this.dAddOffset(1, 0);
          }
          var bnp = this;
          var bnpfn1 = function () {
            bnp.dAddOffset(2, 0);
            if (bnp.bitLength() > a) bnp.subTo(BigInteger.ONE.shiftLeft(a - 1), bnp);
            if (bnp.isProbablePrime(b)) {
              setTimeout(function () { callback() }, 0); // escape
            } else {
              setTimeout(bnpfn1, 0);
            }
          };
          setTimeout(bnpfn1, 0);
        }
      } else {
        var x = new Array(), t = a & 7;
        x.length = (a >> 3) + 1;
        b.nextBytes(x);
        if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0;
        this.fromString(x, 256);
      }
    };
    BigInteger.prototype.fromNumberAsync = bnpFromNumberAsync;

  })();
  var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var b64pad = "=";

  function hex2b64(h) {
    var i;
    var c;
    var ret = "";
    for (i = 0; i + 3 <= h.length; i += 3) {
      c = parseInt(h.substring(i, i + 3), 16);
      ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
    }
    if (i + 1 == h.length) {
      c = parseInt(h.substring(i, i + 1), 16);
      ret += b64map.charAt(c << 2);
    }
    else if (i + 2 == h.length) {
      c = parseInt(h.substring(i, i + 2), 16);
      ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
    }
    while ((ret.length & 3) > 0) ret += b64pad;
    return ret;
  }

  // convert a base64 string to hex
  function b64tohex(s) {
    var ret = ""
    var i;
    var k = 0; // b64 state, 0-3
    var slop;
    for (i = 0; i < s.length; ++i) {
      if (s.charAt(i) == b64pad) break;
      v = b64map.indexOf(s.charAt(i));
      if (v < 0) continue;
      if (k == 0) {
        ret += int2char(v >> 2);
        slop = v & 3;
        k = 1;
      }
      else if (k == 1) {
        ret += int2char((slop << 2) | (v >> 4));
        slop = v & 0xf;
        k = 2;
      }
      else if (k == 2) {
        ret += int2char(slop);
        ret += int2char(v >> 2);
        slop = v & 3;
        k = 3;
      }
      else {
        ret += int2char((slop << 2) | (v >> 4));
        ret += int2char(v & 0xf);
        k = 0;
      }
    }
    if (k == 1)
      ret += int2char(slop << 2);
    return ret;
  }

  // convert a base64 string to a byte/number array
  function b64toBA(s) {
    //piggyback on b64tohex for now, optimize later
    var h = b64tohex(s);
    var i;
    var a = new Array();
    for (i = 0; 2 * i < h.length; ++i) {
      a[i] = parseInt(h.substring(2 * i, 2 * i + 2), 16);
    }
    return a;
  }

  /*! asn1-1.0.2.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
   */

  var JSX = JSX || {};
  JSX.env = JSX.env || {};

  var L = JSX, OP = Object.prototype, FUNCTION_TOSTRING = '[object Function]', ADD = ["toString", "valueOf"];

  JSX.env.parseUA = function (agent) {

    var numberify = function (s) {
      var c = 0;
      return parseFloat(s.replace(/\./g, function () {
        return (c++ == 1) ? '' : '.';
      }));
    },

      nav = navigator,
      o = {
        ie: 0,
        opera: 0,
        gecko: 0,
        webkit: 0,
        chrome: 0,
        mobile: null,
        air: 0,
        ipad: 0,
        iphone: 0,
        ipod: 0,
        ios: null,
        android: 0,
        webos: 0,
        caja: nav && nav.cajaVersion,
        secure: false,
        os: null

      },

      ua = agent || (navigator && navigator.userAgent),
      loc = window && window.location,
      href = loc && loc.href,
      m;

    o.secure = href && (href.toLowerCase().indexOf("https") === 0);

    if (ua) {

      if ((/windows|win32/i).test(ua)) {
        o.os = 'windows';
      } else if ((/macintosh/i).test(ua)) {
        o.os = 'macintosh';
      } else if ((/rhino/i).test(ua)) {
        o.os = 'rhino';
      }
      if ((/KHTML/).test(ua)) {
        o.webkit = 1;
      }
      m = ua.match(/AppleWebKit\/([^\s]*)/);
      if (m && m[1]) {
        o.webkit = numberify(m[1]);
        if (/ Mobile\//.test(ua)) {
          o.mobile = 'Apple'; // iPhone or iPod Touch
          m = ua.match(/OS ([^\s]*)/);
          if (m && m[1]) {
            m = numberify(m[1].replace('_', '.'));
          }
          o.ios = m;
          o.ipad = o.ipod = o.iphone = 0;
          m = ua.match(/iPad|iPod|iPhone/);
          if (m && m[0]) {
            o[m[0].toLowerCase()] = o.ios;
          }
        } else {
          m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
          if (m) {
            o.mobile = m[0];
          }
          if (/webOS/.test(ua)) {
            o.mobile = 'WebOS';
            m = ua.match(/webOS\/([^\s]*);/);
            if (m && m[1]) {
              o.webos = numberify(m[1]);
            }
          }
          if (/ Android/.test(ua)) {
            o.mobile = 'Android';
            m = ua.match(/Android ([^\s]*);/);
            if (m && m[1]) {
              o.android = numberify(m[1]);
            }
          }
        }
        m = ua.match(/Chrome\/([^\s]*)/);
        if (m && m[1]) {
          o.chrome = numberify(m[1]); // Chrome
        } else {
          m = ua.match(/AdobeAIR\/([^\s]*)/);
          if (m) {
            o.air = m[0]; // Adobe AIR 1.0 or better
          }
        }
      }
      if (!o.webkit) {
        m = ua.match(/Opera[\s\/]([^\s]*)/);
        if (m && m[1]) {
          o.opera = numberify(m[1]);
          m = ua.match(/Version\/([^\s]*)/);
          if (m && m[1]) {
            o.opera = numberify(m[1]); // opera 10+
          }
          m = ua.match(/Opera Mini[^;]*/);
          if (m) {
            o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
          }
        } else { // not opera or webkit
          m = ua.match(/MSIE\s([^;]*)/);
          if (m && m[1]) {
            o.ie = numberify(m[1]);
          } else { // not opera, webkit, or ie
            m = ua.match(/Gecko\/([^\s]*)/);
            if (m) {
              o.gecko = 1; // Gecko detected, look for revision
              m = ua.match(/rv:([^\s\)]*)/);
              if (m && m[1]) {
                o.gecko = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    return o;
  };

  JSX.env.ua = JSX.env.parseUA();

  JSX.isFunction = function (o) {
    return (typeof o === 'function') || OP.toString.apply(o) === FUNCTION_TOSTRING;
  };

  JSX._IEEnumFix = (JSX.env.ua.ie) ? function (r, s) {
    var i, fname, f;
    for (i = 0; i < ADD.length; i = i + 1) {

      fname = ADD[i];
      f = s[fname];

      if (L.isFunction(f) && f != OP[fname]) {
        r[fname] = f;
      }
    }
  } : function () { };

  JSX.extend = function (subc, superc, overrides) {
    if (!superc || !subc) {
      throw new Error("extend failed, please check that " +
        "all dependencies are included.");
    }
    var F = function () { }, i;
    F.prototype = superc.prototype;
    subc.prototype = new F();
    subc.prototype.constructor = subc;
    subc.superclass = superc.prototype;
    if (superc.prototype.constructor == OP.constructor) {
      superc.prototype.constructor = superc;
    }

    if (overrides) {
      for (i in overrides) {
        if (L.hasOwnProperty(overrides, i)) {
          subc.prototype[i] = overrides[i];
        }
      }

      L._IEEnumFix(subc.prototype, overrides);
    }
  };

  /*
   * asn1.js - ASN.1 DER encoder classes
   *
   * Copyright (c) 2013 Kenji Urushima (kenji.urushima@gmail.com)
   *
   * This software is licensed under the terms of the MIT License.
   * http://kjur.github.com/jsrsasign/license
   *
   * The above copyright and license notice shall be 
   * included in all copies or substantial portions of the Software.
   */

  /**
   * @fileOverview
   * @name asn1-1.0.js
   * @author Kenji Urushima kenji.urushima@gmail.com
   * @version 1.0.2 (2013-May-30)
   * @since 2.1
   * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
   */

  /** 
   * kjur's class library name space
   * <p>
   * This name space provides following name spaces:
   * <ul>
   * <li>{@link KJUR.asn1} - ASN.1 primitive hexadecimal encoder</li>
   * <li>{@link KJUR.asn1.x509} - ASN.1 structure for X.509 certificate and CRL</li>
   * <li>{@link KJUR.crypto} - Java Cryptographic Extension(JCE) style MessageDigest/Signature 
   * class and utilities</li>
   * </ul>
   * </p> 
   * NOTE: Please ignore method summary and document of this namespace. This caused by a bug of jsdoc2.
    * @name KJUR
   * @namespace kjur's class library name space
   */
  if (typeof KJUR == "undefined" || !KJUR) KJUR = {};

  /**
   * kjur's ASN.1 class library name space
   * <p>
   * This is ITU-T X.690 ASN.1 DER encoder class library and
   * class structure and methods is very similar to 
   * org.bouncycastle.asn1 package of 
   * well known BouncyCaslte Cryptography Library.
   *
   * <h4>PROVIDING ASN.1 PRIMITIVES</h4>
   * Here are ASN.1 DER primitive classes.
   * <ul>
   * <li>{@link KJUR.asn1.DERBoolean}</li>
   * <li>{@link KJUR.asn1.DERInteger}</li>
   * <li>{@link KJUR.asn1.DERBitString}</li>
   * <li>{@link KJUR.asn1.DEROctetString}</li>
   * <li>{@link KJUR.asn1.DERNull}</li>
   * <li>{@link KJUR.asn1.DERObjectIdentifier}</li>
   * <li>{@link KJUR.asn1.DERUTF8String}</li>
   * <li>{@link KJUR.asn1.DERNumericString}</li>
   * <li>{@link KJUR.asn1.DERPrintableString}</li>
   * <li>{@link KJUR.asn1.DERTeletexString}</li>
   * <li>{@link KJUR.asn1.DERIA5String}</li>
   * <li>{@link KJUR.asn1.DERUTCTime}</li>
   * <li>{@link KJUR.asn1.DERGeneralizedTime}</li>
   * <li>{@link KJUR.asn1.DERSequence}</li>
   * <li>{@link KJUR.asn1.DERSet}</li>
   * </ul>
   *
   * <h4>OTHER ASN.1 CLASSES</h4>
   * <ul>
   * <li>{@link KJUR.asn1.ASN1Object}</li>
   * <li>{@link KJUR.asn1.DERAbstractString}</li>
   * <li>{@link KJUR.asn1.DERAbstractTime}</li>
   * <li>{@link KJUR.asn1.DERAbstractStructured}</li>
   * <li>{@link KJUR.asn1.DERTaggedObject}</li>
   * </ul>
   * </p>
   * NOTE: Please ignore method summary and document of this namespace. This caused by a bug of jsdoc2.
   * @name KJUR.asn1
   * @namespace
   */
  if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) KJUR.asn1 = {};

  /**
   * ASN1 utilities class
   * @name KJUR.asn1.ASN1Util
   * @classs ASN1 utilities class
   * @since asn1 1.0.2
   */
  KJUR.asn1.ASN1Util = new function () {
    this.integerToByteHex = function (i) {
      var h = i.toString(16);
      if ((h.length % 2) == 1) h = '0' + h;
      return h;
    };
    this.bigIntToMinTwosComplementsHex = function (bigIntegerValue) {
      var h = bigIntegerValue.toString(16);
      if (h.substr(0, 1) != '-') {
        if (h.length % 2 == 1) {
          h = '0' + h;
        } else {
          if (!h.match(/^[0-7]/)) {
            h = '00' + h;
          }
        }
      } else {
        var hPos = h.substr(1);
        var xorLen = hPos.length;
        if (xorLen % 2 == 1) {
          xorLen += 1;
        } else {
          if (!h.match(/^[0-7]/)) {
            xorLen += 2;
          }
        }
        var hMask = '';
        for (var i = 0; i < xorLen; i++) {
          hMask += 'f';
        }
        var biMask = new BigInteger(hMask, 16);
        var biNeg = biMask.xor(bigIntegerValue).add(BigInteger.ONE);
        h = biNeg.toString(16).replace(/^-/, '');
      }
      return h;
    };
    /**
     * get PEM string from hexadecimal data and header string
     * @name getPEMStringFromHex
     * @memberOf KJUR.asn1.ASN1Util
     * @function
     * @param {String} dataHex hexadecimal string of PEM body
     * @param {String} pemHeader PEM header string (ex. 'RSA PRIVATE KEY')
     * @return {String} PEM formatted string of input data
     * @description
     * @example
     * var pem  = KJUR.asn1.ASN1Util.getPEMStringFromHex('616161', 'RSA PRIVATE KEY');
     * // value of pem will be:
     * -----BEGIN PRIVATE KEY-----
     * YWFh
     * -----END PRIVATE KEY-----
     */
    this.getPEMStringFromHex = function (dataHex, pemHeader) {
      var dataWA = CryptoJS.enc.Hex.parse(dataHex);
      var dataB64 = CryptoJS.enc.Base64.stringify(dataWA);
      var pemBody = dataB64.replace(/(.{64})/g, "$1\r\n");
      pemBody = pemBody.replace(/\r\n$/, '');
      return "-----BEGIN " + pemHeader + "-----\r\n" +
        pemBody +
        "\r\n-----END " + pemHeader + "-----\r\n";
    };
  };

  // ********************************************************************
  //  Abstract ASN.1 Classes
  // ********************************************************************

  // ********************************************************************

  /**
   * base class for ASN.1 DER encoder object
   * @name KJUR.asn1.ASN1Object
   * @class base class for ASN.1 DER encoder object
   * @property {Boolean} isModified flag whether internal data was changed
   * @property {String} hTLV hexadecimal string of ASN.1 TLV
   * @property {String} hT hexadecimal string of ASN.1 TLV tag(T)
   * @property {String} hL hexadecimal string of ASN.1 TLV length(L)
   * @property {String} hV hexadecimal string of ASN.1 TLV value(V)
   * @description
   */
  KJUR.asn1.ASN1Object = function () {
    var isModified = true;
    var hTLV = null;
    var hT = '00'
    var hL = '00';
    var hV = '';

    /**
     * get hexadecimal ASN.1 TLV length(L) bytes from TLV value(V)
     * @name getLengthHexFromValue
     * @memberOf KJUR.asn1.ASN1Object
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV length(L)
     */
    this.getLengthHexFromValue = function () {
      if (typeof this.hV == "undefined" || this.hV == null) {
        throw "this.hV is null or undefined.";
      }
      if (this.hV.length % 2 == 1) {
        throw "value hex must be even length: n=" + hV.length + ",v=" + this.hV;
      }
      var n = this.hV.length / 2;
      var hN = n.toString(16);
      if (hN.length % 2 == 1) {
        hN = "0" + hN;
      }
      if (n < 128) {
        return hN;
      } else {
        var hNlen = hN.length / 2;
        if (hNlen > 15) {
          throw "ASN.1 length too long to represent by 8x: n = " + n.toString(16);
        }
        var head = 128 + hNlen;
        return head.toString(16) + hN;
      }
    };

    /**
     * get hexadecimal string of ASN.1 TLV bytes
     * @name getEncodedHex
     * @memberOf KJUR.asn1.ASN1Object
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV
     */
    this.getEncodedHex = function () {
      if (this.hTLV == null || this.isModified) {
        this.hV = this.getFreshValueHex();
        this.hL = this.getLengthHexFromValue();
        this.hTLV = this.hT + this.hL + this.hV;
        this.isModified = false;
        //console.error("first time: " + this.hTLV);
      }
      return this.hTLV;
    };

    /**
     * get hexadecimal string of ASN.1 TLV value(V) bytes
     * @name getValueHex
     * @memberOf KJUR.asn1.ASN1Object
     * @function
     * @return {String} hexadecimal string of ASN.1 TLV value(V) bytes
     */
    this.getValueHex = function () {
      this.getEncodedHex();
      return this.hV;
    }

    this.getFreshValueHex = function () {
      return '';
    };
  };

  // == BEGIN DERAbstractString ================================================
  /**
   * base class for ASN.1 DER string classes
   * @name KJUR.asn1.DERAbstractString
   * @class base class for ASN.1 DER string classes
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @property {String} s internal string of value
   * @extends KJUR.asn1.ASN1Object
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>str - specify initial ASN.1 value(V) by a string</li>
   * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERAbstractString = function (params) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var s = null;
    var hV = null;

    /**
     * get string value of this string object
     * @name getString
     * @memberOf KJUR.asn1.DERAbstractString
     * @function
     * @return {String} string value of this string object
     */
    this.getString = function () {
      return this.s;
    };

    /**
     * set value by a string
     * @name setString
     * @memberOf KJUR.asn1.DERAbstractString
     * @function
     * @param {String} newS value by a string to set
     */
    this.setString = function (newS) {
      this.hTLV = null;
      this.isModified = true;
      this.s = newS;
      this.hV = stohex(this.s);
    };

    /**
     * set value by a hexadecimal string
     * @name setStringHex
     * @memberOf KJUR.asn1.DERAbstractString
     * @function
     * @param {String} newHexString value by a hexadecimal string to set
     */
    this.setStringHex = function (newHexString) {
      this.hTLV = null;
      this.isModified = true;
      this.s = null;
      this.hV = newHexString;
    };

    this.getFreshValueHex = function () {
      return this.hV;
    };

    if (typeof params != "undefined") {
      if (typeof params['str'] != "undefined") {
        this.setString(params['str']);
      } else if (typeof params['hex'] != "undefined") {
        this.setStringHex(params['hex']);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERAbstractString, KJUR.asn1.ASN1Object);
  // == END   DERAbstractString ================================================

  // == BEGIN DERAbstractTime ==================================================
  /**
   * base class for ASN.1 DER Generalized/UTCTime class
   * @name KJUR.asn1.DERAbstractTime
   * @class base class for ASN.1 DER Generalized/UTCTime class
   * @param {Array} params associative array of parameters (ex. {'str': '130430235959Z'})
   * @extends KJUR.asn1.ASN1Object
   * @description
   * @see KJUR.asn1.ASN1Object - superclass
   */
  KJUR.asn1.DERAbstractTime = function (params) {
    KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);
    var s = null;
    var date = null;

    // --- PRIVATE METHODS --------------------
    this.localDateToUTC = function (d) {
      utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      var utcDate = new Date(utc);
      return utcDate;
    };

    this.formatDate = function (dateObject, type) {
      var pad = this.zeroPadding;
      var d = this.localDateToUTC(dateObject);
      var year = String(d.getFullYear());
      if (type == 'utc') year = year.substr(2, 2);
      var month = pad(String(d.getMonth() + 1), 2);
      var day = pad(String(d.getDate()), 2);
      var hour = pad(String(d.getHours()), 2);
      var min = pad(String(d.getMinutes()), 2);
      var sec = pad(String(d.getSeconds()), 2);
      return year + month + day + hour + min + sec + 'Z';
    };

    this.zeroPadding = function (s, len) {
      if (s.length >= len) return s;
      return new Array(len - s.length + 1).join('0') + s;
    };

    // --- PUBLIC METHODS --------------------
    /**
     * get string value of this string object
     * @name getString
     * @memberOf KJUR.asn1.DERAbstractTime
     * @function
     * @return {String} string value of this time object
     */
    this.getString = function () {
      return this.s;
    };

    /**
     * set value by a string
     * @name setString
     * @memberOf KJUR.asn1.DERAbstractTime
     * @function
     * @param {String} newS value by a string to set such like "130430235959Z"
     */
    this.setString = function (newS) {
      this.hTLV = null;
      this.isModified = true;
      this.s = newS;
      this.hV = stohex(this.s);
    };

    /**
     * set value by a Date object
     * @name setByDateValue
     * @memberOf KJUR.asn1.DERAbstractTime
     * @function
     * @param {Integer} year year of date (ex. 2013)
     * @param {Integer} month month of date between 1 and 12 (ex. 12)
     * @param {Integer} day day of month
     * @param {Integer} hour hours of date
     * @param {Integer} min minutes of date
     * @param {Integer} sec seconds of date
     */
    this.setByDateValue = function (year, month, day, hour, min, sec) {
      var dateObject = new Date(Date.UTC(year, month - 1, day, hour, min, sec, 0));
      this.setByDate(dateObject);
    };

    this.getFreshValueHex = function () {
      return this.hV;
    };
  };
  JSX.extend(KJUR.asn1.DERAbstractTime, KJUR.asn1.ASN1Object);
  // == END   DERAbstractTime ==================================================

  // == BEGIN DERAbstractStructured ============================================
  /**
   * base class for ASN.1 DER structured class
   * @name KJUR.asn1.DERAbstractStructured
   * @class base class for ASN.1 DER structured class
   * @property {Array} asn1Array internal array of ASN1Object
   * @extends KJUR.asn1.ASN1Object
   * @description
   * @see KJUR.asn1.ASN1Object - superclass
   */
  KJUR.asn1.DERAbstractStructured = function (params) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var asn1Array = null;

    /**
     * set value by array of ASN1Object
     * @name setByASN1ObjectArray
     * @memberOf KJUR.asn1.DERAbstractStructured
     * @function
     * @param {array} asn1ObjectArray array of ASN1Object to set
     */
    this.setByASN1ObjectArray = function (asn1ObjectArray) {
      this.hTLV = null;
      this.isModified = true;
      this.asn1Array = asn1ObjectArray;
    };

    /**
     * append an ASN1Object to internal array
     * @name appendASN1Object
     * @memberOf KJUR.asn1.DERAbstractStructured
     * @function
     * @param {ASN1Object} asn1Object to add
     */
    this.appendASN1Object = function (asn1Object) {
      this.hTLV = null;
      this.isModified = true;
      this.asn1Array.push(asn1Object);
    };

    this.asn1Array = new Array();
    if (typeof params != "undefined") {
      if (typeof params['array'] != "undefined") {
        this.asn1Array = params['array'];
      }
    }
  };
  JSX.extend(KJUR.asn1.DERAbstractStructured, KJUR.asn1.ASN1Object);


  // ********************************************************************
  //  ASN.1 Object Classes
  // ********************************************************************

  // ********************************************************************
  /**
   * class for ASN.1 DER Boolean
   * @name KJUR.asn1.DERBoolean
   * @class class for ASN.1 DER Boolean
   * @extends KJUR.asn1.ASN1Object
   * @description
   * @see KJUR.asn1.ASN1Object - superclass
   */
  KJUR.asn1.DERBoolean = function () {
    KJUR.asn1.DERBoolean.superclass.constructor.call(this);
    this.hT = "01";
    this.hTLV = "0101ff";
  };
  JSX.extend(KJUR.asn1.DERBoolean, KJUR.asn1.ASN1Object);

  // ********************************************************************
  /**
   * class for ASN.1 DER Integer
   * @name KJUR.asn1.DERInteger
   * @class class for ASN.1 DER Integer
   * @extends KJUR.asn1.ASN1Object
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>int - specify initial ASN.1 value(V) by integer value</li>
   * <li>bigint - specify initial ASN.1 value(V) by BigInteger object</li>
   * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERInteger = function (params) {
    KJUR.asn1.DERInteger.superclass.constructor.call(this);
    this.hT = "02";

    /**
     * set value by Tom Wu's BigInteger object
     * @name setByBigInteger
     * @memberOf KJUR.asn1.DERInteger
     * @function
     * @param {BigInteger} bigIntegerValue to set
     */
    this.setByBigInteger = function (bigIntegerValue) {
      this.hTLV = null;
      this.isModified = true;
      this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(bigIntegerValue);
    };

    /**
     * set value by integer value
     * @name setByInteger
     * @memberOf KJUR.asn1.DERInteger
     * @function
     * @param {Integer} integer value to set
     */
    this.setByInteger = function (intValue) {
      var bi = new BigInteger(String(intValue), 10);
      this.setByBigInteger(bi);
    };

    /**
     * set value by integer value
     * @name setValueHex
     * @memberOf KJUR.asn1.DERInteger
     * @function
     * @param {String} hexadecimal string of integer value
     * @description
     * <br/>
     * NOTE: Value shall be represented by minimum octet length of
     * two's complement representation.
     */
    this.setValueHex = function (newHexString) {
      this.hV = newHexString;
    };

    this.getFreshValueHex = function () {
      return this.hV;
    };

    if (typeof params != "undefined") {
      if (typeof params['bigint'] != "undefined") {
        this.setByBigInteger(params['bigint']);
      } else if (typeof params['int'] != "undefined") {
        this.setByInteger(params['int']);
      } else if (typeof params['hex'] != "undefined") {
        this.setValueHex(params['hex']);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERInteger, KJUR.asn1.ASN1Object);

  // ********************************************************************
  /**
   * class for ASN.1 DER encoded BitString primitive
   * @name KJUR.asn1.DERBitString
   * @class class for ASN.1 DER encoded BitString primitive
   * @extends KJUR.asn1.ASN1Object
   * @description 
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>bin - specify binary string (ex. '10111')</li>
   * <li>array - specify array of boolean (ex. [true,false,true,true])</li>
   * <li>hex - specify hexadecimal string of ASN.1 value(V) including unused bits</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERBitString = function (params) {
    KJUR.asn1.DERBitString.superclass.constructor.call(this);
    this.hT = "03";

    /**
     * set ASN.1 value(V) by a hexadecimal string including unused bits
     * @name setHexValueIncludingUnusedBits
     * @memberOf KJUR.asn1.DERBitString
     * @function
     * @param {String} newHexStringIncludingUnusedBits
     */
    this.setHexValueIncludingUnusedBits = function (newHexStringIncludingUnusedBits) {
      this.hTLV = null;
      this.isModified = true;
      this.hV = newHexStringIncludingUnusedBits;
    };

    /**
     * set ASN.1 value(V) by unused bit and hexadecimal string of value
     * @name setUnusedBitsAndHexValue
     * @memberOf KJUR.asn1.DERBitString
     * @function
     * @param {Integer} unusedBits
     * @param {String} hValue
     */
    this.setUnusedBitsAndHexValue = function (unusedBits, hValue) {
      if (unusedBits < 0 || 7 < unusedBits) {
        throw "unused bits shall be from 0 to 7: u = " + unusedBits;
      }
      var hUnusedBits = "0" + unusedBits;
      this.hTLV = null;
      this.isModified = true;
      this.hV = hUnusedBits + hValue;
    };

    /**
     * set ASN.1 DER BitString by binary string
     * @name setByBinaryString
     * @memberOf KJUR.asn1.DERBitString
     * @function
     * @param {String} binaryString binary value string (i.e. '10111')
     * @description
     * Its unused bits will be calculated automatically by length of 
     * 'binaryValue'. <br/>
     * NOTE: Trailing zeros '0' will be ignored.
     */
    this.setByBinaryString = function (binaryString) {
      binaryString = binaryString.replace(/0+$/, '');
      var unusedBits = 8 - binaryString.length % 8;
      if (unusedBits == 8) unusedBits = 0;
      for (var i = 0; i <= unusedBits; i++) {
        binaryString += '0';
      }
      var h = '';
      for (var i = 0; i < binaryString.length - 1; i += 8) {
        var b = binaryString.substr(i, 8);
        var x = parseInt(b, 2).toString(16);
        if (x.length == 1) x = '0' + x;
        h += x;
      }
      this.hTLV = null;
      this.isModified = true;
      this.hV = '0' + unusedBits + h;
    };

    /**
     * set ASN.1 TLV value(V) by an array of boolean
     * @name setByBooleanArray
     * @memberOf KJUR.asn1.DERBitString
     * @function
     * @param {array} booleanArray array of boolean (ex. [true, false, true])
     * @description
     * NOTE: Trailing falses will be ignored.
     */
    this.setByBooleanArray = function (booleanArray) {
      var s = '';
      for (var i = 0; i < booleanArray.length; i++) {
        if (booleanArray[i] == true) {
          s += '1';
        } else {
          s += '0';
        }
      }
      this.setByBinaryString(s);
    };

    /**
     * generate an array of false with specified length
     * @name newFalseArray
     * @memberOf KJUR.asn1.DERBitString
     * @function
     * @param {Integer} nLength length of array to generate
     * @return {array} array of boolean faluse
     * @description
     * This static method may be useful to initialize boolean array.
     */
    this.newFalseArray = function (nLength) {
      var a = new Array(nLength);
      for (var i = 0; i < nLength; i++) {
        a[i] = false;
      }
      return a;
    };

    this.getFreshValueHex = function () {
      return this.hV;
    };

    if (typeof params != "undefined") {
      if (typeof params['hex'] != "undefined") {
        this.setHexValueIncludingUnusedBits(params['hex']);
      } else if (typeof params['bin'] != "undefined") {
        this.setByBinaryString(params['bin']);
      } else if (typeof params['array'] != "undefined") {
        this.setByBooleanArray(params['array']);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERBitString, KJUR.asn1.ASN1Object);

  // ********************************************************************
  /**
   * class for ASN.1 DER OctetString
   * @name KJUR.asn1.DEROctetString
   * @class class for ASN.1 DER OctetString
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @extends KJUR.asn1.DERAbstractString
   * @description
   * @see KJUR.asn1.DERAbstractString - superclass
   */
  KJUR.asn1.DEROctetString = function (params) {
    KJUR.asn1.DEROctetString.superclass.constructor.call(this, params);
    this.hT = "04";
  };
  JSX.extend(KJUR.asn1.DEROctetString, KJUR.asn1.DERAbstractString);

  // ********************************************************************
  /**
   * class for ASN.1 DER Null
   * @name KJUR.asn1.DERNull
   * @class class for ASN.1 DER Null
   * @extends KJUR.asn1.ASN1Object
   * @description
   * @see KJUR.asn1.ASN1Object - superclass
   */
  KJUR.asn1.DERNull = function () {
    KJUR.asn1.DERNull.superclass.constructor.call(this);
    this.hT = "05";
    this.hTLV = "0500";
  };
  JSX.extend(KJUR.asn1.DERNull, KJUR.asn1.ASN1Object);

  // ********************************************************************
  /**
   * class for ASN.1 DER ObjectIdentifier
   * @name KJUR.asn1.DERObjectIdentifier
   * @class class for ASN.1 DER ObjectIdentifier
   * @param {Array} params associative array of parameters (ex. {'oid': '2.5.4.5'})
   * @extends KJUR.asn1.ASN1Object
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>oid - specify initial ASN.1 value(V) by a oid string (ex. 2.5.4.13)</li>
   * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERObjectIdentifier = function (params) {
    var itox = function (i) {
      var h = i.toString(16);
      if (h.length == 1) h = '0' + h;
      return h;
    };
    var roidtox = function (roid) {
      var h = '';
      var bi = new BigInteger(roid, 10);
      var b = bi.toString(2);
      var padLen = 7 - b.length % 7;
      if (padLen == 7) padLen = 0;
      var bPad = '';
      for (var i = 0; i < padLen; i++) bPad += '0';
      b = bPad + b;
      for (var i = 0; i < b.length - 1; i += 7) {
        var b8 = b.substr(i, 7);
        if (i != b.length - 7) b8 = '1' + b8;
        h += itox(parseInt(b8, 2));
      }
      return h;
    }

    KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);
    this.hT = "06";

    /**
     * set value by a hexadecimal string
     * @name setValueHex
     * @memberOf KJUR.asn1.DERObjectIdentifier
     * @function
     * @param {String} newHexString hexadecimal value of OID bytes
     */
    this.setValueHex = function (newHexString) {
      this.hTLV = null;
      this.isModified = true;
      this.s = null;
      this.hV = newHexString;
    };

    /**
     * set value by a OID string
     * @name setValueOidString
     * @memberOf KJUR.asn1.DERObjectIdentifier
     * @function
     * @param {String} oidString OID string (ex. 2.5.4.13)
     */
    this.setValueOidString = function (oidString) {
      if (!oidString.match(/^[0-9.]+$/)) {
        throw "malformed oid string: " + oidString;
      }
      var h = '';
      var a = oidString.split('.');
      var i0 = parseInt(a[0]) * 40 + parseInt(a[1]);
      h += itox(i0);
      a.splice(0, 2);
      for (var i = 0; i < a.length; i++) {
        h += roidtox(a[i]);
      }
      this.hTLV = null;
      this.isModified = true;
      this.s = null;
      this.hV = h;
    };

    /**
     * set value by a OID name
     * @name setValueName
     * @memberOf KJUR.asn1.DERObjectIdentifier
     * @function
     * @param {String} oidName OID name (ex. 'serverAuth')
     * @since 1.0.1
     * @description
     * OID name shall be defined in 'KJUR.asn1.x509.OID.name2oidList'.
     * Otherwise raise error.
     */
    this.setValueName = function (oidName) {
      if (typeof KJUR.asn1.x509.OID.name2oidList[oidName] != "undefined") {
        var oid = KJUR.asn1.x509.OID.name2oidList[oidName];
        this.setValueOidString(oid);
      } else {
        throw "DERObjectIdentifier oidName undefined: " + oidName;
      }
    };

    this.getFreshValueHex = function () {
      return this.hV;
    };

    if (typeof params != "undefined") {
      if (typeof params['oid'] != "undefined") {
        this.setValueOidString(params['oid']);
      } else if (typeof params['hex'] != "undefined") {
        this.setValueHex(params['hex']);
      } else if (typeof params['name'] != "undefined") {
        this.setValueName(params['name']);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERObjectIdentifier, KJUR.asn1.ASN1Object);

  // ********************************************************************
  /**
   * class for ASN.1 DER UTF8String
   * @name KJUR.asn1.DERUTF8String
   * @class class for ASN.1 DER UTF8String
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @extends KJUR.asn1.DERAbstractString
   * @description
   * @see KJUR.asn1.DERAbstractString - superclass
   */
  KJUR.asn1.DERUTF8String = function (params) {
    KJUR.asn1.DERUTF8String.superclass.constructor.call(this, params);
    this.hT = "0c";
  };
  JSX.extend(KJUR.asn1.DERUTF8String, KJUR.asn1.DERAbstractString);

  // ********************************************************************
  /**
   * class for ASN.1 DER NumericString
   * @name KJUR.asn1.DERNumericString
   * @class class for ASN.1 DER NumericString
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @extends KJUR.asn1.DERAbstractString
   * @description
   * @see KJUR.asn1.DERAbstractString - superclass
   */
  KJUR.asn1.DERNumericString = function (params) {
    KJUR.asn1.DERNumericString.superclass.constructor.call(this, params);
    this.hT = "12";
  };
  JSX.extend(KJUR.asn1.DERNumericString, KJUR.asn1.DERAbstractString);

  // ********************************************************************
  /**
   * class for ASN.1 DER PrintableString
   * @name KJUR.asn1.DERPrintableString
   * @class class for ASN.1 DER PrintableString
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @extends KJUR.asn1.DERAbstractString
   * @description
   * @see KJUR.asn1.DERAbstractString - superclass
   */
  KJUR.asn1.DERPrintableString = function (params) {
    KJUR.asn1.DERPrintableString.superclass.constructor.call(this, params);
    this.hT = "13";
  };
  JSX.extend(KJUR.asn1.DERPrintableString, KJUR.asn1.DERAbstractString);

  // ********************************************************************
  /**
   * class for ASN.1 DER TeletexString
   * @name KJUR.asn1.DERTeletexString
   * @class class for ASN.1 DER TeletexString
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @extends KJUR.asn1.DERAbstractString
   * @description
   * @see KJUR.asn1.DERAbstractString - superclass
   */
  KJUR.asn1.DERTeletexString = function (params) {
    KJUR.asn1.DERTeletexString.superclass.constructor.call(this, params);
    this.hT = "14";
  };
  JSX.extend(KJUR.asn1.DERTeletexString, KJUR.asn1.DERAbstractString);

  // ********************************************************************
  /**
   * class for ASN.1 DER IA5String
   * @name KJUR.asn1.DERIA5String
   * @class class for ASN.1 DER IA5String
   * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
   * @extends KJUR.asn1.DERAbstractString
   * @description
   * @see KJUR.asn1.DERAbstractString - superclass
   */
  KJUR.asn1.DERIA5String = function (params) {
    KJUR.asn1.DERIA5String.superclass.constructor.call(this, params);
    this.hT = "16";
  };
  JSX.extend(KJUR.asn1.DERIA5String, KJUR.asn1.DERAbstractString);

  // ********************************************************************
  /**
   * class for ASN.1 DER UTCTime
   * @name KJUR.asn1.DERUTCTime
   * @class class for ASN.1 DER UTCTime
   * @param {Array} params associative array of parameters (ex. {'str': '130430235959Z'})
   * @extends KJUR.asn1.DERAbstractTime
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>str - specify initial ASN.1 value(V) by a string (ex.'130430235959Z')</li>
   * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
   * <li>date - specify Date object.</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   * <h4>EXAMPLES</h4>
   * @example
   * var d1 = new KJUR.asn1.DERUTCTime();
   * d1.setString('130430125959Z');
   *
   * var d2 = new KJUR.asn1.DERUTCTime({'str': '130430125959Z'});
   *
   * var d3 = new KJUR.asn1.DERUTCTime({'date': new Date(Date.UTC(2015, 0, 31, 0, 0, 0, 0))});
   */
  KJUR.asn1.DERUTCTime = function (params) {
    KJUR.asn1.DERUTCTime.superclass.constructor.call(this, params);
    this.hT = "17";

    /**
     * set value by a Date object
     * @name setByDate
     * @memberOf KJUR.asn1.DERUTCTime
     * @function
     * @param {Date} dateObject Date object to set ASN.1 value(V)
     */
    this.setByDate = function (dateObject) {
      this.hTLV = null;
      this.isModified = true;
      this.date = dateObject;
      this.s = this.formatDate(this.date, 'utc');
      this.hV = stohex(this.s);
    };

    if (typeof params != "undefined") {
      if (typeof params['str'] != "undefined") {
        this.setString(params['str']);
      } else if (typeof params['hex'] != "undefined") {
        this.setStringHex(params['hex']);
      } else if (typeof params['date'] != "undefined") {
        this.setByDate(params['date']);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERUTCTime, KJUR.asn1.DERAbstractTime);

  // ********************************************************************
  /**
   * class for ASN.1 DER GeneralizedTime
   * @name KJUR.asn1.DERGeneralizedTime
   * @class class for ASN.1 DER GeneralizedTime
   * @param {Array} params associative array of parameters (ex. {'str': '20130430235959Z'})
   * @extends KJUR.asn1.DERAbstractTime
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>str - specify initial ASN.1 value(V) by a string (ex.'20130430235959Z')</li>
   * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
   * <li>date - specify Date object.</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERGeneralizedTime = function (params) {
    KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this, params);
    this.hT = "18";

    /**
     * set value by a Date object
     * @name setByDate
     * @memberOf KJUR.asn1.DERGeneralizedTime
     * @function
     * @param {Date} dateObject Date object to set ASN.1 value(V)
     * @example
     * When you specify UTC time, use 'Date.UTC' method like this:<br/>
     * var o = new DERUTCTime();
     * var date = new Date(Date.UTC(2015, 0, 31, 23, 59, 59, 0)); #2015JAN31 23:59:59
     * o.setByDate(date);
     */
    this.setByDate = function (dateObject) {
      this.hTLV = null;
      this.isModified = true;
      this.date = dateObject;
      this.s = this.formatDate(this.date, 'gen');
      this.hV = stohex(this.s);
    };

    if (typeof params != "undefined") {
      if (typeof params['str'] != "undefined") {
        this.setString(params['str']);
      } else if (typeof params['hex'] != "undefined") {
        this.setStringHex(params['hex']);
      } else if (typeof params['date'] != "undefined") {
        this.setByDate(params['date']);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERGeneralizedTime, KJUR.asn1.DERAbstractTime);

  // ********************************************************************
  /**
   * class for ASN.1 DER Sequence
   * @name KJUR.asn1.DERSequence
   * @class class for ASN.1 DER Sequence
   * @extends KJUR.asn1.DERAbstractStructured
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>array - specify array of ASN1Object to set elements of content</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERSequence = function (params) {
    KJUR.asn1.DERSequence.superclass.constructor.call(this, params);
    this.hT = "30";
    this.getFreshValueHex = function () {
      var h = '';
      for (var i = 0; i < this.asn1Array.length; i++) {
        var asn1Obj = this.asn1Array[i];
        h += asn1Obj.getEncodedHex();
      }
      this.hV = h;
      return this.hV;
    };
  };
  JSX.extend(KJUR.asn1.DERSequence, KJUR.asn1.DERAbstractStructured);

  // ********************************************************************
  /**
   * class for ASN.1 DER Set
   * @name KJUR.asn1.DERSet
   * @class class for ASN.1 DER Set
   * @extends KJUR.asn1.DERAbstractStructured
   * @description
   * <br/>
   * As for argument 'params' for constructor, you can specify one of
   * following properties:
   * <ul>
   * <li>array - specify array of ASN1Object to set elements of content</li>
   * </ul>
   * NOTE: 'params' can be omitted.
   */
  KJUR.asn1.DERSet = function (params) {
    KJUR.asn1.DERSet.superclass.constructor.call(this, params);
    this.hT = "31";
    this.getFreshValueHex = function () {
      var a = new Array();
      for (var i = 0; i < this.asn1Array.length; i++) {
        var asn1Obj = this.asn1Array[i];
        a.push(asn1Obj.getEncodedHex());
      }
      a.sort();
      this.hV = a.join('');
      return this.hV;
    };
  };
  JSX.extend(KJUR.asn1.DERSet, KJUR.asn1.DERAbstractStructured);

  // ********************************************************************
  /**
   * class for ASN.1 DER TaggedObject
   * @name KJUR.asn1.DERTaggedObject
   * @class class for ASN.1 DER TaggedObject
   * @extends KJUR.asn1.ASN1Object
   * @description
   * <br/>
   * Parameter 'tagNoNex' is ASN.1 tag(T) value for this object.
   * For example, if you find '[1]' tag in a ASN.1 dump, 
   * 'tagNoHex' will be 'a1'.
   * <br/>
   * As for optional argument 'params' for constructor, you can specify *ANY* of
   * following properties:
   * <ul>
   * <li>explicit - specify true if this is explicit tag otherwise false 
   *     (default is 'true').</li>
   * <li>tag - specify tag (default is 'a0' which means [0])</li>
   * <li>obj - specify ASN1Object which is tagged</li>
   * </ul>
   * @example
   * d1 = new KJUR.asn1.DERUTF8String({'str':'a'});
   * d2 = new KJUR.asn1.DERTaggedObject({'obj': d1});
   * hex = d2.getEncodedHex();
   */
  KJUR.asn1.DERTaggedObject = function (params) {
    KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);
    this.hT = "a0";
    this.hV = '';
    this.isExplicit = true;
    this.asn1Object = null;

    /**
     * set value by an ASN1Object
     * @name setString
     * @memberOf KJUR.asn1.DERTaggedObject
     * @function
     * @param {Boolean} isExplicitFlag flag for explicit/implicit tag
     * @param {Integer} tagNoHex hexadecimal string of ASN.1 tag
     * @param {ASN1Object} asn1Object ASN.1 to encapsulate
     */
    this.setASN1Object = function (isExplicitFlag, tagNoHex, asn1Object) {
      this.hT = tagNoHex;
      this.isExplicit = isExplicitFlag;
      this.asn1Object = asn1Object;
      if (this.isExplicit) {
        this.hV = this.asn1Object.getEncodedHex();
        this.hTLV = null;
        this.isModified = true;
      } else {
        this.hV = null;
        this.hTLV = asn1Object.getEncodedHex();
        this.hTLV = this.hTLV.replace(/^../, tagNoHex);
        this.isModified = false;
      }
    };

    this.getFreshValueHex = function () {
      return this.hV;
    };

    if (typeof params != "undefined") {
      if (typeof params['tag'] != "undefined") {
        this.hT = params['tag'];
      }
      if (typeof params['explicit'] != "undefined") {
        this.isExplicit = params['explicit'];
      }
      if (typeof params['obj'] != "undefined") {
        this.asn1Object = params['obj'];
        this.setASN1Object(this.isExplicit, this.hT, this.asn1Object);
      }
    }
  };
  JSX.extend(KJUR.asn1.DERTaggedObject, KJUR.asn1.ASN1Object);
  // Hex JavaScript decoder
  // Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>

  // Permission to use, copy, modify, and/or distribute this software for any
  // purpose with or without fee is hereby granted, provided that the above
  // copyright notice and this permission notice appear in all copies.
  // 
  // THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  // WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  // MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  // ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  // WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  // ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  // OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

  /*jshint browser: true, strict: true, immed: true, latedef: true, undef: true, regexdash: false */
  (function (undefined) {
    "use strict";

    var Hex = {},
      decoder;

    Hex.decode = function (a) {
      var i;
      if (decoder === undefined) {
        var hex = "0123456789ABCDEF",
          ignore = " \f\n\r\t\u00A0\u2028\u2029";
        decoder = [];
        for (i = 0; i < 16; ++i)
          decoder[hex.charAt(i)] = i;
        hex = hex.toLowerCase();
        for (i = 10; i < 16; ++i)
          decoder[hex.charAt(i)] = i;
        for (i = 0; i < ignore.length; ++i)
          decoder[ignore.charAt(i)] = -1;
      }
      var out = [],
        bits = 0,
        char_count = 0;
      for (i = 0; i < a.length; ++i) {
        var c = a.charAt(i);
        if (c == '=')
          break;
        c = decoder[c];
        if (c == -1)
          continue;
        if (c === undefined)
          throw 'Illegal character at offset ' + i;
        bits |= c;
        if (++char_count >= 2) {
          out[out.length] = bits;
          bits = 0;
          char_count = 0;
        } else {
          bits <<= 4;
        }
      }
      if (char_count)
        throw "Hex encoding incomplete: 4 bits missing";
      return out;
    };

    // export globals
    window.Hex = Hex;
  })();
  // Base64 JavaScript decoder
  // Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>

  // Permission to use, copy, modify, and/or distribute this software for any
  // purpose with or without fee is hereby granted, provided that the above
  // copyright notice and this permission notice appear in all copies.
  // 
  // THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  // WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  // MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  // ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  // WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  // ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  // OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

  /*jshint browser: true, strict: true, immed: true, latedef: true, undef: true, regexdash: false */
  (function (undefined) {
    "use strict";

    var Base64 = {},
      decoder;

    Base64.decode = function (a) {
      var i;
      if (decoder === undefined) {
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
          ignore = "= \f\n\r\t\u00A0\u2028\u2029";
        decoder = [];
        for (i = 0; i < 64; ++i)
          decoder[b64.charAt(i)] = i;
        for (i = 0; i < ignore.length; ++i)
          decoder[ignore.charAt(i)] = -1;
      }
      var out = [];
      var bits = 0, char_count = 0;
      for (i = 0; i < a.length; ++i) {
        var c = a.charAt(i);
        if (c == '=')
          break;
        c = decoder[c];
        if (c == -1)
          continue;
        if (c === undefined)
          throw 'Illegal character at offset ' + i;
        bits |= c;
        if (++char_count >= 4) {
          out[out.length] = (bits >> 16);
          out[out.length] = (bits >> 8) & 0xFF;
          out[out.length] = bits & 0xFF;
          bits = 0;
          char_count = 0;
        } else {
          bits <<= 6;
        }
      }
      switch (char_count) {
        case 1:
          throw "Base64 encoding incomplete: at least 2 bits missing";
        case 2:
          out[out.length] = (bits >> 10);
          break;
        case 3:
          out[out.length] = (bits >> 16);
          out[out.length] = (bits >> 8) & 0xFF;
          break;
      }
      return out;
    };

    Base64.re = /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/;
    Base64.unarmor = function (a) {
      var m = Base64.re.exec(a);
      if (m) {
        if (m[1])
          a = m[1];
        else if (m[2])
          a = m[2];
        else
          throw "RegExp out of sync";
      }
      return Base64.decode(a);
    };

    // export globals
    window.Base64 = Base64;
  })();
  // ASN.1 JavaScript decoder
  // Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>

  // Permission to use, copy, modify, and/or distribute this software for any
  // purpose with or without fee is hereby granted, provided that the above
  // copyright notice and this permission notice appear in all copies.
  // 
  // THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  // WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  // MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  // ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  // WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  // ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  // OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

  /*jshint browser: true, strict: true, immed: true, latedef: true, undef: true, regexdash: false */
  /*global oids */
  (function (undefined) {
    "use strict";

    var hardLimit = 100,
      ellipsis = "\u2026",
      DOM = {
        tag: function (tagName, className) {
          var t = document.createElement(tagName);
          t.className = className;
          return t;
        },
        text: function (str) {
          return document.createTextNode(str);
        }
      };

    function Stream(enc, pos) {
      if (enc instanceof Stream) {
        this.enc = enc.enc;
        this.pos = enc.pos;
      } else {
        this.enc = enc;
        this.pos = pos;
      }
    }
    Stream.prototype.get = function (pos) {
      if (pos === undefined)
        pos = this.pos++;
      if (pos >= this.enc.length)
        throw 'Requesting byte offset ' + pos + ' on a stream of length ' + this.enc.length;
      return this.enc[pos];
    };
    Stream.prototype.hexDigits = "0123456789ABCDEF";
    Stream.prototype.hexByte = function (b) {
      return this.hexDigits.charAt((b >> 4) & 0xF) + this.hexDigits.charAt(b & 0xF);
    };
    Stream.prototype.hexDump = function (start, end, raw) {
      var s = "";
      for (var i = start; i < end; ++i) {
        s += this.hexByte(this.get(i));
        if (raw !== true)
          switch (i & 0xF) {
            case 0x7: s += "  "; break;
            case 0xF: s += "\n"; break;
            default: s += " ";
          }
      }
      return s;
    };
    Stream.prototype.parseStringISO = function (start, end) {
      var s = "";
      for (var i = start; i < end; ++i)
        s += String.fromCharCode(this.get(i));
      return s;
    };
    Stream.prototype.parseStringUTF = function (start, end) {
      var s = "";
      for (var i = start; i < end;) {
        var c = this.get(i++);
        if (c < 128)
          s += String.fromCharCode(c);
        else if ((c > 191) && (c < 224))
          s += String.fromCharCode(((c & 0x1F) << 6) | (this.get(i++) & 0x3F));
        else
          s += String.fromCharCode(((c & 0x0F) << 12) | ((this.get(i++) & 0x3F) << 6) | (this.get(i++) & 0x3F));
      }
      return s;
    };
    Stream.prototype.parseStringBMP = function (start, end) {
      var str = ""
      for (var i = start; i < end; i += 2) {
        var high_byte = this.get(i);
        var low_byte = this.get(i + 1);
        str += String.fromCharCode((high_byte << 8) + low_byte);
      }

      return str;
    };
    Stream.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
    Stream.prototype.parseTime = function (start, end) {
      var s = this.parseStringISO(start, end),
        m = this.reTime.exec(s);
      if (!m)
        return "Unrecognized time: " + s;
      s = m[1] + "-" + m[2] + "-" + m[3] + " " + m[4];
      if (m[5]) {
        s += ":" + m[5];
        if (m[6]) {
          s += ":" + m[6];
          if (m[7])
            s += "." + m[7];
        }
      }
      if (m[8]) {
        s += " UTC";
        if (m[8] != 'Z') {
          s += m[8];
          if (m[9])
            s += ":" + m[9];
        }
      }
      return s;
    };
    Stream.prototype.parseInteger = function (start, end) {
      //TODO support negative numbers
      var len = end - start;
      if (len > 4) {
        len <<= 3;
        var s = this.get(start);
        if (s === 0)
          len -= 8;
        else
          while (s < 128) {
            s <<= 1;
            --len;
          }
        return "(" + len + " bit)";
      }
      var n = 0;
      for (var i = start; i < end; ++i)
        n = (n << 8) | this.get(i);
      return n;
    };
    Stream.prototype.parseBitString = function (start, end) {
      var unusedBit = this.get(start),
        lenBit = ((end - start - 1) << 3) - unusedBit,
        s = "(" + lenBit + " bit)";
      if (lenBit <= 20) {
        var skip = unusedBit;
        s += " ";
        for (var i = end - 1; i > start; --i) {
          var b = this.get(i);
          for (var j = skip; j < 8; ++j)
            s += (b >> j) & 1 ? "1" : "0";
          skip = 0;
        }
      }
      return s;
    };
    Stream.prototype.parseOctetString = function (start, end) {
      var len = end - start,
        s = "(" + len + " byte) ";
      if (len > hardLimit)
        end = start + hardLimit;
      for (var i = start; i < end; ++i)
        s += this.hexByte(this.get(i)); //TODO: also try Latin1?
      if (len > hardLimit)
        s += ellipsis;
      return s;
    };
    Stream.prototype.parseOID = function (start, end) {
      var s = '',
        n = 0,
        bits = 0;
      for (var i = start; i < end; ++i) {
        var v = this.get(i);
        n = (n << 7) | (v & 0x7F);
        bits += 7;
        if (!(v & 0x80)) { // finished
          if (s === '') {
            var m = n < 80 ? n < 40 ? 0 : 1 : 2;
            s = m + "." + (n - m * 40);
          } else
            s += "." + ((bits >= 31) ? "bigint" : n);
          n = bits = 0;
        }
      }
      return s;
    };

    function ASN1(stream, header, length, tag, sub) {
      this.stream = stream;
      this.header = header;
      this.length = length;
      this.tag = tag;
      this.sub = sub;
    }
    ASN1.prototype.typeName = function () {
      if (this.tag === undefined)
        return "unknown";
      var tagClass = this.tag >> 6,
        tagConstructed = (this.tag >> 5) & 1,
        tagNumber = this.tag & 0x1F;
      switch (tagClass) {
        case 0: // universal
          switch (tagNumber) {
            case 0x00: return "EOC";
            case 0x01: return "BOOLEAN";
            case 0x02: return "INTEGER";
            case 0x03: return "BIT_STRING";
            case 0x04: return "OCTET_STRING";
            case 0x05: return "NULL";
            case 0x06: return "OBJECT_IDENTIFIER";
            case 0x07: return "ObjectDescriptor";
            case 0x08: return "EXTERNAL";
            case 0x09: return "REAL";
            case 0x0A: return "ENUMERATED";
            case 0x0B: return "EMBEDDED_PDV";
            case 0x0C: return "UTF8String";
            case 0x10: return "SEQUENCE";
            case 0x11: return "SET";
            case 0x12: return "NumericString";
            case 0x13: return "PrintableString"; // ASCII subset
            case 0x14: return "TeletexString"; // aka T61String
            case 0x15: return "VideotexString";
            case 0x16: return "IA5String"; // ASCII
            case 0x17: return "UTCTime";
            case 0x18: return "GeneralizedTime";
            case 0x19: return "GraphicString";
            case 0x1A: return "VisibleString"; // ASCII subset
            case 0x1B: return "GeneralString";
            case 0x1C: return "UniversalString";
            case 0x1E: return "BMPString";
            default: return "Universal_" + tagNumber.toString(16);
          }
        case 1: return "Application_" + tagNumber.toString(16);
        case 2: return "[" + tagNumber + "]"; // Context
        case 3: return "Private_" + tagNumber.toString(16);
      }
    };
    ASN1.prototype.reSeemsASCII = /^[ -~]+$/;
    ASN1.prototype.content = function () {
      if (this.tag === undefined)
        return null;
      var tagClass = this.tag >> 6,
        tagNumber = this.tag & 0x1F,
        content = this.posContent(),
        len = Math.abs(this.length);
      if (tagClass !== 0) { // universal
        if (this.sub !== null)
          return "(" + this.sub.length + " elem)";
        //TODO: TRY TO PARSE ASCII STRING
        var s = this.stream.parseStringISO(content, content + Math.min(len, hardLimit));
        if (this.reSeemsASCII.test(s))
          return s.substring(0, 2 * hardLimit) + ((s.length > 2 * hardLimit) ? ellipsis : "");
        else
          return this.stream.parseOctetString(content, content + len);
      }
      switch (tagNumber) {
        case 0x01: // BOOLEAN
          return (this.stream.get(content) === 0) ? "false" : "true";
        case 0x02: // INTEGER
          return this.stream.parseInteger(content, content + len);
        case 0x03: // BIT_STRING
          return this.sub ? "(" + this.sub.length + " elem)" :
            this.stream.parseBitString(content, content + len);
        case 0x04: // OCTET_STRING
          return this.sub ? "(" + this.sub.length + " elem)" :
            this.stream.parseOctetString(content, content + len);
        //case 0x05: // NULL
        case 0x06: // OBJECT_IDENTIFIER
          return this.stream.parseOID(content, content + len);
        //case 0x07: // ObjectDescriptor
        //case 0x08: // EXTERNAL
        //case 0x09: // REAL
        //case 0x0A: // ENUMERATED
        //case 0x0B: // EMBEDDED_PDV
        case 0x10: // SEQUENCE
        case 0x11: // SET
          return "(" + this.sub.length + " elem)";
        case 0x0C: // UTF8String
          return this.stream.parseStringUTF(content, content + len);
        case 0x12: // NumericString
        case 0x13: // PrintableString
        case 0x14: // TeletexString
        case 0x15: // VideotexString
        case 0x16: // IA5String
        //case 0x19: // GraphicString
        case 0x1A: // VisibleString
          //case 0x1B: // GeneralString
          //case 0x1C: // UniversalString
          return this.stream.parseStringISO(content, content + len);
        case 0x1E: // BMPString
          return this.stream.parseStringBMP(content, content + len);
        case 0x17: // UTCTime
        case 0x18: // GeneralizedTime
          return this.stream.parseTime(content, content + len);
      }
      return null;
    };
    ASN1.prototype.toString = function () {
      return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + ((this.sub === null) ? 'null' : this.sub.length) + "]";
    };
    ASN1.prototype.print = function (indent) {
      if (indent === undefined) indent = '';
      document.writeln(indent + this);
      if (this.sub !== null) {
        indent += '  ';
        for (var i = 0, max = this.sub.length; i < max; ++i)
          this.sub[i].print(indent);
      }
    };
    ASN1.prototype.toPrettyString = function (indent) {
      if (indent === undefined) indent = '';
      var s = indent + this.typeName() + " @" + this.stream.pos;
      if (this.length >= 0)
        s += "+";
      s += this.length;
      if (this.tag & 0x20)
        s += " (constructed)";
      else if (((this.tag == 0x03) || (this.tag == 0x04)) && (this.sub !== null))
        s += " (encapsulates)";
      s += "\n";
      if (this.sub !== null) {
        indent += '  ';
        for (var i = 0, max = this.sub.length; i < max; ++i)
          s += this.sub[i].toPrettyString(indent);
      }
      return s;
    };
    ASN1.prototype.toDOM = function () {
      var node = DOM.tag("div", "node");
      node.asn1 = this;
      var head = DOM.tag("div", "head");
      var s = this.typeName().replace(/_/g, " ");
      head.innerHTML = s;
      var content = this.content();
      if (content !== null) {
        content = String(content).replace(/</g, "&lt;");
        var preview = DOM.tag("span", "preview");
        preview.appendChild(DOM.text(content));
        head.appendChild(preview);
      }
      node.appendChild(head);
      this.node = node;
      this.head = head;
      var value = DOM.tag("div", "value");
      s = "Offset: " + this.stream.pos + "<br/>";
      s += "Length: " + this.header + "+";
      if (this.length >= 0)
        s += this.length;
      else
        s += (-this.length) + " (undefined)";
      if (this.tag & 0x20)
        s += "<br/>(constructed)";
      else if (((this.tag == 0x03) || (this.tag == 0x04)) && (this.sub !== null))
        s += "<br/>(encapsulates)";
      //TODO if (this.tag == 0x03) s += "Unused bits: "
      if (content !== null) {
        s += "<br/>Value:<br/><b>" + content + "</b>";
        if ((typeof oids === 'object') && (this.tag == 0x06)) {
          var oid = oids[content];
          if (oid) {
            if (oid.d) s += "<br/>" + oid.d;
            if (oid.c) s += "<br/>" + oid.c;
            if (oid.w) s += "<br/>(warning!)";
          }
        }
      }
      value.innerHTML = s;
      node.appendChild(value);
      var sub = DOM.tag("div", "sub");
      if (this.sub !== null) {
        for (var i = 0, max = this.sub.length; i < max; ++i)
          sub.appendChild(this.sub[i].toDOM());
      }
      node.appendChild(sub);
      head.onclick = function () {
        node.className = (node.className == "node collapsed") ? "node" : "node collapsed";
      };
      return node;
    };
    ASN1.prototype.posStart = function () {
      return this.stream.pos;
    };
    ASN1.prototype.posContent = function () {
      return this.stream.pos + this.header;
    };
    ASN1.prototype.posEnd = function () {
      return this.stream.pos + this.header + Math.abs(this.length);
    };
    ASN1.prototype.fakeHover = function (current) {
      this.node.className += " hover";
      if (current)
        this.head.className += " hover";
    };
    ASN1.prototype.fakeOut = function (current) {
      var re = / ?hover/;
      this.node.className = this.node.className.replace(re, "");
      if (current)
        this.head.className = this.head.className.replace(re, "");
    };
    ASN1.prototype.toHexDOM_sub = function (node, className, stream, start, end) {
      if (start >= end)
        return;
      var sub = DOM.tag("span", className);
      sub.appendChild(DOM.text(
        stream.hexDump(start, end)));
      node.appendChild(sub);
    };
    ASN1.prototype.toHexDOM = function (root) {
      var node = DOM.tag("span", "hex");
      if (root === undefined) root = node;
      this.head.hexNode = node;
      this.head.onmouseover = function () { this.hexNode.className = "hexCurrent"; };
      this.head.onmouseout = function () { this.hexNode.className = "hex"; };
      node.asn1 = this;
      node.onmouseover = function () {
        var current = !root.selected;
        if (current) {
          root.selected = this.asn1;
          this.className = "hexCurrent";
        }
        this.asn1.fakeHover(current);
      };
      node.onmouseout = function () {
        var current = (root.selected == this.asn1);
        this.asn1.fakeOut(current);
        if (current) {
          root.selected = null;
          this.className = "hex";
        }
      };
      this.toHexDOM_sub(node, "tag", this.stream, this.posStart(), this.posStart() + 1);
      this.toHexDOM_sub(node, (this.length >= 0) ? "dlen" : "ulen", this.stream, this.posStart() + 1, this.posContent());
      if (this.sub === null)
        node.appendChild(DOM.text(
          this.stream.hexDump(this.posContent(), this.posEnd())));
      else if (this.sub.length > 0) {
        var first = this.sub[0];
        var last = this.sub[this.sub.length - 1];
        this.toHexDOM_sub(node, "intro", this.stream, this.posContent(), first.posStart());
        for (var i = 0, max = this.sub.length; i < max; ++i)
          node.appendChild(this.sub[i].toHexDOM(root));
        this.toHexDOM_sub(node, "outro", this.stream, last.posEnd(), this.posEnd());
      }
      return node;
    };
    ASN1.prototype.toHexString = function (root) {
      return this.stream.hexDump(this.posStart(), this.posEnd(), true);
    };
    ASN1.decodeLength = function (stream) {
      var buf = stream.get(),
        len = buf & 0x7F;
      if (len == buf)
        return len;
      if (len > 3)
        throw "Length over 24 bits not supported at position " + (stream.pos - 1);
      if (len === 0)
        return -1; // undefined
      buf = 0;
      for (var i = 0; i < len; ++i)
        buf = (buf << 8) | stream.get();
      return buf;
    };
    ASN1.hasContent = function (tag, len, stream) {
      if (tag & 0x20) // constructed
        return true;
      if ((tag < 0x03) || (tag > 0x04))
        return false;
      var p = new Stream(stream);
      if (tag == 0x03) p.get(); // BitString unused bits, must be in [0, 7]
      var subTag = p.get();
      if ((subTag >> 6) & 0x01) // not (universal or context)
        return false;
      try {
        var subLength = ASN1.decodeLength(p);
        return ((p.pos - stream.pos) + subLength == len);
      } catch (exception) {
        return false;
      }
    };
    ASN1.decode = function (stream) {
      if (!(stream instanceof Stream))
        stream = new Stream(stream, 0);
      var streamStart = new Stream(stream),
        tag = stream.get(),
        len = ASN1.decodeLength(stream),
        header = stream.pos - streamStart.pos,
        sub = null;
      if (ASN1.hasContent(tag, len, stream)) {
        // it has content, so we decode it
        var start = stream.pos;
        if (tag == 0x03) stream.get(); // skip BitString unused bits, must be in [0, 7]
        sub = [];
        if (len >= 0) {
          // definite length
          var end = start + len;
          while (stream.pos < end)
            sub[sub.length] = ASN1.decode(stream);
          if (stream.pos != end)
            throw "Content size is not correct for container starting at offset " + start;
        } else {
          // undefined length
          try {
            for (; ;) {
              var s = ASN1.decode(stream);
              if (s.tag === 0)
                break;
              sub[sub.length] = s;
            }
            len = start - stream.pos;
          } catch (e) {
            throw "Exception while decoding undefined length content: " + e;
          }
        }
      } else
        stream.pos += len; // skip content
      return new ASN1(streamStart, header, len, tag, sub);
    };
    ASN1.test = function () {
      var test = [
        { value: [0x27], expected: 0x27 },
        { value: [0x81, 0xC9], expected: 0xC9 },
        { value: [0x83, 0xFE, 0xDC, 0xBA], expected: 0xFEDCBA }
      ];
      for (var i = 0, max = test.length; i < max; ++i) {
        var pos = 0,
          stream = new Stream(test[i].value, 0),
          res = ASN1.decodeLength(stream);
        if (res != test[i].expected)
          document.write("In test[" + i + "] expected " + test[i].expected + " got " + res + "\n");
      }
    };

    // export globals
    window.ASN1 = ASN1;
  })();
  /**
   * Retrieve the hexadecimal value (as a string) of the current ASN.1 element
   * @returns {string}
   * @public
   */
  ASN1.prototype.getHexStringValue = function () {
    var hexString = this.toHexString();
    var offset = this.header * 2;
    var length = this.length * 2;
    return hexString.substr(offset, length);
  };

  /**
   * Method to parse a pem encoded string containing both a public or private key.
   * The method will translate the pem encoded string in a der encoded string and
   * will parse private key and public key parameters. This method accepts public key
   * in the rsaencryption pkcs #1 format (oid: 1.2.840.113549.1.1.1).
   *
   * @todo Check how many rsa formats use the same format of pkcs #1.
   *
   * The format is defined as:
   * PublicKeyInfo ::= SEQUENCE {
   *   algorithm       AlgorithmIdentifier,
   *   PublicKey       BIT STRING
   * }
   * Where AlgorithmIdentifier is:
   * AlgorithmIdentifier ::= SEQUENCE {
   *   algorithm       OBJECT IDENTIFIER,     the OID of the enc algorithm
   *   parameters      ANY DEFINED BY algorithm OPTIONAL (NULL for PKCS #1)
   * }
   * and PublicKey is a SEQUENCE encapsulated in a BIT STRING
   * RSAPublicKey ::= SEQUENCE {
   *   modulus           INTEGER,  -- n
   *   publicExponent    INTEGER   -- e
   * }
   * it's possible to examine the structure of the keys obtained from openssl using
   * an asn.1 dumper as the one used here to parse the components: http://lapo.it/asn1js/
   * @argument {string} pem the pem encoded string, can include the BEGIN/END header/footer
   * @private
   */
  RSAKey.prototype.parseKey = function (pem) {
    try {
      var modulus = 0;
      var public_exponent = 0;
      var reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
      var der = reHex.test(pem) ? Hex.decode(pem) : Base64.unarmor(pem);
      var asn1 = ASN1.decode(der);

      //Fixes a bug with OpenSSL 1.0+ private keys
      if (asn1.sub.length === 3) {
        asn1 = asn1.sub[2].sub[0];
      }
      if (asn1.sub.length === 9) {

        // Parse the private key.
        modulus = asn1.sub[1].getHexStringValue(); //bigint
        this.n = parseBigInt(modulus, 16);

        public_exponent = asn1.sub[2].getHexStringValue(); //int
        this.e = parseInt(public_exponent, 16);

        var private_exponent = asn1.sub[3].getHexStringValue(); //bigint
        this.d = parseBigInt(private_exponent, 16);

        var prime1 = asn1.sub[4].getHexStringValue(); //bigint
        this.p = parseBigInt(prime1, 16);

        var prime2 = asn1.sub[5].getHexStringValue(); //bigint
        this.q = parseBigInt(prime2, 16);

        var exponent1 = asn1.sub[6].getHexStringValue(); //bigint
        this.dmp1 = parseBigInt(exponent1, 16);

        var exponent2 = asn1.sub[7].getHexStringValue(); //bigint
        this.dmq1 = parseBigInt(exponent2, 16);

        var coefficient = asn1.sub[8].getHexStringValue(); //bigint
        this.coeff = parseBigInt(coefficient, 16);

      }
      else if (asn1.sub.length === 2) {

        // Parse the public key.
        var bit_string = asn1.sub[1];
        var sequence = bit_string.sub[0];

        modulus = sequence.sub[0].getHexStringValue();
        this.n = parseBigInt(modulus, 16);
        public_exponent = sequence.sub[1].getHexStringValue();
        this.e = parseInt(public_exponent, 16);

      }
      else {
        return false;
      }
      return true;
    }
    catch (ex) {
      return false;
    }
  };

  /**
   * Translate rsa parameters in a hex encoded string representing the rsa key.
   *
   * The translation follow the ASN.1 notation :
   * RSAPrivateKey ::= SEQUENCE {
   *   version           Version,
   *   modulus           INTEGER,  -- n
   *   publicExponent    INTEGER,  -- e
   *   privateExponent   INTEGER,  -- d
   *   prime1            INTEGER,  -- p
   *   prime2            INTEGER,  -- q
   *   exponent1         INTEGER,  -- d mod (p1)
   *   exponent2         INTEGER,  -- d mod (q-1)
   *   coefficient       INTEGER,  -- (inverse of q) mod p
   * }
   * @returns {string}  DER Encoded String representing the rsa private key
   * @private
   */
  RSAKey.prototype.getPrivateBaseKey = function () {
    var options = {
      'array': [
        new KJUR.asn1.DERInteger({ 'int': 0 }),
        new KJUR.asn1.DERInteger({ 'bigint': this.n }),
        new KJUR.asn1.DERInteger({ 'int': this.e }),
        new KJUR.asn1.DERInteger({ 'bigint': this.d }),
        new KJUR.asn1.DERInteger({ 'bigint': this.p }),
        new KJUR.asn1.DERInteger({ 'bigint': this.q }),
        new KJUR.asn1.DERInteger({ 'bigint': this.dmp1 }),
        new KJUR.asn1.DERInteger({ 'bigint': this.dmq1 }),
        new KJUR.asn1.DERInteger({ 'bigint': this.coeff })
      ]
    };
    var seq = new KJUR.asn1.DERSequence(options);
    return seq.getEncodedHex();
  };

  /**
   * base64 (pem) encoded version of the DER encoded representation
   * @returns {string} pem encoded representation without header and footer
   * @public
   */
  RSAKey.prototype.getPrivateBaseKeyB64 = function () {
    return hex2b64(this.getPrivateBaseKey());
  };

  /**
   * Translate rsa parameters in a hex encoded string representing the rsa public key.
   * The representation follow the ASN.1 notation :
   * PublicKeyInfo ::= SEQUENCE {
   *   algorithm       AlgorithmIdentifier,
   *   PublicKey       BIT STRING
   * }
   * Where AlgorithmIdentifier is:
   * AlgorithmIdentifier ::= SEQUENCE {
   *   algorithm       OBJECT IDENTIFIER,     the OID of the enc algorithm
   *   parameters      ANY DEFINED BY algorithm OPTIONAL (NULL for PKCS #1)
   * }
   * and PublicKey is a SEQUENCE encapsulated in a BIT STRING
   * RSAPublicKey ::= SEQUENCE {
   *   modulus           INTEGER,  -- n
   *   publicExponent    INTEGER   -- e
   * }
   * @returns {string} DER Encoded String representing the rsa public key
   * @private
   */
  RSAKey.prototype.getPublicBaseKey = function () {
    var options = {
      'array': [
        new KJUR.asn1.DERObjectIdentifier({ 'oid': '1.2.840.113549.1.1.1' }), //RSA Encryption pkcs #1 oid
        new KJUR.asn1.DERNull()
      ]
    };
    var first_sequence = new KJUR.asn1.DERSequence(options);

    options = {
      'array': [
        new KJUR.asn1.DERInteger({ 'bigint': this.n }),
        new KJUR.asn1.DERInteger({ 'int': this.e })
      ]
    };
    var second_sequence = new KJUR.asn1.DERSequence(options);

    options = {
      'hex': '00' + second_sequence.getEncodedHex()
    };
    var bit_string = new KJUR.asn1.DERBitString(options);

    options = {
      'array': [
        first_sequence,
        bit_string
      ]
    };
    var seq = new KJUR.asn1.DERSequence(options);
    return seq.getEncodedHex();
  };

  /**
   * base64 (pem) encoded version of the DER encoded representation
   * @returns {string} pem encoded representation without header and footer
   * @public
   */
  RSAKey.prototype.getPublicBaseKeyB64 = function () {
    return hex2b64(this.getPublicBaseKey());
  };

  /**
   * wrap the string in block of width chars. The default value for rsa keys is 64
   * characters.
   * @param {string} str the pem encoded string without header and footer
   * @param {Number} [width=64] - the length the string has to be wrapped at
   * @returns {string}
   * @private
   */
  RSAKey.prototype.wordwrap = function (str, width) {
    width = width || 64;
    if (!str) {
      return str;
    }
    var regex = '(.{1,' + width + '})( +|$\n?)|(.{1,' + width + '})';
    return str.match(RegExp(regex, 'g')).join('\n');
  };

  /**
   * Retrieve the pem encoded private key
   * @returns {string} the pem encoded private key with header/footer
   * @public
   */
  RSAKey.prototype.getPrivateKey = function () {
    var key = "-----BEGIN RSA PRIVATE KEY-----\n";
    key += this.wordwrap(this.getPrivateBaseKeyB64()) + "\n";
    key += "-----END RSA PRIVATE KEY-----";
    return key;
  };

  /**
   * Retrieve the pem encoded public key
   * @returns {string} the pem encoded public key with header/footer
   * @public
   */
  RSAKey.prototype.getPublicKey = function () {
    var key = "-----BEGIN PUBLIC KEY-----\n";
    key += this.wordwrap(this.getPublicBaseKeyB64()) + "\n";
    key += "-----END PUBLIC KEY-----";
    return key;
  };

  /**
   * Check if the object contains the necessary parameters to populate the rsa modulus
   * and public exponent parameters.
   * @param {Object} [obj={}] - An object that may contain the two public key
   * parameters
   * @returns {boolean} true if the object contains both the modulus and the public exponent
   * properties (n and e)
   * @todo check for types of n and e. N should be a parseable bigInt object, E should
   * be a parseable integer number
   * @private
   */
  RSAKey.prototype.hasPublicKeyProperty = function (obj) {
    obj = obj || {};
    return (
      obj.hasOwnProperty('n') &&
      obj.hasOwnProperty('e')
    );
  };

  /**
   * Check if the object contains ALL the parameters of an RSA key.
   * @param {Object} [obj={}] - An object that may contain nine rsa key
   * parameters
   * @returns {boolean} true if the object contains all the parameters needed
   * @todo check for types of the parameters all the parameters but the public exponent
   * should be parseable bigint objects, the public exponent should be a parseable integer number
   * @private
   */
  RSAKey.prototype.hasPrivateKeyProperty = function (obj) {
    obj = obj || {};
    return (
      obj.hasOwnProperty('n') &&
      obj.hasOwnProperty('e') &&
      obj.hasOwnProperty('d') &&
      obj.hasOwnProperty('p') &&
      obj.hasOwnProperty('q') &&
      obj.hasOwnProperty('dmp1') &&
      obj.hasOwnProperty('dmq1') &&
      obj.hasOwnProperty('coeff')
    );
  };

  /**
   * Parse the properties of obj in the current rsa object. Obj should AT LEAST
   * include the modulus and public exponent (n, e) parameters.
   * @param {Object} obj - the object containing rsa parameters
   * @private
   */
  RSAKey.prototype.parsePropertiesFrom = function (obj) {
    this.n = obj.n;
    this.e = obj.e;

    if (obj.hasOwnProperty('d')) {
      this.d = obj.d;
      this.p = obj.p;
      this.q = obj.q;
      this.dmp1 = obj.dmp1;
      this.dmq1 = obj.dmq1;
      this.coeff = obj.coeff;
    }
  };

  /**
   * Create a new JSEncryptRSAKey that extends Tom Wu's RSA key object.
   * This object is just a decorator for parsing the key parameter
   * @param {string|Object} key - The key in string format, or an object containing
   * the parameters needed to build a RSAKey object.
   * @constructor
   */
  var JSEncryptRSAKey = function (key) {
    // Call the super constructor.
    RSAKey.call(this);
    // If a key key was provided.
    if (key) {
      // If this is a string...
      if (typeof key === 'string') {
        this.parseKey(key);
      }
      else if (
        this.hasPrivateKeyProperty(key) ||
        this.hasPublicKeyProperty(key)
      ) {
        // Set the values for the key.
        this.parsePropertiesFrom(key);
      }
    }
  };

  // Derive from RSAKey.
  JSEncryptRSAKey.prototype = new RSAKey();

  // Reset the contructor.
  JSEncryptRSAKey.prototype.constructor = JSEncryptRSAKey;


  /**
   *
   * @param {Object} [options = {}] - An object to customize JSEncrypt behaviour
   * possible parameters are:
   * - default_key_size        {number}  default: 1024 the key size in bit
   * - default_public_exponent {string}  default: '010001' the hexadecimal representation of the public exponent
   * - log                     {boolean} default: false whether log warn/error or not
   * @constructor
   */
  var JSEncrypt = function (options) {
    options = options || {};
    this.default_key_size = parseInt(options.default_key_size) || 1024;
    this.default_public_exponent = options.default_public_exponent || '010001'; //65537 default openssl public exponent for rsa key type
    this.log = options.log || false;
    // The private and public key.
    this.key = null;
  };

  /**
   * Method to set the rsa key parameter (one method is enough to set both the public
   * and the private key, since the private key contains the public key paramenters)
   * Log a warning if logs are enabled
   * @param {Object|string} key the pem encoded string or an object (with or without header/footer)
   * @public
   */
  JSEncrypt.prototype.setKey = function (key) {
    if (this.log && this.key) {
      console.warn('A key was already set, overriding existing.');
    }
    this.key = new JSEncryptRSAKey(key);
  };

  /**
   * Proxy method for setKey, for api compatibility
   * @see setKey
   * @public
   */
  JSEncrypt.prototype.setPrivateKey = function (privkey) {
    // Create the key.
    this.setKey(privkey);
  };

  /**
   * Proxy method for setKey, for api compatibility
   * @see setKey
   * @public
   */
  JSEncrypt.prototype.setPublicKey = function (pubkey) {
    // Sets the public key.
    this.setKey(pubkey);
  };

  /**
   * Proxy method for RSAKey object's decrypt, decrypt the string using the private
   * components of the rsa key object. Note that if the object was not set will be created
   * on the fly (by the getKey method) using the parameters passed in the JSEncrypt constructor
   * @param {string} string base64 encoded crypted string to decrypt
   * @return {string} the decrypted string
   * @public
   */
  JSEncrypt.prototype.decrypt = function (string) {
    // Return the decrypted string.
    try {
      return this.getKey().decrypt(b64tohex(string));
    }
    catch (ex) {
      return false;
    }
  };

  /**
   * Proxy method for RSAKey object's encrypt, encrypt the string using the public
   * components of the rsa key object. Note that if the object was not set will be created
   * on the fly (by the getKey method) using the parameters passed in the JSEncrypt constructor
   * @param {string} string the string to encrypt
   * @return {string} the encrypted string encoded in base64
   * @public
   */
  JSEncrypt.prototype.encrypt = function (string) {
    // Return the encrypted string.
    try {
      return hex2b64(this.getKey().encrypt(string));
    }
    catch (ex) {
      return false;
    }
  };

  /**
   * Getter for the current JSEncryptRSAKey object. If it doesn't exists a new object
   * will be created and returned
   * @param {callback} [cb] the callback to be called if we want the key to be generated
   * in an async fashion
   * @returns {JSEncryptRSAKey} the JSEncryptRSAKey object
   * @public
   */
  JSEncrypt.prototype.getKey = function (cb) {
    // Only create new if it does not exist.
    if (!this.key) {
      // Get a new private key.
      this.key = new JSEncryptRSAKey();
      if (cb && {}.toString.call(cb) === '[object Function]') {
        this.key.generateAsync(this.default_key_size, this.default_public_exponent, cb);
        return;
      }
      // Generate the key.
      this.key.generate(this.default_key_size, this.default_public_exponent);
    }
    return this.key;
  };

  /**
   * Returns the pem encoded representation of the private key
   * If the key doesn't exists a new key will be created
   * @returns {string} pem encoded representation of the private key WITH header and footer
   * @public
   */
  JSEncrypt.prototype.getPrivateKey = function () {
    // Return the private representation of this key.
    return this.getKey().getPrivateKey();
  };

  /**
   * Returns the pem encoded representation of the private key
   * If the key doesn't exists a new key will be created
   * @returns {string} pem encoded representation of the private key WITHOUT header and footer
   * @public
   */
  JSEncrypt.prototype.getPrivateKeyB64 = function () {
    // Return the private representation of this key.
    return this.getKey().getPrivateBaseKeyB64();
  };


  /**
   * Returns the pem encoded representation of the public key
   * If the key doesn't exists a new key will be created
   * @returns {string} pem encoded representation of the public key WITH header and footer
   * @public
   */
  JSEncrypt.prototype.getPublicKey = function () {
    // Return the private representation of this key.
    return this.getKey().getPublicKey();
  };

  /**
   * Returns the pem encoded representation of the public key
   * If the key doesn't exists a new key will be created
   * @returns {string} pem encoded representation of the public key WITHOUT header and footer
   * @public
   */
  JSEncrypt.prototype.getPublicKeyB64 = function () {
    // Return the private representation of this key.
    return this.getKey().getPublicBaseKeyB64();
  };


  JSEncrypt.version = '2.3.1';
  exports.JSEncrypt = JSEncrypt;
});

(function (_setHandler, _get) {
  var HandlerMap = {
    dft: {
      fn: Logger.createDefaultHandler()
    }
  };
  Logger.get = function (name) {
    var tmp = _get.apply(Logger, [name]);
    tmp.setHandler = function (fn) {
      var name = this.context.name;
      HandlerMap[name] = {
        fn: fn
      };
    };
    return tmp;
  };
  Logger.setHandler = function (fn) {
    _setHandler(function (messages, context) {
      var handler = HandlerMap[context.name || 'dft'];
      if (handler) {
        handler.fn.apply(handler, arguments);
      }
    });
  };
  Logger.useDefaults({
    defaultLevel: Logger.OFF
  });

  Logger.out = {};
})(Logger.setHandler, Logger.get);

(function (factory, root) {
  var f = document.createElement('frame');
  document.documentElement.appendChild(f);
  var cw = f.contentWindow;
  root.tima = factory.apply(cw, [root, Authentication, CryptoJS, JSEncrypt, eval]);
  f.remove();
  root = factory = cw = f = undefined;
})(function (root, Authentication, CryptoJS, JSEncrypt, evalfn) {
  "use strict";
  var PARAMS = [
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfSoSMqE03feQ35DQo4yMTiAE4jhZCnr3m6BNiHVEYrF7w4eYOInu8eOkj3SxO8Dxv1IfUkzeLcuqy7EzTv/gLfJL4GbWSCqSrZdzdl6Kvpr9rDccSIgAs1xh7ecKnRq7CaTjo2zqOFsZuYxAh8OZ5PXVOTbnRNbQ02tGQkzU2JQIDAQAB",
    [
      "c1l7H7BRSibBQBCJ8vI0tg2bZiR7SuV6AN46J6Iqwa1EFDyvcGtXXTSVLf37TucCVtPnOmeRezy/FX4pbzbhXky2r6fZkFfuUIWJAG9F1/SeLJ+Ty5lVKjfZEJL6BRBmeYjTz6FKQwWQQOhnUjMXyfugJfBUmL+PEu1GP0J/cAk=",
      "eyJKTEpEWF9RMjEiOnsidHlwZSI6IkpMSkRYX1EyMSIsImlzNGsiOnRydWUsInAxMDgwIjp0cnVlfSwiUTIxQV9qbGpkeCI6eyJ0eXBlIjoiUTIxQV9qbGpkeCIsImlzNGsiOnRydWUsInAxMDgwIjp0cnVlfSwidmVyc2lvbiI6InYyMDE4MTAxMDE4MDMifQ=="
    ], [
      "uAq8Ril55Hq/264of23MJkrZtzDRNVvpouYekKkp2D6ICdZL+oPH4Wo044HyVtuce+D9g40fbJYARo1R3v4QF5+/ubrKHUIS1IL1Fw2WyzY0DyOkV2f5hFiXv/7K8QhTxt3KS/Q2hSxM/KPlGzYxHDEw4y8D4EO0TXnvVmUxSYk=",
      "W1siZ2FsYXh5IiwiVXNlcklEIiwiRVBHRG9tYWluIiwidXNlckdyb3VwSW5mbyIsIlNUQklEIiwiU1RCVHlwZSIsIm1hYyIsImpsZHhnZEhEIl0sW3siU1RCX0hXRFhFUEdIRCI6IjExMDAwMDAxNjEifSx7IlNUQl9IV0RYRVBHSEQiOiIxMTAwMDAwMTQxIn0seyJTVEJfSFdEWEVQR0hEIjoiaHVhd2VpIn1dLFsiZGRuYW1lIiwic2l0ZW5hbWUiLCJvcmlnaW4iXSwidjIwMTkwMjE2MTgwMCJd"
    ], [
      "qoMD6hF8relSRFZrO8DwMgo8p+nihlPM+41Fot35T9i8H+REdwIlvjvLkj/yvO2WWsf0kERE5L6avr99R5y7Jujwl/6xcAMfKioJY/7wCI4atmXfLE2P4ZDGwKWzVSmd50cF4z2eHUnbo0Gffb1MYRYVRHlfuReRsgE1v1SnAOk=",
      "eyJjb21tb24iOnsidXNlckluZm8iOnsiXyI6WyJodHRwOi8vMTAuMTI4LjQ2LjEwOjkyMDAiLCJodHRwOi8vMTAuMTI4LjQuMTA6OTAwMCJdLCJKTERYWlNDIjoxLCJTVEJfSFdEWEVQR0hEX1RFU1QiOjF9LCJlcyI6eyJfIjpbImh0dHA6Ly8xMC4xMjguNDYuMTA6OTMwMCIsImh0dHA6Ly8xMC4xMjguNC4xMDo5MTExIl0sIkpMRFhaU0MiOjEsIlNUQl9IV0RYRVBHSERfVEVTVCI6MX0sImNoYXJnZSI6eyJfIjpbIjExMDAwMDI2NjMiLCIxMTAwMDAyNjU3Il0sIkpMRFhaU0MiOjEsIlNUQl9IV0RYRVBHSERfVEVTVCI6MX0sImRjIjp7Il8iOlsiaHR0cDovLzEwLjEyOC40Ni41MDo5MDgwL0VQR0RhdGFBbmFseXNpcy9SZWNpdmVTZXJ2bGV0IiwiaHR0cDovLzEwLjEyOC40Ljg2OjkwODAvRVBHRGF0YUFuYWx5c2lzL1JlY2l2ZVNlcnZsZXQiXSwiSkxEWFpTQyI6MSwiU1RCX0hXRFhFUEdIRF9URVNUIjoxfSwiYXV0aCI6eyJfIjpbImh0dHA6Ly8xMC4xMjguNy4yOjgwODgiLCJodHRwOi8vMTAuMTI4LjcuMTAwOjgwODgiXSwiSkxEWFpTQyI6MSwiU1RCX0hXRFhFUEdIRF9URVNUIjoxfSwib3JkZXJzIjp7Il8iOlsiaHR0cDovLzEwLjEyOC43LjI6ODAwOCIsImh0dHA6Ly8xMC4xMjguNy4xMDA6ODAwOCJdLCJKTERYWlNDIjoxLCJTVEJfSFdEWEVQR0hEX1RFU1QiOjF9LCJlbWFpbCI6eyJfIjpbImh0dHA6Ly8xMC4xMjguNC44NDoyMDAwMCIsImh0dHA6Ly8xMC4xMjguNC44NDoyMDAwMCJdLCJKTERYWlNDIjoxLCJTVEJfSFdEWEVQR0hEX1RFU1QiOjF9LCJ0aXBzIjp7Il8iOlsiMTEwMDAwMzY2MiIsIjExMDAwMDM2NjEiXSwiSkxEWFpTQyI6MSwiU1RCX0hXRFhFUEdIRF9URVNUIjoxfX19"
    ], [
      "MBSW+b2wS1BgIwCVk7WWTqOCbboKgXj96xiNy/Jp9XG1BIQhrWBGcEtNL50KEVeycxaeQU7EB7M/RAuLsVULwoiIDdHeTtHjtkEh8dO7TJPVdPWZbYbzjK3+7mDkx60kPYitZhLNQnrrjh8rUSu1MJVKKOk60vaeQgPT2oks8E0=",
      "eyJLRVlfT0siOltbMTNdLFsiRyIsIkdBIiwiR0ExIiwiR0EyIiwiR0VCIl0sIm9rIl0sIktFWV9SRVRVUk4iOltbOF0sWyJHIiwiR0EiLCJHQTEiLCJHQTIiLCJHRUIiXSwiYmFjayJdLCJLRVlfREVMRVRFIjpbWzQ2XSxbIkciLCJHQSIsIkdBMSIsIkdBMiJdLCJkZWwiXSwiS0VZX1BBR0VVUCI6W1szM10sWyJHIiwiR0EiLCJHQTEiLCJHQTIiLCJHUCJdLCJwYWdlVXAiXSwiS0VZX1BBR0VET1dOIjpbWzM0XSxbIkciLCJHQSIsIkdBMSIsIkdBMiIsIkdQIl0sInBhZ2VEb3duIl0sIktFWV9MRUZUIjpbWzM3XSxbIkciLCJHQSIsIkdBMSIsIkdBMiIsIkdEIiwiR0RIIl0sImxlZnQiXSwiS0VZX1JJR0hUIjpbWzM5XSxbIkciLCJHQSIsIkdBMSIsIkdBMiIsIkdEIiwiR0RIIl0sInJpZ2h0Il0sIktFWV9VUCI6W1szOF0sWyJHIiwiR0EiLCJHQTEiLCJHQTIiLCJHRCIsIkdEViJdLCJ1cCJdLCJLRVlfRE9XTiI6W1s0MF0sWyJHIiwiR0EiLCJHQTEiLCJHQTIiLCJHRCIsIkdEViJdLCJkb3duIl0sIktFWV8wIjpbWzQ4XSxbIkciLCJHQSIsIkdDIiwiR04iXSwwXSwiS0VZXzEiOltbNDldLFsiRyIsIkdBIiwiR0MiLCJHTiJdLDFdLCJLRVlfMiI6W1s1MF0sWyJHIiwiR0EiLCJHQyIsIkdOIl0sMl0sIktFWV8zIjpbWzUxXSxbIkciLCJHQSIsIkdDIiwiR04iXSwzXSwiS0VZXzQiOltbNTJdLFsiRyIsIkdBIiwiR0MiLCJHTiJdLDRdLCJLRVlfNSI6W1s1M10sWyJHIiwiR0EiLCJHQyIsIkdOIl0sNV0sIktFWV82IjpbWzU0XSxbIkciLCJHQSIsIkdDIiwiR04iXSw2XSwiS0VZXzciOltbNTVdLFsiRyIsIkdBIiwiR0MiLCJHTiJdLDddLCJLRVlfOCI6W1s1Nl0sWyJHIiwiR0EiLCJHQyIsIkdOIl0sOF0sIktFWV85IjpbWzU3XSxbIkciLCJHQSIsIkdDIiwiR04iXSw5XSwiS0VZX0NIQU5ORUxfVVAiOltbMjU3XSxbIkciLCJHQSIsIkdBMSIsIkdDIiwiR0NWIl0sImNoKyJdLCJLRVlfQ0hBTk5FTF9ET1dOIjpbWzI1OF0sWyJHIiwiR0EiLCJHQTEiLCJHQyIsIkdDViJdLCJjaC0iXSwiS0VZX1ZPTFVNRV9VUCI6W1syNTldLFsiRyIsIkdBIiwiR0ExIiwiR1YiLCJHVlYiXSwidisiXSwiS0VZX1ZPTFVNRV9ET1dOIjpbWzI2MF0sWyJHIiwiR0EiLCJHQTEiLCJHViIsIkdWViJdLCJ2LSJdLCJLRVlfTVVURSI6W1syNjFdLFsiRyIsIkdBIiwiR1YiXSwidm0iXSwiS0VZX1RSQUNLIjpbWzI4Nl0sWyJHIiwiR0EiLCJHQTEiLCJHQTIiLCJHViJdLCJ2dCJdLCJLRVlfRkFTVF9GT1JXQVJEIjpbWzI2NF0sWyJHIiwiR0EiLCJHQTEiLCJHUyIsIkdTRiJdLCJmZiJdLCJLRVlfRkFTVF9SRVdJTkQiOltbMjY1XSxbIkciLCJHQSIsIkdBMSIsIkdTIiwiR1NGIl0sImZyIl0sIktFWV9QQVVTRV9QTEFZIjpbWzI2M10sWyJHIiwiR0EiLCJHQTEiLCJHUyIsIkdTUCJdLCJwcCJdLCJLRVlfU1RPUCI6W1syNzBdLFsiRyIsIkdBIiwiR0ExIiwiR0EyIiwiR1MiLCJHU1AiXSwic3RvcCJdLCJLRVlfU0VBUkNIIjpbWzIxN10sWyJHIiwiR0EiLCJHSyJdLCJzZWFyY2giXSwiS0VZX0xJVkVfQlJPQURDQVNUIjpbWzI3NV0sWyJHIiwiR0EiLCJHSyJdLCJmMSJdLCJLRVlfUkVWSUVXIjpbWzI3Nl0sWyJHIiwiR0EiLCJHSyJdLCJmMiJdLCJLRVlfRElCQkxJTkciOltbMjc3XSxbIkciLCJHQSIsIkdLIl0sImYzIl0sIktFWV9JTkZPUk1BVElPTiI6W1syNzhdLFsiRyIsIkdBIiwiR0siXSwiZjQiXSwiS0VZX01VTFRJVklFVyI6W1sxMzc4XSxbIkciLCJHQSIsIkdLIl0sIm11bHRpdmlldyJdLCJLRVlfUElQIjpbWzEzMl0sWyJHIiwiR0EiLCJHQTEiLCJHQTIiXSwicGlwIl0sIktFWV9SRUxJVkUiOltbMjgwXSxbIkciLCJHQSIsIkdBMSIsIkdBMiJdLCJyZWxpdmUiXSwiS0VZX09QVElPTiI6W1sxMTIwXSxbIkciLCJHQSIsIkdBMSIsIkdBMiJdLCJvcHRpb24iXSwiS0VZX1BPVU5EIjpbWzI4OF0sWyJHIiwiR0EiLCJHQTEiLCJHQTIiXSwiIyJdLCJLRVlfU1RBUiI6W1syODldLFsiRyIsIkdBIiwiR0ExIiwiR0EyIl0sIioiXSwiS0VZX1NQRUVDSCI6W1sxMzc3XSxbIkciXSwic3BlZWNoIl0sIktFWV9IT01FIjpbWzExMl0sWyJHIl0sImhvbWUiXSwiRVZFTlRfVVRJTElUWSI6W1s3NjhdLFsiRyJdLCJ1dGlsaXR5Il19"
    ]]
  var PK = PARAMS[0];
  var BOXINFO = PARAMS[1];
  var BOXSIGN = BOXINFO[0];
  var BOXS = BOXINFO[1];
  var CFGINFO = PARAMS[2];
  var CFGSIGN = CFGINFO[0];
  var CFGS = CFGINFO[1];
  var PROFILESINFO = PARAMS[3];
  var PROFILESSIGN = PROFILESINFO[0];
  var PROFILESS = PROFILESINFO[1];
  var ENUMKEYINFO = PARAMS[4];
  var ENUMKEYSIGN = ENUMKEYINFO[0];
  var ENUMKEYS = ENUMKEYINFO[1];
  ENUMKEYINFO = BOXINFO = CFGINFO = PROFILESINFO = PARAMS = undefined;

  var SIGN = "lRmrehP7ahyWvWWg8hD/+2G+KV95Ai1dO6MsygvnXabEZTC0s7etk0DbRbOC8Me9RbCr6Rukc3zH5n9LQ+PYpfOTNcfWqsNdQ8jgdhU/oh64I2r8W7xsZHJQnSq/Hji2ENFPzvbJNZ61w+cSRw4wh3l6BUlUJ2kqO46g1vPw0CY=";
  var MD5 = "0c2fdb6638f9aa91f1a43db0f9793d62";

  var Object = this.Object;

  var Verify = new JSEncrypt();
  Verify.setKey(PK);

  var Function = this.Function;
  var String = this.String;
  var Array = this.Array;
  var Date = this.Date;
  var Plugin = this.Plugin;
  var UTIL;
  var rootFunction = root.Function;
  var FunctionPrototype = Function.prototype;
  var StringPrototype = String.prototype;
  var ObjectPrototype = Object.prototype;
  var ArrayPrototype = Array.prototype;
  var DatePrototype = Date.prototype;
  var rootFunctionPrototype = rootFunction.prototype;

  var CryptoJSSHA256 = CryptoJS.SHA256;

  var apply = (function (c, a, b) {
    if (typeof c === "function") {
      return c.apply(b, a);
    }
  });
  var call = Function.call;
  var CUGetConfig = Authentication.CUGetConfig;
  var CUSetConfig = Authentication.CUSetConfig;
  var CUGetList = ['STBType'];
  function getAuthList(index, list) {
    try {
      return apply(CUGetConfig, [(list || CUGetList)[index]], Authentication) || "";
    } catch (e) { };
    return "";
  }
  defineProperty(FunctionPrototype, 'bind', function (a) {
    var b = this,
      c = Array.prototype.slice,
      d = c.call(arguments, 1);
    return function () {
      return b.apply(a, d.concat(c.call(arguments)));
    }
  });
  defineProperty(rootFunctionPrototype, 'bind', FunctionPrototype.bind);

  var slice = call.bind(ArrayPrototype.slice);
  var owns = call.bind(ObjectPrototype.hasOwnProperty);
  var toString = call.bind(ObjectPrototype.toString);


  var toStringPollify = toString(null) !== '[object Null]';
  var boxType = getAuthList(0);

  var onBox = !!boxType;
  var boxInfo;

  toStringPollify && (function (ts) {
    toString = function (obj) {
      if (!obj && typeof obj === 'object') {
        return '[object Null]';
      } if (typeof obj === 'undefined') {
        return '[object Undefined]';
      } else {
        return ts(obj);
      }
    };
  })(toString);
  function defineName(fn, name) {
    if (name) {
      try {
        Object.defineProperty(fn, "name", { value: name || "", enumerable: !1, writable: !0 });
      } catch (e) {
      }
    }
  }

  var createFunction = function () {
    return Function.apply(Function, arguments);
  };
  (function (cf) {
    createFunction = function (name) {
      if (toString(name) === "[object Array]") {
        var args = slice(arguments, 1);
        name = name[0];
      }
      var fn = apply(cf, args || arguments);
      defineName(fn, name);
      return fn;
    };
  })(createFunction);
  var bind = call.bind((function (b, s, a, f) {
    try {
      var fn = a(b, s(arguments, 4), f).bind(null);
      try {
        Object.defineProperty(fn, "name", {
          value: (/bound/.test(f.name) ? f.constructor : f).name,
          enumerable: !1,
          writable: !0
        });
      } catch (e) { };
      return fn
    } catch (e) { }
  }), null, call.bind, slice, apply);

  (function (bd) {
    bind = function bind(name) {
      if (toString(name) === "[object Array]") {
        var args = slice(arguments, 1);
        name = name[0];
      }
      var fn = apply(bd, args || arguments);
      defineName(fn, name);
      return fn;
    };
  })(bind);

  var verifyByBoxType = bind(function (a, b, c, d, e) {
    try {
      if (c) return true;
      return a.verify(d, e, b)
    } catch (e) { }
  }, null, Verify, CryptoJSSHA256, true);

  var convertBtoaJSONData = bind(function (a, b, d, c, s, f) {
    try {
      if (d(f, s)) {
        var g = a(b, [f]);
        if (/function/.test(g)) {
          return c(g);
        } else {
          return JSON.parse(g);
        }
      }
    } catch (e) { }
    return {};
  }, null, apply, atob, verifyByBoxType, evalfn);

  boxInfo = convertBtoaJSONData(BOXSIGN, BOXS);
  BOXSIGN = BOXS = undefined;
  var envInExpect = onBox && boxInfo;
  (function (vbbt) {
    verifyByBoxType = function () {
      return envInExpect && (apply(vbbt, arguments));
    };
  })(verifyByBoxType);
  var overloadSetter = bind(function (f, p, s, u) {
    return function (a, b) {
      if (a == null) return this;
      var t = this;
      if (u || typeof a != "string") {
        f(a, function (v, k) {
          return p(s, [k, v], t);
        });
      } else {
        p(s, [a, b], t);
      }
      return this;
    }
  }, null, each, apply);

  function each(objs, fn, isObject, arrDesc) {
    if (!isObject && objs && objs.length) {
      if (arrDesc) {
        for (var i = objs.length - 1; i >= 0; i--) {
          if (apply(fn, [objs[i], i])) {
            return true;
          }
        }
      } else {
        for (var i = 0; i < objs.length; i++) {
          if (apply(fn, [objs[i], i])) {
            return true;
          }
        }
      }
    } else {
      for (var key in objs) {
        if (owns(objs, key) && apply(fn, [objs[key], key])) {
          return true;
        }
      }
    }
  }
  each = bind([], each);
  function apply(fn, args, that) {
    if (typeof fn === 'function') {
      try {
        return fn.apply(that, args);
      } catch (e) { }
    }
  }
  apply = bind([], apply);
  function supports(object, key, check) {
    if (key in object) {
      try {
        apply(check, [object[key], key, object]);
        return true;
      } catch (e) { }
    }
    return false;
  }
  supports = bind([], supports);
  function instanceOf(a, b) {
    return a instanceof b;
  }
  instanceOf = bind([], instanceOf);
  function inherit(Sub, Supper) {
    var f = function () { };
    f.prototype = Supper.prototype;
    Sub.prototype = new f();
    Sub.prototype.constructor = Sub;
  }
  inherit = bind([], inherit);
  function lookupIndex(ds, target, subKey) {
    var findIndex = -1;
    each(ds, function (tmp, i) {
      try {
        if (target === (subKey ? (tmp && tmp[subKey]) : tmp)) {
          findIndex = i;
          return true;
        }
      } catch (e) { }
    });
    return findIndex;
  }
  lookupIndex = bind([], lookupIndex);
  function merge(obj) {
    if (arguments.length > 1) {
      var params = slice(arguments, 1);
      each(params, function (v) {
        each(v, function (val, key) {
          obj[key] = val;
        });
      });
    }
    return obj;
  }
  merge = bind([], merge);
  function Tpl(html) {
    function replaceFn(a, b, c, d) {
      var out = '';
      var syntax = b && b.replace(/ .*$/, '') || d,
        key = (b && b.replace(syntax + ' ', '')) || d,
        scope = this.scopes[this.scopes.length - 1];
      switch (syntax) {
        case '#each':
          var ds = key === 'this' ? scope.ds : scope.ds[key];
          var tmpScope = scopeFn(ds);
          tmpScope.type = 1;
          this.scopes.push(tmpScope);
          for (var i in ds) {
            if (ds.hasOwnProperty(i)) {
              this.scopes[this.scopes.length - 1].index = i;
              out += c.replace(/{{([^}]+?)}}/g, replaceFn.bind(this));
            }
          }
          break;
        case '/each':
          this.scopes.pop();
          break;
        default:
          var tmp = scope.ds;
          if (scope.type === 1) {
            tmp = tmp[scope.index];
          }
          var str = (key === 'this' && tmp + '') || tmp[key] + '' || '';
          out = getStrFromData({
            key: key,
            index: scope.index,
            ds: tmp
          }, this.unencode);
          break;
      }
      return out;
    }
    function getStrFromData(obj, unencode) {
      var out = '';
      switch (obj.key) {
        case 'this':
          out = obj.ds;
          break;
        case 'index':
          out = obj.index;
          break;
        default:
          if (unencode) {
            if (obj.ds.hasOwnProperty(obj.key)) {
              out = obj.ds[obj.key];
            } else {
              out = '{{' + obj.key + '}}';
            }
          } else {
            out = encodeStr(obj.ds[obj.key] || '');
          }
          break;
      }
      return out;
    }
    function encodeStr(str) {
      var s = str + '',
        out = '',
        encodes = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" };

      out = s.replace(new RegExp('[&"<>\\/]', 'g'), function (m) { return encodes[m]; })
        .replace(/'/g, function (m) { return encodes[m]; });
      return out;
    }
    function scopeFn(data) {
      return {
        ds: data,
        type: data.length > -1 ? 1 : 0,
        index: 0
      };
    }
    function compile(data, unencode) {
      this.data = data;
      this.unencode = unencode;
      this.scopes = [scopeFn(data)];
      return this.tpl.replace(new RegExp('{{(#each.+?)}}(.*?)(?={{\\/each}})|{{([^}]+?)}}', 'g'), replaceFn.bind(this));
    }
    function Init(tpl) {
      this.tpl = tpl.replace(new RegExp('^\\s*|\\s*$', 'mg'), '').replace(new RegExp('[\\r\\n]+', 'mg'), '');
      return this;
    }
    Init.prototype = {
      compile: function (data, unencode) {
        var out = compile.call(this, data, unencode);
        delete this.data;
        delete this.scopes;
        return out;
      }
    };
    return new Init(html);
  }
  function initServices(ajax) {

    function createServices(groups, dftLoader, _dftParam, _dftOption, each, apply, merge) {
      var result = {};
      each(groups, function (group, groupName) {
        var _group = result[groupName] = {};
        var _groupParam = group['_'];
        each(group, function (item, itemName) {
          if (itemName !== '_') {
            _group[itemName] = bind([], function (b, d, o, u, f, m, a, c) {
              return b(d, [u, m({}, f, a), m({}, o, c)], c);
            }, null, apply, dftLoader, _dftOption, item.url || item, merge({}, _dftParam, _groupParam, item._), merge);
          }
        });
      });
      return result;
    }
    function _dftAjax(sourceUrl, param, option) {
      option || (option = {});
      var ajax = option.ajax;
      delete option.ajax;
      apply(ajax, [sourceUrl, param, option], option);
    }

    var _dftParam = {
      origin: EPG.origin,
      userId: EPG.userId,
      node: EPG.node,
      ddId: EPG.ddId,
      stbId: EPG.stbId,
      STBType: EPG.STBType,
      mac: EPG.mac,
      platform: 0
    };

    var _dftOption = {
      ajax: function (sourceUrl, param, option) {
        var url = Tpl(sourceUrl).compile(param, true);
        url = apply(option.fixUrl, [url]) || url;
        if (/{{.*}}/.test(url)) {
          apply(option.cue, [url]);
          return;
        }
        var success = UTIL.isFunction(option.success) ? bind(option.success, option) : null;
        var error = UTIL.isFunction(option.error) ? bind(option.error, option) : null;
        var filter = UTIL.isFunction(option.filter) ? option.filter : null;
        apply(ajax, [merge({
          url: url
        }, option, {
          success: bind([], function (b, c, a, d) {
            if (c) {
              d = c(d);
              b(a, d);
            } else {
              a && a(d);
            }
          }, null, apply, filter, success),
          error: bind([], function (a, c) {
            a && a(c);
          }, null, error)
        })], option);
        sourceUrl = param = option = url = success = error = filter = null;
      },
      timeout: 3e3,
      method: "GET"
    };
    function Services(createServices, _dftAjax, _dftParam, _dftOption, items, _dftParam2, _dftOption2) {
      if (UTIL.isArray(items)) {
        var out = [];
        each(items, function (itemObj) {
          var t_items = itemObj[0];
          var t_dftParam2 = itemObj[1];
          each(t_dftParam2, function (v, k) {
            if (/^vari:/.test(v)) {
              t_dftParam2[k] = EPG.profiles && EPG.profiles.get(v.replace("vari:", ""));
            } else if (/^EPG:/.test(v)) {
              t_dftParam2[k] = EPG[v.replace("EPG:", "")];
            }
          });
          var t_dftOption2 = itemObj[2];
          var t_dftParam = merge({}, _dftParam, t_dftParam2);
          var t_dftOption = merge({}, _dftOption, t_dftOption2);
          each(t_dftOption, function (v, k) {
            if (UTIL.isFunction(v)) {
              t_dftOption[k] = bind([], v);
            }
          });
          out.push(createServices(t_items, _dftAjax, t_dftParam, t_dftOption, each, apply, merge));
          t_items = t_dftParam2 = t_dftOption2 = t_dftParam = t_dftOption = null;
        });
        createServices = _dftAjax = _dftParam = _dftOption = items = _dftParam2 = _dftOption2 = null;
        return out;
      } else {
        each(_dftParam2, function (v, k) {
          if (/^vari:/.test(v)) {
            _dftParam2[k] = EPG.profiles && EPG.profiles.get(v.replace("vari:", ""));
          } else if (/^EPG:/.test(v)) {
            t_dftParam2[k] = EPG[v.replace("EPG:", "")];
          }
        });
        _dftParam = merge({}, _dftParam, _dftParam2);
        _dftOption = merge({}, _dftOption, _dftOption2);
        each(_dftOption, function (v, k) {
          if (UTIL.isFunction(v)) {
            _dftOption[k] = bind([], v);
          }
        });
        return createServices(items, _dftAjax, _dftParam, _dftOption, each, apply, merge);
      }
    }
    Services = bind([], Services, null, createServices, _dftAjax, _dftParam, _dftOption);

    if (onBox && boxInfo) {
      return bind([], function (b, s, d, c, i) {
        if (c && i) {
          var a = d(c, i);
          if (a && a.length) {
            return b(s, a);
          }
        }
      }, null, apply, Services, convertBtoaJSONData);
    }
  }
  initServices = bind([], initServices);
  function defineProperty(object, key, method, forceAssign, checkSupports) {
    if (!forceAssign && supports(object, key, checkSupports)) {
      return;
    }
    try {
      method.toString = function () { };
      Object.defineProperty(object, key, {
        value: method,
        enumerable: false,
        writable: true
      });
    } catch (e) { }
  }
  defineProperty = bind(function (s, o, k, m, f, c) {
    o && !(!f && s(o, k, c)) && this.defineProperty(o, k, {
      value: m,
      enumerable: false,
      writable: true
    })
  }, Object, supports);
  function definePropertys(obj, fns, force) {
    each(fns, function (v, k) {
      defineProperty(obj, k, typeof v === 'function' ? bind(v, null) : v, force);
    });
  }

  (function (_Verify, _defineProperty, _definePropertys, PK, MD5, SIGN) {
    if (_Verify) {
      var verify = bind(function (typeFn, text, signature) {
        return this.verify(text, signature, typeFn);
      }, _Verify, CryptoJSSHA256);
      _definePropertys(Verify = bind(Function), {
        verify: verify,
        encrypt: _Verify.encrypt.bind(_Verify)
      });
      if (verifyByBoxType([PK, MD5, _Verify.getPublicKey()].join('|'), SIGN)) {
        return true;
      }
    }
    definePropertys = defineProperty = bind(createFunction());
  })(Verify, defineProperty, definePropertys, PK, MD5, SIGN);
  PK = MD5 = SIGN = undefined;
  defineProperty(ObjectPrototype, 'extend', overloadSetter(function (a, b) {
    this[a] = b;
  }));

  defineProperty(StringPrototype, 'format',
    bind(
      function (s, p) {
        return s(arguments, 3).reduce(function (t, r) {
          return t.replace(p, r);
        }, String(s(arguments, 2, 3)))
      },
      null,
      slice,
      '%s'
    )
  );

  UTIL = Function();
  defineProperty(FunctionPrototype, 'toString', createFunction(), true);


  var isTypes = bind(function (t, f, y, o) {
    return t(o) === f(y)
  }, null, toString, bind(StringPrototype.format, null, "[object %s]"));

  apply(UTIL.extend, [{
    isArray: bind(['isArray'], isTypes, null, 'Array'),
    isBoolean: bind(['isBoolean'], isTypes, null, 'Boolean'),
    isDate: bind(['isDate'], isTypes, null, 'Date'),
    isFunction: bind(['isFunction'], isTypes, null, 'Function'),
    isNull: bind(['isNull'], isTypes, null, 'Null'),
    isNumber: bind(['isNumber'], isTypes, null, 'Number'),
    isObject: bind(['isObject'], isTypes, null, 'Object'),
    isRegExp: bind(['isRegExp'], isTypes, null, 'RegExp'),
    isString: bind(['isString'], isTypes, null, 'String'),
    isUndefined: bind(['isUndefined'], isTypes, null, 'Undefined')
  }], UTIL);

  defineProperty(FunctionPrototype, 'before', bind(['before'], function (fn) {
    var that = this;
    return function () {
      apply(fn, arguments);
      return that.apply(that, arguments);
    };
  }, FunctionPrototype));

  defineProperty(FunctionPrototype, 'after', bind(['after'], function (fn) {
    var that = this;
    return function () {
      var out = that.apply(that, arguments);
      apply(fn, arguments);
      return out;
    };
  }, FunctionPrototype));

  definePropertys(UTIL, {
    apply: apply,
    each: each,
    merge: merge,
    owns: owns,
    slice: slice,
    toString: toString
  }, true);

  definePropertys(UTIL, {
    inherit: inherit,
    lookupIndex: lookupIndex
  });

  function md5(unknown) {
    try {
      return "" + CryptoJS.MD5(JSON.stringify(unknown));
    } catch (e) { };
  }

  function mdComp(oldMd, unknown) {
    var newMd = md5(unknown);
    if (!(oldMd && (oldMd === newMd))) {
      return newMd;
    }
  }

  function dftCompFn(a, b) {
    if (a && b && !UTIL.isString(a) && !UTIL.isString(b)) {
      return md5(a) !== md5(b);
    } else {
      return a !== b;
    }
  }

  function findDiff(oData, data, compFn) {
    try {
      var diff = {};
      var hasDiff = false;
      compFn = dftCompFn;
      each(oData, function (v, k) {
        if (!data || !UTIL.owns(data, k)) {
          hasDiff = true;
          diff[k] = "del";
        }
      });
      each(data, function (v, k) {
        if (!oData || compFn(oData && oData[k], v)) {
          hasDiff = true;
          if (!oData) {
            diff[k] = "add";
          } else if (UTIL.owns(oData, k)) {
            diff[k] = "mod";
          } else {
            diff[k] = "add";
          }
        }
      });
      compFn = null;
      if (hasDiff) {
        return diff;
      }
    } catch (e) { }
  }

  function sclone(json) {
    try {
      return JSON.parse(JSON.stringify(json));
    } catch (e) { }
  }
  definePropertys(UTIL, {
    mdComp: mdComp,
    findDiff: findDiff,
    sclone: sclone
  });

  var initProfiles = bind(function (a, e, b, c, d, f, l, g) {
    function w(a, b) {
      e(a, function (v, k) {
        var c = [b, k].join('_');
        if (v && !v._) {
          w(v, c);
        }
        if (k && v && v._) {
          l[c] = v;
        }
      });
    }

    function s(f, w, b, c) {
      var o = f(c, b);
      if (o) {
        w(o, 'g');
      }
    }

    function k(l, g, a) {
      try {
        var o = l['g_' + a.split('.').join('_')];
        return o._[o[g] || 0];
      } catch (e) { }
    }
    var get = b(c('k', 'a', ['return k(a);'].join('')), null, b(k, null, l, g));
    var set = b(c('s', 'i', 'c', ['return s(i, c);'].join('')), null, b(s, null, f, w));
    var t = {};
    d(t, {
      get: get,
      set: set
    });
    return t;
  }, null, apply, each, bind, createFunction, definePropertys, convertBtoaJSONData);

  var EPG = {};

  if (onBox && boxInfo) {
    var cfgInfo = convertBtoaJSONData(CFGSIGN, CFGS) || [];
    CFGSIGN = CFGS = undefined;
    var envs = new RegExp("^/pub/([A-Za-z1-9_-]+)/([A-Za-z1-9_-]+)/.*$").exec(location.pathname);
    if (envs && envs.length) {
      envs.shift();
      envs = envs.concat([
        location.origin,
        location.protocol,
        location.host,
        location.hostname,
        location.port
      ]);
    }
    var regOrigin = new RegExp("([^/])/[^/].*$");
    var ddname = envs[0];
    var siteName = envs[1];
    var cuCfg = cfgInfo[0];
    var projectCfg = cfgInfo[1];

    var profilesList = {};
    var profiles = initProfiles(profilesList, siteName);
    apply(profiles && profiles.set, [PROFILESS, PROFILESSIGN]);
    PROFILESS = PROFILESSIGN = undefined;
    try {
      definePropertys(EPG, {
        origin: envs[2],
        protocol: envs[3],
        host: envs[4],
        hostname: envs[5],
        port: envs[6],
        domain: getAuthList(2, cuCfg).replace(regOrigin, "$1"),
        ddname: ddname,
        ddId: projectCfg[0][ddname],
        siteName: siteName,
        siteId: "",
        dnId: projectCfg[1][ddname],
        node: projectCfg[2][ddname],
        linesite: cuCfg[cuCfg.length - 1],
        version: cuCfg[0],
        userId: getAuthList(1, cuCfg),
        areaId: getAuthList(3, cuCfg),
        stbId: getAuthList(4, cuCfg),
        STBType: getAuthList(5, cuCfg),
        mac: getAuthList(6, cuCfg),
        profiles: profiles
      });
      definePropertys(EPG, {
        pathPub: [EPG.origin, "pub"].join("/"),
        pathPic: [EPG.origin, "pic"].join("/"),
        isTest: EPG.siteName !== EPG.linesite
      });
      definePropertys(EPG, {
        pathSite: [EPG.pathPub, EPG.ddname, EPG.siteName].join("/"),
        pathRes: [EPG.pathPub, EPG.version].join("/")
      });
      definePropertys(EPG, {
        pathPage: [EPG.pathRes, "mybz"].join("/")
      });
      definePropertys(EPG, {
        KB: (function (util) {
          var enumkeys = convertBtoaJSONData(ENUMKEYSIGN, ENUMKEYS) || {};
          ENUMKEYSIGN = ENUMKEYS = undefined;
          var inited,
            keyMap = {},
            keyMapGroup = {},
            each,
            apply,
            extend,
            util,
            middleware,
            keyFns = {};
          function init() {
            if (inited) return;
            inited = true;
            apply = util.apply;
            extend = util.extend;
            each = util.each;
            each(enumkeys, function (v, k) {
              each(v[0], function (vv) {
                keyMap["" + vv] = k;
              });
              each(v[1], function (vv) {
                var kmg = keyMapGroup["" + vv];
                kmg || (kmg = keyMapGroup["" + vv] = []);
                kmg.push(k);
              });
            });
          }
          function getKeyInfo(keyName) {
            var info = enumkeys[keyName];
            if (info) {
              return [keyName, info[2], info[1]];
            }
          }
          function getNameByCode(code) {
            return keyMap[code];
          }
          function respond(unkonw) {
            if (!(util.isNumber(unkonw) || util.isString(unkonw))) {
              return;
            }
            var keyCode = util.isNumber(unkonw) && unkonw;
            var keyName = ((!keyCode && unkonw) || getNameByCode(keyCode) || "").toLocaleUpperCase();
            if (keyName) {
              return keyRespondMiddleware(keyName, keyFns[keyName]);
            }
          }
          function keyRespondMiddleware(keyName, fn) {
            var info = getKeyInfo(keyName);
            try {
              var respond = apply(middleware, info);
              if (!respond) {
                respond = apply(fn, info);
              }
              if (!respond && info && info.length) {
                var group = info[2];
                for (var i = group.length; i >= 0; i--) {
                  respond = apply(keyFns[group[i]], info);
                  if (respond) {
                    break;
                  }
                }
              }
            } catch (e) { }
            return respond;
          }
          var keyboard = {};
          definePropertys(keyboard, {
            respond: bind([], function (unkonw) {
              return respond(unkonw);
            }),
            setup: bind([], function (opt, mid) {
              try {
                init();
                extend.apply(keyFns, [opt]);
                if (mid) {
                  middleware = mid;
                }
              } catch (e) { }
            })
          });
          return keyboard;
        })(UTIL)
      });
      definePropertys(EPG, {
        initServices: bind([], function (ajax, sign, info) {
          try {
            if (ajax && sign && info) {
              return initServices(ajax)(sign, info);
            }
          } catch (e) { }
        })
      });
    } catch (e) { };
  }

  return {
    Function: Function,
    String: String,
    Object: Object,
    Array: Array,
    Date: Date,
    UTIL: UTIL,
    EPG: EPG
  };
}, window);

function Query(selector, parent, all) {
  if (!(this instanceof Query)) {
    return new Query(selector, parent, all);
  }
  if (!selector) return this;
  var root = parent || document, out = [];
  typeof parent == "string" && (root = document.querySelector(parent));
  if (typeof selector === "string") {
    if (/\</.test(selector)) {
      var tmpEl = document.createElement("div");
      tmpEl.innerHTML = selector;
      for (var i = 0; i < tmpEl.childNodes.length; i++) {
        out.push(tmpEl.childNodes[i]);
      }
    } else if (root) {
      try {
        var tmp = root["querySelector" + (all ? "All" : "")].call(root, selector);
        if (all) {
          tmp.length && (out = [].slice.call(tmp));
        } else {
          tmp && out.push(tmp);
        }
      } catch (e) { }
    }
  } else if (selector instanceof Query) {
    out = selector;
  } else if ("nodeType" in selector) {
    out.push(selector);
  }
  for (var i = 0; i < out.length; i++) {
    this[i] = out[i];
  }
  this.length = out.length;
  return this;
}

Query.isDOM = function (obj) {
  if (typeof HTMLElement === "function") {
    this.isDOM = function (obj) {
      return !!(obj instanceof HTMLElement);
    };
  } else {
    this.isDOM = function (obj) {
      return !!(obj && typeof obj !== "undefined" && obj.nodeType === 1 && typeof obj.nodeName === "string");
    };
  }
  return this.isDOM(obj);
};

Query.isEqualNode = function (dom, dom2) {
  if ("isEqualNode" in document.documentElement) {
    this.isEqualNode = function (dom, dom2) {
      return dom === dom2;
    };
  } else {
    this.isEqualNode = function (dom, dom2) {
      if (this.isDOM(dom) && this.isDOM(dom2)) {
        try {
          var r = dom.nodeName === dom2.nodeName && dom.nodeType === dom2.nodeType && dom.nodeValue === dom2.nodeValue && dom.innerHTML === dom2.innerHTML;
          if (r) {
            if (this.isDOM(dom.previousSibling) && this.isDOM(dom2.previousSibling)) {
              return _isEqualNode(dom.previousSibling, dom2.previousSibling);
            } else {
              return dom.previousSibling === dom2.previousSibling;
            }
          }
          return !!r;
        } catch (e) {
          return false;
        }
      }
      return false;
    };
  }
  return this.isEqualNode(dom, dom2);
};
Query.toPx = function (value) {
  return /%(\d+(\.\d+)*)px/.test(value) && (document.body || document.documentElement).clientWidth / 100 * RegExp.$1 + "px";
};

Query.prototype = {
  constructor: Query,
  isDOM: Query.isDOM,
  length: 0,
  item: function (index) {
    return Query(this[index]);
  },
  first: function () {
    return this.item(0);
  },
  last: function () {
    return this.item(this.length - 1);
  },
  hide: function () {
    for (var i = 0; i < this.length; i++) {
      var t = this[i];
      t && t.style && (t.style.visibility = "hidden");
    }
    return this;
  },
  show: function () {
    for (var i = 0; i < this.length; i++) {
      var t = this[i];
      t && t.style && (t.style.display = "", t.style.visibility = "visible");
    }
    return this;
  },
  html: function (html) {
    var el = this[0];
    if (el) {
      if (typeof html !== "undefined") {
        for (var i = 0; i < this.length; i++) {
          this[i].innerHTML = html;
        }
      } else {
        return el.innerHTML || "";
      }
    }
  },
  attr: function (key, value) {
    if (arguments.length === 1) {
      if (typeof key === "string") {
        if (!this.length) {
          return null;
        }
        return this[0].getAttribute(key);
      } else {
        for (var i = 0; i < this.length; i++) {
          for (var j in key) {
            if (key.hasOwnProperty(j)) {
              var value = key[j];
              if (value === null) {
                this[i].removeAttribute(j);
              } else {
                if (typeof value === "undefined") {
                  value = "";
                }
                this[i].setAttribute(j, key[j]);
              }
            }
          }
        }
        return this;
      }
    } else {
      for (var i = 0; i < this.length; i++) {
        this[i].setAttribute(key, value);
      }
      return this;
    }
  },
  addClass: function (value) {
    var supportClassList = false;
    if ("classList" in document.documentElement) {
      supportClassList = true;
    }
    this.addClass = function (value) {
      var list = typeof value === "string" ? value === "" ? [] : value.split(" ") : value;
      if (list && list.length) {
        for (var i = 0; i < this.length; i++) {
          var t = this[i];
          if (t) {
            var classList = [];
            if (!supportClassList) {
              classList = t.className ? t.className.split(" ") : [];
            }
            for (var j in list) {
              if (list.hasOwnProperty(j)) {
                if (supportClassList) {
                  t.classList.add(list[j]);
                } else {
                  classList.push(list[j]);
                }
              }
            }
            if (!supportClassList) {
              t.className = classList.join(" ");
            }
          }
        }
      }
      return this;
    };
    return this.addClass.apply(this, arguments);
  },
  removeClass: function (value) {
    var supportClassList = false;
    if ("classList" in document.documentElement) {
      supportClassList = true;
    }
    this.removeClass = function (value) {
      var list = typeof value === "string" ? value === "" ? [] : value.split(" ") : value;
      for (var i = 0; i < this.length; i++) {
        var t = this[i];
        if (list && list.length) {
          if (t) {
            if (supportClassList) {
              for (var j in list) {
                if (list.hasOwnProperty(j)) {
                  t.classList.remove(list[j]);
                }
              }
            } else {
              var classList = t.className ? t.className.split(" ") : [];
              var map = {};
              for (var key in list) {
                map[list[key]] = 1;
              }
              var out = [];
              for (var key in classList) {
                var tmp = classList[key];
                if (!map[tmp]) {
                  out.push(tmp);
                }
              }
              t.className = out.join(" ");
            }
          }
        } else {
          if (t && t.className) {
            t.className = "";
          }
        }
      }
      return this;
    };
    return this.removeClass.apply(this, arguments);
  },
  css: function () {
    function _css() {
      var key = arguments[0], val = arguments[1];
      if (!arguments.length) {
        return _getCssObj.call(this, this[0]);
      } else if (arguments.length === 1) {
        if (typeof key === "string") {
          var computedStyle = _getCssObj.call(this, this[0]);
          return computedStyle && computedStyle[key];
        } else {
          var reg1 = /%|px/;
          for (var i = 0; i < this.length; i++) {
            for (var j in key) {
              if (key.hasOwnProperty(j)) {
                var value = key[j];
                var keys = {
                  width: 1,
                  height: 1,
                  left: 1,
                  top: 1,
                  right: 1,
                  bottom: 1
                };
                if (keys[j]) {
                  if (!reg1.test(value)) {
                    value += "px";
                  }
                }
                this[i].style[j] = value;
              }
            }
          }
        }
      } else {
        for (var i = 0; i < this.length; i++) {
          this[i].style[key] = val;
        }
      }
      return this;
    }
    var _getCssObj;
    if (window.getComputedStyle) {
      _getCssObj = function (el) {
        if (this.isDOM(el)) {
          return document.defaultView.getComputedStyle(el, null);
        }
      };
    } else {
      _getCssObj = function (el) {
        if (this.isDOM(el)) {
          return el.style;
        }
      };
    }
    this.css = _css;
    return _css.apply(this, arguments);
  },
  appendTo: function (selector) {
    var parent = Query(selector)[0];
    if (parent) {
      for (var i = 0; i < this.length; i++) {
        var el = this[i];
        parent.appendChild(el);
      }
    }
    return this;
  },
  remove: function () {
    for (var i = 0; i < this.length; i++) {
      var el = this[i];
      if (el) {
        if (el.remove) {
          el.remove();
        } else {
          el.parentNode && el.parentNode.removeChild && el.parentNode.removeChild(el);
        }
      }
    }
    return this;
  }
};

function ready(callback, doc) {
  if (doc.body) {
    setTimeout(callback, 0);
  } else {
    doc.addEventListener("DOMContentLoaded", function () {
      doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
      callback();
    }, false);
  }
}

var getFTPFilePath = function () {
  function confuseWord(word) {
    var confusedWord = "";
    var weigth = 1;
    for (var i = word.length - 7 <= 0 ? 0 : word.length - 8; i < word.length; i++) {
      weigth = weigth * (numToASC(word.charAt(i)) % 9 + 1);
    }
    for (var i = 1; i < word.length; i++) {
      confusedWord += getChangeChar(word.charAt(i), (numToASC(word.charAt(i - 1)) % 9 + i) * weigth * i);
    }
    return confusedWord;
  }
  function getChangeChar(c, i) {
    var changedAscii = numToASC(c) + i;
    changedAscii = changedAscii % 122;
    if (changedAscii < 65) {
      changedAscii = changedAscii + 65;
    }
    if (changedAscii > 122) {
      changedAscii = 122 - changedAscii % 122;
    }
    if (changedAscii > 90 && changedAscii < 97) {
      if (i % 2 == 0) {
        changedAscii = 90 - changedAscii % 90;
      } else {
        changedAscii = 97 + changedAscii % 90;
      }
    }
    return ASCToAlpha(changedAscii);
  }
  function numToASC(num) {
    return parseInt(num, 10) + 48;
  }
  function ASCToAlpha(asc) {
    return {
      65: "A",
      66: "B",
      67: "C",
      68: "D",
      69: "E",
      70: "F",
      71: "G",
      72: "H",
      73: "I",
      74: "J",
      75: "K",
      76: "L",
      77: "M",
      78: "N",
      79: "O",
      80: "P",
      81: "Q",
      82: "R",
      83: "S",
      84: "T",
      85: "U",
      86: "V",
      87: "W",
      88: "X",
      89: "Y",
      90: "Z",
      97: "a",
      98: "b",
      99: "c",
      100: "d",
      101: "e",
      102: "f",
      103: "g",
      104: "h",
      105: "i",
      106: "j",
      107: "k",
      108: "l",
      109: "m",
      110: "n",
      111: "o",
      112: "p",
      113: "q",
      114: "r",
      115: "s",
      116: "t",
      117: "u",
      118: "v",
      119: "w",
      120: "x",
      121: "y",
      122: "z"
    }[asc];
  }
  return function (id, suffix) {
    var folders = [];
    var result = "";
    for (var i = id.length; i > 0; i = i - 4) {
      folders.push(id.substring(i > 4 ? i - 4 : 0, i));
    }
    var confused = confuseWord(id);
    for (var i = folders.length - 1; i > 0; i--) {
      result += folders[i] + "/";
    }
    result = result + confused + folders[0] + "." + suffix;
    return result;
  };
}();

var UTIL = tima && tima.UTIL || {};

var EPG = tima && tima.EPG || {};

var Date2 = tima && tima.Date || Date;

var String2 = tima && tima.String;

var variable = EPG.profiles;

var slice = UTIL.slice;

var each = UTIL.each;

var apply = UTIL.apply;

var merge = UTIL.merge;

var sclone = UTIL.sclone;

var __localStorage = {};

function setItem(namespace, key, value) {
  __localStorage[namespace] || (__localStorage[namespace] = {});
  __localStorage[namespace][key] = value;
}

function getItem(namespace, key) {
  return __localStorage[namespace] && __localStorage[namespace][key] || undefined;
}

function removeItem(namespace, key) {
  if (key === "*") {
    delete __localStorage[namespace];
  } else {
    if (__localStorage[namespace]) {
      delete __localStorage[namespace][key];
    }
  }
}

Date2.prototype.format = function (format) {
  !format && (format = "yyyy-MM-dd hh:mm:ss");
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3)
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").slice(-RegExp.$1.length));
  }
  if (/(W)/.test(format)) {
    format = format.replace(RegExp.$1, ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][this.getDay()]);
  }
  if (/(S+)/.test(format)) {
    format = format.replace(RegExp.$1, ("00" + this.getMilliseconds()).slice(-3).slice(0, RegExp.$1.length));
  }
  each(o, function (v, k) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, ("00" + v).slice(-RegExp.$1.length));
    }
  });
  return format;
};

Date2.prototype.toGmt = function () {
  if (!this.isGmt) {
    this.isGmt = true;
    this.setMinutes(this.getMinutes() + this.getTimezoneOffset());
  }
  return this;
};

Date2.prototype.toLoc = function () {
  if (this.isGmt) {
    delete this.isGmt;
    this.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  }
  return this;
};

Date2.prototype.parse = function (dateStr, format, isGmt) {
  !format && (format = "yyyyMMddhhmmss");
  function match(str, key) {
    var m = String.prototype.match.call(str, key);
    if (m) {
      var begin = m.index;
      var end = begin + m[0].length;
      return [begin, end];
    }
  }
  var m_year = match(format, "y+");
  var m_month = match(format, "M+");
  var m_date = match(format, "d+");
  var m_hour = match(format, "h+");
  var m_minutes = match(format, "m+");
  var m_seconds = match(format, "s+");
  var m_milliseconds = match(format, "S+");
  var yyyy = m_year && dateStr.substring(m_year[0], m_year[1]) || "0", MM = m_month && dateStr.substring(m_month[0], m_month[1]) - 1, dd = m_date && dateStr.substring(m_date[0], m_date[1]), hh = m_hour && dateStr.substring(m_hour[0], m_hour[1]), mm = m_minutes && dateStr.substring(m_minutes[0], m_minutes[1]), ss = m_seconds && dateStr.substring(m_seconds[0], m_seconds[1]), SSS = m_milliseconds && dateStr.substring(m_milliseconds[0], m_milliseconds[1]);
  if (yyyy.length == 4) {
    this.setFullYear(yyyy);
  } else {
    this.setYear(yyyy);
  }
  this.setMonth(MM || 0);
  this.setDate(dd || 0);
  this.setHours(hh || 0);
  this.setMinutes(mm || 0);
  this.setSeconds(ss || 0);
  this.setMilliseconds(SSS % 1e3 || 0);
  if (isGmt) {
    this.isGmt = !!isGmt;
  }
  return this;
};

function getVariable(key) {
  if (/^EPG:/.test(key)) {
    return EPG[key.replace("EPG:", "")];
  } else {
    return apply(variable && variable.get, [key]);
  }
}

function getHelper(name) {
  return EPG.helper[name];
}

function Search(doc, win) {
  return {
    get: function (name, wsearch) {
      var _search = (wsearch || win.location.search || "").replace(/[^?]*\?/, "");
      if (name && name !== "*") {
        var reg = new RegExp("(^|&)" + name + "(?:=([^&]*))*(&|$)", "i");
        var r = _search.match(reg);
        return r && parse(r[2]);
      } else {
        var out = {};
        if (_search) {
          each(_search.split("&"), function (item) {
            var tmp = item.split("=");
            if (tmp[0]) {
              out[tmp[0]] = parse(tmp[1]);
            }
          });
        }
        return out;
      }
    },
    toUrl: function (obj) {
      var out = [];
      each(obj, function (value, key) {
        if (typeof value === "undefined" || value === "") {
          out.push(key);
        } else if (value !== null) {
          out.push(key + "=" + value);
        }
      });
      return out.join("&");
    },
    append: function (url, opt) {
      var _url = url || win.location.href;
      var _optOld = this.get("", _url.split("?")[1] || "?"), _opt = opt;
      if (typeof opt === "string" || typeof opt === "number") {
        _opt = this.get("", "" + opt);
      }
      each(_opt, function (value, key) {
        _optOld[key] = value;
      });
      var param = this.toUrl(_optOld);
      _url = _url.replace(/\?.*$|$/, param ? "?" + param : "");
      return _url;
    }
  };
}

function parse(unkonw) {
  if (unkonw === "null") {
    unkonw = null;
  } else if (unkonw === "undefined") {
    unkonw = undefined;
  } else if (unkonw === "true") {
    unkonw = true;
  } else if (unkonw === "false") {
    unkonw = false;
  }
  return unkonw;
}

function getTokens() {
  return window.cwindow && window.cwindow.$ && window.cwindow.$.tokens;
}

function loader(url, opt) {
  var cbName, _opt = {
    replace: opt && opt.replace || "CaLlBacK",
    charset: opt && opt.charset || "UTF-8",
    timeout: opt && opt.timeout || 2e3,
    loading: opt && opt.loading,
    success: opt && opt.success,
    error: opt && opt.error,
    jsonpName: opt && opt.jsonpName
  };
  if (cbName = _opt.jsonpName ? _opt.jsonpName : "callback_" + (new Date).getTime() + Math.random().toFixed(3).split(".")[1], !window[cbName] || !window[cbName].loading) {
    var script = document.createElement("script");
    script.type = "text/javascript",
      script.charset = _opt.charset,
      script.src = _opt.jsonpName ? url : url.replace(_opt.replace, cbName), document.head.appendChild(script), "function" == typeof _opt.loading && _opt.loading(),
      function (cbName, timeout, $script, success, error) {
        var f = function () {
          $script && (f.abort ? error(arguments) : (clearTimeout(f.timeoutTimer), success(arguments)), delete window[f.cbName].loading, /callback_/.test(f.cbName) && delete window[f.cbName], $script.parentNode.removeChild($script), $script = success = error = timeout = f = null)
        };
        f = f.bind(f), window[cbName] = f, f.loading = !0, f.cbName = cbName, f.timeout = timeout, f.timeoutTimer = setTimeout(function () {
          "function" == typeof window[cbName] && (window[cbName].abort = !0, window[cbName]())
        }, timeout)
      }(cbName, _opt.timeout, script, _opt.success, _opt.error)
  }
}

function ajax(opt, postRurnStr) {
  opt = opt || {};
  opt.loading && opt.loading();
  opt.method = opt.method && opt.method.toUpperCase() || "GET";
  opt.url = opt.url || "";
  opt.async = UTIL.isUndefined(opt.async) ? true : opt.async;
  opt.cache = UTIL.isUndefined(opt.cache) ? false : opt.cache;
  opt.data = opt.data || null;
  if (opt.method === "POST" && !opt.data && /#/.test(opt.url)) {
    var urls = opt.url.split("#");
    if (urls[1]) {
      try {
        var data = {};
        var datas = urls[1].split("&");
        for (var i = 0; i < datas.length; i++) {
          var tmp = datas[i].split("=");
          data[tmp[0]] = tmp[1];
        }
        opt.data = JSON.stringify(data);
      } catch (e) { }
    }
    opt.url = urls[0];
  }
  var timeout = opt && opt.timeout || 3e3;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.tokens = getTokens();
  xmlHttp.open(opt.method, opt.url, opt.async);
  if (!opt.cache) {
    xmlHttp.setRequestHeader("Cache-Control", "no-cache");
  }
  if (opt.method === "POST") {
    xmlHttp.setRequestHeader("Content-Type", "application/json");
  }
  xmlHttp.onreadystatechange = function () {
    if (!opt || !xmlHttp) {
      return;
    }
    if (xmlHttp.tokens && xmlHttp.tokens !== getTokens()) {
      if (xmlHttp.timeoutTimer) {
        clearTimeout(xmlHttp.timeoutTimer);
      }
      opt = xmlHttp.onreadystatechange = null;
      xmlHttp.abort();
      xmlHttp = null;
      return;
    }
    if (xmlHttp && xmlHttp.readyState == 4) {
      if (opt.async) {
        clearTimeout(xmlHttp.timeoutTimer);
      }
      var txt = "";
      if (xmlHttp.status >= 200 && xmlHttp.status < 300 || xmlHttp.status == 304) {
        txt = xmlHttp.responseText;
        opt.success && opt.success(txt);
      } else {
        txt = new Error("ajax error, code is " + xmlHttp.status + ", url is " + opt.url);
        opt.error && opt.error(txt);
      }
      opt.complete && opt.complete(txt);
      txt = xmlHttp.onreadystatechange = xmlHttp = opt = null;
    }
  };
  if (opt.async) {
    xmlHttp.timeoutTimer = setTimeout(function () {
      xmlHttp && xmlHttp.abort();
    }, timeout);
  }
  postRurnStr ? xmlHttp.send(JSON.stringify(opt.data)) : xmlHttp.send(opt.data);
}

function get(url, opt, async) {
  return ajax(merge({
    url: url,
    async: async
  }, opt, {
    method: "GET"
  }));
}

function post(url, opt, async, tStr) {
  if (tStr) {
    return ajax(merge({
      url: url,
      async: async
    }, opt, {
      method: "POST"
    }), tStr);
  } else {
    return ajax(merge({
      url: url,
      async: async
    }, opt, {
      method: "POST"
    }));
  }
}

function Delete(url, opt, async) {
  return ajax(merge({
    url: url,
    async: async
  }, opt, {
    method: "DELETE"
  }));
}

function Timer(fn, delay) {
  if (!(this instanceof Timer)) {
    return new Timer(fn, delay);
  }
  var cfg = {
    fn: fn,
    delay: delay || 100
  };
  return {
    begin: function (delay) {
      this.clear();
      this._timer = setTimeout(cfg.fn, delay || cfg.delay);
      this.type = "begin";
      return this;
    },
    clear: function () {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
      delete this.type;
      return this;
    },
    now: function () {
      this.clear();
      apply(cfg.fn);
      this.type = "now";
      return this;
    },
    repeat: function (delay) {
      this.clear();
      this._timer = setInterval(cfg.fn, delay || cfg.delay);
      this.type = "repeat";
      return this;
    }
  };
}

function Tpl(html) {
  function replaceFn(a, b, c, d) {
    var out = "";
    var syntax = b && b.replace(/ .*$/, "") || d, key = b && b.replace(syntax + " ", "") || d, scope = this.scopes[this.scopes.length - 1];
    switch (syntax) {
      case "#each":
        var ds = key === "this" ? scope.ds : scope.ds[key];
        var tmpScope = scopeFn(ds);
        tmpScope.type = 1;
        this.scopes.push(tmpScope);
        for (var i in ds) {
          if (ds.hasOwnProperty(i)) {
            this.scopes[this.scopes.length - 1].index = i;
            out += c.replace(/{{([^}]+?)}}/g, replaceFn.bind(this));
          }
        }
        break;

      case "/each":
        this.scopes.pop();
        break;

      default:
        var tmp = scope.ds;
        if (scope.type === 1) {
          tmp = tmp[scope.index];
        }
        var str = key === "this" && tmp + "" || tmp[key] + "" || "";
        out = getStrFromData({
          key: key,
          index: scope.index,
          ds: tmp
        }, this.unencode);
        break;
    }
    return out;
  }
  function getStrFromData(obj, unencode) {
    var out = "";
    switch (obj.key) {
      case "this":
        out = obj.ds;
        break;

      case "index":
        out = obj.index;
        break;

      default:
        if (unencode) {
          if (obj.ds.hasOwnProperty(obj.key)) {
            out = obj.ds[obj.key];
          } else {
            out = "{{" + obj.key + "}}";
          }
        } else {
          out = encodeStr(obj.ds[obj.key] || "");
        }
        break;
    }
    return out;
  }
  function encodeStr(str) {
    var s = str + "", out = "", encodes = {
      "&": "&#38;",
      "<": "&#60;",
      ">": "&#62;",
      '"': "&#34;",
      "'": "&#39;",
      "/": "&#47;"
    };
    out = s.replace(/[&"'<>\/]/g, function (m) {
      return encodes[m];
    });
    return out;
  }
  function scopeFn(data) {
    return {
      ds: data,
      type: data.length > -1 ? 1 : 0,
      index: 0
    };
  }
  function compile(data, unencode) {
    this.data = data;
    this.unencode = unencode;
    this.scopes = [scopeFn(data)];
    return this.tpl.replace(/{{(#each.+?)}}(.*?)(?={{\/each}})|{{([^}]+?)}}/g, replaceFn.bind(this));
  }
  function Init(tpl) {
    this.tpl = tpl.replace(/^\s*|\s*$/gm, "").replace(/[\r\n]+/gm, "");
    return this;
  }
  Init.prototype = {
    constructor: Init,
    compile: function (data, unencode) {
      var out = compile.call(this, data, unencode);
      delete this.data;
      delete this.scopes;
      return out;
    },
    render: function (parent, data, unencode) {
      $(parent).html(this.compile(data, unencode));
    }
  };
  return new Init(html);
}

function Tps(str) {
  if (UTIL.isString(str)) {
    return apply(String2.prototype.format, arguments);
  }
}

function Services(txt, info) {
  return EPG.initServices(ajax, txt, info);
}

function Marquee(opt) {
  var _Marquee_begin = function (opt) {
    opt.height = opt.height || "99%";
    opt.width = opt.width || "98%";
    opt.el.innerHTML = '<marquee width="' + opt.width + '" height="' + opt.height + '" scrollamount="4">' + opt.all + "</marquee>";
  };
  if (this instanceof Marquee) {
    var who = this;
    return function (opt) {
      var beginNew = opt && opt.el;
      var last = who.last;
      if (last && beginNew && Query.isEqualNode(opt.el, last.el) && /\<marquee[^>]*>/.test(last.el.innerHTML)) {
        return;
      }
      if (last) {
        last.el && last.el.innerHTML !== "" && /\<marquee[^>]*>/.test(last.el.innerHTML) && (last.el.innerHTML = last.text || "");
        who.last = null;
      }
      if (beginNew) {
        who.last = {
          el: opt.el,
          text: opt.short || opt.el.innerText || opt.el.textContent || opt.el.innerHTML
        };
        _Marquee_begin(opt);
      }
    };
  } else {
    var beginNew = opt && opt.el;
    if (Marquee.last && beginNew && Query.isEqualNode(opt.el, Marquee.last.el) && /\<marquee[^>]*>/.test(Marquee.last.el.innerHTML)) {
      return;
    }
    if (Marquee.last) {
      Marquee.last.el && Marquee.last.el.innerHTML !== "" && /\<marquee[^>]*>/.test(Marquee.last.el.innerHTML) && (Marquee.last.el.innerHTML = Marquee.last.text || "");
      Marquee.last = null;
    }
    if (beginNew) {
      Marquee.last = {
        el: opt.el,
        text: opt.short || opt.el.innerText || opt.el.textContent || opt.el.innerHTML
      };
      _Marquee_begin(opt);
    }
  }
}

function Marquee2(opt) {
  function gogogo(el, val) {
    if (el && el.style) {
      el.style.webkitAnimation = val;
    }
  }
  var _Marquee_begin = function (obj, opt) {
    var all = opt.el.innerHTML;
    var parentWidth = opt.el.clientWidth;
    var parentStyle = window.getComputedStyle(opt.el);
    var textIndent = parentStyle.textIndent;
    opt.el.innerHTML = "";
    var oM = document.createElement("m");
    oM.style.display = "block";
    oM.innerHTML = all;
    oM.style.display = "-webkit-inline-box";
    oM.style.width = "fit-content";
    oM.style.minWidth = parentWidth + "px";
    oM.style.textAlign = parentStyle.textAlign;
    oM.style.textIndent = textIndent;
    opt.el.appendChild(oM);
    var v = opt.speed || 40;
    var s = oM.offsetWidth;
    var animate = opt.animate || "marquee infinite linear normal";
    if (parentWidth < s) {
      obj.timer = setTimeout(gogogo, Math.min(parentWidth / 200 * 1e3, 3e3), oM, s / v + "s " + animate);
    } else {
      opt.el.innerHTML = all;
    }
    oM = null;
  };
  if (this instanceof Marquee2) {
    var who = this;
    return function (opt) {
      var beginNew = opt && opt.el;
      var last = who.last;
      if (last && beginNew && Query.isEqualNode(opt.el, last.el) && /\<m[^>]*>/.test(last.el.innerHTML)) {
        return;
      }
      if (last) {
        last.el && last.el.innerHTML !== "" && /\<m[^>]*>/.test(last.el.innerHTML) && (last.el.innerHTML = last.text || "");
        clearTimeout(who.timer);
        who.timer = who.last = null;
      }
      if (beginNew) {
        who.last = {
          el: opt.el,
          text: opt.short || opt.el.innerHTML || opt.el.innerText || opt.el.textContent
        };
        apply(_Marquee_begin, [who, opt]);
      }
    };
  } else {
    var beginNew = opt && opt.el;
    if (Marquee2.last && beginNew && Query.isEqualNode(opt.el, Marquee2.last.el) && /\<m[^>]*>/.test(Marquee2.last.el.innerHTML)) {
      return;
    }
    if (Marquee2.last) {
      Marquee2.last.el && Marquee2.last.el.innerHTML !== "" && /\<m[^>]*>/.test(Marquee2.last.el.innerHTML) && (Marquee2.last.el.innerHTML = Marquee2.last.text || "");
      clearTimeout(Marquee2.timer);
      Marquee2.timer = Marquee2.last = null;
    }
    if (beginNew) {
      Marquee2.last = {
        el: opt.el,
        text: opt.short || opt.el.innerHTML || opt.el.innerText || opt.el.textContent
      };
      apply(_Marquee_begin, [Marquee2, opt]);
    }
  }
}

(function (root) {
  function getOrCreateNS(that, space, once) {
    space || (space = "def");
    var _NS_topic = once ? that._NS_Topic_once : that._NS_topic;
    return _NS_topic && _NS_topic[space] || undefined;
  }
  function setOrCreateNS(that, space, once, fn) {
    space || (space = "def");
    var _NS_topic = once ? that._NS_Topic_once : that._NS_topic;
    if (!_NS_topic) {
      _NS_topic = once ? that._NS_Topic_once = {} : that._NS_topic = {};
    }
    _NS_topic[space] || (_NS_topic[space] = []);
    _NS_topic[space].push(fn);
  }
  function emptyOnceNS(that, space) {
    if (that._NS_Topic_once && that._NS_Topic_once[space]) {
      delete that._NS_Topic_once[space];
    }
  }
  function emptyAllNS(that) {
    if (that._NS_topic) {
      delete that._NS_topic;
    }
    if (that._NS_Topic_once) {
      delete that._NS_Topic_once;
    }
  }
  var TopicProto = {
    constructor: Topic,
    pub: function (space) {
      var args = UTIL.slice(arguments, 1);
      setTimeout(function (space, that, args) {
        UTIL.each(getOrCreateNS(that, space), function (fn) {
          UTIL.apply(fn, args);
        });
        var onceSpace = getOrCreateNS(that, space, true);
        UTIL.each(onceSpace, function (fn) {
          UTIL.apply(fn, args);
        });
        if (onceSpace) {
          emptyOnceNS(that, space);
        }
        space = args = null;
      }, 0, space, this, args);
      space = args = null;
    },
    sub: function (space, fn, once) {
      var list = getOrCreateNS(this, space, once);
      var findIndex = UTIL.lookupIndex(list, fn);
      if (findIndex == -1) {
        setOrCreateNS(this, space, once, fn);
      }
    },
    once: function (space, fn) {
      this.sub(space, fn, true);
    },
    rm: function (space, fn, once) {
      var list = getOrCreateNS(this, space, once);
      var findIndex = UTIL.lookupIndex(list, fn);
      if (findIndex > -1) {
        list.splice(findIndex, 1);
      }
    },
    rmOnce: function (space, fn) {
      this.rm(space, fn, true);
    },
    empty: function () {
      emptyAllNS(this);
    }
  };
  function Topic() { }
  Topic.prototype = TopicProto;
  root.Topic = Topic;
})(window);

(function (root) {
  var keyRespondObj = {};
  var silenceKeyRespondObj = {};
  var inited, extend, apply, slice;
  function setResObj(obj) {
    init();
    var out = {};
    extend.apply(out, [obj]);
    return out;
  }
  function execRespond(obj, keyName, key, group) {
    var info = [keyName, key, group];
    var respond = apply(obj[keyName], info, obj);
    if (!respond && group) {
      for (var i = group.length; i >= 0; i--) {
        respond = apply(obj[group[i]], info, obj);
        if (respond) {
          break;
        }
      }
    }
    return respond;
  }
  function init() {
    if (inited) return;
    inited = true;
    extend = UTIL.extend;
    apply = UTIL.apply;
    slice = UTIL.slice;
  }
  var keyTool = {
    keyRes: function (keyName) {
      init();
      try {
        var args = slice(arguments);
        args.unshift(keyRespondObj);
        var respond = apply(execRespond, args);
        if (!respond) {
          args.shift();
          args.unshift(silenceKeyRespondObj);
          respond = apply(execRespond, args);
        }
        return respond;
      } catch (e) {
        Logger.out.error = ["%c%s \n\t%s", "color:red;font-style:italic;", e.message, e.stack && e.stack.match(/at.*/) && e.stack.match(/at.*/)[0]];
      }
    },
    setRes: function (obj) {
      keyRespondObj = setResObj(obj);
    },
    setDftRes: function (obj) {
      silenceKeyRespondObj = setResObj(obj);
    },
    reset: function () {
      this.setRes({});
      this.setDftRes({});
    }
  };
  window.keyTool = keyTool;
})(window);

(function (root) {
  var inited, util, extend, apply, each, slice;
  var activeObj, unCoverObj, coveredList = [];
  function init() {
    if (inited) return;
    inited = true;
    util = UTIL;
    extend = util.extend;
    apply = util.apply;
    each = util.each;
    slice = util.slice;
  }
  var _plugins = {};
  var _defaultPlauins = {};
  function addToList(list, key, plugin) {
    init();
    list[key] = plugin;
  }
  function rmFromList(list, key) {
    delete list[key];
  }
  function getDpSilenceKeys() {
    var tmp = {};
    each(_defaultPlauins, function (dp) {
      var dftKeysMap = {};
      each(dp.keysDftMap, function (key) {
        dftKeysMap[key] = dp.keysMap[key];
      });
      extend.apply(tmp, [dftKeysMap]);
    });
    return tmp;
  }
  function deactive() {
    if (activeObj) {
      var activeObjTmp = activeObj;
      clearActive();
      apply(activeObjTmp && activeObjTmp.deactive, null, activeObjTmp);
      activeObjTmp = null;
    }
  }
  function clearActive() {
    activeObj = undefined;
    keyTool.setRes({});
  }
  function uncover() {
    if (unCoverObj) {
      coveredList.push(unCoverObj);
      unCoverObj = null;
    }
    if (coveredList.length) {
      var index = coveredList.length;
      each(coveredList, function (p, i) {
        if (apply(p.uncover, null, p)) {
          index = i;
          return true;
        }
      }, 0, 1);
      var plugin = coveredList.splice(index)[0];
      if (plugin) {
        pluginTool.active(plugin.key);
      }
    }
  }
  var pluginTool = {
    add: function (key, obj) {
      addToList(_plugins, key, obj);
      if (obj.dft) {
        addToList(_defaultPlauins, key, obj);
        keyTool.setDftRes(getDpSilenceKeys());
      }
    },
    get: function (key) {
      return _plugins[key];
    },
    active: function (key) {
      if (activeObj && activeObj.key === key) {
        return key;
      }
      var tmp = this.get(key);
      if (!tmp) {
        return;
      }
      var lastPlugin = activeObj;
      if (lastPlugin) {
        if (tmp && tmp.type === "weak") {
          if (lastPlugin.type !== "weak") {
            unCoverObj = lastPlugin;
          }
        } else {
          if (lastPlugin.type === "weak") {
            deactive();
            lastPlugin = unCoverObj;
            unCoverObj = null;
          }
          if (apply(lastPlugin && lastPlugin.cover, null, lastPlugin)) {
            coveredList.push(lastPlugin);
          }
        }
        deactive();
      }
      activeObj = tmp;
      tmp = null;
      if (activeObj) {
        apply(activeObj.active, null, activeObj);
        keyTool.setRes(activeObj.keysMap);
        return key;
      }
    },
    deactive: function (key) {
      var deactiveOp = false;
      if (key && activeObj && activeObj.key === key) {
        deactiveOp = true;
      }
      if (!key && activeObj) {
        deactiveOp = true;
      }
      if (deactiveOp) {
        deactive();
        uncover();
      }
    },
    rm: function (key) {
      var obj = this.get(key);
      if (obj) {
        this.deactive(key);
        apply(obj.destroy, null, obj);
        if (obj.dft) {
          rmFromList(_defaultPlauins, key);
          keyTool.setDftRes(getDpSilenceKeys());
        }
        each(coveredList, function (plugin, i) {
          if (plugin.key === key) {
            return coveredList.splice(i, 1);
          }
        });
        rmFromList(_plugins, key);
      }
    },
    reset: function () {
      clearActive();
      for (var i in _plugins) {
        var p = _plugins[i];
        if (p) {
          apply(p.destroy, null, p);
        }
        p = null;
      }
      coveredList = [];
      _plugins = {};
      _defaultPlauins = {};
      unCoverObj = null;
    },
    toString: function () {
      return {
        actived: activeObj,
        list: _plugins,
        listDft: _defaultPlauins,
        covered: coveredList,
        uncovered: unCoverObj
      };
    }
  };
  root.pTool = pluginTool;
})(window);

var MP = {};

var SERVICES = {};

var VS = initVS(getVariable("common.dc"));

var commonProto = {
  getGlobalData: function (key) {
    var out = getItem("cwindow", key);
    if (out !== null && out !== "null" && typeof out !== "undefined" && out !== "undefined" && out !== "") {
      return sclone(out);
    }
  },
  saveGlobalData: function (key, value) {
    if (typeof value === "undefined") {
      removeItem("cwindow", key);
    } else {
      setItem("cwindow", key, sclone(value));
    }
  },
  saveBackUrl: function (url, nextUrl, urlHandle) {
    var key = "G_BACK_URL_LIST";
    var list = this.getGlobalData(key) || [];
    var _url = this.search.append(url, {
      POSITIVE: null
    });
    if (urlHandle) {
      _url = urlHandle(_url);
    }
    if (_url) {
      list.push(_url);
    }
    if (nextUrl) {
      var _nextUrl = nextUrl.split("?")[0];
      var hasDetailPage = /detailPage\/(xilieju|vod|series)\//;
      var isDetailPage;
      if (hasDetailPage.test(_nextUrl)) {
        isDetailPage = true;
      }
      for (var i = 0; i < list.length; i++) {
        var cut = isDetailPage && hasDetailPage.test(list[i]);
        cut = cut || _nextUrl === list[i].split("?")[0];
        if (cut) {
          list.splice(i);
          break;
        }
      }
    }
    this.saveGlobalData(key, list);
  },
  getBackUrl: function (pop) {
    var out = "";
    var key = "G_BACK_URL_LIST";
    var list = this.getGlobalData(key) || [];
    if (list.length) {
      out = list.pop();
      if (pop) {
        this.saveGlobalData(key, list);
      }
    }
    return out;
  },
  emptyBackUrl: function () {
    var key = "G_BACK_URL_LIST";
    this.saveGlobalData(key, []);
  }
};

function initVS(url) {
  return {
    url: url,
    userId: EPG.userId,
    stbId: EPG.stbId,
    node: EPG.node,
    first: Authentication.CTCGetConfig("firstBoot") ? false : true,
    firstBoot: function () {
      if (!this.first) return false;
      this.first = false;
      Authentication.CTCSetConfig("firstBoot", "2");      
      var analysistype = "login";
      this.send({
        analysistype: analysistype,
        mac: EPG.mac,
        stbModel: EPG.STBType,
        areaid: EPG.areaId || ""
      });
      return true;
    },
    vodPlayBegin: function (opt) {
      var analysistype = "vodbegin";
      var tmp = {
        vodid: opt.contentId,
        times: opt.duration,
        vodname: opt.name,
        colid: opt.categoryId,
        chargeSpIds: opt.chargeSpIds || "",
        analysistype: analysistype,
        groupId: opt.groupId || "",
        ztCategoryId: opt.ztCategoryId || "",
        playModel: opt.playModel || ""
      };
      if (opt.deferred) {
        tmp.deferred = true;
      }
      if (opt.mini) {
        tmp.mini = true;
      }
      this.send(tmp);
    },
    vodPlay: function (contentId, duration, name, categoryId, chargeSpIds, ztCategoryId, playModel, groupId) {
      this.vodPlayBegin({
        contentId: contentId,
        duration: duration,
        name: name,
        categoryId: categoryId,
        chargeSpIds: chargeSpIds,
        ztCategoryId: ztCategoryId,
        playModel: playModel,
        groupId: groupId
      });
    },
    vodSizePlay: function (contentId, duration, name, categoryId, chargeSpIds, ztCategoryId, playModel, groupId) {
      this.vodPlayBegin({
        contentId: contentId,
        duration: duration,
        name: name,
        categoryId: categoryId,
        chargeSpIds: chargeSpIds,
        ztCategoryId: ztCategoryId,
        playModel: playModel || "small",
        groupId: groupId,
        deferred: true,
        mini: true
      });
    },
    serialPlayBegin: function (opt) {
      var analysistype = "vodseriesbegin";
      this.send({
        vodid: opt.contentId,
        times: opt.duration,
        vodname: opt.name,
        colid: opt.categoryId,
        chargeSpIds: opt.chargeSpIds || "",
        analysistype: analysistype,
        num: opt.num,
        groupId: opt.groupId || "",
        ztCategoryId: opt.ztCategoryId || "",
        playModel: opt.playModel || ""
      });
    },
    serialPlay: function (contentId, duration, name, categoryId, num, chargeSpIds, ztCategoryId, playModel, groupId) {
      this.serialPlayBegin({
        contentId: contentId,
        duration: duration,
        name: name,
        categoryId: categoryId,
        num: num,
        chargeSpIds: chargeSpIds,
        ztCategoryId: ztCategoryId,
        playModel: playModel,
        groupId: groupId
      });
    },
    serialSizePlay: function (contentId, duration, name, categoryId, num, chargeSpIds, ztCategoryId, playModel, groupId) {
      this.serialPlayBegin({
        contentId: contentId,
        duration: duration,
        name: name,
        categoryId: categoryId,
        num: num,
        chargeSpIds: chargeSpIds,
        ztCategoryId: ztCategoryId,
        playModel: playModel || "small",
        groupId: groupId,
        deferred: true,
        mini: true
      });
    },
    xljPlay: function (contentId, duration, name, categoryId, chargeSpIds, ztCategoryId, playModel, groupId) {
      this.vodPlay(contentId, duration, name, categoryId, chargeSpIds, ztCategoryId, playModel, groupId);
    },
    tvodPlay: function (tvodchno, duration, name, begintime) {
      var analysistype = "tvodbegin";
      this.send({
        tvodchno: tvodchno,
        tvodtimes: duration,
        tvodname: name,
        analysistype: analysistype,
        tvodbegintime: begintime
      });
    },
    livePlay: function (channelNum,channelName,edition) {
      var analysistype = "channelcontinuebegin";
      this.send({
        channelid:channelNum,
        channelname:channelName,
        analysistype:analysistype,
        edition:edition, 
      });
    },
    liveSizePlay: function (channelId) {
      var analysistype = "channelcontinuebegin";
      this.send({
        channelid: channelId,
        analysistype: analysistype,
        deferred: true,
        mini: true
      });
    },
    liveContinue: function () {
      var analysistype = "channelstate";
      this.send({
        analysistype: analysistype
      });
    },
    playQuit: function (quitType) {
      var analysistype = "playEnd";
      this.send({
        analysistype: analysistype,
        quittype: quitType || "osd"
      }, true);
    },
    page: function (referpage, url, columnid) {
      var analysistype = "access";
      this.send({
        analysistype: analysistype,
        referpage: referpage,
        refer: true,
        columnid: columnid || "",
        url: url
      });
    },
    invented: function () {
      this.send({
        analysistype: "invented"
      });
    },
    zt: function (spName, spId) {
      var analysistype = "zt";
      this.send({
        analysistype: analysistype,
        spName: spName,
        spId: spId
      });
    },
    product: function (productId, state, sourcetype, referpage, productMode) {
      var analysistype = "product";
      var obj = {
        analysistype: analysistype,
        productMode: productMode,
        productid: productId,
        sourcetype: sourcetype || "",
        referpage: referpage || window.referrer && referrer.split("?")[0] || "",
        state: state
      };
      this.send(obj);
    },
    link: function (connect) {
      this.event(connect ? "success" : "failure", "01");
    },
    homeTj: function (eventdata, sync) {
      this.event(eventdata, "05", sync);
    },
    event: function (eventdata, eventcode, sync) {
      var analysistype = "event";
      this.send({
        analysistype: analysistype,
        ignore: "adnamepathid",
        eventcode: eventcode,
        eventdata: eventdata
      }, sync);
    },
    eventTj: function (event, sync) {
      this.send({
        analysistype: "event",
        ignore: "adnamepathid",
        eventclick: event.eventclick,
        eventcode: event.eventcode,
        eventdata: event.eventdata,
      }, sync)
    },
    tj: function (opt, sync) {
      var analysistype = "access";
      this.send({
        analysistype: analysistype,
        ignore: "adnamepathid",
        eventclick: opt.eventclick,
        gnid: opt.gnid,
        gid: opt.gid,
        gversion: opt.gversion,
        gtid: opt.gtid,
        gcorder: opt.gcorder
      }, sync);
    },
    getDcBaseInfo: function () {
      var info = {
        userid: this.userId,
        stbid: this.stbId,
        stbtype: this.node == "huawei" ? 2 : 1,
        processtype: "MapInfoProcess",
        version: 2,
        time: new $.Date().format("yyyyMMddhhmmss")
      };
      return info;
    },
    send: function (obj, sync) {
      var deferred = obj.deferred;
      var mini = obj.mini;
      if (this.firstBoot()) {
        this.lastReferpage = obj.referpage;
        return;
      }
      if (this.lastReferpage && deferred) {
        return;
      }
      if (this.lastReferpage) {
        delete this.lastReferpage;
      }
      clearTimeout(this.deferredTimer);
      if (deferred) {
        delete obj.deferred;
        this.deferredTimer = setTimeout(function (obj, sync, that) {
          return function () {
            that.send(obj, sync);
          };
        }(obj, sync, this), 2e3);
        return;
      }
      if (mini) {
        delete obj.mini;
      }
      if (this.frameQuitFlag) {
        sync = true;
      }
      var url = $.search.append(this.url, $.UTIL.merge(this.getDcBaseInfo(), obj));
      var currentIsVodbegin = $.UTIL.owns({
        vodbegin: 1,
        vodseriesbegin: 1,
        tvodbegin: 1,
        channelcontinuebegin: 1,
        channelstate: 1
      }, obj.analysistype);
      if (!mini && currentIsVodbegin) {
        this.hasPlayBegin = true;
      }
      if (obj.analysistype == "playEnd" && !this.frameQuitFlag) {
        if (this.hasPlayBegin) {
          this.lastPlayOsdUrl = url;
        }
        return;
      }
      var afterLastSend = false;
      if (obj.analysistype != "event" || !mini) {
        if (this.lastPlayOsdUrl && !currentIsVodbegin) {
          afterLastSend = true;
          this.sendLastPlayOsd();
        }
      }
      if (obj.analysistype != "invented") {
        this.sendXhr(url, !sync, afterLastSend);
      }
    },
    sendLastPlayOsd: function () {
      if (this.lastPlayOsdUrl) {
        this.sendXhr(this.lastPlayOsdUrl, false);
        delete this.hasPlayBegin;
        delete this.lastPlayOsdUrl;
      }
    },
    sendXhr: function (url, sync, afterLastSend) {
      if ($.getVariable("EPG:onPc")) {
        $.log.out.info = ["vs", sync, !!this.frameQuitFlag];
        $.log.out.info = [$.search.get("*", url)];
        return true;
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      if (afterLastSend) {
        setTimeout(function () {
          xhr.send();
        }, 100);
      } else {
        xhr.send();
      }
    },
    frameQuit: function () {
      this.frameQuitFlag = true;
      this.sendLastPlayOsd();
    }
  };
}

function PureList(opt) {
  opt || (opt = {});
  this._ = {
    list: opt.list || [],
    current: +opt.current,
    loop: !!opt.loop
  };
  this._.total = +opt.total || this._.list.length;
}

PureList.prototype = {
  constructor: PureList,
  all: function () {
    return this._.list;
  },
  next: function () {
    var nextIndex = this._.current + 1;
    if (nextIndex >= this._.total) {
      if (this._.loop) {
        nextIndex = 0;
      } else {
        return false;
      }
    }
    this._.current = nextIndex;
    return this.current();
  },
  current: function () {
    return this._.list[this._.current];
  },
  currentIndex: function () {
    return this._.current;
  }
};

PureList.prototype.constructor = PureList;

function VideoList(opt) {
  apply(PureList, [opt], this);
  delete opt.list;
  this._.pre = sclone(opt.pre) || [];
  delete opt.pre;
  this.cfg = opt;
  this.cfg.onBeforePlay = function (onBeforePlay, playPreVideo, goon, preVideo) {
    if (onBeforePlay) {
      this._goon_prevideo = goon;
      apply(onBeforePlay, [playPreVideo, goon, preVideo]);
    } else {
      goon();
    }
  }.bind(this, opt.onBeforePlay && opt.onBeforePlay.bind(opt));
}

VideoList.prototype = new PureList();

merge(VideoList.prototype, {
  constructor: VideoList,
  init: function () {
    if (!this.inited) {
      this.inited = true;
      this._loaded = this._loaded.bind(this);
      this._loaded_prevideo = this._loaded_prevideo.bind(this);
      this._success = this._success.bind(this);
      this._success_prevideo = this._success_prevideo.bind(this);
      this._ended = this._ended.bind(this);
      this._ended_prevideo = this._ended_prevideo.bind(this);
      this._error = this._error.bind(this);
      this._error_prevideo = this._error_prevideo.bind(this);
      this._over_prevideo = this._over_prevideo.bind(this);
      this.mp = new MP(this.cfg);
    }
  },
  release: function () {
    if (this.mp) {
      apply(this.mp.release, null, this.mp);
      this._loaded = this._success = this._ended = this._error = this.mp = null;
      this._loaded_prevideo = this._success_prevideo = this._ended_prevideo = this._error_prevideo = this._over_prevideo = null;
    }
    if (this.cfg) {
      this.cfg = null;
    }
    if (this._) {
      this._ = null;
    }
  },
  valueOf: function () {
    var tmp = sclone(this._);
    if (tmp) {
      delete tmp.loop;
      tmp.diy = this.cfg && this.cfg.diy;
      if (!this.seeking && this.inited && this.mp) {
        if (!this.mp.isState($.MP.state.ended)) {
          var playTime = apply(this.mp.getCurrentTime, null, this.mp) || this.mp.cache.startTime;
        }
        if (tmp.pre.length) {
          if(tmp.pre.type !== 'pic'){
             tmp.pre[0].playTime = playTime;
          }
            
        } else {
          tmp.playTime = playTime;
          tmp.endPoint = this.mp.cache.endPoint;
          return tmp;
        }
      }
      if (this.cfg) {
        tmp.playTime = this.cfg.playTime;
        tmp.endPoint = this.cfg.endPoint;
      }
    }
    return tmp;
  },
  _success_prevideo: function (playUrl, startTime) {
    this._success(playUrl, startTime, true);
  },
  _error_prevideo: function () {
    this._over_prevideo(this.cfg.onError);
  },
  _ended_prevideo: function () {
    this._over_prevideo(this.cfg.onEnd, true);
  },
  _over_prevideo: function (cfgFn, onEnd) {
    this.stop();
    this._.pre.length = 0;
    apply(this._goon_prevideo);
    this._goon_prevideo = null;
    var params = [true];
    if (onEnd) {
      params = [null, null, true];
    }
    apply(cfgFn, params, this.cfg);
  },
  _loaded_prevideo: function (param) {
    this._loaded(param, true);
  },
  _success: function (playUrl, startTime, isPreVideo) {
    Logger.debug("get playUrl.success", playUrl, startTime);
    if (this.cfg) {
      if (isPreVideo) {
        this._loadStream(playUrl, startTime, isPreVideo);
      } else {
        apply(this.cfg.onBeforePlay, [function (obj) {
          if (obj && obj.contentId) {
            this._.pre.push(obj);
            this.fetch(obj, this._success_prevideo, this._error_prevideo, obj.playTime);
            delete obj.playTime;
            obj = null;
          } else if(obj && obj.type === 'pic'){
            this._.pre.push(obj);
            obj = null;
          }else {
            this._error_prevideo();
          }
        }.bind(this), function (fn) {
          setTimeout(fn, 0);
        }.bind(this, this._loadStream.bind(this, playUrl, startTime)), this._.pre.pop()], this.cfg);
      }
    }
  },
  _loaded: function (param, isPreVideo) {
    Logger.debug("MP.loaded");
    apply(this.cfg.onPlay, [param, sclone(this.current()), isPreVideo], this.cfg);
  },
  _ended: function () {
    Logger.debug("MP.ended");
    this._checkAutoNext();
  },
  _error: function () {
    Logger.debug("MP.error");
    if (!apply(this.cfg.onError, null, this.cfg)) {
      this._checkAutoNext();
    }
  },
  _allEnded: function () {
    var curr = sclone(this.current());
    var currIndex = this.currentIndex();
    delete this.cfg.playTime;
    if (this._.list.length) {
      this._.current = 0;
    }
    apply(this.cfg.onEnd, [currIndex, curr], this.cfg);
    currIndex = curr = null;
  },
  _checkAutoNext: function () {
    if (this.cfg.auto && this.next()) {
      this.play();
    } else {
      this._allEnded();
    }
  },
  _loadStream: function (playUrl, startTime, isPreVideo) {
    apply(this.cfg.loading, ["stream", isPreVideo], this.cfg);
    this._dealEvent(false, isPreVideo);
    var endPoint = 0;
    if (!isPreVideo) {
      this.cfg.playTime = 0;
      endPoint = this.cfg.endPoint;
    }
    this.mp.load(playUrl, startTime, null, endPoint);
  },
  _dealEvent: function (clear, isPreVideo) {
    if (this.mp) {
      var type = clear ? "rmOnce" : "once";
      if (clear || isPreVideo) {
        this.mp[type](MP.state.loaded, this._loaded_prevideo);
        this.mp[type](MP.state.ended, this._ended_prevideo);
        this.mp[type](MP.state.error, this._error_prevideo);
      }
      if (!isPreVideo) {
        this.mp[type](MP.state.loaded, this._loaded);
        this.mp[type](MP.state.ended, this._ended);
        this.mp[type](MP.state.error, this._error);
      }
    }
  },
  play: function () {
    this.stop();
    this.init();
    var isPreVideo = this._.pre.length;
    this._dealEvent(true, isPreVideo);
    var curr = this.current();
    if (curr) {
      apply(this.cfg.loading, ["url"], this.cfg);
      this.fetch(curr, this._success, this._error, this.cfg.playTime);
    } else {
      this._allEnded();
    }
  },
  diy: function (param) {
    if ($.UTIL.isUndefined(param)) {
      return sclone(this.cfg.diy);
    } else {
      this.cfg.diy = sclone(param);
      return this;
    }
  },
  seek: function (opt) {
    this.seeking = true;
    var key = opt.key || "index";
    var val = opt.val;
    var playTime = +opt.playTime || 0;
    var index = -1;
    if (key == "index") {
      index = +val;
    } else {
      var obj = {
        key: key,
        val: val,
        index: -1
      };
      each(this._.list, (opt.filter || function (d, i) {
        if (d[key] === val) {
          this.index = i;
          return true;
        }
      }).bind(obj));
      index = obj.index;
    }
    this.diy(opt.diy);
    this.cfg.playTime = playTime;
    this.cfg.endPoint = +opt.endPoint || null;
    this.cfg.current = this._.current = index;
    this._.pre.length = 0;
    return this;
  },
  playBy: function (opt) {
    this.seek(opt);
    this.play();
  },
  stop: function () {
    delete this.seeking;
    apply(this.mp && this.mp.stop, null, this.mp);
  },
  fetch: function (curr, success, error, playTime) {
    if (curr.playUrl) {
      setTimeout(success, 0, curr.playUrl, playTime);
      return;
    }
    var isVod = !!curr.contentId;
    var isTvod = curr.channelId && curr.startTime;
    var hasEffectInfo = isVod || isTvod;
    if (!hasEffectInfo) {
      error(new Error("no contentId"));
      return;
    }
    if (isVod) {
      $.getHelper("provider:vod").fetch(curr.contentId, function (d) {
        if (d && d.playURL) {
          curr.playUrl = d.playURL;
          success(d.playURL, playTime);
        } else {
          error(d);
        }
      }, error);
    } else if (isTvod) {
      var startTime = curr.startTime;
      startTime = new $.Date().parse(startTime, "yyyy-MM-dd hh:mm:ss").getTime();
      $.getHelper("provider:tvod").fetch(curr.channelId, startTime, null, function (d) {
        if (d && d.playURL) {
          curr.playUrl = d.playURL;
          success(d.playURL);
        } else {
          error(d);
        }
      }, error);
    }
  }
});

function FetchData(opt) {
  var dataset = {}, type = opt.type, total = -1, jsonp = opt.jsonp, listCallback = {}, listTask = {}, blockSize = opt.blockSize || 100, prefixNum = "num_", prefixCallback = "cb_", prefixTask = "task_";
  function mapping(begin, end) {
    var out = [];
    var beginPageIndex = Math.floor(begin / blockSize);
    beginPageIndex < 0 && (beginPageIndex = 0);
    var endPageIndex = Math.floor((end - 1) / blockSize);
    var endIndex = Math.floor(total / blockSize);
    total >= 0 && endPageIndex > endIndex && (endPageIndex = endIndex);
    out.push(beginPageIndex);
    if (beginPageIndex !== endPageIndex) {
      for (var i = 1; i <= endPageIndex - beginPageIndex; i++) {
        out.push(beginPageIndex + i);
      }
    }
    return out;
  }
  function inCache(nums) {
    for (var i in nums) {
      if (nums.hasOwnProperty(i)) {
        var num = nums[i];
        if (!dataset[prefixNum + num]) {
          return false;
        }
      }
    }
    return true;
  }
  function getCache(begin, end, nums) {
    var out = [];
    for (var i = 0; i < nums.length; i++) {
      var num = nums[i];
      var d = dataset[prefixNum + num];
      out = out.concat(d.data);
    }
    if (begin < 0) {
      begin = 0;
    }
    var b = begin % blockSize;
    return out.slice(b, b + (end - begin));
  }
  function doLoad(nums, begin, end, callback, isPreload) {
    for (var i in nums) {
      if (nums.hasOwnProperty(i)) {
        var num = nums[i];
        fetchData(num, isPreload);
      }
    }
    listCallback[prefixCallback + begin + "_" + end] = callback || "fun";
  }
  function fetchData(num, isPreload) {
    var taskKey = prefixTask + num;
    if (!(listTask[taskKey] || inCache([num]))) {
      jsonp(type, num, onLoad, onError.bind(fd, num, isPreload), isPreload);
      listTask[taskKey] = "loading";
    }
  }
  function onLoad(d) {
    total = d.total;
    var num = Math.floor(d.rangeMin / blockSize);
    var numKey = prefixNum + num;
    dataset[numKey] = d;
    var taskKey = prefixTask + num;
    delete listTask[taskKey];
    for (var cbKey in listCallback) {
      if (listCallback.hasOwnProperty(cbKey)) {
        var infos = cbKey.split("_"), begin = +infos[1], end = +infos[2];
        var nums = mapping(begin, end);
        if (inCache(nums)) {
          var ds = getCache(begin, end, nums);
          typeof listCallback[cbKey] === "function" && listCallback[cbKey](ds, begin, end, total);
          delete listCallback[cbKey];
        }
      }
    }
  }
  function onError(num, isPreload) {
    var taskKey = prefixTask + num;
    delete listTask[taskKey];
    var preloadError = this.preload.error;
    if (isPreload && preloadError) {
      delete this.preload.error;
      preloadError();
      preloadError = null;
    }
  }
  var fd = {
    sync: function (begin, end) {
      var nums = mapping(begin, end);
      var half = Math.ceil(blockSize / 2);
      var tmpBegin = begin - half, tmpEnd = end + half;
      if (tmpBegin < 0) {
        tmpBegin = 0;
      }
      if (total > -1 && tmpEnd > total) {
        tmpEnd = total;
      }
      this.async(tmpBegin, tmpEnd);
      if (inCache(nums)) {
        return getCache(begin, end, nums);
      } else {
        throw new Error("data loading begin:" + begin + " end:" + end);
      }
    },
    async: function (begin, end, callback, isPreload) {
      var nums = mapping(begin, end);
      if (inCache(nums)) {
        if (typeof callback === "function") {
          var ds = getCache(begin, end, nums);
          setTimeout(callback, 50, ds, begin, end, total);
        }
      } else {
        doLoad(nums, begin, end, callback, isPreload);
      }
    },
    preload: function (begin, end, success, error) {
      if (begin < 0) {
        begin = 0;
      }
      if (begin >= end) {
        end = begin + 1;
      }
      var half = Math.ceil(blockSize / 2);
      var tmpBegin = begin - half, tmpEnd = end + half;
      if (tmpBegin < 0) {
        tmpBegin = 0;
      }
      if (total > -1 && tmpEnd > total) {
        tmpEnd = total;
      }
      function getAsync(that) {
        return function (tmpBegin, tmpEnd, begin, end, success) {
          that.async(tmpBegin, tmpEnd, function (b, e, c) {
            return function (ds, begin, end, total) {
              if (that) {
                delete that.preload.error;
                that = null;
              }
              var bTmp = b - begin;
              var tmpDs = (ds || []).slice(bTmp, bTmp + (e - b));
              typeof c === "function" && c(tmpDs, b, e, total);
            };
          }(begin, end, success), true);
          tmpBegin = tmpEnd = begin = end = success = null;
        }.bind(that);
      }
      if (error) {
        this.preload.error = error;
      }
      var async;
      if (total < 0) {
        async = getAsync(this);
        this.async(0, 1, function (_1, _2, _3, total) {
          if (begin >= total || blockSize == 500) {
            return success && success(null, begin, end, total);
          }
          if (end > total) {
            end = total;
          }
          if (tmpEnd > total) {
            tmpEnd = total;
          }
          async(tmpBegin, tmpEnd, begin, end, success);
        }, true);
      } else {
        if (success) {
          async = getAsync(this);
          async(tmpBegin, tmpEnd, begin, end, success);
        } else {
          this.async(tmpBegin, tmpEnd);
        }
      }
    }
  };
  return fd;
}

function initAnimatePanel(win) {
  var doc = document;
  if (win) {
    doc = win.document;
  }
  function AnimatePanel(opt) {
    var paddingItems = [];
    function createData(begin) {
      if (begin >= total) {
        return "";
      }
      var end = begin + blockLines * columnSize;
      if (end > total) {
        end = total;
      }
      var prefix = "";
      if (begin < 0) {
        prefix = paddingItems.slice(0, begin * -1).join("");
        begin = 0;
      }
      if (end < 0) {
        end = 0;
        prefix = "";
      }
      return prefix + render(begin, end);
    }
    function createElement(className, container) {
      if (blockA.el) return;
      var el_pannel = doc.createElement("div");
      el_pannel.className = className || "";
      var el_a = doc.createElement("div");
      el_a.style.cssText = ["position:absolute", "height:" + blockLines * lineHeight + "px", "left:0", "-webkit-transform:translateY(" + blockA.top * lineHeight + "px)", "-webkit-transition:" + opt.transition, "width:100%", "overflow:hidden"].join(";");
      var el_b = doc.createElement("div");
      el_b.className = "reflect";
      el_b.style.cssText = ["position:absolute", "height:" + blockLines * lineHeight + "px", "left:0", "width:100%", "-webkit-transform:translateY(" + blockB.top * lineHeight + "px)", "-webkit-transition:" + opt.transition, "overflow:hidden"].join(";");
      el_pannel.appendChild(el_a);
      el_pannel.appendChild(el_b);
      container.appendChild(el_pannel);
      blockA.el = el_a;
      blockB.el = el_b;
      addEffect(blockA);
      addEffect(blockB);
    }
    function createPaddingItems(paddingItem) {
      paddingItems = (new Array(columnSize * blockLines).join(paddingItem + ",") + paddingItem).split(",");
    }
    function addEffect(obj) {
      if (opt.transition && obj && obj.el && !obj.hasEffect) {
        obj.hasEffect = true;
        obj.el.style.webkitTransition = opt.transition;
      }
    }
    function noEffect(obj) {
      if (opt.transition && obj && obj.el && obj.hasEffect) {
        obj.hasEffect = false;
        obj.el.style.webkitTransition = "none";
      }
    }
    function toShow(el) {
      el.style.opacity = 1;
    }
    function toHide(el) {
      el.style.opacity = 0;
    }
    function down(turnLine) {
      turnLine || (turnLine = 1);
      if (firstLineIndex <= 0) return;
      if (firstLineIndex < turnLine) {
        turnLine = firstLineIndex;
      }
      addEffect(master);
      addEffect(slave);
      var res = master.check(turnLine);
      if (res > 0) {
        if (masterSlaveType !== slave.type + master.type) {
          slave.transfer(res);
        }
      }
      master.moveCalc(turnLine);
      slave.moveCalc(turnLine);
      Logger.debug(master.top, slave.top);
      if (slave.top > -(showLine + shadowLineUp) + blockLines) {
        slave.transfer(turnLine);
        Logger.debug("> ", -(showLine + shadowLineUp) + blockLines);
      }
      master.move();
      slave.move();
      firstLineIndex -= turnLine;
      update(turnLine);
    }
    function up(turnLine) {
      turnLine || (turnLine = -1);
      if (firstLineIndex + showLine >= totalLine) return;
      addEffect(master);
      addEffect(slave);
      var res = master.check(turnLine);
      if (res < 0) {
        if (masterSlaveType !== master.type + slave.type) {
          slave.transfer(res);
        }
      }
      master.moveCalc(turnLine);
      slave.moveCalc(turnLine);
      Logger.debug(master.top, slave.top);
      if (slave.top < -(showLine + shadowLineUp)) {
        master.transfer(turnLine);
        Logger.debug("< ", -(showLine + shadowLineUp), master.top, slave.top);
      }
      master.move();
      slave.move();
      firstLineIndex -= turnLine;
      update(turnLine);
    }
    function refresh(beginIndex) {
      if (blockA.top) {
        var gap = firstLineIndex - beginIndex;
        Logger.debug(gap);
        blockA.topIndex -= gap;
        blockB.topIndex -= gap;
        firstLineIndex = beginIndex;
      } else {
        blockA.top = -(showLine + shadowLineUp);
        blockA.topIndex = firstLineIndex - (showLine + shadowLineUp);
        blockB.top = blockA.top + blockLines;
        blockB.topIndex = blockA.topIndex + blockLines;
      }
      createElement(opt.className, opt.appendTo || doc.body);
      master = blockA;
      slave = blockB;
      masterSlaveType = "AB";
      noEffect(master);
      noEffect(slave);
      setHtmlFromDate(master);
      setHtmlFromDate(slave);
      addEffect(master);
      addEffect(slave);
      update(0);
    }
    var lineHeight = opt.lineHeight, shadowLineUp = opt.shadowLineUp || 0, shadowLine = opt.shadowLine || 0, showLine = opt.showLine || 2, columnSize = opt.columnSize || 4, blockLines = showLine * 3 + shadowLine + shadowLineUp, firstLineIndex = opt.firstLineIndex || 0, total = opt.total || 0, totalLine = Math.ceil(total / columnSize) || 0, render = function (begin, end) {
      return opt.render(begin, end) || "";
    }, update = function (turnLine) {
      return opt.update({
        turnLine: turnLine,
        total: total,
        columnSize: columnSize,
        showLine: showLine,
        totalLine: totalLine,
        blockLines: blockLines,
        shadowLine: shadowLine,
        firstLineIndex: firstLineIndex
      });
    }, lockTime = opt.lockTime || 300, master, slave, masterSlaveType;
    createPaddingItems(opt.paddingItem);
    var blockA = {
      el: null,
      type: "A",
      check: function (lines) {
        if (lines < 0) {
          return checkTop(this.top) && -1;
        }
        if (lines > 0) {
          return checkBottom(this.top) && 1;
        }
      },
      moveCalc: function (lines) {
        this.top += lines;
      },
      transfer: function (lines) {
        Logger.debug("down masterSlaveType", masterSlaveType);
        if (lines < 0) {
          if (this.other.topIndex + blockLines >= totalLine) {
            Logger.debug("transfer = 0 1");
            lines = 0;
          } else {
            this.top = this.other.top + blockLines;
            this.topIndex = this.other.topIndex + blockLines;
          }
        }
        if (lines > 0) {
          if (this.other.topIndex <= 0) {
            Logger.debug("transfer = 0 2");
            lines = 0;
          } else {
            this.top = this.other.top - blockLines;
            this.topIndex = this.other.topIndex - blockLines;
          }
        }
        if (lines) {
          noEffect(this);
          switchMaster();
          reverseType();
          setHtmlFromDate(this);
        }
      },
      move: function () {
        this.el.style.webkitTransform = "translateY(" + this.top * lineHeight + "px)";
      }
    };
    var blockB = {
      el: null,
      type: "B",
      check: blockA.check,
      moveCalc: blockA.moveCalc,
      move: blockA.move,
      transfer: blockA.transfer
    };
    blockA.other = blockB;
    blockB.other = blockA;
    refresh(firstLineIndex);
    function setHtmlFromDate(obj) {
      var begin = obj.topIndex * columnSize;
      obj.el.innerHTML = createData(begin);
    }
    function checkTop(top) {
      if (top > -(showLine + shadowLineUp) && top < 0) {
        return true;
      }
    }
    function checkBottom(top) {
      if (top < -(showLine + shadowLineUp) && top > -(showLine + shadowLineUp) * 2) {
        return true;
      }
    }
    function reverseType() {
      masterSlaveType = masterSlaveType[1] + masterSlaveType[0];
    }
    function switchMaster() {
      var tmp = master;
      master = slave;
      slave = tmp;
    }
    var locker = function (lockTime) {
      var expires = -1;
      var interval = Math.max(300, lockTime), quotiety = 1, quotietyMax = 5, quotietyMin = 1;
      return {
        lock: function (multiple) {
          expires = new Date().getTime() + interval * quotiety * (multiple || 1);
          return true;
        },
        isLocked: function () {
          if (expires >= new Date().getTime()) {
            return true;
          }
          this.down();
        },
        up: function () {
          if (quotiety < quotietyMax) {
            quotiety++;
          }
          return this;
        },
        down: function () {
          if (quotiety > quotietyMin) {
            quotiety--;
          }
          return this;
        }
      };
    }(lockTime);
    function tryfn(fn, args, that) {
      try {
        fn.apply(that, args);
      } catch (e) {
        locker.up().lock(2);
      }
    }
    function tryup() {
      tryfn(up, arguments);
    }
    function trydown() {
      tryfn(down, arguments);
    }
    return {
      dragUp: function () {
        if (!locker.isLocked() && locker.lock()) {
          tryup();
        }
      },
      dragDown: function () {
        if (!locker.isLocked() && locker.lock()) {
          trydown();
        }
      },
      dragPageUp: function () {
        if (!locker.isLocked() && locker.lock(2)) {
          tryup(-showLine);
        }
      },
      dragPageDown: function () {
        if (!locker.isLocked() && locker.lock(2)) {
          trydown(showLine);
        }
      },
      refresh: function (beginIndex, total_new) {
        total = total_new;
        totalLine = Math.ceil(total / columnSize) || 0;
        refresh(beginIndex);
      }
    };
  }
  return AnimatePanel;
}

function initAutoHide(Query) {
  var AutoHide = function (opt) {
    if (!(this instanceof AutoHide)) {
      return new AutoHide(opt);
    }
    var cfg = {
      $dom: Query(opt.dom),
      delay: opt.delay,
      beforeShow: opt.beforeShow,
      afterHide: opt.afterHide
    };
    var _show = function (delay) {
      if (AutoHide.reseted) {
        return;
      }
      if (!autoHide.isShow) {
        autoHide.isShow = true;
        apply(cfg.beforeShow, null, opt);
        cfg.$dom.show();
      }
      autoTimer.begin(delay);
    };
    var _hide = function () {
      if (AutoHide.reseted) {
        return;
      }
      autoHide.isShow = false;
      autoTimer.clear();
      cfg.$dom.hide();
      apply(cfg.afterHide, null, opt);
    };
    var autoTimer = new Timer(_hide, cfg.delay);
    var autoHide = {
      isShow: false,
      show: _show,
      hide: _hide
    };
    return autoHide;
  };
  AutoHide.reset = function () {
    if (!AutoHide.reseted) {
      AutoHide.reseted = true;
    }
  };
  return AutoHide;
}

function initToast(Query) {
  var Toast = function (opt) {
    var _dom, autoHide, isGlobal = !(this instanceof Toast), dft = {
      delay: opt && opt.delay >= 0 ? opt.delay : -1,
      msg: opt && opt.msg || "",
      create: opt && opt.create || getDefaultEl,
      setMsg: opt && opt.setMsg || setMsg
    };
    function getDefaultEl() {
      var _dom = Query("<div>").css({
        position: "absolute",
        width: "100%",
        left: "0",
        top: "80%",
        "z-index": "999",
        "text-align": "center",
        background: "transparent"
      });
      Query("<div class=contentmsg>").css({
        display: "inline-block",
        "font-family": "黑体",
        "font-size": Query.toPx("%3.125px"),
        color: "#F1F1F1",
        border: "1px solid white",
        padding: ".1em 2em",
        "min-height": "1.1em",
        "border-radius": "18px",
        "background-color": "rgba(0, 0, 0, .5)",
        position: "static",
        width: "auto",
        height: "auto",
        "line-height": "normal",
        "font-weight": "normal"
      }).appendTo(_dom);
      return _dom;
    }
    function setMsg(msg, el) {
      Query(".contentmsg", el).html(msg);
    }
    function createEl() {
      isGlobal && (_dom = Toast.dom, autoHide = Toast.autoHide);
      if (!_dom) {
        _dom = Query(dft.create());
        _dom.appendTo("body");
        autoHide = new $.AutoHide({
          dom: _dom[0],
          delay: dft.delay
        });
      }
      isGlobal && (Toast.dom = _dom, Toast.autoHide = autoHide);
    }
    function _toast(opt) {
      var delay = typeof (opt && opt.delay) === "number" ? opt.delay : dft.delay, msg = opt && opt.msg || dft.msg;
      createEl();
      if (msg && delay) {
        dft.setMsg(msg, _dom[0]);
        autoHide.show(delay);
      } else {
        autoHide.hide();
      }
    }
    if (isGlobal) {
      _toast.apply(null, arguments);
    } else {
      return _toast;
    }
  };
  return Toast;
}

function initCutFactory(win) {
  var doc = document;
  if (win) {
    doc = win.document;
  }
  function cutFactory(opt) {
    var cfg = {
      padding: opt.padding || "...",
      classList: opt.classList || [],
      style: opt.style || {},
      retry: opt.retry || 4,
      debug: opt.debug
    };
    var retryTimes = 0;
    var el = doc.createElement("span");
    el.className = cfg.classList.join(" ");
    var customStyles = [];
    for (var styleKey in cfg.style) {
      if (cfg.style.hasOwnProperty(styleKey)) {
        customStyles.push(styleKey + ":" + cfg.style[styleKey]);
      }
    }
    el.style.cssText = "position:absolute;left:0;top:0;background:transparent;color:transparent;height:100%;white-space:nowrap;overflow:visible;border:0;" + (cfg.debug ? "background:white;color:red;" : "") + customStyles.join(";");
    var div = doc.createElement("div");
    div.appendChild(el);
    div.style.cssText = "width:99%;min-height:50px;line-height:50px;position:absolute;left:3px;top:3px;overflow:hidden;outline:0;background:transparent;" + (cfg.debug ? "outline:1px solid red;background:black;" : "");
    doc.body.appendChild(div);
    var css = win.getComputedStyle(el);
    cfg.fontSize = parseFloat(css.fontSize) || 16;
    function cut(content) {
      el.innerHTML = content + cfg.padding;
      var info = complate(), gap = info.gap, percent = info.percent, total = content.length, showLength = +(total * percent).toFixed(0);
      if (gap > 0 && gap < cfg.fontSize) {
        retryTimes--;
        showLength -= 1;
      }
      if (gap <= 0 || !retryTimes) {
        return content;
      }
      return content.substring(0, showLength) + cfg.padding;
      //return cut(content.substring(0, showLength));
    }
    function complate() {
      var offsetWidth = el.offsetWidth;
      var scrollWidth = el.scrollWidth;
      var gap = scrollWidth - offsetWidth;
      var percent = Math.floor(offsetWidth / scrollWidth * 1e3) / 1e3;
      return {
        gap: gap,
        percent: percent
      };
    }
    return function (content) {
      retryTimes = cfg.retry;
      el.innerHTML = content;
      var out = {
        flag: false,
        cut: "",
        all: content,
        last: content
      };
      if (complate().gap) {
        out.flag = true;
        out.last = out.cut = cut(content);
      }
      return out;
    };
  }
  return cutFactory;
}

function Trio(opt) {
  this.opt = {
    channelMap: opt && opt.channelMap || {}
  };
}

(function () {
  var PLAYTYPE = {
    vod: "vod",
    series: "series",
    xileiju: "xileiju",
    tvod: "tvod",
    live: "live"
  };
  var convertForeignId = function (opt, cb) {
    if (/\d{32}/.test(opt.contentId)) {
      return cb({
        contentId: opt.contentId,
        seriesId: opt.seriesId
      });
    }
    $.s.trio.query({
      contentId: opt.contentId,
      seriesId: opt.seriesId || ""
    }, {
      success: function (data) {
        if (data && data.data) {
          cb({
            contentId: data.data.vodId,
            seriesId: data.data.seriesId
          });
        } else {
          cb();
        }
      },
      error: cb
    });
  };
  var getPlayUrl = function (opt, cb) {
    convertForeignId(opt, function (data) {
      if (data && data.contentId) {
        $.getHelper("provider:vod").fetch(data.contentId, function (d) {
          cb(d && d.playURL || undefined, "");
        }, function () {
          cb();
        });
      } else {
        cb();
      }
    });
  };
  var convertChannelNum = function (channelMap, num, cb) {
    if (channelMap) {
      var info = channelMap["" + num];
      if (info) {
        return cb(info.channelNum, info.name);
      }
    }
    cb();
  };
  var PLAYMAP = {
    vod: function (opt, cb) {
      getPlayUrl(opt, cb);
    },
    series: function (opt, cb) {
      getPlayUrl(opt, cb);
    },
    xileiju: function (opt, cb) {
      getPlayUrl(opt, cb);
    },
    tvod: function (opt, cb) {
      if (opt.channelNum && opt.startTime && opt.endTime) {
        convertChannelNum(this.opt.channelMap, opt.channelNum, function (channelNum, name) {
          if (!channelNum) {
            return cb();
          }
          $.s.tvod.query({
            channelNum: channelNum,
            startTime: opt.startTime
          }, {
            success: function (d) {
              try {
                if (/PROGID=[^&]+/.test(d)) {
                  $.s.tvod.play({
                    params: d
                  }, {
                    success: function (dd) {
                      cb(dd && dd.playURL);
                    },
                    error: cb
                  });
                } else {
                  cb();
                }
              } catch (e) {
                cb();
              }
            },
            error: cb
          });
        });
      } else {
        cb();
      }
    },
    live: function (opt, cb) {
      convertChannelNum(this.opt.channelMap, opt.channelNum, cb);
    }
  };
  var _fetchPlayData = function (that, opt, cb) {
    try {
      return apply(PLAYMAP[opt.type], [opt, cb], that);
    } catch (e) { }
    cb();
  };
  var _back = function () {
    var _url = $.getBackUrl(true);
    if (_url) {
      _setUrl(_url);
    }
  };
  var _setUrl = function (url) {
    if (topFrame && topFrame.contentWindow) {
      topFrame.contentWindow.location = url;
    }
  };
  var _auth = function (opt, cb) {
    var package = [];
    each(opt.package, function (v) {
      package.push({
        chargeId: v
      });
    });
    $.getAuth().auth({
      entrance: opt.entrance || "",
      package: package,
      callback: function (result) {
        cb(!!result);
      }
    });
  };
  var _buy = function (backUrl) {
    var url = $.search.append(EPG.pathPage + "/noAuth/transferPage/", {
      backUrl: encodeURIComponent(backUrl),
      POSITIVE: undefined
    });
    _setUrl(url);
  };
  UTIL.merge(Trio.prototype, {
    PLAYTYPE: PLAYTYPE,
    fetchPlayData: function (opt) {
      if (opt && opt.type && typeof opt.callback === "function") {
        _fetchPlayData(this, opt, opt.callback);
      } else { }
    },
    back: function () {
      _back();
    },
    auth: function (opt) {
      if (opt && opt.package && typeof opt.callback == "function") {
        _auth(opt, opt.callback);
      } else { }
    },
    buy: function (backUrl) {
      if (backUrl) {
        _buy(backUrl);
      } else { }
    }
  });
})();

var AUTH_LIB_SDK = function () {
  var strPrefix = EPG.isTest ? 'http://10.128.7.100:8008/' : 'http://10.128.7.2:8008/';
  var cardServerUrl = EPG.isTest ? 'http://10.128.7.100:8087/' : 'http://10.128.7.5:8087/';
  return new function () {
    this.cancelOrder2 = function (userId, orderId, cb) {
      $.get(strPrefix + 'orders/cancelWX/' + orderId + '/' + userId, {
        success: function (res) {
          cb(1, JSON.parse(res));
        },
        error: function () {
          cb(0);
        }
      })
    },
      this.activeCardServer = function (obj, cb) {
        $.post(cardServerUrl + 'cardApi2/activeCard', {
          data: obj,
          timeout: 8000,
          success: function (res) {
            cb(1, JSON.parse(res));
          },
          error: function () {
            cb(0);
          }
        })
      },
      this.queryOrderHis = function (userId, productId, cb) {
        $.get(strPrefix + 'orders/userHistroy/detail/' + userId + '/' + productId, {
          success: function (res) {
            cb(JSON.parse(res));
          },
          error: function () {
            cb();
          }
        })
      },
      this.createPromotionOrderForm = function (opt) {
        $.get(strPrefix + 'orders/service_order_promotion?promotionid=' + opt.promotionid + '&userId=' + opt.userId + '&areaId=' + opt.areaId + '&fee=' + (opt.fee * 100) + '&token=' + opt.token + '&customerRenew=' + opt.customerRenew, {
          success: function (res) {
            opt.callback && opt.callback(1, JSON.parse(res));
          },
          error: function () {
            opt.callback && opt.callback(0);
          }
        })
      }
  }
}();


function Common(win, Query, commonProtoDiy) {
  if (!win) {
    win = window;
  }
  var doc = win.document;
  var search = Search(doc, win);
  var AnimatePanel = initAnimatePanel(win);
  var AutoHide = initAutoHide(win.Query);
  var Toast = initToast(win.Query);
  var topic = new Topic();
  var Lathe = initCutFactory(win);
  return merge(function $(selector, parent, all) {
    if (typeof selector === "function") {
      ready(selector, doc);
    } else {
      if (parent && parent instanceof Query) {
        if (!parent.length) {
          return parent;
        }
        parent = parent[0];
      }
      return new Query(selector, parent, all);
    }
  }, {
    tokens: Math.random(),
    Date: Date2,
    search: search,
    page: search.get(),
    log: Logger,
    UTIL: UTIL,
    extend: UTIL.extend,
    Toast: Toast,
    Timer: Timer,
    AutoHide: AutoHide,
    Tpl: Tpl,
    Tps: Tps,
    Lathe: Lathe,
    VideoList: VideoList,
    MP: MP,
    Topic: Topic,
    topic: topic,
    KB: EPG.KB,
    keyTool: keyTool,
    pTool: pTool,
    Marquee: Marquee2,
    FetchData: FetchData,
    AnimatePanel: AnimatePanel,
    ajax: ajax,
    get: get,
    post: post,
    delete: Delete,
    jsonp: loader,
    Services: Services,
    s: SERVICES,
    getVariable: getVariable,
    getHelper: getHelper,
    vs: VS,
    globalStorage:_
  }, {
    urls: {
      add: function (param) {
        var that = this;
        each(param, function (v, k) {
          that[k] = v;
        });
        that = null;
      },
      home: EPG.pathSite + "/linn/page/homePage/",
      dataVanHome: EPG.pathSite + "/linn/vanHome/",
      dataMenu: EPG.pathSite + "/linn/menu/",
      dataVanMenu: EPG.pathSite + "/linn/vanMenu/",
      dataKanbaTj: EPG.pathSite + "/linn/kanbaTj/",
      dataRecommend0: EPG.pathSite + "/linn/recommend0/",
      dataRecommend2: EPG.pathSite + "/linn/recommend2/",
      dataRecommend3: EPG.pathSite + "/linn/recommend3/"
    },
    forward: function (url, saveUrl) {
      apply(this.addBackUrl || top.cwindow && top.cwindow.$ && top.cwindow.$.addBackUrl || this.saveBackUrl, [saveUrl || top.cwindow && top.cwindow.location.href, url], this);
      this.redirect(url);
    },
    redirect: function (url) {
      var _url = search.append(url, {
        POSITIVE: ""
      });
      this.setUrl(_url);
    },
    back: function () {
      var _url = this.getBackUrl(true);
      if (_url) {
        this.back = function () {
          this.setUrl(_url);
        };
        this.back();
      }
    },
    setUrl: function (url) {
      if (top.cwindow) {
        var referhref = top.cwindow.location.href;
        if ("about:blank" == referhref) {
          referhref = top.location.origin + top.location.pathname;
        }
        window.referrer = referhref;
        top.cwindow.location.href = url;
      } else {
        Logger.out.error = "not exists cwindow!";
      }
    },
    isBack: function () {
      return search.get("POSITIVE") === null;
    },
    isBackRedefine: function (isBack) {
      this.isBack = function () {
        return !!isBack;
      };
    },
    getChanById: function (unkonw) {
      if (!unkonw) return;
      try {
        var out;
        var d;
        var channelIdsMap = $.getHelper("data:channel").channelIdsMap;
        if (UTIL.isArray(unkonw)) {
          out = [];
          each(unkonw, function (channelId) {
            d = channelIdsMap[channelId];
            if (d) {
              out.push(sclone(d));
            }
          });
        } else {
          d = channelIdsMap[unkonw];
          if (d) {
            out = sclone(d);
          }
        }
        channelIdsMap = null;
        return out;
      } catch (e) {
        $.log.out.error = ["no channelIds %s", unkonw];
      }
    },
    getChanNum: function (channelNum) {
      try {
        var type = "channelMap";
        if (channelNum.length === 32) {
          type = "channelIdsMap";
        }
        return $.getHelper("data:channel")[type][channelNum].num;
      } catch (e) {
        $.log.out.error = ["no channelNum %s", channelNum];
      }
    },
    getChan: function (unkonw) {
      if (!unkonw) return;
      try {
        var out;
        var maps = $.getHelper("data:channel");
        if (/^\d+$/.test(unkonw)) {
          if (("" + unkonw).length === 32) {
            maps = maps.channelIdsMap;
          } else {
            maps = maps.channelMap;
          }
        } else {
          maps = maps.channelNamesMap;
        }
        out = sclone(maps[unkonw]);
        maps = null;
        return out;
      } catch (e) {
        $.log.out.error = ["no channelIds %s", unkonw];
      }
    },
    isVipChan: function (unkonw) {
      var channel = this.getChan(unkonw);
      if (channel && channel.vip) {
        channel = null;
        return true;
      } else {
        return false;
      }
    },
    getMenu: function (key, sub, path) {
      try {
        if (!key) {
          return $.getHelper("provider:menu").cache();
        }
        var tmp = $.getHelper("provider:menu").cache.get(key, sub);
        if (path) {
          return tmp.path;
        }
        return tmp;
      } catch (e) {
        $.log.out.error = ["no menu %s %s %s", key, sub, path];
      }
    },
    getAuth: function () {
      try {
        return getHelper("provider:auth").auth;
      } catch (e) {
        $.log.out.error = ["get auth error"];
      }
    },
    linnEdition: 'standardEdition',
    editionIp: getVariable('EPG:isTest') ? '10.128.4.10:9000' : '10.128.46.10:9200',
    putEdition: function (type) {
      $.get('http://' + $.editionIp + '/history/epg_edition/put/' + EPG.userId + '/huawei/' + type + '', {
        success: function () { },
        error: function () { }
      })
      $.linnEdition = type;
      $.emptyBackUrl();
      $.redirect($.urls.home);
    },
    getEdition: function (callback) {
      $.get('http://' + $.editionIp + '/history/epg_edition/get/' + EPG.userId + '/huawei', {
        success: function (res) {
          var result = JSON.parse(res);
          callback(result.data);
        },
        error: function () {
          callback();
        }
      })
    },
       // 默认不自动签到
       autoSignStatus:'0',
       userSystemIP:getVariable('EPG:isTest') ? 'http://10.128.7.100:8083' : 'http://10.128.4.63:8083',
       getAutoSignStatus: function (callback) {
         $.get($.userSystemIP + '/pointsApi/getAutoSignStatus?boxid=' + $.getVariable("EPG:userId"), {
           success: function (res) {
             var result = JSON.parse(res);
             if(result && result.code === '1000' && result.data === '1'){
               callback(result.data);
             }else{
               callback();
             }
           },
           error: function () {
             callback();
           }
         })
       },
       putAutoSignStatus: function (type,callback) {
         $.post($.userSystemIP + '/pointsApi/updateAutoSignStatus', {
           data:{
             boxid:$.getVariable("EPG:userId"),
             status:type
           },
           success: function (res) {
             var result = JSON.parse(res);
             if(result && result.code === '1000'){
               $.autoSignStatus = result.data;
               callback(result.data)
             }
            },
           error: function () { }
         },false,true)
       },
    myCoupon: {
      all: function (callback) {
        var couponServerUrl = $.getVariable('EPG:isTest') ? '10.128.7.100:8087' : '10.128.7.5:8087';
        $.get('http://' + couponServerUrl + '/cardApi2/myCards4EPG?CUSTOMERID=' + getVariable("EPG:userId") + '&STATE=0', {
          success: function (result) {
            callback(result)
          },
          error: function () {
            callback()
          }
        })
      }
    }
  }, commonProto, commonProtoDiy)
}
(function (root) {
  function DUMP_FN() { }
  var applyFn = apply;
  var joinObj = merge;
  var arraySlice = slice;
  var Date = Date2;
  var topic = new Topic();
  function lambda(fn) {
    var params = arraySlice(arguments, 1);
    return function () {
      var args = params;
      if (arguments.length) {
        args = params.concat(arraySlice(arguments));
      }
      return applyFn(fn, args);
    };
  }
  var MT = MP.mediaType = {
    TYPE_CHANNEL: 1,
    TYPE_VOD: 2,
    TYPE_TRAILERS: 5,
    TYPE_TVOD: 3
  };
  var MS = MP.state = {
    loading: "loading",
    loaded: "loaded",
    progress: "progress",
    paused: "paused",
    resume: "resume",
    error: "error",
    seeking: "seeking",
    ended: "ended",
    released: "released"
  };
  var MC = MP.cache = {
    volume: {}
  };
  initVolumeCache();
  function initVolumeCache() {
    var mp = new MediaPlayer();
    MC.volume.value = mp.getVolume();
    MC.volume.mute = !!mp.getMuteFlag();
    mp.releaseMediaPlayer(mp.getNativePlayerInstanceID());
    mp = null;
    if (typeof MC.volume.value === "undefined") {
      MC.volume.value = 10;
      MC.volume.mute = false;
    }
  }
  function isMediaType(that, mediaType) {
    return that.mediaType === mediaType;
  }
  function initPlayer(cfg) {
    var mp = new MediaPlayer();
    var dft = {
      nativePlayerinstanceID: mp.getNativePlayerInstanceID(),
      playlistFlag: 0,
      videoDisplayMode: 0,
      height: 0,
      width: 0,
      left: 0,
      top: 0,
      muteFlag: 0,
      useNativeUIFlag: 0,
      nativeUIFlag: 0,
      subtitleFlag: 0,
      videoAlpha: 0,
      cycleFlag: 1,
      randomFlag: 0,
      autoDelFlag: 0
    };
    var opt = joinObj(dft, cfg);
    mp.initMediaPlayer(opt.nativePlayerinstanceID, opt.playlistFlag, opt.videoDisplayMode, +opt.height, +opt.width, +opt.left, +opt.top, opt.muteFlag, opt.useNativeUIFlag, opt.subtitleFlag, opt.videoAlpha, opt.cycleFlag, opt.randomFlag, opt.autoDelFlag);
    mp.setNativeUIFlag(opt.useNativeUIFlag);
    mp.setMuteUIFlag(opt.nativeUIFlag);
    setPlayerVolume(mp, getVolume());
    setPlayerVolumeMute(mp, getVolumeMute());
    setPlayerSize(mp, opt);
    return mp;
  }
  function resetPlayer() {
    var opt = joinObj({}, this.cfg);
    applyFn(releasePlayer, null, this);
    this.player = initPlayer(opt);
  }
  function releasePlayer() {
    if (this.player) {
      this.empty();
      var instanceId = this.player.getNativePlayerInstanceID();
      if (isMediaType(this, MT.TYPE_CHANNEL)) {
        applyFn(this.player.leaveChannel, null, this.player);
      }
      applyFn(this.player.stop, null, this.player);
      if (instanceId) {
        applyFn(this.player.releaseMediaPlayer, [instanceId], this.player);
      }
      this.mediaType = null;
      this.player = null;
    }
  }
  function release() {
    removeMediaEvent(this);
    applyFn(releasePlayer, null, this);
    clearInterval(this.timer.progress);
    clearTimeout(this.timer.seek);
    clearTimeout(this.timer.setMedia);
    if (this.cache) {
      this.cache = null;
    }
    if (this.cfg) {
      this.cfg = null;
    }
    if (this.timer) {
      this.timer = null;
    }
    if (this.fn) {
      this.fn = null;
    }
    this.state = "released";
  }
  function initMediaType(mediaType, mediaUrl) {
    if (!mediaType) {
      mediaType = /^\d{1,4}$/.test(mediaUrl) ? MT.TYPE_CHANNEL : MT.TYPE_VOD;
    }
    return mediaType;
  }
  function setPlayerSize(mp, opt) {
    if (mp && opt) {
      var videoDisplayMode = 0, left = opt.left | 0 || 0, top = opt.top | 0 || 0, width = opt.width | 0, height = opt.height | 0;
      if (opt.videoDisplayMode) {
        videoDisplayMode = 1;
      }
      if (mp.setVideoDisplayMode) {
        mp.setVideoDisplayMode(videoDisplayMode);
        mp.setVideoDisplayArea(left, top, width, height);
        mp.refreshVideoDisplay();
      }
    }
  }
  function setPlayerVolume(mp, volume) {
    if (mp) {
      mp.setVolume(volume);
    }
  }
  function setPlayerVolumeMute(mp, mute) {
    if (mp) {
      mp.setMuteFlag(mute);
    }
  }
  function setVolume(volume) {
    if (checkVolumeRange(volume)) {
      if (getVolume() != volume) {
        MC.volume.value = +volume;
        setPlayerVolume(this.player, volume);
      }
    }
  }
  function getVolume() {
    return MC.volume.value;
  }
  function setVolumeMute(mute) {
    if (getVolumeMute() != mute) {
      MC.volume.mute = mute;
      setPlayerVolumeMute(this.player, mute);
    }
  }
  function getVolumeMute() {
    return MC.volume.mute;
  }
  function _playByTime(mp, time) {
    var type = 1, speed = 1;
    mp.playByTime(type, time + "", speed);
  }
  function _playByTime2(mp, time) {
    var type = 2, speed = 1;
    if (time < 1) {
      mp.gotoEnd();
    } else {
      var playTime = new Date(new Date().getTime() - time * 1e3).toGmt().format("yyyyMMddThhmmssZ");
      mp.playByTime(type, playTime, speed);
    }
  }
  function playByTime(that, time) {
    return applyFn(execType, [that, "playByTime", that.player, time]);
  }
  function _getMediaDuration(mp) {
    return mp && mp.getMediaDuration() || -1;
  }
  function _getMediaDuration2() {
    return 60 * 60 * 6;
  }
  function getMediaDuration(that) {
    return applyFn(execType, [that, "getMediaDuration", that.player]);
  }
  function _getCurrentPlayTime(that, mp) {
    var tmp = mp && +mp.getCurrentPlayTime() || 0;
    return tmp < 0 ? 0 : tmp;
  }
  function _getCurrentPlayTime2(that, mp) {
    var time = mp && mp.getCurrentPlayTime();
    var out = 0;
    if (time) {
      out = (new Date() - new Date().toGmt().parse(time, "yyyyMMddThhmmssZ").toLoc()) / 1e3 | 0;
      if (out <= 1) {
        out = 0;
      }
    }
    var total = getMediaDuration(that);
    out = total - out;
    if (out < 0) {
      out = 0;
    }
    if (out > total) {
      out = total;
    }
    return out;
  }
  function getCurrentPlayTime(that) {
    return applyFn(execType, [that, "getCurrentPlayTime", that, that.player]);
  }
  function _setMedia(that, mp, mediaUrl, startTime) {
    var singleMedia = ['[{mediaUrl:"' + mediaUrl + '"', 'mediaCode: "mediaCode"', "mediaType: 2", "audioType: 1", "videoType: 1", "streamType: 1", "drmType: 1", "fingerPrint: 0", "copyProtection: 1", "allowTrickmode: 1", "startTime:" + startTime, "endTime: 0", 'entryID: "entryID"}]'].join(",");
    mp.setSingleMedia(singleMedia);
    playByTime(that, startTime);
  }
  function _setMedia2(that, mp, mediaUrl, startTime) {
    mp.joinChannel(mediaUrl);
    if (startTime >= 1) {
      setTimeout(function () {
        playByTime(this, startTime);
      }.bind(that), 500);
    }
  }
  function setMedia(that, mediaUrl, startTime) {
    if (that.player) {
      return applyFn(execType, [that, "setMedia", that, that.player, mediaUrl, startTime]);
    }
  }
  var typeMap = {};
  typeMap[MT.TYPE_VOD] = {
    getMediaDuration: _getMediaDuration,
    getCurrentPlayTime: _getCurrentPlayTime,
    setMedia: _setMedia,
    playByTime: _playByTime
  };
  typeMap[MT.TYPE_CHANNEL] = {
    getMediaDuration: _getMediaDuration2,
    getCurrentPlayTime: _getCurrentPlayTime2,
    setMedia: _setMedia2,
    playByTime: _playByTime2
  };
  function execType(that, fnName) {
    var mediaType = that.mediaType;
    if (!isMediaType(that, MT.TYPE_CHANNEL)) {
      mediaType = MT.TYPE_VOD;
    }
    return applyFn((typeMap[mediaType] || {})[fnName], arraySlice(arguments, 2), that);
  }
  var stateMap = {
    init: {
      load: load,
      size: size
    },
    loading: {
      load: load,
      size: size,
      seek: function () {
        playByTime(this, this.cache.startTime);
      }
    },
    progress: {
      size: size,
      pause: pause,
      seek: seek,
      load: load
    },
    paused: {
      size: size,
      resume: resume,
      seek: function () {
        this.pub(MS.resume);
        applyFn(seek, arguments, this);
      },
      load: load
    },
    seeking: {
      pause: seekToPause,
      size: size,
      seek: seek,
      load: function () {
        clearTimeout(this.timer.seek);
        delete this.timer.seek;
        delete this.seek_time;
        applyFn(load, arguments, this);
      }
    },
    ended: {
      size: size,
      load: load
    },
    released: {}
  };
  function exec(that, fnName) {
    return applyFn((stateMap[that.state] || {})[fnName], arraySlice(arguments, 2), that);
  }
  function getPlayParam(that) {
    var curr = getCurrentPlayTime(that);
    var total = that.cache.duration;
    return {
      curr: curr,
      total: total,
      percent: curr / total * 100,
      endPoint: that.cache.endPoint
    };
  }
  function getEndPoint(that) {
    var cache = that.cache;
    return cache.endPoint || cache.duration;
  }
  function checkRange(that, curr) {
    var end = getEndPoint(that);
    if (curr > end) {
      return end;
    }
    if (curr < 0) {
      return 0;
    }
  }
  function checkPlayTime(that, time) {
    var tmp_time = checkRange(that, time);
    if (!isNaN(tmp_time)) {
      time = tmp_time;
    }
    var endGap = that.cache.endGap;
    if (endGap > 0) {
      var end = getEndPoint(that);
      if (end > endGap && time + endGap > end) {
        time = end - endGap;
      }
    }
    return time;
  }
  function checkRangeIsEnd(that, curr, total) {
    if (curr == total) {
      that.cache.currEqTotalTimes++;
      return that.cache.currEqTotalTimes > 1;
    }
    return false;
  }
  function checkVolumeRange(volume) {
    return volume >= 0 && volume <= 100;
  }
  function addMediaEvent(that) {
    removeMediaEvent(that);
    that.fn.mediaEndInLoading = function () {
      if (that.isState(MS.loading)) {
        that.cache.mediaEndInLoading = true;
      }
    };
    topic.once("media.end", that.fn.mediaEndInLoading);
    that.fn.loadToPlay = loadToPlay.bind(that);
    topic.once("media.begin", that.fn.loadToPlay);
    topic.once("media.playmode.change", that.fn.loadToPlay);
    if (!that.fn.mediaRetry) {
      that.fn.mediaRetry = function () {
        topic.rm("media.error", this.fn.mediaRetry);
        delete this.fn.mediaRetry;
        if (this.isState(MS.loading)) {
          this.fn.mediaError = function () {
            this.pub(MS.error);
          }.bind(this);
          topic.sub("media.error", this.fn.mediaError);
          playByTime(this, this.cache.startTime);
        }
      }.bind(that);
      topic.sub("media.error", that.fn.mediaRetry);
    }
  }
  function removeMediaEvent(that) {
    that.cache.currEqTotalTimes = 0;
    delete that.cache.mediaEndInLoading;
    if (that.fn.mediaEndInLoading) {
      topic.rmOnce("media.end", that.fn.mediaEndInLoading);
      delete that.fn.mediaEndInLoading;
    }
    if (that.fn.mediaRetry) {
      topic.rm("media.error", that.fn.mediaRetry);
      delete that.fn.mediaRetry;
    }
    removeMediaEventInVideoStart(that);
  }
  function removeMediaEventInVideoStart(that) {
    if (that.fn.loadToPlay) {
      topic.rmOnce("media.begin", that.fn.loadToPlay);
      topic.rmOnce("media.playmode.change", that.fn.loadToPlay);
      delete that.fn.loadToPlay;
    }
    if (that.fn.mediaEnd) {
      topic.rmOnce("media.end", that.fn.mediaEnd);
      delete that.fn.mediaEnd;
    }
    if (that.fn.mediaError) {
      topic.rm("media.error", that.fn.mediaError);
      delete that.fn.mediaError;
    }
  }
  function clearCache() {
    if (!isMediaType(this, MT.TYPE_CHANNEL)) {
      this.cache.endGap = +this.cfg.endGap | 0 || 0;
      this.cache.endPoint = +this.cfg.endPoint | 0 || undefined;
    }
    this.cache.step = undefined;
    this.cache.lastMediaUrl = this.cache.mediaUrl;
    this.cache.mediaUrl = undefined;
    this.cache.duration = undefined;
    this.cache.startTime = undefined;
    this.cache.mediaEndInLoading = undefined;
  }
  function load(mediaUrl, startTime, mediaType, endPoint) {
    clearTimeout(this.timer.setMedia);
    applyFn(clearCache, [], this);
    if (!isMediaType(this, MT.TYPE_CHANNEL)) {
      applyFn(resetPlayer, [], this);
    }
    this.state = "loading";
    if (mediaType) {
      this.mediaType = mediaType;
    }
    if (!this.mediaType) {
      this.mediaType = initMediaType(mediaType, mediaUrl);
    }
    if (!mediaUrl) {
      mediaUrl = this.cache.lastMediaUrl;
    }
    if (startTime) {
      if (isMediaType(this, MT.TYPE_CHANNEL)) {
        try {
          startTime = Math.floor((new Date().getTime() - new Date().parse(startTime, "yyyyMMddhhmmss")) / 1e3);
          startTime = Math.max(startTime, 0);
        } catch (e) { }
      }
      startTime = checkPlayTime(this, +startTime || 0);
    }
    if (typeof endPoint !== "undefined") {
      this.cfg.endPoint = +endPoint || 0;
    }
    this.cache.mediaUrl = mediaUrl;
    this.cache.startTime = startTime || 0;
    addMediaEvent(this);
    this.timer.setMedia = setTimeout(setMedia, 0, this, mediaUrl, startTime);
    this.pub(MS.loading);
  }
  function loadToPlay() {
    removeMediaEventInVideoStart(this);
    if (!!this.cache.mediaEndInLoading) {
      return applyFn(toEnded, [], this);
    }
    var total = getMediaDuration(this);
    if (total <= 0) {
      return setTimeout(loadToPlay.bind(this), 34);
    }
    var endPoint = 0, endGap = 0;
    if (!isMediaType(this, MT.TYPE_CHANNEL)) {
      endPoint = +this.cfg.endPoint | 0 || 0;
      if (endPoint) {
        if (endPoint < 0) {
          endPoint += total;
        }
        if (endPoint >= total || endPoint < 0) {
          endPoint = 0;
        }
      }
      endGap = +this.cfg.endGap | 0 || 0;
      if (endGap && total - endGap * 3 < 0) {
        endGap = 0;
      }
      this.fn.mediaEnd = toEnded.bind(this);
      topic.once("media.end", this.fn.mediaEnd);
    }
    var step = 1;
    if (/^(\d+(\.\d+)?)(%)?$/.test(this.cfg.step)) {
      step = (RegExp.$3 ? total / 100 : 1) * (+RegExp.$1 || 1) | 0 || step;
    }
    this.cache.step = step;
    this.cache.endGap = endGap;
    this.cache.duration = total;
    this.cache.endPoint = endPoint;
    this.pub(MS.loaded, getPlayParam(this));
    applyFn(toProgress, arguments, this);
  }
  function play(time) {
    time = checkPlayTime(this, time);
    playByTime(this, time);
    applyFn(toProgress, arguments, this);
  }
  function toProgress() {
    this.state = "progress";
    clearInterval(this.timer.progress);
    var _ps = function () {
      var isChannel = isMediaType(this, MT.TYPE_CHANNEL);
      if (!(this.isState(MS.progress) || this.isState(MS.resume) || isChannel && this.isState(MS.paused))) {
        return clearInterval(this.timer.progress);
      }
      var param = getPlayParam(this);
      var tmp_time = checkRange(this, param.curr);
      if (isChannel) {
        if (!isNaN(tmp_time)) {
          param.curr = tmp_time;
          param.percent = param.curr / param.total * 100;
        }
        this.pub(MS.progress, param);
      } else {
        var isEnd = checkRangeIsEnd(this, param.curr, param.total);
        if (isNaN(tmp_time) && !isEnd) {
          this.pub(MS.progress, param);
        } else {
          if (param.endPoint) {
            clearInterval(this.timer.progress);
            this.player.stop();
          }
          topic.pub("media.end");
        }
      }
    }.bind(this);
    this.timer.progress = setInterval(_ps, 1e3);
  }
  function toEnded() {
    clearInterval(this.timer.progress);
    delete this.timer.progress;
    this.state = "ended";
    this.pub(MS.ended);
  }
  function pause() {
    this.state = "paused";
    this.player.pause();
    if (!isMediaType(this, MT.TYPE_CHANNEL)) {
      clearInterval(this.timer.progress);
    }
    this.pub(MS.paused);
  }
  function resume() {
    if (this.seek_time) {
      var playTime = this.seek_time;
      delete this.seek_time;
      if (isMediaType(this, MT.TYPE_CHANNEL)) {
        playTime = getMediaDuration(this) - playTime;
      }
      applyFn(play, [playTime], this);
      return;
    }
    this.player.resume();
    this.pub(MS.resume);
    applyFn(toProgress, arguments, this);
  }
  function seek(time) {
    var lastState = this.state;
    this.state = "seeking";
    clearTimeout(this.timer.seek);
    clearInterval(this.timer.progress);
    if (lastState != this.state) {
      this.player.pause();
    }
    if (isNaN(this.seek_time)) {
      this.seek_time = getCurrentPlayTime(this);
    }
    var abs = false;
    if (/^([-+]?\d+(\.\d+)?)(x|a)$/.test(time)) {
      var tmpTime = RegExp.$1;
      abs = RegExp.$3 === "a";
      if (abs) {
        time = Math.floor(Math.abs(tmpTime));
        if (isNaN(time)) {
          time = 0;
        }
        if (/^-/.test(tmpTime)) {
          time = time * -1;
          time += getEndPoint(this);
        }
      } else {
        time = this.cache.step * tmpTime | 0 || 0;
      }
    }
    if (abs) {
      this.seek_time = time;
    } else {
      this.seek_time += time || this.cache.step;
    }
    var tmp_seek_time = checkRange(this, this.seek_time);
    if (!isNaN(tmp_seek_time)) {
      this.seek_time = tmp_seek_time;
    }
    this.timer.seek = setTimeout(seekToPlay.bind(this), 1e3);
    var param = getPlayParam(this);
    param.curr = this.seek_time;
    param.percent = param.curr / param.total * 100;
    this.pub(MS.seeking, param);
  }
  function seekToPlay() {
    clearTimeout(this.timer.seek);
    var playTime = this.seek_time;
    delete this.timer.seek;
    delete this.seek_time;
    if (isMediaType(this, MT.TYPE_CHANNEL)) {
      playTime = getMediaDuration(this) - playTime;
    }
    applyFn(play, [playTime], this);
  }
  function seekToPause() {
    clearTimeout(this.timer.seek);
    delete this.timer.seek;
    applyFn(pause, null, this);
  }
  function size(mini, left, top, width, height) {
    var opt = {
      videoDisplayMode: 0,
      left: left || 0,
      top: top || 0,
      width: width || 0,
      height: height || 0
    };
    if (!mini) {
      opt.videoDisplayMode = 1;
    }
    joinObj(this.cfg, opt);
    opt = null;
    setPlayerSize(this.player, this.cfg);
  }
  function MP(opt) {
    this.cfg = joinObj({
      step: "1%",
      state: "init",
      endGap: 6
    }, opt);
    this.state = this.cfg.state;
    this.timer = {};
    this.fn = {};
    this.cache = {};
  }
  var proto = {
    size: function () {
      applyFn(lambda(exec, this, "size"), arguments);
      return this;
    },
    load: function () {
      applyFn(lambda(exec, this, "load"), arguments);
      return this;
    },
    pause: function () {
      applyFn(lambda(exec, this, "pause"), arguments);
      return this;
    },
    resume: function () {
      applyFn(lambda(exec, this, "resume"), arguments);
      return this;
    },
    isState: function (state) {
      return this.state === state;
    },
    pauseOrResume: function () {
      if (this.isState(MS.paused)) {
        this.resume();
      } else {
        this.pause();
      }
      return this;
    },
    seek: function () {
      applyFn(lambda(exec, this, "seek"), arguments);
      return this;
    },
    rewind: function () {
      return this.seek("-1x");
    },
    forward: function () {
      return this.seek("1x");
    },
    playFromStart: function () {
      return this.seek("0a");
    },
    playFromEnd: function () {
      return this.seek("-0a");
    },
    getVolume: function () {
      return applyFn(getVolume, [], this);
    },
    setVolume: function (volume) {
      applyFn(setVolume, [volume], this);
    },
    getMuteFlag: function () {
      return applyFn(getVolumeMute, [], this);
    },
    setMuteFlag: function (mute) {
      applyFn(setVolumeMute, [!!mute], this);
    },
    stop: function () {
      applyFn(releasePlayer, null, this);
    },
    release: function () {
      applyFn(release, null, this);
    },
    getCurrentTime: function () {
      return getCurrentPlayTime(this);
    }
  };
  MP.prototype = new Topic();
  joinObj(MP.prototype, proto);
  MP.topic = topic;
  root.MP = MP;
})(window);

// 处理apk的返回监听
(function (root) {
  var topic = new Topic();
  var APKTopic = {
      sub:function(sign,fn){
        topic.sub(sign,fn)
      },
      pub:function(sign){
        var args = UTIL.slice(arguments, 1);
        topic.pub(sign,args)
      },
      once:function(sign,fn){
        topic.once(sign,fn)
      }
  }
  root.APKTopic = APKTopic;
}
)(window);
var $ = new Common(window, Query);
$.printer = function (content) {
  var $dom = $('<div id="global_printer"></div>').appendTo().css({
    position: 'absolute',
    left: '45px',
    top: '45px',
    width: '1190px',
    fontSize: '24px',
    zIndex: 999,
    color: 'cyan',
    backgroundColor: 'rgba(0, 0, 0, .8)',
    wordBreak: 'break-all'
  });
  $.printer = function (content) {
    if (/Array/i.test($.getType(content))) {
      for (var i = 0; i < content.length; i++) {
        arguments.callee.call($, content[i]);
      }
      return;
    }
    !arguments.length && (content = '码农童鞋 你好像忘传参数了啊 ⊙﹏⊙');
    content = Object.O2S(content);
    $dom.text($dom.text() ? $dom.text() + '\n' + content : content);
    if ($dom.offset('height') > 660) $dom.text(content);
  }
  $.printer(content);
}
try {
  if ($.page.log) {
    Logger.setLevel(Logger[$.page.log.toUpperCase()]);
  } else {
    Logger.setLevel(Logger.OFF);
  }
} catch (e) { }

var isTest = EPG.isTest;

var cwindow, topFrame, viewSizeSelecter = '[name="page-view-size"]', $viewSize = $(viewSizeSelecter), defaultSize = getPageSize($viewSize);

$viewSize.current = defaultSize;

function getPageSize($el) {
  return $el.attr("content");
}

function setPageSize(size) {
  if (size && $viewSize.current !== size) {
    var wh = size.split("*");
    var style = {
      width: wh[0] + "px",
      height: wh[1] + "px"
    };
    $("body").css(style);
    $(topFrame).css(style);
    $viewSize.current = $viewSize[0].content = size;
  }
}

var _ = {
  _: {},
  set: function (key, value) {
    this._[key] = value;
  },
  get: function (key) {
    return this._[key];
  },
  rm: function (key) {
    delete this._[key];
  }
};

var keyEventHot = false;

function keyEvent(e) {
  if (e.keyCode != 768) {
    if (keyEventHot) {
      return true;
    }
    keyEventHot = true;
    setTimeout(function () {
      keyEventHot = false;
    }, 10);
  }
  if (e.keyCode === 117) {
    location.reload(true);
    return true;
  }
  if (e.keyCode === 116) {
    if (cwindow) {
      cwindow.location.reload(true);
    }
    return true;
  }
  var r = $.KB.respond(e.keyCode);
  if (r) {
    e.preventDefault && e.preventDefault();
  }
  return true;
}

function load() {
  each(EPG.helper, function (v) {
    if (v && v.enable) {
      apply(v.enable, null, v);
    }
    v = null;
  });
  document.onkeypress = keyEvent;
  var curl = $.urls.home;
  $.getAutoSignStatus(function (autoStatus) {
    autoStatus && ($.autoSignStatus = autoStatus);
    $.getEdition(function (type) {
      type && ($.linnEdition = type);
      initCwindow();
      $.redirect(curl);
    })
  })
  setTimeout(function() {
    rc.checkActive();
}, 1e3 * 15);
}

function unload() { }

function initCwindow() {
  if (!cwindow) {
    var $topFrame = $('<iframe style="position:absolute;left:0px;top:0px;width:1920px;height:1080px;" id="topFrame" frameBorder=0 scrolling=no src=""></iframe>');
    $topFrame.appendTo("body");
    topFrame = $topFrame[0];
    cwindow = topFrame.contentWindow;
  }
}

var firstStartPage = true;

function startPage() {
  out("startPage");
  cwindow = topFrame.contentWindow;
  setPageSize(getPageSize($(viewSizeSelecter, topFrame.contentDocument)) || defaultSize);
  document.title = cwindow.document.title;
  var _onunload = cwindow.onunload;
  cwindow.onunload = function () {
    apply(_onunload, arguments);
    _onunload = null;
    destroyPage();
  };
  cwindow.document.onkeypress = keyEvent;
  apply(cwindow.focus, null, cwindow);
  Logger.info("startPage", cwindow.location.href);
  if (firstStartPage) {
    $("body").removeClass("loading");
    firstStartPage = false;
  }
}

function destroyPage() {
  apply(window.focus);
  Logger.info("destroyPage", cwindow.location.href);
  cwindow.onunload = null;
  try {
    cwindow.$.AutoHide.reset();
  } catch (e) { }
  cwindow.document.onkeypress = cwindow.document.onkeydown = cwindow = null;
  apply(window.voice_order && voice_order.uninstall, null, window.voice_order);
  $.pTool.reset();
  $.keyTool.reset();
}

var outOpened = false;

function out() { }
   
function ActiveObjectFocusTo(key, val) {
  function focusTo(value) {
    var ACTIVE_OBJECT = cwindow.ACTIVE_OBJECT;
    if (typeof ACTIVE_OBJECT !== "undefined" && ACTIVE_OBJECT != null) {
      if (value == "back") {
        value = "return";
      }
      value = "press" + val[0].toLocaleUpperCase() + val.slice(1);
      if (typeof ACTIVE_OBJECT !== "undefined" && ACTIVE_OBJECT != null) {
        var action = ACTIVE_OBJECT[value];
        if (typeof action === "function") {
          return action.apply(null, ACTIVE_OBJECT.args);
        } else {
          var id = ACTIVE_OBJECT[value];
          if (id && cwindow.$("#" + id).length) {
            cwindow.$.focusTo(id);
            return true;
          }
        }
      }
    }
  }
  if (cwindow && focusTo(val)) {
    return true;
  }
  if (val === "back") {
    if (cwindow && cwindow.$) {
      apply(cwindow.$.back, null, cwindow.$);
    } else {
      var _url = $.getBackUrl(true);
      if (_url) {
        topFrame.contentWindow.location = _url;
      }
    }
  }
  return true;
}

// 广告业务的接口
var AD_SDK = function() {
  var strPrefix = EPG.isTest ? 'http://172.25.88.66:20000/' : 'http://10.128.4.8:30020/';
  return new function () {
    //贴片广告
    this.get = function (params,opt) {
      var initParams = {
        action: params.action,
        playtype: params.playtype,
        channel: params.channel || "",
        categoryId: params.categoryId || "",
        contentId: params.contentId || "",
        contentName: params.contentName || "",
        programName: params.programName || "",
        rollStartTime:  params.rollStartTime || "",
        rollEndTime:  params.rollEndTime || "",
        callback: params.callback || 'callback'
      }
      // $.jsonp('http://172.25.88.66:20000/IPTVADService/AdvertisementRequest?control=1&stbid=000004000008894000000021265E90D8&action=3&playtype=1&channel=&categoryid=20001110000000000000000000014704&contentid=10001110000000000000000001048871&distDomain=1100000001&callback='+initParams.callback, {
      //   success:opt.success,
      //   error: opt.error,
      //   jsonpName: initParams.callback
      // })
      $.jsonp(strPrefix + 'IPTVADService/AdvertisementRequest?control=1&stbid=' + EPG.userId + '&action=' + initParams.action + '&playtype=' + initParams.playtype + '&channel=' + initParams.channel + '&categoryid=' + initParams.categoryId + '&contentid=' + initParams.contentId + '&contentName=' + initParams.contentName + '&programName=' + initParams.programName + '&rollStartTime=' + initParams.rollStartTime + '&rollEndTime=' + initParams.rollEndTime + '&distDomain=' + EPG.ddId +  '&launchAreaCode=' + $.getVariable("EPG:areaId") + '&userGroupCode=' + _.get('userGroup') + '&callback='+ initParams.callback, {
        success:opt.success,
        error: opt.error,
        jsonpName: initParams.callback
      })
    };
  }
}();

$.KB.setup({
  KEY_HOME: function () {
    removeItem("cwindow", "*");
    $.redirect($.urls.home);
    return true;
  },
  EVENT_UTILITY: function () {
    var estr = Utility.getEvent();
    try {
      var e = JSON.parse(estr);
      switch (e.type) {
        case "EVENT_GO_CHANNEL":
        case "EVENT_MEDIA_FIRST_FRAME":
        case "EVENT_MEDIA_BEGINING":
          MP.topic && MP.topic.pub("media.begin", e);
          break;

        case "EVENT_MEDIA_ERROR":
          MP.topic && MP.topic.pub("media.error", MediaPlayer && MediaPlayer.GetLastError && MediaPlayer.GetLastError());
          break;

        case "EVENT_MEDIA_END":
          MP.topic && MP.topic.pub("media.end", e);
          break;

        case "EVENT_PLAYMODE_CHANGE":
          MP.topic && MP.topic.pub("media.playmode.change", e);
          break;

        case "EVENT_REMINDER":
          break;

        case "EVENT_STB_HEARTBEAT":
          $.s.onLineHeartbeat.now();
          break;
        case "EVENT_IPTV_RESUME":
          APKTopic.pub("EVENT_IPTV_RESUME");
          break;
        default:
          break;
      }
    } catch (e) { }
    return true;
  },
  GN: function (k, v) {
    var tmp = $.pTool.get("g_sys_num");
    if (tmp) {
      tmp.press(v);
      tmp = null;
    }
    return true;
  },
  GV: function (k, v) {
    var tmp = $.pTool.get("g_sys_volume");
    if (tmp) {
      tmp.press(v);
      tmp = null;
    }
    return true;
  },
  GK: function (k, v) {
    var tmp = $.pTool.get("g_sys_fn");
    if (tmp) {
      removeItem("cwindow", "*");
      $.saveBackUrl($.urls.home);
      tmp.press(v);
      tmp = null;
    }
    return true;
  },
  KEY_SPEECH: function () {
    if (window.voice_agency) {
      if (voice_agency.status === "loading") {
        return;
      }
      if (!voice_agency.status) {
        voice_agency.status = "loading";
        $.s.guidance.get({
          id: $.getVariable("common.tips")
        }, {
          success: function (data) {
            voice_agency.status = "loaded";
            var out = [];
            each(data, function (v) {
              out.push(v.contentUri);
            });
            voice_agency.setData(out);
            voice_agency.start();
          },
          error: function () {
            voice_agency.status = "loaded";
          }
        });
        return true;
      }
      voice_agency.start();
      return true;
    }
  },
  GEB: ActiveObjectFocusTo,
  GD: ActiveObjectFocusTo,
  GP: ActiveObjectFocusTo
}, $.keyTool.keyRes);

function setExptCache(name, val) {
  var cache = _.get("ExptCache") || {};
  cache[name] = val;
  _.set("ExptCache", cache);
  val = cache = null;
}
   
function getExptCache(name) {
  try {
    return _.get("ExptCache")[name];
  } catch (e) { }
}

function setCache(name, val) {
  var cache = _.get("ManifestCache") || {};
  cache[name] = {
    rev: val.rev,
    expire: val.expire ? new Date().getTime() + val.expire : 0
  };
  if (val.type) {
    cache[name].type = val.type;
  }
  _.set("ManifestCache", cache);
  val = cache = null;
}

function getAllInManifestCache() {
  return _.get("ManifestCache") || {};
}

function findItemInManifestCache(name) {
  var ds = getAllInManifestCache();
  ds && (ds = ds[name]);
  return ds;
}

function findItemInManifest(name) {
  var ds = getFileInfo("Manifest");
  ds && (ds = ds.data);
  ds && (ds = ds[name]);
  return ds;
}

function findManifest(name) {
  var ds = findItemInManifestCache(name);
  if (!ds) {
    ds = findItemInManifest(name);
  }
  return ds;
}

function request(names, cb) {
  var reloadManifest = false;
  var allInLoc = true;
  var infos = [];
  each(names, function (name) {
    var rev = name.split("?");
    name = rev[0];
    rev = rev[1] || 0;
    infos.push({
      name: name,
      rev: rev,
      path: checkStatus(name, rev)
    });
  });
  requestList.lists.push({
    infos: infos,
    callback: cb
  });
  function checkStatus(name, rev) {
    var path = "";
    var loc = findManifest(name);
    if (loc) {
      if (loc.rev > 0 && rev > 0 && rev > loc.rev) {
        reloadManifest = true;
        allInLoc = false;
      }
      if (reloadManifest) {
        delete requestList.status[name];
      } else {
        if (loc.rev < 0) {
          loc = findItemInManifest(name);
        }
        if (loc && loc.path) {
          allInLoc = false;
          path = loc.path;
        }
      }
    } else {
      setCache(name, {
        rev: -1,
        type: "req",
        expire: 1e3
      });
      reloadManifest = true;
      allInLoc = false;
    }
    loc = null;
    return path;
  }
  if (reloadManifest) {
    fetchManifest();
  } else {
    if (allInLoc) {
      requestList.checkAndComplete();
    } else {
      each(infos, function (info) {
        if (info.path) {
          fetchManifestItem(info.path, info.name);
        }
      });
    }
  }
  infos = null;
}

var requestList = {
  status: {},
  lists: [],
  complete: function () {
    each(this.lists, function (req) {
      var args = [];
      each(req.infos, function (info) {
        args.push(getExptCache(info.name));
      });
      apply(req.callback, args);
      args = req = null;
    });
    this.lists = [];
    apply(this.firstSuccess, null, this);
  },
  checkAndComplete: function () {
    if (this.lists.length) {
      each(this.lists, function (req) {
        each(req.infos, function (info) {
          this.status[info.name] = 1;
        });
      });
      this.complete();
    }
  },
  firstSuccess: function () {
    delete this.firstSuccess;
    var times = 0;
    each(EPG.helper, function (helper, name) {
      if (apply(helper.padding, [ready], helper)) {
        times++;
      }
      name = helper = null;
    });
    function start() {
      $(load);
    }
    function ready() {
      times--;
      if (times <= 0) {
        start();
        start = null;
      }
    }
  },
  length: 0
};

function setHelper(name) {
  if (!EPG.helper) {
    EPG.helper = {};
  }
  EPG.helper[name] = getExptCache(name);
}

function updateManifestRequestListStatus(name, code) {
  if (code) {
    if (name === "*" && code < 0) {
      requestList.length = 0;
      each(requestList.status, function (v, k) {
        if (!v) {
          requestList.status[k] = code;
        }
      });
    } else {
      requestList.length--;
      requestList.status[name] = code;
    }
    if (requestList.length <= 0) {
      requestList.complete();
    }
  } else {
    requestList.status[name] = code;
    requestList.length++;
  }
}

var fetchManifestItemList = {};

function setManifestItemListStatus(name, status) {
  var code = status === "loading" ? 0 : status === "success" ? 1 : -1;
  if (name !== "*") {
    fetchManifestItemList[name] || (fetchManifestItemList[name] = {});
    fetchManifestItemList[name].status = status;
    if (code > 0) {
      setHelper(name);
    }
  }
  updateManifestRequestListStatus(name, code);
}

function fetchManifestItemSuccess(name, txt) {
  var arr = ["var expt = {}", txt, ["if(expt && expt.rev){", 'setCache("', name, '", {', "rev : expt.rev,", "expire : expt.expire", "});", 'setExptCache("', name, '", expt)', "}"].join("")];
  return Function(arr.join(";"))();
}

function fetchManifestItem(url, name) {
  url = EPG.pathRes + "/vendor/" + name.replace(":", "/") + url;
  $.get(url, {
    success: function (d) {
      try {
        fetchManifestItemSuccess(name, d);
        setManifestItemListStatus(name, "success");
        Logger.out.info = ["update %s success", name];
      } catch (e) {
        setManifestItemListStatus(name, "error");
        Logger.out.error = ["update %s error", name];
      }
    },
    error: function () {
      setManifestItemListStatus(name, "error");
    }
  });
  setManifestItemListStatus(name, "loading");
}

function updateManifestItem(url, name, mode, type, locType) {
  if (url) {
    if (type === "boot" && mode === "add" || mode === "mod" || locType === "req") {
      fetchManifestItem(url, name);
    }
  }
}

function getFileInfo(name) {
  var ds = _.get("fileInfo");
  ds = ds && ds[name];
  return ds;
}

function setFileInfo(name, md, data, expire) {
  var ds = _.get("fileInfo") || {};
  ds[name] = {
    md: md
  };
  try {
    ds[name].data = sclone(data);
    if (expire && expire > 0) {
      ds[name].expired = new Date().getTime() + expire;
    }
  } catch (e) { }
  _.set("fileInfo", ds);
  ds = null;
}

function getFileInfoData(name) {
  var ds = getFileInfo(name);
  return ds && sclone(ds.data) || undefined;
}

function dealData(name, data, noChange, change, error) {
  try {
    var oData = getFileInfo(name);
    var md = UTIL.mdComp(oData && oData.md, data);
    data = JSON.parse(data.replace(/\/\*(.|\n)*?\*\//gm, "").replace(/\\(\;|\')/gm, "$1"));
    if (md) {
      var tmp = getExptCache(name);
      setFileInfo(name, md, data, tmp && tmp.expire);
      var changeList = UTIL.findDiff(oData && oData.data, data);
      apply(change, [changeList, data]);
      data = oData = changeList = null;
      return;
    } else {
      apply(noChange, [data]);
    }
  } catch (e) {
    apply(error);
  }
}

function dealManifest(data) {
  dealData("Manifest", data, ManifestNoChange, ManifestChange, dealManifestErr);
}

function ManifestChange(changeList, ds) {
  var cache = getAllInManifestCache();
  if (ds && changeList) {
    each(changeList, function (mode, name) {
      var cacheDs = cache[name];
      var d = ds[name];
      if (d) {
        if (!cacheDs || cacheDs && d.rev > cacheDs.rev) {
          updateManifestItem(d.path, name, mode, d.type, cacheDs && cacheDs.type);
        }
      }
      v = d = cacheDs = null;
    });
  }
  changeList = ds = cache = null;
}

function ManifestNoChange(ds) {
  requestList.checkAndComplete();
  ds = null;
}

function dealManifestErr() {
  setManifestItemListStatus("*", "error");
}

function fetchManifest() {
  $.get(EPG.pathRes + "/vendor/manifest.json", {
    success: dealManifest,
    error: dealManifestErr,
    timeout: 1e4
  });
}
function JK39_() {
  this.back = function () {
    var bakcUrl = $.getBackUrl(!0);
    top.topFrame.contentWindow.location.href = bakcUrl;
  }
}

window.bestv = new Trio();
window.jk39 = new JK39_();
fetchManifest()

// 弹屏相关接口
var popModal = function () {
  var SERVER = EPG.isTest ? 'http://10.128.4.10:9400/' : 'http://10.128.4.76:20000/';
  return new function () {        
    this.modal = function (opt) {
      $.get(SERVER + 'homeModal/popModal?userId=' + EPG.userId + '&node=' + EPG.node + '&groups=' + opt.groups + '&epgEdition=720p', {
        success: function (res) {
          res = JSON.parse(res);
          if (res.code === 0) {
            opt.success(res);
          }
        },
        error: function () {
        }
      })
    },
      this.userGroup = function (opt) {
        $.get(SERVER + 'group/userId/' + EPG.userId, {
          success: function (res) {
            res = JSON.parse(res)
            if (res.code === 1) {
              opt.success(res);
            }
          },
          error: function () {
          }
        })
      }
  }
}();
// 双屏绑定
var Phone_Bind = function () {
  var QR_SERVER = EPG.isTest ? 'http://10.128.4.11:4000/' : 'http://10.128.4.11:4000/';
  var BIND_SERVER = EPG.isTest ? 'http://10.128.4.11:10000/' : 'http://10.128.4.11:10000/';
  return new function () {
    this.qrcode = function (opt) {
      $.get(QR_SERVER + 'user/qrcode/get/' + opt.area + '/' + opt.cp + '/' + opt.userId + '/' + opt.node + '/' + opt.bindId, {
        success: function (res) {
          opt.success(JSON.parse(res));
        },
        error: function (err) {
          opt.error(err);
        }
      })
    },
      this.getMobileInfos = function (opt) {
        $.get(BIND_SERVER + 'user/mobileInfos/' + opt.bindId, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      },
      this.unactive = function (opt) {
        $.get(BIND_SERVER + 'user/qrcode/unactive/' + opt.bindId + '/' + opt.mobileId, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      },
      this.bind = function (opt) {
        $.get(BIND_SERVER + 'user/qrcode/bind/' + opt.area + '/' + opt.cp + '/' + opt.userId + '/' + opt.node + '/' + opt.bindId + '/' + opt.mobileId + '/' + opt.mobileName, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      },
      this.unbind = function (opt) {
        $.get(BIND_SERVER + 'user/qrcode/unbind/' + opt.bindId + '/' + opt.mobileId, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      },
      this.setOffline = function (opt) {
        $.get(BIND_SERVER + 'user/setOffline/bindId/' + opt.bindId, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      },
      this.checkActive = function (opt) {
        $.get(BIND_SERVER + 'user/mobileInfo/' + opt.bindId, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      },
      this.shouldOnline = function (opt) {
        $.get(BIND_SERVER + 'user/shouldOnline/' + opt.bindId, {
          success: function (res) {
            opt.success(JSON.parse(res));
          },
          error: function (err) {
            opt.error(err);
          }
        })
      }
  }
}();

var rc = function () {
  var userId = EPG.userId, area = "0432", cp = "004", bindId = area + cp + EPG.node + "_" + userId, RCTL_SERVER = 'http://10.128.4.11:3200', QR_SERVER = 'http://10.128.4.11:4000';
  var SOCKET, mobileIds = {}, lastPingTime = 0, pingLostTime = 1e3 * 60 * 10, checkPingTimer, checkOnlineTimer, checkOnlineStarted = false, shouldOnlineStartTimer;
  function checkPingStart() {
    clearTimeout(checkPingTimer);
    checkPingTimer = setTimeout(offLineSocket, pingLostTime);
  }
  function checkActive() {
    Phone_Bind.checkActive({
      bindId: bindId,
      success: activeCallback,
      error: activeCallback
    });
  }
  function activeCallback(result) {
    if (result && result.code === 1) {
      if (!SOCKET) {
        checkOnlineStart();
      }
    }
  }
  function getMobileInfos(success, error) {
    Phone_Bind.getMobileInfos({
      bindId: bindId,
      success: function () {
        apply(mobileInfosCallback, arguments);
        apply(success, arguments);
      },
      error: function () {
        apply(mobileInfosCallback);
        apply(error);
      }
    });
  }
  function mobileInfosCallback(result) {
    var hasMobileActive = false;
    if (result && result.code === 1) {
      mobileIds = {};
      for (var i in result.data) {
        var d = result.data[i];
        if (d && d.active) {
          mobileIds[d.mobileId] = d.mobileId;
          hasMobileActive = true;
        }
      }
      if (!SOCKET && hasMobileActive) {
        checkActive();
      }
    }
    if (!hasMobileActive) {
      clearTimeout(checkOnlineTimer);
    }
  }
  function checkMobileActive(mobileId) {
    return !!mobileIds[mobileId];
  }
  function checkOnlineStart() {
    checkOnlineStarted = true;
    clearTimeout(checkOnlineTimer);
    checkOnlineTimer = setTimeout(checkOnline, 2e3, onlineCallback);
  }
  function checkOnline(cb) {
    Phone_Bind.shouldOnline({
      bindId: bindId,
      success: cb,
      error: cb
    });
  }
  function onlineCallback(result) {
    if (result && result.code === 1) {
      checkOnlineStarted = false;
      connectSocket();
    } else {
      checkOnlineStart();
    }
  }
  function shouldOnlineStart(delay) {
    if (checkOnlineStarted) {
      clearTimeout(checkOnlineTimer);
    }
    if (shouldOnlineStartTimer) {
      clearTimeout(shouldOnlineStartTimer);
    }
    if ("{}" === JSON.stringify(mobileIds)) {
      if (delay) {
        shouldOnlineStartTimer = setTimeout(checkOnline, delay, shouldOnlineCallback);
      } else {
        shouldOnlineStartTimer = undefined;
        checkOnline(shouldOnlineCallback);
      }
    }
  }
  function shouldOnlineCallback(result) {
    if (result && result.code === 1) {
      checkOnlineStarted = false;
      connectSocket();
    } else {
      if (shouldOnlineStartTimer !== false) {
        shouldOnlineStart(1e3);
      }
    }
  }
  function shouldOnlineStop() {
    clearTimeout(shouldOnlineStartTimer);
    shouldOnlineStartTimer = false;
    if (checkOnlineStarted) {
      checkOnlineStart();
    }
  }
  function connectSocket() {
    if (SOCKET) {
      return;
    }
    SOCKET = io(RCTL_SERVER);
    SOCKET.on("connect", function () {
      SOCKET.emit("login", bindId);
      $.vs.link(true);
      checkPingStart();
    });
    SOCKET.on("order", function (order) {
      var mobileId = order.split("*")[0];
      var msg = order.split("*")[1];
      socketOrder(mobileId, msg);
    });
    SOCKET.on("u_ping", function (data) {
      var cmd = data.split("*");
      var mobileId = cmd[0];
      if (cmd[1] === "PING") {
        orderOk(mobileId, true);
        SOCKET.emit("u_ping", bindId + "*" + mobileId + "*PONG");
        lastPingTime = new Date();
        checkPingStart();
      }
    });
    SOCKET.on("error", function (err) {
      if (err) {
        SOCKET.disconnect();
        SOCKET = null;
        checkOnlineStart();
      }
    });
    getMobileInfos();
  }
  function offLineSocket() {
    if (SOCKET) {
      Phone_Bind.setOffline({
        bindId: bindId,
        success: setOfflineCallback,
        error: setOfflineCallback
      });
      SOCKET.emit("logout", bindId);
      SOCKET.disconnect();
      SOCKET = null;
      checkOnlineStart();
    }
  }
  function setOfflineCallback(d) {
    $.vs.link();
  }
  function socketOrderPre(mobileId, key) {
    if (key !== "REFRESH" && !checkMobileActive(mobileId)) {
      if (key == "PLAYCTL") {
        orderOk(mobileId, false, "pull");
      } else {
        orderOk(mobileId, false);
      }
      return false;
    }
    return true;
  }
  function socketOrder(mobileId, msg) {
    var params = msg.split("@");
    if (params.length <= 1) {
      params = msg.split("_");
    }
    var key = params.shift();
    if (!socketOrderPre(mobileId, key)) {
      return;
    }
    apply(REMOTE_CTRL[key], [mobileId, params], REMOTE_CTRL);
  }
  function orderOk(mobileId, success, pull) {
    if (mobileId) {
      var backObj;
      var type = pull ? "pull" : "push";
      if (success) {
        var backObj = {
          type: type,
          code: "1"
        };
      } else {
        var backObj = {
          type: type,
          code: "-1",
          errorType: "1"
        };
      }
      SOCKET.emit("stb_order", bindId + "*" + mobileId + "*" + JSON.stringify(backObj));
    }
  }
  var REMOTE_CTRL = {
    CHANNEL: function (mobileId, params) {
      if (params[0]) {
        var num = params[0];
        var playTime = params[1];
        this.playLiveOrRec(mobileId, num, null, null, playTime);
      } else {
        orderOk(mobileId, false);
      }
    },
    PUSH_TO_TV: function (mobileId, params) {
      if (params && params.length) {
        orderOk(mobileId, true);
      } else {
        orderOk(mobileId, false);
        return;
      }
      var COMMON_MS_CATEGORY_ID = "mobile";
      var seriesId = params[0];
      var contentId = params[1];
      var playTime = params[2];
      var type = +params[3];
      if (!type) {
        if (params.length == 2) {
          type = 0;
        }
        if (params.length == 3) {
          type = 2;
        }
      }
      if (type === 7) {
        type = 3;
      }
      var obj = {
        playModel: "mobile",
        contentType: type,
        categoryId: COMMON_MS_CATEGORY_ID,
        contentId: seriesId || contentId,
        sceneId: contentId,
        playTime: playTime
      };
      apply(cwindow && cwindow.$ && cwindow.$.gotoDetail, [obj], cwindow && cwindow.$);
    },
    CTRL: function (mobileId, params) {
      if (params.length) {
        REMOTE_CTRL.keyevt(+params[0]);
        orderOk(mobileId, true);
      } else {
        orderOk(mobileId, false);
      }
    },
    PUSH_TVOD_TO_TV: function (mobileId, msg) {
      if (msg.length == 4) {
        var channelNum = msg[0];
        var startTime = msg[1];
        var endTime = msg[2];
        var playTime = msg[3];
        this.playLiveOrRec(mobileId, channelNum, startTime, endTime, playTime);
      } else {
        orderOk(mobileId, false);
      }
    },
    PUSH_TO_ORDER: function (mobileId, msg) {
      if (msg.length == 2) {
        var chargesId = msg[0] || "";
        var categoryId = msg[1];
        orderOk(mobileId, true);
        this.redirectOrder(chargesId, categoryId);
      } else {
        orderOk(mobileId, false);
      }
    },
    PLAYCTL: function (mobileId, msg) {
      var errObj = {
        type: "pull",
        code: "-1",
        errorType: "1"
      };
      var outObj;
      if (cwindow && cwindow.$ && cwindow.getPlayInfo) {
        outObj = cwindow.getPlayInfo();
      }
      if (!outObj) {
        outObj = errObj;
      }
      SOCKET.emit("stb_order", bindId + "*" + mobileId + "*" + JSON.stringify(outObj));
    },
    keyevt: function (keyCode) {
      keyEvent({
        keyCode: keyCode
      });
    },
    playLiveOrRec: function (mobileId, channelNum, startTime, endTime, playTime) {
      var channelInfo = $.getHelper("data:channel").channelMap[channelNum];
      if (channelInfo && cwindow && cwindow.$ && cwindow.$.playLiveOrRec) {
        apply(cwindow.$.playLiveOrRec, [{
          channelId: channelInfo.channelId,
          startTime: startTime,
          endTime: endTime,
          playTime: playTime
        }], cwindow && cwindow.$);
        orderOk(mobileId, true);
      } else {
        orderOk(mobileId, false);
      }
    },
    REFRESH: function (mobileId) {
      orderOk(mobileId, true);
      apply(cwindow && cwindow.$ && cwindow.refreshOrder);
    },
    redirectOrder: function (chargesId, categoryId) {
      removeItem("cwindow", "*");
      $.saveBackUrl($.urls.home);
      $.getAuth().forwardOrder({
        categoryId: categoryId,
        chargesId: chargesId
      });
    }
  };
  function qrcode(success, error) {
    Phone_Bind.qrcode({
      area: area,
      cp: cp,
      bindId: bindId,
      userId: userId,
      node: EPG.node,
      success: function (data) {
        if (data && data.filePath) {
          data.filePath = $.Tps("%s/qrcode/%s?%s", QR_SERVER, data.filePath, Math.random());
          apply(success, [data]);
        } else {
          apply(error);
        }
      },
      error: error
    });
  }
  function bind(mobileId, mobileName, success, error) {
    Phone_Bind.bind({
      area: area,
      cp: cp,
      mobileName: mobileName,
      mobileId: mobileId,
      bindId: bindId,
      success: success,
      error: error
    });
  }
  function unbind(mobileId, success, error) {
    Phone_Bind.unbind({
      mobileId: mobileId,
      bindId: bindId,
      success: success,
      error: error
    });
  }
  function unactive(mobileId, success, error) {
    Phone_Bind.unactive({
      mobileId: mobileId,
      bindId: bindId,
      success: success,
      error: error
    });
  }
  return {
    checkActive: checkActive,
    getMobileInfos: getMobileInfos,
    mobileInfosCallback: mobileInfosCallback,
    bind: bind,
    unbind: unbind,
    unactive: unactive,
    qrcode: qrcode,
    shouldOnlineStart: shouldOnlineStart,
    shouldOnlineStop: shouldOnlineStop,
    REMOTE_CTRL: REMOTE_CTRL
  };
}();