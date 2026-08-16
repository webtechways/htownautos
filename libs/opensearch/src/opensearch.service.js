"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpenSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchService = void 0;
const common_1 = require("@nestjs/common");
const opensearch_1 = require("@opensearch-project/opensearch");
let OpenSearchService = OpenSearchService_1 = class OpenSearchService {
    logger = new common_1.Logger(OpenSearchService_1.name);
    client;
    async onModuleInit() {
        const node = process.env.OPENSEARCH_NODE || 'http://localhost:9200';
        const username = process.env.OPENSEARCH_USERNAME;
        const password = process.env.OPENSEARCH_PASSWORD;
        const clientOptions = {
            node,
            ssl: {
                rejectUnauthorized: false,
            },
        };
        if (username && password) {
            clientOptions.auth = { username, password };
        }
        this.client = new opensearch_1.Client(clientOptions);
        try {
            const health = await this.client.cluster.health({});
            this.logger.log(`OpenSearch connected: ${node} - Status: ${health.body.status}`);
        }
        catch (error) {
            this.logger.error(`OpenSearch connection failed: ${error.message}`);
        }
    }
    getClient() {
        return this.client;
    }
    async indexExists(indexName) {
        try {
            const result = await this.client.indices.exists({ index: indexName });
            return result.body;
        }
        catch (error) {
            this.logger.error(`Error checking index existence: ${error.message}`);
            return false;
        }
    }
    async createIndex(indexName, mapping) {
        try {
            const exists = await this.indexExists(indexName);
            if (exists) {
                this.logger.log(`Index ${indexName} already exists`);
                return true;
            }
            await this.client.indices.create({
                index: indexName,
                body: mapping,
            });
            this.logger.log(`Index ${indexName} created successfully`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating index ${indexName}: ${error.message}`);
            return false;
        }
    }
    async deleteIndex(indexName) {
        try {
            const exists = await this.indexExists(indexName);
            if (!exists) {
                this.logger.log(`Index ${indexName} does not exist`);
                return true;
            }
            await this.client.indices.delete({ index: indexName });
            this.logger.log(`Index ${indexName} deleted successfully`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting index ${indexName}: ${error.message}`);
            return false;
        }
    }
    async bulkIndex(indexName, documents) {
        if (documents.length === 0) {
            return { success: 0, failed: 0, errors: [] };
        }
        const body = documents.flatMap(doc => [
            { index: { _index: indexName, _id: doc.id } },
            doc.body,
        ]);
        try {
            const result = await this.client.bulk({ body, refresh: true });
            let success = 0;
            let failed = 0;
            const errors = [];
            if (result.body.items) {
                for (const item of result.body.items) {
                    if (item.index?.error) {
                        failed++;
                        errors.push(`${item.index._id}: ${item.index.error.reason}`);
                    }
                    else {
                        success++;
                    }
                }
            }
            return { success, failed, errors };
        }
        catch (error) {
            this.logger.error(`Bulk index error: ${error.message}`);
            return { success: 0, failed: documents.length, errors: [error.message] };
        }
    }
    async indexDocument(indexName, id, document) {
        try {
            await this.client.index({
                index: indexName,
                id,
                body: document,
                refresh: true,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error indexing document ${id}: ${error.message}`);
            return false;
        }
    }
    async deleteDocument(indexName, id) {
        try {
            await this.client.delete({
                index: indexName,
                id,
                refresh: true,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting document ${id}: ${error.message}`);
            return false;
        }
    }
    async search(indexName, query) {
        try {
            const result = await this.client.search({
                index: indexName,
                body: query,
            });
            return result.body;
        }
        catch (error) {
            this.logger.error(`Search error: ${error.message}`);
            throw error;
        }
    }
    async count(indexName, query) {
        try {
            const result = await this.client.count({
                index: indexName,
                body: query ? { query } : undefined,
            });
            return result.body.count;
        }
        catch (error) {
            this.logger.error(`Count error: ${error.message}`);
            return 0;
        }
    }
};
exports.OpenSearchService = OpenSearchService;
exports.OpenSearchService = OpenSearchService = OpenSearchService_1 = __decorate([
    (0, common_1.Injectable)()
], OpenSearchService);
//# sourceMappingURL=opensearch.service.js.map