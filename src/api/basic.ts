import request from '@/utils/axios';

// 登录
export function loginPost(data: any) {
  return request({
    url: '/account/login',
    method: 'post',
    data
  });
}
