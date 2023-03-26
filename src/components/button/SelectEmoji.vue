<template>
  <XPopover refId="notebookIconBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
    <template #reference>
      <el-button>{{ icon ? `${icon} ` : '' }}{{ t('Icon') }}</el-button>
    </template>

    <!-- TODO add "locale" and "pickerStyle" to VuemojiPicker -->
    <VuemojiPicker @emojiClick="onClick" :isDark="emojiPickerIsDark()" />
  </XPopover>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { VuemojiPicker, EmojiClickEventDetail } from 'vuemoji-picker'

import XPopover from '@/components/widget/XPopover.vue'

const props = defineProps({
  icon: {
    type: String,
    default: () => ('')
  }
})

// For better code hints. Refer: https://juejin.cn/post/7012814138145505287
interface emitType {
  (e: 'onClick', value: EmojiClickEventDetail): void
}

const emits = defineEmits<emitType>()
const { t } = useI18n()

const onClick = (detail: EmojiClickEventDetail) => {
  emits('onClick', detail)
}

const emojiPickerIsDark = () => {
  return true
}
</script>

<style lang="scss"></style>
