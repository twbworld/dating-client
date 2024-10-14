import { request, upload, requestWs } from "@/common/api/request.js";

export async function login(data) {
  return request({
    url: "/login",
    data,
  })
}

export async function userAdd(data, filePath) {
  return upload({
    url: "/userAdd",
    filePath,
    data,
  });
}

export async function getDatingAmount() {
  return request({
    url: "/getDatingAmount",
  })
}

export async function getDating(data) {
  return request({
    url: "/getDating",
    data,
  })
}

export async function getDatingWs() {
  return requestWs({
    url: "/getDatingWs",
  })
}

export async function join(data) {
  return request({
    url: "/joinDating",
    data,
  })
}

export async function getDatingList(data) {
  return request({
    url: "/getDatingList",
    data,
  })
}

export async function quit(data) {
  return request({
    url: "/quitDating",
    data,
  })
}

export async function updateUserTime(data) {
  return request({
    url: "/updateUserTime",
    data,
  })
}

export async function feedback(data, filePath = "") {
  if (filePath) {
    return upload({
      url: "/feedback",
      filePath,
      data,
    });
  }
  return request({
    url: "/feedback",
    data,
  });
}
