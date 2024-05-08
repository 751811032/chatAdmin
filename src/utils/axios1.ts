import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BU_DOU_CONFIG } from '@/config';
import { useUserStore } from '@/stores/modules/user';
const userStore = useUserStore();

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BU_DOU_CONFIG.APP_URL_IM, // BASE_MAIN_URL
  withCredentials: false // 跨域请求时是否需要使用凭证
});

// request 拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 添加token
    (config as any).headers['Content-Type'] = 'application/text';
    if (userStore.token) {
      (config as any).headers['token'] = userStore.token;
    }
    (config as any).headers['Operationid'] = 'dbdcf835-05fb-4607-b9a5-79637aea39f8';
    (config as any).headers['Isaccount'] = 'true';
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// respone 拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('response:', response);

    // errCode:20002
    // errDlt:"20002 AccountNotFound"
    // errMsg:"20002 Ac
    if (response.data.errCode == 0) {
      return Promise.resolve(response.data);
    } else {
      const error = { msg: '' };
      error.msg = response.data.errMsg;
      return Promise.reject(error);
    }
  },
  (error: any) => {
    console.log('error:', error);
    const code = error.response.status;
    // if (code == 401) {
    //   userStore.setToken('');
    //   userStore.setUserInfo({ name: '您好，超管', uid: '' });
    //   router.replace('/login');
    // }
    if (code == 400) {
      return Promise.reject(error.response.data);
    }
    // 响应失败
    return Promise.reject(error);
  }
);

export default axiosInstance;
