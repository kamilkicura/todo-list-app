export interface AddDialogData<T> {
    title: string;
    controls: (keyof T)[];
  }