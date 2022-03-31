export class User {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    token: string;
}


export class ActivityDetails {
    content: string;
    student: string;
    time: string;
    skill: string;
    type: string;
    className: string;
    date: any;
    result: any;
    classId: number;
}


export class ClassDetail {
    id: number;
    name: string;
    students: string[];
}


export class Graphdata {
    excellent: number;
    good: number;
    ok: number;
    weak: number;
}


