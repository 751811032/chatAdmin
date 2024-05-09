<template>
  <bd-page class="flex-col">
    <!-- 布局 -->
    <div class="flex-1 el-card border-none flex-col box-border overflow-hidden">
      <div class="h-50px pl-12px pr-12px box-border flex items-center justify-between bd-title">
        <div class="bd-title-left">
          <p class="m-0 font-600">消息记录</p>
        </div>
        <div class="flex items-center h-50px">
          <el-form inline>
            <el-form-item class="mb-0 !mr-0">
              <el-button type="primary" @click="onSand">发送消息</el-button>
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
              <template v-else>
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
    <!-- 发送消息 -->
    <bd-sand-all-msg v-model:value="sandValue" @ok="okSand" />
  </bd-page>
</template>

<route lang="yaml">
meta:
  title: 消息记录
  isAffix: false
</route>

<script lang="tsx" setup>
import { ElButton, ElAvatar, ElMessageBox, ElMessage } from "element-plus";
import { BU_DOU_CONFIG } from '@/config';
// API 接口
import { messageGet, messageRevoke } from "@/api/message";
/**
 * 表格
 */
const column = reactive<Column.ColumnOptions[]>([
  {
    prop: 'senderNickname',
    label: '发送者名字',
    fixed: 'left',
    width: 100
  },
  {
    prop: 'sendID',
    label: '发送者ID',
    width: 120
  },
  {
    prop: 'senderFaceURL',
    label: '发送者头像',
    align: 'center',
    width: 100,
    render: (scope: any) => {
      let img_url = '';
      if (scope.row['sender']) {
        img_url = `${BU_DOU_CONFIG.APP_URL}users/${scope.row['sender']}/avatar`;
      }
      return (
        <ElAvatar src={img_url} size={54}>
          {scope.row['sender_name']}
        </ElAvatar>
      );
    }
  },
  {
    prop: 'recvID',
    label: '接受者ID',
    width: 120
  },
  {
    prop: 'recvNickname',
    label: '接受者名字',
    width: 100
  },
  // {
  //   prop: 'receiver_avatar',
  //   label: '接受者头像',
  //   align: 'center',
  //   width: 100,
  //   render: (scope: any) => {
  //     let img_url = '';
  //     if (scope.row['receiver']) {
  //       const msgURL = scope.row['receiver_channel_type'] == 1 ? 'users' : 'groups';
  //       img_url = `${BU_DOU_CONFIG.APP_URL}${msgURL}/${scope.row['receiver']}/avatar`;
  //     }
  //     return (
  //       <ElAvatar src={img_url} size={54}>
  //         {scope.row['receiver_name']}
  //       </ElAvatar>
  //     );
  //   }
  // },
  {
    prop: 'sessionType',
    label: '聊天类型',
    width: 90,
    formatter(row: any) {
      return row['sessionType'] === 1 ? '单聊' : '群聊';
    }
  },
  {
    prop: 'contentType',
    label: '聊天类型',
    width: 90
  },
  {
    prop: 'content',
    label: '消息内容',
    width: 260
  },
  {
    prop: 'createTime',
    label: '消息发送时间',
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
  {
    prop: 'operation',
    label: '操作',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: (scope: any) => {
      return (
        <ElSpace>
          {scope.row['contentType'] === 2101 ? (
            <ElButton type="danger" onClick={() => onDel(scope.row)}>
              撤回
            </ElButton>
          ) : (
            ''
          )}
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
  msgType: 0,
  recvID: '',
  sendID: '',
  sessionType: 1,
  pagination: {
    pageNumber: 1,
    showNumber: 10
  }
});

const getTableList = () => {
  loadTable.value = true;
  messageGet(queryFrom).then((res: any) => {
    loadTable.value = false;
    tableData.value = res.data.chatLogs;
    total.value = res.data.chatLogsNum;
  });
};

// 分页page-size
const onSizeChange = (size: number) => {
  queryFrom.pagination.showNumber = size;
  getTableList();
};

// 分页page-size
const onCurrentChange = (current: number) => {
  queryFrom.pagination.pageNumber = current;
  getTableList();
};

// 发送消息
const sandValue = ref<boolean>(false);
const onSand = () => {
  sandValue.value = true;
};

// 确定发送消息
const okSand = () => {
  getTableList();
};
// 删除消息
const msgDel = (item: any) => {
  const formData = {
    conversationID: 'si_' + item.sendID + '_' + item.recvID,
    seq: item.seq,
    userID: item.sendID
  };
  messageRevoke(formData).then((res: any) => {
    getTableList();
    ElMessage({ type: 'success', message: '删除成功！' });
  });
};

// 删除
const onDel = (item: any) => {
  ElMessageBox.confirm('确定，是否删除此消息?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    type: 'warning'
  })
    .then(() => {
      msgDel(item);
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
  getTableList();
});
</script>

<style lang="scss" scoped>
// 样式
.bd-title {
  border-bottom: 1px solid var(--el-card-border-color);
}
</style>
