# 🔮 CampusRide Engineering Roadmap & Future Specifications

This document outlines the detailed development roadmap, technical specifications, and architectural blueprints for future phases of CampusRide.

---

## 🗺️ Roadmap Overview

```
Phase 1: Automated Verification (Gemini Vision OCR & Edu Email Enforcement)
    │
    ▼
Phase 2: Intelligent Campus Dispatch & Dynamic Zone Matrix
    │
    ▼
Phase 3: Ride Pooling & Split-Fare Carpooling
    │
    ▼
Phase 4: Privacy-Preserving In-App Chat & VoIP Masking
    │
    ▼
Phase 5: Digital Campus Wallet & Instant Driver Payouts
    │
    ▼
Phase 6: Emergency SOS & Campus Security Dispatch Webhook
    │
    ▼
Phase 7: Progressive Web App (PWA) & Offline Trip Logging
```

---

## 📋 Phase 1: Automated Identity Verification & Student Shield

### Objective
Eliminate manual verification delays by automating student ID card scanning and university email domain validation.

### Architecture & Implementation:
1. **Gemini Vision OCR Pipeline**:
   - Students photograph their physical university identity card directly within the browser using WebRTC Camera API.
   - The image is processed server-side via `@google/genai` (Gemini 2.5 Flash with structured output schema).
   - Extracts:
     - Full Student Name
     - Matriculation / Student ID Number
     - Faculty / Department
     - Expiry / Academic Year
   - Cross-references parsed name with the Google Account profile name.
2. **University Email Enforcement**:
   - Enforce regex matching on `request.auth.token.email.matches('.*@.*\\.edu(\\.[a-z]{2})?$')`.
   - Automatically assign verified badge upon passing domain verification.

---

## 📋 Phase 2: Campus Zone Matrix & Dynamic Fare Engine

### Objective
Replace static mock fares with intelligent intra-campus distance calculation and localized zone pricing.

### Architecture & Implementation:
1. **Google Maps Distance Matrix API Integration**:
   - Calculate exact walking vs driving route distances and duration.
   - Account for pedestrian paths and restricted campus vehicle gates.
2. **Zone-Based Fare Tiers**:
   - **Tier 1 (Internal Campus)**: e.g., Hostel to Main Library (Flat ₦150 - ₦250).
   - **Tier 2 (Perimeter Transit)**: e.g., Campus Gate to Sports Complex (₦300 - ₦400).
   - **Tier 3 (Off-Campus Student Hubs)**: e.g., University to nearby student apartments (₦500 - ₦750).
3. **Rain / Night Factor (Moderate)**:
   - Modest adjustment during heavy rain or late night (after 10:00 PM) to incentivize student drivers without surge exploitation.

---

## 📋 Phase 3: Smart Campus Ride Pooling (Carpooling)

### Objective
Allow multiple students heading to the same faculty, exam hall, or campus gate to share a single vehicle and split the fare.

### Architecture & Implementation:
1. **Route Overlap Algorithm**:
   - Detects pending ride requests with pickup locations within a 300-meter corridor and compatible destinations.
2. **Passenger Capacity Tracking**:
   - Drivers configure available seat capacity (e.g., 3 seats).
   - Up to 3 independent riders can join the active trip.
3. **Automatic Split-Fare Billing**:
   - Each passenger pays a discounted rate (e.g., 60% of standard fare), while the driver earns 180% total.

---

## 📋 Phase 4: Masked In-App Chat & Push Notifications

### Objective
Enable seamless communication between riders and drivers without exchanging personal phone numbers or leaving the app.

### Architecture & Implementation:
1. **Firestore In-Trip Chat Subcollection**:
   - `/rides/{rideId}/messages/{messageId}`
   - Real-time chat with message delivery and read receipts.
   - Auto-deletion or archiving 24 hours post-trip completion.
2. **Firebase Cloud Messaging (FCM)**:
   - Web push notifications sent when:
     - A driver accepts a ride.
     - A driver arrives at the pickup spot ("Your driver has arrived!").
     - A ride request is dispatched to nearby drivers.

---

## 📋 Phase 5: Digital Campus Wallet & Payment Gateway

### Objective
Enable frictionless cashless payments through an in-app balance, student meal plan integration, or direct debit card.

### Architecture & Implementation:
1. **Campus Wallet Subsystem**:
   - `/users/{userId}/wallet`: Balance, pending credits, transaction ledger.
2. **Payment Gateway Integration**:
   - Support for regional student payment processors (Paystack, Flutterwave, Stripe).
   - 1-click checkout with stored cards or USSD transfer.
3. **Instant Driver Cash-Out**:
   - Driver daily earnings automatically transferrable to personal bank accounts.

---

## 📋 Phase 6: Emergency SOS & Campus Security Dispatch

### Objective
Provide maximum student safety during late-night campus transit.

### Architecture & Implementation:
1. **One-Tap SOS Button**:
   - Prominently positioned during active rides.
2. **Automated Security Webhook**:
   - Instantly transmits current live GPS coordinates, vehicle registration, driver details, and student information to campus security control room.
3. **Live Trip Sharing**:
   - Temporary public tracking URL shareable with roommates or family members.

---

## 📋 Phase 7: Progressive Web App (PWA) & Offline Mode

### Objective
Ensure rock-solid functionality in lecture halls and campus basements with spotty cellular reception.

### Architecture & Implementation:
1. **Service Worker & Web App Manifest**:
   - Full installability to home screen on iOS and Android.
2. **IndexedDB Local Caching**:
   - Cache historical rides and campus map tiles offline.
3. **Background Sync**:
   - Queue ride rating and receipt submission until internet connectivity is restored.
