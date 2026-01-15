export function requireRole(role: string) {
  return (req: any, res: any, next: any) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
