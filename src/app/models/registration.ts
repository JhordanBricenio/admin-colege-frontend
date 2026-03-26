import { Parent } from "./parent";
import { Student } from "./student";

export class Registration {
    idRegistration?: string;
    status: boolean;
    parent: Parent;
    student: Student;
    createdAt?: Date;
    updatedAt?: Date;
    idStudent?: string;
    idParent?: string;
}
