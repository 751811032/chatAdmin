import request from '@/utils/axios';

// 统计
export function statisticsCountnumGet(params: any) {
  return request({
    url: '/statistic/new_user_count',
    method: 'post',
    params
  });
}

// 登录用户统计
export function statisticsLoginGet() {
  return request({
    url: `/statistic/login_user_count`,
    method: 'post'
  });
}

// 用户注册统计
export function statisticsRegisteruserGet(start: string, end: string) {
  return request({
    url: `/statistic/registeruser/${start}/${end}`,
    method: 'post'
  });
}

// 新建群统计
export function statisticsCreatedgroupGet(start: string, end: string) {
  return request({
    url: `/statistic/createdgroup/${start}/${end}`,
    method: 'post'
  });
}
