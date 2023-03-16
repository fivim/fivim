# Inner file data struct

## Entry file

```json
{
  "dataVersion": 1,
  "noteBooks": {
    "attrsArr": [
      "title",
      "icon",
      "hashedSign"
    ],
    "dataArr": [
      [
        "notebook name",
        "🖥",
        "5cf7415d6b466ab6870ab643dad425775e0fe5244d25ff0078c0e39b9e8de4f3"
      ]
    ]
  },
  "tags": {
    "attrsArr": [
      "title",
      "icon",
      "hashedSign"
    ],
    "dataArr": [
      [
        "tag 111",
        "9️⃣",
        "NaqBIJB1"
      ],
      [
        "tag 222",
        "1️⃣",
        "gfxJK3oJ"
      ]
    ]
  },
  "attachments": {
    "attrsArr": [
      "fileName",
      "hashedSign",
      "uploadTime"
    ],
    "dataArr": [
      [
        "fileName.data",
        "aadbf3bd477afe9df7a6fb38cf9bfd84288dc06e8c405bdbd3ab4038e33a099c",
        "2022-12-12 08:00:09"
      ]
    ]
  },
}
```

## Notebook file

All the notes in a notebook are stored in one notebook file.

```json
{
    "dataVersion": 1,
    "attrsArr": [
        "hashedSign",
        "title",
        "icon",
        "type",
        "content",
        "updateTime",
        "createTime",
        "tagsHashedSign"
    ],
    "dataArr": [
        [
            "db2e231f458c8d2be7cd443362cdc1392b29a528ab100e0eb29dae3c9886d207",
            "note title 111",
            "🌎",
            "note",
            "note content 111",
            "2022-12-12 08:03:23",
            "2022-11-06 20:46:06",
            "NaqBIJB1,gfxJK3oJ"
        ],
        [
           "c3bf42cb0625e373dea9763b7fb9c4e8dee9f8565cdff4c4a0ab073e98f2e305",
            "note title 222",
            "😺",
            "note",
            "note content 222",
            "2022-12-23 16:23:43",
            "2022-02-12 09:45:36",
            "NaqBIJB1"
        ]
    ]
}
```
