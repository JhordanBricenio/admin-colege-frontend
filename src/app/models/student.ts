import { Degree } from "./degree";
import { EducationLevel } from "./education-level";
import { User } from "./user";

export class Student {
    idStudent: string;
    code: string;
    status: boolean;
    user: User;
    degree: Degree;
    educationLevel: EducationLevel;
}
