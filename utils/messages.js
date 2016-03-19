/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Utilities for dealing with messages to different app domains.
 */
/* global window, MessageChannel, Promise */
'use strict';

/**
 * Send a message to a worker.
 * Use a MessageChannel if available.
 * Overwrites onmessage handler of the worker or serviceWorkerContainer.controller
 * if MessageChannel not available.
 *
 * @param {Object} message - A structured message. Port added if MessageChannel available.
 * @param {Object} [worker] - The target worker, defaults to active service worker.
 * @returns {Object} A promise to be resolved.
 */
function workerSendMessage (message, worker) {
  var serviceWorkerContainer, workerPromise;

  if (worker) {
    workerPromise = Promise.resolve(worker);
  } else if ('serviceWorker' in window.navigator) {
    serviceWorkerContainer = window.navigator.serviceWorker;
    workerPromise = serviceWorkerContainer.ready.then(function (registration) {
      return registration.active;
    });
  } else {
    workerPromise = Promise.reject('No target worker specified');
  }

  return workerPromise
  .then(function (workerAsPromised) {
    /**
     * Send a message to worker and return a Promise.
     */
    return new Promise(function workerSendMessageExecutor (resolve, reject) {
      /**
       * A rudimentary message handler to resolve the promise.
       */
      var messageHandler = function workerMessageHandler (event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      var transfer, messageChannel;

      if (window.MessageChannel) {
        messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = messageHandler;
        message.port = messageChannel.port2;
        transfer = [messageChannel.port2];
      } else {
        if ('onmessage' in workerAsPromised) {
          workerAsPromised.onmessage = messageHandler;
        } else {
          if (serviceWorkerContainer) {
            serviceWorkerContainer.onmessage = messageHandler;
          } else {
            reject('Message response not supported');
          }
        }
      }

      workerAsPromised.postMessage(message, transfer);
    });
  });
}

module.exports = {
  workerSendMessage: workerSendMessage
};
