import { ChecklistCategory } from '@prisma/client';
export declare class CreateChecklistItemDto {
    category: ChecklistCategory;
    part: string;
    quality?: number;
    notes?: string;
    voiceNoteTranscription?: string;
    sortOrder?: number;
}
