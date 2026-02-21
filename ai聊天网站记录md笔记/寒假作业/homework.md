# 一，概述
### 1，ai模型。我选择用deepseek的api
![图片](Pasted%20image%2020260212095602.png)
### 2，前端页面。抄哔站“小元Niki”的deepseek聊天网站[视频](https://www.bilibili.com/video/BV1eLfVYjE7R?vd_source=8d32b4054931ac3a8853711e9cc414da)
![图片](Pasted%20image%2020260212100139.png)

### 3，后端。只有简单的和deepseek连接的代码。没有具体的错误处理
![图片](Pasted%20image%2020260220072733.png)



# 二，后端
![图片](Pasted%20image%2020260220073657.png)
- main.py
    - 接收前端的message，连接deepseek和前端
- .env
    - 给main.py提供api_key，增加安全
- requirements.txt
    - 一键下载库函数，使得文件能正常运行
- README.md
    - 简单介绍
    - 启动文本
### 1，调用deepseek成功

- 基于deepseek官方文档的修改，完成调用deepseekseek
![图片](Pasted%20image%2020260214110545.png)

- main.py的主体代码
```
from fastapi import FastAPI  
app = FastAPI()  
 
import os  
from openai import OpenAI  

@app.get("/chat")  
async def chat(message: str):  

# 直接改成key=sk……
# 也可以.env间接使用，增加保密性
    client = OpenAI(  
        api_key="sk-062383a35bb748ca8d797dec962f44f2",  
        base_url="https://api.deepseek.com")  
  
    response = client.chat.completions.create(  
        model="deepseek-chat",  
        messages=[  
            {"role": "system", "content": "You are a helpful assistant"},  
            {"role": "user", "content": message},  
        ],  
        stream=False  
    )  
  
# print（）改成return{}就完成啦
    return {"response": response.choices[0].message.content}
```

- docs测试顺利
![图片](Pasted%20image%2020260214103656.png)

### 2，环境变量存放deepseek的api
- 新建.env文件，写入 
  ```
  DEEPSEEK_API_KEY=sk-062383a35bb748ca8d797dec962f44f2
  ```
在main.py中
```
from openai import OpenAI # 创建 DeepSeek API 客户端实例  
from dotenv import load_dotenv # 获取api_key  
import os  
load_dotenv()  
client = OpenAI(  
    api_key=os.environ.get('DEEPSEEK_API_KEY'),  
    base_url="https://api.deepseek.com")
```
- load_dotenv()函数使得main.py文件可以访问.env，得到api

### 3,异常响应
![图片](Pasted%20image%2020260220073118.png)
如果deepseek调用失败，返回错误
没有加上deepseek的api_key缺失的代码

### 4，和前端连接
```
app.mount("/", StaticFiles(directory="qian_duan", html=True), name="root")
```
使用FastAPI框架将静态文件服务挂载到根路径"/"。
指定目录qian_duan为静态文件来源，并启用HTML文件支持.
为该路由命名为root，便于内部引用。


# 三，前端
界面仿照b站小元Niki的deepseek聊天网站[视频](https://www.bilibili.com/video/BV1eLfVYjE7R?vd_source=8d32b4054931ac3a8853711e9cc414da)
但是更简陋，没有“更多”和深色模式。
只有聊天界面、输入框、发送按钮、对话头像
### 1，qian_duan结构
![图片](Pasted%20image%2020260220070451.png)

- index.html
    - 调用css和js，
    - 将输入内容传给js
- script.js
    - 控制输入框和发送等的交互
    - 将前端内容格式化传给后端
- style.css
    - 美化界面
- bot-avatar.png
    - 机器人的头像，在 index.html调用
- user-avatar.png
    - 用户头像，在js调用

### 2,script.js（前后端对接）

```
110     fetch('/chat', {  
111         method: 'POST',                          
112         headers: { 'Content-Type': 'application/json' },  
113         body: JSON.stringify({ message: message })  
```

1,路径匹配：’/chat‘
2,方法匹配：’POST‘
3,请求字段：message

```
132         if (data.message) {  // 检查后端返回的message字段
133             displayMessage('bot', data.message);
134         } 
135         
136         else if (data.detail) {
```

4，成功响应：message
5，失败响应：detail（api_key我自己定好了，就不加api_key不存在的报错了）
             在调用deepseek发生错误时返回报错


###### message在前后端的传递过程
![图片](Pasted%20image%2020260216073843.png)
前后端message变量名和格式不能变


###### deepseek给出的报错传递流程
![图片](deepseek_mermaid_20260218_10624c.png)



# 4，其他
git测试完成
![图片](Pasted%20image%2020260220145200.png)


docker测试完成
![图片](Pasted%20image%2020260221105450.png)
![图片](Pasted%20image%2020260221105527.png)


发现docker-compose的命名容易和其他容器冲突
于是在其他名字前面加上ai_chat_docker前缀
我把之前的容器都停了，并且删除了。
![图片](Pasted%20image%2020260221111324.png)
重新docker  pull nginx。（docker网络连接又有问题，我是用渡渡鸟镜像站直接解决的）
但需要重命名，且缺少将 /chat 转发到后端的规则
![图片](Pasted%20image%2020260221111714.png)
用虚拟机ip地址测试成功