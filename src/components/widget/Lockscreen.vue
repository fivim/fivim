<template>
  <div class="lockscreen">
    <el-row>
      <el-col :span="24">
        <el-result class="h-full">
          <template #icon>
            <div class="app-name highlight">
              {{ appStore.data.appName }}
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
              <UnlockOutlined />
              <span class="p-2">{{ t('Unlock') }}</span>
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

import { MasterPasswordSalt } from '@/constants'
import { useAppStore } from '@/pinia/modules/app'
import { initAtFirst } from '@/libs/init/at_first'
import { i18n } from '@/libs/init/i18n'
import { CmdAdapter } from '@/libs/commands'
import { initEntryFile } from '@/libs/user_data/entry_file'
import { initWithStartUpConfFile } from '@/libs/init/conf_file'
import { invoker } from '@/libs/commands/invoke'
import { genMasterPasswordSha256 } from '@/utils/hash'

const appStore = useAppStore()
const { t } = useI18n()

const password = ref('')
const masterPasswordWrong = ref(false)

const checkPassword = () => {
  const pwdSha256 = genMasterPasswordSha256(password.value, MasterPasswordSalt)
  initAtFirst(pwdSha256, true).then(() => {
    if (pwdSha256 === appStore.data.settings.encryption.masterPassword) {
      const data = appStore.data
      data.lockscreen = false
      appStore.setData(data)

      masterPasswordWrong.value = false
      password.value = ''

      invoker.logInfo('Unlock succeeded.')

      initEntryFile().then(() => {
        return true
      }).catch((err: Error) => {
        const t = i18n.global.t
        const typeName = t('configuration')
        CmdAdapter().notification(t('&Error initializing file', { name: typeName }), t(err.message), '')
        return false
      })
    } else {
      masterPasswordWrong.value = true
    }
  })
}

if (appStore.data.settings.normal.workDir === '') {
  initWithStartUpConfFile()
}
</script>

<style lang="scss" scoped>
.lockscreen {
  // margin-top: var(--enas-desktop-title-bar-height);
  // height: calc(100vh - var(--enas-desktop-title-bar-height) - 2px) !important;

  .el-row {
    height: 100%
  }

  .app-name {
    font-size: 5rem;
  }
}
</style>
