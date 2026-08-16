import { ChecklistCategory } from '@prisma/client';
export declare class UpdateChecklistItemDto {
    category?: ChecklistCategory;
    part?: string;
    quality?: number;
    notes?: string;
    voiceNoteTranscription?: string;
    sortOrder?: number;
}
