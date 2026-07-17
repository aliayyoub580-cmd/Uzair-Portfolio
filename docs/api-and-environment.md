  # API and environment setup

  ## Server

  The Express server entry point is `server/index.js`. Start it with:

  ```bash
  npm run server
  ```

  ## Endpoints

  ### Health check

  ```http
  GET /health
  ```

  Successful response:

  ```json
  { "status": "ok" }
  ```

  ### Send a contact message

  ```http
  POST /api/contact
  Content-Type: application/json
  ```

  Request body:

  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "I would like to discuss a project."
  }
  ```

  Successful response:

  ```json
  { "success": true }
  ```

  Validation response:

  ```json
  { "error": "All fields are required." }
  ```

  ## Environment variables

  Use the following variables in the root `.env` file:

  ```dotenv
  PORT=5000
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=your-smtp-username
  SMTP_PASS=your-smtp-password
  EMAIL_FROM=Portfolio Contact <contact@example.com>
  EMAIL_TO=your-inbox@example.com
  ```

  | Variable | Required | Description |
  | --- | --- | --- |
  | `PORT` | No | Express port. Defaults to `5000`. |
  | `SMTP_HOST` | Yes | SMTP server hostname. |
  | `SMTP_PORT` | Yes | SMTP port, usually `587`. |
  | `SMTP_USER` | Yes | SMTP account username. |
  | `SMTP_PASS` | Yes | SMTP account password or application password. |
  | `EMAIL_FROM` | Yes | Sender address shown in sent emails. |
  | `EMAIL_TO` | Yes | Inbox that receives contact messages. |

  ## Security notes

  - Never commit real SMTP credentials. Keep `.env` private.
  - Use an application password when your email provider supports it.
  - Configure an explicit CORS origin before deploying instead of allowing every origin.
  - Add rate limiting and bot protection to the contact endpoint in production.
  - Validate and sanitize all new admin API input server-side.
