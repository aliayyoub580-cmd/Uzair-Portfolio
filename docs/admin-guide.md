# Admin workspace guide

Open the admin workspace at `/admin` while the frontend is running.

## Dashboard

The Dashboard is the landing view. It provides high-level content metrics, visitor trend visualisation, and shortcuts for Home, About, Messages, and sharing the portfolio.

## Content management

The following navigation areas provide content management:

- **Home**: manage home-page content records.
- **About**: manage biography and profile-related records.
- **Services**: add, edit, and remove services.
- **Skills**: add, edit, and remove skills.
- **Projects**: add, edit, and remove project records.

Each editor has two panels:

1. **Active content** lists existing items.
2. **Content editor** lets you create a new item or update a selected one.

Use the pencil icon to edit an item and the trash icon to remove it. Saving requires both the title and details fields.

## Messages

The Messages area offers an inbox-style view:

- Search by sender or subject.
- Select a message to read it.
- Opening an unread message marks it as read.
- Use Reply to open the reply action feedback.
- Use Delete to remove a message from the current inbox state.

The inbox currently uses demonstration data in the browser. Real messages continue to be delivered by the contact-email API; database storage is the next integration needed for them to automatically appear here.

## Content persistence

Content edits are saved immediately in `localStorage`. They survive refreshes, but only in the browser where they were made. Clearing browser site data resets these edits to the initial values.

### Reset local content manually

Open the browser developer console and run:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith('portfolio-admin-'))
  .forEach((key) => localStorage.removeItem(key));
```

Refresh `/admin` afterwards.

## Production checklist

Before giving admin access to a real user, implement:

- Admin authentication and protected routes.
- Server-side content storage.
- Form validation on both client and server.
- Image upload and media hosting.
- Confirmation dialogs for destructive actions.
- Auditing and backups for published content.
