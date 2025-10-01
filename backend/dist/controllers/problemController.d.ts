import { Request, Response } from 'express';
export declare const getProblems: (req: Request, res: Response) => Promise<any>;
export declare const getProblemById: (req: Request, res: Response) => Promise<any>;
export declare const createProblem: (req: Request, res: Response) => Promise<any>;
export declare const updateProblem: (req: Request, res: Response) => Promise<any>;
export declare const deleteProblem: (req: Request, res: Response) => Promise<any>;
export declare const validateCreateProblem: import("express-validator").ValidationChain[];
export declare const validateUpdateProblem: import("express-validator").ValidationChain[];
//# sourceMappingURL=problemController.d.ts.map