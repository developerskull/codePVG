"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePRN = exports.isPRNExists = exports.validatePRNFormat = void 0;
const database_1 = __importDefault(require("./database"));
const validatePRNFormat = (prn) => {
    const cleanPRN = prn.trim().toUpperCase();
    if (cleanPRN.length < 6 || cleanPRN.length > 20) {
        return false;
    }
    const prnRegex = /^[A-Z0-9]+$/;
    return prnRegex.test(cleanPRN);
};
exports.validatePRNFormat = validatePRNFormat;
const isPRNExists = async (prn) => {
    const cleanPRN = prn.trim().toUpperCase();
    const result = await database_1.default.query('SELECT id FROM users WHERE UPPER(prn) = $1', [cleanPRN]);
    return result.rows.length > 0;
};
exports.isPRNExists = isPRNExists;
const validatePRN = async (prn) => {
    if (!prn || prn.trim() === '') {
        return { valid: false, message: 'PRN is required' };
    }
    if (!(0, exports.validatePRNFormat)(prn)) {
        return { valid: false, message: 'Invalid PRN format. PRN should be 6-20 alphanumeric characters.' };
    }
    const exists = await (0, exports.isPRNExists)(prn);
    if (exists) {
        return { valid: false, message: 'This PRN is already registered' };
    }
    return { valid: true };
};
exports.validatePRN = validatePRN;
//# sourceMappingURL=prnValidation.js.map