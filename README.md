# Vue3 后台管理系统

![Deploy](https://github.com/Zzyf0232/vue3-admin-system/actions/workflows/deploy.yml/badge.svg)

## 在线预览

- 后台系统：https://zzyf0232.github.io/Vue3-admin-system/
- 贪吃蛇游戏（Canvas · 原生 JS）：https://zzyf0232.github.io/Vue3-admin-system/snake-game/

## 项目简介

一个基于 Vue3 + Vite + Pinia + Element Plus 的后台管理系统，包含登录鉴权、数据看板、用户管理（增删改查）、系统设置等模块。使用 Mock 数据，无需后端即可运行。

## 技术栈

| 技术 | 说明 |
|------|------|
| Vue3 | Composition API + `<script setup>` |
| Vite | 构建工具，开发热更新 |
| Pinia | 状态管理（替代 Vuex） |
| Vue Router4 | 路由管理 + 路由守卫 |
| Element Plus | UI 组件库 |
| ECharts | 数据可视化 |
| Axios | HTTP 请求（已封装拦截器） |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打包构建
npm run build
```

## 部署

推送到 main 分支后，GitHub Actions 自动执行 npm ci + npm run build，并将 dist 部署到 GitHub Pages。工作流定义见 `.github/workflows/deploy.yml`，也可在 Actions 页面手动触发。

## 默认账号

- 用户名：zhangyufei
- 密码：123456

## 项目结构

```
vue3-admin-system/
├── index.html                  # 入口 HTML
├── package.json                # 项目依赖配置
├── vite.config.js              # Vite 配置（含 @ 别名、Pages base 路径）
├── .github/workflows/deploy.yml # GitHub Actions 自动部署
└── src/
    ├── main.js                 # 应用入口
    ├── App.vue                 # 根组件
    ├── styles/
    │   └── main.css            # 全局样式
    ├── router/
    │   └── index.js            # 路由配置 + 登录守卫
    ├── store/
    │   └── modules/
    │       └── user.js         # 用户状态（token 管理、登录登出）
    ├── utils/
    │   └── request.js          # Axios 二次封装（拦截器）
    ├── api/
    │   └── user.js             # 用户相关 API（Mock 数据）
    ├── layout/
    │   └── index.vue           # 布局组件（侧边栏 + 顶栏 + 内容区）
    └── views/
        ├── login/
        │   └── index.vue        # 登录页
        ├── dashboard/
        │   └── index.vue        # 数据看板（统计卡片 + ECharts 图表）
        ├── user/
        │   └── index.vue        # 用户管理（增删改查 + 搜索 + 分页）
        ├── settings/
        │   └── index.vue        # 系统设置
        └── error/
            └── 404.vue          # 404 页面
```

## 功能清单

- [x] 登录/登出（Mock 鉴权，token 持久化到 localStorage）
- [x] 路由守卫（未登录自动跳转登录页）
- [x] 侧边栏菜单（可折叠）
- [x] 顶栏（面包屑 + 用户下拉菜单）
- [x] 数据看板（统计卡片 + 折线图 + 饼图 + 时间线）
- [x] 用户管理（搜索、分页、新增、编辑、删除、批量删除）
- [x] 表单验证（手机号、邮箱格式校验）
- [x] 404 页面
- [x] 路由懒加载
- [x] Axios 请求拦截器（自动携带 token）
- [x] 响应式布局
- [x] GitHub Actions 自动部署到 GitHub Pages
