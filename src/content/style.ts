export const STYLE = `
  :host { all: initial; }
  .panel {
    position: fixed; z-index: 2147483647; width: 240px; max-height: 70vh; overflow: auto;
    box-sizing: border-box; padding: 6px 0; border-radius: 8px; font: 14px/1.3 system-ui, sans-serif;
    background: #fff; color: #1c1c1c; border: 1px solid #edeff1; box-shadow: 0 4px 16px rgba(0,0,0,.25);
  }
  @media (prefers-color-scheme: dark) {
    .panel { background: #1a1a1b; color: #d7dadc; border-color: #343536; }
    .item:hover { background: #272729; }
  }
  .title { padding: 6px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; opacity: .6; }
  .item {
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 16px; border: 0;
    background: none; color: inherit; font: inherit; text-align: left; cursor: pointer;
  }
  .item:hover { background: #f6f7f8; }
  .item[disabled] { cursor: default; opacity: .7; }
  .avatar { width: 24px; height: 24px; border-radius: 50%; background: #ff4500; flex: none; object-fit: cover; }
  .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .check { color: #0079d3; }
  .sep { height: 1px; margin: 4px 0; background: #edeff1; }
  .error { padding: 8px 16px; color: #ea0027; font-size: 12px; }
  @media (prefers-color-scheme: dark) { .sep { background: #343536; } }
`;
