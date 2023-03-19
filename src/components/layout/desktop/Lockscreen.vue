<template>
  <!-- desktop title bar -->
  <DesktopTitleBar :showExtButtons="false">
    <template #titleName>
      &nbsp;
    </template>
  </DesktopTitleBar>

  <div class="lockscreen">
    <el-row>
      <el-col :span="24">
        <el-result class="h-full">
          <template #icon>
            <div class="app-name highlight">
              {{ AppName }}
            </div>
          </template>

          <template #extra>
            <div class="py-2">
              <el-input v-model="password" type="password" :placeholder="t('&Input your master password')" autofocus />
            </div>
            <div class="py-2" v-if="masterPasswordWrong">
              <el-alert :title="t('Invalid master password')" type="error" show-icon />
            </div>

            <el-button type="primary" @click="checkPassword">
              <UnlockOutlined />{{ t('Unlock') }}
            </el-button>
          </template>
        </el-result>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UnlockOutlined } from '@ant-design/icons-vue'

import DesktopTitleBar from '@/components/layout/desktop/titleBar/DesktopTitleBar.vue'

import { AppName, MasterPasswordSalt } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { initAtFirst } from '@/libs/init/at_first'
import { genMasterPasswordSha256 } from '@/utils/hash'

const appStore = useAppStore()
const settingStore = useSettingStore()
const { t } = useI18n()

const password = ref('')
const masterPasswordWrong = ref(false)
const checkPassword = () => {
  const pwdSha256 = genMasterPasswordSha256(password.value, MasterPasswordSalt)
  initAtFirst(pwdSha256).then(() => {
    if (pwdSha256 === settingStore.data.encryption.masterPassword) {
      const data = appStore.data
      data.lockscreen = false
      appStore.setData(data)

      masterPasswordWrong.value = false
      password.value = ''
    } else {
      masterPasswordWrong.value = true
    }
  })
}
</script>

<style lang="scss" scoped>
.lockscreen {
  margin-top: var(--enas-desktop-title-bar-height);
  height: calc(100vh - var(--enas-desktop-title-bar-height) - 2px) !important;

  .el-row {
    height: 100%
  }

  .app-name {
    font-size: 5rem;
  }
}
</style>
