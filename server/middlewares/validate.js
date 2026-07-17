/**
 * Runs express-validator result check.
 * Returns 422 with all validation errors if any fail.
 */
import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}
