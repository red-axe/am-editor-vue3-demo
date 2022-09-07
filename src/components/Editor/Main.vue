<template>
  <am-loading :loading="loading">
    <am-toolbar v-if="engine" :engine="engine" :items="items" />
    <div :class="['editor-wrapper', { 'editor-mobile': isMobile }]">
      <div class="editor-container">
        <div class="editor-content">
          <div ref="container"></div>
        </div>
      </div>
    </div>
  </am-loading>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { message, Modal } from "ant-design-vue";
import Engine, {
  $,
  EngineInterface,
  isMobile,
  removeUnit,
} from "@aomao/engine";
import AmToolbar from "@aomao/toolbar-vue";
import AmLoading from "./Loading.vue";
import { cards, plugins, pluginConfig, onLoad } from "./config";
import { getDocValue, setDocValue } from "@/utils";

export default defineComponent({
  name: "engine-demo",
  components: {
    AmLoading,
    AmToolbar,
  },
  data() {
    // toolbar 配置项
    return {
      items: [
        ["collapse"],
        ["undo", "redo", "paintformat", "removeformat"],
        ["heading", "fontfamily", "fontsize"],
        ["bold", "italic", "strikethrough", "underline", "moremark"],
        ["fontcolor", "backcolor"],
        ["alignment"],
        ["unorderedlist", "orderedlist", "tasklist", "indent", "line-height"],
        ["link", "quote", "hr"],
      ],
    };
  },
  setup() {
    // 编辑器容器
    const container = ref<HTMLElement | null>(null);
    // 编辑器引擎
    const engine = ref<EngineInterface | null>(null);
    // 当前所有协作用户
    const members = ref([]);
    // 默认设置为当前在加载中
    const loading = ref(true);
    onMounted(() => {
      // 容器加载后实例化编辑器引擎
      if (container.value) {
        //实例化引擎
        const engineInstance = new Engine(container.value, {
          // 启用的插件
          plugins,
          // 启用的卡片
          cards,
          // 所有的卡片配置
          config: pluginConfig,
        });
        onLoad(engineInstance);
        // 设置显示成功消息UI，默认使用 console.log
        engineInstance.messageSuccess = (msg: string) => {
          message.success(msg);
        };
        // 设置显示错误消息UI，默认使用 console.error
        engineInstance.messageError = (error: string) => {
          message.error(error);
        };
        // 设置显示确认消息UI，默认无
        engineInstance.messageConfirm = (msg: string) => {
          return new Promise<boolean>((resolve, reject) => {
            Modal.confirm({
              content: msg,
              onOk: () => resolve(true),
              onCancel: () => reject(),
            });
          });
        };
        //卡片最大化时设置编辑页面样式
        engineInstance.on("card:maximize", () => {
          $(".editor-toolbar").css("z-index", "9999").css("top", "55px");
        });
        engineInstance.on("card:minimize", () => {
          $(".editor-toolbar").css("z-index", "").css("top", "");
        });
        // 增加首行缩进
        const addIndent = () => {
          const children = engineInstance.container.children();
          children.each((_, index) => {
            const child = children.eq(index);
            // 节点没有缩进，并且不是空行就设置一个2em的缩进
            if (
              child &&
              !removeUnit(child.css("text-indent")) &&
              !child.isCard() &&
              !engineInstance.node.isEmpty(child)
            ) {
              engineInstance.command.executeMethod(
                "indent",
                "addPadding",
                child,
                2,
                10
              );
            }
          });
        };
        engineInstance.on("afterSetValue", addIndent);
        engineInstance.on("paste:after", addIndent);
        // 默认编辑器值，为了演示，这里初始化值写死，正式环境可以请求api加载
        const value = getDocValue() || "<strong>Hello</strong>,This is demo";
        // 非协同编辑，设置编辑器值，异步渲染后回调
        engineInstance.setValue(value, () => {
          loading.value = false;
        });

        // 监听编辑器值改变事件
        engineInstance.on("change", () => {
          const { value, paths } = engineInstance.command.executeMethod(
            "mark-range",
            "action",
            "mark",
            "filter",
            engineInstance.getValue()
          );
          setDocValue(value);
          console.log("value", value);
          console.log("html:", engineInstance.getHtml());
        });

        engine.value = engineInstance;
      }
    });

    onUnmounted(() => {
      if (engine.value) engine.value.destroy();
    });

    return {
      loading,
      isMobile,
      container,
      engine,
      members,
    };
  },
});
</script>
<style>
#app {
  padding: 0;
}
#nav {
  position: relative;
}

.editor-toolbar {
  position: fixed;
  width: 100%;
  background: #ffffff;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.02);
  z-index: 1000;
}
.editor-wrapper {
  position: relative;
  width: 100%;
  min-width: 1440px;
}

.editor-wrapper.editor-mobile {
  min-width: auto;
  padding: 0 12px;
}

.editor-container {
  background: #fafafa;
  background-color: #fafafa;
  padding: 62px 0 64px;
  height: calc(100vh - 56px);
  width: 100%;
  margin: 0 auto;
  overflow: auto;
  position: relative;
}

.editor-mobile .editor-container {
  padding: 0;
  height: auto;
  overflow: hidden;
}

.editor-content {
  position: relative;
  width: 812px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #f0f0f0;
  min-height: 800px;
}

.editor-mobile .editor-content {
  width: auto;
  min-height: calc(100vh - 68px);
  border: 0 none;
}

.editor-content .am-engine {
  padding: 40px 60px 60px;
}

.editor-mobile .editor-content .am-engine {
  padding: 18px 0 0 0;
}
</style>
