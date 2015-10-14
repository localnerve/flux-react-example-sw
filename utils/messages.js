/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
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
  var serviceWorkerContainer = window.navigator.serviceWorker;
  var defaultTargetWorker =
    serviceWorkerContainer && serviceWorkerContainer.controller;

  worker = worker || defaultTargetWorker;

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

    if (worker) {
      var transfer, messageChannel;

      if (window.MessageChannel) {
        messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = messageHandler;
        message.port = messageChannel.port2;
        transfer = [messageChannel.port2];
      } else {
        if ('onmessage' in worker) {
          worker.onmessage = messageHandler;
        } else {
          if (worker === defaultTargetWorker) {
            serviceWorkerContainer.onmessage = messageHandler;
          } else {
            reject('Message response not supported');
          }
        }
      }

      worker.postMessage(message, transfer);
    } else {
      reject('No target worker specified');
    }
  });
}

module.exports = {
  workerSendMessage: workerSendMessage
};
