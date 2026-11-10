export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // Keep all real bug/validity rules from stylelint-config-standard active:
    // - block-no-empty, color-no-invalid-hex, custom-property-no-missing-var-function,
    // - declaration-block-no-duplicate-properties, declaration-block-no-shorthand-property-overrides,
    // - font-family-no-duplicate-names, font-family-no-missing-generic-family-keyword,
    // - function-calc-no-unspaced-operator, keyframe-declaration-no-important,
    // - media-feature-name-no-unknown, no-duplicate-at-import-rules, no-invalid-double-slash-comments,
    // - property-no-unknown, selector-pseudo-class-no-unknown, selector-pseudo-element-no-unknown,
    // - selector-type-no-unknown, string-no-newline, unit-no-unknown.
    // Disable purely cosmetic/formatting preferences:
    "alpha-value-notation": null,
    "color-function-notation": null,
    "color-hex-length": null,
    "comment-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "custom-property-pattern": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "declaration-block-single-line-max-declarations": null,
    "declaration-empty-line-before": null,
    "font-family-name-quotes": null,
    "hue-degree-notation": null,
    "import-notation": null,
    "keyframes-name-pattern": null,
    "length-zero-no-unit": null,
    "media-feature-range-notation": null,
    "no-descending-specificity": null,
    "no-duplicate-selectors": null,
    "number-max-precision": null,
    "property-no-vendor-prefix": null,
    "rule-empty-line-before": null,
    "selector-attribute-quotes": null,
    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "selector-not-notation": null,
    "shorthand-property-no-redundant-values": null,
    "value-keyword-case": null,
    "value-no-vendor-prefix": null
  }
};
