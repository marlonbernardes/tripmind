# 🧭 Tripmind Project Status

## Current Status: **AI Trip Planning Interface Complete - Ready for Overview Page Enhancements**
*Last Updated: November 24, 2025*

### 📍 What We Have
- ✅ Complete project specification (`docs/PLAN.md`)
- ✅ Development blueprint with architecture decisions (`docs/DEVELOPMENT_BLUEPRINT.md`)
- ✅ Repository initialized with documentation
- ✅ Project scope and tech stack defined
- ✅ **Next.js 14 project initialized with TypeScript and App Router**
- ✅ **TailwindCSS and shadcn/ui configured and working**
- ✅ **Core dependencies installed (Zustand, Dexie, Supabase, Mapbox, etc.)**
- ✅ **PWA configuration with next-pwa**
- ✅ **Basic routing structure implemented**
- ✅ **Environment configuration setup**
- ✅ **Development server running successfully**
- ✅ **Functional trip management with trip cards and create modal**
- ✅ **Timeline workspace with day sections and activity cards**
- ✅ **Interactive right panel for activity details**
- ✅ **Responsive design with dark/light mode support**
- ✅ **Mock data for 3 sample trips with realistic activities**
- ✅ **Core user flows working: create trip → view timeline → select activities**
- ✅ **AI Trip Planning Interface (`/plan` page) with sequential chat flow**
- ✅ **Mock trip generation with 10+ realistic activities**
- ✅ **Enhanced activity management with type-specific forms**
- ✅ **Status management with planned/booked indicators**
- ✅ **Inter font family already installed and configured**

### 🚧 Current State
**Overview page (`/trip/[id]/overview`) exists with basic Gantt chart implementation using `gantt-task-react` library.**

The project has a working Gantt chart but needs visual and UX improvements based on user feedback.

---

## 🎯 Next Recommended Tasks

Please read `quiz_context.md` for further context.

Timeline changes
- [x] SVG icons for every row in the page (i.e for flights, notes, hotels, events, transport)
- [x] Change “Config” tab to “Preferences”
- [x] BUG: When you are adding a new activity but then you click to detail (i.e on a row) it doesn’t detail the activity
- [x] Change header “Trips” to “My Trips” and “Plan” to something else (suggest please)
- [ ] Add button to “Delete” a trip. A new modal needs to be shown as this operation is irreversible. It should redirect users to /trips page.
- [ ] When adding an activity, it should use the current context to populate the fields in the add activity screen.
    - For example: 
        - when adding a flight, it should populate the “From” section and “Departure day”. W
        - when adding a hotel it should populate the “City” and the “Check-in day”
        - The same applies for the “Create Stay” / “Create Flight” and potential other buttons that show up in the Suggestion screen. This button should also not show the “What would you like to add?” as the activity type is inferred from the button.
- [x] The “pencil” should be shown next to the trip name in the header and clicking on it should open a modal so the users cna edit the trip name and color. Remove these properties from the “Config”/Preferences tab.
- [ ] Make the add activity more condensed: no need to show labels (they can be shown inside the input). Make the buttons themselves a bit larger and with an icon inside.


/plan changes
- [ ] We need to add a note to the /plan page stating that they can change all details later so its ok if they don’t know or change their mind
- [ ] “When are you traveling?”
    - Get rid of seasons buttons below. Only leave buttons Specific dates and Flexible at the top. Instead when flexible is selected we should show the buttons displayed on the next question “How long is your trip” below (including custom duration). This means that the qiestoon “How long is your trip” should be removed.
- [ ] What interests you?
	The “checkmark” indicating what types are selected effectively  changes the size of the button. Instead, adopt the same checkmark done for the first question” (where you select the citites)


- [ ] No need to show “Review your trip” screen. Instead show a “Loading” screen indicating that the trip is being created. Show progress messages too. Also add a comment to the code responsible for creating a trip from the quiz answers that it needs to use the “What interests you” to determine what event suggestions will be made. No need to implement this, leave it for the backend - only add a comment. Also add new question to quiz related to “How packed the agenda must be” (not sure how to phrase it). This will control the density(i.e max hour gaps that are accepted between events without a suggestion).. Also add a comment about this.
- [ ] Show both “interests” and “pacing” (i.e how packed) in the Preferences tab of the timeline page. Allow editing and persist this into the trip.
- [ ] Remove button “Quick create” from /trips page and related code.


**Future changes to consider (perhaps post MVP)**
- [ ] Identation in rows in timeline page

i.e
```
Dublin (DUB) -> Beijing (PEK)
   Hotel Blabla
      Event X
```

- [ ] Make /trips page look better visually
- [ ] Side panel in timeline page needs to go full height and be resizable
- [ ] Important!! suggestion modal should already show the suggestions - instead of links to booking.com or hotels.com it should already show the recommendations (with pictures) (perhaps post MVP - BUT IMPORTANT DONT FORGET FUTURE MARLON)
- [ ] Show suggestions on Map view
- [ ] Improvement: Show hotel suggestions at the end and flight at the start
- [ ] flights should display pill “arrival” / “departure” in their description and the event time should be either start or end depending if arrival/departure 
- [ ] Add "area" polygon to map to suggest user to search for activities in that area

**Done**
- [x] Ability to delete events.
- [x] Show suggestions in the timeline view
- [x] Save button looks ugly on the edit panel
- [x] Assistant revamp. OR GET RID OF IT FOR MVP. (Removed assistant tab and TripAIChat.tsx)
- [x] /trips page revamp (cards are ugly and partially broken)
- [x] BUG: when deleting all hotels it shows only one suggestion instead of one per city.
- [x] BUG: Add button should always open the add activity panel (where user selects activity type)
- [x] New Transport form
- [x] Delete Task and Note activities types 
- [x] Maybe always show recommendations in forms excpet if they are booked.
- [x] Show moreinfo on trip header (i.e start/end dates). Add pencil to take users to config screen . Consider disabling inline editing now that we have a config screen.
- [x] no longer "view"/"edit" modes - it goes straight to edit
- [x] Make it more condensed
- [x] Make "Save" button never go past the bottom of the screen
- [x] Remove "change type" link". When adding an activity, "Cancel" button should be a "Back" button which does the same. When editing it should still be cancel.
- [x] Header where it says "Edit actiivty" (and where the back/cancel buttons are shown) should be sticky and in a different colour.
- [x] Change text "New activity" to "Add new activity" and remove duplicated text below it. Similarly
- [x] Remove the page /wallet from the navigation. Won't be part of MVP.
- [x] Remove "Offline-first • Auto-sync when online" badge from home page.
- [x] Remove "Delete account" from /settings page.
- [x] Remove settings button from home page
- [x] Remove "Offline sync" from settings page.
- [x] Remove "display name" from settings page
- [x] Redirect users to settings page when they click on their user info on the nav bar.
- [x] Allow trip name to be edited inline (similar to editing a title of a PR in github)
- [x] Fix sub menu navigation on mobile (i.e "Timeline", "Overview" and "Map" buttons should show in one row)
- [x] Map page
- [x] Add support for dark mode. (Fixed: Created ThemeContext, toggle works and persists preference)
- [x] Make overview page more condensed.
- [x] Make timeline page more condensed
- [x] Split "timeline" page into 2. Right half will show recommended actions, AI assistant and is also where the activity details will be edited. I've been thinking something like tabs (in a file cabinet)
- [x] BUG: Need to click on close button twice on the activity panel for it to close. 
- [x] Move "AI assistant" box to tab similar to the details/recommend ones
---
