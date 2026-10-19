# 🗄️ CampusRide API & Data Model Documentation

This document describes the schema specifications, database collections, security rules, and server API endpoints used across CampusRide.

---

## 1. Cloud Firestore Database Collections

CampusRide utilizes Google Cloud Firestore in native mode. The structure is designed for low latency, real-time snapshot capability, and granular document-level security.

### 1.1 Collection: `/users/{userId}`
Stores user profiles for all registered community members.

| Field Name | Type | Required | Description | Example |
|---|---|:---:|---|---|
| `uid` | `string` | Yes | Unique Firebase User ID | `"xK91jFqL29..."` |
| `name` | `string` | Yes | Student or staff full name | `"Alex Chen"` |
| `email` | `string` | Yes | University or personal email | `"alex.chen@campus.edu"` |
| `role` | `string` | Yes | One of `'rider'`, `'driver'`, `'admin'` | `'rider'` |
| `verified` | `boolean` | Yes | Whether ID/license has been approved | `true` |
| `rating` | `number` | No | Average community rating (1.0 - 5.0) | `4.9` |
| `studentIdUrl` | `string` | No | URL to uploaded student verification card | `"https://..."` |
| `createdAt` | `timestamp` | Yes | Account creation timestamp | `serverTimestamp()` |
| `updatedAt` | `timestamp` | No | Last profile modification timestamp | `serverTimestamp()` |

#### TypeScript Interface:
```typescript
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'rider' | 'driver' | 'admin';
  verified: boolean;
  rating?: number;
  studentIdUrl?: string;
  createdAt: any;
  updatedAt?: any;
}
```

---

### 1.2 Collection: `/drivers/{userId}`
Tracks active drivers who are available for campus dispatch.

| Field Name | Type | Required | Description | Example |
|---|---|:---:|---|---|
| `userId` | `string` | Yes | Matches driver's user UID | `"dRv38491x..."` |
| `vehicleInfo` | `string` | Yes | Vehicle description and plate number | `"Honda Civic - Black (UNILAG-42)"` |
| `isAvailable` | `boolean` | Yes | Shift status (true = Online, false = Offline) | `true` |
| `currentLocation`| `map` | Yes | Geo-coordinates of current position | `{ lat: 6.5244, lng: 3.3792 }` |
| `updatedAt` | `timestamp` | Yes | Last heartbeat or shift update | `serverTimestamp()` |

#### Composite Query Requirements:
To query available drivers for the rider map:
```typescript
const q = query(collection(db, 'drivers'), where('isAvailable', '==', true));
```
*Note: Single-field index on `isAvailable: ASC` is automatically maintained by Firestore.*

---

### 1.3 Collection: `/rides/{rideId}`
Stores all active, historical, and cancelled ride transactions.

| Field Name | Type | Required | Description | Example |
|---|---|:---:|---|---|
| `id` | `string` | Auto | Generated Firestore document ID | `"ride_78a1bc..."` |
| `riderId` | `string` | Yes | UID of the student requesting the ride | `"xK91jFqL29..."` |
| `riderName` | `string` | Yes | Display name of the requesting student | `"Alex Chen"` |
| `driverId` | `string` | No | UID of assigned driver (set upon accept) | `"dRv38491x..."` |
| `driverName` | `string` | No | Display name of driver | `"Sam Taylor"` |
| `pickupLocation` | `map` | Yes | Coordinate and address of pickup point | `{ address: "Hostel A", lat: 6.5244, lng: 3.3792 }` |
| `destination` | `map` | Yes | Coordinate and address of dropoff point | `{ address: "Auditorium", lat: 6.5300, lng: 3.3850 }` |
| `status` | `string` | Yes | `'pending'`, `'accepted'`, `'ongoing'`, `'completed'`, `'cancelled'` | `'pending'` |
| `fare` | `number` | Yes | Calculated trip cost | `250` |
| `paymentMethod` | `string` | Yes | `'cash'` or `'wallet'` | `'cash'` |
| `riderRating` | `number` | No | Rating given by rider to driver (1-5) | `5` |
| `driverRating` | `number` | No | Rating given by driver to rider (1-5) | `5` |
| `createdAt` | `timestamp` | Yes | Booking creation timestamp | `serverTimestamp()` |
| `updatedAt` | `timestamp` | Yes | Status change timestamp | `serverTimestamp()` |

#### Common Queries & Index Requirements:
1. **Pending Rides for Drivers**:
   ```typescript
   query(collection(db, 'rides'), where('status', '==', 'pending'));
   ```
2. **Active Ride for Rider**:
   ```typescript
   query(
     collection(db, 'rides'),
     where('riderId', '==', user.uid),
     where('status', 'in', ['pending', 'accepted', 'ongoing'])
   );
   ```
3. **Active Ride for Driver**:
   ```typescript
   query(
     collection(db, 'rides'),
     where('driverId', '==', user.uid),
     where('status', 'in', ['accepted', 'ongoing'])
   );
   ```

---

## 2. Server API Endpoints (`server.ts`)

CampusRide runs an Express.js backend for server-authoritative operations, proxy routes, and health monitoring.

### 2.1 Health Check Endpoint
- **URL**: `GET /api/health`
- **Description**: Returns server status and current UTC timestamp.
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-19T12:45:00.000Z"
}
```

### 2.2 Intelligent Driver Matching Endpoint (Preview)
- **URL**: `POST /api/rides/match`
- **Headers**: `Content-Type: application/json`
- **Payload**:
```json
{
  "riderId": "xK91jFqL29...",
  "pickup": {
    "address": "Hostel A",
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```
- **Response**:
```json
{
  "message": "Searching for drivers...",
  "suggestedDrivers": []
}
```

---

## 3. Security Rules Summary

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Users
    match /users/{userId} {
      allow get: if isSignedIn();
      allow list: if isAdmin();
      allow create: if isSignedIn();
      allow update: if isAdmin() || isOwner(userId);
      allow delete: if isAdmin();
    }

    // Drivers
    match /drivers/{userId} {
      allow read: if true;
      allow write: if isAdmin() || isOwner(userId);
    }

    // Rides
    match /rides/{rideId} {
      allow create: if isSignedIn();
      allow get: if true;
      allow list: if true;
      allow update: if isSignedIn();
      allow delete: if isAdmin();
    }
  }
}
```
