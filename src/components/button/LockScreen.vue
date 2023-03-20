<template>
  <div class="btn">
    <el-button size="small" link @click="onLock">
      <LockOutlined />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { LockOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/pinia/modules/app'

const appStore = useAppStore()
const onLock = async () => {
  const appData = appStore.data
  appData.lockscreen = true
  appStore.setData(appData)
}
</script>

<style lang="scss">

</style>
