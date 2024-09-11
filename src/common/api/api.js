import { request, upload } from "@/common/api/request.js";

// 通用请求函数
const apiRequest = (url, method = "POST", data = {}) => {
  return request({
    url,
    method,
    data,
  });
};

// 通用上传函数
const apiUpload = (url, data, filePath) => {
  return upload({
    url,
    data,
    filePath,
  });
};

export async function login(data) {
  return apiRequest("/login", "POST", data);
}

export async function userAdd(data, avatarPath) {
  return apiUpload("/userAdd", data, avatarPath);
}

export async function getDatingAmount() {
  return apiRequest("/getDatingAmount");
}

export async function getDating(data) {
  return apiRequest("/getDating", "POST", data);
}

export async function join(data) {
  return apiRequest("/joinDating", "POST", data);
}

export async function getDatingList(data) {
  return apiRequest("/getDatingList", "POST", data);
}

export async function quit(data) {
  return apiRequest("/quitDating", "POST", data);
}

export async function updateUserTime(data) {
  return apiRequest("/updateUserTime", "POST", data);
}

export async function feedback(data) {
  return apiRequest("/feedback", "POST", data);
}
