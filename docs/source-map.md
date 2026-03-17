# Source Map

| 卡片 | 指標 | 官方來源 | 取數方式 |
| --- | --- | --- | --- |
| 就業 | 失業率、就業不足率、勞動人口 | `C&SD 210-06101` | `api/get.php?full_series=1&id=210-06101&lang=tc` |
| 通脹 | 綜合 CPI 按年變動 | `C&SD 510-60001A` | 抓取綜合 CPI 指數後自行計算 YoY |
| GDP | 實質增長、名義增長 | `C&SD 310-31003`, `310-31002` | 抓取 GDP 序列後自行計算 YoY |
| 消費與旅遊 | 零售銷售額、旅客入境 | `C&SD 620-67001`, `ImmD daily passenger traffic` | 零售用 C&SD API；旅客入境以入境處日資料聚合月度 |
| 最低工資 | 法定最低工資 | 勞工處 `mwo.htm` | HTML regex 抽取現行時薪 |
| 人口 | 人口總量、出生數、年齡中位數 | `C&SD 110-01002`, `110-01004`, `DH births CSV` | C&SD API + 衞生署 CSV |
| 住屋 | 私樓售價、租金指數、落成量 | 差餉物業估價署 CSV | 直接抓官方 CSV |
| 公共財政 | 收入、支出、儲備 | 庫務署季度帳目、FSTB CSV | 季度帳目 zip CSV + 財政儲備 CSV |
| 利率 | HKMA Base Rate、1個月 HIBOR | HKMA Public API | JSON API |

## Parser 原則

- 每個來源獨立 adapter，不共用 parser。
- 月度指標預設保留近 12 期 sparkline。
- 季度指標預設保留近 8 季。
- 若資料源改版，優先回退到上一版 `dashboard.json`，避免整站空白。
