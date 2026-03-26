import { Student } from "./student";
import { User } from "./user";

export class Parent {
    idParent: string;
    relationship: string;
    occupation: string;
    user: User;
    student: Student;
}
