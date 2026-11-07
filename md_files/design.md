# Service Booking Application – UI/UX Design System

## 1. Design Overview

The Service Booking Application must have a modern, clean, professional healthcare SaaS interface.

The primary visual reference is:

https://gocliniq.in/

The application should take inspiration from the website's healthcare-oriented design language, clean layouts, dashboard organization, appointment management experience, and professional visual presentation.

Do not copy its source code, logo, proprietary images, or branding.

Create an original interface using a similar visual direction.

### Design Objectives

- Create a professional healthcare application.
- Make appointment booking simple and intuitive.
- Keep navigation consistent across all pages.
- Use a clean and uncluttered interface.
- Maintain a consistent design system.
- Make the application responsive.
- Ensure accessibility.
- Reuse UI components instead of creating duplicate designs.

The application must look like a complete healthcare SaaS product rather than a basic student CRUD project.

---

## 2. Design Reference

Reference website:

https://gocliniq.in/

### Visual Characteristics

Use the following design characteristics as inspiration:

1. Clean white and light-colored surfaces.
2. Professional healthcare-oriented layouts.
3. Blue and periwinkle visual accents.
4. Soft secondary colors.
5. Rounded cards and buttons.
6. Subtle shadows.
7. Clear typography.
8. Organized dashboard sections.
9. Simple navigation.
10. Visually distinct appointment statuses.

The design must remain consistent across customer and administrator interfaces.

---

## 3. Color Palette

Use the following color system as the initial design foundation.

### 3.1 Primary Colors

| Token | Hex Color | Purpose |
|---|---|---|
| Primary | #3B82F6 | Primary buttons and links |
| Primary Dark | #2563EB | Hover and active states |
| Primary Light | #DBEAFE | Soft backgrounds |
| Secondary | #8B5CF6 | Secondary accents |
| Secondary Light | #EDE9FE | Highlight backgrounds |

### 3.2 Background Colors

| Token | Hex Color | Purpose |
|---|---|---|
| Background | #F8FAFC | Main page background |
| Surface | #FFFFFF | Cards and panels |
| Surface Muted | #F1F5F9 | Secondary surfaces |
| Border | #E2E8F0 | Dividers and borders |

### 3.3 Text Colors

| Token | Hex Color | Purpose |
|---|---|---|
| Heading | #0F172A | Main headings |
| Body | #334155 | Regular text |
| Muted | #64748B | Secondary text |
| Disabled | #94A3B8 | Disabled content |

### 3.4 Status Colors

| Status | Color | Background |
|---|---|---|
| Success | #16A34A | #DCFCE7 |
| Warning | #D97706 | #FEF3C7 |
| Error | #DC2626 | #FEE2E2 |
| Information | #2563EB | #DBEAFE |
| Neutral | #64748B | #F1F5F9 |

### 3.5 Color Usage Rules

- Primary blue must be used consistently for primary actions.
- Purple must be used sparingly for secondary highlights.
- Green indicates successful operations.
- Red indicates destructive actions or errors.
- Orange indicates pending or warning conditions.
- Avoid using too many bright colors on the same screen.
- Do not use arbitrary colors when an existing design token is available.

---

## 4. Typography

Use Inter as the primary font.

Fallback:

```css
font-family: Inter, ui-sans-serif, system-ui, sans-serif;
```

### Typography Scale

| Element | Font Size | Weight |
|---|---|---|
| Main page title | 28–32px | 700 |
| Section heading | 20–24px | 600 |
| Card heading | 16–18px | 600 |
| Body text | 14–16px | 400 |
| Secondary text | 12–14px | 400 |
| Button text | 14–15px | 600 |
| Table text | 13–14px | 400 |

### Typography Rules

- Use clear heading hierarchy.
- Avoid oversized text in dashboard cards.
- Maintain readable line heights.
- Do not use too many font weights.
- Keep text readable on mobile.
- Avoid unnecessary decorative fonts.

---

## 5. Application Layout

The application must support two primary interfaces:

1. Customer application.
2. Administrator application.

Both interfaces must share common design tokens and reusable components.

### 5.1 Customer Layout

The customer dashboard should have:

- Responsive navigation.
- Top navigation bar.
- User profile menu.
- Main content area.
- Booking overview.
- Quick booking action.
- Upcoming appointment section.

Suggested layout:

```text
+------------------------------------------------------+
| LOGO                   Search       Notifications User|
+------------------------------------------------------+
|                                                      |
| Welcome back, Customer                              |
| Manage your clinic appointments                      |
|                                                      |
| +-------------+ +-------------+ +----------------+   |
| | Upcoming    | | Completed   | | Cancelled      |   |
| | Appointments| | Appointments| | Appointments   |   |
| +-------------+ +-------------+ +----------------+   |
|                                                      |
| [ Book Appointment ]                                 |
|                                                      |
| Upcoming Appointments                                |
| +--------------------------------------------------+ |
| | Date | Service | Provider | Time | Status       | |
| +--------------------------------------------------+ |
|                                                      |
+------------------------------------------------------+
```

### 5.2 Admin Layout

The admin interface should use a sidebar-based dashboard.

Suggested layout:

```text
+----------------+-------------------------------------+
| LOGO           | Topbar                 Admin Profile |
|                +-------------------------------------+
| Dashboard      |                                     |
|                | Welcome to Admin Dashboard          |
| Appointments   |                                     |
|                | +--------+ +--------+ +----------+  |
| Services       | | Total  | | Today  | | Pending  |  |
|                | |Bookings| |Bookings| | Bookings |  |
| Availability   | +--------+ +--------+ +----------+  |
|                |                                     |
| Providers      | Appointment Overview                |
|                |                                     |
| Settings       | Recent Appointments                 |
|                |                                     |
| Logout         |                                     |
+----------------+-------------------------------------+
```

### 5.3 Layout Dimensions

Desktop:

- Sidebar width: 240–260px.
- Topbar height: 64–72px.
- Main content padding: 24–32px.
- Card spacing: 16–24px.

Tablet:

- Sidebar may collapse.
- Dashboard cards should use two columns where space permits.
- Tables should support horizontal scrolling or responsive alternatives.

Mobile:

- Sidebar becomes a drawer or bottom navigation.
- Main content uses 16px horizontal padding.
- Cards stack vertically.
- Forms use full-width controls.
- Tables become compact cards or scrollable regions.

---

## 6. Required Application Pages

### 6.1 Public Pages

#### Login Page

Elements:

- Application logo and name.
- Welcome heading.
- Email field.
- Password field.
- Show/hide password control.
- Remember-session option if supported.
- Login button.
- Link to registration.
- Validation messages.

#### Registration Page

Elements:

- Full name.
- Email.
- Phone number.
- Password.
- Confirm password.
- Terms and conditions acceptance.
- Register button.
- Link to login.

Public registration must not include a selectable admin role.

### 6.2 Customer Pages

#### Customer Dashboard

Display:

- Welcome message.
- Upcoming appointment count.
- Completed appointment count.
- Cancelled appointment count.
- Next appointment.
- Recent bookings.
- Book appointment button.

#### Services Page

Display:

- Available clinic services.
- Service name.
- Description.
- Duration.
- Price.
- Book now action.
- Active/inactive availability where appropriate.

#### Appointment Booking Page

Display:

- Service selection.
- Provider selection if applicable.
- Date picker.
- Available time slots.
- Booking reason.
- Confirmation summary.
- Submit booking button.

The appointment workflow should be divided into clear steps.

#### My Appointments Page

Display:

- Appointment reference.
- Service.
- Provider.
- Appointment date.
- Appointment time.
- Booking status.
- View details action.
- Reschedule action where permitted.
- Cancel action where permitted.

Provide filters:

- All
- Upcoming
- Pending
- Confirmed
- Completed
- Cancelled

#### Booking History Page

Display:

- Previous appointments.
- Status changes.
- Rescheduling information.
- Cancellation information.
- Appointment dates.

#### Profile Page

Display:

- Full name.
- Email.
- Phone.
- Profile information.
- Update profile action.

### 6.3 Admin Pages

#### Admin Dashboard

Display:

- Total bookings.
- Today's bookings.
- Pending bookings.
- Confirmed bookings.
- Completed bookings.
- Cancelled bookings.
- Recent appointments.
- Upcoming appointments.

#### Service Management

Display:

- Service list.
- Add service.
- Edit service.
- Activate/deactivate service.
- Service duration.
- Service price.

#### Provider Management

Display:

- Provider list.
- Add provider.
- Edit provider.
- Specialization.
- Active/inactive status.

#### Availability Management

Display:

- Calendar view.
- Provider selection.
- Service selection.
- Available dates.
- Time slots.
- Slot capacity.
- Create and update slots.
- Deactivate slots.

#### Appointment Management

Display:

- All bookings.
- Customer information.
- Service details.
- Provider details.
- Appointment date and time.
- Booking status.
- Search and filters.
- Booking detail view.
- Status update actions.

---

## 7. Reusable Component Design System

Create reusable UI components inside:

```text
frontend/src/components/
```

### 7.1 Buttons

Required variants:

- Primary
- Secondary
- Outline
- Ghost
- Danger
- Disabled

Button requirements:

- Consistent height.
- Rounded corners.
- Clear hover states.
- Visible focus states.
- Loading state when submitting.
- Disabled state when an action is unavailable.

### 7.2 Input Fields

Requirements:

- Consistent height.
- Clear labels.
- Helpful placeholders.
- Validation messages.
- Error borders.
- Focus states.
- Disabled states.
- Accessible label associations.

### 7.3 Cards

Use cards for:

- Dashboard statistics.
- Service information.
- Appointment details.
- Provider profiles.
- Information summaries.

Card style:

- White background.
- Subtle border.
- Rounded corners.
- Soft shadow where appropriate.
- Consistent internal spacing.

### 7.4 Badges

Use status badges for:

- Pending.
- Confirmed.
- Completed.
- Cancelled.
- Active.
- Inactive.

Badges must use consistent colors and readable contrast.

### 7.5 Tables

Tables should support:

- Clear column headings.
- Consistent row spacing.
- Hover states.
- Empty states.
- Loading states.
- Responsive behavior.
- Pagination when necessary.

### 7.6 Modals and Dialogs

Use modals for:

- Confirming cancellations.
- Confirming destructive actions.
- Viewing appointment details.
- Editing records where appropriate.

Important destructive actions must require confirmation.

### 7.7 Feedback Components

Create reusable components for:

- Loading spinner.
- Skeleton loader.
- Empty state.
- Error message.
- Success notification.
- Confirmation dialog.

Avoid browser alert() and confirm() for normal application interactions.

---

## 8. Appointment Calendar Design

The calendar is one of the most important parts of the application.

### Requirements

- Display available appointment dates.
- Allow customers to select dates.
- Display available time slots.
- Clearly distinguish unavailable slots.
- Show selected slots visually.
- Display appointment duration.
- Support responsive layouts.

### Time Slot States

| State | Visual Treatment |
|---|---|
| Available | Light blue background |
| Selected | Strong primary blue |
| Unavailable | Grey and disabled |
| Booked | Neutral or unavailable style |
| Loading | Skeleton or placeholder |

The frontend must retrieve availability from the backend.

Never assume a slot is available based only on its appearance in the UI.

Always revalidate availability on the backend during booking submission.

---

## 9. Forms and Validation Design

Use React Hook Form and Zod for frontend form management and validation.

Use Pydantic for backend validation.

### Form Requirements

- Display labels for every input.
- Mark required fields.
- Show validation messages near fields.
- Prevent duplicate submissions.
- Show loading states.
- Preserve valid input when an API request fails.
- Display clear success and failure feedback.

### Registration Validation

- Name is required.
- Email must be valid.
- Password must meet security requirements.
- Confirm password must match.
- Phone number must follow the configured format.

### Booking Validation

- Service is required.
- Provider is required when applicable.
- Date is required.
- Time slot is required.
- Booking reason follows configured length limits.
- The selected slot must be available.

Backend validation is mandatory even when frontend validation succeeds.

---

## 10. Responsive Design Requirements

The application must work across:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Use Tailwind CSS responsive utilities.

Suggested breakpoints:

| Breakpoint | Minimum Width | Design |
|---|---|---|
| sm | 640px | Large mobile |
| md | 768px | Tablet |
| lg | 1024px | Small desktop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

### Responsive Rules

Desktop:

- Full sidebar.
- Multi-column dashboard.
- Full appointment tables.
- Wide forms where appropriate.

Tablet:

- Collapsible sidebar.
- Two-column cards.
- Flexible forms.
- Compact tables.

Mobile:

- Mobile navigation.
- Single-column content.
- Full-width buttons.
- Stacked form fields.
- Touch-friendly controls.
- Scrollable or card-based appointment lists.

Avoid horizontal overflow.

Do not hide essential functionality on smaller screens.

---

## 11. Accessibility Requirements

Follow WCAG 2.2 AA principles where practical.

Requirements:

1. Use semantic HTML.
2. Provide labels for form controls.
3. Support keyboard navigation.
4. Maintain visible focus indicators.
5. Use sufficient color contrast.
6. Do not communicate status using color alone.
7. Provide accessible names for icon-only buttons.
8. Support screen readers.
9. Provide descriptive validation messages.
10. Manage keyboard focus in modals.
11. Use appropriate heading hierarchy.
12. Make touch targets comfortably usable.
13. Respect reduced-motion preferences.

---

## 12. Loading, Empty and Error States

Every data-driven page must support three important states.

### Loading State

- Use skeleton loaders for cards and tables.
- Prevent confusing repeated submissions.
- Show a loading indicator during API operations.

### Empty State

Examples:

- No appointments available.
- No bookings found.
- No services available.
- No booking history.

Empty states should explain what happened and provide a useful next action where appropriate.

### Error State

- Show clear and user-friendly messages.
- Provide retry options when appropriate.
- Avoid displaying raw server errors.
- Preserve the user's input where possible.

---

## 13. Tailwind CSS Rules

Use Tailwind CSS for the primary styling system.

Requirements:

- Use Tailwind utility classes.
- Use reusable components for repeated patterns.
- Define shared design tokens.
- Avoid unnecessary inline styles.
- Avoid arbitrary colors when tokens exist.
- Maintain consistent spacing.
- Use responsive utilities.
- Keep class names readable.

The AI assistant must use the Tailwind version selected in the project setup and follow that version's configuration conventions.

Do not introduce unnecessary competing styling frameworks.

---

## 14. Iconography

Use Lucide React.

Examples:

- LayoutDashboard
- CalendarDays
- CalendarCheck
- Clock
- Users
- UserRound
- Stethoscope
- ClipboardList
- Settings
- LogOut
- Search
- Bell
- Plus
- Pencil
- Trash2
- CheckCircle
- XCircle

Rules:

- Maintain consistent icon sizes.
- Do not mix unrelated icon libraries.
- Use icons with accessible labels when necessary.
- Do not use decorative icons excessively.

---

## 15. Motion and Interactions

Use subtle animations only where they improve usability.

Examples:

- Button hover transitions.
- Sidebar transitions.
- Modal fade-in.
- Dropdown opening.
- Skeleton loading.
- Toast notifications.

Avoid excessive animations.

Respect prefers-reduced-motion.

---

## 16. Frontend Performance Guidelines

- Use reusable components.
- Avoid unnecessary re-renders.
- Load data only when needed.
- Use pagination for large lists.
- Avoid unnecessary API requests.
- Lazy-load suitable page components.
- Optimize images.
- Avoid large dependencies without a clear need.
- Keep component responsibilities focused.

---

## 17. Design Consistency Rules for AI Assistant

The AI assistant must follow these rules:

1. Read this file before creating or modifying frontend components.
2. Use GoCliniq as the main visual design reference.
3. Follow the defined color palette.
4. Use Inter as the primary font.
5. Maintain the same design language across all pages.
6. Reuse shared components.
7. Follow the responsive design requirements.
8. Never create an unrelated design for an individual page.
9. Avoid excessive gradients and decorative effects.
10. Do not use random colors or arbitrary spacing.
11. Do not create unnecessarily oversized dashboards.
12. Keep appointment information easy to understand.
13. Display booking statuses consistently.
14. Ensure all forms have validation feedback.
15. Include loading, error and empty states.
16. Follow accessibility requirements.
17. Use JavaScript and React only, not TypeScript.
18. Use Tailwind CSS for styling.
19. Use Lucide React for icons.
20. Do not copy GoCliniq branding or proprietary assets.
21. Test designs at desktop, tablet and mobile widths.
22. Do not remove existing working UI features while updating the design.

---

## 18. Design Completion Criteria

The design implementation is considered complete when:

- Login and registration pages are consistent.
- Customer dashboard is implemented.
- Admin dashboard is implemented.
- Appointment booking interface is implemented.
- Calendar and time-slot selection work correctly.
- Booking history is readable and organized.
- Service and provider management interfaces are consistent.
- Shared components are reusable.
- Responsive behavior works on desktop, tablet and mobile.
- Forms provide proper validation feedback.
- Loading, empty and error states are implemented.
- Keyboard navigation and accessibility are considered.
- The overall design follows the GoCliniq-inspired healthcare SaaS direction.

---

**End of design.md**