import { ContactMessagesService } from './contact-messages.service';
import { ListContactMessagesDto } from './dto/list-contact-messages.dto';
export declare class ContactMessagesController {
    private readonly contactMessagesService;
    constructor(contactMessagesService: ContactMessagesService);
    list(tenantId: string, query: ListContactMessagesDto): Promise<{
        items: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            phone: string | null;
            email: string;
            subject: string | null;
            buyerId: string | null;
            status: string;
            message: string;
        }[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    markRead(id: string, tenantId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        phone: string | null;
        email: string;
        subject: string | null;
        buyerId: string | null;
        status: string;
        message: string;
    }>;
}
