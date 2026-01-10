import { Conversation, Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I assist you today?',
    role: 'assistant',
    timestamp: new Date('2025-12-18T10:00:00'),
  },
  {
    id: '2',
    content: 'I need help understanding React hooks.',
    role: 'user',
    timestamp: new Date('2025-12-18T10:01:00'),
  },
  {
    id: '3',
    content: 'I\'d be happy to help you understand React hooks! React hooks are functions that let you "hook into" React state and lifecycle features from function components. The most commonly used hooks are:\n\n1. **useState** - Manages state in functional components\n2. **useEffect** - Handles side effects like data fetching\n3. **useContext** - Accesses context values\n4. **useRef** - Creates mutable references\n\nWould you like me to explain any specific hook in more detail?',
    role: 'assistant',
    timestamp: new Date('2025-12-18T10:01:30'),
  },
  {
    id: '4',
    content: 'Yes, can you explain useState with an example?',
    role: 'user',
    timestamp: new Date('2025-12-18T10:02:00'),
  },
  {
    id: '5',
    content: 'Certainly! Here\'s a simple example of useState:\n\n```jsx\nimport { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n```\n\nIn this example:\n- `useState(0)` initializes the state with a value of 0\n- `count` is the current state value\n- `setCount` is the function to update the state\n- Clicking the button increments the count\n\nEach time you call `setCount`, React re-renders the component with the new value.',
    role: 'assistant',
    timestamp: new Date('2025-12-18T10:02:30'),
  },
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'React Hooks Tutorial',
    messages: mockMessages,
    createdAt: new Date('2025-12-18T10:00:00'),
    updatedAt: new Date('2025-12-18T10:02:30'),
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    messages: [
      {
        id: 'msg-1',
        content: 'What are TypeScript best practices?',
        role: 'user',
        timestamp: new Date('2025-12-17T14:00:00'),
      },
      {
        id: 'msg-2',
        content: 'Here are some key TypeScript best practices:\n\n1. Use strict mode\n2. Avoid using `any` type\n3. Use interfaces for object shapes\n4. Leverage type inference\n5. Use union types instead of enums when appropriate',
        role: 'assistant',
        timestamp: new Date('2025-12-17T14:00:30'),
      },
    ],
    createdAt: new Date('2025-12-17T14:00:00'),
    updatedAt: new Date('2025-12-17T14:00:30'),
  },
  {
    id: '3',
    title: 'Next.js App Router',
    messages: [
      {
        id: 'msg-1',
        content: 'How does Next.js App Router work?',
        role: 'user',
        timestamp: new Date('2025-12-16T09:00:00'),
      },
      {
        id: 'msg-2',
        content: 'The Next.js App Router is a new paradigm for building applications using React\'s latest features. It uses a file-system based router built on Server Components and supports layouts, nested routing, loading states, error handling, and more.',
        role: 'assistant',
        timestamp: new Date('2025-12-16T09:00:30'),
      },
    ],
    createdAt: new Date('2025-12-16T09:00:00'),
    updatedAt: new Date('2025-12-16T09:00:30'),
  },
  {
    id: '4',
    title: 'CSS Grid vs Flexbox',
    messages: [
      {
        id: 'msg-1',
        content: 'When should I use CSS Grid vs Flexbox?',
        role: 'user',
        timestamp: new Date('2025-12-15T16:30:00'),
      },
    ],
    createdAt: new Date('2025-12-15T16:30:00'),
    updatedAt: new Date('2025-12-15T16:30:00'),
  },
];
