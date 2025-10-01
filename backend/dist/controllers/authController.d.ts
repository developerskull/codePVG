import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: Request, res: Response) => Promise<any>;
export declare const updateProfile: (req: Request, res: Response) => Promise<any>;
export declare const updateUser: (req: Request, res: Response) => Promise<any>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<any>;
export declare const deleteUser: (req: Request, res: Response) => Promise<any>;
export declare const linkedinCallback: (req: Request, res: Response) => Promise<any>;
export declare const getPendingApprovals: (req: Request, res: Response) => Promise<any>;
export declare const updateApprovalStatus: (req: Request, res: Response) => Promise<any>;
export declare const getColleges: (req: Request, res: Response) => Promise<any>;
export declare const validateRegister: import("express-validator").ValidationChain[];
export declare const validateLogin: import("express-validator").ValidationChain[];
export declare const validateUpdateProfile: import("express-validator").ValidationChain[];
export declare const validateUpdateUser: import("express-validator").ValidationChain[];
//# sourceMappingURL=authController.d.ts.map