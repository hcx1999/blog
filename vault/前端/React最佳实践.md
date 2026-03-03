# React 组件设计最佳实践

## 组件拆分原则

### 单一职责原则

每个组件应该只做一件事，并且把它做好。

```jsx
// 不好的做法
function UserProfile({ user, posts, comments }) {
  return (
    <div>
      <UserInfo user={user} />
      <UserPosts posts={posts} />
      <UserComments comments={comments} />
    </div>
  );
}

// 好的做法
function UserProfile({ user }) {
  return (
    <div>
      <UserInfo user={user} />
      <UserActivity userId={user.id} />
    </div>
  );
}
```

## Props 设计

### 使用 TypeScript 定义 Props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

## 总结

良好的组件设计是构建可维护 React 应用的基础。
