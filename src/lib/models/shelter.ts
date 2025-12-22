export interface Shelter {
    _id?: string;
    name: string;
    description?: string | null;
    location?: any;
    capacity?: number | null;
    capacityStatus: string;
    shelterType: string;
    phoneNumbers: string[];
    responsible: {
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        addedAt: string;
    }[];
    status: string;
    district: string;
    subdistrict: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}
