import {Control} from "@angular/common";

interface ValidationResult {
    [key: string]: boolean;
}

export class CustomValidators {

    public static checkFirstCharacterValidator(control: Control): ValidationResult {
        let valid = /^\d/.test(control.value);
        if (valid) {
            return {checkFirstCharacterValidator: true};
        }
        return null;
    }
}
