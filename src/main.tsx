import React from "react";
import ReactDOM from "react-dom/client";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: "#a14f34",
            colorInfo: "#a14f34",
            colorSuccess: "#2f6d55",
            colorWarning: "#c17f1a",
            colorError: "#b13f32",
            borderRadius: 18,
            fontFamily:
              "\"Aptos\", \"Microsoft YaHei UI\", \"Segoe UI Variable Display\", \"Trebuchet MS\", sans-serif"
          }
        }}
      >
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
