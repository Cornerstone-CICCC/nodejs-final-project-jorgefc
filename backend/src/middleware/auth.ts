import { Request, Response, NextFunction } from 'express'

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const { isAuthenticated } = req.session
  if (isAuthenticated) {
    next()
  } else {
    res.status(403).json({ message: "Unauthorized" })
  }
}