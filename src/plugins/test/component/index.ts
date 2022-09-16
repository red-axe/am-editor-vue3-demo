import {
  $,
  Card,
  CardToolbarItemOptions,
  CardType,
  isEngine,
  NodeInterface,
  ToolbarItemOptions,
} from "@aomao/engine";
import { App, createApp } from "vue";
import TestVue from "./test.vue";

class Test extends Card {
  static get cardName() {
    return "test";
  }

  static get cardType() {
    return CardType.BLOCK;
  }

  #container?: NodeInterface;
  #vm?: App;

  toolbar(): Array<ToolbarItemOptions | CardToolbarItemOptions> {
    if (!isEngine(this.editor) || this.editor.readonly) return [];
    return [
      {
        type: "dnd",
      },
      {
        type: "copy",
      },
      {
        type: "delete",
      },
      {
        type: "node",
        node: $("<span>测试按钮</span>"),
        didMount: (node) => {
          node.on("click", () => {
            alert("test button");
          });
        },
      },
    ];
  }

  render() {
    this.#container = $("<div>Loading</div>");
    return this.#container;
  }

  didRender() {
    super.didRender();
    this.#vm = createApp(TestVue, {});
    this.#vm.mount(this.#container?.get<HTMLElement>());
  }

  destroy() {
    super.destroy();
    this.#vm?.unmount();
  }
}
export default Test;
