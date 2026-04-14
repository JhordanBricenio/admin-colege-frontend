export class EducationLevel {

    idEducationLevel?: string;
    name: string;
    levelType: 'INITIAL' | 'PRIMARY' | 'SECONDARY' | 'OTHER' | string;
    shift: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    idManagement: string;
}
