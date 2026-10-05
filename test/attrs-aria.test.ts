import { component, html } from "../src/haunted.js";
import { fixture, expect, nextFrame } from "@open-wc/testing";

describe("Observed attributes with inherited accessors", () => {
  it("re-renders and reflects value changes, including removal", async () => {
    const tag = "attrs-aria-expanded-test";
    customElements.define(
      tag,
      // the renderer reads the camelCase property: notification works
      // independently of what the renderer reads
      component(function (this: HTMLElement) {
        return html`<div>aria-expanded=${(this as HTMLElement & { ariaExpanded?: string }).ariaExpanded ?? "null"}</div>`;
      }, { observedAttributes: ["aria-expanded"] })
    );

    const el = (await fixture(
      html`<attrs-aria-expanded-test aria-expanded="false"></attrs-aria-expanded-test>`
    )) as HTMLElement;
    await nextFrame();
    expect(el.shadowRoot.textContent).to.equal("aria-expanded=false");

    el.setAttribute("aria-expanded", "true");
    await nextFrame();
    expect(el.shadowRoot.textContent).to.equal("aria-expanded=true");

    el.removeAttribute("aria-expanded");
    await nextFrame();
    expect(el.shadowRoot.textContent).to.equal("aria-expanded=null");
  });

  it("preserves attribute values verbatim", async () => {
    // ARIAMixin setters stringify and coerce; the attribute is the source
    // of truth and must survive a change notification untouched
    const tag = "attrs-aria-identity-test";
    customElements.define(
      tag,
      component(() => html`<div></div>`, { observedAttributes: ["aria-expanded"] })
    );

    const el = (await fixture(html`<attrs-aria-identity-test></attrs-aria-identity-test>`)) as HTMLElement;

    el.setAttribute("aria-expanded", "");
    await nextFrame();
    expect(el.getAttribute("aria-expanded")).to.equal("");

    el.setAttribute("aria-expanded", "0");
    await nextFrame();
    expect(el.getAttribute("aria-expanded")).to.equal("0");
  });

  it("invokes base class setters with the raw value and re-renders", async () => {
    class Labeled extends HTMLElement {
      #label = "";
      get label(): string { return this.#label; }
      set label(v: unknown) { this.#label = v; }
    }
    const tag = "attrs-base-accessor-test";
    customElements.define(
      tag,
      // the renderer reads the accessor's backing property: the attribute
      // change must have reached the setter before this render
      component(function (this: HTMLElement & { label?: unknown }) {
        return html`<div>label=${String((this as HTMLElement & { label?: unknown }).label)}</div>`;
      }, { baseElement: Labeled, observedAttributes: ["label"] })
    );

    const el = (await fixture(
      html`<attrs-base-accessor-test></attrs-base-accessor-test>`
    )) as HTMLElement & { label?: unknown };

    el.setAttribute("label", "x");
    await nextFrame();

    expect(el.label).to.equal("x");
    expect(el.shadowRoot.textContent).to.equal("label=x");
  });

  it("keeps fresh-key attributes on the camelCase property path", async () => {
    const tag = "attrs-fresh-key-test";
    customElements.define(
      tag,
      component(function (this: HTMLElement & { option?: unknown }) {
        return html`<div>${String((this as HTMLElement & { option?: unknown }).option)}</div>`;
      }, { observedAttributes: ["option"] })
    );

    const el = (await fixture(html`<attrs-fresh-key-test option></attrs-fresh-key-test>`)) as HTMLElement & { option?: unknown };

    expect(el.option).to.be.true;
  });
});