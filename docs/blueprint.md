# **App Name**: Diwan Al Arab

## Core Features:

- User Authentication: Enable users to create and manage their accounts with secure password hashing and session management.
- Poem Management (CRUD): Allow users to create, read, update, and delete Arabic poems, including fields for title, verses (sadr and ajz), and tags.
- Frontend Display and Management: Implement a user-friendly display of Arabic poems, ensuring proper RTL text rendering and responsive design using Tailwind CSS. Implement pagination, sorting, and filtering options.

## Style Guidelines:

- Primary color: Desert Sand (#EDC9AF) for a warm, traditional feel.
- Secondary color: Deep Teal (#005F6B) to provide a contrasting, calming effect.
- Accent: Gold (#FFD700) for highlighting important elements and creating a sense of luxury.
- Ensure all Arabic text is displayed correctly with proper right-to-left rendering.
- Design a responsive layout that adapts to different screen sizes, ensuring readability and usability on all devices.
- Justify the Arabic verses when displaying them to maintain their traditional appearance.

## Original User Request:
I want to create a full-stack web application for Arabic poetry enthusiasts to log, share, and discover Arabic poems, with a strong emphasis on accurately capturing and displaying the nuances of classical Arabic poetry.  Generate a complete Next.js application using Tailwind CSS for styling and Prisma for database management.

The application should have the following features:

User Authentication:

Implement user sign-up and sign-in functionality.

Allow users to create accounts with a username and password.

Securely store user credentials (passwords should be hashed).

Implement session management to keep users logged in.

Poem Management (CRUD):

Create:

Allow users to submit new poems.

The creation form must include fields for:

Title of the poem (in Arabic).

Poem Verses: A list of verse objects, where each verse has a sadr (صدر) and an ajz (عجز).  The user should be able to add and remove verses dynamically.

Tags/keywords (in Arabic) to categorize the poem.

The create form should function as the  `CreateQasida` component provided

Read:

Display poems in a user-friendly format, respecting Arabic text direction (RTL).

Implement pagination for displaying large numbers of poems.

Implement sorting options (e.g., by date, author, meter).

Implement filtering options (e.g., by author, meter, tags).

Display poem metadata (title, author, date, meter, tags).

Update:

Allow users to edit their own poems, including the verses and tags.

Preserve original creation date and show last updated date.

Delete:

Allow users to delete their own poems.

Database:

Use Prisma to define the database schema and interact with the database.

The schema must include the following models:

model Poem {
  id          String    @id @default(cuid())
  title       String
  content     String?
  verses      Verse[]
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @updatedAt()
  published   Boolean   @default(false)
  tags        String[]
}

model Verse {
  id          String    @id @default(cuid())
  sadr        String    // صدر البيت
  ajz         String    // عجز البيت
  order       Int       // ترتيب البيت في القصيدة
  poem        Poem      @relation(fields: [poemId], references: [id], onDelete: Cascade)
  poemId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  // @@unique([poemId, order]) // لضمان عدم تكرار الترتيب في نفس القصيدة
}

model User {
  id          String    @id @default(cuid())
  username    String    @unique
  password    String
  email       String?   @unique
  name        String?
  poems       Poem[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

Frontend:

Use Next.js for the frontend framework.

Use Tailwind CSS for styling, ensuring a clean, responsive, and aesthetically pleasing design that is appropriate for Arabic content.

Create components for:

Sign-up form.

Sign-in form.

Poem submission form (matching the structure and functionality of the provided CreateQasida component).

Poem display (single poem).

Poem list (with sorting/filtering).

Navigation/layout.

Implement routing for different pages (e.g., home, poems, users, profile).

Manage application state effectively (e.g., using React Context).

Handle Arabic text correctly in all components, ensuring proper rendering and display.

User Profile (Optional):

Display a user's profile page, showing their poems and information.

Search (Optional):

Implement a search feature to find poems by title, author, or keywords.

Styling:

Use Tailwind CSS to create a visually appealing and user-friendly interface.

Ensure the design is responsive and works well on different screen sizes.

Pay close attention to typography and layout to ensure the clear and accurate display of Arabic text. The font choice is critical for readability.

Deployment:

Provide instructions on how to deploy the application.
  