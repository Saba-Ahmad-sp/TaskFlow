import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Express 5: req.query is a read-only getter, so we store parsed
// values on a custom property instead of overwriting req.query
declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: result.error.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    // Store parsed data on req.validated (Express 5 req.query is read-only)
    const data = result.data as any;
    req.validated = {
      body: data.body,
      query: data.query,
      params: data.params,
    };

    // We can still set req.body (it's not read-only)
    if (data.body) req.body = data.body;
    next();
  };
}
