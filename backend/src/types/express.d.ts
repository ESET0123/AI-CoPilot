import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRoles?: string[];
      userGroups?: string[];
    }
  }
}

export { };