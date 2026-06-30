---
title: Music
slug: music
type: topic
date: 2026-06-30
---

# Playlists

[*All Music *]{.spurious-link target="All Music "} [English
Music](org-ql-tree:(and (tags "en"))) [Dance
Music](org-ql-tree:(and (tags "dance"))) [Pure
Music](org-ql-tree:(and (tags "pure"))) [Working
Music](org-ql-tree:(or (tags "pure") (tags "working"))) [1
stars](org-ql-tree: (property "RATE" "1")) [2
stars](org-ql-tree: (property "RATE" "2")) [3
stars](org-ql-tree: (property "RATE" "3")) [4
stars](org-ql-tree: (property "RATE" "4")) [5
stars](org-ql-tree: (property "RATE" "5")) [Taylor
Swift](org-ql-tree: (regexp "Taylor Swift*")) [Earth Wind &
Fire](org-ql-tree: (regexp "Earth, Wind & Fire*"))

# configurations {#configurations visibility="hideall"}

```{=org}
#+STARTUP: showall showstars indent
```
```{=org}
#+KEYMAP: <SPC> | (lambda () "play/pause" (interactive) (emms-pause))
```
```{=org}
#+KEYMAP: c | org-music-play-song-at-point
```
```{=org}
#+KEYMAP: C | (lambda () "play contextual music continuously" (interactive) (org-music-play-contextual-music t))
```
```{=org}
#+KEYMAP: e | org-music-enqueue-song-at-point
```
```{=org}
#+KEYMAP: E | my-org-music-mode-toggle-editing
```
```{=org}
#+KEYMAP: n | (lambda () "play next track in playlist" (interactive) (emms-next))
```
```{=org}
#+KEYMAP: o | (lambda ()(interactive) (my-org-music-mode-toggle-editing)(evil-org-open-below))
```
```{=org}
#+KEYMAP: p | (lambda () "play previous track in playlist" (interactive) (emms-previous))
```
```{=org}
#+KEYMAP: R | (lambda () "play previous random track in playlist" (interactive) (org-music-play-random-song))
```
```{=org}
#+KEYMAP: r | (lambda () "play next random track in playlist" (interactive) (org-music-play-random-songs))
```
```{=org}
#+KEYMAP: J | org-music-jump-to-current-song
```
```{=org}
#+KEYMAP: j | evil-next-line
```
```{=org}
#+KEYMAP: k | evil-previous-line
```
```{=org}
#+KEYMAP: h | evil-backward-char
```
```{=org}
#+KEYMAP: l | evil-forward-char
```
```{=org}
#+KEYMAP: M-p | (lambda () (interactive) (save-buffer)(my-org-music-mode-toggle-editing))
```
```{=org}
#+KEYMAP: q | doom/save-and-kill-buffer
```
```{=org}
#+KEYMAP: me | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "en"))))             ;; English Music
```
```{=org}
#+KEYMAP: mc | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "cn"))))             ;; China Music
```
```{=org}
#+KEYMAP: mf | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "fr"))))             ;; French Music
```
```{=org}
#+KEYMAP: mj | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "jp"))))             ;; Japan Music
```
```{=org}
#+KEYMAP: mh |k (lambda () (interactive) (org-ql-sparse-tree '(and (tags "happy"))))             ;; Japan Music
```
```{=org}
#+KEYMAP: ma | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "song"))))             ;; All Music
```
```{=org}
#+KEYMAP: md | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "dance"))))          ;; Dance Music
```
```{=org}
#+KEYMAP: mp | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "pure"))))           ;; Pure Music
```
```{=org}
#+KEYMAP: Mp | (lambda () (interactive) (org-ql-sparse-tree '(and (tags "pop"))))           ;; Pure Music
```
```{=org}
#+KEYMAP: mw | (lambda () (interactive) (org-ql-sparse-tree '(or (tags "pure") (tags "working")))) ;; Working Music
```
```{=org}
#+KEYMAP: g1  | (lambda () (interactive) (org-ql-sparse-tree '(property "RATE" "1")))         ;; 1 star music
```
```{=org}
#+KEYMAP: g2  | (lambda () (interactive) (org-ql-sparse-tree '(property "RATE" "2")))         ;; 2 star music
```
```{=org}
#+KEYMAP: g3  | (lambda () (interactive) (org-ql-sparse-tree '(property "RATE" "3")))         ;; 3 star music
```
```{=org}
#+KEYMAP: g4  | (lambda () (interactive) (org-ql-sparse-tree '(property "RATE" "4")))         ;; 4 star music
```
```{=org}
#+KEYMAP: g5  | (lambda () (interactive) (org-ql-sparse-tree '(property "RATE" "5")))         ;; 5 star music
```
```{=org}
#+KEYMAP: gc | (lambda () (interactive) (goto-line 16)(org-cycle))      ;; configurations
```
```{=org}
#+KEYMAP: gg | evil-goto-first-line      ;; configurations
```
```{=org}
#+KEYMAP: ts | (lambda () (interactive) (org-ql-sparse-tree '(regexp "Taylor Swift*")))      ;; Taylor Swift
```
```{=org}
#+KEYMAP: wf | (lambda () (interactive) (org-ql-sparse-tree '(regexp "Earth, Wind & Fire*"))) ;; Earth Wind & Fire
```
```{=org}
#+KEYMAP: T | (lambda () (interactive) (my-org-music-mode-toggle-editing)(org-set-tags-command)) ;; add tags
```
```{=org}
#+KEYMAP: mn | (lambda ()(interactive) (my-org-music-mode-toggle-editing)(evil-open-below 1)(insert ":PROPERTIES:\n")(insert ":RATE: [here]\n") (insert ":TYPE: song\n")(insert ":END:")(previous-line 2)(end-of-line)(delete-backward-char 6)(evil-scroll-line-to-center)(evil-insert-mode))
```
## script

``` {.javascript org-language="js" tangle="no"}
[...document.querySelectorAll(
    '#contents.ytmusic-playlist-shelf-renderer ytmusic-responsive-list-item-renderer'
)].map(song => {
    parts = song.querySelectorAll('yt-formatted-string')
    const title = parts[0].innerText.trim()
    const artist = parts[1].innerText.trim()
    return `** ${artist} - ${title}
:PROPERTIES:
:TYPE: song
:END:`
}).join('\n\n')const result = [...document.querySelectorAll(
    '#contents.ytmusic-playlist-shelf-renderer ytmusic-responsive-list-item-renderer'
)].map(song => {
    const parts = song.querySelectorAll('yt-formatted-string')
    const title = parts[0].innerText.trim()
    const artist = parts[1].innerText.trim()
    return `** ${artist} - ${title}
:PROPERTIES:
:TYPE: song
:END:`
}).join('\n\n');

// 创建一个 Blob 对象并将其转换为可下载的链接
const blob = new Blob([result], { type: 'text/plain' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = 'Music.org'; // 你可以自定义文件名
link.click();

```

前缀是C-x p.

C-c C-q 可以快速浅添加标签。

# Songs [[song]{.smallcaps}]{.tag tag-name="song"} {#songs}

## 胡广生 - 陈楚生、谭维维

## Girls Band Cry // ガールズバンドクライ - VOID // 空の箱 (Momoka \| DIAMOND DUST Version) \[HQ\]

## ♪ DOUDOU - 嗵嗵「神明神明張開嘴 讓我知道我是誰」【動態歌詞/Pinyin Lyrics】♪

## SadSvit - Небо (Official video) [[working]{.smallcaps}]{.tag tag-name="working"} {#sadsvit---небо-official-video}

## 壱雫空

## 迷星叫 {#迷星叫 rate="4" type="song" query="迷星叫 MyGO!!!!!"}

## Wrong World - GBC {#wrong-world---gbc rate="5" type="song" query="Wrong World - TOGENASHI TOGEARI - 主题"}

## 空の箱 (VOID) {#空の箱-void rate="5" type="song" query="【中日EnRom】GIRLS BAND CRY - 「空の箱 (VOID)」FULL (lyrics) EP1 Insert Song by TOGENASHITOGEARI"}

## 春日影 (MyGO!!!!! ver.) {#春日影-mygo-ver. rate="5" type="song" query="https://www.youtube.com/watch?v=NycFr6D6DSw"}

## Moon Halo - Honkai Impact 3rd Valkyrie Theme {#moon-halo---honkai-impact-3rd-valkyrie-theme rate="5" type="song" query="https://www.youtube.com/watch?v=xREK6gZxYLQ"}

## 【夢幻音樂 \| 小提琴】低吟山嶺《60min》【放鬆/專注/作業BGM】 [[pure]{.smallcaps}]{.tag tag-name="pure"} {#夢幻音樂-小提琴低吟山嶺60min放鬆專注作業bgm rate="3" type="song"}

## 【夢幻音樂 \| 豎琴】祈願之泉《60min》【放鬆/專注/作業BGM】 [[pure]{.smallcaps}]{.tag tag-name="pure"} {#夢幻音樂-豎琴祈願之泉60min放鬆專注作業bgm rate="4" type="song"}

## Mikann耙耙柑 - 醒 (完整版) [[cn]{.smallcaps}]{.tag tag-name="cn"} {#mikann耙耙柑---醒-完整版 type="song"}

## Jam - 七月上 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[folk]{.smallcaps}]{.tag tag-name="folk"} {#jam---七月上 type="song" rate="5"}

## he\'s... kinda cute [[pure]{.smallcaps}]{.tag tag-name="pure"} [[working]{.smallcaps}]{.tag tag-name="working"} {#hes-kinda-cute query="he's... kinda cute" type="song" rate="5"}

## a-ha - Take on Me [[en]{.smallcaps}]{.tag tag-name="en"} {#a-ha---take-on-me type="song"}

## Passenger - Let Her Go [[en]{.smallcaps}]{.tag tag-name="en"} {#passenger---let-her-go type="song" url="https://www.youtube.com/watch?v=RBumgq5yVrA&ab_channel=Passenger"}

## FAA~Music~ - Слуга Народа \| Потап и Настя - Слуга Народа [[ru]{.smallcaps}]{.tag tag-name="ru"} {#faamusic---слуга-народа-потап-и-настя---слуга-народа type="song" rate="4"}

## GAXILLIC - \[SOLD\] Emo Rock x Pop Punk Type Beat \"Rain\" {#gaxillic---sold-emo-rock-x-pop-punk-type-beat-rain type="song" rate="3"}

## Seraphine, Jasmine Clarke and Absofacto - Childhood Dreams [[en]{.smallcaps}]{.tag tag-name="en"} {#seraphine-jasmine-clarke-and-absofacto---childhood-dreams type="song"}

## Cécile Corbel - Entendez-Vous {#cécile-corbel---entendez-vous type="song"}

## Cécile Corbel - Jardin secret {#cécile-corbel---jardin-secret type="song"}

## Cécile Corbel - Le Roi S\'en Va Chasser [[fr]{.smallcaps}]{.tag tag-name="fr"} {#cécile-corbel---le-roi-sen-va-chasser type="song" rate="5"}

## Daishi Dance - Take Me Hand（合作音乐人：Cecile Corbel） {#daishi-dance---take-me-hand合作音乐人cecile-corbel type="song"}

## 汉斯·季默 and 卡米尔 - Suis-moi (Reprise) [[fr]{.smallcaps}]{.tag tag-name="fr"} {#汉斯季默-and-卡米尔---suis-moi-reprise type="song" rate="5"}

## Hans Zimmer and Richard Harvey - The Life Plan {#hans-zimmer-and-richard-harvey---the-life-plan type="song"}

## 汉斯·季默 and 卡米尔 - Suis-moi [[fr]{.smallcaps}]{.tag tag-name="fr"} {#汉斯季默-and-卡米尔---suis-moi type="song" rate="5"}

## Hans Zimmer and Richard Harvey - Preparation {#hans-zimmer-and-richard-harvey---preparation type="song"}

## The Verve - Bitter Sweet Symphony [[en]{.smallcaps}]{.tag tag-name="en"} [[folk]{.smallcaps}]{.tag tag-name="folk"} {#the-verve---bitter-sweet-symphony type="song" rate="4"}

## Kain Sound - Jar Of Love (爱的罐子) - 曲婉婷 (Wanting Qu) (Kain Music) ♪ \| 一听就上头的BGM \| 年最劲爆的抖音歌曲 \| 最强抖音BGM \| 抖音 \| TikTok {#kain-sound---jar-of-love-爱的罐子---曲婉婷-wanting-qu-kain-music-一听就上头的bgm-年最劲爆的抖音歌曲-最强抖音bgm-抖音-tiktok type="song"}

## Earth, Wind & Fire - September {#earth-wind-fire---september type="song"}

## Pop [[pop]{.smallcaps}]{.tag tag-name="pop"} {#pop}

### 周杰倫 - 花海 [[cn]{.smallcaps}]{.tag tag-name="cn"} {#周杰倫---花海 type="song" rate="4"}

### 黄龄 - 免我蹉跎苦 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#黄龄---免我蹉跎苦 type="song" rate="5"}

## Train - Meet Virginia {#train---meet-virginia type="song"}

## Rednex - Cotton Eye Joe [[happy]{.smallcaps}]{.tag tag-name="happy"} {#rednex---cotton-eye-joe type="song" rate="4"}

## Aqua - My Oh My [[dance]{.smallcaps}]{.tag tag-name="dance"} [[en]{.smallcaps}]{.tag tag-name="en"} {#aqua---my-oh-my type="song" rate="3"}

## Jerome Patrick Hoban - Jack Rabbit Slims Twist Contest {#jerome-patrick-hoban---jack-rabbit-slims-twist-contest type="song"}

## Chuck Berry - You Never Can Tell {#chuck-berry---you-never-can-tell type="song"}

## Maria McKee - If Love Is A Red Dress (Hang Me In Rags) (Acoustic Demo Version) {#maria-mckee---if-love-is-a-red-dress-hang-me-in-rags-acoustic-demo-version type="song"}

## The Statler Brothers - Flowers On The Wall [[folk]{.smallcaps}]{.tag tag-name="folk"} {#the-statler-brothers---flowers-on-the-wall type="song"}

## John Travolta and Samuel L. Jackson - Personality Goes A Long Way {#john-travolta-and-samuel-l.-jackson---personality-goes-a-long-way type="song"}

## 达斯蒂·斯普林菲尔德 - Son of a Preacher Man {#达斯蒂斯普林菲尔德---son-of-a-preacher-man type="song"}

## 阿尔·格林 - Let\'s Stay Together {#阿尔格林---lets-stay-together type="song"}

## Kool & The Gang - Jungle Boogie {#kool-the-gang---jungle-boogie type="song"}

## 酷玩乐队 - Sparks {#酷玩乐队---sparks type="song"}

## 电台司令 - No Surprises {#电台司令---no-surprises type="song"}

## Bob Marley - No Woman No Cry {#bob-marley---no-woman-no-cry type="song"}

## PianoForest - 溯Reverse(钢琴版) {#pianoforest---溯reverse钢琴版 type="song"}

## Alisa - 溯Reverse (治愈版) {#alisa---溯reverse-治愈版 type="song"}

## CORSAK - Reverse（合作音乐人：马吟吟） {#corsak---reverse合作音乐人马吟吟 type="song"}

## Ella Fitzgerald and Count Basie - Tea For Two {#ella-fitzgerald-and-count-basie---tea-for-two type="song"}

## Basshunter - Angel In The Night [[dance]{.smallcaps}]{.tag tag-name="dance"} {#basshunter---angel-in-the-night type="song"}

## Rednex - Cotton Eye Joe [[en]{.smallcaps}]{.tag tag-name="en"} [[folk]{.smallcaps}]{.tag tag-name="folk"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#rednex---cotton-eye-joe-1 type="song" rate="4"}

## Mickaël Miro - L\'horloge tourne {#mickaël-miro---lhorloge-tourne type="song"}

## Manu Pilas - Bella Ciao (Música Original de la Serie la Casa de Papel/ Money Heist) {#manu-pilas---bella-ciao-música-original-de-la-serie-la-casa-de-papel-money-heist type="song"}

## 曲婉婷 - 我的歌声里 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[emotion]{.smallcaps}]{.tag tag-name="emotion"} {#曲婉婷---我的歌声里 type="song" rate="4"}

## 曲婉婷 - Jar Of Love [[cn]{.smallcaps}]{.tag tag-name="cn"} [[emotion]{.smallcaps}]{.tag tag-name="emotion"} {#曲婉婷---jar-of-love type="song" rate="4"}

## slakrop20 - Dans la Maison Theme Soundtrack - Philippe Rombi (HD 1080P) {#slakrop20---dans-la-maison-theme-soundtrack---philippe-rombi-hd-1080p type="song"}

## TikTok Music Cloud - All My People - Alexandra Stan ♪ \| 抖音好听洗脑的BGM \| 抖音熱門 \| 抖音 \| TikTok [[en]{.smallcaps}]{.tag tag-name="en"} [[dance]{.smallcaps}]{.tag tag-name="dance"} {#tiktok-music-cloud---all-my-people---alexandra-stan-抖音好听洗脑的bgm-抖音熱門-抖音-tiktok type="song"}

## Earth, Wind & Fire - Let\'s Groove [[en]{.smallcaps}]{.tag tag-name="en"} {#earth-wind-fire---lets-groove type="song"}

## Earth, Wind & Fire - Boogie Wonderland {#earth-wind-fire---boogie-wonderland type="song"}

## Earth, Wind & Fire - December (Based on \"September\") [[en]{.smallcaps}]{.tag tag-name="en"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#earth-wind-fire---december-based-on-september type="song" rate="5"}

## Baltimore Symphony Orchestra、David Zinman、Richard Leech、Sylvia McNair、Choir of St. David\'s Episcopal Church、Choir of St. Michael and All Angels、Baltimore Symphony Orchestra Chorus和Hector Berlioz - La Marseillaise, H 51 {#baltimore-symphony-orchestradavid-zinmanrichard-leechsylvia-mcnairchoir-of-st.-davids-episcopal-churchchoir-of-st.-michael-and-all-angelsbaltimore-symphony-orchestra-chorus和hector-berlioz---la-marseillaise-h-51 type="song"}

## Kool & The Gang - Celebration {#kool-the-gang---celebration type="song"}

## Kool & The Gang - Fresh {#kool-the-gang---fresh type="song"}

## Ludovico Einaudi - Fly {#ludovico-einaudi---fly type="song"}

## Ludovico Einaudi, Daniel Hope and I Virtuosi Italiani - Experience [[fr]{.smallcaps}]{.tag tag-name="fr"} {#ludovico-einaudi-daniel-hope-and-i-virtuosi-italiani---experience type="song"}

## MACK - Ludovico Einaudi - Una Mattina (Extended Remix) {#mack---ludovico-einaudi---una-mattina-extended-remix type="song"}

## Ludovico Einaudi - Una Mattina {#ludovico-einaudi---una-mattina type="song"}

## Classical Music Only - J.S. Bach - Minuet and Badinerie from Orchestral Suite No. 2 in B [[classic]{.smallcaps}]{.tag tag-name="classic"} {#classical-music-only---j.s.-bach---minuet-and-badinerie-from-orchestral-suite-no.-2-in-b type="song"}

## Etnuncreges - Suite n°1 - Prélude - J.S. Bach - Violoncello da Spalla {#etnuncreges---suite-n1---prélude---j.s.-bach---violoncello-da-spalla type="song"}

## Pedro F - Ludovico Einaudi - Fly (Intouchables Soundtrack) [[pure]{.smallcaps}]{.tag tag-name="pure"} {#pedro-f---ludovico-einaudi---fly-intouchables-soundtrack type="song"}

## 大卫·鲍伊 - Modern Love {#大卫鲍伊---modern-love type="song"}

## ZheLai - 三界 四洲 无所求 不可救 《黑神话：悟空》章节片尾曲《屁》今日上线Black Myth: Wukong {#zhelai---三界-四洲-无所求-不可救-黑神话悟空章节片尾曲屁今日上线black-myth-wukong type="song"}

## Black Myth: Wukong - '戒网' - Black Myth: Wukong OST {#black-myth-wukong---戒网---black-myth-wukong-ost type="song"}

## Izzamuzzic and Julien Marchal - Shootout [[pure]{.smallcaps}]{.tag tag-name="pure"} {#izzamuzzic-and-julien-marchal---shootout type="song"}

## Simon & Garfunkel - The Sounds of Silence (Audio) {#simon-garfunkel---the-sounds-of-silence-audio type="song"}

## Bôa - Duvet [[en]{.smallcaps}]{.tag tag-name="en"} [[working]{.smallcaps}]{.tag tag-name="working"} {#bôa---duvet type="song" rate="4"}

## The Cranberries - Ode To My Family USA Radio Version {#the-cranberries---ode-to-my-family-usa-radio-version type="song"}

## 草東沒有派對 - 大風吹 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[post_rock]{.smallcaps}]{.tag tag-name="post_rock"} {#草東沒有派對---大風吹 type="song" rate="5"}

## 草東沒有派對 - 山海 [[cn]{.smallcaps}]{.tag tag-name="cn"} {#草東沒有派對---山海 type="song"}

## London Music Works - Theme (From \"The Facts of Life\") {#london-music-works---theme-from-the-facts-of-life type="song"}

## Bg Studios - Facts Of Life {#bg-studios---facts-of-life type="song"}

## Anne Sylvestre - La p\'tite hirondelle {#anne-sylvestre---la-ptite-hirondelle type="song"}

## Chansons, Folklore et Variété - Jacques Helian - En chantant hey di ho {#chansons-folklore-et-variété---jacques-helian---en-chantant-hey-di-ho type="song"}

## Troupe 3ème Montpellier - Dans la troupe • Chants scouts {#troupe-3ème-montpellier---dans-la-troupe-chants-scouts type="song"}

## Gagtiger - Chantons Sous La Pluie - Singin In The Rain (Scène Mythique) {#gagtiger---chantons-sous-la-pluie---singin-in-the-rain-scène-mythique type="song"}

## Dorothée - Passe, passe, passera（合作音乐人：Les Récréamis） {#dorothée---passe-passe-passera合作音乐人les-récréamis type="song"}

## Zaz - La vie en rose {#zaz---la-vie-en-rose type="song"}

## Zaz - Les passants {#zaz---les-passants type="song"}

## Lucienne Delyle - Mon amant de Saint-Jean {#lucienne-delyle---mon-amant-de-saint-jean type="song"}

## Patrick Bruel - Mon amant de Saint-Jean (Clip officiel) {#patrick-bruel---mon-amant-de-saint-jean-clip-officiel type="song"}

## Poppy - Moshi Moshi [[en]{.smallcaps}]{.tag tag-name="en"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#poppy---moshi-moshi type="song"}

## Nozomi Kitay and GAL D - Moshi Moshi（合作音乐人：MUKADE） {#nozomi-kitay-and-gal-d---moshi-moshi合作音乐人mukade type="song"}

## 嘿嘿 - empty love - 抖音（by Lulleaux） {#嘿嘿---empty-love---抖音by-lulleaux type="song"}

## Amayadori - 猫かぶり [[jp]{.smallcaps}]{.tag tag-name="jp"} {#amayadori---猫かぶり type="song"}

## majiko - 命に嫌われている。 - Inochini Kirawareteiru [[jp]{.smallcaps}]{.tag tag-name="jp"} {#majiko---命に嫌われている---inochini-kirawareteiru type="song"}

## majiko - アイロニ - Irony [[jp]{.smallcaps}]{.tag tag-name="jp"} {#majiko---アイロニ---irony type="song"}

## 酷玩乐队 - Viva la Vida [[classic]{.smallcaps}]{.tag tag-name="classic"} {#酷玩乐队---viva-la-vida type="song" rate="5"}

## 阿哈 - Take On Me [[en]{.smallcaps}]{.tag tag-name="en"} [[dance]{.smallcaps}]{.tag tag-name="dance"} {#阿哈---take-on-me type="song"}

## W&W and 舞动精灵乐队 - God Is a Girl (Mixed) [[en]{.smallcaps}]{.tag tag-name="en"} {#ww-and-舞动精灵乐队---god-is-a-girl-mixed type="song"}

## 卡丝卡达乐团 - Bad Boy [[en]{.smallcaps}]{.tag tag-name="en"} {#卡丝卡达乐团---bad-boy type="song"}

## 卡丝卡达乐团 - Everytime We Touch - Radio Edit [[en]{.smallcaps}]{.tag tag-name="en"} [[dance]{.smallcaps}]{.tag tag-name="dance"} {#卡丝卡达乐团---everytime-we-touch---radio-edit type="song"}

ENQUEUED: \[2024-11-26 mar. 21:35\] ENQUEUED: \[2024-11-26 mar. 21:34\]

## Keala Settle and The Greatest Showman Ensemble - This Is Me {#keala-settle-and-the-greatest-showman-ensemble---this-is-me type="song"}

## Taylor Swift - I Know Places (Taylor\'s Version) {#taylor-swift---i-know-places-taylors-version type="song" rate="4"}

## Boom - How Do You Do {#boom---how-do-you-do type="song" rate="2"}

## Madonna - La Isla Bonita {#madonna---la-isla-bonita type="song"}

## Miley Cyrus - Party In The U.S.A. {#miley-cyrus---party-in-the-u.s.a. type="song"}

## Boney M. - Sunny {#boney-m.---sunny type="song"}

## Vanessa Carlton - A Thousand Miles {#vanessa-carlton---a-thousand-miles type="song"}

## Ameritz Countdown Tributes - I Gotta Feeling {#ameritz-countdown-tributes---i-gotta-feeling type="song"}

## Meghan Trainor - Me Too {#meghan-trainor---me-too type="song"}

## Village People - YMCA (Original Version 1978) {#village-people---ymca-original-version-1978 type="song"}

## Haddaway - What Is Love (7\" Mix) {#haddaway---what-is-love-7-mix type="song"}

## Kelly Clarkson - Stronger (What Doesn\'t Kill You) {#kelly-clarkson---stronger-what-doesnt-kill-you type="song"}

## The Black Eyed Peas - I Gotta Feeling {#the-black-eyed-peas---i-gotta-feeling type="song"}

## Smile - Butterfly {#smile---butterfly type="song"}

## Aqua - Barbie Girl {#aqua---barbie-girl type="song"}

## Smash Mouth - All Star {#smash-mouth---all-star type="song"}

## Lady Gaga - Poker Face {#lady-gaga---poker-face type="song"}

## Mark Ronson and Bruno Mars - Uptown Funk {#mark-ronson-and-bruno-mars---uptown-funk type="song"}

## ABBA - Dancing Queen {#abba---dancing-queen type="song"}

## Britney Spears - ...Baby One More Time {#britney-spears---baby-one-more-time type="song"}

## Carly Rae Jepsen - Call Me Maybe {#carly-rae-jepsen---call-me-maybe type="song"}

## Taylor Swift - Shake It Off (Taylor\'s Version) {#taylor-swift---shake-it-off-taylors-version type="song"}

## Spice Girls - Wannabe {#spice-girls---wannabe type="song"}

## Chill Caterpillar - Lofi Song of the Week: Can\'t Stop {#chill-caterpillar---lofi-song-of-the-week-cant-stop type="song"}

## Anita Mui - 夕阳之歌 {#anita-mui---夕阳之歌 type="song"}

## ASU - ソラゴト {#asu---ソラゴト type="song"}

## Samuel Kim and Lorien - I Really Want to Stay at Your House {#samuel-kim-and-lorien---i-really-want-to-stay-at-your-house type="song"}

## Edith Piaf - La Vie En Rose {#edith-piaf---la-vie-en-rose type="song"}

## Charlie Brown Jr. - Dias De Luta, Dias De Glória {#charlie-brown-jr.---dias-de-luta-dias-de-glória type="song"}

## 玛丽亚·丽塔 - Não Deixe O Samba Morrer {#玛丽亚丽塔---não-deixe-o-samba-morrer type="song"}

## 中华纯音乐 ♪ - Nonsense! White Snow,Ice Cold MV 三界四洲 无所求 不可救 夜生白露 屁 黑神话:悟空 OST Black Myth WuKong BGM {#中华纯音乐---nonsense-white-snowice-cold-mv-三界四洲-无所求-不可救-夜生白露-屁-黑神话悟空-ost-black-myth-wukong-bgm type="song"}

## Flemish Bond - Flemish Bond - i watch the moon {#flemish-bond---flemish-bond---i-watch-the-moon type="song"}

## Cafuné - Tek It {#cafuné---tek-it type="song"}

## Pitbull and Kesha - Timber {#pitbull-and-kesha---timber type="song"}

## One Direction - What Makes You Beautiful {#one-direction---what-makes-you-beautiful type="song"}

## 温驯的高角羚 - The Less I Know the Better {#温驯的高角羚---the-less-i-know-the-better type="song"}

## The Weeknd - I Feel It Coming ft. Daft Punk (Official Video)（合作音乐人：Daft Punk） {#the-weeknd---i-feel-it-coming-ft.-daft-punk-official-video合作音乐人daft-punk type="song"}

## Pierre Bachelet - Les corons (Lyrics video) {#pierre-bachelet---les-corons-lyrics-video type="song"}

## 弗雷德里克·肖邦 - Chopin - Etude Op. 10 No. 1 (Waterfall) {#弗雷德里克肖邦---chopin---etude-op.-10-no.-1-waterfall type="song"}

## AVROTROS Klassiek - Rachmaninoff: Piano Concerto no.2 op.18 - Anna Fedorova - Complete Live Concert - HD {#avrotros-klassiek---rachmaninoff-piano-concerto-no.2-op.18---anna-fedorova---complete-live-concert---hd type="song"}

## Serrini - 哀樂無名 {#serrini---哀樂無名 type="song"}

## Serrini - 放棄治療 {#serrini---放棄治療 type="song"}

## 大主宰乐团和大主宰樂團 - 剪刀刺客 (动画《刺客伍六七》主题曲) {#大主宰乐团和大主宰樂團---剪刀刺客-动画刺客伍六七主题曲 type="song"}

## 周子琰 - 无论你多怪异我还是会喜欢你 (《刺客伍六七》动画推广版片尾曲) {#周子琰---无论你多怪异我还是会喜欢你-刺客伍六七动画推广版片尾曲 type="song"}

## 郑秀文 - 萨拉热窝的罗密欧与茱丽叶 {#郑秀文---萨拉热窝的罗密欧与茱丽叶 type="song"}

## 2nd South Carolina String Band - Oh! Susanna {#nd-south-carolina-string-band---oh-susanna type="song"}

## 孔一蝉 - 爱YOU READY , 爱我READY {#孔一蝉---爱you-ready-爱我ready type="song"}

## 呦猫UNEKO - 梦回还 {#呦猫uneko---梦回还 type="song"}

## 陈慧娴 - 千千阕歌 {#陈慧娴---千千阕歌 type="song"}

## Beyond - 光辉岁月 {#beyond---光辉岁月 type="song"}

## BEYOND - 海闊天空 {#beyond---海闊天空 type="song"}

## 盧冠廷 - 一生所愛 {#盧冠廷---一生所愛 type="song"}

## 王菲 - 人间 {#王菲---人间 type="song"}

## T.R.Y - 不是因为寂寞才想你 {#t.r.y---不是因为寂寞才想你 type="song"}

## 凤凰传奇 - 奢香夫人 {#凤凰传奇---奢香夫人 type="song"}

## 齐豫 - 橄欖樹 {#齐豫---橄欖樹 type="song"}

## BENNETT - Vois sur ton chemin (Techno Mix) {#bennett---vois-sur-ton-chemin-techno-mix type="song"}

## 阿肆 - 热爱105°C的你 {#阿肆---热爱105c的你 type="song"}

## Harry Styles - As It Was {#harry-styles---as-it-was type="song"}

## Bryant Barnes - Bryant Barnes - So Low (Shiloh Cover) {#bryant-barnes---bryant-barnes---so-low-shiloh-cover type="song"}

## Yuki Kajiura - Sis Puella Magica! [[jp]{.smallcaps}]{.tag tag-name="jp"} [[anime]{.smallcaps}]{.tag tag-name="anime"} [[working]{.smallcaps}]{.tag tag-name="working"} {#yuki-kajiura---sis-puella-magica type="song" rate="4"}

## FIFTY FIFTY - Cupid (Twin Version) {#fifty-fifty---cupid-twin-version type="song"}

## 泽野弘之 and Mika Kobayashi - Bauklötze {#泽野弘之-and-mika-kobayashi---bauklötze type="song"}

## Ai Higuchi - 悪魔の子 - Akuma no Ko {#ai-higuchi---悪魔の子---akuma-no-ko type="song"}

## Linked Horizon - 紅蓮の弓矢 {#linked-horizon---紅蓮の弓矢 type="song"}

## Linked Horizon - 心臓を捧げよ！ {#linked-horizon---心臓を捧げよ type="song"}

## Hiroyuki Sawano - Barricades {#hiroyuki-sawano---barricades type="song"}

## 泽野弘之和Laco - Zero Eclipse {#泽野弘之和laco---zero-eclipse type="song"}

## 泽野弘之, mpi and CASG(Caramel Apple Sound Gadget) - Call your name {#泽野弘之-mpi-and-casgcaramel-apple-sound-gadget---call-your-name type="song"}

## Hiroyuki Sawano - Call of Silence {#hiroyuki-sawano---call-of-silence type="song"}

## Hiroyuki Sawano - YouSeeBIGGIRL/T:T {#hiroyuki-sawano---youseebiggirltt type="song"}

## 泽野弘之 and Mika Kobayashi - ətˈæk 0N tάɪtn {#泽野弘之-and-mika-kobayashi---ətˈæk-0n-tάɪtn type="song"}

## 神圣放逐乐队 - 僕の戦争 - Bokuno sensou {#神圣放逐乐队---僕の戦争---bokuno-sensou type="song"}

## Yuika - 好きだから。 (feat. れん) {#yuika---好きだから-feat.-れん type="song"}

## CB - 【東方】Bad Apple!! ＰＶ【影絵】 {#cb---東方bad-apple-ｐｖ影絵 type="song"}

## 傻瓜花园 - Lemon Tree {#傻瓜花园---lemon-tree type="song"}

## 陈小满和史一 - 你的微笑 {#陈小满和史一---你的微笑 type="song"}

## Emily Zeck - Avocado Toast {#emily-zeck---avocado-toast type="song"}

## 闪闪 - 阿呦阿呦 {#闪闪---阿呦阿呦 type="song"}

## GoMusic 華語 - 閃閃、唐寧 - 神奇阿呦（阿呦阿呦+我和你）(Official Lyric Video) {#gomusic-華語---閃閃唐寧---神奇阿呦阿呦阿呦我和你official-lyric-video type="song"}

## 皮卡丘多多 - 我和你 (伴奏版) {#皮卡丘多多---我和你-伴奏版 type="song"}

## 2nd South Carolina String Band - O SUSANNA ! {#nd-south-carolina-string-band---o-susanna type="song"}

## Eileen - Wellerman (Sea Shanty) -- Cover in Ukrainian -- Підмога {#eileen---wellerman-sea-shanty-cover-in-ukrainian-підмога type="song"}

## Eileen - Ой у лузі червона калина (A cappella) {#eileen---ой-у-лузі-червона-калина-a-cappella type="song"}

## yiyangchenbuffulo - Luo Tianyi - You owe me a hug 洛天依 欠一个拥抱 PV付 {#yiyangchenbuffulo---luo-tianyi---you-owe-me-a-hug-洛天依-欠一个拥抱-pv付 type="song"}

## 滿漢全席音樂團隊 - 【滿漢】欠一個擁抱【 蕭憶情】 {#滿漢全席音樂團隊---滿漢欠一個擁抱-蕭憶情 type="song"}

## 泠鸢yousa - 【鳶×茶×憨×三】千里邀月（人聲本家·原創曲） {#泠鸢yousa---鳶茶憨三千里邀月人聲本家原創曲 type="song"}

## Mainland China CPOP MV 2 - 【HD】SING女團-寄明月MV(舞蹈版) \[Official MV Dance Ver.\]官方完整版MV {#mainland-china-cpop-mv-2---hdsing女團-寄明月mv舞蹈版-official-mv-dance-ver.官方完整版mv type="song"}

## こぴ - 【猫の恩返し】風になる / つじあやの(Covered by こぴ) {#こぴ---猫の恩返し風になる-つじあやのcovered-by-こぴ type="song"}

## Ayano Tsuji - 風になる {#ayano-tsuji---風になる type="song"}

## Frank Sinatra - Fly Me To The Moon (2008 Remastered)（合作音乐人：Count Basie And His Orchestra） {#frank-sinatra---fly-me-to-the-moon-2008-remastered合作音乐人count-basie-and-his-orchestra type="song"}

## madelline - dopamine {#madelline---dopamine type="song"}

## Darin - Be What You Wanna Be {#darin---be-what-you-wanna-be type="song"}

## Coldplay - A Sky Full of Stars {#coldplay---a-sky-full-of-stars type="song"}

## Françoise Hardy - Tous les garçons et les filles (Slow) {#françoise-hardy---tous-les-garçons-et-les-filles-slow type="song"}

## 灰澈 - 星茶会 {#灰澈---星茶会 type="song"}

## Olivia Rodrigo - good 4 u {#olivia-rodrigo---good-4-u type="song"}

## Franzl Lang - Auf und auf voll lebenslust {#franzl-lang---auf-und-auf-voll-lebenslust type="song"}

## Alla Turca , Turkish March \[ W. a. Mozart \] - Alla Turca , Turkish March {#alla-turca-turkish-march-w.-a.-mozart---alla-turca-turkish-march type="song"}

## Barbara Pravi - Voilà (Clip Officiel) {#barbara-pravi---voilà-clip-officiel type="song"}

## 罗震环 - 靠近 (电视剧《爱情公寓3》片尾曲) {#罗震环---靠近-电视剧爱情公寓3片尾曲 type="song"}

## Santana - Black Magic Woman {#santana---black-magic-woman type="song"}

## Riikka - Ievan polkka (Video Mix) {#riikka---ievan-polkka-video-mix type="song"}

## Sundae MMD - Hatsune Miku - Ievan Polkka {#sundae-mmd---hatsune-miku---ievan-polkka type="song"}

## Jiaqi K - 膨胀 电影《西虹市首富》插曲 - 沈腾 {#jiaqi-k---膨胀-电影西虹市首富插曲---沈腾 type="song"}

## 火箭少女101 - 卡路里 (电影《西虹市首富》插曲) {#火箭少女101---卡路里-电影西虹市首富插曲 type="song"}

## 乌克兰有天赋。孩子们的季节 - София Шкидченко - Awesome Yodeling - Yodel Expert \"Україна має талант-9\".Діти-2 \[04.03.2017\] {#乌克兰有天赋孩子们的季节---софия-шкидченко---awesome-yodeling---yodel-expert-україна-має-талант-9.діти-2-04.03.2017 type="song"}

## Coline Sicre - Il m\'a montré à Yodler {#coline-sicre---il-ma-montré-à-yodler type="song"}

## Coline Sicre - He taught me to Yodel {#coline-sicre---he-taught-me-to-yodel type="song"}

## ilem - 四风判词 {#ilem---四风判词 type="song"}

## B小町 ルビー（CV：伊駒ゆりえ）、有馬かな（CV：潘めぐみ）、MEMちょ（CV：大久保瑠美） - サインはB -New Arrange Ver.- {#b小町-ルビーcv伊駒ゆりえ有馬かなcv潘めぐみmemちょcv大久保瑠美---サインはb--new-arrange-ver.- type="song"}

## Linked Horizon - 紅蓮の弓矢 {#linked-horizon---紅蓮の弓矢-1 type="song"}

## LiSA - 往け - Yu-Ke {#lisa---往け---yu-ke type="song"}

## 涼宮ハルヒ (CV.平野 綾) - God knows... {#涼宮ハルヒ-cv.平野-綾---god-knows type="song"}

## QUEENDOM - チキチキバンバン {#queendom---チキチキバンバン type="song"}

## HoneyWorks - 可愛くてごめん（合作音乐人：capi） [[jp]{.smallcaps}]{.tag tag-name="jp"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#honeyworks---可愛くてごめん合作音乐人capi type="song"}

## 毛不易 - 一荤一素 {#毛不易---一荤一素 type="song"}

## 毛不易 - 牧馬城市 {#毛不易---牧馬城市 type="song"}

## 毛不易 - 像我这样的人 {#毛不易---像我这样的人 type="song"}

## John Lennon - Imagine (Ultimate Mix) {#john-lennon---imagine-ultimate-mix type="song"}

## Lewis OfMan和Alicia te quiero - Siesta Freestyle {#lewis-ofman和alicia-te-quiero---siesta-freestyle type="song"}

## 30年前，50年后 - 精卫 {#年前50年后---精卫 type="song"}

## Getrichi - 精卫(戏腔) - 一颗狼星~许篮心~ 動態歌詞/Lyrics {#getrichi---精卫戏腔---一颗狼星许篮心-動態歌詞lyrics type="song"}

## VC二次元मLY - 【洛天依原创】我的悲伤是水做的 【Luo Tianyi Original】Bad Bad Water {#vc二次元मly---洛天依原创我的悲伤是水做的-luo-tianyi-originalbad-bad-water type="song"}

## ChiliChill - 我的悲伤是水做的（作者版） {#chilichill---我的悲伤是水做的作者版 type="song"}

## Fleetwood Mac - Landslide {#fleetwood-mac---landslide type="song"}

## Fleetwood Mac - Everywhere {#fleetwood-mac---everywhere type="song"}

## Sigrid - Strangers {#sigrid---strangers type="song"}

## Cinémavore - Interstellar Main Theme - Extra Extended - Soundtrack by Hans Zimmer {#cinémavore---interstellar-main-theme---extra-extended---soundtrack-by-hans-zimmer type="song"}

## 林生祥 - 面會菜 {#林生祥---面會菜 type="song"}

## 音速行星 - 脚踏车穿过每一帧 {#音速行星---脚踏车穿过每一帧 type="song"}

## 音速行星 - 天际线 {#音速行星---天际线 type="song"}

## 音速行星 - 张生传 {#音速行星---张生传 type="song"}

## 音速行星 - 空回响 {#音速行星---空回响 type="song"}

## 音速行星 - 时间旅行有限公司 {#音速行星---时间旅行有限公司 type="song"}

## 音速行星 - 无挂碍 {#音速行星---无挂碍 type="song"}

## 福禄寿 - 春暖花开去见你 {#福禄寿---春暖花开去见你 type="song"}

## 福禄寿 - 兰若度母 {#福禄寿---兰若度母 type="song"}

## 福禄寿 - 马 {#福禄寿---马 type="song"}

## 福禄寿 - 我用什么把你留住 {#福禄寿---我用什么把你留住 type="song"}

## 福禄寿 - 超度我 {#福禄寿---超度我 type="song"}

## 安子与九妹 - 布谷鸟 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#安子与九妹---布谷鸟 type="song" rate="5"}

## 安子与九妹 - 威廉爱情故事 {#安子与九妹---威廉爱情故事 type="song"}

## WCY Music Studio - 安子与九妹 - 小嫦娥 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[happy]{.smallcaps}]{.tag tag-name="happy"} [[working]{.smallcaps}]{.tag tag-name="working"} {#wcy-music-studio---安子与九妹---小嫦娥 type="song" rate="5"}

## w. zzang - 大乔小乔《农夫渔夫》 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[folk]{.smallcaps}]{.tag tag-name="folk"} {#w.-zzang---大乔小乔农夫渔夫 type="song" rate="5"}

## Chinese Folk Music - 大喬小喬 - 消失的光年 {#chinese-folk-music---大喬小喬---消失的光年 type="song"}

## 大乔小乔 - 消失的光年2017版 {#大乔小乔---消失的光年2017版 type="song" rate="5"}

## 大乔小乔 - 彼此 {#大乔小乔---彼此 type="song"}

## 晚间音乐（中国） - 抖音歌曲熱門曲庫音樂---《奢香夫人》你來過年華被傳說百里杜鵑不凋落 {#晚间音乐中国---抖音歌曲熱門曲庫音樂奢香夫人你來過年華被傳說百里杜鵑不凋落 type="song"}

## Camila Cabello - Havana（合作音乐人：Young Thug） {#camila-cabello---havana合作音乐人young-thug type="song"}

## Camila Cabello - Shameless {#camila-cabello---shameless type="song"}

## Shawn Mendes and Camila Cabello - Señorita {#shawn-mendes-and-camila-cabello---señorita type="song"}

## Rousseau - Mozart - Rondo Alla Turca (Turkish March) {#rousseau---mozart---rondo-alla-turca-turkish-march type="song"}

## Glenn Gould and Johann Sebastian Bach - The Art of the Fugue, BWV 1080: Contrapunctus I {#glenn-gould-and-johann-sebastian-bach---the-art-of-the-fugue-bwv-1080-contrapunctus-i type="song"}

## Susanne Lautenbacher and Johann Pachelbel - Canon & Gigue in D Major, P. 37: Canon {#susanne-lautenbacher-and-johann-pachelbel---canon-gigue-in-d-major-p.-37-canon type="song"}

## Chiyomi Anchovy 安丘比 - Слуга Народа---人民公僕（烏克蘭同名電視劇中的瓦夏競選曲） {#chiyomi-anchovy-安丘比---слуга-народа人民公僕烏克蘭同名電視劇中的瓦夏競選曲 type="song"}

## 马頔 - 时间里的 {#马頔---时间里的 type="song"}

## 马頔 - 孤鸟的歌 {#马頔---孤鸟的歌 type="song"}

## 马頔 - 南山南 {#马頔---南山南 type="song"}

## 马頔 - 傲寒 {#马頔---傲寒 type="song"}

## Doja Cat - Say So {#doja-cat---say-so type="song"}

## Elise - 柴鱼の c a l l i n g --- 幸子小姐拜托了 (HD) {#elise---柴鱼の-c-a-l-l-i-n-g-幸子小姐拜托了-hd type="song"}

## Hitsujibungaku - マヨイガ - Mayoiga {#hitsujibungaku---マヨイガ---mayoiga type="song"}

## Bratty - Honey, No Estás {#bratty---honey-no-estás type="song"}

## DZIDZIO [[dzidzio]{.smallcaps}]{.tag tag-name="dzidzio"} [[ru]{.smallcaps}]{.tag tag-name="ru"} [[dance]{.smallcaps}]{.tag tag-name="dance"} {#dzidzio}

### DZIDZIO - Сама-сама {#dzidzio---сама-сама type="song"}

### DZIDZIO - Павук {#dzidzio---павук type="song"}

### DZIDZIO - Василина（合作音乐人：Іван Попович） {#dzidzio---василина合作音乐人іван-попович type="song"}

### DZIDZIO - Каділак {#dzidzio---каділак type="song"}

## 齐豫 [[齐豫]{.smallcaps}]{.tag tag-name="齐豫"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[sad]{.smallcaps}]{.tag tag-name="sad"} {#齐豫}

### 齊豫 - 歡顏 {#齊豫---歡顏 type="song" rate="5"}

### 齊豫 - 船歌 {#齊豫---船歌 type="song" rate="5"}

### 齊豫 - 飛鳥與魚 {#齊豫---飛鳥與魚 type="song" rate="5"}

### 齊豫 and 潘越雲 - 夢田 {#齊豫-and-潘越雲---夢田 type="song" rate="5"}

### 齊豫 - 橄欖樹 {#齊豫---橄欖樹 type="song" rate="5"}

### 齊豫 - TEARS-DONDE VOY {#齊豫---tears-donde-voy type="song"}

## San Holo - Light {#san-holo---light type="song"}

## 艾丝黛儿 - American Boy（合作音乐人：坎耶·韦斯特） {#艾丝黛儿---american-boy合作音乐人坎耶韦斯特 type="song"}

## 王朝1982 - 坐忘道 {#王朝1982---坐忘道 type="song"}

## 王朝1982 - 成仙 {#王朝1982---成仙 type="song"}

## Patrick Watson - Je te laisserai des mots {#patrick-watson---je-te-laisserai-des-mots type="song"}

## 弦上翻花 - 所 以 我 放 弃 了 吉 他 {#弦上翻花---所-以-我-放-弃-了-吉-他 type="song"}

## Ryan Gosling - City Of Stars {#ryan-gosling---city-of-stars type="song"}

## Indila - Parle à ta tête {#indila---parle-à-ta-tête type="song"}

## 乔伊丝·若纳唐 - Ca ira {#乔伊丝若纳唐---ca-ira type="song"}

## London Philarmonic Orchestra, Alfred Scholtz and Wolfgang Amadeus Mozart - La flûte enchantée : ouverture {#london-philarmonic-orchestra-alfred-scholtz-and-wolfgang-amadeus-mozart---la-flûte-enchantée-ouverture type="song"}

## Pomme - J\'suis pas dupe {#pomme---jsuis-pas-dupe type="song"}

## Naps - La kiffance {#naps---la-kiffance type="song"}

## 马玉兰 - 【大雄×静香】送你一颗流星⭐════ {#马玉兰---大雄静香送你一颗流星 type="song"}

## Riyandi Kusuma - Flower Dance (Piano Version) {#riyandi-kusuma---flower-dance-piano-version type="song"}

## DJ OKAWARI - Flower Dance {#dj-okawari---flower-dance type="song"}

## 排骨教主 - 牵丝戏 {#排骨教主---牵丝戏 type="song" rate="5"}

## Andrea Bocelli - Bésame Mucho {#andrea-bocelli---bésame-mucho type="song"}

## 小野丽莎 - Besame Mucho {#小野丽莎---besame-mucho type="song"}

## Sabrina Carpenter - Nonsense {#sabrina-carpenter---nonsense type="song"}

## Z新豪 and 洛天依Official - 东京不太热 {#z新豪-and-洛天依official---东京不太热 type="song"}

## MARINA - To Be Human {#marina---to-be-human type="song"}

## Samantha Jade - Soldier {#samantha-jade---soldier type="song"}

## Imagine Dragons - Warriors {#imagine-dragons---warriors type="song"}

## 张靓颖 & 赵磊 - 化身孤岛的鲸 {#张靓颖-赵磊---化身孤岛的鲸 type="song"}

## 周深 - 化身孤岛的鲸 {#周深---化身孤岛的鲸 type="song"}

## Gala - 水手公园 {#gala---水手公园 type="song"}

## 万晓利 - 狐狸 {#万晓利---狐狸 type="song"}

## 痛仰乐队 - 再見傑克 {#痛仰乐队---再見傑克 type="song"}

## 高嶋ちさ子 - 海の見える街 {#高嶋ちさ子---海の見える街 type="song"}

## Manu Pilas - Bella Ciao (Música Original da Série La Casa De Papel) {#manu-pilas---bella-ciao-música-original-da-série-la-casa-de-papel type="song"}

## Quilapayún - El Pueblo Unido Jamás Será Vencido (En Vivo) {#quilapayún---el-pueblo-unido-jamás-será-vencido-en-vivo type="song"}

## Quilapayún - El Pueblo Unido Jamás Será Vencido {#quilapayún---el-pueblo-unido-jamás-será-vencido type="song"}

## Eagles - Hotel California {#eagles---hotel-california type="song"}

## Hector A. Camarillo - Eagles - Hotel California (Lossless Audio) {#hector-a.-camarillo---eagles---hotel-california-lossless-audio type="song"}

## Pascal Letoublon - Friendships {#pascal-letoublon---friendships type="song"}

## Alvaro Soler - Sofia \[blank\] {#alvaro-soler---sofia-blank type="song"}

## MYTH & ROID - Endless Embrace {#myth-roid---endless-embrace type="song"}

## Yuki Kajiura - Surgam identidem {#yuki-kajiura---surgam-identidem type="song"}

## Yuki Kajiura - Venari Strigas {#yuki-kajiura---venari-strigas type="song"}

## Yuki Kajiura - Decretum {#yuki-kajiura---decretum type="song"}

## Yuki Kajiura - Credens Justitiam {#yuki-kajiura---credens-justitiam type="song"}

## Yuki Kajiura - Luminous Sword {#yuki-kajiura---luminous-sword type="song"}

## Yuki Kajiura - Swordland {#yuki-kajiura---swordland type="song"}

## Yuki Kajiura - Sis Puella Magica! {#yuki-kajiura---sis-puella-magica-1 type="song"}

## 梶浦由記 - a royal girl {#梶浦由記---a-royal-girl type="song"}

## Anemoneria - Life is サイダー -TV size- - Life is Cider (TV size) {#anemoneria---life-is-サイダー--tv-size----life-is-cider-tv-size type="song"}

## Anemoneria - anemos {#anemoneria---anemos type="song"}

## Anemoneria - Life is サイダー - Life is Cider {#anemoneria---life-is-サイダー---life-is-cider type="song"}

## Anemoneria - 巣立ちの歌 - SUDACHINO UTA {#anemoneria---巣立ちの歌---sudachino-uta type="song"}

## Tainaka Sachi - 一番星 - Ichibanboshi {#tainaka-sachi---一番星---ichibanboshi type="song"}

## 以冬 - 我的一个道姑朋友 {#以冬---我的一个道姑朋友 type="song"}

## SAYURI - 花の塔 - Tower of Flower {#sayuri---花の塔---tower-of-flower type="song"}

## Saku Chan - Sayuri - Flower Tower (花の塔) {#saku-chan---sayuri---flower-tower-花の塔 type="song"}

## 陳綺貞 (Cheer Chen) - 我喜歡上你時的内心活動 {#陳綺貞-cheer-chen---我喜歡上你時的内心活動 type="song"}

## 陳綺貞 (Cheer Chen) - 旅行的意義 (Travel is Meaningful) {#陳綺貞-cheer-chen---旅行的意義-travel-is-meaningful type="song"}

## 许巍 - 旅行 {#许巍---旅行 type="song"}

## 许巍 - 像风一样自由 {#许巍---像风一样自由 type="song"}

## 许巍 - The Blue Lotus {#许巍---the-blue-lotus type="song"}

## 许巍 - 曾经的你 {#许巍---曾经的你 type="song"}

## 朴树 - 苏珊的舞鞋 {#朴树---苏珊的舞鞋 type="song"}

## 朴樹 - 我去2000年 {#朴樹---我去2000年 type="song"}

## 朴树 - 且听风吟 {#朴树---且听风吟 type="song"}

## 朴树 - Baby, Досвидания {#朴树---baby-досвидания type="song"}

## 朴树 - 猎户星座 {#朴树---猎户星座 type="song"}

## 朴樹 - 那些花兒 {#朴樹---那些花兒 type="song"}

## 朴树 - 清白之年 {#朴树---清白之年 type="song"}

## 朴樹 - 白樺樹 {#朴樹---白樺樹 type="song"}

## 朴樹 - New Boy {#朴樹---new-boy type="song"}

## 朴树 - 生如夏花 {#朴树---生如夏花 type="song"}

## 朴树 - 平凡之路 {#朴树---平凡之路 type="song"}

## Joe Hisaishi - Summer Road {#joe-hisaishi---summer-road type="song"}

## Joe Hisaishi - Mad Summer {#joe-hisaishi---mad-summer type="song"}

## Joe Hisaishi - Summer {#joe-hisaishi---summer type="song"}

## 桜坂しずく (CV.前田佳織里) - Solitude Rain {#桜坂しずく-cv.前田佳織里---solitude-rain type="song"}

## saberbutterfly - 【洛天依·樂正綾】Luo Tianyi, Yuezheng Ling - 白石溪 White Stone Creek {#saberbutterfly---洛天依樂正綾luo-tianyi-yuezheng-ling---白石溪-white-stone-creek type="song"}

## White Ryu - 風の強い日は嫌いか？ {#white-ryu---風の強い日は嫌いか type="song"}

## FranChouChou - 風の強い日は嫌いか？ FranChouChou cover(TV size) {#franchouchou---風の強い日は嫌いか-franchouchou-covertv-size type="song"}

## FranChouChou - 夢を手に、戻れる場所もない日々を {#franchouchou---夢を手に戻れる場所もない日々を type="song"}

## FranChouChou - 光へ (with7号ver.) {#franchouchou---光へ-with7号ver. type="song"}

## Iron Frill - FANTASTIC LOVERS {#iron-frill---fantastic-lovers type="song"}

## グリーンフェイス - DEAD or RAP！！！ {#グリーンフェイス---dead-or-rap type="song"}

## FranChouChou - 光へ {#franchouchou---光へ type="song"}

## 源さくら - 宣誓！ALIVE センセーション {#源さくら---宣誓alive-センセーション type="song"}

## フランシュシュ - アツクナレ {#フランシュシュ---アツクナレ type="song"}

## フランシュシュ - ドライブイン鳥 フランシュシュver. {#フランシュシュ---ドライブイン鳥-フランシュシュver. type="song"}

## FranChouChou - 追い風トラベラーズ(TV size) {#franchouchou---追い風トラベラーズtv-size type="song"}

## フランシュシュ - 輝いて {#フランシュシュ---輝いて type="song"}

## Yasuharu Takanashi - 素直になれなくて {#yasuharu-takanashi---素直になれなくて type="song"}

## FranChouChou - REVENGE {#franchouchou---revenge type="song"}

## フランシュシュ - 徒花ネクロマンシー Album ver. {#フランシュシュ---徒花ネクロマンシー-album-ver. type="song"}

## Iron Frill - Nope!!!!! {#iron-frill---nope type="song"}

## フランシュシュ - 目覚めRETURNER (Electric Returner) {#フランシュシュ---目覚めreturner-electric-returner type="song"}

## Kotaro Tatsumi - Never ending saga [[jp]{.smallcaps}]{.tag tag-name="jp"} [[sad]{.smallcaps}]{.tag tag-name="sad"} {#kotaro-tatsumi---never-ending-saga type="song" rate="3"}

## フランシュシュ - ヨミガエレ {#フランシュシュ---ヨミガエレ type="song"}

## FranChouChou 6 - リトルパラッポ {#franchouchou-6---リトルパラッポ type="song"}

## フランシュシュ - 佐賀事変 {#フランシュシュ---佐賀事変 type="song"}

## FranChouChou - REVENGE (#1 TV size) {#franchouchou---revenge-1-tv-size type="song"}

## FranChouChou - 目覚めRETURNER (Electric Returner Type \"R\") {#franchouchou---目覚めreturner-electric-returner-type-r type="song"}

## フランシュシュ - 特攻DANCE `DAWN OF THE BAD` {#フランシュシュ---特攻dance-dawn-of-the-bad type="song"}

## FranChouChou - 大河よ共に泣いてくれ(TV size) {#franchouchou---大河よ共に泣いてくれtv-size type="song"}

## FranChouChou - 激昂サバイブ [[jp]{.smallcaps}]{.tag tag-name="jp"} [[anime]{.smallcaps}]{.tag tag-name="anime"} [[dance]{.smallcaps}]{.tag tag-name="dance"} {#franchouchou---激昂サバイブ type="song"}

## 張碧晨 - 年輪 {#張碧晨---年輪 type="song"}

## 张碧晨 - 笼 (电影《消失的她》片尾主题曲) {#张碧晨---笼-电影消失的她片尾主题曲 type="song"}

## 張碧晨 and 楊宗緯 - 涼涼 {#張碧晨-and-楊宗緯---涼涼 type="song"}

## 薩頂頂 - 左手指月 (電視劇《香蜜沉沉燼如霜》片尾曲) {#薩頂頂---左手指月-電視劇香蜜沉沉燼如霜片尾曲 type="song"}

## 雷雨心 - 记·念 {#雷雨心---记念 type="song"}

## 黄义达 - 那女孩对我说 {#黄义达---那女孩对我说 type="song"}

## Gala - 追梦赤子心 {#gala---追梦赤子心 type="song"}

## 趙雷 - 畫 {#趙雷---畫 type="song"}

## 趙雷 - 程艾影 {#趙雷---程艾影 type="song"}

## 趙雷 - 鼓樓 {#趙雷---鼓樓 type="song"}

## 趙雷 - 南方姑娘 {#趙雷---南方姑娘 type="song"}

## 趙雷 - 我記得 {#趙雷---我記得 type="song"}

## 趙雷 - 成都 {#趙雷---成都 type="song"}

## Lana Del Rey - Young And Beautiful {#lana-del-rey---young-and-beautiful type="song"}

## HWMusic Channel - 筷子兄弟 - 老男孩「一首歌祭奠已逝去的青春與夢想」動態歌詞版MV -HWMusic- {#hwmusic-channel---筷子兄弟---老男孩一首歌祭奠已逝去的青春與夢想動態歌詞版mv--hwmusic- type="song"}

## TeddyLoid - Corset Theme {#teddyloid---corset-theme type="song"}

## TCY FORCE - Champion feat. Emyli（合作音乐人：Emyli） [[en]{.smallcaps}]{.tag tag-name="en"} {#tcy-force---champion-feat.-emyli合作音乐人emyli type="song" rate="3"}

## TeddyLoid - D City Rock feat. Debra Zeer（合作音乐人：Debra Zeer）

## TeddyLoid - Fly Away {#teddyloid---fly-away type="song"}

## TCY FORCE - CHOCOLAT feat. Mariya Ise（合作音乐人：Mariya Ise） {#tcy-force---chocolat-feat.-mariya-ise合作音乐人mariya-ise type="song"}

## 三亩地 - 城南花已开 {#三亩地---城南花已开 type="song"}

## Feora - Futari no Kimochi - Inuyasha (Lofi) {#feora---futari-no-kimochi---inuyasha-lofi type="song"}

## 无情的蓝色 - 犬夜叉剧场版《穿越时空的思念》主题曲 穿越时空的思念 {#无情的蓝色---犬夜叉剧场版穿越时空的思念主题曲-穿越时空的思念 type="song"}

## 宫本浩次 - 冬の花 - Fuyu No Hana {#宫本浩次---冬の花---fuyu-no-hana type="song"}

## Goose house - オトノナルホウヘ→ - Oto No Naru Houe {#goose-house---オトノナルホウヘ---oto-no-naru-houe type="song"}

## Goose house - 光るなら - Hikarunara {#goose-house---光るなら---hikarunara type="song"}

## David Webb - Down To The River To Pray - Alison Krauss {#david-webb---down-to-the-river-to-pray---alison-krauss type="song"}

## Gillian Welch and Alison Krauss - I\'ll Fly Away {#gillian-welch-and-alison-krauss---ill-fly-away type="song"}

## 虹ヶ咲学園スクールアイドル同好会 - 夢がここからはじまるよ（『ラブライブ！虹ヶ咲学園スクールアイドル同好会』挿入歌） {#虹ヶ咲学園スクールアイドル同好会---夢がここからはじまるよラブライブ虹ヶ咲学園スクールアイドル同好会挿入歌 type="song"}

## 虹ヶ咲学園スクールアイドル同好会 - NEO SKY, NEO MAP! {#虹ヶ咲学園スクールアイドル同好会---neo-sky-neo-map type="song"}

## Nijigasaki High School Idol Club - 繚乱！ビクトリーロード - Ryoran! Victory Road {#nijigasaki-high-school-idol-club---繚乱ビクトリーロード---ryoran-victory-road type="song"}

## 虹ヶ咲学園スクールアイドル同好会 - 虹色Passions! {#虹ヶ咲学園スクールアイドル同好会---虹色passions type="song"}

## Nijigasaki High School Idol Club - Colorful Dreams! Colorful Smiles! {#nijigasaki-high-school-idol-club---colorful-dreams-colorful-smiles type="song"}

## Aqours - Hop? Stop? Nonstop! {#aqours---hop-stop-nonstop type="song"}

## Aqours - 君のこころは輝いてるかい? {#aqours---君のこころは輝いてるかい type="song"}

## Aqours - MY舞☆TONIGHT {#aqours---my舞tonight type="song"}

## Aqours - HAPPY PARTY TRAIN {#aqours---happy-party-train type="song"}

## 星空 凛 (CV.飯田里穂)、西木野真姫 (CV.Pile)、小泉花陽 (CV.久保ユリカ) - Hello,星を数えて {#星空-凛-cv.飯田里穂西木野真姫-cv.pile小泉花陽-cv.久保ユリカ---hello星を数えて type="song"}

## μ\'s - ミはμ\'sicのミ {#μs---ミはμsicのミ type="song"}

## μ\'s - Oh,Love&Peace! (TVサイズ)\[第13話挿入歌\] {#μs---ohlovepeace-tvサイズ第13話挿入歌 type="song"}

## μ\'s - Paradise Live {#μs---paradise-live type="song"}

## μ\'s - タカラモノズ {#μs---タカラモノズ type="song"}

## μ\'s - Oh,Love&Peace! {#μs---ohlovepeace type="song"}

## μ\'s - 嵐のなかの恋だから {#μs---嵐のなかの恋だから type="song"}

## μ\'s - baby maybe 恋のボタン {#μs---baby-maybe-恋のボタン type="song"}

## μ\'s - KiRa-KiRa Sensation! {#μs---kira-kira-sensation type="song"}

## μ\'s - どんなときもずっと {#μs---どんなときもずっと type="song"}

## μ\'s - Dancing stars on me! [[jp]{.smallcaps}]{.tag tag-name="jp"} [[anime]{.smallcaps}]{.tag tag-name="anime"} {#μs---dancing-stars-on-me type="song"}

## μ\'s - 愛してるばんざーい! {#μs---愛してるばんざーい type="song"}

## μ\'s - Mermaid festa vol.1 {#μs---mermaid-festa-vol.1 type="song"}

## μ\'s - きっと青春が聞こえる {#μs---きっと青春が聞こえる type="song"}

## μ\'s - ユメノトビラ {#μs---ユメノトビラ type="song"}

## μ\'s - SUNNY DAY SONG {#μs---sunny-day-song type="song"}

## μ\'s - もぎゅっとloveで接近中! {#μs---もぎゅっとloveで接近中 type="song"}

## μ\'s - 僕たちはひとつの光 {#μs---僕たちはひとつの光 type="song"}

## μ\'s - No brand girls (TVサイズ)\[第11話挿入歌\] {#μs---no-brand-girls-tvサイズ第11話挿入歌 type="song"}

## μ\'s - それは僕たちの奇跡 {#μs---それは僕たちの奇跡 type="song"}

## μ\'s - Music S.T.A.R.T!! {#μs---music-s.t.a.r.t type="song"}

## μ\'s - 輝夜の城で踊りたい {#μs---輝夜の城で踊りたい type="song"}

## μ\'s - Snow halation {#μs---snow-halation type="song"}

## μ\'s - Wonderful Rush {#μs---wonderful-rush type="song"}

## μ\'s - Angelic Angel {#μs---angelic-angel type="song"}

## μ\'s - 僕らは今のなかで {#μs---僕らは今のなかで type="song"}

## μ\'s - 夏色えがおで1,2,Jump! {#μs---夏色えがおで12jump type="song"}

## μ\'s - START:DASH!! (TVサイズ)\[第13話挿入歌\] {#μs---startdash-tvサイズ第13話挿入歌 type="song"}

## μ\'s - Snow halation {#μs---snow-halation-1 type="song"}

## Houkago Teatime - キラキラDays {#houkago-teatime---キラキラdays type="song"}

## Houkago Teatime - ごはんはおかず(映画「けいおん!」Mix) {#houkago-teatime---ごはんはおかず映画けいおんmix type="song"}

## Houkago Teatime - Honey sweet tea time {#houkago-teatime---honey-sweet-tea-time type="song"}

## Houkago Teatime - ときめきシュガー {#houkago-teatime---ときめきシュガー type="song"}

## Houkago Teatime - ごはんはおかず {#houkago-teatime---ごはんはおかず type="song"}

## Houkago Teatime - Singing! {#houkago-teatime---singing type="song"}

## Houkago Teatime - 天使にふれたよ!(映画「けいおん!」Mix) {#houkago-teatime---天使にふれたよ映画けいおんmix type="song"}

## Houkago Teatime - ぴゅあぴゅあはーと {#houkago-teatime---ぴゅあぴゅあはーと type="song"}

## Houkago Teatime - Utauyo!!MIRACLE {#houkago-teatime---utauyomiracle type="song"}

## Houkago Teatime - Listen!! {#houkago-teatime---listen type="song"}

## Houkago Teatime - 天使にふれたよ! {#houkago-teatime---天使にふれたよ type="song"}

## Houkago Teatime - U&I {#houkago-teatime---ui type="song"}

## Houkago Teatime - NO, Thank You! {#houkago-teatime---no-thank-you type="song"}

## Houkago Teatime - GO! GO! MANIAC {#houkago-teatime---go-go-maniac type="song"}

## Ho-Kago Tea Time - ふわふわ時間 {#ho-kago-tea-time---ふわふわ時間 type="song"}

## 平沢唯(CV:豊崎愛生)、秋山澪(CV:日笠陽子)、桜高軽音部、田井中律(CV:佐藤聡美)和琴吹紬(CV:寿美菜子) - Don\'t say \"lazy\" {#平沢唯cv豊崎愛生秋山澪cv日笠陽子桜高軽音部田井中律cv佐藤聡美和琴吹紬cv寿美菜子---dont-say-lazy type="song"}

## Ado - unravel {#ado---unravel type="song"}

## Ado - うっせぇわ - Usseewa {#ado---うっせぇわ---usseewa type="song"}

## Ado - 唱 - Show {#ado---唱---show type="song"}

## Ado - オールナイトレディオ - All Night Radio {#ado---オールナイトレディオ---all-night-radio type="song"}

## mizuki - 『aLIEz』Music Video -アルドノア・ゼロ ver.- by SawanoHiroyuki\[nZk\]:mizuki（TVアニメ「アルドノア・ゼロ」エンディングテーマ） {#mizuki---aliezmusic-video--アルドノアゼロ-ver.--by-sawanohiroyukinzkmizukitvアニメアルドノアゼロエンディングテーマ type="song"}

## \*namirin - 「only my railgun」歌ってみた【＊なみりん】 {#namirin---only-my-railgun歌ってみたなみりん type="song"}

## 暗杠和寅子 - 說書人 {#暗杠和寅子---說書人 type="song"}

## Cécile Corbel - Le bal des chats {#cécile-corbel---le-bal-des-chats type="song"}

## Die Irrlichter - Madeleine {#die-irrlichter---madeleine type="song"}

## Alan Walker, Noah Cyrus and Digital Farm Animals - All Falls Down（合作音乐人：Juliander） {#alan-walker-noah-cyrus-and-digital-farm-animals---all-falls-down合作音乐人juliander type="song"}

## Alan Walker - Sing Me to Sleep {#alan-walker---sing-me-to-sleep type="song"}

## Sabrina Carpenter, Farruko and Alan Walker - On My Way {#sabrina-carpenter-farruko-and-alan-walker---on-my-way type="song"}

## Alan Walker - Alone {#alan-walker---alone type="song"}

## Alan Walker - The Spectre {#alan-walker---the-spectre type="song"}

## Alan Walker - Faded {#alan-walker---faded type="song"}

## PZK & Boris & Moris - Chuis Bo {#pzk-boris-moris---chuis-bo type="song"}

## Partenaire Particulier - Partenaire particulier {#partenaire-particulier---partenaire-particulier type="song"}

## Lucas Français ! - LA MARSEILLAISE - HYMNE DE LA FRANCE - PAROLES {#lucas-français---la-marseillaise---hymne-de-la-france---paroles type="song"}

## Pascal Obispo - Les longueurs（合作音乐人：Alexia Gredy） {#pascal-obispo---les-longueurs合作音乐人alexia-gredy type="song"}

## Owl City and Carly Rae Jepsen - Good Time {#owl-city-and-carly-rae-jepsen---good-time type="song"}

## LBI利比 - 小城夏天 {#lbi利比---小城夏天 type="song"}

## 五月天 [[五月天]{.smallcaps}]{.tag tag-name="五月天"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#五月天}

### 五月天 - 離開地球表面 {#五月天---離開地球表面 type="song"}

### 五月天 - 戀愛ing {#五月天---戀愛ing type="song"}

### 五月天 - 倔強 {#五月天---倔強 type="song"}

### 五月天 feat. 陳綺貞 - 私奔到月球 feat. 陳綺貞 Life Live（合作音乐人：陳綺貞 Life Live） {#五月天-feat.-陳綺貞---私奔到月球-feat.-陳綺貞-life-live合作音乐人陳綺貞-life-live type="song"}

### 五月天 - 洋蔥 {#五月天---洋蔥 type="song"}

### 五月天 (Mayday) - 星空 {#五月天-mayday---星空 type="song"}

### 五月天 - 溫柔 {#五月天---溫柔 type="song"}

### 五月天 (Mayday) - 派對動物 {#五月天-mayday---派對動物 type="song"}

### 五月天 (Mayday) - 你不是真正的快樂 {#五月天-mayday---你不是真正的快樂 type="song"}

### 五月天 - 玫瑰少年 {#五月天---玫瑰少年 type="song"}

### 五月天 - 步步 {#五月天---步步 type="song"}

### 五月天 - 入陣曲 {#五月天---入陣曲 type="song"}

### 五月天 - 為你寫下這首情歌 {#五月天---為你寫下這首情歌 type="song"}

### 五月天 (Mayday) - 乾杯 {#五月天-mayday---乾杯 type="song"}

### 五月天 - 知足 {#五月天---知足 type="song"}

### 五月天 (Mayday) - 突然好想你 {#五月天-mayday---突然好想你 type="song"}

### 五月天 (Mayday) - 我不願讓你一個人 {#五月天-mayday---我不願讓你一個人 type="song"}

### 五月天 (Mayday) - 後來的我們 {#五月天-mayday---後來的我們 type="song"}

## Barry Manilow - Copacabana (At the Copa) {#barry-manilow---copacabana-at-the-copa type="song"}

## Line Renaud - Copacabana {#line-renaud---copacabana type="song"}

## Gambino - Copacabana {#gambino---copacabana type="song"}

## Coldplay - Hymn for the Weekend {#coldplay---hymn-for-the-weekend type="song"}

## Coldplay - The Scientist {#coldplay---the-scientist type="song"}

## Coldplay - Viva La Vida {#coldplay---viva-la-vida type="song"}

## Coldplay - Yellow {#coldplay---yellow type="song"}

## Various Artists和Choir and Orchestra Charlie Steinmann - Scoobidoo Love {#various-artists和choir-and-orchestra-charlie-steinmann---scoobidoo-love type="song"}

## 周杰伦 and 杨瑞代 - Ai De Fei Xing Ri Ji {#周杰伦-and-杨瑞代---ai-de-fei-xing-ri-ji type="song"}

## Antonio Carlos Jobim - Sabiá {#antonio-carlos-jobim---sabiá type="song"}

## Luiz Gonzaga - Sabiá {#luiz-gonzaga---sabiá type="song"}

## 王菲 - 王菲 - 悶 {#王菲---王菲---悶 type="song"}

## Miyuna - みゆな - 缶ビール【Official Music Video】 {#miyuna---みゆな---缶ビールofficial-music-video type="song"}

## Beyond [[beyond]{.smallcaps}]{.tag tag-name="beyond"} [[hk]{.smallcaps}]{.tag tag-name="hk"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#beyond}

### Beyond - 冷雨夜 {#beyond---冷雨夜 type="song"}

### Beyond - 大地 {#beyond---大地 type="song"}

### Beyond - 喜欢妳 {#beyond---喜欢妳 type="song"}

### Beyond - 情人 {#beyond---情人 type="song"}

### Beyond - 真的爱妳 {#beyond---真的爱妳 type="song"}

### Beyond - 灰色轨迹 {#beyond---灰色轨迹 type="song"}

### Beyond - 光辉岁月 {#beyond---光辉岁月-1 type="song"}

### Beyond - 海阔天空 {#beyond---海阔天空 type="song"}

## Neil Diamond - Sweet Caroline {#neil-diamond---sweet-caroline type="song"}

## The Beatles [[beatles]{.smallcaps}]{.tag tag-name="beatles"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#the-beatles}

### The Beatles - Back In The U.S.S.R. {#the-beatles---back-in-the-u.s.s.r. type="song"}

### The Beatles - Oh! Darling (Remastered 2009) {#the-beatles---oh-darling-remastered-2009 type="song"}

### The Beatles - In My Life (Remastered 2009) {#the-beatles---in-my-life-remastered-2009 type="song"}

### The Beatles - Yesterday (Remastered 2009) {#the-beatles---yesterday-remastered-2009 type="song"}

### The Beatles - Yellow Submarine (Remastered 2009) {#the-beatles---yellow-submarine-remastered-2009 type="song"}

### The Beatles - Hey Jude {#the-beatles---hey-jude type="song"}

### The Beatles - And I Love Her (Remastered 2009) {#the-beatles---and-i-love-her-remastered-2009 type="song"}

### The Beatles - Something (Remastered 2009) {#the-beatles---something-remastered-2009 type="song"}

### The Beatles - Come Together (Remastered 2009) {#the-beatles---come-together-remastered-2009 type="song"}

### The Beatles - Let It Be (Remastered 2009) {#the-beatles---let-it-be-remastered-2009 type="song"}

### The Beatles - Don't Let Me Down (First Rooftop Performance) {#the-beatles---dont-let-me-down-first-rooftop-performance type="song"}

### The Beatles - Here Comes The Sun (Remastered 2009) {#the-beatles---here-comes-the-sun-remastered-2009 type="song"}

## 田馥甄 [[田馥甄]{.smallcaps}]{.tag tag-name="田馥甄"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[emotion]{.smallcaps}]{.tag tag-name="emotion"} {#田馥甄}

### 田馥甄 - 還是要幸福(Still in happiness) {#田馥甄---還是要幸福still-in-happiness type="song"}

### 田馥甄 - 魔鬼中的天使(Angel devil) {#田馥甄---魔鬼中的天使angel-devil type="song"}

### 田馥甄 - 你就不要想起我 {#田馥甄---你就不要想起我 type="song"}

### 田馥甄 - 小幸運(我的少女時代電影主題曲) {#田馥甄---小幸運我的少女時代電影主題曲 type="song"}

## Shakira [[shakira]{.smallcaps}]{.tag tag-name="shakira"} [[en]{.smallcaps}]{.tag tag-name="en"} [[dance]{.smallcaps}]{.tag tag-name="dance"} {#shakira}

### Shakira - Acróstico (Milan + Sasha) {#shakira---acróstico-milan-sasha type="song"}

### Shakira - Hips Don\'t Lie（合作音乐人：Wyclef Jean） {#shakira---hips-dont-lie合作音乐人wyclef-jean type="song"}

### Shakira - Whenever, Wherever {#shakira---whenever-wherever type="song"}

### Shakira - Waka Waka (Esto es Africa) \[Cancion Oficial de la Copa Mundial de la FIFA (TM) Sudafrica 2010\]（合作音乐人：Freshlyground） {#shakira---waka-waka-esto-es-africa-cancion-oficial-de-la-copa-mundial-de-la-fifa-tm-sudafrica-2010合作音乐人freshlyground type="song"}

### Bizarrap and Shakira - Shakira: Bzrp Music Sessions, Vol. 53 [[classic]{.smallcaps}]{.tag tag-name="classic"} {#bizarrap-and-shakira---shakira-bzrp-music-sessions-vol.-53 type="song"}

## 徐良 [[徐良]{.smallcaps}]{.tag tag-name="徐良"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[love]{.smallcaps}]{.tag tag-name="love"} [[cn]{.smallcaps}]{.tag tag-name="cn"} {#徐良}

### 徐良 - 坏女孩（合作音乐人：小凌） {#徐良---坏女孩合作音乐人小凌 type="song"}

### 徐良 - 后会无期（合作音乐人：汪苏泷） {#徐良---后会无期合作音乐人汪苏泷 type="song"}

### 徐良 - 客官不可以（合作音乐人：小凌） {#徐良---客官不可以合作音乐人小凌 type="song"}

## 许嵩 [[许嵩]{.smallcaps}]{.tag tag-name="许嵩"} {#许嵩}

### 許嵩 - 你若成風 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#許嵩---你若成風 type="song"}

### 許嵩 - 雅俗共賞 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#許嵩---雅俗共賞 type="song"}

### 許嵩 - 玫瑰花的葬禮 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#許嵩---玫瑰花的葬禮 type="song"}

### 許嵩 - 素顏 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#許嵩---素顏 type="song"}

### 許嵩 - 有何不可 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#許嵩---有何不可 type="song"}

## 王心凌 [[王心凌]{.smallcaps}]{.tag tag-name="王心凌"} {#王心凌}

### 王心凌 - 不哭 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#王心凌---不哭 type="song"}

### 王心凌 - 當你 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#王心凌---當你 type="song"}

### 王心凌 - 感情用事 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#王心凌---感情用事 type="song"}

### 王心凌 - 愛你 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#王心凌---愛你 type="song"}

## Gibran Alcocer - All ideas playlist (Slowed & Reverb Relax Playlist) [[pure]{.smallcaps}]{.tag tag-name="pure"} {#gibran-alcocer---all-ideas-playlist-slowed-reverb-relax-playlist type="song"}

## 徐梦圆 - China [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pure]{.smallcaps}]{.tag tag-name="pure"} {#徐梦圆---china type="song" rate="5"}

## 徐梦圆 - China-X [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pure]{.smallcaps}]{.tag tag-name="pure"} {#徐梦圆---china-x type="song"}

## 徐梦圆 - China-P [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pure]{.smallcaps}]{.tag tag-name="pure"} {#徐梦圆---china-p type="song"}

## 接个吻，开一枪 and Clare - 南锣鼓巷 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pure]{.smallcaps}]{.tag tag-name="pure"} {#接个吻开一枪-and-clare---南锣鼓巷 type="song"}

## 接个吻，开一枪 and SaMZIng - 烟袋斜街 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pure]{.smallcaps}]{.tag tag-name="pure"} {#接个吻开一枪-and-samzing---烟袋斜街 type="song"}

## 接个吻，开一枪, 沈以诚 and 薛黛霏 - 失眠飞行 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pure]{.smallcaps}]{.tag tag-name="pure"} {#接个吻开一枪-沈以诚-and-薛黛霏---失眠飞行 type="song"}

## Fate Tung - 鹿先森乐队-春風十里 {#fate-tung---鹿先森乐队-春風十里 type="song"}

## Akon - Right Now (Na Na Na) {#akon---right-now-na-na-na type="song"}

## 卦者灵风 - 迁坟 {#卦者灵风---迁坟 type="song"}

## 卦者灵风 - 袈裟 {#卦者灵风---袈裟 type="song"}

## 卦者灵风和因你而在的梦 - 孟母三迁 {#卦者灵风和因你而在的梦---孟母三迁 type="song"}

## 卦者灵风 - 杨玉环 {#卦者灵风---杨玉环 type="song"}

## 卦者灵风 - 范进中举 {#卦者灵风---范进中举 type="song"}

## MrCannan - 二手玫瑰《仙儿》 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#mrcannan---二手玫瑰仙儿 type="song"}

## 郑智化 - 星星点灯 {#郑智化---星星点灯 type="song"}

## 郑智化 - 水手 {#郑智化---水手 type="song"}

## 银临 - 流光记 {#银临---流光记 type="song"}

## 银临 and 云の泣 - 锦鲤抄 {#银临-and-云の泣---锦鲤抄 type="song"}

## 李荣浩 [[李荣浩]{.smallcaps}]{.tag tag-name="李荣浩"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#李荣浩}

## 李荣浩 - 贫穷或富有 {#李荣浩---贫穷或富有 type="song"}

### 李荣浩 - 野生动物 {#李荣浩---野生动物 type="song"}

### 李荣浩 - 耳朵 {#李荣浩---耳朵 type="song"}

### 李荣浩 - 喜剧之王 {#李荣浩---喜剧之王 type="song"}

### 李荣浩 - 爸爸妈妈 {#李荣浩---爸爸妈妈 type="song"}

### 李荣浩 - 麻雀 {#李荣浩---麻雀 type="song"}

### 李荣浩 - 不将就 (电影\"何以笙箫默\"片尾曲) {#李荣浩---不将就-电影何以笙箫默片尾曲 type="song"}

### 李荣浩 - 戒烟 {#李荣浩---戒烟 type="song"}

### 李荣浩 - 对等关系（合作音乐人：张惠妹） {#李荣浩---对等关系合作音乐人张惠妹 type="song"}

### 李荣浩 - 乌梅子酱 {#李荣浩---乌梅子酱 type="song"}

### 李荣浩 - 年少有为 {#李荣浩---年少有为 type="song"}

## 邓丽君 - 恰似你的温柔 {#邓丽君---恰似你的温柔 type="song"}

## 花儿乐队 [[花儿乐队]{.smallcaps}]{.tag tag-name="花儿乐队"} [[大张伟]{.smallcaps}]{.tag tag-name="大张伟"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#花儿乐队}

### 漂流製造 - 花兒 - 稻草上的火雞 {#漂流製造---花兒---稻草上的火雞 type="song"}

### 花儿乐队 - 嘻唰唰 {#花儿乐队---嘻唰唰 type="song"}

### 花儿乐队 - 大喜宙 {#花儿乐队---大喜宙 type="song"}

### 花儿乐队 - 鹊桥汇 {#花儿乐队---鹊桥汇 type="song"}

### 花儿乐队 - 我的果汁分你一半 {#花儿乐队---我的果汁分你一半 type="song"}

### 花儿乐队 - 穷开心 {#花儿乐队---穷开心 type="song"}

## 金莎 - 星月神話 {#金莎---星月神話 type="song"}

## 郁可唯 - 路過人間 {#郁可唯---路過人間 type="song"}

## 谢春花 [[谢春花]{.smallcaps}]{.tag tag-name="谢春花"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[folk]{.smallcaps}]{.tag tag-name="folk"} [[working]{.smallcaps}]{.tag tag-name="working"} {#谢春花}

### 謝春花 - 唱不了一首歡樂的歌 {#謝春花---唱不了一首歡樂的歌 type="song"}

### 謝春花 - 雀斑少女 {#謝春花---雀斑少女 type="song"}

### 謝春花 - 遠辰落身旁 {#謝春花---遠辰落身旁 type="song"}

### 謝春花 - 荒島 {#謝春花---荒島 type="song"}

### 謝春花 - 茶酒伴 {#謝春花---茶酒伴 type="song"}

### 謝春花 - 我從崖邊跌落 {#謝春花---我從崖邊跌落 type="song"}

### 謝春花 - 妄為 {#謝春花---妄為 type="song"}

### 謝春花 - 一顆會開花的樹 {#謝春花---一顆會開花的樹 type="song"}

### 謝春花 - 俗人言 {#謝春花---俗人言 type="song"}

### 謝春花 - 只道尋常 {#謝春花---只道尋常 type="song"}

### 謝春花 - 理想三旬 {#謝春花---理想三旬 type="song"}

### 謝春花 - 借我 {#謝春花---借我 type="song"}

## James Whittle - Katyusha/Катюша with Lyrics {#james-whittle---katyushaкатюша-with-lyrics type="song"}

## Любэ - Позови меня тихо по имени {#любэ---позови-меня-тихо-по-имени type="song"}

## Любэ - Солдат {#любэ---солдат type="song"}

## Любэ - Конь {#любэ---конь type="song"}

## Любэ - Дай ему сил {#любэ---дай-ему-сил type="song"}

## Boney M. - Rivers of Babylon {#boney-m.---rivers-of-babylon type="song"}

## Boney M. - Sunny {#boney-m.---sunny-1 type="song"}

## Boney M. - Rasputin {#boney-m.---rasputin type="song"}

## 磯村由紀子 - 風の住む街 {#磯村由紀子---風の住む街 type="song"}

## 房东的猫 - 鲸鱼电台 {#房东的猫---鲸鱼电台 type="song"}

## 房东的猫 - 所念皆星河 {#房东的猫---所念皆星河 type="song"}

## Patrick Sébastien - Les sardines {#patrick-sébastien---les-sardines type="song"}

## Joe Hisaishi - The Sun Also Rises {#joe-hisaishi---the-sun-also-rises type="song"}

## Joe Hisaishi - Labyrinth of Eden {#joe-hisaishi---labyrinth-of-eden type="song"}

## Joe Hisaishi - Angel Bell {#joe-hisaishi---angel-bell type="song"}

## Joe Hisaishi和Orchestra Città di Ferrara - Nostalgia {#joe-hisaishi和orchestra-città-di-ferrara---nostalgia type="song"}

## Joe Hisaishi - The Rain {#joe-hisaishi---the-rain type="song"}

## Joe Hisaishi and London Symphony Orchestra - One Summer\'s Day (from \'Spirited Away\') {#joe-hisaishi-and-london-symphony-orchestra---one-summers-day-from-spirited-away type="song"}

## Joe Hisaishi and London Symphony Orchestra - Summer (from \'Kikujiro\') {#joe-hisaishi-and-london-symphony-orchestra---summer-from-kikujiro type="song"}

## Joe Hisaishi - Merry-Go-Round of Life (from \'Howl\'s Moving Castle\') {#joe-hisaishi---merry-go-round-of-life-from-howls-moving-castle type="song"}

## 郭顶 - 凄美地 {#郭顶---凄美地 type="song"}

## 郭顶 - 水星记 {#郭顶---水星记 type="song"}

## 郭顶 - 水星记 {#郭顶---水星记-1 type="song"}

## Hanser - 勾指起誓 {#hanser---勾指起誓 type="song"}

## rerulili - 神のまにまに {#rerulili---神のまにまに type="song"}

## 音雨夜 - 【泠鸢yousa】【中文填词】神的随波逐流 原曲：神のまにまに {#音雨夜---泠鸢yousa中文填词神的随波逐流-原曲神のまにまに type="song"}

## 泠鸢yousa、岚AYA、HOSHINO EIICHI、三无、冥月和Mes - 流光乐夜 {#泠鸢yousa岚ayahoshino-eiichi三无冥月和mes---流光乐夜 type="song"}

## hanser、泠鸢yousa、祖娅纳惜和鹿乃ちゃん - 吉祥话 {#hanser泠鸢yousa祖娅纳惜和鹿乃ちゃん---吉祥话 type="song"}

## 泠鸢yousa - 与你有关 {#泠鸢yousa---与你有关 type="song"}

## 乐正绫、泠鸢yousa、茶理理、Hanser和三无Marblue - 千里邀月 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#乐正绫泠鸢yousa茶理理hanser和三无marblue---千里邀月 type="song" rate="5"}

## 音阙诗听, 泠鸢yousa and 王梓钰 - 还是你的笑容最可爱 {#音阙诗听-泠鸢yousa-and-王梓钰---还是你的笑容最可爱 type="song"}

## 泠鸢yousa - 大喜 {#泠鸢yousa---大喜 type="song"}

## Arden - 【洛天依】Luo Tianyi - Mr. Rabbit 兔子先生 {#arden---洛天依luo-tianyi---mr.-rabbit-兔子先生 type="song"}

## ilem, 洛天依 and 言和 - 达拉崩吧 {#ilem-洛天依-and-言和---达拉崩吧 type="song"}

## 洛天依 and 言和 - 普通Disco {#洛天依-and-言和---普通disco type="song"}

## 洛天依 and 乐正绫 - 九九八十一 {#洛天依-and-乐正绫---九九八十一 type="song"}

## 洛天依, 言和 and 乐正绫 - 四重罪孽 {#洛天依-言和-and-乐正绫---四重罪孽 type="song"}

## 小野道ono - 海豚与广播（合作音乐人：乌拉喵） {#小野道ono---海豚与广播合作音乐人乌拉喵 type="song"}

## Beethoven - Für Elise {#beethoven---für-elise type="song"}

## Beethoven - Moonlight Sonata {#beethoven---moonlight-sonata type="song"}

## Relax Cafe Music - Beethoven - Moonlight Sonata 10 Hours {#relax-cafe-music---beethoven---moonlight-sonata-10-hours type="song"}

## Berliner Philharmoniker, 卡拉杨 and Ludwig van Beethoven - Beethoven: Symphony No. 3 in E Flat Major, Op. 55 \"Eroica\": I. Allegro con brio {#berliner-philharmoniker-卡拉杨-and-ludwig-van-beethoven---beethoven-symphony-no.-3-in-e-flat-major-op.-55-eroica-i.-allegro-con-brio type="song"}

## Marc Neikrug, Pinchas Zukerman and Ludwig van Beethoven - Sonata No. 8, Op. 30, No. 3 in G: Allegro assai {#marc-neikrug-pinchas-zukerman-and-ludwig-van-beethoven---sonata-no.-8-op.-30-no.-3-in-g-allegro-assai type="song"}

## 马友友, Leonidas Kavakos, Emanuel Ax and Ludwig van Beethoven - Symphony No. 5 in C Minor, Op. 67: I. Allegro con brio {#马友友-leonidas-kavakos-emanuel-ax-and-ludwig-van-beethoven---symphony-no.-5-in-c-minor-op.-67-i.-allegro-con-brio type="song"}

## Cleveland Quartet and Ludwig van Beethoven - String Quartet No. 2 in G Major, Op. 18 No. 2: III. Scherzo. Allegro - Trio {#cleveland-quartet-and-ludwig-van-beethoven---string-quartet-no.-2-in-g-major-op.-18-no.-2-iii.-scherzo.-allegro---trio type="song"}

## Frank Peter Zimmermann, English Chamber Orchestra, Jeffrey Tate and Ludwig van Beethoven - Romance for Violin and Orchestra No. 2 in F Major, Op. 50 {#frank-peter-zimmermann-english-chamber-orchestra-jeffrey-tate-and-ludwig-van-beethoven---romance-for-violin-and-orchestra-no.-2-in-f-major-op.-50 type="song"}

## Murray Perahia and Ludwig van Beethoven - Piano Sonata No. 3 in C Major, Op. 2 No. 3: I. Allegro con brio {#murray-perahia-and-ludwig-van-beethoven---piano-sonata-no.-3-in-c-major-op.-2-no.-3-i.-allegro-con-brio type="song"}

## Daniel Barenboim, Michael Barenboim, Kian Soltani and Ludwig van Beethoven - Beethoven: Piano Trio No. 7 in B Flat Major, Op. 97 \"Archduke\" - I. Allegro moderato {#daniel-barenboim-michael-barenboim-kian-soltani-and-ludwig-van-beethoven---beethoven-piano-trio-no.-7-in-b-flat-major-op.-97-archduke---i.-allegro-moderato type="song"}

## Wiener Philharmoniker, Carlos Kleiber and Ludwig van Beethoven - Beethoven: Symphony No. 5 in C Minor, Op. 67: IV. Allegro {#wiener-philharmoniker-carlos-kleiber-and-ludwig-van-beethoven---beethoven-symphony-no.-5-in-c-minor-op.-67-iv.-allegro type="song"}

## Kathryn Stott and 马友友 - The Swan (Saint-Saëns) {#kathryn-stott-and-马友友---the-swan-saint-saëns type="song"}

## 雷·陈 - "The Swan" by Saint-Saëns (Ray Chen & Julio Elizalde) {#雷陈---the-swan-by-saint-saëns-ray-chen-julio-elizalde type="song"}

## Johann Sebastian Bach - Cello Suite #1 in G, Prelude {#johann-sebastian-bach---cello-suite-1-in-g-prelude type="song"}

## Johann Sebastian Bach - Concerto for Two Violins in D Minor, BWV 1043: I. Vivace {#johann-sebastian-bach---concerto-for-two-violins-in-d-minor-bwv-1043-i.-vivace type="song"}

## Bach - Trumpet Voluntary {#bach---trumpet-voluntary type="song"}

## Lucas Jussen, Arthur Jussen and Johann Sebastian Bach - J.S. Bach: Was mir behagt, ist nur die muntre Jagd, BWV 208 \"Hunting Cantata\": IX. Aria. Schafe können sicher weiden (Arr. Howe for Piano 4 Hands) {#lucas-jussen-arthur-jussen-and-johann-sebastian-bach---j.s.-bach-was-mir-behagt-ist-nur-die-muntre-jagd-bwv-208-hunting-cantata-ix.-aria.-schafe-können-sicher-weiden-arr.-howe-for-piano-4-hands type="song"}

## Münchener Bach-Orchester, Karl Richter and Johann Sebastian Bach - J.S. Bach: Orchestral Suite No. 3 in D Major, BWV 1068: II. Air {#münchener-bach-orchester-karl-richter-and-johann-sebastian-bach---j.s.-bach-orchestral-suite-no.-3-in-d-major-bwv-1068-ii.-air type="song"}

## Academy of St Martin in the Fields, Sir Neville Marriner and Wolfgang Amadeus Mozart - Mozart: Symphony No. 25 in G Minor, K. 183: I. Allegro con brio {#academy-of-st-martin-in-the-fields-sir-neville-marriner-and-wolfgang-amadeus-mozart---mozart-symphony-no.-25-in-g-minor-k.-183-i.-allegro-con-brio type="song"}

## Jan Lisiecki, Symphonieorchester des Bayerischen Rundfunks, Christian Zacharias and Wolfgang Amadeus Mozart - Mozart: Piano Concerto No. 21 in C Major, K.467: II. Andante {#jan-lisiecki-symphonieorchester-des-bayerischen-rundfunks-christian-zacharias-and-wolfgang-amadeus-mozart---mozart-piano-concerto-no.-21-in-c-major-k.467-ii.-andante type="song"}

## Wolfgang Amadeus Mozart - Symphony No. 40 In G Minor K 550 Molto Allegro {#wolfgang-amadeus-mozart---symphony-no.-40-in-g-minor-k-550-molto-allegro type="song"}

## Jan Lisiecki, Symphonieorchester des Bayerischen Rundfunks, Christian Zacharias and Wolfgang Amadeus Mozart - Mozart: Piano Concerto No. 20 in D Minor, K.466: II. Romance {#jan-lisiecki-symphonieorchester-des-bayerischen-rundfunks-christian-zacharias-and-wolfgang-amadeus-mozart---mozart-piano-concerto-no.-20-in-d-minor-k.466-ii.-romance type="song"}

## Hans Graf, Mozarteum Orchestra Salzburg and Wolfgang Amadeus Mozar - Symphony No. 40 In G Minor - Molto Allegro {#hans-graf-mozarteum-orchestra-salzburg-and-wolfgang-amadeus-mozar---symphony-no.-40-in-g-minor---molto-allegro type="song"}

## Wiener Singverein, Wiener Philharmoniker and Wolfgang Amadeus Mozart - Mozart: Requiem, K. 626: IIIf. Lacrimosa {#wiener-singverein-wiener-philharmoniker-and-wolfgang-amadeus-mozart---mozart-requiem-k.-626-iiif.-lacrimosa type="song"}

## assan1030kazim1050 - Sexion D\'aussaut Samedi Soir {#assan1030kazim1050---sexion-daussaut-samedi-soir type="song"}

## Ray Dalton - ALL WE GOT {#ray-dalton---all-we-got type="song"}

## Phoebe Ryan - Mine {#phoebe-ryan---mine type="song"}

## The Chainsmokers - All We Know（合作音乐人：Phoebe Ryan） {#the-chainsmokers---all-we-know合作音乐人phoebe-ryan type="song"}

## The Chainsmokers and Coldplay - Something Just Like This {#the-chainsmokers-and-coldplay---something-just-like-this type="song"}

## The Chainsmokers - Don\'t Let Me Down（合作音乐人：Daya） {#the-chainsmokers---dont-let-me-down合作音乐人daya type="song"}

## The Chainsmokers - Closer（合作音乐人：Halsey） {#the-chainsmokers---closer合作音乐人halsey type="song"}

## Taylor Swift [[taylorswift]{.smallcaps}]{.tag tag-name="taylorswift"} [[en]{.smallcaps}]{.tag tag-name="en"} {#taylor-swift}

### Taylor Swift - Red {#taylor-swift---red type="song"}

### Taylor Swift - Mine (Taylor\'s Version) {#taylor-swift---mine-taylors-version type="song"}

### Taylor Swift - End Game（合作音乐人：Ed Sheeran和Future） {#taylor-swift---end-game合作音乐人ed-sheeran和future type="song"}

### Taylor Swift - Welcome To New York {#taylor-swift---welcome-to-new-york type="song"}

### Taylor Swift - Gorgeous {#taylor-swift---gorgeous type="song"}

### Taylor Swift - Getaway Car {#taylor-swift---getaway-car type="song"}

### Taylor Swift - Is It Over Now? (Taylor\'s Version) (From The Vault) {#taylor-swift---is-it-over-now-taylors-version-from-the-vault type="song"}

### Taylor Swift - ...Ready For It? {#taylor-swift---ready-for-it type="song"}

### Taylor Swift - 22 {#taylor-swift---22 type="song"}

### Taylor Swift - Delicate {#taylor-swift---delicate type="song"}

### Taylor Swift - Daylight {#taylor-swift---daylight type="song"}

### Taylor Swift - Don't Blame Me {#taylor-swift---dont-blame-me type="song"}

### Taylor Swift - Bad Blood {#taylor-swift---bad-blood type="song"}

### Taylor Swift - Love Story {#taylor-swift---love-story type="song"}

### Taylor Swift - Style {#taylor-swift---style type="song"}

### Taylor Swift - Look What You Made Me Do {#taylor-swift---look-what-you-made-me-do type="song"}

### Taylor Swift - Enchanted {#taylor-swift---enchanted type="song"}

### Taylor Swift - Lover {#taylor-swift---lover type="song"}

### Taylor Swift - Shake It Off {#taylor-swift---shake-it-off type="song"}

### Taylor Swift - Blank Space {#taylor-swift---blank-space type="song"}

## 蔡健雅 - 紅色高跟鞋 {#蔡健雅---紅色高跟鞋 type="song"}

## 陈奕迅 [[陈奕迅]{.smallcaps}]{.tag tag-name="陈奕迅"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[hk]{.smallcaps}]{.tag tag-name="hk"} {#陈奕迅}

### 陳奕迅 - K歌之王 {#陳奕迅---k歌之王 type="song"}

### 陈奕迅 - 富士山下 {#陈奕迅---富士山下 type="song"}

### 陈奕迅 - 白玫瑰 {#陈奕迅---白玫瑰 type="song"}

### 陈奕迅 - 苦瓜 {#陈奕迅---苦瓜 type="song"}

### 陈奕迅 - 浮夸 {#陈奕迅---浮夸 type="song"}

### 陳奕迅 - K歌之王 {#陳奕迅---k歌之王-1 type="song"}

### 陈奕迅 - 葡萄成熟时 {#陈奕迅---葡萄成熟时 type="song"}

### 陈奕迅 - 好久不见 {#陈奕迅---好久不见 type="song"}

### 陳奕迅 - K歌之王 (國) {#陳奕迅---k歌之王-國 type="song"}

### 陈奕迅 - 最佳损友 {#陈奕迅---最佳损友 type="song"}

### 陳奕迅 - 明年今日 {#陳奕迅---明年今日 type="song"}

### 陈奕迅 - 淘汰 {#陈奕迅---淘汰 type="song"}

### 陳奕迅 - 歲月如歌 {#陳奕迅---歲月如歌 type="song"}

### 陈奕迅 - 爱情转移(国) {#陈奕迅---爱情转移国 type="song"}

### 陳奕迅 - 十年 (國) {#陳奕迅---十年-國 type="song"}

### 陳奕迅 - 十年 (OT: 明年今日) {#陳奕迅---十年-ot-明年今日 type="song"}

### 陈奕迅 - 富士山下 {#陈奕迅---富士山下-1 type="song"}

## 杨千嬅 - 处处吻 {#杨千嬅---处处吻 type="song"}

## 神通张 - 刘惜君 万水千山总是情Live [[cn]{.smallcaps}]{.tag tag-name="cn"} [[hk]{.smallcaps}]{.tag tag-name="hk"} [[happy]{.smallcaps}]{.tag tag-name="happy"} {#神通张---刘惜君-万水千山总是情live type="song" rate="5"}

## 梁紫丹 - 京华春梦 {#梁紫丹---京华春梦 type="song"}

## 梁紫丹 - 万水千山总是情 {#梁紫丹---万水千山总是情 type="song"}

## 血肉果汁機 - 打開太陽 {#血肉果汁機---打開太陽 type="song"}

## 珂拉琪 Collage - 這該死的拘執佮愛 {#珂拉琪-collage---這該死的拘執佮愛 type="song"}

## 珂拉琪 Collage - 傷心地獄芳花引魂 {#珂拉琪-collage---傷心地獄芳花引魂 type="song"}

## 珂拉琪 Collage - 葬予規路火烌猶在 {#珂拉琪-collage---葬予規路火烌猶在 type="song"}

## 珂拉琪 Collage - 萬千花蕊慈母悲哀 {#珂拉琪-collage---萬千花蕊慈母悲哀 type="song"}

## 万能青年旅店 - 揪心的玩笑与漫长的白日梦 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#万能青年旅店---揪心的玩笑与漫长的白日梦 type="song" rate="5"}

## 万能青年旅店 - 十万嬉皮 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[rock]{.smallcaps}]{.tag tag-name="rock"} {#万能青年旅店---十万嬉皮 type="song" rate="5"}

## 万能青年旅店 - 秦皇岛 {#万能青年旅店---秦皇岛 type="song"}

## 万能青年旅店 - 大石碎胸口 {#万能青年旅店---大石碎胸口 type="song"}

## 萬能青年旅店 - 山雀 {#萬能青年旅店---山雀 type="song"}

## 万能青年旅店 - 杀死那个石家庄人 {#万能青年旅店---杀死那个石家庄人 type="song"}

## Second Hand Rose - Red Flower (Hao Hua Hong) {#second-hand-rose---red-flower-hao-hua-hong type="song"}

## Second Hand Rose - Charity Song (Gong Yi Ge Qu) {#second-hand-rose---charity-song-gong-yi-ge-qu type="song"}

## Second Hand Rose - Because (Yin Wei Suo Yi) {#second-hand-rose---because-yin-wei-suo-yi type="song"}

## Second Hand Rose - Allowing Some Artists To Get Rich First (Yun Xu Bu Fen Yi Shu Jia Xian Fu Qi Lai) {#second-hand-rose---allowing-some-artists-to-get-rich-first-yun-xu-bu-fen-yi-shu-jia-xian-fu-qi-lai type="song"}

## 二手玫瑰 - 我要開花 {#二手玫瑰---我要開花 type="song"}

## Lana Del Rey - Born To Die {#lana-del-rey---born-to-die type="song"}

## Petit Rabbit\'s - 天空カフェテリア - tenkucafeteria {#petit-rabbits---天空カフェテリア---tenkucafeteria type="song"}

## Hello, Happy World! - ノーポイッ！ (Cover) {#hello-happy-world---ノーポイッ-cover type="song"}

## Petit Rabbit\'s - Daydream cafe {#petit-rabbits---daydream-cafe type="song"}

## KenshiYonezu [[米津玄师]{.smallcaps}]{.tag tag-name="米津玄师"} [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#kenshiyonezu}

### Kenshi Yonezu - 死神 - Shinigami [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#kenshi-yonezu---死神---shinigami type="song" rate="5"}

### DAOKO and Kenshi Yonezu - 打上花火 {#daoko-and-kenshi-yonezu---打上花火 type="song"}

### DAOKO and 米津玄师 - DAOKO × 米津玄師『打上花火』MUSIC VIDEO {#daoko-and-米津玄师---daoko-米津玄師打上花火music-video type="song"}

### バケモノバケツ委員会【バケ会】 - 【チェンソーマンOP】KICKBACK / 米津玄師 踊ってみた【バケ会】 {#バケモノバケツ委員会バケ会---チェンソーマンopkickback-米津玄師-踊ってみたバケ会 type="song"}

### 米津玄师 - 米津玄師 - 春雷 Kenshi Yonezu - Shunrai {#米津玄师---米津玄師---春雷-kenshi-yonezu---shunrai type="song"}

### Kenshi Yonezu - 春雷 - Shunrai {#kenshi-yonezu---春雷---shunrai type="song"}

### Kenshi Yonezu - LOSER {#kenshi-yonezu---loser type="song"}

### Kenshi Yonezu - KICK BACK {#kenshi-yonezu---kick-back type="song"}

### Kenshi Yonezu - Lemon {#kenshi-yonezu---lemon type="song"}

## Gen Hoshino - アイデア {#gen-hoshino---アイデア type="song"}

## Gen Hoshino - 光の跡 {#gen-hoshino---光の跡 type="song"}

## Gen Hoshino - 恋 {#gen-hoshino---恋 type="song"}

## YOASOBI [[YOASOBI]{.smallcaps}]{.tag tag-name="YOASOBI"} {#yoasobi}

### YOASOBI - ハルジオン [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---ハルジオン type="song"}

### YOASOBI - ハルカ [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---ハルカ type="song"}

### YOASOBI - 群青 [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---群青 type="song" rate="5"}

### YOASOBI - 怪物 [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---怪物 type="song" rate="5"}

### YOASOBI - 夜に駆ける [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---夜に駆ける type="song"}

### YOASOBI - 勇者 [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---勇者 type="song"}

### YOASOBI - アイドル [[jp]{.smallcaps}]{.tag tag-name="jp"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[electron]{.smallcaps}]{.tag tag-name="electron"} {#yoasobi---アイドル type="song"}

## RADWIMPS - すずめ（合作音乐人：Toaka） {#radwimps---すずめ合作音乐人toaka type="song"}

## 周深 - 铃芽之旅 {#周深---铃芽之旅 type="song"}

## 周深 - 人是\_ (电影《流浪地球2》定义主题曲) {#周深---人是_-电影流浪地球2定义主题曲 type="song"}

## 周深 and 郭沁 - 大鱼 {#周深-and-郭沁---大鱼 type="song"}

## 周深 - 起风了 {#周深---起风了 type="song"}

## SHAUN - Way Back Home \[Sam Feldt Edit\] (Lyric Video) {#shaun---way-back-home-sam-feldt-edit-lyric-video type="song"}

## Lana Del Rey - Summertime Sadness {#lana-del-rey---summertime-sadness type="song"}

## ah juong - 38 阿肆 A Si 郭采潔 Amber Kuo 【世界上的另一個我】HD 高清官方完整版 MV {#ah-juong---38-阿肆-a-si-郭采潔-amber-kuo-世界上的另一個我hd-高清官方完整版-mv type="song"}

## 阿肆 - 我在人民广场吃炸鸡 {#阿肆---我在人民广场吃炸鸡 type="song"}

## 阿肆 - 热爱105°C的你 {#阿肆---热爱105c的你-1 type="song"}

## 陈粒 [[陈粒]{.smallcaps}]{.tag tag-name="陈粒"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[folk]{.smallcaps}]{.tag tag-name="folk"} {#陈粒}

### 陳粒 - 大梦 {#陳粒---大梦 type="song"}

### 陳粒 - 正趣果上果 {#陳粒---正趣果上果 type="song"}

### 陳粒 - 七楼 {#陳粒---七楼 type="song"}

### 陳粒 - 祝星 {#陳粒---祝星 type="song"}

### 陳粒 - 如也 {#陳粒---如也 type="song"}

### 陳粒 - 芳草地 {#陳粒---芳草地 type="song"}

### 陳粒 - 桥豆麻袋 {#陳粒---桥豆麻袋 type="song"}

### 陳粒 - 不灭 {#陳粒---不灭 type="song"}

### 陳粒 - 历历万乡 {#陳粒---历历万乡 type="song"}

### 陳粒 - 绝对占有相对自由 {#陳粒---绝对占有相对自由 type="song"}

### 陳粒 - 光 {#陳粒---光 type="song"}

### 陳粒 - 奇妙能力歌 {#陳粒---奇妙能力歌 type="song"}

### 陳粒 - 走马 {#陳粒---走马 type="song"}

### 陳粒 - 易燃易爆炸 {#陳粒---易燃易爆炸 type="song"}

### 陳粒 - 小半 {#陳粒---小半 type="song"}

### 陳粒 - 虚拟 {#陳粒---虚拟 type="song"}

## 王菲 [[王菲]{.smallcaps}]{.tag tag-name="王菲"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#王菲}

### FayeWongVEVO - 王菲 Faye Wong -《笑忘書 (國)》(Official Music Video) \[HD\] {#fayewongvevo---王菲-faye-wong--笑忘書-國official-music-video-hd type="song"}

### 王菲 - 红豆 {#王菲---红豆 type="song"}

### FayeWongVEVO - 王菲 Faye Wong -《百年孤寂》(Official Music Video) {#fayewongvevo---王菲-faye-wong--百年孤寂official-music-video type="song"}

### 王菲 - 分裂 {#王菲---分裂 type="song"}

### 王菲 - 背影 {#王菲---背影 type="song"}

### 王菲 - 可爱眼睛 {#王菲---可爱眼睛 type="song"}

### 王菲 - 浮躁 {#王菲---浮躁 type="song"}

### 王菲 - 又见炊烟 {#王菲---又见炊烟 type="song"}

### 王菲 - 如风 {#王菲---如风 type="song"}

### 王菲 - 但愿人长久 {#王菲---但愿人长久 type="song"}

### 王菲 - 约定 {#王菲---约定 type="song"}

### 王菲 - 暧昧 {#王菲---暧昧 type="song"}

### 王菲 - 如愿 [[grand]{.smallcaps}]{.tag tag-name="grand"} {#王菲---如愿 type="song"}

## 任素汐 [[任素汐]{.smallcaps}]{.tag tag-name="任素汐"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[folk]{.smallcaps}]{.tag tag-name="folk"} [[sad]{.smallcaps}]{.tag tag-name="sad"} {#任素汐}

### 任素汐 and 张弛 - 大儿歌（电视剧《故乡，别来无恙》挥别曲） {#任素汐-and-张弛---大儿歌电视剧故乡别来无恙挥别曲 type="song"}

### 任素汐 - 北方 (電視劇《親愛的小孩》片尾曲) {#任素汐---北方-電視劇親愛的小孩片尾曲 type="song"}

### 任素汐 - 我要你 {#任素汐---我要你 type="song"}

### 任素汐 - 胡广生（《无名之辈》电影宣传推广曲） {#任素汐---胡广生无名之辈电影宣传推广曲 type="song" rate="5"}

### 任素汐 - 歲歲（電視劇《故鄉，別來無恙》重逢曲） {#任素汐---歲歲電視劇故鄉別來無恙重逢曲 type="song" rate="5"}

### 任素汐 - 王招君 {#任素汐---王招君 type="song" rate="5"}

## 李宗盛 - 山丘 {#李宗盛---山丘 type="song"}

## Coline Rio - La rivière {#coline-rio---la-rivière type="song"}

## Oh Wonder [[OhWonder]{.smallcaps}]{.tag tag-name="OhWonder"} [[en]{.smallcaps}]{.tag tag-name="en"} {#oh-wonder}

### Oh Wonder - The Rain {#oh-wonder---the-rain type="song"}

### Oh Wonder - Hallelujah {#oh-wonder---hallelujah type="song"}

### Oh Wonder - Midnight Moon {#oh-wonder---midnight-moon type="song"}

### Oh Wonder - I Wish I Never Met You {#oh-wonder---i-wish-i-never-met-you type="song"}

### Oh Wonder - Ultralife {#oh-wonder---ultralife type="song"}

### Kygo and Oh Wonder - How Would I Know {#kygo-and-oh-wonder---how-would-i-know type="song"}

### Oh Wonder - White Blood {#oh-wonder---white-blood type="song"}

### Oh Wonder - All We Do (Official Audio) [[en]{.smallcaps}]{.tag tag-name="en"} [[working]{.smallcaps}]{.tag tag-name="working"} [[sad]{.smallcaps}]{.tag tag-name="sad"} {#oh-wonder---all-we-do-official-audio type="song" rate="5"}

### Oh Wonder - Lose It {#oh-wonder---lose-it type="song"}

### Oh Wonder - Drive {#oh-wonder---drive type="song"}

### Oh Wonder - Technicolour Beat {#oh-wonder---technicolour-beat type="song"}

### Oh Wonder - Landslide {#oh-wonder---landslide type="song"}

## 邓丽君 [[邓丽君]{.smallcaps}]{.tag tag-name="邓丽君"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[hk]{.smallcaps}]{.tag tag-name="hk"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[emotion]{.smallcaps}]{.tag tag-name="emotion"} {#邓丽君}

### 邓丽君 - 天黑黑 {#邓丽君---天黑黑 type="song"}

### 邓丽君 - 恰似你的温柔 {#邓丽君---恰似你的温柔-1 type="song"}

### 邓丽君 - 独上西楼 {#邓丽君---独上西楼 type="song"}

### 邓丽君 - 几多愁 {#邓丽君---几多愁 type="song"}

### 邓丽君 - 路边的野花不要采 {#邓丽君---路边的野花不要采 type="song"}

### 邓丽君 - 我只在乎你 {#邓丽君---我只在乎你 type="song"}

### 邓丽君 - 在水一方 {#邓丽君---在水一方 type="song"}

### 邓丽君 - 又见炊烟 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[hk]{.smallcaps}]{.tag tag-name="hk"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#邓丽君---又见炊烟 type="song" rate="5"}

### 邓丽君 - 漫步人生路 [[cn]{.smallcaps}]{.tag tag-name="cn"} [[hk]{.smallcaps}]{.tag tag-name="hk"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#邓丽君---漫步人生路 type="song" rate="4"}

### 邓丽君 - 我只在乎你 {#邓丽君---我只在乎你-1 type="song"}

### 邓丽君 - 月亮代表我的心 {#邓丽君---月亮代表我的心 type="song"}

### 邓丽君 - 甜蜜蜜 {#邓丽君---甜蜜蜜 type="song"}

## 邓紫棋 [[邓紫棋]{.smallcaps}]{.tag tag-name="邓紫棋"} [[gem]{.smallcaps}]{.tag tag-name="gem"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#邓紫棋}

### G.E.M. 鄧紫棋 - 夜空中最亮的星 {#g.e.m.-鄧紫棋---夜空中最亮的星 type="song"}

### G.E.M. - 泡沫 {#g.e.m.---泡沫 type="song"}

### G.E.M. 鄧紫棋 - 來自天堂的魔鬼 {#g.e.m.-鄧紫棋---來自天堂的魔鬼 type="song"}

### G.E.M. - 喜歡你 {#g.e.m.---喜歡你 type="song"}

### G.E.M. 鄧紫棋 - 光年之外 (電影 《Passengers》 中文主題曲) {#g.e.m.-鄧紫棋---光年之外-電影-passengers-中文主題曲 type="song"}

## 薛之谦 [[薛之谦]{.smallcaps}]{.tag tag-name="薛之谦"} [[cn]{.smallcaps}]{.tag tag-name="cn"} [[pop]{.smallcaps}]{.tag tag-name="pop"} {#薛之谦}

### 薛之謙 - 摩天大樓 {#薛之謙---摩天大樓 type="song"}

### 薛之謙 - 火星人來過 {#薛之謙---火星人來過 type="song"}

### 薛之謙 and 劉惜君 - 聊表心意 {#薛之謙-and-劉惜君---聊表心意 type="song"}

### 薛之謙 - 一半 {#薛之謙---一半 type="song"}

### 薛之謙 - 方圓幾里 {#薛之謙---方圓幾里 type="song"}

### 薛之謙 - 情書 {#薛之謙---情書 type="song"}

### 薛之謙 - 怪咖 {#薛之謙---怪咖 type="song"}

### 薛之謙 - 動物世界 {#薛之謙---動物世界 type="song"}

### 薛之謙 - 那是你離開了北京的生活 {#薛之謙---那是你離開了北京的生活 type="song"}

### 薛之謙 - 陪你去流浪 {#薛之謙---陪你去流浪 type="song"}

### 薛之謙 - 意外 {#薛之謙---意外 type="song"}

### 薛之謙 - 我好像在哪見過你 {#薛之謙---我好像在哪見過你 type="song"}

### 薛之謙 - 曖昧 {#薛之謙---曖昧 type="song"}

### 薛之謙 - 像風一樣 {#薛之謙---像風一樣 type="song"}

### 薛之謙 - 你還要我怎樣 {#薛之謙---你還要我怎樣 type="song"}

### 薛之谦 - 醜八怪 {#薛之谦---醜八怪 type="song"}

### 薛之謙 - 認真的雪 {#薛之謙---認真的雪 type="song"}

### 薛之謙 - 剛剛好 {#薛之謙---剛剛好 type="song"}

### 薛之謙 - 紳士 {#薛之謙---紳士 type="song"}

### 薛之謙 - 其實 {#薛之謙---其實 type="song"}

### 薛之謙 - 天外來物 {#薛之謙---天外來物 type="song"}

### 薛之謙 - 演員 {#薛之謙---演員 type="song"}

## 周杰伦 [[周杰伦]{.smallcaps}]{.tag tag-name="周杰伦"} [[pop]{.smallcaps}]{.tag tag-name="pop"} [[cn]{.smallcaps}]{.tag tag-name="cn"} {#周杰伦}

### 周杰倫 - 七里香 {#周杰倫---七里香 type="song"}

### 周杰倫 - 牛仔很忙 {#周杰倫---牛仔很忙 type="song"}

### 周杰倫 - 愛在西元前 {#周杰倫---愛在西元前 type="song"}

### 周杰倫 - 一路向北 {#周杰倫---一路向北 type="song"}

### 周杰倫 - 還在流浪 {#周杰倫---還在流浪 type="song"}

### 周杰倫 - 說了再見 {#周杰倫---說了再見 type="song"}

### 周杰倫 - 開不了口 {#周杰倫---開不了口 type="song"}

### 周杰倫 - 半島鐵盒 {#周杰倫---半島鐵盒 type="song"}

### 周杰倫 - 我不配 {#周杰倫---我不配 type="song"}

### 周杰倫 - 蒲公英的約定 {#周杰倫---蒲公英的約定 type="song"}

### 周杰倫 - 青花瓷 {#周杰倫---青花瓷 type="song"}

### 周杰倫 - 說好的幸福呢 {#周杰倫---說好的幸福呢 type="song"}

### 周杰倫 - 稻香 {#周杰倫---稻香 type="song"}

### 周杰倫 - 龍捲風 {#周杰倫---龍捲風 type="song"}

### 周杰倫 - 七里香 {#周杰倫---七里香-1 type="song"}

### 周杰倫 - 告白氣球 {#周杰倫---告白氣球 type="song"}

### 周杰倫 - 夜曲 {#周杰倫---夜曲 type="song"}

### 周杰倫 - 晴天 {#周杰倫---晴天 type="song"}

## rachel au piano - JUSTE UNE JUPE {#rachel-au-piano---juste-une-jupe type="song"}
