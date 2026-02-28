"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const express_1 = require("express");
const platform_express_1 = require("@nestjs/platform-express");
const server = (0, express_1.default)();
exports.default = async (req, res) => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
    app.enableCors();
    await app.init();
    server(req, res);
};
//# sourceMappingURL=index.js.map