<template>
  <bd-page class="flex-col">
    <!-- 布局 -->
    <div class="flex-1 el-card border-none flex-col box-border overflow-hidden">
      <div class="h-50px pl-12px pr-12px box-border flex items-center justify-between bd-title">
        <div class="bd-title-left">
          <p class="m-0 font-600">封禁用户列表</p>
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
  </bd-page>
</template>

<route lang="yaml">
meta:
  title: 封禁用户列表
  isAffix: false
</route>

<script lang="tsx" setup>
import { ElButton, ElSpace, ElAvatar, ElMessage, ElMessageBox } from 'element-plus';
import { BU_DOU_CONFIG } from '@/config';
// API 接口
import { userDisablelistGet, userBlockDel } from '@/api/user';
/**
 * 表格
 */
const column = reactive([
  {
    prop: 'nickname',
    label: '用户名',
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
  {
    prop: 'gender',
    label: '性别',
    width: 60,
    formatter(row: any) {
      return row.gender === 1 ? '男' : '女';
    }
  },
  {
    prop: 'createTime',
    label: '注册时间',
    width: 170,
    formatter(row: any) {
      var date = new Date(row.createTime);
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1) + '-';
      var D = date.getDate() + ' ';
      var h = date.getHours() + ':';
      var m = date.getMinutes() + ':';
      var s = date.getSeconds();
      return Y + M + D + h + m + s;
    }
  },
  // {
  //   prop: 'closure_time',
  //   label: '封禁日期',
  //   width: 150
  // },
  {
    prop: 'operation',
    label: '操作',
    align: 'center',
    fixed: 'right',
    width: 120,
    render: (scope: any) => {
      return (
        <ElSpace>
          <ElButton type="primary" onClick={() => onUseLiftban(scope.row)}>
            解禁
          </ElButton>
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
  pagination: {
    pageNumber: 1,
    showNumber: 10
  }
});

const getUserList = () => {
  loadTable.value = true;
  userDisablelistGet(queryFrom).then((res: any) => {
    loadTable.value = false;
    tableData.value = res.data.users;
    total.value = res.data.total;
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

// 解禁
const onUseLiftban = (item: any) => {
  ElMessageBox.confirm(`确定要解禁用户${item.nickname} 吗`, `解禁用户`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    type: 'warning'
  })
    .then(() => {
      const fromLiftban = {
        userIDs: [item.userID]
      };
      userBlockDel(fromLiftban)
        .then((_res: any) => {
          getUserList();
          ElMessage({
            type: 'success',
            message: `解禁用户成功！`
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
