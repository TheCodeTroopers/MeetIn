# College Faculty Appointment System --- Frontend / UI Specification

> Frontend implementation guide for the College Faculty Appointment
> System, visually inspired by the uploaded AASARE reference screen.
>
> The UI should retain the AASARE visual character --- warm ivory
> backgrounds, deep plum/maroon accents, muted gold highlights, rounded
> cards, soft shadows, generous whitespace, and a calm institutional
> feel --- while adapting the product to a general college faculty
> appointment system.

------------------------------------------------------------------------

# 1. Frontend Objective

The frontend must provide a polished, responsive appointment platform
with exactly three role-based experiences:

1.  **Admin Panel**
2.  **Faculty Panel**
3.  **User Panel**

The visual language should be consistent across all three panels.

The uploaded AASARE screen should be treated as the primary visual
reference for:

-   Color palette
-   Typography hierarchy
-   Rounded card style
-   Button treatment
-   Spacing
-   Soft background gradients
-   Header/navigation style
-   Form styling
-   Institutional/premium appearance

The frontend must **not copy the AASARE interface literally**. It should
use the reference as a design direction and adapt it to the college
faculty appointment use case.

------------------------------------------------------------------------

# 2. Design Direction

## 2.1 Overall Style

Use a:

-   Premium institutional
-   Minimal
-   Calm
-   Friendly
-   Modern
-   Accessible

visual style.

Avoid:

-   Excessive gradients
-   Heavy glassmorphism
-   Neon colors
-   Dense dashboards
-   Excessive animations
-   Overly rounded cartoon-like interfaces
-   Generic SaaS dashboard styling

The product should feel like an official college platform rather than a
commercial booking website.

------------------------------------------------------------------------

# 3. Visual Reference Interpretation

The uploaded reference screen contains the following major visual
characteristics:

### Header

-   White/near-white navigation bar
-   Institutional logo on the left
-   Product name beside the logo
-   Small uppercase institutional subtitle
-   Navigation links on the right
-   Prominent dark-plum sign-in button

### Hero / Authentication Area

-   Warm cream background
-   Very subtle pink/peach tint
-   Large typography
-   Deep plum primary text
-   Gold/yellow emphasis text
-   Large rounded authentication card
-   Soft shadow
-   Thin borders
-   Rounded input fields
-   Dark-plum primary CTA

### Typography

The reference uses a high-contrast visual hierarchy:

``` text
Large heading
    ↓
Supporting paragraph
    ↓
Feature/value points
```

The same hierarchy should be maintained throughout the new application.

------------------------------------------------------------------------

# 4. Color System

Use CSS variables so the complete theme can be changed from one
location.

Recommended palette:

``` css
:root {
  --background: #FBF7F2;
  --background-soft: #F7EFE8;

  --surface: #FFFFFF;
  --surface-soft: #FCF9F6;

  --primary: #7A1F57;
  --primary-dark: #651744;
  --primary-light: #F1DCE8;

  --accent: #E8B52D;
  --accent-light: #FFF1BF;

  --text-primary: #34252D;
  --text-secondary: #75676C;
  --text-muted: #9A8E91;

  --border: #E9DED8;
  --border-strong: #D9C9C2;

  --success: #2E7D5B;
  --success-light: #E5F4EC;

  --warning: #B7791F;
  --warning-light: #FFF3D6;

  --danger: #B64242;
  --danger-light: #FBE8E8;

  --info: #4A668A;
  --info-light: #EAF0F7;
}
```

Primary visual relationship:

``` text
Warm Ivory Background
        +
White Cards
        +
Deep Plum Primary
        +
Gold Highlight
```

------------------------------------------------------------------------

# 5. Typography

Recommended font stack:

``` css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

If the design system supports a second display font, use it only for
major hero headings.

### Typography scale

``` text
Display:
48–64px

H1:
40–48px

H2:
30–36px

H3:
22–26px

Body:
15–17px

Small:
13–14px

Label:
12–13px
```

Desktop hero headings can use approximately:

``` text
56px
font-weight: 500–600
line-height: 1.05
```

Use the gold accent selectively for important words.

Example:

``` text
Book time with your
Faculty, your way.
```

where `Faculty` can use the gold accent.

------------------------------------------------------------------------

# 6. Global Layout

The application should use a consistent layout system.

``` text
┌─────────────────────────────────────────────┐
│ Header                                      │
├─────────────────────────────────────────────┤
│                                             │
│ Page content                                │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

Authenticated dashboard layout:

``` text
┌──────────────┬────────────────────────────────────┐
│              │                                    │
│ Sidebar      │ Main Content                       │
│              │                                    │
│ Navigation   │ Dashboard / Page                   │
│              │                                    │
│              │                                    │
└──────────────┴────────────────────────────────────┘
```

Desktop:

``` text
Sidebar: 240–260px
Main content: flexible
Maximum content width: 1440px
```

Mobile:

``` text
Top bar
    ↓
Content
    ↓
Bottom/mobile navigation or drawer
```

------------------------------------------------------------------------

# 7. Global Header

The public header should resemble the uploaded reference.

``` text
┌─────────────────────────────────────────────────────────────┐
│ [LOGO] FACULTYCONNECT                         Home Faculty  │
│        COLLEGE APPOINTMENT SYSTEM             About   Login  │
└─────────────────────────────────────────────────────────────┘
```

Use:

-   White background
-   72--84px height
-   Thin bottom border
-   Logo + product name
-   Navigation links
-   Primary sign-in button

Suggested product branding:

``` text
FacultyConnect
COLLEGE APPOINTMENT SYSTEM
```

The actual product name can be changed without affecting the UI
architecture.

------------------------------------------------------------------------

# 8. Authentication UI

Authentication should visually follow the uploaded AASARE reference.

## 8.1 Login Page

Route:

``` text
/login
```

Desktop layout:

``` text
┌──────────────────────────────────────────────────────────────┐
│                         Header                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────┐       ┌────────────────────────┐ │
│   │                      │       │ Sign in                 │ │
│   │  Your faculty        │       │                         │ │
│   │  appointment space.  │       │ Continue with Google    │ │
│   │                      │       │                         │ │
│   │  Book appointments   │       │ ───── OR ─────          │ │
│   │  with your faculty.  │       │                         │ │
│   │                      │       │ College Email           │ │
│   │  • Easy booking      │       │ [________________]      │ │
│   │  • Clear status      │       │                         │ │
│   │  • Simple scheduling │       │ Password                │ │
│   │                      │       │ [________________]      │ │
│   └──────────────────────┘       │                         │ │
│                                  │ [       Sign in       ] │ │
│                                  └────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Left section

Use:

``` text
PRIVATE & SECURE
```

or:

``` text
COLLEGE APPOINTMENTS
```

Then:

``` text
Meet your
faculty with ease.
```

Highlight one phrase in gold.

Supporting copy:

``` text
Find faculty availability, choose a suitable time,
and manage your appointments from one place.
```

Feature list:

``` text
• Browse faculty availability
• Book appointments in minutes
• Track every appointment
```

### Right section

Large white card:

``` text
border-radius: 24px
padding: 36–44px
box-shadow: subtle
```

Include:

-   Login/Create account switch
-   Google authentication if implemented
-   Email input
-   Password input
-   Forgot password
-   Primary sign-in button
-   Registration link

------------------------------------------------------------------------

# 9. Registration Page

Route:

``` text
/register
```

Fields:

``` text
Full Name
College Email
Password
Confirm Password
Department
Year
```

The UI should remain visually consistent with login.

Use a two-column form on desktop where appropriate.

------------------------------------------------------------------------

# 10. Public Landing Page

Route:

``` text
/
```

The landing page should follow the visual tone of AASARE but represent
faculty appointments.

## Hero

Suggested structure:

``` text
COLLEGE FACULTY APPOINTMENTS

Connect with your faculty,
when it works for you.
```

Gold-highlighted word:

``` text
faculty
```

Supporting text:

``` text
Discover faculty availability, choose a suitable
time slot, and manage your appointments through
one simple college platform.
```

CTA:

``` text
[Find Faculty]    [Sign In]
```

## Hero visual

Instead of a large photo, use an appointment card composition:

``` text
┌───────────────────────────────┐
│ Today's Availability           │
│                               │
│ Dr. Ananya Rao                │
│ Computer Science              │
│                               │
│ 10:00  Available              │
│ 10:20  Booked                │
│ 10:40  Available              │
│                               │
│ [View Profile]                │
└───────────────────────────────┘
```

Use subtle floating cards if animation is implemented.

------------------------------------------------------------------------

# 11. Faculty Directory

Route:

``` text
/faculty
/user/faculty
```

Page structure:

``` text
Faculty
Find the right person for your appointment.

[ Search faculty... ]

[Department ▼] [Designation ▼] [Availability ▼]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Profile     │ │ Profile     │ │ Profile     │
│ Image       │ │ Image       │ │ Image       │
│             │ │             │ │             │
│ Dr. A       │ │ Dr. B       │ │ Dr. C       │
│ CSE         │ │ ECE         │ │ ISE         │
│ Professor   │ │ Assistant   │ │ Professor   │
│             │ │             │ │             │
│ [View]      │ │ [View]      │ │ [View]      │
└─────────────┘ └─────────────┘ └─────────────┘
```

Faculty cards:

-   White background
-   18--22px radius
-   Thin border
-   Small shadow on hover
-   Profile image
-   Department badge
-   Designation
-   Availability indicator
-   View profile button

------------------------------------------------------------------------

# 12. Faculty Profile Page

Route:

``` text
/faculty/:id
```

Desktop:

``` text
┌─────────────────────────────────────────────────────────────┐
│ Faculty Profile                                              │
│                                                             │
│ [Photo]  Dr. Faculty Name                                   │
│          Department of Computer Science                      │
│          Assistant Professor                                │
│          Office: Block A, Room 203                           │
│                                                             │
│          Short biography...                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Choose a date                                               │
│                                                             │
│ [21 Sep] [22 Sep] [23 Sep] [24 Sep] [25 Sep]               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Available Times                                             │
│                                                             │
│ [09:00–09:20] [09:20–09:40] [09:40–10:00]                 │
│ [10:30–10:50] [11:00–11:20]                                │
└─────────────────────────────────────────────────────────────┘
```

Available slots should be visually prominent.

Booked/unavailable slots should be disabled rather than hidden when
useful.

------------------------------------------------------------------------

# 13. Appointment Booking Modal

When a user selects a slot:

``` text
┌─────────────────────────────────────────────┐
│ Confirm Appointment                         │
│                                             │
│ Faculty                                     │
│ Dr. Faculty Name                            │
│                                             │
│ Date                                        │
│ 22 September 2026                           │
│                                             │
│ Time                                        │
│ 01:10 PM – 01:20 PM                         │
│                                             │
│ Reason for appointment                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Project discussion...                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Cancel]              [Confirm Appointment] │
└─────────────────────────────────────────────┘
```

Use a large modal with clear confirmation hierarchy.

------------------------------------------------------------------------

# 14. User Dashboard

Route:

``` text
/user/dashboard
```

Dashboard header:

``` text
Good morning, Abhishek

Manage your faculty appointments from one place.
```

Summary cards:

``` text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Upcoming     │ │ Pending      │ │ Completed    │
│     3        │ │     2        │ │     12       │
└──────────────┘ └──────────────┘ └──────────────┘
```

Primary sections:

``` text
Upcoming Appointments
```

Appointment card:

``` text
┌──────────────────────────────────────────────┐
│ Dr. Faculty Name                             │
│ Computer Science                             │
│                                              │
│ 22 September 2026                            │
│ 01:10 PM – 01:20 PM                          │
│                                              │
│ Reason: Project discussion                   │
│                                              │
│ Status: APPROVED                             │
│                                              │
│ [View Details] [Cancel]                      │
└──────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 15. User Appointment Page

Route:

``` text
/user/appointments
```

Use tabs:

``` text
All
Upcoming
Pending
Completed
Cancelled
```

Each appointment should have:

-   Faculty
-   Date
-   Time
-   Reason
-   Status
-   Actions

Status colors should be subtle.

Example:

``` text
APPROVED
```

Use a pale green background.

``` text
PENDING
```

Use a pale gold background.

``` text
REJECTED
```

Use a pale red background.

------------------------------------------------------------------------

# 16. Faculty Dashboard

Route:

``` text
/faculty/dashboard
```

The faculty dashboard should feel like an institutional scheduling
workspace.

Header:

``` text
Good morning, Dr. Faculty Name

Here's your appointment overview.
```

Statistics:

``` text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Today      │ │ Pending    │ │ Upcoming   │ │ Completed  │
│     5      │ │     3      │ │     12     │ │     42     │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Quick actions:

``` text
[+ Create Availability]
[View Calendar]
[Appointments]
```

------------------------------------------------------------------------

# 17. Faculty Appointment Management

Route:

``` text
/faculty/appointments
```

Tabs:

``` text
Pending
Approved
Completed
Rejected
Cancelled
```

Pending appointment card:

``` text
┌────────────────────────────────────────────────┐
│ Rahul Sharma                                   │
│ CSE • 3rd Year                                 │
│                                                │
│ 22 September 2026                              │
│ 01:10 PM – 01:20 PM                            │
│                                                │
│ Reason                                         │
│ Project discussion                             │
│                                                │
│ [Reject]                       [Approve]        │
└────────────────────────────────────────────────┘
```

Approve action should require confirmation.

Reject action should open:

``` text
Reason for rejection
[________________________________]

[Cancel] [Reject Appointment]
```

------------------------------------------------------------------------

# 18. Faculty Availability Page

Route:

``` text
/faculty/availability
```

This is one of the most important screens.

Header:

``` text
Availability

Create and manage the times when students
can book an appointment with you.

[+ Create Availability]
```

------------------------------------------------------------------------

# 19. Create Availability UI

Use a large card.

``` text
┌────────────────────────────────────────────────────┐
│ Create Availability                                │
│                                                    │
│ Date                                               │
│ [ 22 September 2026 ]                              │
│                                                    │
│ Start Time                 End Time                │
│ [ 01:00 PM ]               [ 01:30 PM ]            │
│                                                    │
│ Slot Mode                                          │
│                                                    │
│ ┌─────────────────────┐ ┌────────────────────────┐ │
│ │ Minute Based        │ │ Manual Slots           │ │
│ │ Generate slots      │ │ Add times yourself     │ │
│ └─────────────────────┘ └────────────────────────┘ │
│                                                    │
│ Slot Duration                                      │
│ [ 10 minutes ▼ ]                                   │
│                                                    │
│ Generated Slots                                    │
│                                                    │
│ 01:00 – 01:10       Available                     │
│ 01:10 – 01:20       Available                     │
│ 01:20 – 01:30       Available                     │
│                                                    │
│                         [Save Availability]        │
└────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 20. Minute-Based Slot Mode

When selected:

``` text
Slot Duration
[5 min] [10 min] [15 min] [20 min] [30 min] [Custom]
```

Show live preview.

Example:

``` text
1:00 PM → 1:30 PM
Duration: 10 minutes

3 slots will be created

┌──────────────┐
│ 01:00–01:10  │
│ Available    │
└──────────────┘

┌──────────────┐
│ 01:10–01:20  │
│ Available    │
└──────────────┘

┌──────────────┐
│ 01:20–01:30  │
│ Available    │
└──────────────┘
```

The UI must use the same slot-generation logic defined in the
implementation specification.

------------------------------------------------------------------------

# 21. Manual Slot Mode

When manual mode is selected:

``` text
Add Slot

Start Time       End Time
[01:00 PM]       [01:30 PM]

[+ Add Slot]
```

Then:

``` text
Current Slots

01:00 – 01:30          [Delete]
02:00 – 02:45          [Delete]
03:30 – 04:00          [Delete]
```

Validate:

-   Start \< End
-   No overlapping slots
-   Date is valid
-   Slot is not in the past
-   Booked slots cannot be deleted without handling the appointment

------------------------------------------------------------------------

# 22. Faculty Calendar

Route:

``` text
/faculty/calendar
```

Calendar header:

``` text
September 2026

<        Today        >

Mon   Tue   Wed   Thu   Fri   Sat   Sun
21    22    23    24    25    26    27
```

Date cells should show a small appointment count.

Example:

``` text
22
8 appointments
```

Selecting a date:

``` text
22 September

09:00 – 09:30    BOOKED
09:30 – 09:40    AVAILABLE
09:40 – 09:50    AVAILABLE
10:00 – 10:30    BOOKED
```

Use visual status indicators without overwhelming the calendar.

------------------------------------------------------------------------

# 23. Faculty Slot Management

Route:

``` text
/faculty/slots
```

Display slots in a table/list.

Columns:

``` text
Date
Time
Status
Appointment
Actions
```

Example:

``` text
22 Sep | 01:00–01:10 | Available | — | Block
22 Sep | 01:10–01:20 | Booked    | Rahul | View
22 Sep | 01:20–01:30 | Available | — | Block
```

------------------------------------------------------------------------

# 24. Admin Dashboard

Route:

``` text
/admin/dashboard
```

The admin dashboard should be more information-dense than the user
dashboard but should retain the same visual language.

Header:

``` text
Good morning, Admin

Overview of the faculty appointment system.
```

Stats:

``` text
Total Faculty
Active Faculty
Appointments Today
Pending Requests
```

Example:

``` text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Faculty     │ │ Active      │ │ Today       │ │ Pending     │
│     64      │ │     61      │ │     28      │ │     11      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

------------------------------------------------------------------------

# 25. Admin Faculty Management

Route:

``` text
/admin/faculty
```

Header:

``` text
Faculty

Manage faculty accounts and profiles.

[+ Add Faculty]
```

Search:

``` text
[ Search faculty... ]
```

Filters:

``` text
Department
Designation
Status
```

Table:

``` text
┌───────────────────────────────────────────────────────────────┐
│ Faculty       Department   Designation     Status     Action  │
├───────────────────────────────────────────────────────────────┤
│ Dr. A         CSE          Professor       Active     View    │
│ Dr. B         ECE          Assistant       Active     View    │
│ Dr. C         ISE          Professor       Inactive   View    │
└───────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 26. Add Faculty Page

Route:

``` text
/admin/faculty/new
```

Form sections:

## Basic Information

``` text
Full Name
Employee ID
College Email
Phone
```

## Professional Information

``` text
Department
Designation
Office Location
```

## Profile

``` text
Profile Image
Bio
```

## Account

``` text
Active
```

CTA:

``` text
[Cancel] [Create Faculty]
```

------------------------------------------------------------------------

# 27. Admin Faculty Details

Route:

``` text
/admin/faculty/:id
```

Show:

-   Faculty profile
-   Department
-   Designation
-   Contact information
-   Active/inactive status
-   Availability summary
-   Appointment statistics
-   Schedule

Admin actions:

``` text
[Edit]
[Deactivate]
[View Schedule]
```

------------------------------------------------------------------------

# 28. Sidebar Design

Authenticated panels should share a common sidebar component.

Example Faculty sidebar:

``` text
┌────────────────────────┐
│ LOGO                   │
│ FacultyConnect         │
│                        │
│ OVERVIEW               │
│  Dashboard             │
│                        │
│ APPOINTMENTS           │
│  Appointments          │
│  Calendar              │
│                        │
│ AVAILABILITY            │
│  Availability          │
│  Slots                 │
│                        │
│ ACCOUNT                │
│  Profile               │
│  Notifications         │
│  Settings              │
│                        │
│ ─────────────────────  │
│ Dr. Faculty Name       │
│ Sign out               │
└────────────────────────┘
```

Use:

-   White or very light warm background
-   Active item with pale plum background
-   Plum icon/text for active state
-   Minimal separators
-   16--18px icons

------------------------------------------------------------------------

# 29. User Navigation

User navigation:

``` text
Dashboard
Find Faculty
My Appointments
Notifications
Profile
```

Optional:

``` text
Help
Settings
```

------------------------------------------------------------------------

# 30. Admin Navigation

Admin navigation:

``` text
Dashboard

Faculty
  All Faculty
  Add Faculty

Appointments
Schedules

Users

Audit Logs

Settings
```

------------------------------------------------------------------------

# 31. Faculty Navigation

Faculty navigation:

``` text
Dashboard

Appointments
Calendar

Availability
Slots

Profile
Notifications
Settings
```

------------------------------------------------------------------------

# 32. Mobile Navigation

On mobile, replace the permanent sidebar with:

``` text
┌───────────────────────────────────┐
│ ☰  FacultyConnect          🔔     │
└───────────────────────────────────┘
```

Navigation can open as a drawer.

For frequent user actions, use bottom navigation:

``` text
┌───────────────────────────────────┐
│ Home   Faculty   Appointments  Me │
└───────────────────────────────────┘
```

------------------------------------------------------------------------

# 33. Appointment Status Components

Create one reusable component:

``` text
<AppointmentStatus />
```

Statuses:

``` text
PENDING
APPROVED
REJECTED
COMPLETED
CANCELLED
```

Visual treatment:

  Status      Background          Text
  ----------- ------------------- -----------
  Pending     Pale gold           Dark gold
  Approved    Pale green          Green
  Rejected    Pale red            Red
  Completed   Pale blue/neutral   Blue
  Cancelled   Light gray/red      Muted

Do not use extremely saturated status colors.

------------------------------------------------------------------------

# 34. Slot Status Components

Reusable:

``` text
<SlotStatus />
```

States:

``` text
AVAILABLE
BOOKED
BLOCKED
COMPLETED
CANCELLED
```

User-facing representation can simplify this to:

``` text
Available
Unavailable
Booked
```

Faculty users can see the full status.

------------------------------------------------------------------------

# 35. Cards

Global card style:

``` css
border-radius: 20px;
border: 1px solid var(--border);
background: var(--surface);
box-shadow: 0 8px 30px rgba(70, 35, 50, 0.05);
```

Avoid heavy shadows.

Hover:

``` text
translateY(-2px)
slightly stronger shadow
border becomes slightly darker
```

Use transitions around:

``` text
150–250ms
```

------------------------------------------------------------------------

# 36. Buttons

## Primary

``` text
Background: Deep Plum
Text: White
Radius: 12–14px
Height: 44–48px
```

Example:

``` text
[ + Create Availability ]
```

## Secondary

``` text
Background: White
Border: Plum/neutral
Text: Plum
```

## Accent

Use gold sparingly for:

-   Highlights
-   Selected dates
-   Important visual emphasis
-   Decorative elements

Do not make large gold buttons the default CTA.

------------------------------------------------------------------------

# 37. Inputs

Inputs should visually resemble the reference screen.

``` text
┌────────────────────────────────────┐
│ ✉  you@college.edu                 │
└────────────────────────────────────┘
```

Properties:

``` text
Height: 48–54px
Radius: 14px
Border: #E9DED8
Background: #FCFAF8
```

Focus:

``` text
border: primary
box-shadow: subtle primary ring
```

Labels should appear above inputs.

------------------------------------------------------------------------

# 38. Tables

Tables should use a clean institutional style.

Header:

``` text
background: #FBF7F2
font-size: 12px
text-transform: uppercase
letter-spacing: 0.05em
```

Rows:

``` text
background: white
border-bottom: 1px solid var(--border)
```

On mobile, convert tables into cards.

------------------------------------------------------------------------

# 39. Empty States

Every list page should have a meaningful empty state.

Example:

``` text
            [calendar illustration]

No appointments yet

You don't have any appointments for this period.

[Find Faculty]
```

Faculty:

``` text
No appointment requests

New requests will appear here.
```

------------------------------------------------------------------------

# 40. Loading States

Use skeleton loaders rather than blank screens.

Example faculty card:

``` text
┌─────────────────────────────┐
│ ███████                     │
│ █████████████               │
│ ██████                      │
│                             │
│ ██████████████              │
│ ███████                     │
└─────────────────────────────┘
```

Skeletons should use warm neutral colors.

------------------------------------------------------------------------

# 41. Toast Notifications

Use non-intrusive toast messages.

Examples:

``` text
Appointment booked successfully.
```

``` text
Availability created successfully.
```

``` text
Appointment approved.
```

``` text
This slot has just been booked by another user.
Please select another slot.
```

Error toasts should clearly explain the next action.

------------------------------------------------------------------------

# 42. Confirmation Dialogs

Use confirmation dialogs for destructive actions.

Example:

``` text
Cancel appointment?

Are you sure you want to cancel this appointment?

22 September
01:10 PM – 01:20 PM

[Keep Appointment] [Cancel Appointment]
```

For faculty:

``` text
Block this slot?

Students will no longer be able to book this time.

[Cancel] [Block Slot]
```

------------------------------------------------------------------------

# 43. Responsive Breakpoints

Use standard responsive breakpoints:

``` text
Mobile:
< 640px

Tablet:
640–1024px

Desktop:
1024–1280px

Large Desktop:
> 1280px
```

Desktop dashboard:

``` text
Sidebar + content
```

Tablet:

``` text
Collapsible sidebar + content
```

Mobile:

``` text
Top navigation + drawer
```

------------------------------------------------------------------------

# 44. Responsive Rules

### Faculty cards

Desktop:

``` text
3–4 columns
```

Tablet:

``` text
2 columns
```

Mobile:

``` text
1 column
```

### Dashboard statistics

Desktop:

``` text
4 columns
```

Tablet:

``` text
2 columns
```

Mobile:

``` text
2 columns or horizontal scroll
```

### Forms

Desktop:

``` text
2-column form
```

Mobile:

``` text
1-column form
```

------------------------------------------------------------------------

# 45. Animation Guidelines

Animations should be subtle.

Recommended:

``` text
fade-in
slide-up
hover elevation
modal scale
button feedback
```

Use animation duration:

``` text
150–300ms
```

Page-level hero animation can use:

``` text
400–700ms
```

Do not animate every dashboard component independently.

------------------------------------------------------------------------

# 46. Accessibility

The frontend must support:

-   Keyboard navigation
-   Visible focus states
-   Proper labels
-   Semantic HTML
-   Accessible dialog controls
-   Sufficient color contrast
-   Screen-reader-friendly status messages
-   `aria-label` where required

Never use color as the only indicator of appointment status.

For example:

``` text
● Approved
```

should also contain the text `Approved`.

------------------------------------------------------------------------

# 47. Component Architecture

Recommended structure:

``` text
src/
│
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── register/
│   │
│   ├── user/
│   │   ├── dashboard/
│   │   ├── faculty/
│   │   ├── appointments/
│   │   ├── profile/
│   │   └── notifications/
│   │
│   ├── faculty/
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── calendar/
│   │   ├── availability/
│   │   ├── slots/
│   │   ├── profile/
│   │   └── notifications/
│   │
│   └── admin/
│       ├── dashboard/
│       ├── faculty/
│       ├── appointments/
│       ├── schedules/
│       ├── users/
│       ├── audit-logs/
│       └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── auth/
│   ├── faculty/
│   ├── appointments/
│   ├── availability/
│   ├── slots/
│   ├── calendar/
│   ├── admin/
│   └── notifications/
│
├── lib/
│   ├── auth/
│   ├── api/
│   ├── validations/
│   └── utils/
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-appointments.ts
│   ├── use-faculty.ts
│   ├── use-availability.ts
│   └── use-slots.ts
│
└── types/
    ├── user.ts
    ├── faculty.ts
    ├── appointment.ts
    ├── availability.ts
    └── slot.ts
```

------------------------------------------------------------------------

# 48. Reusable Components

Create reusable components instead of duplicating UI.

``` text
Button
Input
Select
Textarea
Modal
Dialog
Badge
Card
Avatar
Dropdown
Tabs
Toast
Skeleton
DatePicker
Calendar
```

Domain-specific:

``` text
FacultyCard
FacultyProfile
AppointmentCard
AppointmentStatus
SlotCard
SlotStatus
AvailabilityForm
SlotGeneratorPreview
AppointmentModal
FacultyTable
DashboardStatCard
NotificationItem
```

------------------------------------------------------------------------

# 49. Frontend Routes

## Public

``` text
/
 /login
 /register
 /faculty
 /faculty/:id
```

## User

``` text
/user/dashboard
/user/faculty
/user/appointments
/user/appointments/:id
/user/profile
/user/notifications
```

## Faculty

``` text
/faculty/dashboard
/faculty/appointments
/faculty/calendar
/faculty/availability
/faculty/slots
/faculty/profile
/faculty/notifications
/faculty/settings
```

## Admin

``` text
/admin/dashboard
/admin/faculty
/admin/faculty/new
/admin/faculty/:id
/admin/schedules
/admin/appointments
/admin/users
/admin/audit-logs
/admin/settings
```

------------------------------------------------------------------------

# 50. Role-Based Route Guards

Frontend route protection should resolve the authenticated role.

``` text
Authenticated user
       |
       v
Fetch profile
       |
       v
Resolve role
       |
       ├── admin  → /admin/dashboard
       |
       ├── faculty → /faculty/dashboard
       |
       └── user → /user/dashboard
```

Unauthorised route access should redirect to the appropriate dashboard.

Example:

``` text
Faculty attempts /admin/dashboard
        ↓
Redirect
        ↓
/faculty/dashboard
```

Frontend protection is only a UX layer. Backend/API authorization must
still enforce the actual security rules.

------------------------------------------------------------------------

# 51. Data States

Every major page should account for:

``` text
Loading
Success
Empty
Error
Unauthorized
```

Example:

``` tsx
if (loading) return <PageSkeleton />;
if (error) return <ErrorState />;
if (!data.length) return <EmptyState />;
return <AppointmentList />;
```

------------------------------------------------------------------------

# 52. Booking Flow UI

The complete user flow should be:

``` text
Login
  ↓
User Dashboard
  ↓
Find Faculty
  ↓
Faculty Profile
  ↓
Select Date
  ↓
Select Available Slot
  ↓
Booking Modal
  ↓
Enter Reason
  ↓
Confirm
  ↓
Booking Success
  ↓
Appointment Pending
```

Success state:

``` text
✓ Appointment request submitted

Your request has been sent to
Dr. Faculty Name.

22 September 2026
01:10 PM – 01:20 PM

Status: Pending

[View Appointment]
```

------------------------------------------------------------------------

# 53. Faculty Approval Flow UI

``` text
Faculty Dashboard
      ↓
Pending Requests
      ↓
Open Appointment
      ↓
Review Student + Reason
      ↓
Approve / Reject
      ↓
Notification sent
```

Approval success:

``` text
Appointment approved.

The student has been notified.
```

------------------------------------------------------------------------

# 54. Availability Flow UI

``` text
Faculty Dashboard
       ↓
Create Availability
       ↓
Select Date
       ↓
Start Time
       ↓
End Time
       ↓
Choose Slot Mode
       ↓
 ┌───────────────┬───────────────┐
 │ Minute Based  │ Manual        │
 └───────┬───────┴───────┬───────┘
         ↓                ↓
   Generate slots    Add slots
         ↓                ↓
         └───────┬────────┘
                 ↓
             Preview
                 ↓
              Save
```

------------------------------------------------------------------------

# 55. Frontend Validation

Use Zod + React Hook Form if the recommended stack is followed.

Validate:

### Login

``` text
Valid college email
Password required
```

### Faculty

``` text
Name required
Employee ID required
Department required
Designation required
Email valid
```

### Availability

``` text
Date required
Start time required
End time required
Start < End
```

### Minute-based

``` text
Duration > 0
Duration must produce at least one complete slot
```

### Manual

``` text
No overlap
Start < End
No past slots
```

------------------------------------------------------------------------

# 56. Date and Time UX

The application must clearly display:

``` text
Date:
22 September 2026

Time:
01:10 PM – 01:20 PM
```

Avoid ambiguous formats such as:

``` text
22/09/26
13:10
```

unless the context specifically requires compact formatting.

Use `date-fns` or equivalent date utilities.

The frontend must respect the college's configured timezone.

------------------------------------------------------------------------

# 57. Notifications UI

Header:

``` text
🔔
```

Clicking opens:

``` text
Notifications

● Appointment approved
  Dr. Faculty Name approved your appointment.

○ Appointment reminder
  Your appointment is tomorrow at 10:00 AM.

○ Appointment cancelled
  Your appointment has been cancelled.
```

Unread notifications should have a subtle background difference.

------------------------------------------------------------------------

# 58. Profile Page

User:

``` text
Profile

[Avatar]

Full Name
College Email
Department
Year
Phone

[Edit Profile]
```

Faculty:

``` text
Profile

[Avatar]

Dr. Faculty Name
Department
Designation
Employee ID
Office Location
Bio

[Edit Profile]
```

Admin profile can use the same reusable structure.

------------------------------------------------------------------------

# 59. Settings

Keep settings minimal for MVP.

``` text
Account
Notifications
Appearance
Security
```

Do not build unnecessary configuration screens before the core
appointment workflow is complete.

------------------------------------------------------------------------

# 60. Suggested Landing Page Sections

The public home page can contain:

``` text
1. Header
2. Hero
3. How it works
4. Faculty discovery preview
5. Appointment workflow
6. Benefits
7. CTA
8. Footer
```

## How It Works

``` text
01
Find Faculty

Browse faculty by department
and designation.

02
Choose a Time

View available appointment
slots.

03
Meet Your Faculty

Track approval and attend
your appointment.
```

------------------------------------------------------------------------

# 61. Footer

Minimal institutional footer:

``` text
FacultyConnect
College Faculty Appointment System

Quick Links
Faculty
About
Sign In

Contact
college@email.edu

© 2026 College Name
```

Keep the footer visually quiet.

------------------------------------------------------------------------

# 62. Design Tokens

Recommended spacing scale:

``` text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
```

Recommended radii:

``` text
8px   small controls
12px  buttons/inputs
16px  small cards
20px  large cards
24px  hero/auth cards
```

------------------------------------------------------------------------

# 63. Shadow Tokens

``` css
--shadow-sm:
  0 2px 8px rgba(70, 35, 50, 0.04);

--shadow-md:
  0 8px 24px rgba(70, 35, 50, 0.06);

--shadow-lg:
  0 16px 40px rgba(70, 35, 50, 0.08);
```

Use shadows sparingly.

------------------------------------------------------------------------

# 64. UI Consistency Rules

Every page should follow:

``` text
Same header
Same sidebar
Same typography
Same card radius
Same button hierarchy
Same status system
Same spacing scale
Same form styling
```

Do not create a completely different design for each role.

The information architecture changes by role, but the visual identity
remains the same.

------------------------------------------------------------------------

# 65. Important Product UX Rule

The user should **never need to know whether a faculty member uses
manual slots or minute-based slots**.

The backend can generate slots using either method:

``` text
MANUAL
   ↓
appointment_slots

MINUTE_BASED
   ↓
appointment_slots
```

The frontend simply displays:

``` text
Available
Booked
Unavailable
```

This keeps the booking experience simple.

------------------------------------------------------------------------

# 66. MVP Frontend Build Order

Implement in this order:

## Phase 1 --- Design System

-   Colors
-   Typography
-   Spacing
-   Buttons
-   Inputs
-   Cards
-   Badges
-   Dialogs
-   Toasts

## Phase 2 --- Public UI

-   Header
-   Landing page
-   Login
-   Register
-   Faculty directory
-   Faculty profile

## Phase 3 --- User Panel

-   Dashboard
-   Faculty discovery
-   Booking modal
-   Appointment list
-   Appointment details
-   Cancellation

## Phase 4 --- Faculty Panel

-   Dashboard
-   Appointment management
-   Availability creation
-   Minute-based slot preview
-   Manual slot creation
-   Calendar
-   Slot management

## Phase 5 --- Admin Panel

-   Dashboard
-   Faculty table
-   Add faculty
-   Edit faculty
-   Faculty details
-   Status management
-   Schedule view

## Phase 6 --- Polish

-   Responsive layout
-   Loading states
-   Empty states
-   Error states
-   Toasts
-   Accessibility
-   Animations
-   Mobile navigation

------------------------------------------------------------------------

# 67. Recommended Frontend Stack

Use the existing implementation direction:

  Layer            Technology
  ---------------- -----------------------
  Framework        Next.js
  Language         TypeScript
  UI               React
  Styling          Tailwind CSS
  Components       shadcn/ui / Radix UI
  Forms            React Hook Form
  Validation       Zod
  Data fetching    TanStack Query
  Date utilities   date-fns
  Icons            Lucide React
  Authentication   Supabase Auth
  Database         PostgreSQL / Supabase
  Deployment       Vercel

------------------------------------------------------------------------

# 68. Tailwind Theme Direction

Create semantic colors rather than hardcoding colors repeatedly.

Example:

``` ts
colors: {
  background: "#FBF7F2",
  surface: "#FFFFFF",
  primary: "#7A1F57",
  primaryDark: "#651744",
  accent: "#E8B52D",
  text: "#34252D",
  muted: "#75676C",
  border: "#E9DED8",
}
```

Then use:

``` text
bg-background
bg-surface
text-primary
text-text
text-muted
border-border
bg-accent
```

This makes future theme changes easier.

------------------------------------------------------------------------

# 69. Example Dashboard Composition

A typical dashboard should follow this hierarchy:

``` text
Page Header
   ↓
Welcome / Context
   ↓
Statistics
   ↓
Primary Action
   ↓
Main Content
   ↓
Secondary Information
```

Avoid putting too many widgets above the main task.

For example, on Faculty Dashboard:

``` text
Welcome
   ↓
Today's / Pending / Upcoming stats
   ↓
Create Availability
   ↓
Pending Requests
   ↓
Today's Schedule
```

------------------------------------------------------------------------

# 70. Visual Priority

Use the following hierarchy:

``` text
PRIMARY
Deep Plum

SECONDARY
Neutral / White

ACCENT
Gold

SUCCESS
Muted Green

WARNING
Muted Gold

ERROR
Muted Red
```

Gold should be a highlight, not the dominant brand color.

------------------------------------------------------------------------

# 71. Reference-Style Authentication Card

The authentication screen should preserve the strongest visual
characteristic of the uploaded reference:

``` text
Warm background
        +
Large left-side heading
        +
Large white rounded card
        +
Plum CTA
        +
Gold typography highlight
```

This screen should establish the application's identity immediately.

------------------------------------------------------------------------

# 72. Final UI Architecture

``` text
                         FRONTEND
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
       PUBLIC             USER             FACULTY
          │                 │                 │
     ┌────┴────┐       ┌────┴────┐       ┌────┴────┐
     │ Landing │       │Dashboard │       │Dashboard │
     │ Login   │       │Faculty   │       │Appts     │
     │ Register│       │Booking   │       │Calendar  │
     │ Faculty │       │Appts     │       │Avail.    │
     └─────────┘       └──────────┘       │Slots     │
                                          └──────────┘
                            │
                            ▼
                         ADMIN
                            │
                  ┌─────────┼─────────┐
                  │         │         │
               Dashboard Faculty  Schedules
                            │
                            ▼
                       Shared Design
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
             Components   Forms       Tables
                │           │           │
                └───────────┼───────────┘
                            ▼
                      API / Supabase
```

------------------------------------------------------------------------

# 73. Final Design Principle

The frontend should feel like:

> **A modern college appointment platform with the warmth and
> privacy-oriented visual character of AASARE, not a generic
> administrative dashboard.**

The uploaded AASARE reference should primarily influence:

-   Color palette
-   Authentication layout
-   Typography
-   Card treatment
-   Buttons
-   Forms
-   Whitespace
-   Institutional branding feel

The existing implementation specification should determine:

-   Roles
-   Routes
-   Appointment workflow
-   Faculty management
-   Availability
-   Manual slots
-   Minute-based slots
-   Calendar
-   Appointment states
-   Security boundaries
-   Backend/API interactions

The final result should combine both into one consistent frontend
system.
