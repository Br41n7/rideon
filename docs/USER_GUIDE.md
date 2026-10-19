# 📖 CampusRide User & Administrator Guide

This guide walks through step-by-step instructions for all three user personas on the CampusRide platform: **Riders**, **Drivers**, and **Administrators**.

---

## 1. Getting Started & Sign-In

### 1.1 Navigating to CampusRide
- Open your browser to the application URL.
- Explore the **Landing Page** to review platform capabilities, campus safety protocols, and student testimonials.
- Click **Start Moving** or **Sign In** in the top navigation bar.

### 1.2 Sign-Up Role Selection
When signing up, you can pick your primary role using the interactive role selector:
- **Join as Rider**: Selected by default for students needing rides between hostels, lecture halls, and the main gate.
- **Join as Driver**: Selected for students with approved vehicles wishing to offer rides during free periods.

### 1.3 Authentication Options
1. **Google Sign-In**: Click **Sign in with Google** to authenticate with your university email address or personal Google account.
2. **Demo Quick-Logins (One-Click Testing)**:
   For development and previewing without configuring Google OAuth:
   - **Student Rider**: Signs in as *Alex (Student Rider)*.
   - **Student Driver**: Signs in as *Sam (Student Driver)*.
   - **Campus Admin**: Signs in as *Platform Admin* with full administrative privileges.

---

## 2. Rider Guide (`/app/rider`)

### 2.1 Requesting a Ride
1. Open the sidebar or bottom tab and select **Find Ride** (or click **Book a Ride** from the Dashboard).
2. The interactive campus map will load. Available drivers on campus will appear as orange markers.
3. Choose your **Pickup Location**:
   - Use the **Hostel A** preset button, or click directly on the campus map.
4. Choose your **Destination**:
   - Use the **Main Auditorium** preset button, or click on your desired destination.
5. Review the upfront fare estimate (default base fare: ₦250).
6. Click **Confirm Ride Request**.

### 2.2 While Waiting for a Driver
- Your status switches to **Requesting**.
- Nearby student drivers on campus receive an immediate notification of your pending request.
- You can click **Cancel Request** at any time before a driver picks you up.

### 2.3 On the Trip
- When a driver accepts, their name, car details, and live location update on your map.
- Once the driver arrives and starts the trip, your status changes to **In Transit**.
- When you arrive at your destination, the driver marks the ride as complete.

### 2.4 Reviewing History
- Visit **Dashboard** (`/app`) to view your recent ride receipts, total distance traveled, and wallet balance.

---

## 3. Driver Guide (`/app/driver`)

### 3.1 Going On-Duty (Online Shift)
1. Navigate to the **Driver Mode** tab from the sidebar or bottom navigation.
2. In the top statistics header, locate the **Shift Status** switch.
3. Toggle the switch to **Online**:
   - Your location is added to the active `drivers` pool in Firestore.
   - Student riders on campus can now see you as an available driver.

### 3.2 Reviewing & Accepting Ride Requests
1. When a rider requests a trip, a card will appear in your **Pending Requests** dispatch queue.
2. The card displays:
   - Passenger Name
   - Pickup Address / Dormitory
   - Destination Address
   - Estimated Fare
3. Click **Accept Ride**:
   - The ride is officially assigned to your account.
   - The rider is notified immediately.

### 3.3 Executing the Trip
1. Drive to the rider's pickup point.
2. Once the rider is in your vehicle, click **Start Trip**:
   - The trip status updates to `ongoing`.
3. Safely navigate to the student's campus destination.
4. Upon arrival, click **Complete Trip**:
   - The fare is recorded into your daily shift earnings.
   - Your driver profile is ready to accept the next ride.

### 3.4 Going Off-Duty
- Toggle the **Shift Status** switch to **Offline** when you have lectures, study groups, or are leaving campus. Your car will be removed from the active rider map.

---

## 4. Administrator Guide (`/app/admin`)

The Admin Hub is accessible strictly to accounts with the `admin` role (e.g. `iyanuolalegan@gmail.com`).

### 4.1 Overview & System Analytics
1. Access the **Admin Controls** menu in the sidebar or navigate to `/app/admin`.
2. Inspect platform key performance indicators:
   - **Total Platform Revenue**: Cumulative sum of completed trip fares.
   - **Active Trips**: Live rides currently in `pending`, `accepted`, or `ongoing` states.
   - **Total Registered Accounts**: Count of student riders and drivers.
   - **Verified Drivers**: Approved peer drivers on the road.
   - **Pending Verification Queue**: Accounts requiring identity or vehicle audit.
3. Review the weekly **Ride Volume Trends** chart powered by Recharts.

### 4.2 User Management & Safety Auditing
1. Select the **Users** tab in the admin control bar.
2. Use the live search bar to filter by student name or email.
3. **Verification Badges**:
   - Click the verification toggle next to any user.
   - Verified users gain a green checkmark indicating student ID or driving credential validation.
   - Unverified drivers are restricted until verified by the safety committee.
4. **Account Moderation**:
   - Click the delete icon to remove malicious accounts or violators of campus transport safety guidelines.

### 4.3 Real-Time Ride Auditing
1. Select the **Rides** tab.
2. Monitor all ongoing and historical campus trips.
3. Filter by passenger name or location to investigate disputes, lost items, or safety reports.
