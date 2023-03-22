<template>
  <div class="btn">
    <el-button size="small" link @click="onOpen">
      <SettingOutlined />
    </el-button>
  </div>

  <el-dialog v-model="dialogVisible" :title="t('Setting')" :width="grnDialogWidth()" :fullscreen="isMobileScreen()">
    <el-tabs tab-position="left">
      <el-tab-pane :label="t('General')">
        <el-form :model="settingStore.data" label-width="150px" :label-position="genLabelPosition()">
          <el-form-item :label="t('File')">
            {{ t('&Total size of all files', { size: allFileSize }) }}
          </el-form-item>
          <!--
          <el-form-item :label="t('Last sync time')">
            2022-12-12
          </el-form-item>
          <el-form-item :label="t('Spell check')">
            <el-switch v-model="settingStore.data.normal.spellCheck" size="small" />
          </el-form-item>
          <el-form-item :label="t('Show saving status')">
            <el-switch v-model="settingStore.data.normal.showFileSavingStatus" size="small" />
            <el-alert type="info" show-icon :closable="false">
              {{ t('&Show saving status') }}
            </el-alert>
          </el-form-item>
          <el-button>{{ t('Export data') }}</el-button>
          <el-button>{{ t('Import data') }}</el-button>
          -->
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="t('Appearance')">
        <el-form :model="settingStore.data" label-width="150px" :label-position="genLabelPosition()">
          <el-form-item :label="t('Language')">
            <el-select v-model="settingStore.data.normal.language" class="m-2" :placeholder="t('Select')" filterable>
              <el-option v-for="(item, index) in settingOptions.language.sort(elOptionArrSort)" :key="index"
                :label="item.label + ' - ' + getLanguageMeta(item.value).nativeName" :value="item.value">
                <span class="fl">{{ item.label }}</span>
                <span class="fr color-secondary">{{ getLanguageMeta(item.value).nativeName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('Date time format')">
            <el-select v-model="settingStore.data.appearance.dateTimeFormat" :placeholder="t('Select')">
              <el-option v-for="item in settingOptions.dateFormat" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>

          <!-- list column -->
          <el-form-item :label="t('Show create time')">
            <el-switch v-model="settingStore.data.appearance.listColShowCreateTime" />
          </el-form-item>
          <el-form-item :label="t('Show update time')">
            <el-switch v-model="settingStore.data.appearance.listColShowUpdateTime" />
          </el-form-item>

          <SettingCustomBackground />
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="t('Encryption')">
        <el-form :model="settingStore.data" label-width="150px" :label-position="genLabelPosition()">
          <el-form-item :label="t('Master password')">
            <el-button @click="onToggleChangeMasterPassword()">{{ t('Change master password') }}</el-button>
          </el-form-item>
          <div v-if="(changeMasterPasswordVisible)" class="mt-2 pb-2 w-full secondary-background">
            <div class="mb-2">
              <el-alert type="warning" show-icon :closable="false">{{ t('&Master password modified tip') }}</el-alert>
            </div>
            <el-form-item :label="t('Old password')" v-if="settingStore.data.encryption.masterPassword !== ''">
              <el-input v-model="masterPasswordOld" class="w-auto" type="password" />
            </el-form-item>
            <el-form-item :label="t('New password')">
              <el-input v-model="masterPasswordNew" class="w-auto" type="password" />
            </el-form-item>
            <el-form-item label="">
              <el-button @click="onToggleChangeMasterPassword()">{{ t('Cancel') }}</el-button>
              <el-button type="primary" @click="onSaveMasterPassword()"> {{ t('Confirm') }} </el-button>
            </el-form-item>
            <!-- TODO: -->
            <div v-if="appStore.data.changeMasterPasswordStatus.percent > 0">
              <el-progress :text-inside="true" :stroke-width="15"
                :percentage="appStore.data.changeMasterPasswordStatus.percent"
                :color="changeMasterPasswordProgressColor" />
              <p> {{ changeMasterPasswordStatus }} </p>
            </div>
          </div>
          <el-form-item :label="t('Entry file name')" class="mb-2">
            <el-input v-model="settingStore.data.encryption.entryFileName" />
          </el-form-item>
          <div class="mb-2">
            <el-alert type="info" show-icon :closable="false">{{ t('&Valid for new files') }}</el-alert>
          </div>
          <el-form-item :label="t('File extension')">
            <el-input v-model="settingStore.data.encryption.fileExt" @input="onInputFileExt"
              :placeholder="t('Can be empty')" class="w-auto" />
            <div class="ml-4 disp-inline">
              <el-tooltip :content="t('&File extension tip')" raw-content effect="customized">
                <el-button>{{ t('Show tip') }}</el-button>
              </el-tooltip>
            </div>
          </el-form-item>
          <el-form-item :label="t('File naming rule')">
            <div class="m-2 w-full">
              <el-select v-model="settingStore.data.encryption.fileNameRule" :placeholder="t('Select')">
                <el-option v-for="item in settingOptions.fileNameRule" :key="item.value" :label="t(item.label)"
                  :value="item.value" />
              </el-select>

              <div class="ml-4 disp-inline">
                <el-tooltip
                  :content="genFileNamingRuleDemoHtml(t, settingStore.data.appearance.dateTimeFormat, settingStore.data.encryption.fileExt)"
                  raw-content effect="customized">
                  <el-button>{{ t('Show example') }}</el-button>
                </el-tooltip>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ t('Cancel') }}</el-button>
        <el-button @click="onSave(false)">{{ t('Apply') }}</el-button>
        <el-button type="primary" @click="onSave(true)"> {{ t('Confirm') }} </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { SettingOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { ReFileExt, MasterPasswordSalt } from '@/constants'
import { ElPrecessItem } from '@/types_common'
import { settingOptions, changeMasterPasswordProcessData } from '@/conf'
import { i18n, getLanguageMeta, setLocale } from '@/libs/init/i18n'
import { CmdInvoke } from '@/libs/commands'
import { elOptionArrSort } from '@/utils/array'
import { happybytes } from '@/utils/bytes'
import { isMobileScreen, getPageWidth } from '@/utils/media_query'
import { genFileNamingRuleDemoHtml, sha256, genMasterPasswordSha256 } from '@/utils/hash'

const { t } = useI18n()
const appStore = useAppStore()
const settingStore = useSettingStore()

const masterPasswordOld = ref('')
const masterPasswordNew = ref('')
const allFileSize = ref('0')

const getAllFileSize = async () => {
  const size = await CmdInvoke.getDirSize(appStore.data.dataPath.pathOfCurrentDir)
  allFileSize.value = happybytes(size, false)
}

// ---------- Change master password ----------
const changeMasterPasswordProgressColor: ElPrecessItem[] = []
for (const i of changeMasterPasswordProcessData) {
  changeMasterPasswordProgressColor.push({ color: i.color, percentage: i.percent })
}

const changeMasterPasswordStatus = computed(() => {
  return t('&Change master password status', {
    action: appStore.data.changeMasterPasswordStatus.action,
    currentNumber: appStore.data.changeMasterPasswordStatus.currentNumber,
    totalNumber: appStore.data.changeMasterPasswordStatus.totalNumber
  })
})
// ========== Change master password end ==========

// ---------- dialog ----------
const dialogVisible = ref(false)

const languageOld = ref('')
const onOpen = () => {
  dialogVisible.value = true
  languageOld.value = settingStore.data.normal.language

  getAllFileSize()
}

const onSave = (close: boolean) => {
  if (close) {
    dialogVisible.value = false
  }

  const sd = settingStore.data
  settingStore.setData(sd, true)

  // If language changed
  const languageNew = settingStore.data.normal.language
  if (languageNew !== languageOld.value) {
    if (i18n.global.availableLocales.indexOf(languageNew) >= 0) { // Check if the new language is allowed
      setLocale(languageNew)
      languageOld.value = languageNew

      CmdInvoke.systemTrayUpdateText()

      // changeLocaleTimestamp
      const appData = appStore.data
      appData.changeLocaleTimestamp = new Date().getTime()
      appStore.setData(appData)
    }
  }
}

const grnDialogWidth = () => {
  // mobile version use "fullscreen" attr
  // if (isMobileScreen()) {
  //     return "100%"
  // }

  const width = getPageWidth()
  if (width < 768) {
    return '100%'
  } else if (width < 1024) {
    return '95%'
  } else if (width >= 1024) {
    return '50%'
  }
}

const genLabelPosition = () => {
  if (isMobileScreen()) {
    return 'top'
  }

  return 'left'
}
// ========== dialog end ==========

// ---------- master password ----------
const changeMasterPasswordVisible = ref(false)
const onToggleChangeMasterPassword = () => {
  changeMasterPasswordVisible.value = !changeMasterPasswordVisible.value
}
const onSaveMasterPassword = () => {
  const setting = settingStore.data
  if (setting.encryption.masterPassword !== '' && setting.encryption.masterPassword !== sha256(masterPasswordOld.value)) {
    return false
  }

  if (masterPasswordNew.value === '') {
    ElMessage.error(t('&Input new master password'))
    return false
  }

  onToggleChangeMasterPassword()
  const newPassword = genMasterPasswordSha256(masterPasswordNew.value, MasterPasswordSalt)
  // TODO: decrypt, and use the new password to encrypt,need a lock file.

  setting.encryption.masterPassword = newPassword
  settingStore.setData(setting, true)
}

const onInputFileExt = (detail: string) => {
  if (detail !== '' && !ReFileExt.test(detail)) {
    ElMessage({
      message: t('File extension format error'),
      type: 'warning',
      showClose: true
    })
  }
}
// ========== master password end ==========
</script>

<style lang="scss">
.secondary-background {
  background-color: var(--enas-background-secondary-color);
  padding: 1rem 1rem 1px 1rem;
  margin-bottom: 1em;
}

$width: 160px;
$height: 120px;

.background-image-uploader {
  .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .image {
    max-width: $width;
    max-height: $height;
  }

  .el-icon.background-image-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: $width;
    height: $height;
    text-align: center;
  }
}
</style>
