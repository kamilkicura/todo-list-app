export interface EditDialogData<T> {
    item: T;
    title: string;
    controls: (keyof T)[];
  }