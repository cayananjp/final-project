# Admin Dashboard - Recipe Stats Update

## What Changed

Updated the Admin Dashboard to **separate user-made recipes from website recipes** and show more detailed statistics.

## New Stats Display

### Before (Old)
- Total Users
- Total Recipes (just showed 60)
- Photo Scans
- Saved Favorites
- Pantry Items
- Pending Recipes

### After (New)
- **Total Users** - Number of registered users
- **Website Recipes** - Built-in recipes (60)
  - Subtitle: "Built-in recipes"
- **User Recipes** - User-uploaded recipes (all statuses)
  - Subtitle: "X approved"
- **Total Recipes** - Website + Approved User Recipes
  - Subtitle: "Website + User"
- **Photo Scans** - Number of ingredient scans
- **Saved Favorites** - Total number of recipe saves
  - Subtitle: "Total saves"
- **Pantry Items** - Total pantry items across all users
- **Pending Recipes** - User recipes awaiting approval
  - Subtitle: "Awaiting approval"

## Stats Breakdown

### Website Recipes
- **Count**: 60 (static)
- **Color**: Emerald (green)
- **Description**: Built-in Filipino recipes from recipes.js

### User Recipes
- **Count**: Total user-uploaded recipes (all statuses)
- **Color**: Teal
- **Subtitle**: Shows how many are approved
- **Description**: Recipes uploaded by users (pending, approved, rejected)

### Total Recipes
- **Count**: Website Recipes (60) + Approved User Recipes
- **Color**: Green
- **Subtitle**: "Website + User"
- **Description**: Total recipes available in the app

### Saved Favorites
- **Count**: Total number of saves across all recipes
- **Color**: Violet
- **Subtitle**: "Total saves"
- **Description**: How many times users have favorited recipes

## Example Display

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ WEBSITE RECIPES     │  │ USER RECIPES        │  │ TOTAL RECIPES       │
│ 🍳 60               │  │ 🍳 15               │  │ 🍳 72               │
│ Built-in recipes    │  │ 12 approved         │  │ Website + User      │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ SAVED FAVORITES     │  │ PENDING RECIPES     │  │ PHOTO SCANS         │
│ ⭐ 234              │  │ ⏳ 3                │  │ 📷 45               │
│ Total saves         │  │ Awaiting approval   │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## Database Queries

### Website Recipes
```javascript
// Static count
websiteRecipes: 60
```

### User Recipes (All)
```javascript
const { count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .eq('is_user_recipe', true);
```

### Approved User Recipes
```javascript
const { count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('is_user_recipe', true);
```

### Total Recipes
```javascript
totalRecipes: 60 + approvedUserRecipesCount
```

### Saved Favorites
```javascript
const { count } = await supabase
    .from('saved_recipes')
    .select('*', { count: 'exact', head: true });
```

## Benefits

### ✅ Clear Separation
- Admins can see website vs user content
- Easy to track user-generated content growth
- Understand content mix

### ✅ Better Insights
- See how many user recipes are approved
- Track total favorites across platform
- Monitor pending approval queue

### ✅ Professional Display
- Subtitles provide context
- Color-coded for easy scanning
- Organized layout

## Future Enhancements

### Per-Recipe Favorites Count
Could add a "Manage Recipes" tab showing:
- Recipe name
- Creator
- Number of saves
- Status
- Actions

### Top Recipes
Could add a section showing:
- Most favorited recipes
- Most viewed recipes
- Trending recipes

### Recipe Analytics
Could add charts showing:
- Recipe uploads over time
- Favorites over time
- User engagement metrics

## Files Modified

- `src/components/AdminDashboard.js`
  - Updated `fetchStats()` function
  - Added new stat calculations
  - Updated stats display with subtitles
  - Added color coding for different recipe types

## Testing

### Verify Stats
1. Go to Admin Dashboard
2. Check Overview tab
3. Should see 8 stat cards
4. Verify counts are accurate

### Check Calculations
- **Website Recipes**: Should always show 60
- **User Recipes**: Should match total in database
- **Total Recipes**: Should be 60 + approved user recipes
- **Saved Favorites**: Should match saved_recipes table count

## Summary

The Admin Dashboard now provides:
- ✅ Separate counts for website vs user recipes
- ✅ Total favorites count across all recipes
- ✅ Clear subtitles for context
- ✅ Better insights into platform usage
- ✅ Professional, organized display

Admins can now easily track user-generated content and engagement! 🎉
