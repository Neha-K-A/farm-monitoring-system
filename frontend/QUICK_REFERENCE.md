# Frontend Quick Reference Guide

## Quick Start

```bash
# Install
npm install

# Setup .env
VITE_API_URL=http://localhost:5000/api/v1

# Run
npm run dev

# Build
npm run build
```

---

## Common Patterns

### Using Services

```javascript
import farmService from "../../services/farmService.js";

// Get all farms
const farms = await farmService.getFarms();

// Create farm
const newFarm = await farmService.createFarm({
  name: "Farm Name",
  areaSize: 10,
  areaUnit: "acres",
});

// Update farm
const updated = await farmService.updateFarm(farmId, data);

// Delete farm
await farmService.deleteFarm(farmId);
```

### Using Hooks

```javascript
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "../../hooks/useNotification.js";
import { useForm } from "../../hooks/useForm.js";
import useFetch from "../../hooks/useFetch.js";

// Auth hook
const { user, isAuthenticated, login, logout } = useAuth();

// Notification hook
const { success, error, warning, info } = useNotification();

// Form hook
const { values, errors, touched, handleChange, handleSubmit } = useForm(
  initialState,
  onSubmit,
);

// Fetch hook
const { data, loading, error, refetch } = useFetch("/endpoint");
```

### Create a Page Component

```javascript
import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/MainLayout.jsx";
import Card from "../../components/Common/Card.jsx";
import Button from "../../components/Common/Button.jsx";
import Loader from "../../components/Common/Loader.jsx";
import { useNotification } from "../../hooks/useNotification.js";
import featureService from "../../services/featureService.js";

const FeaturePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await featureService.getItems();
      setItems(data || []);
    } catch (err) {
      notifyError("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Feature" activeFeature="feature">
        <Loader />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Feature" activeFeature="feature">
      {/* Your content here */}
    </MainLayout>
  );
};

export default FeaturePage;
```

### Create a Form

```javascript
import { useForm } from "../../hooks/useForm.js";
import Input from "../../components/Common/Input.jsx";
import Button from "../../components/Common/Button.jsx";

const MyForm = () => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm({ email: "", password: "" }, async (values) => {
      await myService.submit(values);
      notification.success("Success!");
    });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        touched={touched.email}
        error={errors.email}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

### Create a Modal Form

```javascript
import Modal from "../../components/Common/Modal.jsx";
import Input from "../../components/Common/Input.jsx";
import Button from "../../components/Common/Button.jsx";

const [showModal, setShowModal] = useState(false);

return (
  <>
    <Button onClick={() => setShowModal(true)}>Open Form</Button>

    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="Form Title"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Input label="Name" {...inputProps} />
        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  </>
);
```

### Handle Notifications

```javascript
const { success, error, warning, info } = useNotification();

// Auto-dismisses after 4 seconds
success("Operation completed!");
error("Something went wrong");
warning("Be careful!");
info("This is informational");

// Custom duration (0 = stay until clicked)
success("Custom message", 6000);
```

### Access Auth Context

```javascript
import { useAuth } from "../../hooks/useAuth.js";

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <p>Hello, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

---

## Component API Reference

### Button

```jsx
<Button
  variant="primary" // primary, secondary, danger, ghost
  size="md" // sm, md, lg
  loading={false}
  disabled={false}
  onClick={handler}
>
  Click Me
</Button>
```

### Input

```jsx
<Input
  label="Field Name"
  name="fieldName"
  type="text"
  placeholder="..."
  value={value}
  onChange={handler}
  onBlur={handler}
  touched={false}
  error="Error message"
  required={true}
/>
```

### Select

```jsx
<Select
  label="Choose Option"
  name="option"
  value={value}
  onChange={handler}
  options={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ]}
  required={true}
/>
```

### Textarea

```jsx
<Textarea
  label="Comments"
  name="comments"
  value={value}
  onChange={handler}
  rows={4}
  placeholder="..."
  error="Error"
  required={true}
/>
```

### Card

```jsx
<Card className="additional-classes">Content goes here</Card>
```

### Modal

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="md" // sm, md, lg, xl
  footer={<footer />} // Optional footer
>
  Content
</Modal>
```

### Badge

```jsx
<Badge
  variant="primary" // default, primary, success, warning, danger, info
  size="md" // sm, md, lg
>
  Label
</Badge>
```

### Loader

```jsx
<Loader size={32} className="..." />;

{
  /* Skeleton loader */
}
<SkeletonLoader count={3} className="..." />;
```

### EmptyState

```jsx
import { Inbox } from "lucide-react";

<EmptyState
  icon={Inbox}
  title="No Items"
  description="Start by creating your first item"
  action={<Button>Create Item</Button>}
/>;
```

---

## Environment Variables

```env
# Required
VITE_API_URL=http://localhost:5000/api/v1

# Optional (for future use)
VITE_LOG_LEVEL=debug
```

---

## File Naming Conventions

- Components: PascalCase (.jsx)
- Hooks: useXxx.js
- Services: xxxService.js
- Utils: descriptive.js
- Constants: CONSTANT_NAME
- Folders: camelCase

---

## API Error Handling

```javascript
try {
  const data = await service.method();
} catch (err) {
  // err.response.status - HTTP status code
  // err.response.data.message - Error message from API
  // err.message - Error message from axios
  const errorMsg = err.response?.data?.message || "Operation failed";
  notifyError(errorMsg);
}
```

---

## Common Status Codes

```javascript
200; // OK
201; // Created
400; // Bad Request (validation error)
401; // Unauthorized (login required)
403; // Forbidden (no permission)
404; // Not Found
409; // Conflict (duplicate)
500; // Server Error
```

---

## Testing a Page

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Login with test credentials
4. Navigate to page via sidebar
5. Test CRUD operations
6. Check browser console for errors
7. Check Network tab for API calls

---

## Debugging

```javascript
// Log component state
console.log("Current user:", user);

// Check localStorage
localStorage.getItem("APP_USER");
localStorage.getItem("APP_ACCESS_TOKEN");

// Monitor API calls
// Open DevTools > Network tab
// Filter by XHR/Fetch

// React DevTools
// Chrome Extensions > React Developer Tools
```

---

## Common Issues & Solutions

### Token not persisting

- Check localStorage.js import
- Verify VITE_API_URL in .env
- Clear browser cache

### API 401 Unauthorized

- Token expired - auto-refresh should handle
- If refresh fails, user redirected to login
- Clear localStorage and try login again

### Form not submitting

- Check all required fields filled
- Verify onChange handlers bound correctly
- Check browser console for errors

### Page blank after login

- Check Dashboard component loads
- Verify API response structure
- Check MainLayout component

### Sidebar not expanding

- Hover over sidebar to trigger expand
- Check Sidebar.jsx mouseEnter/Leave handlers
- Mobile: sidebar might be minimized

---

## Performance Tips

1. Use `useFetch` hook for simple GET requests
2. Memoize expensive components (React.memo)
3. Split large pages into smaller components
4. Lazy load images
5. Use `key` prop in lists
6. Avoid inline functions in JSX

---

## Accessibility

- Use semantic HTML (button, form, etc)
- Add labels to form inputs
- Use `alt` text for images
- Ensure color contrast >= 4.5:1
- Keyboard navigation support (Tab, Enter, Escape)
- ARIA attributes for complex components

---

## Resources

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Axios Docs](https://axios-http.com)
- [Lucide Icons](https://lucide.dev)

---

## Support Contacts

- Backend Issues: Check backend README
- API Integration: Check services/ folder
- UI Issues: Check components/ folder
- Auth Issues: Check AuthContext.jsx
