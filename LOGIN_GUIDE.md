# 🔐 登录测试指南

## ✅ 问题已解决！

之前的 "Database error querying schema" 错误已经修复。原因是 auth.users 表中的某些字段（如 `confirmation_token`）没有正确设置为空字符串而是 NULL。

## 🎯 现在可以登录了！

### 测试账号

使用以下任意账号登录：

| 邮箱 | 密码 | 用户类型 | 积分 |
|------|------|----------|------|
| `alice@example.com` | `password123` | Pro | 100 |
| `bob@example.com` | `password123` | Free | 10 |
| `carol@example.com` | `password123` | Basic | 50 |

### 登录步骤

1. **打开登录页面**
   ```
   http://localhost:3000/auth
   ```

2. **输入测试账号**
   - 邮箱: `alice@example.com`
   - 密码: `password123`

3. **点击"登录"按钮**
   - 应该会自动跳转到 `/dashboard`

4. **查看用户数据**
   - 你可以在 Dashboard 中看到用户的项目和数据

## 🧪 测试场景

### 场景 1: 登录并查看项目

1. 使用 `alice@example.com` 登录
2. Alice 有 2 个项目：
   - 美食探店系列 - 第一集 (TikTok)
   - 健身教程 - 新手入门 (Reels)

### 场景 2: 切换不同用户

1. 登出当前用户
2. 使用 `bob@example.com` 登录
3. Bob 有 1 个项目：
   - 旅行 Vlog - 日本之旅 (Shorts)

### 场景 3: 注册新用户

1. 点击 "Don't have an account? Sign Up"
2. 输入新的邮箱和密码
3. 注册成功后会自动登录
4. 新用户会自动获得 10 个免费积分（free plan）

## 🔍 验证登录状态

### 在浏览器控制台中

打开浏览器开发者工具 (F12)，在 Console 中运行：

```javascript
// 检查当前登录状态
const { data: { session } } = await supabase.auth.getSession();
console.log('当前用户:', session?.user?.email);
```

### 在 Supabase Studio 中

1. 访问 http://127.0.0.1:54323
2. 左侧菜单 → Authentication → Users
3. 查看所有注册用户

## 📊 用户数据关系

登录后，你可以访问：

```typescript
// 获取当前用户信息
const { data: { user } } = await supabase.auth.getUser();

// 获取用户的 profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// 获取用户的所有项目
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id);
```

## 🛡️ 安全特性

### Row Level Security (RLS)

所有表都启用了 RLS，用户只能看到自己的数据：

```sql
-- 用户只能查看自己的项目
SELECT * FROM projects WHERE user_id = auth.uid();

-- 用户只能修改自己的 profile
UPDATE profiles SET total_credits = 50 WHERE id = auth.uid();
```

### 密码加密

所有密码都使用 bcrypt 加密存储，测试密码 `password123` 的加密版本存储在数据库中。

## 🔧 常见问题

### 1. 登录后立即退出

**原因**: Session 没有正确保存

**解决**:
```typescript
// 确保使用 SSR 客户端（如果是服务端渲染）
import { createClient } from '@supabase/ssr';
```

### 2. "Invalid login credentials"

**原因**: 邮箱或密码错误

**解决**:
- 确保使用正确的测试账号
- 密码是 `password123`（全小写）
- 邮箱格式正确

### 3. 无法注册新用户

**原因**: 可能是邮件确认设置

**解决**:
```bash
# 在 supabase/config.toml 中确认
[auth.email]
enable_confirmations = false  # 本地开发不需要邮件确认
```

### 4. 查看注册邮件

如果启用了邮件确认：
- 访问 http://127.0.0.1:54324
- 查看所有测试邮件

## 🎨 自定义认证流程

### 添加 OAuth 登录

在 `supabase/config.toml` 中配置：

```toml
[auth.external.google]
enabled = true
client_id = "your_google_client_id"
secret = "env(GOOGLE_CLIENT_SECRET)"
```

### 自定义邮件模板

```toml
[auth.email.template.invite]
subject = "欢迎加入 MiniEpic"
content_path = "./supabase/templates/invite.html"
```

## 📚 下一步

1. **实现用户 Dashboard**
   - 显示用户信息
   - 列出用户的项目
   - 显示剩余积分

2. **添加权限控制**
   - 根据 subscription_plan 限制功能
   - 实现积分消耗系统

3. **集成 Stripe**
   - 实现付费升级
   - 购买额外积分

## 🚀 快速测试命令

```bash
# 测试登录（命令行）
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'alice@example.com',
    password: 'password123'
  });
  console.log(error ? '❌ ' + error.message : '✅ 登录成功: ' + data.user.email);
})();
"

# 查看所有用户
docker exec supabase_db_miniepic psql -U postgres -c "SELECT email, email_confirmed_at FROM auth.users;"

# 重置测试数据
npm run db:reset
```

---

**🎉 现在你可以正常登录和测试应用了！**

访问 http://localhost:3000/auth 开始测试！


