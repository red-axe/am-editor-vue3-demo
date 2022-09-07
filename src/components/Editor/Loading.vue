<template>
  <spin className="loading" :tip="text" :spinning="loading">
    <slot></slot>
  </spin>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Spin } from "ant-design-vue";

export default defineComponent({
  name: "am-loading",
  components: {
    Spin,
  },
  props: {
    text: String,
    loading: Boolean,
  },
});
</script>
<style css>
.loading {
  padding: 20px;
  display: block;
}

.ant-spin-nested-loading {
  position: inherit;
}
.ant-spin-nested-loading .ant-spin-container {
  position: inherit;
}
</style>
