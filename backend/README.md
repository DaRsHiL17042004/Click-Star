# Click-Star API

Express 5 + MongoDB (Mongoose) REST API for the Click-Star photographer marketplace.

## Setup

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and a long random JWT_SECRET
npm install
npm run dev            # nodemon on http://localhost:5000
npm run create-admin -- "Your Name" you@example.com "a-strong-password"
```

Uploads go to Cloudinary when `CLOUDINARY_*` is set; otherwise they're saved to `./uploads` and served from `/uploads`.

## Access rules

| Route | Access |
| --- | --- |
| `POST /api/auth/register` | Public — `client` or `photographer` only (admins via `create-admin`) |
| `GET /api/photographer/search`, `GET /api/photographer/profile/:id`, `GET /api/reviews/:id[/rating]` | Public |
| `GET/POST /api/photographer/profile`, `POST /api/photographer/upload` | Photographer |
| `/api/client/:userId/**` | That client, or admin |
| `POST /api/bookings`, `POST /api/reviews` | Client (client ID taken from the token) |
| `GET /api/bookings/{photographer,client}/:id` | That user, or admin |
| `PATCH /api/bookings/:id/status` | Photographer: confirm / complete / cancel · Client: cancel · Admin |
| `/api/admin/**` (leads, users) | Admin |

Booking status flow: `pending → confirmed → completed`, with `cancelled` allowed from `pending` or `confirmed`. Reviews tied to a booking require it to be completed, one review per booking.
