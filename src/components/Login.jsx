import { Cancel, Room } from "@mui/icons-material";
import "./login.css";
import { useRef, useState } from "react";
import axios from "axios";

export default function Login({ setShowLogin, myStorage, setCurrentUser }) {
  // 登录失败状态控制
  const [error, setError] = useState(false);
  // 创建引用，用于保存用户名和密码输入框的值
  const usernameRef = useRef();
  const passwordRef = useRef();

  // 提交登录表单处理函数
  const handleSubmit = async (e) => {
    // 阻止默认事件（刷新页面）
    e.preventDefault();
    // 构造用户对象
    const user = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    };
    //发请求
    try {
      const res = await axios.post(
        "http://localhost:8800/api/users/login",
        user
      );
      // 数据存入localStorage
      myStorage.setItem("user", res.data.username);
      // 设置当前登录用户
      setCurrentUser(res.data.username);
      // 关闭登录端口
      setShowLogin(false);
      // 重置错误状态为false
      setError(false);
    } catch (error) {
      // 发生错误
      setError(true);
    }
  };

  return (
    <div className="loginContainer">
      {/* logo */}
      <div className="logo">
        <Room />
        旅行记
      </div>
      {/* 表单 */}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="用户名" ref={usernameRef} />
        <input type="password" placeholder="密码" ref={passwordRef} />
        <button className="loginBtn">登录</button>
        {/* 登录失败显示 */}
        {error && <span className="failure">遇到了一些错误！</span>}
      </form>
      {/* 取消登录 */}
      <Cancel className="loginCancel" onClick={() => setShowLogin(false)} />
    </div>
  );
}
