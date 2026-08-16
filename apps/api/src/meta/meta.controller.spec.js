"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const meta_controller_1 = require("./meta.controller");
describe('MetaController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [meta_controller_1.MetaController],
        }).compile();
        controller = module.get(meta_controller_1.MetaController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=meta.controller.spec.js.map