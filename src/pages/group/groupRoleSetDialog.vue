<template>
  <el-dialog
    :model-value="value"
    :width="600"
    :align-center="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :draggable="true"
    :z-index="99"
    title="设置群身份"
    @close="onClose"
  >
<!--    <el-form label-width="120px">-->
<!--      <el-radio-group>-->
<!--        <el-radio :label="100" :value="100">群主</el-radio>-->
<!--        <el-radio :label="60" :value="60">管理员</el-radio>-->
<!--        <el-radio :label="20" :value="20">成员</el-radio>-->
<!--      </el-radio-group>-->
<!--    </el-form>-->

    <el-radio-group :v-model="roleLevelMy">
      <el-radio :value="100">群主</el-radio>
      <el-radio :value="60">管理员</el-radio>
      <el-radio :value="20">成员</el-radio>
      <!-- 其他选项... -->
    </el-radio-group>
    <template #footer>
      <el-space>
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" :loading="loaging" @click="onSend">确定</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script lang="ts" name="groupRoleSet" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

// API 接口
import { groupSetMemberRole } from '@/api/group.ts';

interface IProps {
  value: boolean;
  groupID: string;
  userID: string;
  roleLevel: 0;
}
const props = withDefaults(defineProps<IProps>(), {
  value: false,
  groupID: '',
  userID: '',
  roleLevel: 0
});

const loaging = ref<boolean>(false);
const roleLevelMy = props.roleLevel;
// 查询
const formData = reactive({
  groupID: props.groupID,
  userID: props.userID,
  roleLevel: props.roleLevel
});

const setGroupMemberRole = () => {
  console.log('groupID', props.groupID);
  console.log('userID', props.userID);
  console.log('roleLevel', formData.groupID);
  console.log('roleLevel', formData.roleLevel);
  // let data = [];
  // data.push(formData);
  let data = { members: [formData] };
  groupSetMemberRole(data)
    .then((res: any) => {
      loaging.value = false;
      ElMessage.success('设置成功！');
      emits('update:value', false);
    })
    .catch(err => {
      loaging.value = false;
      ElMessage.error(err.msg);
    });
};

watch(
  () => props.value,
  (n, _o) => {
    console.log(props.value);
    props.value = n;
  }
);
const emits = defineEmits<{
  (e: 'update:value', item: boolean): void;
  (e: 'ok', item: any): void;
}>();
// 取消
const onClose = () => {
  emits('update:value', false);
};
// 发送
const onSend = () => {
  loaging.value = true;
  setGroupMemberRole();
};
</script>
