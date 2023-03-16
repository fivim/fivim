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
        "noteBooks1.json"
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
        "real file name",
        "hashed file name",
        "upload time"
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
        "summary",
        "type",
        "content",
        "updateTime",
        "createTime",
        "tagsHashedSign"
    ],
    "dataArr": [
        [
            "note_hashedSign_111",
            "note title 111",
            "🌎",
            "note summary 111",
            "note",
            "note content 111",
            "2022-12-12 08:03:23",
            "2022-11-06 20:46:06",
            "NaqBIJB1,gfxJK3oJ"
        ],
        [
           "note_hashedSign_222",
            "note title 222",
            "😺",
            "note summary 222",
            "note",
            "note content 222",
            "2022-12-23 16:23:43",
            "2022-02-12 09:45:36",
            "NaqBIJB1"
        ]
    ]
}
```
