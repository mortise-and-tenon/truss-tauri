import { invoke } from "@tauri-apps/api/core";
import {
  BaseDirectory,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import CryptoJS from "crypto-js";

const SECRET_KEY = "Z39oqVCeeqKbz3x9SDuzQkoNqntALcdVjkPco5Gw6a4=";

const CONFIG_FILE_NAME = "truss.json";

// 加密函数
export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// 解密函数
export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export type AppData = {
  locale: string;
  showTray: boolean;
};

export type ConfigFile = {
  app: AppData;
};

export interface PlatformAdapter {
  readConfigFile(): Promise<ConfigFile>;
  writeAppData(appData: AppData): Promise<boolean>;
  readAppData(): Promise<AppData>;
}

export class TauriAdapter implements PlatformAdapter {
  /**
   * 读取整个配置文件
   * @returns
   */
  readConfigFile = async (): Promise<ConfigFile> => {
    const fileExists = await exists(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });
    if (!fileExists) {
      return {
        app: {
          locale: "zh",
          showTray: true,
        },
      };
    }

    const jsonContent = await readTextFile(CONFIG_FILE_NAME, {
      baseDir: BaseDirectory.Home,
    });

    return JSON.parse(jsonContent);
  };

  /**
   * 保存配置文件
   * @param configFile
   */
  writeConfigFile = async (configFile: ConfigFile) => {
    try {
      await writeTextFile(
        CONFIG_FILE_NAME,
        JSON.stringify(configFile, null, 2),
        {
          baseDir: BaseDirectory.Home,
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 写入 app 数据
   * @param appData
   */
  writeAppData = async (appData: AppData): Promise<boolean> => {
    const configFile = await this.readConfigFile();

    configFile.app = appData;

    try {
      await this.writeConfigFile(configFile);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 读取 app 数据
   * @returns
   */
  readAppData = async (): Promise<AppData> => {
    const configFile = await this.readConfigFile();
    return configFile.app;
  };
}

/**
 * 请求数据
 */
export interface RequestOptions {
  method: string;
  url: string;
  verify?: boolean;
  headers?: Record<string, string>;
  body?: string | undefined;
}

/**
 * 响应数据
 */
export interface ApiResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * 封装的 http 方法
 * @param options
 * @returns
 */
export const fetchHttp = async (options: RequestOptions) => {
  return await invoke<ApiResponse>(`make_request`, { options });
};
