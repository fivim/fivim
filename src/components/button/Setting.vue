<!-- The value of el-select in el-popover changed will close el-popover. -->
<!-- So, we don't trigger the visibility of setting dialog inside the component. -->

<template>
  <!--
  <div class="btn">
    <el-button size="small" link @click="onOpen">
      <SettingOutlined />
      <span class="p-2">{{ t('Setting') }}</span>
    </el-button>
  </div>
  -->

  <el-dialog v-model="dialogVisible" :title="t('Setting')" :width="genDialogWidth()" :fullscreen="isMobileScreen()">
    <el-tabs tab-position="left">
      <el-tab-pane :label="t('General')">
        <el-form :model="appStore.data" label-width="150px" :label-position="genLabelPosition()">
          <el-form-item :label="t('Language')">
            <el-select v-model="appStore.data.settings.normal.locale" class="m-2" :placeholder="t('Select')" filterable>
              <el-option v-for="(item, index) in settingOptions.locale.sort(elOptionArrSort)" :key="index"
                :label="item.label + ' - ' + getLanguageMeta(item.value).nativeName" :value="item.value">
                <span class="fl">{{ item.label }}</span>
                <span class="fr color-secondary">{{ getLanguageMeta(item.value).nativeName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('Working directory')">
            <div class="w-full">
              <el-input v-model="appStore.data.settings.normal.workDir" />
            </div>
            <div class="w-full mt-2">
              <el-alert :title="t('Warning')" :description="t('&Change working directory tip')" type="warning"
                show-icon />
            </div>
            <div class="w-full">{{ t('&Total size of all files', { size: allFileSize }) }}</div>
          </el-form-item>
          <!--
          <el-form-item :label="t('Last sync time')">
            2022-12-12
          </el-form-item>
          <el-form-item :label="t('Spell check')">
            <el-switch v-model="appStore.data.settings.normal.spellCheck" size="small" />
          </el-form-item>
          <el-form-item :label="t('Show saving status')">
            <el-switch v-model="appStore.data.settings.normal.showFileSavingStatus" size="small" />
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
        <el-form :model="appStore.data" label-width="150px" :label-position="genLabelPosition()">
          <el-form-item :label="t('Date time format')">
            <el-select v-model="appStore.data.settings.appearance.dateTimeFormat" :placeholder="t('Select')">
              <el-option v-for="item in settingOptions.dateFormat" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>

          <!-- list column -->
          <el-form-item :label="t('Show create time')">
            <el-switch v-model="appStore.data.settings.appearance.listColShowCreateTime" />
          </el-form-item>
          <el-form-item :label="t('Show update time')">
            <el-switch v-model="appStore.data.settings.appearance.listColShowUpdateTime" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="t('Encryption')">
        <el-form :model="appStore.data" label-width="150px" :label-position="genLabelPosition()">
          <el-form-item :label="t('Master password')">
            <el-button @click="onToggleChangeMasterPassword()">{{ t('Change master password') }}</el-button>
          </el-form-item>
          <div v-if="(changeMasterPasswordVisible)" class="mt-2 pb-2 w-full secondary-background">
            <div class="mb-2">
              <el-alert type="warning" show-icon :closable="false">{{ t('&Master password modified tip') }}</el-alert>
            </div>
            <el-form-item :label="t('File verification')">
              <el-switch v-model="chnageMasterPasswordFileVerification" class="ml-2" />
            </el-form-item>
            <el-form-item :label="t('Old password')" v-if="appStore.data.settings.encryption.masterPassword !== ''">
              <el-input v-model="masterPasswordOld" class="w-auto" type="password" />
            </el-form-item>
            <el-form-item :label="t('New password')">
              <el-input v-model="masterPasswordNew" class="w-auto" type="password" />
            </el-form-item>
            <el-form-item label="">
              <el-button @click="onToggleChangeMasterPassword()">{{ t('Cancel') }}</el-button>
              <el-button type="primary" @click="onSaveMasterPassword()"> {{ t('Confirm') }} </el-button>
            </el-form-item>
          </div>
          <el-form-item :label="t('Entry file name')" class="mb-2">
            <el-input v-model="appStore.data.settings.encryption.entryFileName" />
          </el-form-item>
          <div class="mb-2">
            <el-alert type="info" show-icon :closable="false">{{ t('&Valid for new files') }}</el-alert>
          </div>
          <el-form-item :label="t('File extension')">
            <el-input v-model="appStore.data.settings.encryption.fileExt" @input="onInputFileExt"
              :placeholder="t('Can be empty')" class="w-auto" />
            <div class="ml-4 disp-inline">
              <el-tooltip :content="t('&File extension tip')" raw-content effect="customized">
                <el-button>{{ t('Show tip') }}</el-button>
              </el-tooltip>
            </div>
          </el-form-item>
          <el-form-item :label="t('File naming rule')">
            <div class="m-2 w-full">
              <el-select v-model="appStore.data.settings.encryption.fileNameRule" :placeholder="t('Select')">
                <el-option v-for="item in settingOptions.fileNameRule" :key="item.value" :label="t(item.label)"
                  :value="item.value" />
              </el-select>

              <div class="ml-4 disp-inline">
                <el-tooltip
                  :content="genFileNamingRuleDemoHtml(t, appStore.data.settings.appearance.dateTimeFormat, appStore.data.settings.encryption.fileExt)"
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
// import { SettingOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

import { useAppStore } from '@/pinia/modules/app'
import { ReFileExt, MasterPasswordSalt } from '@/constants'
import { settingOptions } from '@/conf'
import { i18n, getLanguageMeta, setLocale } from '@/libs/init/i18n'
import { invoker } from '@/libs/commands/invoke'
import { getDataDirs } from '@/libs/init/dirs'
import { saveConfToFile, saveStartUpConfFile } from '@/libs/init/conf_file'
import { changeMasterPassword } from '@/libs/user_data/utils'
import { elOptionArrSort } from '@/utils/array'
import { happybytes } from '@/utils/bytes'
import { isMobileScreen } from '@/utils/media_query'
import { genDialogWidth } from '@/utils/utils'
import { genFileNamingRuleDemoHtml, genMasterPasswordSha256 } from '@/utils/hash'

const { t } = useI18n()
const appStore = useAppStore()

const masterPasswordOld = ref('')
const masterPasswordNew = ref('')
const chnageMasterPasswordFileVerification = ref(false)
const allFileSize = ref('0')

const getAllFileSize = async () => {
  const p = await getDataDirs()
  const size = await invoker.getDirSize(p.pathOfCurrentDir)
  allFileSize.value = happybytes(size, false)
}

// ---------- dialog ----------
const dialogVisible = ref(false)

const localeOld = ref('')
const onOpen = () => {
  dialogVisible.value = true
  localeOld.value = appStore.data.settings.normal.locale

  getAllFileSize()
}

const onSave = (close: boolean) => {
  if (close) {
    dialogVisible.value = false
  }

  // If locale changed
  const localeNew = appStore.data.settings.normal.locale
  if (localeNew !== localeOld.value) {
    if (i18n.global.availableLocales.indexOf(localeNew) >= 0) { // Check if the new locale is allowed
      setLocale(localeNew)
      localeOld.value = localeNew

      invoker.systemTrayUpdateText()

      // changeLocaleTimestamp
      const appData = appStore.data
      appData.changeLocaleTimestamp = new Date().getTime()
      appStore.setData(appData)
    }
  }

  saveConfToFile()
  saveStartUpConfFile()
}

const genLabelPosition = () => {
  if (isMobileScreen()) {
    return 'top'
  }

  return 'left'
}
// ---------- dialog end ----------

// ---------- master password ----------
const changeMasterPasswordVisible = ref(false)
const onToggleChangeMasterPassword = () => {
  changeMasterPasswordVisible.value = !changeMasterPasswordVisible.value
}
const onSaveMasterPassword = async () => {
  if (masterPasswordNew.value === '') {
    ElMessage.error(t('&Input new master password'))
    return false
  }
  const settings = appStore.data.settings
  if (settings.encryption.masterPassword !== genMasterPasswordSha256(masterPasswordOld.value, MasterPasswordSalt)) {
    ElMessage.error(t('&Invalid master password'))
    return false
  }

  const newPassword = genMasterPasswordSha256(masterPasswordNew.value, MasterPasswordSalt)
  const success = await changeMasterPassword(newPassword, chnageMasterPasswordFileVerification.value)
  if (success) {
    onToggleChangeMasterPassword()
    settings.encryption.masterPassword = newPassword
    appStore.setSettingData(settings, true)
  }
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
// ---------- master password end ----------

defineExpose({ onOpen })
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
