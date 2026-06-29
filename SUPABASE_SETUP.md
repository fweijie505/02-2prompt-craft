# Supabase 数据库设置指南

> 这一步**必须做**，否则 Upset 无法工作，数据仍然会丢失！

## 1. 打开 Supabase SQL Editor

登录 [https://supabase.com/dashboard](https://supabase.com/dashboard)，进入你的项目 `ryydiqbaxlctcjmujcgi`，点击左侧 **SQL Editor** → **New Query**。

## 2. 执行以下 SQL

```sql
-- ============================================
-- 创建表（如果不存在）
-- ============================================

-- 文件夹表
CREATE TABLE IF NOT EXISTS folders_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '📁',
  is_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提示词条表
CREATE TABLE IF NOT EXISTS prompts_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  folder_id TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  reference TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  stars INTEGER NOT NULL DEFAULT 0,
  sort_key BIGINT NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏夹文件夹表
CREATE TABLE IF NOT EXISTS fav_folders_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '📁',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏关系表
CREATE TABLE IF NOT EXISTS favorites_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL DEFAULT '',
  fav_folder_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 联合唯一约束（Upsert 必需！）
-- ============================================

-- 注意：PostgreSQL 不允许在 CREATE TABLE 中定义多列 UNIQUE
-- 所以用 ALTER TABLE 单独添加

ALTER TABLE folders_data
  ADD CONSTRAINT folders_data_id_user_unique UNIQUE (id, user_id);

ALTER TABLE prompts_data
  ADD CONSTRAINT prompts_data_id_user_unique UNIQUE (id, user_id);

ALTER TABLE fav_folders_data
  ADD CONSTRAINT fav_folders_data_id_user_unique UNIQUE (id, user_id);

ALTER TABLE favorites_data
  ADD CONSTRAINT favorites_data_id_user_unique UNIQUE (id, user_id);

-- ============================================
-- 禁用 RLS（简化开发阶段，生产环境建议开启）
-- ============================================

ALTER TABLE folders_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompts_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE fav_folders_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites_data DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 索引（加速查询）
-- ============================================

CREATE INDEX IF NOT EXISTS idx_folders_data_user_id ON folders_data(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_data_user_id ON prompts_data(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_folders_data_user_id ON fav_folders_data(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_data_user_id ON favorites_data(user_id);
```

## 3. 点击 **Run** 执行

成功后你会看到 "Success. No rows returned"。

## 4. 验证

去 Supabase Dashboard → **Table Editor**，确认四张表都出现了，且每行都有 `id` 和 `user_id` 字段。

## 5. 部署前端代码

完成上面步骤后，在你的项目目录下运行：

```bash
git add .
git commit -m "fix: 使用 Supabase Upsert 修复数据同步问题"
git push
```

GitHub Desktop 会自动推送到 GitHub，Vercel 会自动部署。

---

## 常见问题

### Q: 如果表已经存在怎么办？

先执行下面的 SQL 删除旧表（**警告：这会清空所有数据！**）：

```sql
DROP TABLE IF EXISTS favorites_data CASCADE;
DROP TABLE IF EXISTS fav_folders_data CASCADE;
DROP TABLE IF EXISTS prompts_data CASCADE;
DROP TABLE IF EXISTS folders_data CASCADE;
```

然后再执行上面的完整建表 SQL。

### Q: 我想保留现有数据

如果你的表已经存在且有数据，只需要添加唯一约束：

```sql
ALTER TABLE folders_data
  ADD CONSTRAINT folders_data_id_user_unique UNIQUE (id, user_id);
-- 对其他三张表也做同样的事
```

如果约束已存在会报错 "duplicate key"，忽略即可。
