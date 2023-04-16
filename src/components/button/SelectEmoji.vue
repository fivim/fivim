<template>
  <XPopover refId="notebookIconBtnPop" placement="bottom-start" trigger="click" :propTitle="t('Icon')" :widthAuto="true">
    <template #reference>
      <el-button>{{ icon ? `${icon} ` : '' }}{{ t('Icon') }}</el-button>
    </template>

    <!-- TODO add "locale" -->
    <VuemojiPicker @emojiClick="onClick" />
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
</script>

<style lang="scss">
emoji-picker {
  --background: var(--enas-background-primary-color);
  --border-color: var(--enas-border-color);
  --button-active-background: var(--enas-background-secondary-color);
  --button-hover-background: var(--enas-background-secondary-color);
  --category-font-color: var(--enas-foreground-primary-color);
  --indicator-color: var(--enas-highlight-color);
  --input-border-color: var(--enas-border-color);
  --input-font-color: var(--enas-foreground-primary-color);
  --input-placeholder-color: var(--enas-foreground-primary-color);
  --outline-color: var(--enas-highlight-color);
}
</style>
