export interface Todo {
    id?: string;
    title: string;
    text: string;
    deadlineDate: Date;
    isActive: boolean;
    listId: string;
}
