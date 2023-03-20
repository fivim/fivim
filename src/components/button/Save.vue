<template>
  <div class="btn">
    <el-button size="small" link @click="onSave">
      <SaveOutlined />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { SaveOutlined } from '@ant-design/icons-vue'

import { saveCurrentNotebookData } from '@/libs/user_data/utils'

const onSave = async () => {
  saveCurrentNotebookData()
}
</script>

<style lang="scss"></style>
