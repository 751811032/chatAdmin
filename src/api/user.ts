import request1 from '@/utils/axios1';
import request from '@/utils/axios';
import request2 from '@/utils/axios2';

// 添加用户
export function userAddPost(data: any) {
  return request1({
    url: '/account/register',
    method: 'post',
    data
  });
}

// 用户列表
export function userListGet(params: any) {
  return request1({
    url: '/user/search/full',
    method: 'post',
    data: params
  });
}

// 封禁用户列表
export function userDisablelistGet(params: any) {
  return request({
    url: '/block/search',
    method: 'post',
    data: params
  });
}

// 好友列表
export function userFriendsGet(params: any) {
  return request({
    url: 'manager/user/friends',
    method: 'get',
    params
  });
}

// 黑名单列表
export function userBlacklistGet(params: any) {
  return request({
    url: 'block/search',
    method: 'post',
    params
  });
}

// 用户在线列表
export function userOnlineInfo(params: any) {
  return request2({
    url: 'user/get_users_online_token_detail',
    method: 'post',
    data: params
  });
}

// 用户封禁
export function userBlockAdd(params: any) {
  return request({
    url: 'block/add',
    method: 'post',
    data: params
  });
}

// 用户解封
export function userBlockDel(params: any) {
  return request({
    url: 'block/del',
    method: 'post',
    data: params
  });
}

// 强制用户下线
export function userOfflineReq(params: any) {
  return request2({
    url: 'auth/force_logout',
    method: 'post',
    data: params
  });
}
