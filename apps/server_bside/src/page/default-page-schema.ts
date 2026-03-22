export const DEFAULT_PAGE_SCHEMA = {
  "id": "root_q4DDQuSo",
  "name": "根节点",
  "type": "@orangehome/common-component-rootcontainer",
  "style": {
    "width": "100%",
    "minHeight": "",
    "boxSizing": "border-box",
    "padding": "",
    "background": "linear-gradient(180deg, #fff6fb 0%, #f6f7ff 42%, #fffdf8 100%)",
    "height": "100%"
  },
  "props": {},
  "children": [
    {
      "id": "orangehomecommoncomponenttext_QsCNy4CQ",
      "name": "文本",
      "type": "@orangehome/common-component-text",
      "props": {
        "text": "你的第一个页面"
      },
      "children": []
    },
    {
      "id": "orangehomecommoncomponentbutton_Vd1nOCOR",
      "name": "按钮",
      "type": "@orangehome/common-component-button",
      "props": {
        "text": "按钮"
      },
      "style": {
        "marginTop": 78,
        "marginLeft": 15
      },
      "children": []
    },
    {
      "id": "orangehomecommoncomponentimage_cXY4QvhA",
      "name": "图片",
      "type": "@orangehome/common-component-image",
      "props": {
        "url": "http://192.168.1.91:33035/orangehome/images/2026-03-22/c9484a9e-61b5-4d4a-90b2-3a672b29a76a-image.png"
      },
      "style": {
        "width": 221,
        "height": 267,
        "marginTop": 57,
        "marginLeft": 21
      },
      "children": []
    }
  ]
} as const;

export const DEFAULT_PAGE_SCHEMA_JSON = JSON.stringify(DEFAULT_PAGE_SCHEMA);
