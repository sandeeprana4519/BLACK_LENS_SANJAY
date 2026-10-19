# Security Specification: Black Lens / Tez Nazar Hindi News Portal

## 1. Data Invariants
1. **Public Read-Only Content**: Published articles, categories, active tags, active breaking news, active advertisements, and site settings are readable by the public.
2. **Draft & Review Isolation**: Articles in status `draft`, `pending_review`, `rejected`, or `scheduled` must only be readable and modifiable by authenticated staff/admins or the original author.
3. **Identity Verification & Anti-Spoofing**: When creating an article or message, `author_id` or user identity cannot be spoofed to impersonate another staff member without administrative rights.
4. **Bootstrapped Admin**: The administrator email `sandeeprana4139@gmail.com` and users registered in `/admins/{adminId}` hold verified administrative privileges.
5. **Contact Messages**: Anyone can create a contact message with bounded fields (name, email, message <= 5000 chars), but only administrators can read or delete contact messages.
6. **Immutable Historical Fields**: `createdAt` and `id` cannot be altered upon document update.
7. **String & Array Bounding**: Every string has explicit length limits (`<= 50000` chars for article bodies, `<= 500` for titles, etc.) to prevent Denial of Wallet resource attacks.

## 2. The Dirty Dozen Payloads (Adversarial Test Suite)
1. **Payload 1 (Ghost Field / Shadow Update)**: Update article with unauthorized `{ is_verified_super: true, status: 'published' }` by unauthorized user -> DENIED.
2. **Payload 2 (Unverified Email Admin Spoof)**: Write to `/admins/attacker` with `email_verified: false` pretending to be `sandeeprana4139@gmail.com` -> DENIED.
3. **Payload 3 (PII Blanket Exfiltration)**: Unauthenticated visitor querying `/contact_messages` collection -> DENIED.
4. **Payload 4 (Resource Bombing)**: Writing a 2MB string into `title` field -> DENIED (exceeds 500 chars limit).
5. **Payload 5 (Author ID Impersonation)**: Regular reporter writing `author_id: 999` (impersonating Chief Editor) -> DENIED.
6. **Payload 6 (Terminal Status Bypass)**: Reporter attempting to unilaterally approve their own rejected or draft article -> DENIED.
7. **Payload 7 (Settings Defacement)**: Unauthenticated visitor attempting to update `/settings/general` with malicious phishing links -> DENIED.
8. **Payload 8 (Ad Injection)**: Malicious actor inserting unauthorized ads into `/advertisements` -> DENIED.
9. **Payload 9 (User Role Escalation)**: Staff member changing their own `role_id: 1` -> DENIED.
10. **Payload 10 (Delete News Story)**: Unauthenticated or non-admin actor issuing `DELETE` on `/articles/1` -> DENIED.
11. **Payload 11 (Empty Contact Message)**: Malicious payload `{}` sent to `/contact_messages` -> DENIED (requires name, email, message).
12. **Payload 12 (Breaking News Hijack)**: Regular user posting fake alert to `/breaking_news` -> DENIED.
