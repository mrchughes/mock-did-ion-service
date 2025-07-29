"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = parseInt(process.env.PORT || '3000', 10);
const app = new app_1.App();
app.listen(PORT);
//# sourceMappingURL=server.js.map