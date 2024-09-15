import { FormControl } from "@angular/forms";

export interface FormFilter {
    searchFilter: FormControl<string | null>;
    statusFilter: FormControl<FilterValue | null>;
}

export type FilterValue = 'all' | 'active' | 'completed';