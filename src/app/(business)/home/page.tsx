"use client";
import { fetchHttp, RequestOptions } from "@/app/utils/utils";
import { open } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export default function Main() {
  const onWebsite = async (e: any) => {
    e.preventDefault();
    try {
      //要使用浏览器打开链接，注意引入 import { open } from "@tauri-apps/plugin-shell";
      await open("https://truss.mortnon.tech");
    } catch (error) {
      console.error("open url fail:", error);
    }
  };

  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState("");

  const onGetData = async () => {
    setLoading(true);
    setVersion("");
    const url = "https://dowel.mortnon.tech/releases/version.json";
    const req: RequestOptions = {
      method: "GET",
      url: url,
    };

    try {
      const result = await fetchHttp(req);

      if (result.status == 200) {
        const data = JSON.parse(result.body);
        setVersion(data.version);
      } else {
        setVersion("获取失败");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onShowNotification = async () => {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
      sendNotification({ title: "新通知", body: `通知来了${new Date()}` });
    } else {
    }
  };

  return (
    <div className="w-full h-full p-4 space-y-2">
      <span>示例操作</span>
      <div>
        <a className="btn btn-primary" href="/setting?menu=about">
          点击跳转到设置页面“关于我们”
        </a>
      </div>
      <div>
        <button className="btn btn-primary" onClick={onWebsite}>
          跳转浏览器展示网页
        </button>
      </div>
      <div>
        <button className="btn btn-primary" onClick={onGetData}>
          点击使用 GET 方法获取数据
        </button>
        {loading && (
          <span className="loading loading-spinner loading-md text-success"></span>
        )}
        <span>{version}</span>
      </div>
      <div>
        <button className="btn btn-primary" onClick={onShowNotification}>
          点击展示通知
        </button>
      </div>
    </div>
  );
}
