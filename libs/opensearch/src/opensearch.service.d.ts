import { OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
export declare class OpenSearchService implements OnModuleInit {
    private readonly logger;
    private client;
    onModuleInit(): Promise<void>;
    getClient(): Client;
    indexExists(indexName: string): Promise<boolean>;
    createIndex(indexName: string, mapping: any): Promise<boolean>;
    deleteIndex(indexName: string): Promise<boolean>;
    bulkIndex(indexName: string, documents: Array<{
        id: string;
        body: any;
    }>): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    indexDocument(indexName: string, id: string, document: any): Promise<boolean>;
    deleteDocument(indexName: string, id: string): Promise<boolean>;
    search(indexName: string, query: any): Promise<any>;
    count(indexName: string, query?: any): Promise<number>;
}
