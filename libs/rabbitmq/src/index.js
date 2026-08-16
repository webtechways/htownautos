"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUCTION_SYNC_TRIGGER_QUEUE = exports.RabbitMQService = exports.RabbitMQModule = void 0;
var rabbitmq_module_1 = require("./rabbitmq.module");
Object.defineProperty(exports, "RabbitMQModule", { enumerable: true, get: function () { return rabbitmq_module_1.RabbitMQModule; } });
var rabbitmq_service_1 = require("./rabbitmq.service");
Object.defineProperty(exports, "RabbitMQService", { enumerable: true, get: function () { return rabbitmq_service_1.RabbitMQService; } });
var auction_sync_trigger_1 = require("./auction-sync-trigger");
Object.defineProperty(exports, "AUCTION_SYNC_TRIGGER_QUEUE", { enumerable: true, get: function () { return auction_sync_trigger_1.AUCTION_SYNC_TRIGGER_QUEUE; } });
//# sourceMappingURL=index.js.map