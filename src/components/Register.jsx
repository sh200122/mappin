import { Cancel, Room } from "@mui/icons-material";
import "./register.css";
import { useRef, useState } from "react";
import axios from "axios";

export default function Register({ setShowRegister }) {
  // 成功
  const [success, setSuccess] = useState(false);
  // 失败
  const [error, setError] = useState(false);
  // 保存用户信息
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    // 组织默认事件（刷新页面）
    e.preventDefault();
    // 创建新用户
    const newUser = {
      username: usernameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    //发请求
    try {
      await axios.post("http://localhost:8800/api/users/register", newUser);
      setError(false);
      setSuccess(true);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <div className="registerContainer">
      {/* logo */}
      <div className="logo">
        <Room />
        旅行记
      </div>
      {/* 表单 */}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="用户名" ref={usernameRef} />
        <input type="email" placeholder="邮箱" ref={emailRef} />
        <input type="password" placeholder="密码" ref={passwordRef} />
        <button className="registerBtn">注册</button>
        {/* 成功显示 */}
        {success && <span className="success">注册成功，你现在可以登录了</span>}
        {/* 失败显示 */}
        {error && <span className="failure">遇到了一些错误！</span>}
      </form>
      <Cancel
        className="registerCancel"
        onClick={() => setShowRegister(false)}
      />
    </div>
  );
}
