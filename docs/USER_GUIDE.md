# ZeroCode User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Visual Editor](#visual-editor)
3. [Data Modeling](#data-modeling)
4. [Workflow Builder](#workflow-builder)
5. [AI Features](#ai-features)
6. [Code Generation](#code-generation)
7. [Deployment](#deployment)

## Getting Started

### Creating a New Project

1. Click **"New Project"** button
2. Enter project name and description
3. Select target framework (Next.js, Vite React, etc.)
4. Click **"Create"**

### Interface Overview

```
┌────────────────────────────────────────────────────────────┐
│  Toolbar: [Undo] [Redo] [Save] | [Design] [Data] [Code]   │
├──────────┬──────────────────────────────────┬──────────────┤
│          │                                  │              │
│ Component│        Canvas Area               │  Properties  │
│ Palette  │    (Drag & Drop Here)            │    Panel     │
│          │                                  │              │
│  [Button]│   ┌────────────────────┐        │ Name: Button │
│  [Input] │   │  Your Design       │        │ Text: Click  │
│  [Text]  │   │                    │        │ Color: Blue  │
│          │   └────────────────────┘        │              │
└──────────┴──────────────────────────────────┴──────────────┘
```

## Visual Editor

### Adding Components

1. **From Palette**: Drag components from left panel to canvas
2. **Keyboard Shortcut**: Press `A` to open quick add menu

### Editing Components

1. **Select**: Click on any component
2. **Properties**: Edit in right panel
3. **Styles**: Modify CSS classes or custom styles
4. **Events**: Attach click handlers, form submissions

### Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Ctrl/Cmd + C`: Copy component
- `Ctrl/Cmd + V`: Paste component
- `Ctrl/Cmd + D`: Duplicate component
- `Delete`: Remove component
- `Ctrl/Cmd + S`: Save project

### Layout System

ZeroCode uses Flexbox and Grid:

```typescript
// Flexbox Container
{
  className: "flex flex-col gap-4 p-4"
}

// Grid Container
{
  className: "grid grid-cols-3 gap-4"
}
```

## Data Modeling

### Creating a Data Model

1. Switch to **Data** tab
2. Click **"Add Entity"**
3. Define fields:
   - **Name**: Field name (camelCase)
   - **Type**: String, Number, Boolean, Date, etc.
   - **Required**: Is field required?
   - **Unique**: Unique constraint
   - **Default**: Default value

### Example: Blog Post Model

```
Entity: Post
├─ id: String (ID, Auto)
├─ title: String (Required)
├─ content: String (Required)
├─ published: Boolean (Default: false)
├─ authorId: String (Relation: User)
└─ createdAt: Date (Auto)
```

### Relationships

- **One-to-Many**: User has many Posts
- **Many-to-Many**: Post has many Tags
- **One-to-One**: User has one Profile

### Generated API Routes

ZeroCode automatically generates:

```typescript
GET    /api/posts       // List all
GET    /api/posts/:id   // Get one
POST   /api/posts       // Create
PATCH  /api/posts/:id   // Update
DELETE /api/posts/:id   // Delete
```

## Workflow Builder

### Creating a Workflow

1. Switch to **Workflow** tab
2. Add nodes from palette
3. Connect nodes with edges
4. Configure each node

### Node Types

#### Trigger Node
- `onMount`: Component mounted
- `onClick`: Button clicked
- `onSubmit`: Form submitted

#### Condition Node
```javascript
// Example condition
email !== '' && password.length >= 8
```

#### API Call Node
```typescript
{
  url: '/api/users',
  method: 'POST',
  body: { email, password }
}
```

#### Loop Node
```typescript
// Iterate over array
items.forEach(item => {
  // Process item
})
```

#### Custom Code Node
```typescript
// Custom TypeScript code
const result = await customFunction(data);
return result;
```

## AI Features

### Generate Component from Description

**Prompt Examples:**

```
"Create a login form with email and password fields"
"Build a card component with image, title, and description"
"Make a responsive navigation bar with dropdown menus"
```

**Using the API:**

```typescript
const response = await fetch('/api/ai/generate-component', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a pricing card component'
  })
});

const { code } = await response.json();
```

### Code Review

Get AI-powered suggestions:

```typescript
const review = await fetch('/api/ai/review-code', {
  method: 'POST',
  body: JSON.stringify({ code: myComponent })
}).then(r => r.json());

console.log(review.issues);    // List of issues
console.log(review.score);     // Quality score (0-100)
console.log(review.summary);   // Overall summary
```

### Debug Errors

```typescript
const fix = await fetch('/api/ai/debug-code', {
  method: 'POST',
  body: JSON.stringify({
    code: buggyCode,
    error: errorMessage
  })
}).then(r => r.json());

console.log(fix.explanation);
console.log(fix.fixedCode);
```

### Optimize Performance

```typescript
const optimized = await fetch('/api/ai/optimize-code', {
  method: 'POST',
  body: JSON.stringify({ code: slowComponent })
}).then(r => r.json());
```

### Check Accessibility

```typescript
const a11y = await fetch('/api/ai/check-accessibility', {
  method: 'POST',
  body: JSON.stringify({ code: myComponent })
}).then(r => r.json());

console.log(a11y.issues);     // WCAG violations
console.log(a11y.score);      // Accessibility score
```

## Code Generation

### Export Options

1. **Download ZIP**: Complete project files
2. **Copy to Clipboard**: Generated code
3. **Push to GitHub**: Direct repository push
4. **Deploy**: One-click deployment

### Generated Structure (Next.js)

```
my-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── users/
│           └── route.ts
├── components/
│   └── (auto-generated)
├── lib/
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### Customization

All generated code is:
- ✅ Fully editable
- ✅ ESLint + Prettier formatted
- ✅ TypeScript typed
- ✅ Production-ready
- ✅ Documented

## Deployment

### Vercel

1. Click **"Deploy"** → **"Vercel"**
2. Authenticate with Vercel
3. Select repository
4. Configure environment variables
5. Deploy

### Netlify

Similar to Vercel:
1. Choose **"Netlify"** as target
2. Follow authentication flow
3. Deploy

### Self-Hosted (Docker)

```bash
# Build
docker build -t my-app .

# Run
docker run -p 3000:3000 my-app
```

### Environment Variables

Required variables for deployment:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://yourdomain.com
```

## Best Practices

### Component Organization

- **Atomic Design**: Button → Form → Page
- **Reusability**: Create reusable components
- **Naming**: Use descriptive names

### Performance

- **Lazy Loading**: Use for large components
- **Memoization**: Prevent unnecessary re-renders
- **Code Splitting**: Automatic in Next.js

### Accessibility

- Always include `alt` text for images
- Use semantic HTML
- Ensure keyboard navigation
- Maintain sufficient color contrast

### Security

- Validate all user inputs
- Sanitize data before rendering
- Use environment variables for secrets
- Enable HTTPS in production

## Troubleshooting

### Component Not Rendering

1. Check console for errors
2. Verify props are correctly passed
3. Ensure parent container has proper layout

### Code Generation Fails

1. Check all components have valid props
2. Verify data models are complete
3. Review validation errors in output

### AI Features Not Working

1. Ensure Ollama is running
2. Check models are downloaded
3. Verify network connectivity

### Deployment Issues

1. Check environment variables
2. Review build logs
3. Ensure all dependencies are installed

## Support

Need help?

- 📖 **Documentation**: https://docs.zerocode.dev
- 💬 **Discord**: https://discord.gg/zerocode
- 📧 **Email**: support@zerocode.dev
- 🐛 **Issues**: https://github.com/yourusername/zerocode/issues
