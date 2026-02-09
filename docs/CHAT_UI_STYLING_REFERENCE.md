# Chat Page UI Styling Reference

**Recorded:** For reverting changes after future pushes (e.g. extra padding, box shadow, lighter bot colors).

---

## Message Container (ChatMessage wrapper)

- **Outer wrapper:** `flex flex-col py-3 px-8 animate-fade-in-up`
- **Max width:** `max-w-3xl`
- **Layout:** `flex items-start gap-3` (avatar + content)

---

## Avatars

### User avatar
- **Size:** `w-6 h-6`
- **Styling:** `rounded-full object-cover border border-gray-200`
- **Fallback (no photo):** `w-6 h-6 rounded-full bg-gray-200 border border-gray-200`
- **Fallback icon:** `w-4 h-4 text-gray-400`

### Bot avatar (StaticSphere)
- **Size:** `w-8 h-8` container, canvas 32x32
- **Styling:** `rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`

---

## Message Bubbles

### User message
- **Background:** `bg-white`
- **Border:** `border border-gray-200`
- **Shape:** `rounded-2xl px-4 py-3`
- **Text:** `text-sm leading-relaxed text-gray-900`
- **No box shadow**

### Bot message
- **Background:** `bg-gradient-to-br from-orange-50 to-orange-100/50`
- **Border:** `border border-orange-200/50`
- **Shape:** `rounded-2xl px-4 py-3`
- **Text:** `text-sm leading-relaxed text-gray-800`
- **No box shadow**

---

## Loading state (bot)
- **Text:** `text-sm text-gray-500`
- **Dots:** `w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce`
- **Label:** "Thinking..."

---

## Action buttons (below bot messages)
- **Container:** `flex items-center gap-2 mt-2 px-1`
- **Thumbs up (active):** `text-[#FF8C00] bg-orange-100`
- **Thumbs down (active):** `text-red-500 bg-red-50`
- **Inactive:** `text-gray-400 hover:text-gray-600 hover:bg-gray-100`
- **Copy:** `px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg`

---

## Chat Area Layout (ChatContent)

- **Messages container:** `max-w-3xl mx-auto py-4 px-8 w-full pb-40`
- **Content area:** `flex-1 overflow-y-auto` on `bg-white`
- **Input wrapper:** `absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100`

---

## ToolResultBlock (Infographic)

- **Container:** `rounded-lg border border-[var(--glass-border)] bg-[var(--surface)]`
- **No extra box shadow on main container**

---

## ToolResultBlock (Content Writer)

- **Container:** `rounded-lg border border-emerald-200 bg-emerald-50/50`
- **Header:** `p-3 border-b border-emerald-200`

---

## Key values to preserve

| Element | Property | Current Value |
|---------|----------|---------------|
| User bubble | background | `bg-white` |
| User bubble | border | `border border-gray-200` |
| User bubble | padding | `px-4 py-3` |
| User bubble | text | `text-sm text-gray-900` |
| Bot bubble | background | `bg-gradient-to-br from-orange-50 to-orange-100/50` |
| Bot bubble | border | `border border-orange-200/50` |
| Bot bubble | text | `text-sm text-gray-800` |
| Message row | padding | `py-3 px-8` |
| Message row | gap | `gap-3` |
| Message bubble | border radius | `rounded-2xl` |
| Box shadow | message bubbles | **None** |
