from fastapi.staticfiles import StaticFiles # 挂载静态文件
from fastapi import FastAPI, HTTPException # http异常处理
from pydantic import BaseModel # 验证和解析 POST 请求的数据

from openai import OpenAI # 创建 DeepSeek API 客户端实例
from dotenv import load_dotenv # 获取api_key
import os
# 显式加载环境变量文件
load_dotenv('env.env')
client = OpenAI(
    api_key=os.environ.get('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com")
app = FastAPI()
class Message(BaseModel):
    message: str
@app.post("/chat")
async def chat(msg: Message):
    message = msg.message
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": """你是一个专业的中文AI助手，请用简洁明了的语言回答用户问题。
                                               回答格式要求：
                                               1. 使用###作为大标题分隔符
                                               2. 使用数字列表组织要点
                                               3. 重要内容加粗显示"""},
                {"role": "user", "content": message},
            ],
            stream=False,
        )
        return {"message": response.choices[0].message.content or ""}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"调用 DeepSeek API 时发生错误: {str(e)}",
        )
# 前端在根目录/，返回后端是从/chat出入的
app.mount("/", StaticFiles(directory="qian_duan", html=True), name="root")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)