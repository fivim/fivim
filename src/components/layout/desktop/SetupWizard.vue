<template>
  <div class="setup-wizard">
    <div class="p-4">
      <div class="highlight text-xxl pb-4">
        {{ AppName }} {{ t('Setup wizard') }}
      </div>

      <el-form label-width="150px" :label-position="genLabelPosition()" ref="ruleFormRef" :model="ruleForm"
        :rules="rules">
        <el-form-item :label="t('Language') + `(Language)`" prop="language">
          <el-select v-model="ruleForm.language" :placeholder="t('Select')" @change="onChangeLanguage" filterable
            class="w-full">
            <el-option v-for="(item, index) in settingOptions.language.sort(elOptionArrSort)" :key="index"
              :label="item.label + ' - ' + getLanguageMeta(item.value).nativeName" :value="item.value">
              <span class="fl">{{ item.label }}</span>
              <span class="fr color-secondary">{{ getLanguageMeta(item.value).nativeName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('Theme')" prop="theme">
          <el-select v-model="ruleForm.theme" :placeholder="t('Select')" @change="onChangeTheme" class="w-full">
            <el-option v-for="(item, index) in getThemeOptions()" :key="index" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('Master password')" prop="masterPassword">
          <el-input v-model="ruleForm.masterPassword" class="w-full" type="password" />
        </el-form-item>
        <el-form-item :label="t('Date time format')" prop="dateTimeFormat">
          <el-select v-model="ruleForm.dateTimeFormat" :placeholder="t('Select')" class="w-full">
            <el-option v-for="item in settingOptions.dateFormat" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('Working directory')" prop="workDir">
          <el-input v-model="ruleForm.workDir" @input="onInputWorkDir" class="w-auto" />
          <div class="mx-4 disp-inline">
            <el-button @click="onSelectWorkDir">{{ t('Select') }}</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="t('File extension')" prop="fileExt">
          <el-input v-model="ruleForm.fileExt" :placeholder="t('Can be empty')" @input="onInputFileExt" class="w-auto" />
          <div class="mx-4 disp-inline">
            <el-tooltip :content="t('&File extension tip')" raw-content effect="customized">
              <el-button>{{ t('Show tip') }}</el-button>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item :label="t('File naming rule')" prop="fileNameRule">
          <div class="w-full text-align-left">
            <el-select v-model="ruleForm.fileNameRule" :placeholder="t('Select')" @change="onInputFileNamingRule">
              <el-option v-for="item in settingOptions.fileNameRule" :key="item.value" :label="t(item.label)"
                :value="item.value" />
            </el-select>

            <div class="mx-4 disp-inline">
              <el-tooltip :content="fileNamingRuleDemoHtml" raw-content effect="customized">
                <el-button>{{ t('Show example') }}</el-button>
              </el-tooltip>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('Entry file name')" prop="entryFileName">
          <el-input v-model="ruleForm.entryFileName" />
        </el-form-item>

        <div class="p-2 w-full">
          <el-alert v-if="showErrorMsg" :title="errorMsg" type="error" show-icon />
        </div>

        <el-button type="primary" @click="onSave()"> {{ t('Confirm') }} </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { open as openDialog } from '@tauri-apps/api/dialog'
import type { FormInstance, FormRules } from 'element-plus'

import { ElOptionItem } from '@/types_common'
import {
  AppName,
  MasterPasswordSalt, MasterPasswordMinLength, MasterPasswordMaxLength,
  AvailableThemes, ReFileExt,
  DefaultSyncIntervalSeconds,
  DefaultLanguage, DefaultTimeFormat,
  DefaultFileExt, DefaultFileNameRule,
  DefaultThemeDark, DefaultThemeLight,
  DefaultListColSortBy, DefaultListColSortOrder
} from '@/constants'
import { settingOptions } from '@/conf'
import { useAppStore } from '@/pinia/modules/app'
import { useSettingStore } from '@/pinia/modules/settings'
import { initAtFirst } from '@/libs/init/at_first'
import { i18n, getLanguageMeta, setLocale } from '@/libs/init/i18n'
import { initCoreDirs } from '@/libs/init/dirs'
import { saveDefaultEntryFile } from '@/libs/user_data/entry_file'
import { genFileNamingRuleDemoHtml, genTimeHashedSign, TimeHashedSignType, genMasterPasswordSha256 } from '@/utils/hash'
import { elOptionArrSort } from '@/utils/array'
import { getAvailableLocale } from '@/utils/locale'
import { isMobileScreen, OsThemeIsDark } from '@/utils/media_query'
import { setTheme } from '@/utils/utils'

const getAvailableDefaultLocale = () => {
  const defaultLocale = getAvailableLocale(i18n.global.availableLocales, DefaultLanguage)
  setLocale(defaultLocale)

  const data = settingStore.data
  data.normal.language = defaultLocale
  settingStore.setData(data, false)

  return defaultLocale
}

const getThemeOptions = () => {
  const res: ElOptionItem[] = []
  for (const i of AvailableThemes) {
    res.push({
      label: i,
      value: i
    })
  }
  return res
}

const getDefalutTheme = () => {
  const res = OsThemeIsDark() ? DefaultThemeDark : DefaultThemeLight
  setTheme(res)
  return res
}

const getEntryFileName = (fileNameRule: TimeHashedSignType, dateTimeFormat: string, fileExt: string) => genTimeHashedSign(fileNameRule, dateTimeFormat, fileExt)

const appStore = useAppStore()
const settingStore = useSettingStore()
const { t } = useI18n()
const ruleFormRef = ref<FormInstance>()

const showErrorMsg = ref(false)
const errorMsg = ref('')

const ruleForm = reactive({
  language: getAvailableDefaultLocale(),
  theme: getDefalutTheme(),
  masterPassword: '',
  dateTimeFormat: DefaultTimeFormat,
  workDir: '',
  fileExt: DefaultFileExt,
  fileNameRule: DefaultFileNameRule,
  entryFileName: getEntryFileName(DefaultFileNameRule, DefaultTimeFormat, DefaultFileExt)
})

// Custom validator for Master password.
const validateMasterPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('Please input')))
  }

  if (!settingStore.checkMasterPasswordLength(value)) {
    callback(new Error(t('&Master password length tip', { minLength: MasterPasswordMinLength, maxLength: MasterPasswordMaxLength })))
  }
}

// Custom validator for fileExt.
const validateFileExt = (rule: any, value: any, callback: any) => {
  if (value !== '' && !ReFileExt.test(value)) {
    callback(new Error(t('&File extension format error')))
  }
}

// Custom validator for required fields.
const validateRequired = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('Please input')))
  }
}

// If set message in rules, it won't change translate after change language.
// Use custom validator to resolve this issue.
const rules = reactive<FormRules>({
  language: [
    {
      required: true,
      validator: validateRequired,
      trigger: 'change'
    }
  ],
  theme: [
    {
      required: true,
      validator: validateRequired,
      trigger: 'change'
    }
  ],
  masterPassword: [
    {
      required: true,
      validator: validateMasterPassword,
      trigger: 'blur'
    }
  ],
  dateTimeFormat: [
    {
      required: true,
      validator: validateRequired,
      trigger: 'change'
    }
  ],
  workDir: [
    {
      required: true,
      validator: validateRequired,
      trigger: 'blur'
    }
  ],
  fileExt: [{
    validator: validateFileExt,
    trigger: 'change'
  }],
  fileNameRule: [
    {
      required: true,
      validator: validateRequired,
      trigger: 'change'
    }
  ],
  entryFileName: [
    {
      required: true,
      validator: validateRequired,
      trigger: 'blur'
    }
  ]
})

const genLabelPosition = () => {
  if (isMobileScreen()) {
    return 'top'
  }

  return 'left'
}

const fileNamingRuleDemoHtml = ref('')
fileNamingRuleDemoHtml.value = genFileNamingRuleDemoHtml(t, ruleForm.dateTimeFormat, ruleForm.fileExt)

const onChangeLanguage = (newLanguage: string) => {
  setLocale(newLanguage)
  fileNamingRuleDemoHtml.value = genFileNamingRuleDemoHtml(t, ruleForm.dateTimeFormat, ruleForm.fileExt)
}

const onChangeTheme = (newTheme: string) => {
  ruleForm.theme = newTheme
  setTheme(newTheme)
}

const onInputFileExt = (detail: string) => {
  ruleForm.entryFileName = genTimeHashedSign(ruleForm.fileNameRule, ruleForm.dateTimeFormat, detail)
}

const onInputFileNamingRule = (detail: keyof typeof TimeHashedSignType) => {
  ruleForm.entryFileName = genTimeHashedSign(detail, ruleForm.dateTimeFormat, ruleForm.fileExt)
}

const onSelectWorkDir = () => {
  openDialog({
    directory: true
  }).then((selected: string | string[] | null) => {
    let dir = ''
    if (Array.isArray(selected)) { // user selected multiple directories
    } else if (selected === null) { // user cancelled the selection
    } else { // user selected a single directory
      dir = selected
    }

    ruleForm.workDir = dir
  })
}

const onInputWorkDir = (detail: string) => {
  ruleForm.workDir = detail
}

const onSave = () => {
  // Check master password.
  showErrorMsg.value = !settingStore.checkMasterPasswordLength(ruleForm.masterPassword)
  if (showErrorMsg.value) {
    errorMsg.value = t('&Master password length tip', { minLength: MasterPasswordMinLength, maxLength: MasterPasswordMaxLength })
    return
  }

  if (ruleForm.fileExt !== '' && !ReFileExt.test(ruleForm.fileExt)) {
    showErrorMsg.value = true
    errorMsg.value = t('&File extension format error')
    return
  }

  const appData = appStore.data
  appData.existConfigFile = true
  appStore.setData(appData)

  setTheme(ruleForm.theme)

  const settingData = settingStore.data
  settingData.normal.language = ruleForm.language
  settingData.normal.workDir = ruleForm.workDir
  settingData.encryption.entryFileName = ruleForm.entryFileName
  settingData.encryption.fileExt = ruleForm.fileExt
  settingData.encryption.fileNameRule = ruleForm.fileNameRule
  settingData.encryption.entryFileName = genTimeHashedSign(ruleForm.fileNameRule, ruleForm.dateTimeFormat, ruleForm.fileExt)
  settingData.encryption.syncLockFileName = genTimeHashedSign(ruleForm.fileNameRule, ruleForm.dateTimeFormat, ruleForm.fileExt)
  settingData.encryption.masterPassword = genMasterPasswordSha256(ruleForm.masterPassword, MasterPasswordSalt)
  settingData.appearance.dateTimeFormat = ruleForm.dateTimeFormat
  settingData.appearance.listColSortBy = DefaultListColSortBy
  settingData.appearance.listColSortOrder = DefaultListColSortOrder
  settingData.appearance.theme = ruleForm.theme
  settingData.sync.intervalSeconds = DefaultSyncIntervalSeconds

  // initCoreDirs before settingStore save config
  initCoreDirs().then(() => {
    settingStore.setData(settingData, true).then(() => {
      saveDefaultEntryFile()
      // TODO save sync lock file

      const pwdSha256 = genMasterPasswordSha256(settingData.encryption.masterPassword, MasterPasswordSalt)
      initAtFirst(pwdSha256)
    })
  })
}
</script>

<style lang="scss" scoped>
.setup-wizard {
  height: 100vh;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
}
</style>
