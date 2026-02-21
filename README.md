# DeepSeek 聊天助手 Web 应用
>  基于 FastAPI 和 DeepSeek 大模型构建的ai聊天网站，
## 二、环境准备
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
安装项目依赖：
```bash
pip install -r requirements.txt
```
在项目根目录下执行：
```bash
python main.py
```
启动成功后会显示类似信息：
```txt
Uvicorn running on http://0.0.0.0:8000
```
然后在浏览器中访问：
[`http://127.0.0.1:8000`](http://127.0.0.1:8000)
##  API 密钥配置
项目已预配置演示用的 API Key，在 `env.env` 文件中：
```env
DEEPSEEK_API_KEY=sk-062383a35bb748ca8d797dec962f44f2
```
如需更换为个人 API Key，请修改 `env.env` 文件：
##  Docker 容器化部署
（切换目录，并且sudo su ）
### 单容器部署（简单快速）
用的是根目录的Dockerfile
```bash
# 构建 Docker 镜像
docker build -t deepseek-chat -f docker-config/Dockerfile .
# 运行容器
docker run -d \
  --name deepseek-chat \
  -p 8000:8000 \
  --env-file env.env \
  deepseek-chat
# 查看运行状态
docker ps
# 查看容器日志
docker logs deepseek-chat
```
### 多容器编排部署（生产推荐）
```bash
# 进入配置目录
cd docker-config
# 启动所有服务
docker-compose up -d
# 查看服务状态
docker-compose ps
# 实时查看日志
docker-compose logs -f
```

停止容器
```
docker stop deepseek-chat
# 停止所有服务
docker-compose down
```
## 📈 性能优化
### 前端优化
- ✅ 已实现：静态资源缓存策略（Nginx配置）
- ✅ 已实现：响应式设计适配移动设备
- 建议添加：WebSocket 实现实时通信
- 建议添加：消息历史记录本地存储
### 后端优化
- ✅ 已实现：异步处理提升并发性能
- ✅ 已实现：连接池管理优化资源利用
- 建议添加：请求频率限制防止滥用
- 建议添加：Redis 缓存热门查询结果
- 建议添加：GZip 压缩减少传输数据量
### 部署优化
- ✅ 已实现：Docker 容器化部署
- ✅ 已实现：健康检查机制
- 建议添加：负载均衡器分发请求
- 建议添加：CDN 加速静态资源访问
- 建议添加：自动扩缩容应对流量波动
- 建议添加：HTTPS 加密传输保障安全
### 数据库优化（如需扩展）
- 实现消息持久化存储
- 添加用户会话管理
- 建立对话历史索引
- 配置读写分离架构
### 开发环境搭建
```bash
# 克隆项目
git clone https://github.com/vgwbdzzq52-rgb/deepseek-chat.git
cd deepseek-chat
# 创建虚拟环境
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# 安装开发依赖
pip install -r requirements.txt
# 启动开发服务器
python main.py
```

然后在浏览器中访问：
[`http://127.0.0.1:8000`](http://127.0.0.1:8000)