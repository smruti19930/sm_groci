/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";

// Import all the functions
import * as bulkUpload from "./bulk-upload";
import * as categories from "./categories";
import * as items from "./items";
import * as login from "./login";
import * as sales from "./sales";
import * as sell from "./sell";
import * as signup from "./signup";
import * as units from "./units";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.bulkUpload = onRequest(bulkUpload.handler);
exports.categories = onRequest(categories.handler);
exports.items = onRequest(items.handler);
exports.login = onRequest(login.handler);
exports.sales = onRequest(sales.handler);
exports.sell = onRequest(sell.handler);
exports.signup = onRequest(signup.handler);
exports.units = onRequest(units.handler);
