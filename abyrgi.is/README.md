# Abyrgi.is - Driving Service App

This is a [Next.js](https://nextjs.org) project for a driving service application that helps users get drivers to drive their cars safely to destinations.

## Features

- **User Authentication**: Complete sign-up and sign-in flow using Supabase Auth
- **Email Verification**: Users receive email confirmation after sign-up
- **Redirect Flow**: After sign-up, users are redirected to sign-in with a reminder to check their email
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Getting Started

### Prerequisites

1. Node.js (version 18 or higher)
2. A Supabase project

### Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the Supabase URL and API key with your project values

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication Flow

1. **Sign Up**: New users create an account with email and password
2. **Email Verification**: Supabase sends a confirmation email
3. **Redirect to Sign In**: Users are automatically redirected to the sign-in page with a reminder to check their email
4. **Sign In**: Once email is verified, users can sign in to access the application

## Project Structure

```
src/
├── app/
│   ├── signin/          # Sign-in page
│   ├── signup/          # Sign-up page
│   ├── layout.tsx       # Root layout with AuthProvider
│   └── page.tsx         # Homepage
├── context/
│   └── AuthContext.tsx  # Authentication context and provider
└── utils/
    └── supabase.ts      # Supabase client configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend and authentication
- **React Context** - State management

## Contributing

This project follows the user stories and wireframes defined in the main README.md file.
