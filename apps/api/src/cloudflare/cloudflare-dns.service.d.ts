export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
export interface DnsRecord {
    id: string;
    type: DnsRecordType;
    name: string;
    content: string;
    priority?: number;
    ttl?: number;
}
export declare class CloudflareDnsService {
    private readonly logger;
    private readonly apiBase;
    private readonly token;
    private readonly zoneId;
    constructor();
    createTxt(name: string, content: string, ttl?: number): Promise<DnsRecord>;
    createCname(name: string, target: string, ttl?: number): Promise<DnsRecord>;
    createMx(name: string, target: string, priority?: number, ttl?: number): Promise<DnsRecord>;
    listByName(name: string): Promise<DnsRecord[]>;
    deleteRecord(id: string): Promise<void>;
    deleteByName(name: string, type?: DnsRecordType): Promise<number>;
    private createRecord;
    private request;
    private toDnsRecord;
    private assertConfigured;
}
