export declare const validatePRNFormat: (prn: string) => boolean;
export declare const isPRNExists: (prn: string) => Promise<boolean>;
export declare const validatePRN: (prn: string) => Promise<{
    valid: boolean;
    message?: string;
}>;
//# sourceMappingURL=prnValidation.d.ts.map