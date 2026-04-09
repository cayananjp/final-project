# Bugfix Requirements Document

## Introduction

This document outlines the bugs and UI inconsistencies found in the SavorSense recipe application. The primary issues include:
- **Icon Rendering Bugs**: Lucide React icons are being rendered as string literals instead of actual icon components
- **UI Inconsistencies**: Inconsistent spacing, button styles, and design patterns across components
- **Emoji Usage**: Hardcoded emojis mixed with icon components creating visual inconsistency
- **Typography Issues**: Inconsistent font sizes, weights, and text styling

These bugs affect the visual presentation and user experience across all major components of the application.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN Lucide React icons are used in JSX string templates (e.g., `'<Star className="w-4 h-4 inline-block" />'`) THEN the system renders them as literal text strings instead of icon components

1.2 WHEN users view the AdminDashboard component THEN the system displays icon strings like `<BarChart className="w-6 h-6 inline-block" />` as text instead of rendering the actual icons

1.3 WHEN users view the Profile component achievement badges THEN the system displays mixed emoji and icon string literals (e.g., `'<Star className="w-4 h-4 inline-block" /> First Favorite'`) instead of consistent icon components

1.4 WHEN users view toast notifications THEN the system displays icon strings like `<CheckCircle className="w-5 h-5 inline-block text-green-600" />` as text instead of rendering icons

1.5 WHEN users view the RecipeTemplate component THEN the system displays icon strings in ingredient labels like `<Droplet className="w-4 h-4 inline-block" /> For Marinating` as text

1.6 WHEN users view the UploadRecipe component THEN the system displays icon strings in labels like `<Camera className="w-6 h-6 inline-block" /> Main Recipe Photo` as text

1.7 WHEN users view the Marketplace component THEN the system displays icon strings in status badges like `<CheckCircle className="w-5 h-5 inline-block text-green-600" /> Owned` as text

1.8 WHEN users view the Home component THEN the system displays star rating emojis (⭐) mixed with Lucide icon components creating visual inconsistency

1.9 WHEN users view button styles across different components THEN the system displays inconsistent padding, border-radius, and hover states (e.g., some buttons use `rounded-[20px]`, others use `rounded-xl`, `rounded-lg`, or `rounded-[10px]`)

1.10 WHEN users view text elements across components THEN the system displays inconsistent font sizes (mixing `text-[0.9rem]`, `text-sm`, `text-[0.85rem]`, `text-xs`)

1.11 WHEN users view the AdminDashboard menu items THEN the system displays emoji icons mixed with Lucide icon components (e.g., '🍲' for "Manage Recipes")

1.12 WHEN users view the Profile component wallet section THEN the system displays icon strings like `<Wallet className="w-5 h-5 inline-block" />` as text instead of rendering the icon

### Expected Behavior (Correct)

2.1 WHEN Lucide React icons are used in JSX THEN the system SHALL render them as actual React components with proper JSX syntax (e.g., `<Star className="w-4 h-4 inline-block" />`)

2.2 WHEN users view the AdminDashboard component THEN the system SHALL display properly rendered Lucide icon components for all menu items and status indicators

2.3 WHEN users view the Profile component achievement badges THEN the system SHALL display consistent Lucide icon components for all badges without string literals

2.4 WHEN users view toast notifications THEN the system SHALL display properly rendered icon components inline with the notification text

2.5 WHEN users view the RecipeTemplate component THEN the system SHALL display properly rendered icon components in all ingredient labels and section headers

2.6 WHEN users view the UploadRecipe component THEN the system SHALL display properly rendered icon components in all form labels and buttons

2.7 WHEN users view the Marketplace component THEN the system SHALL display properly rendered icon components in all status badges and transaction indicators

2.8 WHEN users view the Home component THEN the system SHALL display consistent icon components for ratings instead of emoji characters

2.9 WHEN users view button styles across different components THEN the system SHALL display consistent border-radius values (standardized to `rounded-xl` for primary buttons, `rounded-lg` for secondary buttons)

2.10 WHEN users view text elements across components THEN the system SHALL display consistent font sizes using Tailwind's standard scale (`text-xs`, `text-sm`, `text-base`, `text-lg`, etc.)

2.11 WHEN users view the AdminDashboard menu items THEN the system SHALL display consistent Lucide icon components for all menu items

2.12 WHEN users view the Profile component wallet section THEN the system SHALL display properly rendered Wallet icon component

### Unchanged Behavior (Regression Prevention)

3.1 WHEN users interact with functional features (login, signup, recipe viewing, pantry management) THEN the system SHALL CONTINUE TO function correctly with all existing business logic intact

3.2 WHEN users navigate between pages THEN the system SHALL CONTINUE TO maintain proper routing and state management

3.3 WHEN users upload recipes or images THEN the system SHALL CONTINUE TO handle file uploads correctly

3.4 WHEN users make purchases in the marketplace THEN the system SHALL CONTINUE TO process transactions correctly

3.5 WHEN users save recipes to favorites THEN the system SHALL CONTINUE TO persist data correctly in Supabase

3.6 WHEN users use the pantry scanner THEN the system SHALL CONTINUE TO process images and detect ingredients correctly

3.7 WHEN users use the audio assistant in RecipeTemplate THEN the system SHALL CONTINUE TO provide text-to-speech functionality

3.8 WHEN users view responsive layouts on mobile devices THEN the system SHALL CONTINUE TO display mobile-optimized layouts correctly

3.9 WHEN admin users access the AdminDashboard THEN the system SHALL CONTINUE TO enforce role-based access control

3.10 WHEN users interact with forms (login, signup, upload recipe) THEN the system SHALL CONTINUE TO validate inputs and display error messages correctly
