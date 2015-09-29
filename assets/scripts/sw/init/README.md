# Init Command Module

## About
The 'init' command sets up route handlers and caching for dynamic data, or paths to resources defined on the backend that can change.
These dynamic data are sent down from the app server each time the main app is rendered
(The data is composed during the server-side render). This data is referred to in Flux/React parlance
'Application Flux Stores', or simply 'app state'. This data is sent down from the server and kept in Flux Stores. The Flux Stores are initially populated from the render source: window.App.

## Execution
The 'init' command can be executed two ways:

1. At service worker startup
  This must happen since the lifetime of a service worker is unknown.
  Since the service worker can shutdown at any time, the process must be initialized each time it is started back up
  (to handle routes and caching of dynamic items). In this case, the dynamic data stored when the application was online
  is used to initialize the service worker.
2. At DOMContentReady AND ServiceWorkerReady
  When these two conditions happen, it means that potentially new dynamic data was sent from the server and is ready to be used.
  Therefore, an 'init' command message is sent to the service worker on these conditions, and that triggers the execution of the 'init' command.

The 'init' command can be executed multiple times in the service worker lifetime, so it must be idempotent, and only update the current route handlers and source data to reflect the latest app state.

## Flow
When the init command is executed, the following work is performed:

1. If the application is online, update the stored app state in IndexedDB with a potentially new app state.
  It will only be actually new (different) if there was indeed a change and the command is being run as the result of an 'init' message. Otherwise, it just roundtrips the app state out and back into the IndexedDB.  
2. Setup a precaching route handler for background images for the specified image service.
  The route handler is precaching in that, if you request a background image resource from the image service, it is fetched and cached. ALSO, all other application background image service requests are also fetched and cached at that time (if they are not already in the cache).
3. Setup a precaching route handler for the main navigation routes of the application. These routes are fetched and cached using a special setting that does not require the server to render the application (because that work is expensive for the server, and not required). This allows the application to be started at any of the main applications routes while the app is offline.
