<template>
  <div class="btn">
    <el-button size="small" link @click="onSave">
      <SaveOutlined />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { SaveOutlined } from '@ant-design/icons-vue'
import { ElMessage } from 'element-plus'

import { StrSignOk } from '@/constants'
import { saveUserData } from '@/libs/user_data/parser_encode'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const onSave = async () => {
  const errMsg = await saveUserData()
  if (errMsg === StrSignOk) {
    ElMessage({
      message: t('OK'),
      type: 'success',
      showClose: true
    })
  } else {
    ElMessage({
      message: errMsg,
      type: 'error',
      showClose: true
    })
  }
}
</script>

<style lang="scss"></style>
