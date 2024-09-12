import React, { useEffect, useState, Suspense } from "react";
import { Marker, Popup } from "react-map-gl";
import { Room, Star } from "@mui/icons-material";
import "mapbox-gl/dist/mapbox-gl.css";
import "./app.css";
import axios from "axios";
import { format } from "timeago.js";
import * as timeago from "timeago.js";
// 导入中文本地化
import zhLocale from "timeago.js/lib/lang/zh_CN";
import Register from "./components/Register";
import Login from "./components/Login";
import { useDropzone } from "react-dropzone";
import { Button, Dropdown, Menu, message } from "antd";
// 注册中文语言
timeago.register("zh_CN", zhLocale);

// 懒加载 Map 组件
const Map = React.lazy(() => import("react-map-gl"));

function App() {
  // 把用户名存到localStorage
  const myStorage = window.localStorage;
  // 获取localSrorage里的用户
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  // 初始化pin数组存储地图上的标记
  const [pins, setPins] = useState([]);
  // 当前点击的标记ID
  const [openPopups, setOpenPopups] = useState({});
  // 当前新标记的位置、标题、描述、推荐指数
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [star, setStar] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  // 初始化登录注册状态的显示
  const [showRigester, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  // 初始化视口，地图中心为中国
  const [viewport, setViewport] = useState({
    latitude: 34.3416,
    longitude: 108.9398,
    zoom: 4,
  });

  // 地图视口变化处理函数
  const handleViewportChange = (event) => {
    const { viewState } = event;
    setViewport({
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
    });
  };

  // 获取所有标记的异步函数
  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("http://localhost:8800/api/pins");
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  // 点击标记时的处理函数
  const handleMarkerClick = (id) => {
    setOpenPopups((prevOpenPopups) => ({
      ...prevOpenPopups,
      [id]: !prevOpenPopups[id], // 切换当前标记的弹窗显示状态
    }));
  };

  // 在地图上双击添加新标记
  const handleAddClick = (e) => {
    if (!currentUser) {
      // 如果用户未登录，显示提示
      message.warning("请先登录才能添加标记！");
      return;
    }
    setSelectedFile(null);
    const { lng, lat } = e.lngLat;
    setNewPlace({
      lat,
      long: lng,
    });
  };

  // 提交新标记的处理函数
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      message.error("请选择图片！");
      return;
    }
    const formData = new FormData();
    formData.append("username", currentUser);
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("image", selectedFile);
    formData.append("rating", star);
    formData.append("lat", newPlace.lat);
    formData.append("long", newPlace.long);

    try {
      const res = await axios.post("http://localhost:8800/api/pins", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // 将新标记添加到pins中
      setPins([...pins, res.data]);
      // 清除当前新标记的状态
      setNewPlace(null);
    } catch (error) {
      console.log(error);
    }
  };

  // 退出登录函数
  const handleLogout = () => {
    // 从localStorage移除用户信息
    myStorage.removeItem("user");
    // 重置当前用户
    setCurrentUser(null);
  };

  const onDrop = (acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  const menu = (
    <Menu>
      <Menu.Item>
        <p>1. 此网站只进行简单的旅行地点记录</p>
      </Menu.Item>
      <Menu.Item>
        <p>2. 先登录注册在进行其他操作</p>
      </Menu.Item>
      <Menu.Item>
        <p>3. 双击地图添加标记</p>
      </Menu.Item>
      <Menu.Item>
        <p>4. 紫色是别人标记，橙色是自己的标记</p>
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Suspense fallback={<div>别人有别人的人生，你有你的旅程。</div>}>
        <Map
          {...viewport}
          // 使用自定义中文地图
          mapStyle="mapbox://styles/i53o2tqmjs/cm0xx7fbz01ul01rg60u68qh2"
          // 使用从.env文件中导入的Mapbox访问令牌
          mapboxAccessToken={process.env.REACT_APP_MAPBOX}
          // 处理地图视口移动
          onMove={handleViewportChange}
          transitionDuration={200}
          style={{ width: "100%", height: "100%" }}
          // 双击添加标记
          onDblClick={handleAddClick}
        >
          {/* 显示地图上的标记 */}
          {pins.map((p) => (
            <div key={p._id}>
              <Marker
                latitude={p.lat}
                longitude={p.long}
                offsetLeft={-3.5 * viewport.zoom}
                offsetTop={-7 * viewport.zoom}
              >
                <Room
                  style={{
                    fontSize: viewport.zoom * 7,
                    color: p.username === currentUser ? "tomato" : "slateblue",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleMarkerClick(p._id);
                  }}
                />
              </Marker>
              {/* 显示弹窗信息 */}
              {openPopups[p._id] && (
                <Popup
                  latitude={p.lat}
                  longitude={p.long}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="left"
                  onClose={() =>
                    setOpenPopups((prev) => ({ ...prev, [p._id]: false }))
                  }
                >
                  <div className="card">
                    <label>地点</label>
                    <h4 className="place">{p.title}</h4>
                    <label>描述/感悟</label>
                    <p className="desc">{p.desc}</p>
                    {p.image && (
                      <img
                        src={`http://localhost:8800${p.image}`}
                        alt={p.title}
                      />
                    )}
                    <label>推荐指数</label>
                    <div className="stars">
                      {Array.from({ length: p.rating }, (_, index) => (
                        <Star key={index} className="star" />
                      ))}
                    </div>
                    <label>谁来过</label>
                    <span className="username">
                      <b>{p.username}</b>
                    </span>
                    {/* 格式化时间并使用中文 */}
                    <span className="date">
                      {format(p.createdAt, "zh_CN")}标记
                    </span>
                  </div>
                </Popup>
              )}
            </div>
          ))}
          {/* 如果有新标记，显示弹窗 */}
          {newPlace && (
            <Popup
              latitude={newPlace.lat}
              longitude={newPlace.long}
              closeButton={true}
              closeOnClick={false}
              anchor="left"
              onClose={() => setNewPlace(null)} //关闭时清除newPlace
            >
              <div>
                <form onSubmit={handleSubmit}>
                  <label>这是哪</label>
                  <input
                    placeholder="填写地点"
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label>描述/感悟</label>
                  <textarea
                    placeholder="一些有趣/感人的事情"
                    rows={1}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <button
                      onClick={(e) => e.preventDefault()}
                      style={{
                        marginTop: "3px",
                        fontSize: "12px",
                        color: "rgb(88, 87, 87)",
                      }}
                    >
                      添加图片
                    </button>
                  </div>
                  {selectedFile && (
                    <div>
                      <img
                        src={URL.createObjectURL(selectedFile)} // 显示图片预览
                        alt="preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          marginTop: "10px",
                        }}
                      />
                    </div>
                  )}
                  <label>推荐指数</label>
                  <select onChange={(e) => setStar(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton">
                    我来过
                  </button>
                </form>
              </div>
            </Popup>
          )}
          {/* 用户登录状态 */}
          {currentUser ? (
            <button className="button logout" onClick={handleLogout}>
              退出登录
            </button>
          ) : (
            <div className="buttons">
              <Dropdown
                overlay={menu}
                placement="bottom"
                arrow={{ pointAtCenter: true }}
                trigger={["click"]}
              >
                <Button className="button explain">说明</Button>
              </Dropdown>
              <button
                className="button login"
                onClick={() => setShowLogin(true)}
              >
                登录
              </button>
              <button
                className="button register"
                onClick={() => setShowRegister(true)}
              >
                注册
              </button>
            </div>
          )}
          {/* 显示注册和登录表单 */}
          {showRigester && <Register setShowRegister={setShowRegister} />}
          {showLogin && (
            <Login
              setShowLogin={setShowLogin}
              myStorage={myStorage}
              setCurrentUser={setCurrentUser}
            />
          )}
        </Map>
      </Suspense>
    </div>
  );
}

export default App;
