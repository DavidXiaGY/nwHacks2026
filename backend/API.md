# API Documentation

Base URL: `http://localhost:3000`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Health Check

### GET /health
Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user (donator or organizer).

**Request Body:**
```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "password": "password123",
  "role": "DONATOR"  // or "ORGANIZER"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "DONATOR"
  }
}
```

---

### POST /api/auth/login
Login and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "DONATOR"
  }
}
```

---

### GET /api/auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "DONATOR",
  "orphanage": null  // or orphanage object if user is organizer
}
```

---

## Orphanage Endpoints

### GET /api/orphanages
Get all orphanages. Optionally sorted by distance from user location.

**Query Parameters:**
- `lat` (optional, float): User latitude for distance sorting
- `lng` (optional, float): User longitude for distance sorting

**Example:** `GET /api/orphanages?lat=49.2827&lng=-123.1207`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Hope Orphanage",
    "description": "A caring home for children",
    "website": "https://hope-orphanage.org",
    "contactEmail": "contact@hope-orphanage.org",
    "latitude": 49.2827,
    "longitude": -123.1207,
    "distance": 2.5,  // km (only if lat/lng provided)
    "verified": false,
    "organizer": {
      "id": "uuid",
      "displayName": "Jane Organizer",
      "email": "organizer@example.com"
    },
    "children": [...]
  }
]
```

---

### GET /api/orphanages/:id
Get a single orphanage with all children and wishlist items.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Hope Orphanage",
  "description": "A caring home for children",
  "website": "https://hope-orphanage.org",
  "contactEmail": "contact@hope-orphanage.org",
  "latitude": 49.2827,
  "longitude": -123.1207,
  "verified": false,
  "organizer": {
    "id": "uuid",
    "displayName": "Jane Organizer",
    "email": "organizer@example.com"
  },
  "children": [
    {
      "id": "uuid",
      "firstName": "Emma",
      "age": 8,
      "wishlist": [...]
    }
  ]
}
```

---

### POST /api/orphanages
Create a new orphanage (Organizer only).

**Headers:** `Authorization: Bearer <organizer-token>`

**Request Body:**
```json
{
  "name": "Hope Orphanage",
  "description": "A caring home for children",
  "website": "https://hope-orphanage.org",
  "contactEmail": "contact@hope-orphanage.org",
  "latitude": 49.2827,
  "longitude": -123.1207
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Hope Orphanage",
  "description": "A caring home for children",
  "website": "https://hope-orphanage.org",
  "contactEmail": "contact@hope-orphanage.org",
  "latitude": 49.2827,
  "longitude": -123.1207,
  "verified": false,
  "organizer": {...}
}
```

---

## Children Endpoints

### GET /api/children/orphanage/:orphanageId
Get all children for a specific orphanage.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "firstName": "Emma",
    "age": 8,
    "gender": "female",
    "clothingShirtSize": "Youth Medium",
    "clothingPantSize": "Youth 8",
    "clothingShoeSize": "Youth 2 (US)",
    "clothingToyPreference": "Feminine",
    "interests": "Loves art, drawing, and music",
    "notes": "Very creative and enjoys group activities",
    "orphanageId": "uuid",
    "createdAt": "2026-01-17T15:00:00.000Z",
    "updatedAt": "2026-01-17T15:00:00.000Z",
    "wishlist": [
      {
        "id": "uuid",
        "name": "LEGO Set",
        "description": "Buildable toy",
        "externalLink": "https://www.amazon.com/lego-set",
        "price": 29.99,
        "status": "AVAILABLE",
        "heldBy": null
      }
    ]
  }
]
```

---

### GET /api/children/:childId
Get a single child by ID with full details.

**Response (200):**
```json
{
  "id": "uuid",
  "firstName": "Emma",
  "age": 8,
  "gender": "female",
  "clothingShirtSize": "Youth Medium",
  "clothingPantSize": "Youth 8",
  "clothingShoeSize": "Youth 2 (US)",
  "clothingToyPreference": "Feminine",
  "interests": "Loves art, drawing, and music",
  "notes": "Very creative and enjoys group activities",
  "orphanageId": "uuid",
  "createdAt": "2026-01-17T15:00:00.000Z",
  "updatedAt": "2026-01-17T15:00:00.000Z",
  "orphanage": {
    "id": "uuid",
    "name": "Hope Orphanage",
    "organizerId": "uuid"
  },
  "wishlist": [
    {
      "id": "uuid",
      "name": "LEGO Set",
      "description": "Buildable toy",
      "externalLink": "https://www.amazon.com/lego-set",
      "price": 29.99,
      "status": "AVAILABLE",
      "heldBy": null
    }
  ]
}
```

---

### POST /api/children
Create a child with wishlist items (Organizer only).

**Headers:** `Authorization: Bearer <organizer-token>`

**Request Body:**
```json
{
  "firstName": "Emma",
  "age": 8,
  "gender": "female",
  "orphanageId": "uuid",
  "clothingShirtSize": "Youth Medium",
  "clothingPantSize": "Youth 8",
  "clothingShoeSize": "Youth 2 (US)",
  "clothingToyPreference": "Feminine",
  "interests": "Loves art, drawing, and music",
  "notes": "Very creative and enjoys group activities",
  "wishlistItems": [
    {
      "name": "LEGO Set",
      "description": "Buildable toy",
      "externalLink": "https://www.amazon.com/lego-set",
      "price": 29.99
    },
    {
      "name": "Art Supplies",
      "description": "Colored pencils and sketchbook",
      "externalLink": "https://www.walmart.com/art-supplies",
      "price": 15.50
    }
  ]
}
```

**Note:** All fields except `firstName` and `orphanageId` are optional. Clothing sizes, preferences, interests, and notes can be added or updated later.

**Response (201):**
```json
{
  "id": "uuid",
  "firstName": "Emma",
  "age": 8,
  "gender": "female",
  "clothingShirtSize": "Youth Medium",
  "clothingPantSize": "Youth 8",
  "clothingShoeSize": "Youth 2 (US)",
  "clothingToyPreference": "Feminine",
  "interests": "Loves art, drawing, and music",
  "notes": "Very creative and enjoys group activities",
  "orphanageId": "uuid",
  "createdAt": "2026-01-17T15:00:00.000Z",
  "updatedAt": "2026-01-17T15:00:00.000Z",
  "wishlist": [
    {
      "id": "uuid",
      "name": "LEGO Set",
      "status": "AVAILABLE",
      ...
    }
  ],
  "orphanage": {
    "id": "uuid",
    "name": "Hope Orphanage"
  }
}
```

---

### PUT /api/children/:childId
Update a child's information (Organizer only - can only update children in their own orphanage).

**Headers:** `Authorization: Bearer <organizer-token>`

**Request Body (all fields optional):**
```json
{
  "firstName": "Emma",
  "age": 9,
  "gender": "female",
  "clothingShirtSize": "Youth Large",
  "clothingPantSize": "Youth 10",
  "clothingShoeSize": "Youth 3 (US)",
  "clothingToyPreference": "Feminine",
  "interests": "Loves art, drawing, music, and reading",
  "notes": "Very creative and enjoys group activities. Recently started reading chapter books."
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "firstName": "Emma",
  "age": 9,
  "gender": "female",
  "clothingShirtSize": "Youth Large",
  "clothingPantSize": "Youth 10",
  "clothingShoeSize": "Youth 3 (US)",
  "clothingToyPreference": "Feminine",
  "interests": "Loves art, drawing, music, and reading",
  "notes": "Very creative and enjoys group activities. Recently started reading chapter books.",
  "orphanageId": "uuid",
  "createdAt": "2026-01-17T15:00:00.000Z",
  "updatedAt": "2026-01-18T10:30:00.000Z",
  "wishlist": [...],
  "orphanage": {
    "id": "uuid",
    "name": "Hope Orphanage"
  }
}
```

**Note:** Only fields included in the request body will be updated. Omitted fields remain unchanged. To clear a field, set it to `null`.

---

### DELETE /api/children/:childId
Delete a child (Organizer only - can only delete children from their own orphanage).

**Headers:** `Authorization: Bearer <organizer-token>`

**Response (204):** No content

**Note:** This will also cascade delete all wishlist items associated with the child.

---

## Wishlist Endpoints

### GET /api/wishlist/items
Get wishlist items with optional filtering.

**Query Parameters:**
- `orphanageId` (optional, string): Filter by orphanage
- `status` (optional, enum): Filter by status (`AVAILABLE`, `HELD`, `VERIFYING`, `PURCHASED`)
- `childId` (optional, string): Filter by child

**Example:** `GET /api/wishlist/items?status=AVAILABLE&orphanageId=uuid`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "LEGO Set",
    "description": "Buildable toy",
    "externalLink": "https://www.amazon.com/lego-set",
    "price": 29.99,
    "status": "AVAILABLE",
    "heldByUserId": null,
    "holdExpiresAt": null,
    "child": {
      "id": "uuid",
      "firstName": "Emma",
      "age": 8,
      "orphanage": {
        "id": "uuid",
        "name": "Hope Orphanage"
      }
    },
    "heldBy": null
  }
]
```

---

### GET /api/wishlist/items/held-by-me
Get all items currently held by the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "LEGO Set",
    "status": "HELD",
    "holdExpiresAt": "2026-01-18T15:30:00.000Z",
    "child": {
      "firstName": "Emma",
      "orphanage": {
        "name": "Hope Orphanage"
      }
    },
    ...
  }
]
```

---

### POST /api/wishlist/:itemId/hold
Hold an item for 24 hours (Donator only).

**Headers:** `Authorization: Bearer <donator-token>`

**Response (200):**
```json
{
  "message": "Item held successfully for 24 hours",
  "item": {
    "id": "uuid",
    "status": "HELD",
    "holdExpiresAt": "2026-01-18T15:30:00.000Z",
    "child": {...},
    "heldBy": {
      "id": "uuid",
      "displayName": "John Donor"
    }
  },
  "holdExpiresAt": "2026-01-18T15:30:00.000Z"
}
```

**Note:** If the item is already held by you, this will extend the hold for another 24 hours.

---

### POST /api/wishlist/:itemId/release
Release a held item (Donator only - can only release own holds).

**Headers:** `Authorization: Bearer <donator-token>`

**Response (200):**
```json
{
  "message": "Item released successfully",
  "item": {
    "id": "uuid",
    "status": "AVAILABLE",
    ...
  }
}
```

---

### DELETE /api/wishlist/:itemId/hold
Cancel/delete a hold. Can be used by the holder, organizer, or admin. Expired holds can also be cancelled by anyone.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Hold cancelled successfully"
}
```

---

## Donation Endpoints

### POST /api/donations
Submit a donation with proof (Donator only).

**Headers:** `Authorization: Bearer <donator-token>`

**Request Body:**
```json
{
  "itemId": "uuid",
  "orderId": "AMZ123456789",
  "proofUrl": "https://example.com/receipt.jpg",
  "notes": "Purchased from Amazon, will ship directly"
}
```

**Response (201):**
```json
{
  "message": "Donation submitted successfully",
  "donation": {
    "id": "uuid",
    "orderId": "AMZ123456789",
    "proofUrl": "https://example.com/receipt.jpg",
    "notes": "Purchased from Amazon",
    "donor": {
      "id": "uuid",
      "displayName": "John Donor",
      "email": "donor@example.com"
    },
    "item": {
      "id": "uuid",
      "status": "VERIFYING",
      "child": {
        "firstName": "Emma",
        "orphanage": {
          "name": "Hope Orphanage"
        }
      }
    }
  }
}
```

**Note:** This changes the item status from `HELD` to `VERIFYING`. The organizer must verify it to move it to `PURCHASED`.

---

### GET /api/donations/me
Get all donations made by the current user (Donator only).

**Headers:** `Authorization: Bearer <donator-token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "orderId": "AMZ123456789",
    "proofUrl": "https://example.com/receipt.jpg",
    "notes": "Purchased from Amazon",
    "createdAt": "2026-01-17T15:00:00.000Z",
    "item": {
      "id": "uuid",
      "name": "LEGO Set",
      "status": "VERIFYING",
      "child": {
        "firstName": "Emma",
        "orphanage": {
          "name": "Hope Orphanage"
        }
      }
    }
  }
]
```

---

### GET /api/donations/orphanage/:orphanageId
Get all donations for a specific orphanage (Organizer only).

**Headers:** `Authorization: Bearer <organizer-token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "orderId": "AMZ123456789",
    "proofUrl": "https://example.com/receipt.jpg",
    "notes": "Purchased from Amazon",
    "donor": {
      "id": "uuid",
      "displayName": "John Donor",
      "email": "donor@example.com"
    },
    "item": {
      "id": "uuid",
      "name": "LEGO Set",
      "price": 29.99,
      "externalLink": "https://www.amazon.com/lego-set"
    },
    "child": {
      "id": "uuid",
      "firstName": "Emma",
      "age": 8
    }
  }
]
```

---

### POST /api/donations/:donationId/verify
Verify/confirm a donation, changing status from `VERIFYING` to `PURCHASED` (Organizer only).

**Headers:** `Authorization: Bearer <organizer-token>`

**Response (200):**
```json
{
  "message": "Donation verified successfully. Item status changed to PURCHASED.",
  "item": {
    "id": "uuid",
    "status": "PURCHASED",
    "child": {
      "firstName": "Emma",
      "orphanage": {
        "name": "Hope Orphanage"
      }
    },
    "donation": {
      "donor": {
        "displayName": "John Donor"
      }
    }
  }
}
```

---

## Item Status Flow

1. **AVAILABLE** → Item is available for holding
2. **HELD** → Item is held by a donor (24-hour expiry)
3. **VERIFYING** → Donation submitted, awaiting organizer verification
4. **PURCHASED** → Organizer verified the donation

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email, item already held, etc.)
- `500` - Internal Server Error

---

## Role-Based Access

### DONATOR Role
- Can hold wishlist items
- Can submit donations
- Can view their own donations
- Can view orphanages and wishlist items

### ORGANIZER Role
- Can create orphanages
- Can add children with wishlist items
- Can update children information (name, age, gender, clothing sizes, preferences, interests, notes)
- Can delete children from their own orphanage
- Can view donations for their orphanage
- Can verify donations (change status from VERIFYING to PURCHASED)
- Can view their own orphanage

---

## Notes

- JWT tokens expire after 7 days
- Item holds expire after 24 hours (automatically checked and expired on access)
- Location-based sorting uses Haversine formula (distance in kilometers)
- All timestamps are in ISO 8601 format (UTC)
