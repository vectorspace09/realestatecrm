# Overview

PRA Developers CRM is an AI-powered real estate customer relationship management system built with modern web technologies. The application provides comprehensive lead management, property listings, deal tracking, and task management capabilities with integrated AI assistance. It features a Kanban-style pipeline interface, automated lead scoring, property matching, and intelligent follow-up suggestions to streamline real estate operations for PRA Developers.

**DEMO STATUS: READY FOR CLIENT HANDOVER** 
- Database fully seeded with realistic demo data (21 leads, 17 properties, 3 deals)
- All features functional with real data calculations
- Mobile-optimized responsive design
- AI assistant with contextual awareness across all pages
- Authentication via Replit OpenID Connect

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with the following key patterns:

- **UI Framework**: React with TypeScript for type safety and modern development practices
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Theme System**: Custom theme provider supporting light/dark mode with CSS variables

## Backend Architecture
The server follows a REST API pattern built on Express.js:

- **Framework**: Express.js with TypeScript for the REST API server
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: OpenID Connect integration with Replit Auth for secure user management
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **AI Integration**: OpenAI GPT-4o integration for lead scoring, property matching, and automated message generation

## Data Storage Solutions
The application uses PostgreSQL as the primary database with the following schema design:

- **Users Table**: Stores user profiles with team-based organization
- **Leads Table**: Comprehensive lead information including contact details, budget, preferences, and AI scoring
- **Properties Table**: Property listings with detailed specifications, pricing, and status tracking
- **Deals Table**: Transaction management linking leads and properties with commission tracking
- **Tasks Table**: Task management with scheduling and assignment capabilities
- **Activities Table**: Audit trail for all system interactions and AI-generated insights

## Authentication and Authorization
- **Identity Provider**: Replit OpenID Connect for seamless authentication
- **Session Management**: Secure server-side sessions with PostgreSQL persistence
- **Authorization**: Role-based access control with user context validation on all protected endpoints

## AI and Automation Features
- **Lead Scoring**: Automated lead qualification using AI analysis of contact information, budget, and behavior
- **Property Matching**: Intelligent property-to-lead matching based on preferences and requirements
- **Message Generation**: AI-powered email and messaging drafts with tone and context awareness
- **Insights**: Real-time AI analysis for actionable business intelligence

# External Dependencies

## Core Infrastructure
- **Database**: Neon Serverless PostgreSQL for scalable data storage
- **Authentication**: Replit OpenID Connect service for user management
- **AI Services**: OpenAI API (GPT-4o) for intelligent automation features

## Development and Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Full-stack type safety and development tooling
- **ESBuild**: Server-side bundling for production deployment

## Key Libraries and Frameworks
- **Frontend**: React, TanStack Query, Wouter, React Hook Form, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Drizzle ORM, Passport.js for authentication middleware
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **Validation**: Zod for runtime type validation and schema definition
- **UI Components**: Radix UI primitives for accessible component foundations