<template>
  <Space class="header" data-element="ui" @mousedown="handleMouseDown">
    <Button @click="handleReadonly">{{
      engine?.readonly ? "编辑" : "只读"
    }}</Button>
    <Select v-model:value="markType" style="width: 120px">
      <SelectOption value="mark"> 文档中标记 </SelectOption>
      <SelectOption value="block"> 获取光标最近的block </SelectOption>
      <SelectOption value="point"> 坐标 </SelectOption>
    </Select>
    <Button @click="handleMark">确认</Button>
    <Button @click="handleDoc1">文章1</Button>
    <Button @click="handleDoc2">文章2</Button>
    <Button @click="handleDocGroup">组合</Button>
    <Button @click="handleBoldCommand">加粗</Button>
    <Button @click="handleTableCommand">插入表格</Button>
    <Button @click="handleTestCommand">插入Test插件</Button>
    <Select v-model:value="valueType" style="width: 120px">
      <SelectOption value="value"> getValue </SelectOption>
      <SelectOption value="json"> getJsonValue </SelectOption>
      <SelectOption value="html"> getHtml </SelectOption>
    </Select>
    <Button @click="handleGet">打印</Button>
    <Button @click="handleHeading">打印h1-h5</Button>
    <Button @click="handleAddAttr">添加属性</Button>
    <Button @click="handleHotkey">拦截快捷键</Button>
    <Button @click="handleGetAllCardValue">打印所有卡片值</Button>
  </Space>
  <Editor ref="editor" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { Space, Button, Select } from "ant-design-vue";
import {
  $,
  CARD_KEY,
  CARD_SELECTOR,
  CARD_VALUE_KEY,
  decodeCardValue,
  EngineInterface,
  NodeInterface,
  Range,
} from "@aomao/engine";
import Editor from "@/components/Editor/Main.vue"; // @ is an alias to /src
import { setCurrentKey, getDocValue } from "@/utils";

export default defineComponent({
  components: {
    Select,
    SelectOption: Select.Option,
    Button,
    Space,
    Editor,
  },
  setup() {
    const editor = ref<typeof Editor | null>(null);
    const engine = ref<EngineInterface | null>(null);
    const markType = ref<string>("mark");
    const valueType = ref<string>("value");
    const hotkeyEnable = ref<boolean>(false);
    const box = ref<NodeInterface | null>(null);

    onMounted(() => {
      engine.value = editor.value ? editor.value.engine : null;
    });

    return {
      editor,
      engine,
      box,
      markType,
      valueType,
      hotkeyEnable,
    };
  },
  methods: {
    handleMouseDown(event: MouseEvent) {
      // 点击外部按钮避免编辑器光标丢失
      event.preventDefault();
    },
    // 设置是否只读
    handleReadonly() {
      if (!this.engine) return;
      this.engine.readonly = !this.engine.readonly;
    },
    handleDocMark(engine: EngineInterface) {
      // 预览标记
      engine.command.executeMethod("mark-range", "action", "mark", "preview");
      setTimeout(() => {
        // 立即应用标记到文档，id 为 test
        engine.command.executeMethod(
          "mark-range",
          "action",
          "mark",
          "apply",
          "test"
        );
      }, 0);
    },
    handleRangeBlock(engine: EngineInterface) {
      const { change, root } = engine;
      // 创建一个浮动盒子
      if (!this.box) {
        this.box = $("<div>I`m Box</div>");
        this.box.css({
          position: "absolute",
          border: "1px solid #f0f0f0",
          "border-radius": "4px",
          padding: "8px",
          background: "#fff",
        });
        // 放在编辑器根节点下，根节点是离编辑器最近的可以有滚动条的节点
        root.append(this.box);
      }
      const { blocks } = change;
      if (blocks.length > 0) {
        // 获取滚动条节点的位置
        const rootRect = root.get<HTMLElement>()!.getBoundingClientRect();
        // 获取选中的第一个block节点的位置
        const blockRect = blocks[0].get<HTMLElement>()!.getBoundingClientRect();
        // 计算相对于滚动条节点的相对位置
        const top = blockRect.y - rootRect.y;
        const left = blockRect.x - rootRect.x;
        this.box.css({
          top: `${top}px`,
          left: `${left - this.box.width()}px`,
        });
      }
    },
    handlePoint(engine: EngineInterface) {
      const containerRect = engine.container.get<HTMLElement>()!.getBoundingClientRect();
      // 开始坐标
      const startRange = Range.create(engine, document, {
        x: containerRect.x + 80,
        y: containerRect.y + 80,
      });
      // 结束坐标
      const endRange = Range.create(engine, document, {
        x: containerRect.x + 100,
        y: containerRect.y + 120,
      });
      // 组合新的光标
      const newRange = Range.from(engine)?.cloneRange();
      if (newRange) {
        newRange.setStart(startRange.startNode, startRange.startOffset);
        newRange.setEnd(endRange.startNode, endRange.startOffset);
        engine.change.range.select(newRange);
        console.log(newRange.getSubRanges());
      }
    },
    // 处理标记
    handleMark() {
      if (!this.engine) return;
      // 文档内标记
      if (this.markType === "mark") {
        this.handleDocMark(this.engine as EngineInterface);
      }
      // 浮动盒子到光标最近的block节点
      else if (this.markType === "block") {
        this.handleRangeBlock(this.engine as EngineInterface);
      }
      // 从坐标位置获取选中节点
      else if (this.markType === "point") {
        this.handlePoint(this.engine as EngineInterface);
      }
    },
    // 组合文章
    handleDoc1() {
      if (!this.engine) return;
      setCurrentKey("demo1");
      this.engine.setValue(getDocValue() || "");
    },
    handleDoc2() {
      if (!this.engine) return;
      setCurrentKey("demo2");
      this.engine.setValue(getDocValue() || "");
    },
    handleDocGroup() {
      if (!this.engine) return;
      const doc1 = new DOMParser().parseFromString(
        getDocValue("demo1") || "",
        "text/html"
      );
      const doc2 = new DOMParser().parseFromString(
        getDocValue("demo2") || "",
        "text/html"
      );
      const newValue =
        (doc1.body.firstElementChild?.outerHTML || "") +
        doc2.body.lastElementChild?.outerHTML;
      setCurrentKey();
      this.engine.setValue(newValue);
    },
    // 执行插件命令
    handleBoldCommand() {
      if (!this.engine) return;
      this.engine.command.execute("bold");
    },
    handleTableCommand() {
      if (!this.engine) return;
      // 插入4行3列的表格
      this.engine.command.execute("table", 4, 3);
    },
    handleTestCommand() {
      if (!this.engine) return;
      this.engine.command.execute("test");
    },
    // 获取内容
    handleGet() {
      if (!this.engine) return;
      switch (this.valueType) {
        case "json":
          return console.log("getJsonValue", this.engine.getJsonValue());
        case "html":
          return console.log("getHtml", this.engine.getHtml());
        default:
          console.log("getValue", this.engine.getValue());
      }
    },
    // 打印h1-h5
    handleHeading() {
      if (!this.engine) return;
      this.engine;
      const headings = this.engine.container.find("h1,h2,h3,h4,h5,h6");
      headings.each((_, index) => {
        const heading = headings.eq(index)!;
        console.log(
          heading.name,
          "id:",
          heading.attributes("id"),
          "text:",
          heading.text()
        );
      });
    },
    // 添加属性
    handleAddAttr() {
      if (!this.engine) return;
      const { change, schema } = this.engine;
      const { blocks } = change;
      if (blocks.length > 0) {
        const rule = schema.getRule(blocks[0]);
        if (rule) {
          rule.attributes = { ...rule.attributes, "custome-attr": "*" };
        }
        blocks[0].attributes("custome-attr", "this is custome-attr");
      }
    },
    // 拦截快捷键
    handleHotkey() {
      // 拦截过了就不再拦截，以免重复覆盖
      if (!this.engine || this.hotkeyEnable) return;
      this.hotkeyEnable = true;
      const plugins = this.engine.plugin.components;
      Object.keys(plugins).forEach((pluginName) => {
        const plugin = plugins[pluginName];
        if (plugin.hotkey) {
          (plugin as any).oldHotkey = plugin.hotkey;
          plugin.hotkey = (e: KeyboardEvent) => {
            const oldkey = (plugin as any).oldHotkey(e);
            if (pluginName === "bold") {
              return "b";
            }
            return oldkey;
          };
        }
      });
    },
    //打印所有卡片值
    handleGetAllCardValue() {
      if (!this.engine) return;
      // 第一种直接获取实例
      this.engine.card.components.forEach((card) => {
        console.log("1. name:", card.name, "value:", card.getValue());
      });
      // 第二种获取dom
      const cards = this.engine.container.find(CARD_SELECTOR);
      cards.each((_, index) => {
        const card = cards.eq(index);
        if (card) {
          const name = card.attributes(CARD_KEY);
          const value = card.attributes(CARD_VALUE_KEY);
          console.log("2. name:", name, "value:", decodeCardValue(value));
        }
      });
    },
  },
});
</script>
<style lang="less">
.header {
  padding: 12px;
}
/** 编辑器中标记样式 ---- 开始 **/
[data-mark-preview],
[data-mark-id] {
  position: relative;
}

span[data-mark-preview],
span[data-mark-id] {
  display: inline-block;
}

[data-mark-preview]::before,
[data-mark-id]::before {
  content: "";
  position: absolute;
  width: 100%;
  bottom: 0px;
  left: 0;
  height: 2px;
  border-bottom: 2px solid #f8e1a1 !important;
}

[data-mark-preview] {
  background: rgb(250, 241, 209) !important;
}

[data-card-key][data-mark-id]::before,
[data-card-key][data-mark-preview]::before {
  bottom: -2px;
}
/** 编辑器中标记样式 ---- 结束 **/
</style>
