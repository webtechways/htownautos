"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const meta_service_1 = require("./meta.service");
describe('MetaService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [meta_service_1.MetaService],
        }).compile();
        service = module.get(meta_service_1.MetaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=meta.service.spec.js.map