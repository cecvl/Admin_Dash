# Backend Admin Endpoints Documentation

## Overview
The art-print-backend provides 4 admin endpoints for managing artworks. All endpoints require:
- Authentication (session cookie)
- `admin` role in user profile

**Base URL**: `http://localhost:3001`

---

## Endpoints

### 1. Get Artworks (List)
**GET** `/admin/artworks`

Retrieve a filtered list of artworks for admin review.

**Query Parameters:**
- `status` (optional): Filter by processing status
  - Values: `pending`, `processing`, `ready`, `failed`
- `artistId` (optional): Filter by specific artist ID
- `from` (optional): Start date filter (RFC3339 format)
- `to` (optional): End date filter (RFC3339 format)
- `limit` (optional): Number of results (default: 100, max: 500)

**Response:**
```json
[
  {
    "id": "artwork123",
    "artistId": "artist456",
    "title": "Sunset Landscape",
    "imageUrl": "https://...",
    "processingStatus": "pending",
    "createdAt": "2025-11-30T10:00:00Z",
    ...
  }
]
```

**Example:**
```typescript
// Get all pending artworks
const artworks = await getArtworks({ status: 'pending', limit: 50 });
```

---

### 2. Get Single Artwork
**GET** `/admin/artworks/get?id={artworkId}`

Retrieve detailed information about a specific artwork.

**Query Parameters:**
- `id` (required): Artwork ID

**Response:**
```json
{
  "id": "artwork123",
  "artistId": "artist456",
  "title": "Sunset Landscape",
  "description": "Beautiful sunset over mountains",
  "imageUrl": "https://...",
  "processingStatus": "pending",
  "createdAt": "2025-11-30T10:00:00Z",
  "admin": {
    "resolvedBy": "admin789",
    "resolvedAt": "2025-11-30T11:00:00Z",
    "resolutionNote": "Approved for printing"
  }
}
```

**Example:**
```typescript
const artwork = await getArtwork('artwork123');
```

---

### 3. Resolve Artwork
**POST** `/admin/artworks/resolve`

Approve, reject, or reprocess an artwork.

**Request Body:**
```json
{
  "id": "artwork123",
  "action": "approve",  // "approve" | "reject" | "reprocess"
  "note": "Looks good for printing"  // optional
}
```

**Actions:**
- `approve`: Sets status to `ready`, artwork becomes available for orders
- `reject`: Sets status to `failed`, adds rejection to processing errors
- `reprocess`: Resets status to `pending`, enqueues for reprocessing

**Response:** 204 No Content

**Example:**
```typescript
await resolveArtwork({
  id: 'artwork123',
  action: 'approve',
  note: 'High quality image, approved'
});
```

---

### 4. Assign Artwork to Print Shop
**POST** `/admin/artworks/assign`

Manually assign an artwork to a specific print shop.

**Request Body:**
```json
{
  "id": "artwork123",
  "printShopId": "shop456"
}
```

**Response:** 204 No Content

**What it does:**
- Updates artwork with `assignedTo` field
- Creates assignment record in `assignments` collection
- Print shop can now see this artwork in their queue

**Example:**
```typescript
await assignArtwork({
  id: 'artwork123',
  printShopId: 'shop456'
});
```

---

## Authentication

All admin endpoints use session-based authentication:

1. User must be logged in (session cookie)
2. User profile must have `admin` role
3. Middleware chain: `AuthMiddleware` → `AdminOnly` → Handler

**Error Responses:**
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Logged in but not an admin
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

---

## Future Endpoints (Not Yet Implemented)

Based on the backend SUMMARY.md, these admin features are planned but not yet implemented:

### User Management
- View all users (buyers, artists, shops)
- Filter by role and status
- Update user status

### Order Management
- View all orders
- Filter by status, shop, buyer
- Update order status

### Print Shop Oversight
- View all print shops
- Approve/reject shop registrations
- Monitor shop activity

### Payment Management
- View all payments
- Payment statistics
- Process refunds

### Review Management
- View all reviews
- Approve/reject reviews
- Moderate content

---

## Usage in Admin Dashboard

The admin service (`src/services/admin.ts`) provides typed functions for all endpoints:

```typescript
import adminService from '@/services/admin';

// List pending artworks
const pending = await adminService.getArtworks({ status: 'pending' });

// Get artwork details
const artwork = await adminService.getArtwork('artwork123');

// Approve artwork
await adminService.resolveArtwork({
  id: 'artwork123',
  action: 'approve',
  note: 'Approved'
});

// Assign to shop
await adminService.assignArtwork({
  id: 'artwork123',
  printShopId: 'shop456'
});
```

---

## Next Steps

1. **Implement Artwork Management UI**
   - Create artwork list page with filters
   - Add artwork detail view
   - Implement approve/reject/reprocess actions
   - Add shop assignment interface

2. **Add Error Handling**
   - Display user-friendly error messages
   - Handle network errors
   - Show loading states

3. **Implement Additional Admin Features**
   - User management
   - Order oversight
   - Payment tracking
   - Analytics dashboard
