<template>
  <bd-page class="flex-col">
    <!-- 布局 -->

    <div class="flex-1 el-card border-none flex-col box-border overflow-hidden">
      <div class="h-50px pl-12px pr-12px box-border flex items-center justify-between bd-title">
        <div class="bd-title-left">
          <p class="m-0 font-600">用户列表</p>
        </div>
        <div class="flex items-center h-50px">
          <el-form inline>
            <el-form-item class="mb-0 !mr-16px">
              <el-input v-model="queryFrom.keyword" placeholder="uid/手机号/用户名" clearable />
            </el-form-item>
            <el-form-item class="mb-0 !mr-0">
              <el-button type="primary" @click="getUserList">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="flex-1 overflow-hidden p-12px">
        <el-table v-loading="loadTable" :data="tableData" :border="true" style="width: 100%; height: 100%">
          <el-table-column type="index" :width="42" :align="'center'" :fixed="'left'">
            <template #header>
              <i-bd-setting class="cursor-pointer" size="16" />
            </template>
          </el-table-column>
          <el-table-column v-for="item in column" v-bind="item" :key="item.prop">
            <template #default="scope">
              <template v-if="item.render">
                <component :is="item.render" :row="scope.row"> </component>
              </template>
              <template v-else-if="item.formatter">
                <slot :name="item.prop" :row="scope.row">{{ item.formatter(scope.row) }}</slot>
              </template>
              <template v-else-if="item.prop">
                <slot :name="item.prop" :row="scope.row">{{ scope.row[item.prop!] }}</slot>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bd-card-footer pl-12px pr-12px mb-12px flex items-center justify-between">
        <div></div>
        <el-pagination
          v-model:current-page="queryFrom.pagination.pageNumber"
          v-model:page-size="queryFrom.pagination.showNumber"
          :page-sizes="[15, 20, 30, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </div>
    <!-- 发消息 -->
    <bd-send-msg v-model:value="sendValue" v-bind="sendInfo" />
  </bd-page>
</template>

<route lang="yaml">
meta:
  title: 用户列表
  isAffix: false
</route>

<script lang="tsx" setup>
import { useRouter } from 'vue-router';
import { ElButton, ElSpace, ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/modules/user';
import { BU_DOU_CONFIG } from '@/config';
// API 接口
import { userListGet, userBlockAdd, userOnlineInfo, userOfflineReq } from '@/api/user';

const router = useRouter();
const userStore = useUserStore();
/**
 * 表格
 */
const column = reactive<Column.ColumnOptions[]>([
  {
    prop: 'nickname',
    label: '昵称',
    fixed: 'left',
    width: 140
  },
  {
    prop: 'phoneNumber',
    label: '手机号',
    fixed: 'left',
    width: 120
  },
  {
    prop: 'faceURL',
    label: '头像',
    align: 'center',
    width: 80,
    render: (scope: any) => {
      let img_url = '';
      if (scope.row['uid']) {
        img_url = `${BU_DOU_CONFIG.APP_URL}users/${scope.row['uid']}/avatar`;
      }
      return (
        <ElAvatar src={img_url} size={54}>
          {scope.row['name']}
        </ElAvatar>
      );
    }
  },
  {
    prop: 'userID',
    label: '用户ID',
    minWidth: 150
  },
  // {
  //   prop: 'status',
  //   label: '用户状态',
  //   width: 86,
  //   formatter(row: any) {
  //     return row.status === 1 ? '正常' : '封禁';
  //   }
  // },
  {
    prop: 'online',
    label: '在线状态',
    width: 90,
    formatter(row: any) {
      if (row.status === 'online') {
        if (row.singlePlatformToken) {
          let platform = '';
          for (let i = 0; i < row.singlePlatformToken.length; i++) {
            platform += row.singlePlatformToken[i].platform + '/';
          }
          return platform + '在线';
        }
      } else {
        return '离线';
      }
    }
  },
  {
    prop: 'operation',
    label: '操作',
    align: 'center',
    fixed: 'right',
    width: 180,
    render: (scope: any) => {
      return (
        <ElSpace>
          <ElButton type="primary" onClick={() => onSand(scope.row)}>
            发消息
          </ElButton>
          <ElDropdown
            v-slots={{
              default: () => <ElButton class={'bu-button'}>更多</ElButton>,
              dropdown: () => {
                return (
                  <ElDropdownMenu>
                    <ElDropdownItem onClick={() => onFriends(scope.row)}>
                      <i-bd-every-user class={'mr-4px'} />
                      好友列表
                    </ElDropdownItem>
                    <ElDropdownItem onClick={() => onUseBlackList(scope.row)}>
                      <i-bd-personal-privacy class={'mr-4px'} />
                      黑名单列表
                    </ElDropdownItem>
                    <ElDropdownItem onClick={() => userOffline(scope.row)}>
                      <i-bd-info class={'mr-4px'} />
                      强制下线
                    </ElDropdownItem>
                    <ElDropdownItem onClick={() => onUseLiftban(scope.row)}>
                      <i-bd-info class={'mr-4px'} />
                      {'封禁'}
                    </ElDropdownItem>
                  </ElDropdownMenu>
                );
              }
            }}
          />
        </ElSpace>
      );
    }
  }
]);
const tableData = ref<any[]>([]);
const loadTable = ref<boolean>(false);
// 分页
const total = ref(0);

// 查询
const queryFrom = reactive({
  keyword: '',
  normal: 1,
  pagination: {
    pageNumber: 1,
    showNumber: 10
  }
});

const getUserList = () => {
  loadTable.value = true;
  userListGet(queryFrom).then((res: any) => {
    loadTable.value = false;
    let userList = res.data.users;
    // tableData.value = userList;
    total.value = res.data.total;
    let userIDs = [];
    for (let i = 0; i < userList.length; i++) {
      userIDs.push(userList[i].userID);
    }
    let info = { userIDs: userIDs };
    userOnlineInfo(info).then((res: any) => {
      let arr = res.data;
      for (let i = 0; i < userList.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (userList[i].userID === arr[j].userID) {
            userList[i].status = arr[j].status;
            userList[i].singlePlatformToken = arr[j].singlePlatformToken;
          }
        }
      }
      tableData.value = userList;
    });
  });
};

// 分页page-size
const onSizeChange = (size: number) => {
  queryFrom.pagination.showNumber = size;
  getUserList();
};

// 分页page-size
const onCurrentChange = (current: number) => {
  queryFrom.pagination.pageNumber = current;
  getUserList();
};

// 发送信息
const sendValue = ref<boolean>(false);
const sendInfo = ref({
  receivederChannelType: 1,
  receiveder: '',
  receivederName: '',
  sender: '',
  senderName: ''
});

const onSand = (item: any) => {
  sendValue.value = true;
  sendInfo.value = {
    receivederChannelType: 1,
    receiveder: item.uid,
    receivederName: item.name,
    sender: userStore.userInfo.uid,
    senderName: userStore.userInfo.name
  };
};

// 好友列表
const onFriends = (item: any) => {
  router.push({
    path: '/user/friends',
    query: {
      uid: item.uid,
      name: item.name
    }
  });
};

// 黑名单列表
const onUseBlackList = (item: any) => {
  router.push({
    path: '/user/userblacklist',
    query: {
      uid: item.uid,
      name: item.name
    }
  });
};

// 用户封禁
const onUseLiftban = (item: any) => {
  const text = '封禁';
  ElMessageBox.confirm(`确定要${text}用户${item.nickname} 吗`, `${text}用户`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    type: 'warning'
  })
    .then(() => {
      const fromLiftban = {
        userID: item.userID
      };
      console.log('fromLiftban', fromLiftban);
      userBlockAdd(fromLiftban)
        .then((_res: any) => {
          getUserList();
          ElMessage({
            type: 'success',
            message: `${text}用户成功！`
          });
        })
        .catch(err => {
          ElMessage.error(err.msg);
        });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消成功！'
      });
    });
};

const platformMap = {
  iOS: 1,
  Android: 2,
  Windows: 3,
  OSX: 4,
  WEB: 5,
  小程序: 6,
  linux: 7,
  APad: 8,
  IPad: 9,
  Admin: 10
};
// 用户踢线
const userOffline = (item: any) => {
  const text = '强制下线';
  if (item.status != 'online') {
    return;
  }
  ElMessageBox.confirm(`确定要${text}用户${item.nickname} 吗`, `${text}用户`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    type: 'warning'
  })
    .then(() => {
      for (let i = 0; i < item.singlePlatformToken.length; i++) {
        console.log('platformID', item.singlePlatformToken[i].platform);
        let platformID = platformMap[item.singlePlatformToken[i].platform];
        console.log('platformID', platformID);
        const fromLiftban = {
          userID: item.userID,
          platformID: platformID
        };
        console.log('fromLiftban', fromLiftban);
        userOfflineReq(fromLiftban)
          .then((_res: any) => {
            getUserList();
            ElMessage({
              type: 'success',
              message: `${text}用户成功！`
            });
          })
          .catch(err => {
            ElMessage.error(err.msg);
          });
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消成功！'
      });
    });
};
// 初始化
onMounted(() => {
  getUserList();
});
</script>

<style lang="scss" scoped>
// 样式
.bd-title {
  border-bottom: 1px solid var(--el-card-border-color);
}
</style>
